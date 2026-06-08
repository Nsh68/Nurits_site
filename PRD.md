# PRD — אתר נורית שושני-הכל

**גרסה:** 1.1  
**עדכון אחרון:** 8 ביוני 2026  
**מקור דרישות:** `siteDescription`, `assets/nuritSH.docx`, משוב משתמש

---

## 1. סקירה

אתר תדמית בעברית (RTL) לנורית שושני-הכל — הרצאות בביולוגיה, הדרכות מורים, פיתוח אפליקציות וחומרי למידה. האתר בנוי כ-5 דפי HTML נפרדים עם עיצוב אחיד, רקעי ים/פרחים, ופונטים עבריים מותאמים.

**מטרות עסקיות:**
- הצגת מומחיות, שירותים ופרויקטים לקהל מורים, מוסדות ולקוחות פרטיים
- איסוף פניות דרך טופס יצירת קשר
- (אופציונלי) מענה בסיסי בצ'אט על בסיס תוכן האתר

---

## 2. קהל יעד

| קהל | צורך |
|-----|------|
| מורים וצוותי הוראה | הזמנת הרצאות והדרכות |
| מפתחי חומרי למידה | שיתוף פעולה פדגוגי |
| מוסדות / הוצאות לאור | פיתוח אפליקציות וחומרים דיגיטליים |
| קהל רחב | הרצאות מדעיות לדוגמה |

---

## 3. מבנה האתר (5 דפים)

| # | קובץ | כותרת ניווט | רקע | סטטוס |
|---|------|-------------|-----|--------|
| 1 | `index.html` | נורית שושני-הכל | `sea2.png` | ✅ הושלם |
| 2 | `lectures.html` | הרצאות לקהל הרחב | `lectures-flowers-sky.png` | ✅ הושלם |
| 3 | `training.html` | הדרכות מורים ומפתחי חומרי למידה | `sea2.png` | ✅ הושלם |
| 4 | `apps.html` | פיתוח אפליקציות | `sea2.png` | ✅ הושלם |
| 5 | `contact.html` | יצירת קשר | `sea1.png` | ✅ הושלם |

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
- **תגובות מורים:** נטענות מ-`assets/testimonials_snippet.html` דרך `training-testimonials.js`
- חלון תגובות נגלל, מיושר דינמית לתוכן (`fitTestimonialsPanel`)
- מיקום תמונה נשמר ב-`localStorage` (`nurit-site-image-move-training-v1`)

### 4.4 אפליקציות (`apps.html`)
- פריסת פאנלים (`apps-panel-list`) — עקבית עם עמודי הרצאות/הדרכות
- סעיפים: הזמנה מותאמת, אפליקציות שפותחו, חומרים לכנרת (עם קישורים חיצוניים), דמויות למידה
- תמונה: `assets/application.png` (סיבוב ומיקום ב-CSS)
- ~~עורך גרירה (`apps-layout.js`)~~ — הוסר; פריסה קבועה ב-CSS

### 4.5 יצירת קשר (`contact.html`)
- שדות: שם מלא, טלפון, דוא"ל, נושא (select), נושא נוסף, הודעה (עד 200 מילים)
- ולידציה בזמן אמת; כפתור שליחה מושבת עד מילוי חובה
- שמירה ב-Supabase (`contact_inquiries`) + התראת מייל (Edge Function)
- מסך תודה: `contact-thanks` עם הודעה בעברית
- נכס `assets/contact-thanks-clownfish.png` קיים — **עדיין לא מחובר ל-HTML**
- ווידג'ט צ'אט (`chat-widget.js`) — **רק בדף יצירת קשר**

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
| טופס | Supabase JS v2 | `contact.js`, `supabase-config.js` (מקומי, לא ב-git) |
| צ'אט | Supabase Edge Function + Gemini Flash | `chat-widget.js`, `supabase/functions/chat/` |
| מייל | Supabase Edge Function + Webhook | `supabase/functions/send-contact-email/` |
| DB | PostgreSQL (Supabase) | `supabase/schema.sql` |

**קבצים שלא נכנסים ל-git (`.gitignore`):**
- `supabase-config.js` — מפתחות Supabase

**תבנית:** `supabase-config.example.js`

---

## 7. פאזות יישום

| פאזה | תיאור | סטטוס |
|------|--------|--------|
| **1** | 5 דפי HTML, CSS, ניווט, תוכן, רקעים, פונטים | ✅ הושלם |
| **2** | טופס Supabase, ולידציה, מסך תודה, Edge Functions | ✅ קוד מוכן — דורש הגדרת Supabase בפרודקשן |
| **3** | צ'אט Gemini מבוסס תוכן האתר | ✅ קוד מוכן — דורש פריסת `chat` + `GEMINI_API_KEY` |
| **4** | GitHub Pages / פריסה ציבורית | ⏳ remote מוגדר; push טרם הושלם |

---

## 8. פערים מול המפרט המקורי (`siteDescription`)

| דרישה | מצב נוכחי |
|--------|-----------|
| שם פרטי + שם משפחה נפרדים בטופס | שדה "שם מלא" אחד — מפוצל ב-JS ל-insert |
| תמונת פרחים במסך תודה | טקסט בלבד; `contact-thanks-clownfish.png` לא מחובר |
| GPT-5 mini | מיושם כ-Gemini Flash ב-Edge Function (עלות/בטיחות) |
| צ'אט בכל הלשוניות | כרגע רק ב-`contact.html` |
| חודש ראשון חינם (אפליקציית עובדים זרים) | הוסר מהטקסט — מנוי 100 ₪/חודש בלבד |

---

## 9. מבנה תיקיות (עיקרי)

```
Nurits_site/
├── index.html, lectures.html, training.html, apps.html, contact.html
├── styles.css, script.js
├── contact.js, chat-widget.js, training-testimonials.js
├── apps-layout.js          # legacy — לא בשימוש ב-apps.html
├── image-move.js           # כלי עזר למיקום תמונות (הדרכות)
├── fonts/                  # GveretLevin, NoaShalev
├── assets/                 # תמונות, רקעים, testimonials_snippet.html
├── supabase/               # schema + Edge Functions
├── supabase-config.example.js
├── PRD.md                  # מסמך זה
├── PHASE1_IMPLEMENTATION.md
├── SESSION_SUMMARY.md
└── SUPABASE_SETUP.md
```

---

## 10. הרצה מקומית

```bash
# מתוך שורש הפרויקט (חובה ל-Supabase — לא file://)
python -m http.server 8080
# או Live Server ב-VS Code (מומלץ ב-.vscode/extensions.json)
```

פתחי: `http://localhost:8080/index.html`

---

## 11. Git ו-GitHub

- **Branch:** `main`
- **Commit אחרון:** `8d8d40b` — Redesign apps page with panel layout and improve training testimonials alignment
- **Remote:** `https://github.com/nsh68/Nurits_site.git` (repo טרם נוצר / push טרם הושלם)

---

## 12. סיכונים ואבטחה

- מפתחות Supabase ו-Gemini **רק** בצד שרת (Edge Functions secrets)
- RLS: גולשים יכולים INSERT בלבד ל-`contact_inquiries`
- אין קריאה ציבורית לפניות מהדפדפן
- הגבלות צ'אט: 800 תווים להודעה, 8 הודעות בהיסטוריה, 300 טוקנים לתשובה

---

## 13. צעדים הבאים (מומלץ)

1. [ ] יצירת repo ב-GitHub ו-`git push -u origin main`
2. [ ] חיבור `contact-thanks-clownfish.png` למסך התודה
3. [ ] פריסת Supabase + מילוי `supabase-config.js` מקומית
4. [ ] פריסת Edge Functions (`send-contact-email`, `chat`)
5. [ ] (אופציונלי) הוספת `chat-widget.js` לכל הדפים
6. [ ] (אופציונלי) GitHub Pages לאירוח סטטי
