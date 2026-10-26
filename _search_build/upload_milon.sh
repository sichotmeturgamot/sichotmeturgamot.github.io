#!/bin/bash
# מעלה את קובץ המילון ל-R2 (הדלי הפרטי sichos-data, המפתח dictionary/milon_en.txt).
# דף המילון באתר קורא אותו דרך השרת (?mode=milon) ומתעדכן אוטומטית.
# שימוש:  CF_ACCOUNT_ID=... CF_TOKEN=... ./upload_milon.sh /נתיב/אל/milon_en.txt
set -e
f="${1:-milon_en.txt}"
curl -sS -X PUT "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/r2/buckets/sichos-data/objects/dictionary/milon_en.txt" \
  -H "Authorization: Bearer $CF_TOKEN" --data-binary @"$f" -o /dev/null -w "milon_en.txt -> %{http_code}\n"
