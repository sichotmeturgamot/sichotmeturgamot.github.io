# אתר ספר השיחות מתורגם ללה"ק — הוראות

## העלאה ל-GitHub Pages (חד פעמי)

1. צור חשבון ב-github.com (אם אין לך).
2. צור מאגר (Repository) חדש, למשל בשם `sichos` — סמן Public.
3. לחץ "uploading an existing file" והעלה את כל תוכן תיקיית `site` (כולל תיקיית `pdfs`).
4. היכנס ל-Settings ‏> Pages, תחת Branch בחר `main` ולחץ Save.
5. תוך דקות האתר יהיה זמין בכתובת: `https://YOUR-USERNAME.github.io/sichos/`

## לפני ההעלאה — 2 עדכונים בקובץ data.js

- **רשימת תפוצה:** צור טופס ב-forms.google.com (שדה אימייל + שם), לחץ "שלח" > העתק קישור, והדבק ב-`MAILING_LIST_URL`.
- **ביט:** הדבק את מספר הטלפון שלך ב-`DONATE_BIT_PHONE`.

## ניהול שוטף — עמוד הניהול (מומלץ)

בכתובת `https://YOUR-USERNAME.github.io/sichos/admin.html` יש עמוד ניהול מלא בעברית.

**התחברות (חד פעמי):** צור מפתח גישה ב-GitHub:
Settings ‏> Developer settings ‏> Fine-grained tokens ‏> Generate new token.
בחר גישה רק למאגר של האתר, ותן ל-Contents הרשאת Read and write.
הזן בעמוד הניהול את שם המשתמש, שם המאגר והמפתח — ו