#!/bin/sh
# Run by the nginx image before start (/docker-entrypoint.d): reloads nginx every 6 hours in the
# background, so certificates renewed by the certbot container are picked up without a restart.
(while sleep 21600; do nginx -s reload; done) &
