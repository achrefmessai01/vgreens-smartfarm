# Backend scripts

Standalone Python utilities for ad-hoc analytics against the vGreens InfluxDB.
These are operational tools — not part of the NestJS build.

## device_delivery_report.py

Reports how reliably edge devices (`vgreens-XX-XX`) send data. Devices are expected
to push 3× per day (default **10:00 / 14:00 / 18:00 Europe/Berlin**). The script
queries InfluxDB, classifies each send into the nearest expected slot, and writes a
**CSV tabular view** plus **PNG diagrams**.

### Setup (one-time)

```bash
cd backend/scripts
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Credentials are read automatically from `backend/.env`
(`INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_BUCKET`). Nothing is
hardcoded.

### Usage

```bash
# Sanity checks
python device_delivery_report.py --list-buckets
python device_delivery_report.py --list-measurements --bucket <bucket>
python device_delivery_report.py --list-devices --bucket <bucket> --measurement <measurement>

# ALL edge devices for the past week (the common case).
# A tenant bucket mixes edge devices (vgreens-XX-XX) with other sensors
# (Air_/Soil_); --device-prefix grabs only the edge devices, across every
# measurement they write to:
python device_delivery_report.py \
  --bucket "gemseproduktion-schklen-gmbh_455df40c-ea3d-4b19-a555-68b8cec5b881" \
  --device-prefix vgreens- \
  --days 7

# Scope to one measurement instead (e.g. just the camera leaf-coverage data):
python device_delivery_report.py \
  --bucket "gemseproduktion-schklen-gmbh_455df40c-ea3d-4b19-a555-68b8cec5b881" \
  --measurement vgreens_leaftom \
  --days 14

# A specific device, explicit date range
python device_delivery_report.py --bucket <bucket> --measurement vgreens_tomato \
  --start 2026-06-01 --end 2026-06-14 --device vgreens-v1-09

# Custom slots/tolerance, UTC
python device_delivery_report.py --bucket <bucket> --measurement vgreens_leaftom \
  --slots 09:00,13:00,17:00 --tolerance-min 60 --timezone UTC
```

> **Per-tenant buckets split data by `_measurement`.** Use `--list-measurements` to
> see them, then pass `--measurement` so devices and sends are scoped correctly. The
> `device` tag (`vgreens-XX-XX`) is the same across measurements; without
> `--measurement` the report aggregates a device's sends across every measurement.

Run `python device_delivery_report.py --help` for all flags.

### Output (in `./output/`, gitignored)

**Shareable overview (good for a project lead):**

| File | What it shows |
|------|---------------|
| `00_summary_overview.png` | One-pager: headline compliance %, device counts (healthy / need attention / silent), health donut |
| `01_daily_trend.png` | Fleet compliance % per day vs a 90% target line |
| `02_compliance_per_slot.png` | Hit-rate per daily slot (10:00 / 14:00 / 18:00) — which time is failing |

**Detailed / diagnostic:**

| File | What it shows |
|------|---------------|
| `summary_by_device.csv` | Per device: expected, received, missed, compliance %, total/off-schedule sends, avg delay, last seen |
| `detail_by_slot.csv` | Per (device, day, slot): hit/missed, actual time, delay (min) |
| `heatmap_slots_per_day.png` | Device × day grid, colored by # slots hit (0–3) |
| `compliance_by_device.png` | Per-device compliance %, worst first |
| `send_timing.png` | Actual send times vs the 10/14/18 slot bands — reveals timing drift |
| `daily_slots_stacked.png` | Per day, how many devices hit 0/1/2/3 slots |

Use `--label "My Tenant"` to set the name shown in chart titles (defaults to the bucket
name with its UUID stripped).

### Notes

- One physical send writes several fields at the same timestamp; the script dedupes
  to one send per `(device, minute)` so sends are counted once.
- All slot logic happens after converting InfluxDB UTC timestamps to the chosen timezone.
- A send within `±tolerance-min` of a slot counts as a hit; sends outside any window are
  counted as `off_schedule_sends`.
- The InfluxDB Cloud endpoint occasionally returns transient `404`s on schema queries;
  the script retries each query up to 6× with exponential backoff, so unattended runs
  are reliable. Retry notices are printed to stderr and don't affect the result.
- The **`system` measurement is a server-side connectivity monitor** (it writes
  `online` / `rssi` / `last_uplink_age_min` every ~10 min regardless of whether the
  device sent anything), so counting it turns "compliance" into a misleading *uptime*
  number. It is **auto-excluded** on runs that don't target a specific `--measurement`.
  Use `--include-system` to keep it, or `--exclude-measurement <name>` to drop others.
  Device heartbeats (tiny keep-alive uplinks, e.g. payload `0x00`) only update `system`
  — they are not real sensor data.

## message_inventory.py

Per-tenant **message inventory** — one row per device showing which message types it
reported, when it was last alive (last uplink), and when it last sent real sensor data.
Each device gets a **state**: `working` / `stale` / `heartbeat-only` / `never-seen`.
Great for handing to a project lead — the rendered table includes a state-key legend.

Setup is the same venv as above (`source venv/bin/activate`). Then:

```bash
# All edge devices in a tenant, past 7 days
python message_inventory.py \
  --bucket "gmr---meinsdorf-gmbh_254862df-36b9-4f63-b46a-e505a02c9476" \
  --device-prefix vgreens- \
  --days 7 \
  --out-dir output/gmr-meinsdorf/inventory

# Mark a device 'stale' if no real data in the last 12h instead of the 24h default
python message_inventory.py --bucket <bucket> --device-prefix vgreens- \
  --days 7 --stale-after-hours 12 --out-dir output/<tenant>/inventory
```

This writes **both files** into `--out-dir`:

| File | What it is |
|------|-----------|
| `message_inventory.csv` | Full table (also has `online` + `real_msg_types` columns) |
| `message_inventory.png` | Rendered table with color-coded state + legend |

Columns: **Device · State · Message types reported · Last alive (uplink) · Last real
data · Real data points · Heartbeat data points**. The state colors are
green/yellow/orange/red worst-first. Run with `--help` for all flags
(`--device`, `--timezone`, `--label`, `--stale-after-hours`).

> "Heartbeat data points" counts the `system` monitor (~every 10 min, server-side),
> not literal device keep-alives — it stays high even for offline devices. Use the
> **Last alive** column for true liveness.

## combine_reports.py

Merges several `device_delivery_report.py` output folders into one cross-tenant view —
a combined CSV + a chart ranking every device, plus a per-tenant compliance bar.

```bash
python combine_reports.py --out-dir output/combined \
  output/gemseproduktion-schklen output/gmr-meinsdorf
```

Writes `combined_summary.csv`, `combined_ranked.png`, and `combined_by_tenant.png`
into `--out-dir`. Each input folder just needs a `summary_by_device.csv`.
