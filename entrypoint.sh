#!/bin/sh
set -e

SEARXNG_PORT="${SEARXNG_PORT:-8888}"
APP_PORT="${PORT:-3000}"
SEARXNG_API_URL="http://127.0.0.1:${SEARXNG_PORT}"

echo "Starting SearXNG on ${SEARXNG_PORT}..."

sudo -H -u searxng bash -c "cd /usr/local/searxng/searxng-src && export SEARXNG_SETTINGS_PATH='/etc/searxng/settings.yml' && export FLASK_APP=searx/webapp.py && /usr/local/searxng/searx-pyenv/bin/python -m flask run --host=127.0.0.1 --port=${SEARXNG_PORT}" &
SEARXNG_PID=$!

echo "Waiting for SearXNG to be ready..."
sleep 5

COUNTER=0
MAX_TRIES=30
until curl -s "${SEARXNG_API_URL}" > /dev/null 2>&1; do
  COUNTER=$((COUNTER+1))
  if [ $COUNTER -ge $MAX_TRIES ]; then
    echo "Warning: SearXNG health check timeout, but continuing..."
    break
  fi
  sleep 1
done

if curl -s "${SEARXNG_API_URL}" > /dev/null 2>&1; then
  echo "SearXNG started successfully (PID: $SEARXNG_PID)"
else
  echo "SearXNG may not be fully ready, but continuing (PID: $SEARXNG_PID)"
fi

cd /home/openperplexity
export SEARXNG_API_URL
export PORT="${APP_PORT}"
export HOSTNAME="0.0.0.0"

echo "Starting OpenPerplexity on port ${PORT}..."

exec node server.js
