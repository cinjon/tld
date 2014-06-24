#!/bin/sh

USERNAME="production"
CHANNEL="#robots"
MESSAGE="deployment starting now"
PAYLOAD="payload={\"channel\": \"$CHANNEL\", \"username\": \"$USERNAME\", \"text\": \"$MESSAGE\"}"
TOKEN="SPSkMhmEj2aPN6IvhjDpqbjw"
SLACK_URL=https://timelined.slack.com/services/hooks/incoming-webhook?token=$TOKEN

curl -X POST --data "$PAYLOAD" $SLACK_URL

cd /root/code/timelined
git reset --hard
git pull
mrt update --force
cd ./server/scripts/deploy
mup deploy
