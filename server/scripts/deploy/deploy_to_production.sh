#!/bin/sh

USERNAME="production"
CHANNEL="#robots"
MESSAGE="deployment starting now"
PAYLOAD="payload={\"channel\": \"$CHANNEL\", \"username\": \"$USERNAME\", \"text\": \"$MESSAGE\"}"
TOKEN="SPSkMhmEj2aPN6IvhjDpqbjw"
SLACK_URL=https://timelined.slack.com/services/hooks/incoming-webhook?token=$TOKEN

curl -X POST --data "$PAYLOAD" $SLACK_URL

cd /root/deploy/timelined
git pull
mrt update
cd ./server/scripts/deploy
mup deploy
