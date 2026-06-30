# פריסה ב-Vercel + חיבור מחדש ל-Supabase

**עדכון:** 1 ביולי 2026  
משלים את [PRD.md](PRD.md) ו-[SUPABASE_SETUP.md](SUPABASE_SETUP.md).

---

## חלק א — חיבור מחדש ל-Supabase (פרויקט שהושהה)

Supabase משהה פרויקטים ללא פעילות. כדי להפעיל מחדש:

### 1. שחזור הפרויקט

1. היכנסי ל-[https://supabase.com/dashboard](https://supabase.com/dashboard)
2. בחרי את הפרויקט
3. אם מופיע **Paused** — לחצי **Restore project** (ייקח כמה דקות)
4. אם הפרויקט **נמחק** — צרי פרויקט חדש ושמרי URL + anon key חדשים

### 2. בסיס נתונים

1. **SQL Editor** → New query
2. הריצי את `supabase/schema.sql` (Run)
3. ודאי ב-**Table Editor** שקיימת `contact_inquiries`

### 3. Edge Functions + סודות

מהטרמינל, מתוך שורש הפרויקט:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-contact-email
npx supabase functions deploy chat
```

הגדרת סודות (חובה לצ'אט; מייל — לפי webhook):

```bash
npx supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
npx supabase secrets set GEMINI_MODEL="gemini-1.5-flash"
npx supabase secrets set CONTACT_EMAIL_WEBHOOK_URL="https://..."
npx supabase secrets set CONTACT_EMAIL_TO="Nurithec@gmail.com"
```

### 4. הגדרה מקומית

```bash
cp supabase-config.example.js supabase-config.js
```

מלאי `url` ו-`anonKey` מ-**Project Settings → API**.

### 5. בדיקה מקומית

```bash
npm start
# או: python -m http.server 8080
```

- `http://localhost:8080/contact.html` — שליחת טופס
- כל דף — ווידג'ט «שאלי אותי»

---

## חלק ב — פריסה ב-Vercel

האתר הוא **סטטי** (HTML/CSS/JS). Vercel מארח את הקבצים; Supabase נשאר בנפרד (DB + Edge Functions).

### 1. דחיפה ל-GitHub

```bash
git push origin main
```

(או merge של הענף הנוכחי ל-`main` לפני push.)

### 2. חיבור Vercel

1. [https://vercel.com](https://vercel.com) → **Add New Project**
2. Import מ-GitHub: `Nurits_site`
3. **Framework Preset:** Other
4. **Build Command:** `npm run build` (מוגדר ב-`vercel.json`)
5. **Output Directory:** `.` (שורש הפרויקט)

### 3. משתני סביבה ב-Vercel

ב-**Project Settings → Environment Variables** (Production):

| שם | ערך |
|----|-----|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | מפתח anon public |

בכל deploy, `npm run build` יוצר `supabase-config.js` מהערכים האלה.

> **אבטחה:** anon key מיועד לדפדפן — זה תקין. **לא** לשים `service_role` או `GEMINI_API_KEY` ב-Vercel.

### 4. Deploy

לחצי **Deploy**. כתובת לדוגמה: `https://nurits-site.vercel.app`

### 5. אחרי הפריסה

- [ ] טופס יצירת קשר שולח ל-`contact_inquiries`
- [ ] צ'אט עונה (Edge Function `chat` + `GEMINI_API_KEY`)
- [ ] (אופציונלי) דומיין מותאם ב-Vercel → **Domains**

---

## קבצים רלוונטיים

| קובץ | תפקיד |
|------|--------|
| `vercel.json` | הגדרות build ו-output |
| `scripts/generate-supabase-config.mjs` | יוצר `supabase-config.js` מ-env |
| `supabase-config.example.js` | תבנית למקומי |
| `supabase-config.js` | מקומי / נוצר ב-build — **לא ב-git** |

---

## עלויות ושימוש (Supabase)

כדי שלא יושהה שוב:

- Supabase Free: פרויקט פעיל דורש **פעילות** — טופס / צ'אט / כניסה ל-Dashboard
- מומלץ: בדיקה חודשית של טופס + צ'אט אחרי פריסה
- צ'אט: קבצי הרצאות נטענים **לפי צורך** ונשלחים ל-Gemini **פעם אחת לנושא** בשיחה (ראו PRD §6.1)
