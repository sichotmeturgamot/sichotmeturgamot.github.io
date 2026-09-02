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
        "title": "יב תשרי תש\"ו",
        "subtitle": "להבחורים קודם נסיעתם לשיקגו",
        "file": "pdfs/12_Tishrei.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-12",
        "hebDate": "י״ב תשרי",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל א' דחג הסוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Alef_Sukkos_5706.pdf",
        "pages": 9,
        "count": 1,
        "sortDate": "01-14",
        "hebDate": "י״ד תשרי",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "יום א' דחג הסוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Yom_Alef_Sukkos_5706.pdf",
        "pages": 6,
        "count": 1,
        "sortDate": "01-15",
        "hebDate": "ט״ו תשרי",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל ב' דחג הסוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/leil_2_sukot_5706.pdf",
        "pages": 5,
        "count": 1,
        "sortDate": "01-15",
        "hebDate": "ט״ו תשרי",
        "addedAt": "2026-08-24",
        "hasPage": true
      },
      {
        "title": "יום ב' דחג הסוכות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Yom_Beis_Sukkos_5706.pdf",
        "pages": 5,
        "count": 1,
        "sortDate": "01-16",
        "hebDate": "ט״ז תשרי",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל שמיני עצרת תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Shmini_Atzeres_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-22",
        "hebDate": "כ״ב תשרי",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל שמחת תורה תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Simchas_Torah_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-23",
        "hebDate": "כ״ג תשרי",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ש\"פ נח בסעודת הלילה",
        "subtitle": "",
        "file": "pdfs/Leil_Shabbos_Noach_5706.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "02-05",
        "hebDate": "ה׳ מרחשון",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל ש\"פ לך",
        "subtitle": "",
        "file": "pdfs/Leil_Shabbos_Lech_Lecha_5706.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "02-12",
        "hebDate": "י״ב מרחשון",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל ש\"פ וירא, כ' מר־חשון תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Shabbos_Vayeira_20_MarCheshvan_5706.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "02-20",
        "hebDate": "כ׳ מרחשון",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ש\"פ וישלח, י\"ט כסלו תש\"ו",
        "subtitle": "",
        "file": "pdfs/Shabbos_Vayishlach_19_Kislev_5706.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "03-19",
        "hebDate": "י״ט כסלו",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "כ' כסלו תש\"ו",
        "subtitle": "",
        "file": "pdfs/20_Kislev_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "03-20",
        "hebDate": "כ׳ כסלו",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל ש\"פ וישב, כ\"ו כסלו, שבת חנוכה תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Shabbos_Vayeishev_26_Kislev_Chanukah_5706.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "03-26",
        "hebDate": "כ״ו כסלו",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "פורים תש\"ו",
        "subtitle": "",
        "file": "pdfs/Purim_5706.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "06-14",
        "hebDate": "י״ד אדר",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "סדר הראשון של חג הפסח תש\"ו",
        "subtitle": "",
        "file": "pdfs/Seder_Rishon_Pesach_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "08-14",
        "hebDate": "י״ד ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "יום א' דחג הפסח תש\"ו",
        "subtitle": "",
        "file": "pdfs/Yom_Alef_Pesach_5706.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "08-15",
        "hebDate": "ט״ו ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "סדר השני של חג הפסח תש\"ו",
        "subtitle": "",
        "file": "pdfs/Seder_Sheni_Pesach_5706.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "08-16",
        "hebDate": "ט״ז ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "שבת חוה\"מ פסח תש\"ו",
        "subtitle": "",
        "file": "pdfs/Shabbos_Chol_HaMoed_Pesach_5706.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "08-20",
        "hebDate": "כ׳ ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ד' דחוה\"מ פסח תש\"ו",
        "subtitle": "בכינוס הר\"מ ומנהלי ישיבות תומכי־תמימים ואחי־תמימים אשר בערי השדה",
        "file": "pdfs/Daled_Chol_HaMoed_Pesach_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "08-20",
        "hebDate": "כ׳ ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל שביעי של פסח תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Shvii_shel_Pesach_5706.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "08-21",
        "hebDate": "כ״א ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל אחרון של פסח תש\"ו",
        "subtitle": "",
        "file": "pdfs/21_Leil_Acharon_shel_Pesach_5706.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "08-22",
        "hebDate": "כ״ב ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "כ\"ח ניסן תש\"ו",
        "subtitle": "",
        "file": "pdfs/28_Nissan_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "08-28",
        "hebDate": "כ״ח ניסן",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ליל א' דחג השבועות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Leil_Alef_Shavuos_5706.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "10-05",
        "hebDate": "ה׳ סיון",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "יום א' דחג השבועות תש\"ו",
        "subtitle": "",
        "file": "pdfs/24_Yom_Alef_Shavuos_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "10-06",
        "hebDate": "ו׳ סיון",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "יום ב' דחג השבועות תש\"ו",
        "subtitle": "",
        "file": "pdfs/Yom_Beis_Shavuos_5706.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "10-07",
        "hebDate": "ז׳ סיון",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "כ\"א סיון תש\"ו",
        "subtitle": "",
        "file": "pdfs/21_Sivan_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "10-21",
        "hebDate": "כ״א סיון",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "י\"ב תמוז תש\"ו",
        "subtitle": "",
        "file": "pdfs/12_Tammuz_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "11-12",
        "hebDate": "י״ב תמוז",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "עש\"ק פ' ראה, כ\"ו מנחם־אב תש\"ו",
        "subtitle": "",
        "file": "pdfs/Erev_Shabbos_ree_26_Menachem_Av_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "12-26",
        "hebDate": "כ״ו אב",
        "addedAt": "2026-08-02",
        "hasPage": true
      },
      {
        "title": "ה' אלול תש\"ו",
        "subtitle": "",
        "file": "pdfs/5_Elul_5706.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "13-05",
        "hebDate": "ה׳ אלול",
        "addedAt": "2026-08-02",
        "hasPage": true
      }
    ],
    "fullFile": "pdfs/Sefer_hasicos_5706.pdf"
  },
  {
    "year": "תש״ז",
    "note": "תורגם במלואו",
    "complete": true,
    "sichos": [
      {
        "title": "שיחות תשרי - תש\"ז",
        "subtitle": "השיחות שנאמרו במהלך חודש תשרי תש\"ז",
        "file": "pdfs/Tishrey_5707.pdf",
        "pages": 17,
        "count": 17,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-07-03",
        "hasPage": true,
        "hidden": true
      },
      {
        "title": "שיחות ערב ראש השנה תש\"ז",
        "subtitle": "",
        "file": "pdfs/erev_rosh_hashava_5707.pdf",
        "pages": 1,
        "count": 2,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "אחר תפילת ערבית בליל א' דראש השנה תש''ז",
        "subtitle": "מה שאמר לרמ''ש שיחי'",
        "file": "pdfs/leyl_1_rosh_hashana_5707_laramash.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "ליל שבת ומוצאי שבת תשובה תש''ז",
        "subtitle": "",
        "file": "pdfs/shbos_tshuva_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-05",
        "hebDate": "ה׳ תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "ליל ז' תשרי תש\"ז",
        "subtitle": "",
        "file": "pdfs/leyl_7_tishrey_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-07",
        "hebDate": "ז׳ תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "אור לערב יום הכיפורים תש\"ז",
        "subtitle": "",
        "file": "pdfs/or_lerev_yom_kipur_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-08",
        "hebDate": "ח׳ תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "ערב יום הכיפורים תש\"ז",
        "subtitle": "אחר חצות",
        "file": "pdfs/erev_yom_kipur_5707_achar_chazot.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-09",
        "hebDate": "ט׳ תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "ערב יום כיפור תש\"ז",
        "subtitle": "בבוקר",
        "file": "pdfs/erv_yom_kipur_5707_boker.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-09",
        "hebDate": "ט׳ תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "ליל ב' דחג הסוכות תש\"ז",
        "subtitle": "",
        "file": "pdfs/leyl_2_sukos_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-15",
        "hebDate": "ט״ו תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "ליל ש\"ק חול המועד סוכות תש\"ז",
        "subtitle": "",
        "file": "pdfs/leyl_sabos_kodesh_chol_hamoed_sukosh_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-17",
        "hebDate": "י״ז תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "יום שבת קודש חול המועד סוכות תש\"ז",
        "subtitle": "",
        "file": "pdfs/yom_shabos_chol_hamoed_sukos_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-17",
        "hebDate": "י״ז תשרי",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "ליל שמחת תורה תש\"ז",
        "subtitle": "בעת הקידוש קודם הקפות",
        "file": "pdfs/ley_simchat_tora_kodem_hakafot_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "01-21",
        "hebDate": "כ״א תשרי",
        "addedAt": "2026-08-07",
        "hasPage": true
      },
      {
        "title": "ליל שמחת תורה תש\"ז",
        "subtitle": "קודם אתה הראת",
        "file": "pdfs/leyk_simchas_tora_ata_horeso_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-22",
        "hebDate": "כ״ב תשרי",
        "addedAt": "2026-08-07",
        "hasPage": true
      },
      {
        "title": "יום שמחת תורה תש\"ז",
        "subtitle": "בעת ההקפות",
        "file": "pdfs/yom_simcha_tora_beet_hhkofos_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "01-23",
        "hebDate": "כ״ג תשרי",
        "addedAt": "2026-08-07",
        "hasPage": true
      },
      {
        "title": "יום שמחת תורה תש\"ז",
        "subtitle": "בעת הסעודה",
        "file": "pdfs/yom_simcha_tora_beet_haseoda_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-24",
        "hebDate": "כ״ד תשרי",
        "addedAt": "2026-08-07",
        "hasPage": true
      },
      {
        "title": "יום שבת קודש בראשית תש\"ז",
        "subtitle": "בסעודה",
        "file": "pdfs/shabos_breshit_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-25",
        "hebDate": "כ״ה תשרי",
        "addedAt": "2026-08-07",
        "hasPage": true
      },
      {
        "title": "משיחת ליל ש\"ק נח, בדר\"ח מר־חשון, תש\"ז",
        "subtitle": "",
        "file": "pdfs/Leyl_nuach_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "02-01",
        "hebDate": "א׳ מרחשון",
        "addedAt": "2026-07-05",
        "hasPage": true
      },
      {
        "title": "ש\"פ נח, בדר\"ח מר־חשון בסעודת היום תש\"ז",
        "subtitle": "",
        "file": "pdfs/Noach_Bayom_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "02-01",
        "hebDate": "א׳ מרחשון",
        "addedAt": "2026-07-03",
        "hasPage": true
      },
      {
        "title": "שיחת י\"ט כסלו תש\"ז",
        "subtitle": "",
        "file": "pdfs/19_kislev_5707.pdf",
        "pages": 8,
        "count": 1,
        "sortDate": "03-19",
        "hebDate": "י״ט כסלו",
        "addedAt": "2026-07-10",
        "hasPage": true
      },
      {
        "title": "שיחת פורים תש\"ז",
        "subtitle": "",
        "file": "pdfs/Purim_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "06-14",
        "hebDate": "י״ד אדר",
        "addedAt": "2026-07-06",
        "hasPage": true
      },
      {
        "title": "סדר הראשון של חג הפסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/Seder_reshon_chag_hpesach_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "08-14",
        "hebDate": "י״ד ניסן",
        "addedAt": "2026-07-16",
        "hasPage": true
      },
      {
        "title": "ליל ב' דחג הפסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/leyl_b_pesach_5707.pdf",
        "pages": 4,
        "count": 1,
        "sortDate": "08-15",
        "hebDate": "ט״ו ניסן",
        "addedAt": "2026-07-16",
        "hasPage": true
      },
      {
        "title": "ליל שביעי של פסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/shviei_shel_pesach_5707.pdf",
        "pages": 7,
        "count": 1,
        "sortDate": "08-21",
        "hebDate": "כ״א ניסן",
        "addedAt": "2026-07-16",
        "hasPage": true
      },
      {
        "title": "אחרון של פסח תש\"ז",
        "subtitle": "",
        "file": "pdfs/achron_shel_pesach_5707.pdf",
        "pages": 10,
        "count": 1,
        "sortDate": "08-21",
        "hebDate": "כ״א ניסן",
        "addedAt": "2026-07-17",
        "hasPage": true
      },
      {
        "title": "ל\"ג בעומר תש\"ז",
        "subtitle": "",
        "file": "pdfs/lag_baomer_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "09-18",
        "hebDate": "י״ח אייר",
        "addedAt": "2026-07-30",
        "hasPage": true
      },
      {
        "title": "שיחת ליל א' דחג השבועות תש\"ז",
        "subtitle": "",
        "file": "pdfs/Leyl_a_shavuot_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "10-06",
        "hebDate": "ו׳ סיון",
        "addedAt": "2026-07-24",
        "hasPage": true
      },
      {
        "title": "יום ב' דחג השבועות תש\"ז בסעודה",
        "subtitle": "",
        "file": "pdfs/yom_2_shavuot_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "10-07",
        "hebDate": "ז׳ סיון",
        "addedAt": "2026-08-06",
        "hasPage": true
      },
      {
        "title": "אור לט\"ו מנחם אב תש\"ז",
        "subtitle": "",
        "file": "pdfs/or_15_av_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "12-14",
        "hebDate": "י״ד אב",
        "addedAt": "2026-08-04",
        "hasPage": true
      },
      {
        "title": "ג' אלול תש\"ז",
        "subtitle": "",
        "file": "pdfs/3_elul_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "13-03",
        "hebDate": "ג׳ אלול",
        "addedAt": "2026-08-03",
        "hasPage": true
      },
      {
        "title": "יום ו' עש\"ק י\"ג אלול תש\"ז",
        "subtitle": "",
        "file": "pdfs/yom_6_erev_ahbis_13_elul_5707.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "13-13",
        "hebDate": "י״ג אלול",
        "addedAt": "2026-08-03",
        "hasPage": true
      },
      {
        "title": "ח\"י אלול תש\"ז",
        "subtitle": "ר\"ד",
        "file": "pdfs/rd_chy_elul_5707.pdf",
        "pages": 1,
        "count": 1,
        "sortDate": "13-18",
        "hebDate": "י״ח אלול",
        "addedAt": "2026-08-03",
        "hasPage": true
      },
      {
        "title": "ש\"פ נצבים תש\"ז",
        "subtitle": "רשימה",
        "file": "pdfs/shbes_nitsavim_5707.pdf",
        "pages": 3,
        "count": 1,
        "sortDate": "13-28",
        "hebDate": "כ״ח אלול",
        "addedAt": "2026-08-02",
        "hasPage": true
      }
    ],
    "fullFile": "pdfs/sefer_hasichos_5707.pdf"
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
        "addedAt": "2026-07-06",
        "hasPage": true
      }
    ]
  },
  {
    "year": "תש\"ח",
    "note": "בתהליך תרגום",
    "complete": false,
    "sichos": [
      {
        "title": "כ\"ט אלול תש\"ז, ערב ראש השנה תש\"ח",
        "subtitle": "אחרי התרת נדרים",
        "file": "pdfs/Erev_rosh_hashana_achary_hatarat_nedarim_5708.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-08-13",
        "hasPage": true
      },
      {
        "title": "סעודת ליל ב' דראש השנה תש\"ח",
        "subtitle": "",
        "file": "pdfs/seudat_leyl_2_rosh_hashana_5708.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-08-31",
        "hasPage": true
      },
      {
        "title": "ערב ראש השנה, והנהגות בסעודות ראש השנה",
        "subtitle": "",
        "file": "pdfs/erev_rosh_hashana_vhanhagot_5708.pdf",
        "pages": 1,
        "count": 3,
        "sortDate": "01-01",
        "hebDate": "א׳ תשרי",
        "addedAt": "2026-08-31",
        "hasPage": true
      },
      {
        "title": "שיחת ד' תשרי תש\"ח",
        "subtitle": "שיחה לפני קבוצת רבנים ועסקנים, בקשר ליובל להתייסדות תומכי־תמימים.",
        "file": "pdfs/4_tishrey_5708.pdf",
        "pages": 2,
        "count": 1,
        "sortDate": "01-04",
        "hebDate": "ד׳ תשרי",
        "addedAt": "2026-09-02",
        "hasPage": true
      },
      {
        "title": "שיחות ערב יום הכיפורים תש\"ח",
        "subtitle": "",
        "file": "pdfs/erev_yom_kipur_5708.pdf",
        "pages": 1,
        "count": 2,
        "sortDate": "01-09",
        "hebDate": "ט׳ תשרי",
        "addedAt": "2026-09-02",
        "hasPage": true
      }
    ]
  }
];
