#!/usr/bin/env bash
set -euo pipefail

# =============================================
# EAJMUSIC Frontend Deploy — LXC → Hostinger
# =============================================
# 1. Download latest snapshot release from GitHub
# 2. Rsync each independent build to its Hostinger document root:
#      dist/main/   -> public_html/         (eajmusic.com)
#      dist/artist/ -> public_html/artist/  (artist.eajmusic.com)
#      dist/eaj/    -> public_html/eaj/     (eaj.eajmusic.com)
#
# Usage:
#   SSH_PASS='...' bash scripts/deploy-frontend.sh
#   # or with a cron wrapper that sources the password
#
# Prerequisites:
#   apt install sshpass rsync -y
# =============================================

GH_REPO="EAJRD/eajmusic-frontend"
HOST="194.195.84.121"
PORT="65002"
USER="u539343672"
REMOTE_ROOT="/home/u539343672/domains/eajmusic.com/public_html"

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

cd "$TMPDIR"

echo "=== Downloading snapshot from GitHub ==="
curl -sL "https://github.com/$GH_REPO/releases/download/snapshot/eajmusic-build.tar.gz" -o build.tar.gz

echo "=== Extracting ==="
tar -xzf build.tar.gz

for dir in main artist eaj; do
  if [ ! -d "$dir" ]; then
    echo "ERROR: expected dist/$dir in the build archive but it's missing." >&2
    exit 1
  fi
done

echo "=== Deploying main site (eajmusic.com) ==="
SSHPASS="${SSH_PASS:?SSH_PASS env var required}" sshpass -e rsync -avz --delete \
  -e "ssh -p $PORT -o StrictHostKeyChecking=no" \
  ./main/ "$USER@$HOST:$REMOTE_ROOT/"

echo "=== Deploying artist subdomain (artist.eajmusic.com) ==="
SSHPASS="${SSH_PASS}" sshpass -e rsync -avz --delete \
  -e "ssh -p $PORT -o StrictHostKeyChecking=no" \
  ./artist/ "$USER@$HOST:${REMOTE_ROOT}/artist/"

echo "=== Deploying admin subdomain (eaj.eajmusic.com) ==="
SSHPASS="${SSH_PASS}" sshpass -e rsync -avz --delete \
  -e "ssh -p $PORT -o StrictHostKeyChecking=no" \
  ./eaj/ "$USER@$HOST:${REMOTE_ROOT}/eaj/"

echo "=== Deploy complete ==="
echo "  https://eajmusic.com"
echo "  https://artist.eajmusic.com"
echo "  https://eaj.eajmusic.com"
