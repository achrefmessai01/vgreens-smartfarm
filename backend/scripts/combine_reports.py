#!/usr/bin/env python3
"""Combine per-tenant device-delivery reports into one cross-tenant view.

Reads the ``summary_by_device.csv`` from several report output folders (produced by
device_delivery_report.py), merges them with a tenant column, and writes:
  - combined_summary.csv          (all devices, ranked worst-first)
  - combined_ranked.png           (one bar per device, colored by health)
  - combined_by_tenant.png        (per-tenant overall compliance)

Usage:
  python combine_reports.py --out-dir output/combined \
      output/gemseproduktion-schklen output/gmr-meinsdorf
"""

import argparse
from pathlib import Path

import pandas as pd
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from device_delivery_report import HEALTH_COLORS, HEALTH_ORDER, _health_category


def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("dirs", nargs="+", help="Report folders, each with summary_by_device.csv")
    p.add_argument("--out-dir", default="output/combined", help="Where to write combined output")
    return p.parse_args()


def short_tenant(name):
    return name.split("_")[0].split("-")[0]


def main():
    args = parse_args()
    frames = []
    for d in args.dirs:
        path = Path(d) / "summary_by_device.csv"
        if not path.exists():
            print(f"skip: {path} not found")
            continue
        df = pd.read_csv(path)
        df["tenant"] = Path(d).name
        frames.append(df)
    if not frames:
        raise SystemExit("No summary_by_device.csv files found in the given folders.")

    combined = pd.concat(frames, ignore_index=True)
    combined["health"] = combined.apply(_health_category, axis=1)
    combined = combined.sort_values(
        ["compliance_pct", "tenant", "device"]
    ).reset_index(drop=True)

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    cols = ["tenant", "device", "compliance_pct", "received", "expected", "missed",
            "total_sends", "off_schedule_sends", "last_seen", "health"]
    cols = [c for c in cols if c in combined.columns] + \
        [c for c in combined.columns if c not in cols]
    combined[cols].to_csv(out_dir / "combined_summary.csv", index=False)

    # --- Chart 1: every device ranked worst-first ---
    labels = [f"{r.device}  ·  {short_tenant(r.tenant)}" for r in combined.itertuples()]
    colors = [HEALTH_COLORS[h] for h in combined["health"]]
    fig_h = max(4, 0.26 * len(combined) + 1.5)
    fig, ax = plt.subplots(figsize=(9, fig_h))
    ax.barh(range(len(combined)), combined["compliance_pct"], color=colors)
    ax.set_yticks(range(len(combined)))
    ax.set_yticklabels(labels, fontsize=7)
    ax.invert_yaxis()
    ax.set_xlim(0, 100)
    ax.set_xlabel("Delivery compliance %")
    ax.set_title(f"All edge devices ranked — {len(combined)} devices, "
                 f"{combined['tenant'].nunique()} tenants")
    handles = [plt.Rectangle((0, 0), 1, 1, color=HEALTH_COLORS[h])
               for h in HEALTH_ORDER if h in set(combined["health"])]
    names = [h for h in HEALTH_ORDER if h in set(combined["health"])]
    ax.legend(handles, names, fontsize=8, loc="lower right")
    fig.tight_layout()
    fig.savefig(out_dir / "combined_ranked.png", dpi=130)
    plt.close(fig)

    # --- Chart 2: per-tenant overall compliance ---
    roll = combined.groupby("tenant").apply(
        lambda g: 100 * g["received"].sum() / max(1, g["expected"].sum())
    ).sort_values()
    fig, ax = plt.subplots(figsize=(8, max(2.5, 0.6 * len(roll) + 1.5)))
    bar_colors = ["#1a9850" if v >= 90 else "#fdae61" if v >= 50 else "#d73027"
                  for v in roll.values]
    ax.barh(range(len(roll)), roll.values, color=bar_colors)
    ax.set_yticks(range(len(roll)))
    ax.set_yticklabels(roll.index, fontsize=9)
    ax.set_xlim(0, 100)
    ax.set_xlabel("Overall compliance %")
    ax.set_title("Compliance by tenant")
    for i, v in enumerate(roll.values):
        ax.text(min(v + 1, 95), i, f"{v:.0f}%", va="center", fontsize=9)
    fig.tight_layout()
    fig.savefig(out_dir / "combined_by_tenant.png", dpi=130)
    plt.close(fig)

    # --- Terminal rollup ---
    n_dev = len(combined)
    n_silent = int((combined["health"] == "Silent (no data)").sum())
    n_healthy = int((combined["health"] == "Healthy (>=90%)").sum())
    overall = 100 * combined["received"].sum() / max(1, combined["expected"].sum())
    print(f"Combined: {n_dev} devices across {combined['tenant'].nunique()} tenants")
    print(f"Overall compliance: {overall:.1f}%  |  healthy: {n_healthy}  |  silent: {n_silent}")
    print("\nPer tenant:")
    for tenant, v in roll.items():
        print(f"  {tenant:<32} {v:5.1f}%")
    print(f"\nWrote combined CSV + charts to {out_dir}")


if __name__ == "__main__":
    main()
