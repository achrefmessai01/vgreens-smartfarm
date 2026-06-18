#!/usr/bin/env python3
"""Edge-device data-delivery report.

Edge devices (``vgreens-XX-XX``) are expected to push sensor data to InfluxDB
three times a day (default 10:00 / 14:00 / 18:00 Europe/Berlin). This script
queries InfluxDB, classifies each send into the nearest expected slot, and
writes a tabular CSV view plus PNG diagrams so missed/late sends are easy to spot.

Credentials are read from ``backend/.env`` (never hardcoded). Run with --help for
all options. Typical usage:

    python device_delivery_report.py --days 7
    python device_delivery_report.py --list-devices
    python device_delivery_report.py --bucket knaup_<uuid> --device vgreens-01-02
"""

import argparse
import os
import sys
import time
import warnings
from datetime import datetime, timedelta, time as dtime
from pathlib import Path

# Silence the urllib3/LibreSSL notice on macOS system Python (must precede the
# influxdb_client import, which pulls in urllib3).
warnings.filterwarnings("ignore", message=r"urllib3 v2 only supports OpenSSL.*")
from zoneinfo import ZoneInfo

import pandas as pd
import matplotlib

matplotlib.use("Agg")  # headless: write PNGs without a display
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap, BoundaryNorm

from dotenv import load_dotenv
from influxdb_client import InfluxDBClient
from influxdb_client.client.warnings import MissingPivotFunction

# We only keep _time/device (no fields to pivot), so this warning is noise.
warnings.simplefilter("ignore", MissingPivotFunction)


# --------------------------------------------------------------------------- #
# Setup / config
# --------------------------------------------------------------------------- #

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_ENV = SCRIPT_DIR.parent / ".env"  # backend/.env


def load_config():
    """Load InfluxDB connection settings from backend/.env (or the environment)."""
    if BACKEND_ENV.exists():
        load_dotenv(BACKEND_ENV)
    url = os.getenv("INFLUXDB_URL")
    token = os.getenv("INFLUXDB_TOKEN")
    org = os.getenv("INFLUXDB_ORG")
    bucket = os.getenv("INFLUXDB_BUCKET")
    missing = [
        name
        for name, val in [
            ("INFLUXDB_URL", url),
            ("INFLUXDB_TOKEN", token),
            ("INFLUXDB_ORG", org),
        ]
        if not val
    ]
    if missing:
        sys.exit(
            f"Missing required env var(s): {', '.join(missing)}.\n"
            f"Expected them in {BACKEND_ENV} or the environment."
        )
    return url, token, org, bucket


def escape_flux_string(v: str) -> str:
    """Mirror backend escapeFluxString (influxdb.service.ts)."""
    return v.replace("\\", "\\\\").replace('"', '\\"')


def with_retries(fn, *, attempts=6, base_delay=1.5):
    """Run fn(), retrying on any exception with exponential backoff.

    InfluxDB Cloud occasionally drops a query with a transient network/5xx error;
    a couple of retries makes unattended runs reliable.
    """
    last = None
    for i in range(attempts):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001 - transient InfluxDB/network errors
            last = e
            if i < attempts - 1:
                delay = base_delay * (2 ** i)
                print(
                    f"  query failed ({type(e).__name__}: {str(e)[:120]}); "
                    f"retry {i + 1}/{attempts - 1} in {delay:.0f}s",
                    file=sys.stderr,
                )
                time.sleep(delay)
    raise last


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #

def parse_args():
    p = argparse.ArgumentParser(
        description="Report how reliably edge devices send data (3x/day) to InfluxDB.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument("--bucket", help="Bucket to query (default: INFLUXDB_BUCKET from .env)")
    p.add_argument("--days", type=int, default=14, help="Look back this many days")
    p.add_argument("--start", help="Start date YYYY-MM-DD (local tz); overrides --days")
    p.add_argument("--end", help="End date YYYY-MM-DD (local tz, inclusive); with --start")
    p.add_argument(
        "--device",
        action="append",
        default=[],
        help="Filter to a device (repeatable). Default: all devices in the bucket.",
    )
    p.add_argument(
        "--measurement",
        help="Filter to a _measurement (e.g. vgreens_leaftom). "
        "Recommended for per-tenant buckets that split data by measurement.",
    )
    p.add_argument(
        "--exclude-measurement",
        action="append",
        default=[],
        help="Exclude a _measurement (repeatable). The 'system' measurement is a "
        "server-side connectivity monitor (writes every ~10 min regardless of device "
        "sends), so it is excluded automatically unless you target it explicitly. "
        "Pass --include-system to keep it.",
    )
    p.add_argument(
        "--include-system",
        action="store_true",
        help="Do not auto-exclude the 'system' monitor measurement",
    )
    p.add_argument(
        "--device-prefix",
        help="Only include devices whose name starts with this prefix "
        "(e.g. 'vgreens-' to grab all edge devices and skip Air_/Soil_ sensors). "
        "Applied to auto-discovered devices; ignored when --device is given.",
    )
    p.add_argument("--field", help="Optional _field filter to reduce volume")
    p.add_argument("--timezone", default="Europe/Berlin", help="Timezone for slot logic")
    p.add_argument(
        "--slots",
        default="10:00,14:00,18:00",
        help="Comma-separated expected send times (HH:MM)",
    )
    p.add_argument(
        "--tolerance-min",
        type=int,
        default=90,
        help="A send within +/- this many minutes of a slot counts as on-time",
    )
    p.add_argument("--out-dir", default=str(SCRIPT_DIR / "output"), help="Output directory")
    p.add_argument(
        "--label",
        help="Human-friendly name shown in chart titles (default: derived from bucket)",
    )
    p.add_argument("--list-buckets", action="store_true", help="List buckets and exit")
    p.add_argument(
        "--list-measurements",
        action="store_true",
        help="List measurements in the bucket and exit",
    )
    p.add_argument(
        "--list-devices",
        action="store_true",
        help="List devices (honors --measurement) and exit",
    )
    return p.parse_args()


def parse_slots(raw: str):
    slots = []
    for part in raw.split(","):
        part = part.strip()
        if not part:
            continue
        hh, mm = part.split(":")
        slots.append(dtime(int(hh), int(mm)))
    if not slots:
        sys.exit("No valid slots parsed from --slots")
    return slots


def resolve_range(args, tz):
    """Return (start_local, end_local) as tz-aware datetimes, floored to day boundaries."""
    if args.start:
        start_d = datetime.strptime(args.start, "%Y-%m-%d").date()
        end_d = (
            datetime.strptime(args.end, "%Y-%m-%d").date()
            if args.end
            else datetime.now(tz).date()
        )
        start_local = datetime.combine(start_d, dtime(0, 0), tzinfo=tz)
        # inclusive end -> midnight of the day after end_d
        end_local = datetime.combine(end_d, dtime(0, 0), tzinfo=tz) + timedelta(days=1)
    else:
        now = datetime.now(tz)
        end_local = datetime.combine(now.date(), dtime(0, 0), tzinfo=tz) + timedelta(days=1)
        start_local = end_local - timedelta(days=args.days)
    return start_local, end_local


# --------------------------------------------------------------------------- #
# InfluxDB queries
# --------------------------------------------------------------------------- #

def list_buckets(client):
    result = with_retries(lambda: client.buckets_api().find_buckets())
    return [b.name for b in (result.buckets or [])]


def _collect_values(query_api, org, flux):
    tables = with_retries(lambda: query_api.query(org=org, query=flux))
    out = []
    for table in tables:
        for rec in table.records:
            out.append(rec.get_value())
    return out


def list_measurements(query_api, org, bucket):
    escaped = escape_flux_string(bucket)
    flux = (
        'import "influxdata/influxdb/schema"\n'
        f'schema.measurements(bucket: "{escaped}")'
    )
    return sorted(_collect_values(query_api, org, flux))


def list_devices(query_api, org, bucket, measurement=None):
    escaped = escape_flux_string(bucket)
    if measurement:
        flux = (
            'import "influxdata/influxdb/schema"\n'
            f'schema.measurementTagValues(bucket: "{escaped}", '
            f'measurement: "{escape_flux_string(measurement)}", tag: "device")'
        )
    else:
        flux = (
            'import "influxdata/influxdb/schema"\n'
            f'schema.tagValues(bucket: "{escaped}", tag: "device")'
        )
    return sorted(_collect_values(query_api, org, flux))


def fetch_sends(query_api, org, bucket, start_utc, stop_utc, devices, field, measurement,
                exclude_measurements=None):
    """Return a DataFrame with columns [device, time] (one row per raw record)."""
    parts = [
        f'from(bucket: "{escape_flux_string(bucket)}")',
        f"  |> range(start: {start_utc}, stop: {stop_utc})",
    ]
    if measurement:
        parts.append(
            f'  |> filter(fn: (r) => r["_measurement"] == "{escape_flux_string(measurement)}")'
        )
    elif exclude_measurements:
        nots = " and ".join(
            f'r["_measurement"] != "{escape_flux_string(m)}"' for m in exclude_measurements
        )
        parts.append(f"  |> filter(fn: (r) => {nots})")
    if devices:
        ors = " or ".join(f'r["device"] == "{escape_flux_string(d)}"' for d in devices)
        parts.append(f"  |> filter(fn: (r) => {ors})")
    if field:
        parts.append(f'  |> filter(fn: (r) => r["_field"] == "{escape_flux_string(field)}")')
    parts.append('  |> keep(columns: ["_time", "device"])')
    flux = "\n".join(parts)

    df = with_retries(lambda: query_api.query_data_frame(org=org, query=flux))
    if isinstance(df, list):
        df = pd.concat(df, ignore_index=True) if df else pd.DataFrame()
    if df.empty or "_time" not in df.columns:
        return pd.DataFrame(columns=["device", "time"])
    df = df[["device", "_time"]].rename(columns={"_time": "time"})
    df["time"] = pd.to_datetime(df["time"], utc=True)
    return df


# --------------------------------------------------------------------------- #
# Classification
# --------------------------------------------------------------------------- #

def classify(df_sends, devices, days, slots, tz, tolerance_min):
    """Return (detail_df, summary_df, sends_df).

    detail_df: one row per (device, day, slot) with status hit/missed + delay.
    summary_df: one row per device with aggregate metrics.
    sends_df: deduped sends with local time + assigned slot (for the scatter plot).
    """
    tol = timedelta(minutes=tolerance_min)
    slot_labels = [s.strftime("%H:%M") for s in slots]

    # Dedupe: one physical send writes several fields at the same _time.
    sends = df_sends.copy()
    if not sends.empty:
        sends["local"] = sends["time"].dt.tz_convert(tz)
        sends["minute"] = sends["local"].dt.floor("min")
        sends = sends.drop_duplicates(subset=["device", "minute"]).copy()
        sends["day"] = sends["local"].dt.date
    else:
        sends = pd.DataFrame(columns=["device", "time", "local", "minute", "day"])

    # Assign each send to its nearest slot (within tolerance).
    def nearest_slot(local_ts):
        best_label, best_delta = None, None
        for s, label in zip(slots, slot_labels):
            slot_dt = datetime.combine(local_ts.date(), s, tzinfo=tz)
            delta = local_ts.to_pydatetime() - slot_dt  # signed
            if abs(delta) <= tol and (best_delta is None or abs(delta) < abs(best_delta)):
                best_label, best_delta = label, delta
        if best_label is None:
            return pd.Series([None, None])
        return pd.Series([best_label, best_delta.total_seconds() / 60.0])

    if not sends.empty:
        sends[["slot", "delay_min"]] = sends["local"].apply(nearest_slot)
    else:
        sends["slot"] = pd.Series(dtype=object)
        sends["delay_min"] = pd.Series(dtype=float)

    # Build the expected (device x day x slot) grid. Skip slots whose scheduled
    # time hasn't happened yet (e.g. today's 18:00 at noon) so the current day
    # isn't unfairly counted as "missed".
    now = datetime.now(tz)
    rows = []
    for dev in devices:
        dev_sends = sends[sends["device"] == dev]
        for day in days:
            day_sends = dev_sends[dev_sends["day"] == day]
            for s, label in zip(slots, slot_labels):
                if datetime.combine(day, s, tzinfo=tz) > now:
                    continue  # future slot — not yet expected
                hit = day_sends[day_sends["slot"] == label]
                if not hit.empty:
                    # closest matched send for this slot
                    best = hit.iloc[hit["delay_min"].abs().argmin()]
                    rows.append(
                        {
                            "device": dev,
                            "day": day,
                            "slot": label,
                            "status": "hit",
                            "actual_time": best["local"].isoformat(),
                            "delay_min": round(best["delay_min"], 1),
                        }
                    )
                else:
                    rows.append(
                        {
                            "device": dev,
                            "day": day,
                            "slot": label,
                            "status": "missed",
                            "actual_time": "",
                            "delay_min": "",
                        }
                    )
    detail = pd.DataFrame(rows)

    # Per-device summary.
    summ_rows = []
    for dev in devices:
        dev_detail = detail[detail["device"] == dev]
        n_expected_per_dev = int(len(dev_detail))  # excludes future slots
        hits = int((dev_detail["status"] == "hit").sum())
        dev_sends = sends[sends["device"] == dev]
        total_sends = int(len(dev_sends))
        off_schedule = int(dev_sends["slot"].isna().sum())
        delays = dev_detail.loc[dev_detail["status"] == "hit", "delay_min"]
        delays = pd.to_numeric(delays, errors="coerce").dropna()
        last_seen = dev_sends["local"].max() if not dev_sends.empty else None
        summ_rows.append(
            {
                "device": dev,
                "expected": n_expected_per_dev,
                "received": hits,
                "missed": n_expected_per_dev - hits,
                "compliance_pct": round(100 * hits / n_expected_per_dev, 1)
                if n_expected_per_dev
                else 0.0,
                "total_sends": total_sends,
                "off_schedule_sends": off_schedule,
                "avg_delay_min": round(float(delays.mean()), 1) if not delays.empty else "",
                "last_seen": last_seen.isoformat() if last_seen is not None else "",
            }
        )
    summary = pd.DataFrame(summ_rows).sort_values("compliance_pct").reset_index(drop=True)
    return detail, summary, sends


# --------------------------------------------------------------------------- #
# Plotting
# --------------------------------------------------------------------------- #

def plot_heatmap(detail, devices, days, n_slots, out_path):
    """Device x day grid, colored by number of slots hit (0..n_slots)."""
    if not devices or not days:
        return
    grid = (
        detail[detail["status"] == "hit"]
        .groupby(["device", "day"])
        .size()
        .unstack(fill_value=0)
        .reindex(index=devices, columns=days, fill_value=0)
    )
    data = grid.values
    cmap = ListedColormap(["#d73027", "#fdae61", "#fee08b", "#1a9850"][: n_slots + 1])
    norm = BoundaryNorm(range(n_slots + 2), cmap.N)

    fig_h = max(3, 0.35 * len(devices) + 1.5)
    fig_w = max(6, 0.5 * len(days) + 3)
    fig, ax = plt.subplots(figsize=(fig_w, fig_h))
    im = ax.imshow(data, aspect="auto", cmap=cmap, norm=norm)
    ax.set_xticks(range(len(days)))
    ax.set_xticklabels([d.strftime("%m-%d") for d in days], rotation=90, fontsize=7)
    ax.set_yticks(range(len(devices)))
    ax.set_yticklabels(devices, fontsize=7)
    ax.set_title(f"Slots hit per day (0-{n_slots})")
    for i in range(len(devices)):
        for j in range(len(days)):
            ax.text(j, i, int(data[i, j]), ha="center", va="center", fontsize=6)
    cbar = fig.colorbar(im, ax=ax, ticks=range(n_slots + 1))
    cbar.set_label("slots hit")
    fig.tight_layout()
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def plot_compliance_bar(summary, out_path):
    if summary.empty:
        return
    fig_h = max(3, 0.3 * len(summary) + 1.5)
    fig, ax = plt.subplots(figsize=(8, fig_h))
    colors = [
        "#1a9850" if v >= 90 else "#fdae61" if v >= 60 else "#d73027"
        for v in summary["compliance_pct"]
    ]
    ax.barh(summary["device"], summary["compliance_pct"], color=colors)
    ax.set_xlabel("Compliance % (slots received / expected)")
    ax.set_xlim(0, 100)
    ax.set_title("Per-device compliance (worst first)")
    ax.invert_yaxis()
    for i, v in enumerate(summary["compliance_pct"]):
        ax.text(min(v + 1, 98), i, f"{v:.0f}%", va="center", fontsize=7)
    fig.tight_layout()
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def plot_timing_scatter(sends, devices, slots, tolerance_min, out_path):
    if sends.empty or not devices:
        return
    dev_idx = {d: i for i, d in enumerate(devices)}
    hours = sends["local"].dt.hour + sends["local"].dt.minute / 60.0
    ys = sends["device"].map(dev_idx)
    on_time = sends["slot"].notna()

    fig_h = max(3, 0.3 * len(devices) + 1.5)
    fig, ax = plt.subplots(figsize=(9, fig_h))
    ax.scatter(hours[on_time], ys[on_time], s=14, color="#1a9850", label="on-time")
    ax.scatter(
        hours[~on_time], ys[~on_time], s=14, color="#d73027", marker="x", label="off-schedule"
    )
    tol_h = tolerance_min / 60.0
    for s in slots:
        sh = s.hour + s.minute / 60.0
        ax.axvline(sh, color="#888", linestyle="--", linewidth=0.8)
        ax.axvspan(sh - tol_h, sh + tol_h, color="#1a9850", alpha=0.06)
    ax.set_xlim(0, 24)
    ax.set_xticks(range(0, 25, 2))
    ax.set_xlabel("Time of day (local)")
    ax.set_yticks(range(len(devices)))
    ax.set_yticklabels(devices, fontsize=7)
    ax.set_title("Send timing vs expected slots")
    ax.legend(loc="upper right", fontsize=7)
    fig.tight_layout()
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def plot_daily_stacked(detail, days, n_slots, out_path):
    if detail.empty or not days:
        return
    # per (device, day) count of slots hit, then per day count devices at each level
    per_dev_day = (
        detail[detail["status"] == "hit"].groupby(["device", "day"]).size()
    )
    counts = {lvl: [] for lvl in range(n_slots + 1)}
    devices = detail["device"].unique()
    for day in days:
        levels = [int(per_dev_day.get((dev, day), 0)) for dev in devices]
        for lvl in range(n_slots + 1):
            counts[lvl].append(levels.count(lvl))

    colors = ["#d73027", "#fdae61", "#fee08b", "#1a9850"][: n_slots + 1]
    fig, ax = plt.subplots(figsize=(max(6, 0.5 * len(days) + 2), 4))
    bottom = [0] * len(days)
    x = range(len(days))
    for lvl in range(n_slots + 1):
        ax.bar(x, counts[lvl], bottom=bottom, color=colors[lvl], label=f"{lvl} slots")
        bottom = [b + c for b, c in zip(bottom, counts[lvl])]
    ax.set_xticks(list(x))
    ax.set_xticklabels([d.strftime("%m-%d") for d in days], rotation=90, fontsize=7)
    ax.set_ylabel("# devices")
    ax.set_title("Devices per slots-hit level, by day")
    ax.legend(fontsize=7)
    fig.tight_layout()
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def _health_category(row):
    if row["total_sends"] == 0:
        return "Silent (no data)"
    if row["compliance_pct"] >= 90:
        return "Healthy (>=90%)"
    if row["compliance_pct"] >= 50:
        return "Partial (50-89%)"
    return "Poor (<50%)"


HEALTH_ORDER = ["Healthy (>=90%)", "Partial (50-89%)", "Poor (<50%)", "Silent (no data)"]
HEALTH_COLORS = {
    "Healthy (>=90%)": "#1a9850",
    "Partial (50-89%)": "#fee08b",
    "Poor (<50%)": "#fdae61",
    "Silent (no data)": "#d73027",
}


def plot_summary_panel(summary, label, measurement, date_from, date_to, slots_str, out_path):
    """Executive one-pager: headline numbers + a device-health donut."""
    if summary.empty:
        return
    cats = summary.apply(_health_category, axis=1)
    counts = cats.value_counts()
    n_dev = len(summary)
    overall = round(summary["received"].sum() / max(1, summary["expected"].sum()) * 100, 1)
    n_healthy = int((cats == "Healthy (>=90%)").sum())
    n_silent = int((cats == "Silent (no data)").sum())
    n_attention = n_dev - n_healthy - n_silent

    fig, (axL, axR) = plt.subplots(1, 2, figsize=(11, 5), gridspec_kw={"width_ratios": [1.1, 1]})
    fig.suptitle(
        f"Edge-device data delivery — {label}", fontsize=15, fontweight="bold", y=0.98
    )

    # Left: KPI text block
    axL.axis("off")
    subtitle = (
        f"Measurement: {measurement or 'all'}   |   "
        f"{date_from} → {date_to}   |   slots {slots_str}"
    )
    axL.text(0, 1.02, subtitle, fontsize=9, color="#555", va="top")
    overall_color = "#1a9850" if overall >= 90 else "#fdae61" if overall >= 50 else "#d73027"
    axL.text(0, 0.80, f"{overall:.0f}%", fontsize=54, fontweight="bold", color=overall_color)
    axL.text(0, 0.62, "overall delivery compliance", fontsize=11, color="#333")
    kpis = [
        (f"{n_dev}", "edge devices", "#333"),
        (f"{n_healthy}", "healthy (≥90%)", "#1a9850"),
        (f"{n_attention}", "need attention", "#e08214"),
        (f"{n_silent}", "silent (no data)", "#d73027"),
    ]
    for i, (val, lbl, col) in enumerate(kpis):
        y = 0.40 - i * 0.11
        axL.text(0.02, y, val, fontsize=20, fontweight="bold", color=col)
        axL.text(0.16, y + 0.01, lbl, fontsize=12, color="#333", va="center")
    axL.set_xlim(0, 1)
    axL.set_ylim(0, 1)

    # Right: health donut
    ordered = [c for c in HEALTH_ORDER if c in counts.index]
    sizes = [counts[c] for c in ordered]
    colors = [HEALTH_COLORS[c] for c in ordered]
    wedges, _ = axR.pie(sizes, colors=colors, startangle=90, counterclock=False,
                        wedgeprops=dict(width=0.42, edgecolor="white"))
    axR.set_title("Device health breakdown", fontsize=12)
    axR.legend(
        wedges,
        [f"{c}  —  {n}" for c, n in zip(ordered, sizes)],
        loc="center", bbox_to_anchor=(0.5, -0.08), fontsize=9, frameon=False,
    )
    axR.text(0, 0, f"{n_dev}\ndevices", ha="center", va="center", fontsize=13, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, 0.95])
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def plot_daily_trend(detail, days, out_path):
    """Fleet-wide compliance % per day — the simple 'are we trending up?' line."""
    if detail.empty or not days:
        return
    xs, ys = [], []
    for day in days:
        d = detail[detail["day"] == day]
        if len(d) == 0:
            continue  # fully-future day
        xs.append(day)
        ys.append(100 * (d["status"] == "hit").sum() / len(d))
    if not xs:
        return
    fig, ax = plt.subplots(figsize=(max(7, 0.6 * len(xs) + 2), 4))
    ax.plot(range(len(xs)), ys, marker="o", color="#1a6fb0", linewidth=2)
    ax.fill_between(range(len(xs)), ys, color="#1a6fb0", alpha=0.08)
    ax.axhline(90, color="#1a9850", linestyle="--", linewidth=1, label="90% target")
    for i, y in enumerate(ys):
        ax.annotate(f"{y:.0f}%", (i, y), textcoords="offset points", xytext=(0, 8),
                    ha="center", fontsize=8)
    ax.set_xticks(range(len(xs)))
    ax.set_xticklabels([d.strftime("%a %m-%d") for d in xs], rotation=45, ha="right", fontsize=8)
    ax.set_ylim(0, 105)
    ax.set_ylabel("Compliance %")
    ax.set_title("Fleet delivery compliance by day")
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def plot_slot_compliance(detail, slots, out_path):
    """Per-slot hit rate across the fleet — which of 10/14/18 is failing?"""
    if detail.empty:
        return
    labels = [s.strftime("%H:%M") for s in slots]
    rates = []
    for label in labels:
        d = detail[detail["slot"] == label]
        rates.append(100 * (d["status"] == "hit").sum() / len(d) if len(d) else 0.0)
    colors = [
        "#1a9850" if r >= 90 else "#fdae61" if r >= 50 else "#d73027" for r in rates
    ]
    fig, ax = plt.subplots(figsize=(6, 4.5))
    bars = ax.bar(labels, rates, color=colors, width=0.6)
    ax.axhline(90, color="#1a9850", linestyle="--", linewidth=1)
    ax.set_ylim(0, 105)
    ax.set_ylabel("Compliance %")
    ax.set_xlabel("Expected send slot (local time)")
    ax.set_title("Compliance per daily slot")
    for b, r in zip(bars, rates):
        ax.text(b.get_x() + b.get_width() / 2, r + 2, f"{r:.0f}%", ha="center", fontsize=11,
                fontweight="bold")
    fig.tight_layout()
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def friendly_label(bucket):
    """Strip the trailing _<uuid> from a tenant bucket name for display."""
    parts = bucket.rsplit("_", 1)
    if len(parts) == 2 and len(parts[1]) >= 16 and "-" in parts[1]:
        return parts[0]
    return bucket


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #

def main():
    args = parse_args()
    url, token, org, env_bucket = load_config()
    bucket = args.bucket or env_bucket
    tz = ZoneInfo(args.timezone)

    with InfluxDBClient(url=url, token=token, org=org) as client:
        query_api = client.query_api()

        if args.list_buckets:
            for name in list_buckets(client):
                print(name)
            return

        if not bucket:
            sys.exit("No bucket specified and INFLUXDB_BUCKET is not set. Use --bucket.")

        if args.list_measurements:
            for m in list_measurements(query_api, org, bucket):
                print(m)
            return

        if args.list_devices:
            devs = list_devices(query_api, org, bucket, args.measurement)
            if args.device_prefix:
                devs = [d for d in devs if d.startswith(args.device_prefix)]
            for dev in devs:
                print(dev)
            return

        slots = parse_slots(args.slots)
        start_local, end_local = resolve_range(args, tz)
        start_utc = start_local.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ")
        stop_utc = end_local.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ")

        if args.device:
            devices = args.device
        else:
            devices = list_devices(query_api, org, bucket, args.measurement)
            if args.device_prefix:
                devices = [d for d in devices if d.startswith(args.device_prefix)]
        if not devices:
            sys.exit(f"No devices found in bucket '{bucket}'.")

        # Scope the data query to the resolved device list (skip when querying all).
        query_devices = devices if (args.device or args.device_prefix) else []

        # Build the measurement-exclusion list. 'system' is a server-side connectivity
        # monitor (every ~10 min, independent of device sends), so it would inflate
        # compliance into a misleading uptime metric — exclude it by default.
        exclude = list(args.exclude_measurement)
        if (
            not args.measurement
            and not args.include_system
            and "system" not in exclude
        ):
            exclude.append("system")

        meas_note = f", measurement '{args.measurement}'" if args.measurement else ""
        prefix_note = f", prefix '{args.device_prefix}'" if args.device_prefix else ""
        excl_note = f", excluding {exclude}" if (exclude and not args.measurement) else ""
        print(
            f"Querying bucket '{bucket}'{meas_note}{prefix_note}{excl_note}: "
            f"{len(devices)} device(s), "
            f"{start_local.date()} -> {(end_local - timedelta(days=1)).date()} "
            f"({args.timezone}), slots {args.slots} +/-{args.tolerance_min}min"
        )
        df_sends = fetch_sends(
            query_api, org, bucket, start_utc, stop_utc, query_devices, args.field,
            args.measurement, exclude,
        )

    # Day list (local dates) covering the range.
    n_days = (end_local.date() - start_local.date()).days
    days = [start_local.date() + timedelta(days=i) for i in range(n_days)]

    detail, summary, sends = classify(
        df_sends, devices, days, slots, tz, args.tolerance_min
    )

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    summary.to_csv(out_dir / "summary_by_device.csv", index=False)
    detail.to_csv(out_dir / "detail_by_slot.csv", index=False)

    n_slots = len(slots)
    label = args.label or friendly_label(bucket)
    date_from = start_local.date().isoformat()
    date_to = (end_local - timedelta(days=1)).date().isoformat()

    # Executive / shareable overview charts (good for a project lead).
    plot_summary_panel(
        summary, label, args.measurement, date_from, date_to, args.slots,
        out_dir / "00_summary_overview.png",
    )
    plot_daily_trend(detail, days, out_dir / "01_daily_trend.png")
    plot_slot_compliance(detail, slots, out_dir / "02_compliance_per_slot.png")

    # Detailed / diagnostic charts.
    plot_heatmap(detail, devices, days, n_slots, out_dir / "heatmap_slots_per_day.png")
    plot_compliance_bar(summary, out_dir / "compliance_by_device.png")
    plot_timing_scatter(sends, devices, slots, args.tolerance_min, out_dir / "send_timing.png")
    plot_daily_stacked(detail, days, n_slots, out_dir / "daily_slots_stacked.png")

    # Terminal summary.
    total_expected = int(summary["expected"].sum()) if not summary.empty else 0
    total_received = int(summary["received"].sum()) if not summary.empty else 0
    overall = 100 * total_received / total_expected if total_expected else 0
    print(f"\nOverall compliance: {total_received}/{total_expected} slots ({overall:.1f}%)")
    silent = summary[summary["total_sends"] == 0]["device"].tolist()
    if silent:
        print(f"Silent devices (no sends at all in range): {', '.join(silent)}")
    off_only = summary[(summary["total_sends"] > 0) & (summary["received"] == 0)]["device"].tolist()
    if off_only:
        print(f"Devices sending only off-schedule (never within a slot window): {', '.join(off_only)}")
    worst = summary.head(5)
    if not worst.empty:
        print("\nWorst 5 devices:")
        cols = ["device", "compliance_pct", "missed", "total_sends", "last_seen"]
        print(worst[cols].to_string(index=False))
    print(f"\nWrote CSVs + PNGs to {out_dir}")


if __name__ == "__main__":
    main()
