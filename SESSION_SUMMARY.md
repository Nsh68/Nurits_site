# סיכום שיחה — אתר Nurit Shoshani-Heche
**תאריך:** 25–27 במאי 2026  
**מטרה:** אתר נורית שושני-הכל — 5 דפי HTML (לשוניות) לפי `siteDescription`

## עדכון חשוב (משוב משתמש)
- **לא** דף יחיד — כל לשונית = קובץ HTML נפרד.
- **תוכן:** במדויק מ-`siteDescription` (ביולוגיה, הרצאות, הדרכות, אפליקציות) — לא תוכן שהומצא על מתמטיקה/AI.
- **פאזה 1 בלבד:** 5 דפים סטטיים; **ללא** Supabase ו**ללא** בוט GPT (פאזה 3).

---

## מה עשינו בשיחה

### 1. מיפוי קבצים
- נמצאו נכסים (תמונות + Word) שהועלו לפרויקט.
- תמונות ווטסאפ (`WhatsApp Image 2026-05-24...`) נבדקו — **שייכות לפרויקט**: אותה אישה, אותו לוק (משקפיים, ז'קט כחול, רקע ירוק/רימון) כמו `Nurit.png`.

### 2. ארגון מחדש (הושלם)

| סוג | מיקום |
|-----|--------|
| **פונטים (משותפים)** | `C:\Users\Nurit SH\.cursor\fonts\` |
| **נכסי פרויקט** | `C:\Users\Nurit SH\.cursor\projects\Nurits_site\assets\` *(לאחר שינוי שם התיקייה)* |
| **ZIP מקור (פונטים)** | `Nurits_site\` (לא נמחקו) |

#### פונטים שחולצו
- **גברת לוין** — `gveret-levin-alefalefalef/` (woff, woff2, otf + רישיון)
- **נועה שלב** — `noa-shalev-alefalefalef/` (woff, woff2, otf + רישיון)

#### נכסים ב-`assets/` *(לאחר שינוי שם התיקייה)*
| קובץ | שימוש מתוכנן |
|------|----------------|
| `Nurit.png` | Hero / תמונת ראשית |
| `Nurit1.jpeg`, `Nurit2.jpeg` | פורטרטים נוספים |
| `WhatsApp Image...` (×2) | אלטרנטיבות לפרופיל |
| `skills_balls.png` | גרפיקת כישורים (רקע כחול) |
| `skills_balls_transparent.png` | אותה גרפיקה, רקע שקוף — **מועדף לאתר** |
| `step_foward.png`, `step_foward2.png` | איור "צעד קדימה" |
| `nuritSH.docx` | תוכן: קורות חיים, ניסיון, פרויקטים |
| `siteDescription.docx` | מפרט האתר, עיצוב, טכנולוגיות, משוב מווטסאפ |

**הערה:** עותק מקורי נשאר ב-`c-Users-Nurit-SH\Assest\` (לא נמחק).

---

## תוכן מהמסמכים (לפיתוח מחר)

### `nuritSH.docx` — עיקרי
- **נורית שושני-הכה** — מורה למתמטיקה, מפתחת VIBE CODING ב-LetsAI.
- קורס **"צעד לעתיד הדיגיטלי"** — AI, יצירתיות, מתמטיקה, מדעים.
- ניסיון: הוראה, פיתוח תוכן דיגיטלי, פרויקטים (כולל QR Code Creator ועוד).
- דגש על שילוב AI בחינוך.

### `siteDescription.docx` — מפרט האתר
- **שפה/כיוון:** עברית, RTL.
- **פונטים:** כותרות — Gveret Levin; גוף טקסט — Noa Shalev.
- **טכנולוגיות מתוכננות:** HTML/CSS/JS, Supabase, אינטגרציה עם Gemini / GPT-5 mini (לפי המפרט).
- **מבנה מוצע:**
  - Hero עם `Nurit.png`
  - סקשן "צעד לעתיד הדיגיטלי" עם `step_foward`
  - סקשן כישורים עם `skills_balls_transparent`
  - תוכן מ-`nuritSH.docx` (אודות, ניסיון, פרויקטים)
  - יצירת קשר / פוטר
- **Footer:** "This site was built by Nurit Shoshani-Heche"
- **הערה:** קובץ המפרט כולל גם הודעות ווטסאפ מקבוצה — **לא להעלות לאתר**; רק לתכנון/רעיונות.

---

## מבנה תיקיות נוכחי

```
C:\Users\Nurit SH\.cursor\
├── fonts\
│   ├── gveret-levin-alefalefalef\
│   │   ├── web\  (*.woff, *.woff2)
│   │   ├── otf\
│   │   └── free-font-license.pdf
│   └── noa-shalev-alefalefalef\
│       ├── web\
│       ├── otf\
│       └── license.pdf
└── projects\Nurits_site\
    ├── assets\          ← כל הנכסים (11 קבצים) *(לאחר שינוי שם התיקייה)*
    ├── gveret-levin-alefalefalef.zip
    ├── noa-shalev-alefalefalef.zip
    └── SESSION_SUMMARY.md   ← קובץ זה
```

---

## רקעים (נוספו)

| קובץ | שימוש |
|------|--------|
| `assets/backgrounds/sea2.png` | **Hero** — חלק עליון (מומלץ) |
| `assets/backgrounds/sea1.png` | סקשן משני (אופציונלי) |
| `assets/backgrounds/flowers.png` | **יצירת קשר** / רך ואישי |

## צעדים הבאים

0. [x] **שינוי שם תיקייה**: `assest` → `assets`
0b. [x] רקעים ב-`assets/backgrounds/`
1. [x] **פאזה 1 רב-דפים:** `index.html`, `lectures.html`, `training.html`, `apps.html`, `contact.html` + `styles.css` + `script.js`
2. [ ] `@font-face` — לקשר לפונטים מ-`../../fonts/` (נתיב יחסי) או להעתיק web fonts לתיקיית `fonts/` מקומית בפרויקט
3. [ ] לחלץ טקסט מלא מ-`nuritSH.docx` ו-`siteDescription.docx` (ללא הודעות ווטסאפ) לתוכן HTML
4. [ ] עיצוב RTL, פלטת צבעים מהתמונות (כחול-טורקיז, ירוק)
5. [ ] בחירת תמונת Hero: `Nurit.png` (מומלץ) או אחת מווטסאפ
6. [ ] (אופציונלי) Supabase + טופס יצירת קשר — לפי המפרט

---

## שאלות פתוחות ליום המשך

- האם לבנות אתר סטטי בלבד או גם Supabase מההתחלה?
- האם למחוק את קבצי ה-ZIP אחרי חילוץ הפונטים?
- ✅ שינוי שם תיקייה `assest` → `assets` אושר

---

## איך להמשיך שיחה מחר

פתחי את הפרויקט `Nurits_site` ב-Cursor וכתבי למשל:
> "קרא את SESSION_SUMMARY.md והמשך לבניית האתר"

או:
> "בנה את index.html לפי siteDescription.docx"
