# _seo_build

`build.mjs` בונה את הדפים הסטטיים לגוגל ולסוכני AI:

- `stories/*.html` — סיפורים ופתגמים לפי דמות, נושא ומועד (מתוך `stories.json`)
- `erchim/*.html` — דף לכל ערך במפתחות עם 3 מקומות ומעלה (מתוך `mafteach.js`, קריאה בלבד)
- רשימת 5 השיחות האחרונות בדף הבית (מתוך `data.js`)
- `sitemap-topics.xml`

הבנייה רצה אוטומטית ב-GitHub Actions (`.github/workflows/seo-pages.yml`)
בכל עדכון של `data.js`, `stories.json`, `mafteach.js` או של התיקייה הזו.
אפשר להריץ ידנית גם מלשונית Actions ← "עדכון דפים סטטיים" ← Run workflow.

לא לכתוב לתיקייה `mafteach/`: הנתיב הזה שייך לאפליקציית המפתחות הנפרדת.
