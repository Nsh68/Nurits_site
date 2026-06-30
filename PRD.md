# PRD — אתר נורית שושני-הכל

**גרסה:** 1.4  
**עדכון אחרון:** 1 ביולי 2026 (Supabase מחדש, Vercel, צ'אט חסכוני, ולידציית טופס)  
**מקור דרישות:** `siteDescription`, `assets/nuritSH.docx`, משוב משתמש

---

## 1. סקירה

אתר תדמית בעברית (RTL) לנורית שושני-הכל — הרצאות בביולוגיה, הדרכות מורים, פיתוח אפליקציות וחומרי למידה. האתר בנוי כ-5 דפי HTML נפרדים עם עיצוב אחיד, רקעי ים/פרחים, ופונטים עבריים מותאמים.

**מטרות עסקיות:**
- הצגת מומחיות, שירותים ופרויקטים לקהל מורים, מוסדות ולקוחות פרטיים
- איסוף פניות דרך טופס יצירת קשר
- איסוף והצגת משובי משתתפים («ניסינו ורצינו לומר») — **מתוכנן, טרם מיושם**
- מענה בסיסי בצ'אט על בסיס תוכן האתר (קבצי הרצאות + מחירים — טעינה לפי צורך)

**סטטוס תשתית (יולי 2026):**
- פרויקט Supabase **הושהה** עקב חוסר שימוש — נדרש **שחזור / חיבור מחדש** (ראו [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) §א)
- **פריסה מתוכננת:** Vercel (במקום GitHub Pages) — ראו [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) §ב

---

## 2. קהל יעד

| קהל | צורך |
|-----|------|
| מורים וצוותי הוראה | הזמנת הרצאות והדרכות |
| מפתחי חומרי למידה | שיתוף פעולה פדגוגי |
| מוסדות / הוצאות לאור | פיתוח אפליקציות וחומרים דיגיטליים |
| קהל רחב | הרצאות מדעיות לדוגמה |

---

## 3. מבנה האתר

### 3.1 דפים קיימים (6)

| # | קובץ | כותרת ניווט | רקע | סטטוס |
|---|------|-------------|-----|--------|
| 1 | `index.html` | נורית שושני-הכל | `sea2.png` | ✅ הושלם |
| 2 | `lectures.html` | הרצאות לקהל הרחב | `lectures-flowers-sky.png` | ✅ הושלם |
| 3 | `training.html` | הדרכות מורים ומפתחי חומרי למידה | `sea2.png` | ✅ הושלם |
| 4 | `apps.html` | פיתוח אפליקציות | `sea2.png` | ✅ הושלם |
| 5 | `contact.html` | יצירת קשר | `sea1.png` | ✅ הושלם |
| 6 | `testimonials.html` | משובים | `sea2.png` | ✅ דף + JS — תלוי Supabase לנתונים |

### 3.2 דפים מתוכננים — משובים (1)

| # | קובץ | כותרת ניווט | תפקיד | סטטוס |
|---|------|-------------|--------|--------|
| 7 | `tried-to-say.html` | *(לא בתפריט)* | טופס שליחה — נפתח מ-QR בסוף מפגש | ⏳ מתוכנן |

מפרט מלא: [TESTIMONIALS.md](TESTIMONIALS.md)

כל הדפים כוללים: ניווט ראשי (תפריט המבורגר במובייל), skip-link, overlay עדין, ופוטר:  
`This site was built by Nurit Shoshani-Hechel`

---

## 4. דרישות פונקציונליות לפי דף

### 4.1 דף בית (`index.html`)
- תמונת פרופיל: `assets/Nurit.png`
- ביוגרפיה מטקסט `siteDescription` (ביולוגיה, ויצמן, כרם, LetsAI, ספר "דרך הביולוגיה")
- פריסת grid: תוכן + תמונה

### 4.2 הרצאות (`lectures.html`)
- רשימת הרצאות בפאנלים (`lecture-list`, `lectures-list-card`)
- תמונה: `assets/step_foward.png` + כיתוב צף: "לצעוד לעולמות חדשים"
- רקע ייעודי: `lectures-flowers-sky.png`

### 4.3 הדרכות (`training.html`)
- קהלי יעד, דוגמאות הרצאות/סדנאות, מומחיות אוריינית
- תמונה: `assets/skills_balls_transparent.png`
- **תגובות מורים (זמני):** נטענות מ-`assets/testimonials_snippet.html` דרך `training-testimonials.js`
- חלון תגובות נגלל, מיושר דינמית לתוכן (`fitTestimonialsPanel`)
- מיקום תמונה נשמר ב-`localStorage` (`nurit-site-image-move-training-v1`)
- **עתיד:** הפניה ל-`testimonials.html#teachers` — ראו [TESTIMONIALS.md](TESTIMONIALS.md)

### 4.4 אפליקציות (`apps.html`)
- פריסת פאנלים (`apps-panel-list`) — עקבית עם עמודי הרצאות/הדרכות
- סעיפים: הזמנה מותאמת, אפליקציות שפותחו, חומרים לכנרת (עם קישורים חיצוניים), דמויות למידה
- תמונה: `assets/application.png` (סיבוב ומיקום ב-CSS)
- ~~עורך גרירה (`apps-layout.js`)~~ — הוסר; פריסה קבועה ב-CSS

### 4.5 יצירת קשר (`contact.html`)
- שדות: שם מלא, טלפון, דוא"ל, נושא (select), נושא נוסף, הודעה (עד 200 מילים)
- ולידציה בזמן אמת; כפתור שליחה מושבת עד מילוי חובה
- **ולידציית דוא"ל:** הודעות שגיאה מתחת לשדה בזמן הקלדה (פורמט, תווים בעברית, @)
- **ולידציית טלפון:** מספר סלולרי ישראלי — **בדיקה והודעה רק בלחיצה על שליחה**
- שמירה ב-Supabase (`contact_inquiries`) + התראת מייל (Edge Function)
- מסך תודה: `contact-thanks` עם הודעה בעברית
- נכס `assets/contact-thanks-clownfish.png` קיים — **עדיין לא מחובר ל-HTML**
- ווידג'ט צ'אט (`chat-widget.js`) — **בכל הדפים**

### 4.6 משובים — תצוגה (`testimonials.html`) ✅ דף קיים — תלוי Supabase

- כותרת: **משובים** — **תצוגה בלבד** (אין טופס שליחה מהאתר)
- **3 אזורים** (מבנה מקביל ללשוניות האתר):
  1. הרצאות לקהל הרחב (`category=public-lecture`)
  2. הדרכות ומשובי מורים (`category=teachers`) — כולל תגית מקצוע / מגוון מקצועות
  3. פיתוח אפליקציות (`category=app-development`)
- מוצגים רק משובים עם **`consent_publish=true`** ו-**`status=published`** (לא `removed`)
- שם מוצג לפי בחירה: **שם מלא** או **«אנונימי»** — ללא דוא"ל
- **פרסום מיידי** אחרי שליחה (אם הסכימו לפרסום) — המשתתף יכול לראות את עצמו בדף
- **מודרציה:** נורית מקבלת מייל ו**מוחקת/מסתירה** (`status=removed`) מה שלא מתאים — בלי תור אישורים מראש
- **גלריית תמונות קהל** — רק כשיש תמונות (**בלי רווח ריק** אם אין)
- **אין** קישור «שלחו משוב» מהאתר — רק QR בסוף הפעילות
- מיגרציה עתידית של `testimonials_snippet.html` לאזור מורים

### 4.7 ניסינו ורצינו לומר — טופס (`tried-to-say.html`) ⏳ מתוכנן

**גישה:** QR בלבד בסוף פעילות — **לא** בתפריט ולא מקישורי האתר הציבורי.

**זרימה:** QR → טופס → הסכמות → שמירה ב-Supabase → מייל לנורית + מענה אוטומטי → **פרסום מיידי** (אם הסכימו).

**שאלות הסכמה (חובה):**

| שאלה | ערכים | השפעה |
|------|--------|--------|
| האם אתם מסכימים שהמשוב יעלה לאתר? | כן / לא | `consent_publish` — אם לא: נשמר ב-DB בלבד, לא באתר |
| פרסום השם | שם מלא / אנונימי | `display_name` — רק אם הסכימו לפרסום |

| שדה | חובה | הערות |
|-----|------|--------|
| שם מלא | כן | תמיד נשמר; מוצג באתר רק אם `consent_publish` + `display_name=full` |
| דוא"ל | כן | לא מפורסם; מענה אוטומטי + חזרה אליך |
| תאריך | כן | ברירת מחדל: היום |
| קטגוריה | כן | קהל רחב / מורים / פיתוח אפליקציות |
| סוג המפגש | תנאי | הרצאה / סדנה / הרצאה+סדנה |
| מורים ל: | תנאי | ציון המקצוע / מגוון מקצועות |
| איך היתה החוויה שלך? | כן | עד ~150 מילים; ראו §4.9 |
| תמונות מהמפגש | לא | ראו §4.8 |

**QR:** `tried-to-say.html?category=public-lecture` | `teachers` | `app-development`

**מיילים (`send-tried-to-say-email`):** התראה לנורית על **כל** משוב (כולל שלא לפרסום) + תודה אוטומטית למשתתף.

**טבלה:** `participant_feedback` — **נפרדת** מ-`contact_inquiries` (טופס יצירת קשר).

### 4.9 בדיקת שגיאות טקסט (משוב בלבד)

| רמה | יישום | סטטוס |
|-----|--------|--------|
| 1 | `spellcheck="true"` + `lang="he"` בשדה הטקסט | ✅ מתוכנן |
| 2 | הודעה לפני שליחה: «קראו שוב את המשוב לפני השליחה» | ✅ מתוכנן |
| 3 | תיקון אוטומטי ב-AI (Gemini וכו') | ❌ **לא** — מחוץ להיקף |

### 4.8 תמונות קהל ⏳ מתוכנן

**מטרה:** להציג בדף המשובים תמונות מהמפגש (קהל, אווירה, סדנה) — מחולקות לפי 3 הקטגוריות.

**שתי דרכי העלאה:**

| מי מעלה | איך | שימוש |
|---------|-----|--------|
| **נורית** (אחרי המפגש) | `upload-photos.html` — **PREVIEW** בדפדפן, ואז «אשרי ופרסמי» | Storage `approved/…` + `audience_photos` |
| **משתתף** (אופציונלי) | `tried-to-say.html` (מ-QR בלבד) — עד 2 תמונות | Storage + `audience_photos`; טקסט ב-`participant_feedback` |

**שדות / אחסון:**
- טבלה `audience_photos`: `category`, `event_date`, `storage_path`, `caption` (אופציונלי), `status`, `source` (`organizer` | `participant`)
- Supabase Storage: bucket `audience-photos`
- קישור למשוב בודד (אופציונלי): `testimonial_id`

**פרטיות ואישור:**
- תמונה **לא** מופיעה באתר לפני `approved`
- משתתף שמעלה תמונה: צ'קבוקס חובה — «אני מאשר/ת פרסום התמונה באתר»
- נורית בודקת לפני אישור (פנים, זיהוי, איכות)

**תצוגה ב-`testimonials.html`:**
- גלריה (רשת / קרוסלה) בראש כל אזור, לפני רשימת המשובים
- `loading="lazy"`, `alt` מתאים, לחיצה להגדלה (lightbox — אופציונלי)
- מגבלות: עד 5MB לתמונה; jpg, png, webp

מפרט מלא: [TESTIMONIALS.md](TESTIMONIALS.md) §12

---

## 5. עיצוב ומיתוג

| אלמנט | ערך |
|--------|-----|
| שפה / כיוון | עברית, `dir="rtl"` |
| פונט כותרות | Gveret Levin — `fonts/GveretLevin.woff2` |
| פונט גוף | Noa Shalev — `fonts/NoaShalev.woff2` |
| רקעים | `assets/backgrounds/sea1.png`, `sea2.png`, `flowers.png`, `lectures-flowers-sky.png` |
| פאנלים | רקע לבן שקוף ~92%, `border-radius`, `box-shadow`, `backdrop-filter` |
| נגישות | skip-link, `aria-label`, `aria-expanded` בתפריט, `role="alert"` בשגיאות |

---

## 6. טכנולוגיה

| שכבה | טכנולוגיה | קבצים עיקריים |
|------|-----------|----------------|
| פרונט | HTML5, CSS3, Vanilla JS | `*.html`, `styles.css`, `script.js` |
| אירוח | **Vercel** (סטטי) | `vercel.json`, `scripts/generate-supabase-config.mjs` |
| טופס | Supabase JS v2 | `contact.js`, `supabase-config.js` (מקומי / נוצר ב-build) |
| צ'אט | Supabase Edge Function + Gemini Flash | `chat-widget.js`, `supabase/functions/chat/` |
| מייל | Supabase Edge Function + Webhook | `send-contact-email/`, `send-tried-to-say-email/` (מתוכנן) |
| DB | PostgreSQL (Supabase) | `contact_inquiries`, `participant_feedback`, `audience_photos` (מתוכנן) |
| אחסון | Supabase Storage | bucket `audience-photos` (מתוכנן) |

### 6.1 צ'אט — קבצי ידע (`assets/`)

| קובץ | נושא |
|------|------|
| `microbiome.lecture.txt` | מיקרוביום, חיידקים, וירוסים |
| `epigenetics.lecture.txt` | אפיגנטיקה |
| `basic genetic lecture.txt` | גנטיקה בסיסית |
| `Genetic engineering lecture.txt` | הנדסה גנטית |
| `Pricing.txt` | מחירי הרצאות וסדנאות |

**אסטרטגיית עלות (יולי 2026):**
1. **Routing** — `match()` לפי מילות מפתח; קובץ נטען רק אם השאלה רלוונטית
2. **Lazy load** — `fetch` מהדפדפן; cache מקומי (`loadedAssets`)
3. **שליחה חד-פעמית ל-Gemini** — `sentContextPaths`: תוכן קובץ נשלח **רק בהודעה הראשונה** על אותו נושא בשיחה; המשך שיחה מסתמך על היסטוריה (עד 8 הודעות)
4. **מגבלות** — עד 12,000 תווים הקשר הרצאה; 800 תווים להודעת משתמש; 300 טוקנים לתשובה

**קבצים שלא נכנסים ל-git (`.gitignore`):**
- `supabase-config.js` — מפתחות Supabase (מקומי או נוצר ב-Vercel build)

**תבנית:** `supabase-config.example.js`  
**מדריכים:** [SUPABASE_SETUP.md](SUPABASE_SETUP.md), [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)

---

## 7. פאזות יישום

| פאזה | תיאור | סטטוס |
|------|--------|--------|
| **1** | 6 דפי HTML, CSS, ניווט, תוכן, רקעים, פונטים | ✅ הושלם |
| **2** | טופס Supabase, ולידציה, מסך תודה, Edge Functions | ✅ קוד מוכן — **נדרש שחזור Supabase** |
| **3** | צ'אט Gemini + קבצי הרצאות לפי צורך + שליחה חד-פעמית לנושא | ✅ קוד מוכן — **נדרש שחזור Supabase + GEMINI_API_KEY** |
| **4** | **פריסה ב-Vercel** + env vars | ⏳ מוכן לפריסה — ראו [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) |
| **5** | משובים + תמונות קהל: טופס QR, Storage, מיילים | ⏳ חלקי — `testimonials.html` קיים; `tried-to-say.html` מתוכנן |

---

## 8. פערים מול המפרט המקורי (`siteDescription`)

| דרישה | מצב נוכחי |
|--------|-----------|
| שם פרטי + שם משפחה נפרדים בטופס | שדה "שם מלא" אחד — מפוצל ב-JS ל-insert |
| תמונת פרחים במסך תודה | טקסט בלבד; `contact-thanks-clownfish.png` לא מחובר |
| GPT-5 mini | מיושם כ-Gemini Flash ב-Edge Function (עלות/בטיחות) |
| משובים דינמיים | תגובות סטטיות ב-`training.html`; דף משובים מתוכנן |
| חודש ראשון חינם (אפליקציית עובדים זרים) | הוסר מהטקסט — מנוי 100 ₪/חודש בלבד |

---

## 9. מבנה תיקיות (עיקרי)

```
Nurits_site/
├── index.html, lectures.html, training.html, apps.html, contact.html
├── testimonials.html                         # תצוגת משובים
├── tried-to-say.html                         # מתוכנן — טופס QR
├── styles.css, script.js
├── contact.js, chat-widget.js, training-testimonials.js
├── testimonials.js, tried-to-say.js
├── vercel.json                               # פריסה ב-Vercel
├── scripts/generate-supabase-config.mjs      # build: supabase-config.js
├── fonts/                                    # GveretLevin, NoaShalev
├── assets/                                   # תמונות, רקעים, קבצי הרצאות *.txt
├── supabase/                                 # schema + Edge Functions
├── supabase-config.example.js
├── PRD.md                                    # מסמך זה
├── VERCEL_DEPLOY.md                          # Supabase מחדש + Vercel
├── TESTIMONIALS.md
├── SUPABASE_SETUP.md
└── README.md
```

---

## 10. הרצה מקומית ופריסה

### מקומי

```bash
# מתוך שורש הפרויקט (חובה ל-Supabase — לא file://)
npm start
# או: python -m http.server 8080
```

פתחי: `http://localhost:8080/index.html`

לפני טופס/צ'אט: העתיקי `supabase-config.example.js` → `supabase-config.js` ומלאי מפתחות.

### פרודקשן (Vercel)

1. שחזור Supabase — [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) §א  
2. חיבור repo ל-Vercel + env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`  
3. Deploy — [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) §ב

---

## 11. Git ו-GitHub

- **Branch פעיל:** `cursor/chat-intent-routing-and-persistence` (מיזוג ל-`main` לפני Vercel מומלץ)
- **Remote:** `https://github.com/nsh68/Nurits_site.git`
- **Commit אחרון (ענף):** `f59f6f3` — Load lecture assets on demand in chat and reset session on close

---

## 12. סיכונים ואבטחה

ראו **[SECURITY.md](SECURITY.md)** — מפתחות, rotation, rate limiting, תקציב 150 ₪.

- מפתחות Supabase ו-Gemini **רק** בצד שרת (Edge Functions secrets) + anon ב-Vercel env
- RLS: גולשים יכולים INSERT בלבד ל-`contact_inquiries` ו-`participant_feedback` (מתוכנן)
- אין קריאה ציבורית לפניות / דוא"ל משתתפים מהדפדפן
- משובים ציבוריים: רק `consent_publish=true` + `status=published`, ללא `email`
- מחיקה/הסתרה: נורית בלבד (Dashboard / דף ניהול — `status=removed`)
- תמונות: bucket עם INSERT ל-anon; קריאה ציבורית רק לנתיבים/רשומות `approved`
- הגבלות צ'אט: 800 תווים להודעה, 8 הודעות בהיסטוריה, 300 טוקנים לתשובה
- קבצי הרצאות: routing + lazy load; תוכן נשלח ל-Gemini **פעם אחת לנושא** לכל שיחה
- **Supabase:** פרויקט לא פעיל עלול **להיות מושהה** — שחזור או פעילות תקופתית (טופס/צ'אט)

---

## 13. צעדים הבאים (יולי 2026)

### Supabase — חיבור מחדש
1. [ ] שחזור / יצירת פרויקט ב-[Supabase Dashboard](https://supabase.com/dashboard)
2. [ ] הרצת `supabase/schema.sql`
3. [ ] פריסת Edge Functions: `chat`, `send-contact-email`
4. [ ] הגדרת סודות: `GEMINI_API_KEY`, webhook מייל
5. [ ] עדכון `supabase-config.js` מקומית + בדיקת טופס וצ'אט

### Vercel — פרסום האתר
6. [ ] מיזוג ל-`main` ו-`git push`
7. [ ] Import ב-Vercel מ-GitHub
8. [ ] משתני סביבה: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
9. [ ] Deploy + בדיקת `contact.html` וצ'אט בכתובת הפרודקשן

### שיפורים
10. [ ] חיבור `contact-thanks-clownfish.png` למסך התודה
11. [ ] השלמת `tried-to-say.html` + QR ([TESTIMONIALS.md](TESTIMONIALS.md))
12. [ ] בדיקה חודשית (טופס/צ'אט) כדי למנוע השהיית Supabase
