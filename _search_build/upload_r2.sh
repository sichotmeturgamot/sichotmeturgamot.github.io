#!/bin/bash
# מעלה את קבצי החיפוש הגדולים ל-R2 (לא ל-GitHub). דורש CF_ACCOUNT_ID ו-CF_TOKEN (הרשאת Workers R2 Storage: Edit).
set -e
cd "$(dirname "$0")/.."
A="https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/r2/buckets/sichos-data/objects"
for f in search-vectors.bin search-bits.bin search-texts.bin; do
  echo $f; curl -s -X PUT "$A/$f" -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/octet-stream" --data-binary @$f | head -c 200; echo
done
