# יישום פאזות — אתר Nurits_site

**עדכון:** 8 ביוני 2026

---

## סטטוס כללי

| פאזה | תיאור | סטטוס |
|------|--------|--------|
| 1 | אתר סטטי — 5 דפים, עיצוב, תוכן | ✅ **הושלם** |
| 2 | טופס Supabase + מסך תודה | ✅ קוד מוכן (דורש הגדרה) |
| 3 | צ'אט Gemini | ✅ קוד מוכן (דורש פריסה) |
| 4 | GitHub / אירוח | ⏳ commit מקומי; push ממתין |

---

## פאזה 1 — אתר סטטי ✅

### קבצים שנוצרו
- `index.html`, `lectures.html`, `training.html`, `apps.html`, `contact.html`
- `styles.css`, `script.js`
- `training-testimonials.js` — תגובות מורים נגללות
- `fonts/GveretLevin.woff2`, `fonts/NoaShalev.woff2`

### החלטות עיצוב

| אלמנט | בחירה |
|--------|--------|
| דף בית / הדרכות / אפליקציות | `assets/backgrounds/sea2.png` |
| יצירת קשר | `assets/backgrounds/sea1.png` |
| הרצאות | `assets/backgrounds/lectures-flowers-sky.png` |
| תמונת פרופיל (בית) | `assets/Nurit.png` |
| הרצאות — ויזואל | `assets/step_foward.png` + "לצעוד לעולמות חדשים" |
| הדרכות — ויזואל | `assets/skills_balls_transparent.png` |
| אפליקציות — ויזואל | `assets/application.png` |
| פונטים | Gveret Levin (כותרות), Noa Shalev (גוף) |

### פריסות עמוד (עדכון יוני 2026)
- **הרצאות / הדרכות / אפליקציות:** פאנלים לבנים שקופים (`*-panel-list`, `*-page__title`)
- **הדרכות:** `fitTestimonialsPanel()` — יישור דינמי של חלון התגובות
- **אפליקציות:** הוסר עורך הגרירה (`apps-layout.js` לא נטען מ-`apps.html`)

### האם קשה לשנות אחר כך?

**לא.** זו פאזה סטטית (HTML + CSS):
- **טקסט** — עריכה בקובץ ה-HTML הרלוונטי
- **צבעים / רקעים** — `styles.css` (משתני CSS בראש הקובץ)
- **תמונות** — החלפה ב-`assets/` או `assets/backgrounds/`
- **תגובות הדרכות** — `assets/testimonials_snippet.html`

---

## פאזה 2 — Supabase ⏳ (קוד מוכן)

- `contact.js` — ולידציה, מונה מילים, INSERT ל-`contact_inquiries`
- `supabase/schema.sql` — טבלה + RLS
- `supabase/functions/send-contact-email/` — התראת מייל דרך Webhook
- `supabase-config.example.js` → `supabase-config.js` (מקומי, ב-`.gitignore`)

**הגדרה:** ראי [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

**פתוח:** חיבור `assets/contact-thanks-clownfish.png` למסך התודה

---

## פאזה 3 — צ'אט ⏳ (קוד מוכן)

- `chat-widget.js` — ווידג'ט בדף יצירת קשר
- `supabase/functions/chat/index.ts` — Gemini Flash, קונטקסט מהאתר

**הגדרה:** ראי [SUPABASE_SETUP.md](SUPABASE_SETUP.md) §6

---

## תצוגה מקומית

```bash
python -m http.server 8080
```

או **Live Server** (מומלץ ב-`.vscode/extensions.json`).

---

## צעדים הבאים

1. [ ] Push ל-GitHub (`nsh68/Nurits_site`)
2. [ ] הגדרת Supabase בפרודקשן
3. [ ] תמונת תודה בטופס יצירת קשר
4. [ ] (אופציונלי) צ'אט בכל הדפים
5. [ ] (אופציונלי) GitHub Pages
