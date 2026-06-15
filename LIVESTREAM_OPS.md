# Camera Livestream — Ops, Health Checks & Previews

Operational runbook for the livestream: checking services, ensuring they
survive reboots, and publishing preview images. Companion docs:
[LIVESTREAM_ARCHITECTURE.md](./LIVESTREAM_ARCHITECTURE.md) ·
[LIVESTREAM_DEPLOYMENT.md](./LIVESTREAM_DEPLOYMENT.md).

Chain: **Pi (HLS) → sv01 nginx `127.0.0.1:8090` → autossh reverse tunnel →
Fly stream-bridge (`*.internal:8090`) → vgreens-backend → browser.**
Everything is outbound from the private side; no inbound port on the Pi or sv01.

## Coordinates

| Thing | Value |
|---|---|
| sv01 (over Tunnelblick VPN) | `vgreens@10.8.0.30` |
| Jump server | `217.160.202.35` |
| sv01 nginx HLS entry point | `http://127.0.0.1:8090/frutania/Cam01_/index.m3u8` (Cam01_ … Cam05_) |
| Pi HLS output | `/tmp/frutania_hls/CamNN_/index.m3u8` (cleared on reboot, recreated by the service) |
| Fly bridge app | `vgreens-stream-bridge` → `vgreens-stream-bridge.internal:8090` |
| Fly backend apps | `vgreens-backend` (prod) · `vgreens-backend-staging` (staging) |

---

## 1. SSH access

```bash
# Tunnelblick / OpenVPN must be UP first.
ssh vgreens@10.8.0.30                       # sv01
ssh -J vgreens@10.8.0.30 pi@pi2             # Raspberry Pi (hop through sv01)
```

---

## 2. Services — Raspberry Pi (`pi@pi2`)

| Unit | Role |
|---|---|
| `frutania-hls.service` | launches the per-camera ffmpeg HLS encoders (oneshot → shows "active (exited)", which is normal) |
| `frutania-hls-http.service` | local HTTP server that sv01 pulls HLS from |
| capture / cleanup cron | snapshot capture + local image cleanup (`~/capture_*`, `~/cleanup_*`) |

```bash
systemctl status frutania-hls frutania-hls-http
systemctl is-enabled frutania-hls frutania-hls-http        # both: enabled
ps aux | grep ffmpeg | grep -v grep                        # 5 encoders, one per camera
# segments fresh? timestamps should be seconds old, advance on a 2nd run:
for c in /tmp/frutania_hls/Cam0*; do printf '%s  ' "$(basename $c)"; stat -c '%y' "$c/index.m3u8"; done; date
```

## 3. Services — sv01 (`vgreens@10.8.0.30`)

| Unit | Role |
|---|---|
| `stream-bridge-tunnel.service` | autossh reverse tunnel sv01 → Fly bridge |
| `frutania-hls-tunnel.service` | SSH tunnel sv01 → Pi (pulls the Pi's HLS) |
| `nginx.service` | HLS proxy on `127.0.0.1:8090` |
| `openvpn@sv01.service` | the VPN sv01 actually uses (the `@client` units are unused/failed) |

```bash
systemctl status stream-bridge-tunnel
journalctl -u stream-bridge-tunnel --since "5 min ago" --no-pager   # should NOT keep restarting
curl -sI http://127.0.0.1:8090/frutania/Cam01_/index.m3u8           # 200 OK = Pi→sv01 healthy
systemctl is-active stream-bridge-tunnel frutania-hls-tunnel nginx openvpn@sv01
```

> A single autossh "Connection closed / exited 255 / restarting (count 2)" right
> after a restart is normal (the prior session's port 8090 forward had to free).
> Continuous climbing counts = flapping → investigate.

---

## 4. Boot persistence (services come back after reboot)

`enable` is permanent — run once, systemd restarts the unit on every boot.

```bash
# sv01
sudo systemctl enable stream-bridge-tunnel frutania-hls-tunnel nginx openvpn@sv01
systemctl is-enabled stream-bridge-tunnel frutania-hls-tunnel nginx openvpn@sv01   # all: enabled

# Pi
sudo systemctl enable frutania-hls frutania-hls-http
systemctl is-enabled frutania-hls frutania-hls-http
```

Two things that decide whether they *work* (not just start) after reboot:

1. **Network/VPN first.** `frutania-hls.service` is ordered `After=network-online.target`.
   Ensure the Pi's WireGuard (`wg0-client-Frutania_pi2`) and sv01's `openvpn@sv01`
   are also enabled, so the camera path is up before the encoders start.
2. **`/tmp` is wiped on reboot.** The HLS output lives in `/tmp/frutania_hls`;
   `frutania_hls_manager.sh start` must recreate the camera dirs (check it has
   `mkdir -p`). Verify: `grep -nE 'mkdir|/tmp/frutania_hls' /opt/frutania-hls/frutania_hls_manager.sh`.

Definitive test: reboot the **Pi** (`sudo reboot`) — only interrupts streams ~1 min.
Reboot sv01 separately and only after a heads-up to Ceng (it carries prod/staging transport).

---

## 5. Preview images (Development + Staging)

The backend reads previews from Supabase Storage at
`vgreens-files/frutania-livestream/CamNN_/latest.jpg` in **its own** project.
Each environment must therefore have those objects in its own bucket.
(Production Supabase is paused — only Dev + Staging are populated.)

| Env | Supabase project | Region |
|---|---|---|
| Development | `esblevodccidcwnneiir` | eu-west-3 |
| Staging | `erkjktrengqtbkilhmpe` | eu-west-1 |
| Production | `bfxlvfiltbqkljznwnyf` | paused |

> Confirmed from `fly ssh console -a vgreens-backend-staging -C "printenv SUPABASE_URL"`.
> The backend is the source of truth for which project each env reads from.

**Step 1 — create the bucket** (once per project): Supabase dashboard → Storage →
New bucket → name `vgreens-files` → **Private** → Create. (Backend uses the
`service_role` key + signed URLs, so private + no RLS policy is correct.)

**Step 2 — confirm each backend points at its own project.** Dev: `backend/.env`
already correct. Staging: `vgreens-backend-staging` secrets must be the staging
project + bucket `vgreens-files`. Do **not** set `SUPABASE_LIVESTREAM_*` (that
override targeted prod, which is paused):
```bash
fly secrets unset SUPABASE_LIVESTREAM_URL SUPABASE_LIVESTREAM_SERVICE_ROLE_KEY -a vgreens-backend-staging
```

**Step 3 — publish snapshots** with the multi-target uploader on **sv01**:
`/opt/frutania-livestream/upload_to_supabase.py` (repo copy: `scripts/upload_to_supabase.py`).
It reads the local `latest.jpg` per camera from
`/mnt/vgreens_storage/UnifiCameraCaptures/frutania_livestream/CamNN_/` and uploads
to every project configured in `/opt/frutania-livestream/.env`:
```env
SUPABASE_STORAGE_BUCKET=vgreens-files
SUPABASE_DEV_URL=https://esblevodccidcwnneiir.supabase.co
SUPABASE_DEV_SERVICE_ROLE_KEY=<dev service_role key>
SUPABASE_STAGING_URL=https://erkjktrengqtbkilhmpe.supabase.co
SUPABASE_STAGING_SERVICE_ROLE_KEY=<staging service_role key>
```
```bash
chmod 600 /opt/frutania-livestream/.env
cd /opt/frutania-livestream && /usr/bin/python3 upload_to_supabase.py   # expect "OK CamNN_ -> development/staging"
```
Cron (already installed) keeps it fresh every 5 min:
```cron
*/5 * * * * cd /opt/frutania-livestream && /usr/bin/python3 upload_to_supabase.py >> /var/log/frutania-livestream.log 2>&1
```
Targets resolve from `.env`: dev if `SUPABASE_DEV_*` set, staging if `SUPABASE_STAGING_*`
set, else legacy `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`. Exit 0 = all OK, 1 = an
upload failed, 2 = config/init error. Log: `/var/log/frutania-livestream.log`.

**Verify:** dashboard → Storage → `vgreens-files` → `frutania-livestream/Cam01_/latest.jpg`
exists in both projects; then the Dev and Staging apps show preview cards.
`FAILED … 404` = the bucket isn't in that project; `local image not found` = that
camera's capture isn't writing `latest.jpg`.

---

## 6. End-to-end verification

```bash
# 1) Pi → sv01  (on sv01)
curl -sI http://127.0.0.1:8090/frutania/Cam01_/index.m3u8                 # 200

# 2) sv01 → bridge → backend  (inside the backend VM)
fly ssh console -a vgreens-backend
curl -I --max-time 5 http://vgreens-stream-bridge.internal:8090/frutania/Cam01_/index.m3u8

# 3) public surface
curl -s https://<backend-domain>/livestream/health                        # ok/degraded/unconfigured

fly logs -a vgreens-stream-bridge
fly logs -a vgreens-backend
```

## 7. Quick triage if a stream is "unavailable"

1. `systemctl status stream-bridge-tunnel` on sv01 → down? `sudo systemctl restart stream-bridge-tunnel`.
2. `curl -sI http://127.0.0.1:8090/frutania/Cam01_/index.m3u8` on sv01 — fails ⇒ problem is upstream (Pi or `frutania-hls-tunnel`), not Fly.
3. On the Pi: ffmpeg running and segments fresh? Restart `frutania-hls` if not.
4. From the backend VM: `curl -I http://vgreens-stream-bridge.internal:8090/...` — fails only here ⇒ tunnel/bridge.
5. `/livestream/health` + `fly logs`.

> Local dev needs no bridge: VPN up, `ssh -L 18090:127.0.0.1:8090 vgreens@10.8.0.30`,
> set `LIVESTREAM_UPSTREAM_URL=http://127.0.0.1:18090` in `backend/.env`, run the dev servers.
> Don't deploy to staging without checking with Ceng first.
