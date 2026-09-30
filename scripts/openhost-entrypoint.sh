#!/bin/bash
set -eu

APP_DATA="${BOTTLE_APP_DATA_DIR:-/data}"
PGDATA="$APP_DATA/postgres"
AIHOT_STATE="$APP_DATA/aihot"
CONFIG_FILE="$APP_DATA/aihot.env"
PG_BIN="/usr/lib/postgresql/17/bin"

mkdir -p "$PGDATA" "$AIHOT_STATE"
chown postgres:postgres "$PGDATA"
chown node:node "$AIHOT_STATE"

if [ ! -f "$CONFIG_FILE" ]; then
  umask 077
  ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)"
  cat >"$CONFIG_FILE" <<EOF
ADMIN_PASSWORD=$ADMIN_PASSWORD
SESSION_SECRET=$(openssl rand -hex 32)
IMG_PROXY_SIGN_SECRET=$(openssl rand -hex 32)

# Fill these three values, then set both switches to true and reload the app.
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=
LLM_MODEL=deepseek-chat
LLM_EXTRA_JSON='{"thinking":{"type":"disabled"}}'
COLLECT_ENABLED=false
MODEL_CALLS_ENABLED=false
EOF
  chown node:node "$CONFIG_FILE"
  chmod 0600 "$CONFIG_FILE"
  echo "AIHOT first start: admin password is $ADMIN_PASSWORD"
  echo "AIHOT persistent configuration: $CONFIG_FILE"
fi

set -a
# The file is generated from controlled values. Operators may edit it through `bottle app ssh news`.
. "$CONFIG_FILE"
set +a

export DATABASE_URL="postgres://aihot@127.0.0.1:5432/aihot"
export AIHOT_DATA_DIR="$AIHOT_STATE"
export API_BASE_URL="http://127.0.0.1:3001"
export LOCAL_ROUTER_URL="http://127.0.0.1:3000"
export API_HOST="127.0.0.1"
export API_PORT="3001"
export WEB_HOST="0.0.0.0"
export WEB_PORT="3000"
export TRUST_PROXY="true"
export SITE_URL="${SITE_URL:-https://${BOTTLE_APP_NAME:-news}.${BOTTLE_ZONE_DOMAIN:-localhost}}"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  runuser -u postgres -- "$PG_BIN/initdb" -D "$PGDATA" -U aihot --auth-local=trust --auth-host=trust --encoding=UTF8 --no-locale
fi

runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$PGDATA" \
  -o "-c listen_addresses=127.0.0.1 -c unix_socket_directories=/tmp -p 5432" -w start

if ! "$PG_BIN/psql" -h 127.0.0.1 -U aihot -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='aihot'" | grep -q 1; then
  "$PG_BIN/createdb" -h 127.0.0.1 -U aihot -O aihot aihot
fi

runuser -u node -- node scripts/migrate.ts
runuser -u node -- node scripts/seed.ts

runuser -u node -- node apps/api/src/main.ts &
API_PID=$!
runuser -u node -- node apps/worker/src/main.ts &
WORKER_PID=$!
runuser -u node -- node apps/web/server.ts &
WEB_PID=$!

stop_all() {
  trap - TERM INT EXIT
  kill -TERM "$WEB_PID" "$API_PID" "$WORKER_PID" 2>/dev/null || true
  wait "$WEB_PID" "$API_PID" "$WORKER_PID" 2>/dev/null || true
  runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$PGDATA" -m fast -w stop 2>/dev/null || true
}

trap 'stop_all; exit 0' TERM INT
trap stop_all EXIT

wait -n "$API_PID" "$WORKER_PID" "$WEB_PID"
STATUS=$?
echo "AIHOT process exited unexpectedly; stopping container (status=$STATUS)" >&2
exit "$STATUS"
