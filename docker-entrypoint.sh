#!/bin/sh
set -eu

BACKEND_HOST="${BACKEND_HOST:-host.docker.internal:8080}"
export BACKEND_HOST

envsubst '${BACKEND_HOST}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
