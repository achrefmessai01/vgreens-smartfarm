#!/bin/sh
# Entrypoint for the vGreens stream bridge.
# - Host key comes from the SSH_HOST_ED25519_KEY secret so it survives
#   redeploys (otherwise sv01's known_hosts would break every deploy).
# - The authorized key for the tunnel user comes from TUNNEL_AUTHORIZED_KEYS.
set -eu

mkdir -p /etc/ssh/keys /home/tunnel/.ssh

if [ -n "${SSH_HOST_ED25519_KEY_B64:-}" ]; then
  # Preferred: base64-encoded key (single line, survives any shell/paste).
  printf '%s' "$SSH_HOST_ED25519_KEY_B64" | base64 -d \
    > /etc/ssh/keys/ssh_host_ed25519_key
elif [ -n "${SSH_HOST_ED25519_KEY:-}" ]; then
  printf '%s\n' "$SSH_HOST_ED25519_KEY" > /etc/ssh/keys/ssh_host_ed25519_key
elif [ ! -f /etc/ssh/keys/ssh_host_ed25519_key ]; then
  echo "WARNING: no host key secret set; generating ephemeral host key" >&2
  ssh-keygen -t ed25519 -f /etc/ssh/keys/ssh_host_ed25519_key -N '' -q
fi
chmod 600 /etc/ssh/keys/ssh_host_ed25519_key

if [ -z "${TUNNEL_AUTHORIZED_KEYS:-}" ]; then
  echo "FATAL: TUNNEL_AUTHORIZED_KEYS secret is not set" >&2
  exit 1
fi
printf '%s\n' "$TUNNEL_AUTHORIZED_KEYS" > /home/tunnel/.ssh/authorized_keys
chown -R tunnel /home/tunnel/.ssh
chmod 700 /home/tunnel/.ssh
chmod 600 /home/tunnel/.ssh/authorized_keys

exec /usr/sbin/sshd -D -e -f /etc/ssh/sshd_config
