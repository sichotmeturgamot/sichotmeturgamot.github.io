# חיפוש לפי שאלה — קבצי בנייה

- `descs.json` — תיאור מושגי לכל אחד מ-509 הקטעים (לפי הסדר ב-search-meta.json). נכתב לפי BRIEF.md.
- `embed.py` — חישוב וקטורים ב-Cloudflare (bge-m3); דורש CF_ACCOUNT_ID ו-CF_API_TOKEN זמני.
- `ev.py` / `eval.json` — בדיקת איכות על 30 שאלות.
- `worker.js` — קוד השרת ב-Cloudflare (גרסה 6). הסוד ANTHROPIC_API_KEY מוגדר ב-Cloudflare בלבד.

בנייה: קטע = תיאור + טקסט; חתיכות קטנות = טקסט בלבד; int8 בקנה מידה 400; delta 0.02.
קבצי האתר: search-vectors.bin, search-texts.bin (תיאורים + חתיכות + תחילת קטעים), search-meta.json.
כשמוסיפים שיחות חדשות — צריך לכתוב להן תיאורים ולבנות מחדש את שלושת הקבצים.
