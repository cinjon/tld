#!/bin/sh
cd /root/deploy/timelined
git pull
mrt update
cd ./server/scripts/deploy
mup deploy
