#!/bin/sh

curl -X POST --data "$PAYLOAD" $SLACK_URL

cd /root/code/timelined
git reset --hard
git pull
mrt update --force
cd ./server/scripts/deploy
mup deploy
