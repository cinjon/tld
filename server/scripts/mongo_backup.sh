#!/bin/sh
mongodump --db timelined --out /var/backups/mongo/timelined-`date +"%m_%d_%Y"`
cd /var/backups/mongo
tar -czvf timelined-`date +"%m_%d_%Y"`.tar.gz timelined-`date +"%m_%d_%Y"`
rm -rf timelined-`date +"%m_%d_%Y"`
s3cmd put timelined-`date +"%m_%d_%Y"`.tar.gz s3://timelined-backups/mongo/timelined-`date +"%m_%d_%Y-%H%M%S"`.tar.gz
