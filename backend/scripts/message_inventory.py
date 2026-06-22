#!/usr/bin/env python3
"""Per-tenant message inventory for edge devices.

For each device it shows which message types (InfluxDB measurements) it reported,
when it was last alive (last uplink, from the 'system' connectivity monitor), and
when it last sent real sensor data (vgreens_leaftom / vgreens_tomato / etc.).

This makes the heartbeat-vs-real-data distinction explicit:
  - "last alive"      = last time the device transmitted anything (keep-alive included)
  - "last real data"  = last actual sensor payload

Output (to --out-dir):
  - message_inventory.csv
  - message_inventory.png   (rendered table)

Usage:
  python message_inventory.py --bucket <bucket> --device-prefix vgreens- --days 7
"""

import argparse
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from influxdb_client import InfluxDBClient
from device_delivery_report import (
    load_config, escape_flux_string, with_retries, list_devices, friendly_label,
)

MONITOR_MEASUREMENTS = {"system"}  # connectivity monitor, not device sensor data


def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--bucket", help="Bucket (default INFLUXDB_BUCKET)")
    p.add_argument("--days", type=int, default=7)
    p.add_argument("--device", action="append", default=[])
    p.add_argument("--device-prefix")
    p.add_argument("--timezone", default="Europe/Berlin")
    p.add_argument("--out-dir", default="output/inventory")
    p.add_argument("--label")
    p.add_argument("--stale-after-hours", type=float, default=24.0,
                   help="Real data older than this marks a device 'stale' (default 24h)")
    return p.parse_args()


# Device states, worst-first (used for sorting + coloring).
STATE_ORDER = ["never-seen", "heartbeat-only", "stale", "working"]
STATE_COLORS = {
    "never-seen": "#f5b7b1",     # red
    "heartbeat-only": "#f8c471",  # orange
    "stale": "#f9e79f",          # yellow
    "working": "#abebc6",        # green
}


def classify_state(messages, real_points, last_real_age_h, stale_after_h):
    if messages == "—":
        return "never-seen"
    if real_points == 0:
        return "heartbeat-only"
    if last_real_age_h is None or last_real_age_h > stale_after_h:
        return "stale"
    return "working"


def qdf(query_api, org, flux):
    df = with_retries(lambda: query_api.query_data_frame(org=org, query=flux))
    if isinstance(df, list):
        df = pd.concat([x for x in df if len(x)], ignore_index=True) if df else pd.DataFrame()
    return df


def device_filter(devices):
    if not devices:
        return ""
    ors = " or ".join(f'r["device"] == "{escape_flux_string(d)}"' for d in devices)
    return f"  |> filter(fn: (r) => {ors})\n"


def short_meas(m):
    return m.replace("vgreens_", "")


def fmt_time(ts, tz):
    if ts is None or pd.isna(ts):
        return "—"
    t = pd.Timestamp(ts).tz_convert(tz)
    age_days = (datetime.now(tz) - t.to_pydatetime()).total_seconds() / 86400
    return f"{t.strftime('%Y-%m-%d %H:%M')} ({age_days:.1f}d ago)"


def main():
    args = parse_args()
    url, token, org, env_bucket = load_config()
    bucket = args.bucket or env_bucket
    tz = ZoneInfo(args.timezone)
    label = args.label or friendly_label(bucket)

    with InfluxDBClient(url=url, token=token, org=org) as client:
        query_api = client.query_api()
        if args.device:
            devices = args.device
        else:
            devices = list_devices(query_api, org, bucket)
            if args.device_prefix:
                devices = [d for d in devices if d.startswith(args.device_prefix)]
        if not devices:
            raise SystemExit(f"No devices found in bucket '{bucket}'.")

        start = f"-{args.days}d"
        dfilt = device_filter(devices)
        esc = escape_flux_string(bucket)

        # Q1: last timestamp per (device, measurement) — gives message types + last-seen.
        q1 = (f'from(bucket: "{esc}")\n  |> range(start: {start})\n{dfilt}'
              '  |> group(columns: ["device", "_measurement"])\n'
              '  |> last()\n'
              '  |> keep(columns: ["device", "_measurement", "_time"])\n')
        per_meas = qdf(query_api, org, q1)

        # Q2: latest connectivity state per device (heartbeat age + online flag).
        q2 = (f'from(bucket: "{esc}")\n  |> range(start: {start})\n{dfilt}'
              '  |> filter(fn: (r) => r["_measurement"] == "system" and '
              '(r["_field"] == "last_uplink_age_min" or r["_field"] == "online"))\n'
              '  |> group(columns: ["device", "_field"])\n'
              '  |> last()\n'
              '  |> keep(columns: ["device", "_field", "_time", "_value"])\n')
        sysdf = qdf(query_api, org, q2)

        # Q3: raw non-monitor points (sparse) -> real-data counts.
        q3 = (f'from(bucket: "{esc}")\n  |> range(start: {start})\n{dfilt}'
              '  |> filter(fn: (r) => r["_measurement"] != "system")\n'
              '  |> keep(columns: ["_time", "device", "_measurement"])\n')
        realdf = qdf(query_api, org, q3)

        # Q4: count of 'system' (connectivity-monitor) points per device. NOTE: these
        # are written ~every 10 min server-side, so this reflects monitoring activity,
        # not literal device keep-alive uplinks.
        q4 = (f'from(bucket: "{esc}")\n  |> range(start: {start})\n{dfilt}'
              '  |> filter(fn: (r) => r["_measurement"] == "system")\n'
              '  |> group(columns: ["device"])\n'
              '  |> count()\n'
              '  |> keep(columns: ["device", "_value"])\n')
        hbdf = qdf(query_api, org, q4)
    hb_counts = (
        hbdf.groupby("device")["_value"].sum().astype(int).to_dict()
        if len(hbdf) else {}
    )

    if len(per_meas):
        per_meas["_time"] = pd.to_datetime(per_meas["_time"], utc=True)
    if len(realdf):
        realdf["_time"] = pd.to_datetime(realdf["_time"], utc=True)

    rows = []
    for dev in devices:
        dm = per_meas[per_meas["device"] == dev] if len(per_meas) else pd.DataFrame()
        meas_set = sorted(dm["_measurement"].unique()) if len(dm) else []
        real_meas = [m for m in meas_set if m not in MONITOR_MEASUREMENTS]

        # Last alive = latest system-monitor reading minus the age-since-last-uplink.
        last_alive = None
        online = None
        if len(sysdf):
            sd = sysdf[sysdf["device"] == dev]
            age = sd.loc[sd["_field"] == "last_uplink_age_min", "_value"]
            onl = sd.loc[sd["_field"] == "online", "_value"]
            stime = sd["_time"].max() if len(sd) else None
            if len(age) and stime is not None:
                last_alive = pd.Timestamp(stime) - pd.Timedelta(minutes=float(age.iloc[0]))
            if len(onl):
                online = int(onl.iloc[0])

        # Last real data + count.
        rd = realdf[realdf["device"] == dev] if len(realdf) else pd.DataFrame()
        last_real = rd["_time"].max() if len(rd) else None
        real_pts = int(len(rd))

        messages = ", ".join(short_meas(m) for m in meas_set) or "—"
        last_real_age_h = (
            (datetime.now(tz) - pd.Timestamp(last_real).tz_convert(tz).to_pydatetime())
            .total_seconds() / 3600
            if last_real is not None and not pd.isna(last_real) else None
        )
        state = classify_state(messages, real_pts, last_real_age_h, args.stale_after_hours)

        rows.append({
            "device": dev,
            "state": state,
            "messages": messages,
            "real_msg_types": ", ".join(short_meas(m) for m in real_meas) or "—",
            "online": ("yes" if online == 1 else "no" if online == 0 else "?"),
            "last_alive": fmt_time(last_alive, tz),
            "last_real_data": fmt_time(last_real, tz),
            "real_data_points": real_pts,
            "heartbeat_data_points": int(hb_counts.get(dev, 0)),
        })

    table = pd.DataFrame(rows)
    # Sort worst-first by state, then device.
    table["_state_rank"] = table["state"].map({s: i for i, s in enumerate(STATE_ORDER)})
    table = table.sort_values(["_state_rank", "device"]).drop(columns="_state_rank").reset_index(drop=True)
    rows = table.to_dict("records")
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    table.to_csv(out_dir / "message_inventory.csv", index=False)

    # Rendered table image. (Online flag is kept in the CSV but omitted here: it is a
    # strict real-time flag that reads "no" for sporadic senders, which misleads.)
    show_cols = ["device", "state", "messages", "last_alive", "last_real_data",
                 "real_data_points", "heartbeat_data_points"]
    headers = ["Device", "State", "Message types reported", "Last alive (uplink)",
               "Last real data", "Real data points", "Heartbeat data points"]
    fig_h = max(2.8, 0.32 * len(table) + 2.0)  # extra room for the legend caption
    fig, ax = plt.subplots(figsize=(15, fig_h))
    ax.axis("off")
    ax.set_title(f"Message inventory — {label}  (last {args.days}d, {args.timezone})",
                 fontsize=13, fontweight="bold", pad=12)
    cells = table[show_cols].values.tolist()
    tbl = ax.table(cellText=cells, colLabels=headers, loc="center", cellLoc="left")
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(8)
    tbl.scale(1, 1.35)
    for j in range(len(headers)):
        tbl[0, j].set_facecolor("#34495e")
        tbl[0, j].set_text_props(color="white", fontweight="bold")
    for i, r in enumerate(rows, start=1):
        # tint the "last real data" cell: green if data exists, red if none
        col = show_cols.index("last_real_data")
        tbl[i, col].set_facecolor("#e7f4e9" if r["real_data_points"] > 0 else "#fdecea")
        sc = show_cols.index("state")
        tbl[i, sc].set_facecolor(STATE_COLORS.get(r["state"], "#ffffff"))

    # State legend / explanation below the table.
    stale_h = args.stale_after_hours
    stale_txt = f"{stale_h / 24:.0f}d" if stale_h >= 24 else f"{stale_h:.0f}h"
    legend = [
        ("working", f"sent real sensor data within the last {stale_txt}"),
        ("stale", f"sent real data before, but nothing in the last {stale_txt}"),
        ("heartbeat-only", "device transmits (system/connectivity) but has sent NO real sensor data"),
        ("never-seen", "no messages of any kind in the window — never reported"),
    ]
    y = -0.02
    ax.text(0.0, y, "State key:", transform=ax.transAxes, fontsize=9,
            fontweight="bold", va="top")
    for k, desc in legend:
        y -= 0.055
        ax.text(0.0, y, "  ", transform=ax.transAxes, fontsize=9, va="top",
                bbox=dict(boxstyle="square,pad=0.3", facecolor=STATE_COLORS[k], edgecolor="none"))
        ax.text(0.045, y, f"{k} — {desc}", transform=ax.transAxes, fontsize=8.5, va="top")
    y -= 0.06
    ax.text(0.0, y, "Note: 'Heartbeat data points' counts the server-side 'system' monitor "
            "(~every 10 min), not literal device keep-alives — it stays high even when a "
            "device is offline. Use 'Last alive' for liveness.",
            transform=ax.transAxes, fontsize=7.5, va="top", color="#555", style="italic")

    fig.savefig(out_dir / "message_inventory.png", dpi=130, bbox_inches="tight")
    plt.close(fig)

    counts = {s: int((table["state"] == s).sum()) for s in STATE_ORDER}
    print(f"{label}: {len(table)} devices  |  "
          + "  ".join(f"{s}={counts[s]}" for s in STATE_ORDER))
    print(table[show_cols].to_string(index=False))
    print(f"\nWrote message_inventory.csv + .png to {out_dir}")


if __name__ == "__main__":
    main()
