# vGreens stream bridge — hardened sshd that accepts ONE reverse tunnel
# from sv01 and exposes it only on Fly's private network (no public ports
# besides SSH itself).
FROM alpine:3.20

RUN apk add --no-cache openssh-server \
  && adduser -D -s /sbin/nologin tunnel \
  # Unlock the account for pubkey auth without setting a password
  && sed -i 's/^tunnel:!/tunnel:*/' /etc/shadow \
  && mkdir -p /etc/ssh/keys /home/tunnel/.ssh

COPY sshd_config /etc/ssh/sshd_config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 2222

ENTRYPOINT ["/entrypoint.sh"]
