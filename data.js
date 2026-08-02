/* קובץ זה נערך אוטומטית דרך עמוד הניהול (admin.html) — אפשר גם לערוך ידנית */

const MAILING_LIST_URL = "https://forms.gle/um92g7TAt2EwwKuM7";
const WHATSAPP_URL = "https://chat.whatsapp.com/HidWyvYZFgB4PfMxdsGvoo";
const DONATE_EMAIL = "doviber@gmail.com";
const DONATE_BIT_PHONE = "058-516-6540";

/* טקסטים ועיצוב — ניתן לעריכה מעמוד הניהול */
const SITE = {
  "brand": "",
  "heroTitle": "",
  "heroSub": "",
  "about1": "",
  "about2": "",
  "subscribeText": "",
  "donateTitle": "",
  "donateText": "",
  "colorNavy": "#1a2942",
  "colorGold": "#b8933e",
  "colorCream": "#faf7f0",
  "customCss": ""
};

const YEARS = [
  {
    "year": "תש״ו",
    "note": "תורגם במלואו",
    "complete": true,
    "sichos": [
      {
        "title": "ספר השיחות תש\"ו",
        "subtitle": "כל ספר השיחות תש\"ו מתורגם ללה\"ק עם מפתחות",
        "file": "pdfs/Sefer_hasichot_5706.pdf",
        "pages": 44,
        "count": 29,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-07-03"
      },
      {
        "title": "יב תשרי תש\"ו",
        "subtitle": "",
        "file": "pdfs/12_Tishrei.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-12",
        "hebDate": "י״ב תשרי",
        "addedAt": "2026-08-02"
      },
      {
        "title": "ליל א' דחג הסוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Alef_Sukkos_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-14",
        "hebDate": "י״ד תשרי",
        "addedAt": "2026-08-02"
      },
      {
        "title": "יום א' דחג הסוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Yom_Alef_Sukkos_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-15",
        "hebDate": "ט״ו תשרי",
        "addedAt": "2026-08-02"
      },
      {
        "title": "יום ב' דחג הסוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Yom_Beis_Sukkos_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-16",
        "hebDate": "ט״ז תשרי",
        "addedAt": "2026-08-02"
      },
      {
        "title": "יום שבת חוה\"מ סוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Shabbos_Chol_HaMoed_Sukkos_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-17",
        "hebDate": "י״ז תשרי",
        "addedAt": "2026-08-02"
      },
      {
        "title": "ליל שמיני עצרת תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Shmini_Atzeres_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-22",
        "hebDate": "כ״ב תשרי",
        "addedAt": "2026-08-02"
      }
    ]
  },
  {
    "year": "תש״ז",
    "note": "בתהליך תרגום",
    "complete": false,
    "sichos": [
      {
        "title": "שיחות תשרי - תש\"ז",
        "subtitle": "השיחות שנאמרו במהלך חודש תשרי תש\"ז",
        "file": "pdfs/Tishrey_5707.pdf",
        "pages": 17,
        "count": 17,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-07-03"
      },
      {
        "title": "משיחת ליל ש\"ק נח, בדר\"ח מר־חשון, תש\"ז",
        "subtitle": "",
        "file": "pdfs/Leyl_nuach_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "02-01",
        "hebDate": "א׳ מרחשון",
        "addedAt": "2026-07-05"
      },
      {
        "title": "ש\"פ נח, בדר\"ח מר־חשון בסעודת היום תש\"ז",
        "subtitle": "",
        "file": "pdfs/Noach_Bayom_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "02-01",
        "hebDate": "א׳ מרחשון",
        "addedAt": "2026-07-03"
      },
      {
        "title": "שיחת י\"ט כסלו תש\"ז",
        "subtitle": "",
        "file": "pdfs/19_kislev_5707.pdf",
        "pages": 8,
        "count": 1,
        "sortDate": "03-19",
        "hebDate": "י״ט כסלו",
        "addedAt": "2026-07-10"
      },
      {
        "title": "שיחת פורים תש\"ז",
        "subtitle": "",
        "file": "pdfs/Purim_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "06-14",
        "hebDate": "י״ד אדר",
        "addedAt": "2026-07-06"
      },
      {
        "title": "סדר הראשון של חג הפסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/Seder_reshon_chag_hpesach_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "08-14",
        "hebDate": "י״ד ניסן",
        "addedAt": "2026-07-16"
      },
      {
        "title": "ליל ב' דחג הפסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/leyl_b_pesach_5707.pdf",
        "pages": 4,
        "count": 1,
        "sortDate": "08-15",
        "hebDate": "ט״ו ניסן",
        "addedAt": "2026-07-16"
      },
      {
        "title": "ליל שביעי של פסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/shviei_shel_pesach_5707.pdf",
        "pages": 7,
        "count": 1,
        "sortDate": "08-21",
        "hebDate": "כ״א ניסן",
        "addedAt": "2026-07-16"
      },
      {
        "title": "אחרון של פסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/achron_shel_pesach_5707.pdf",
        "pages": 10,
        "count": 1,
        "sortDate": "08-21",
        "hebDate": "כ״א ניסן",
        "addedAt": "2026-07-17"
      },
      {
        "title": "ל\"ג בעומר תש\"ז",
        "subtitle": "",
        "file": "pdfs/lag_baomer_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "09-18",
        "hebDate": "י״ח אייר",
        "addedAt": "2026-07-30"
      },
      {
        "title": "שיחת ליל א' דחג השבועות תש\"ז",
        "subtitle": "",
        "file": "pdfs/Leyl_a_shavuot_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "10-06",
        "hebDate": "ו׳ סיון",
        "addedAt": "2026-07-24"
      }
    ]
  },
  {
    "year": "תרצ\"ח",
    "note": "בתהליך תרגום",
    "complete": false,
    "sichos": [
      {
        "title": "י\"ט כסלו תרצ\"ח",
        "subtitle": "",
        "file": "pdfs/19_Kislev_5698.pdf",
        "pages": 4,
        "count": 1,
        "sortDate": "03-19",
        "hebDate": "י״ט כסלו",
        "addedAt": "2026-07-06"
      }
    ]
  }
];
