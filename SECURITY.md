# אבטחה, מפתחות ותקציב — Nurits_site

**עדכון:** 1 ביולי 2026

## מפתחות — איפה שמורים

| מפתח | איפה | ב-git? |
|------|------|--------|
| Supabase **anon** | `supabase-config.js` (מקומי) + Vercel env | **לא** |
| Supabase **service_role** | Supabase בלבד | **לא** |
| Gemini / Google API | Supabase Secrets (`GOOGLE_API_KEY`) | **לא** |
| Webhook מייל | Supabase Secrets | **לא** |

## דליפה ידועה (יוני 2026)

מפתח **anon** הועלה ל-GitHub ב-commit `ac6ec2a` (10 ביוני). הוסר מהקוד, אך **נשאר בהיסטוריית Git**.

### פעולות חובה

1. **Rotate anon key:** Supabase Dashboard → Project Settings → API → **Generate new anon key**
2. עדכון ב-Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
3. עדכון מקומי: `supabase-config.js`
4. Redeploy ב-Vercel

> **אל תסובבי** את JWT Secret — זה ישבור את כל המפתחות. רק anon key חדש.

## הגנה מפני commit חוזר

```bash
git config core.hooksPath .githooks
```

ה-hook `.githooks/pre-commit` חוסם מפתחות ו-`supabase-config.js`.

בדיקה ידנית:

```bash
sh scripts/check-secrets.sh
```

## הגבלת עלות (~150 ₪/חודש)

### 1. Google / Gemini (חובה)

1. [Google AI Studio](https://aistudio.google.com) או Google Cloud Billing
2. Budget **150 ₪/חודש** + התראות ב-50%, 80%, 100%
3. Hard cap אם זמין

### 2. Rate limiting בצ'אט (מיושם)

Secrets ב-Supabase (ברירת מחדל):

| Secret | ברירת מחדל | תיאור |
|--------|------------|--------|
| `CHAT_ENABLED` | `true` | `false` — כיבוי צ'אט מיידי |
| `CHAT_RATE_LIMIT_HOUR` | `25` | מקסימום בקשות ל-IP לשעה |
| `CHAT_RATE_LIMIT_DAY` | `80` | מקסימום בקשות ל-IP ליום |

טבלה: `chat_rate_limits` (רק service role).

### 3. חיסכון בקוד (מיושם)

- תשובות קבועות בלי Gemini לשאלות כלליות
- קבצי הרצאות — lazy load + **שליחה פעם אחת לנושא**
- `maxOutputTokens`: 300

### 4. Supabase

- Free tier — שמרי פעילות חודשית (טופס/צ'אט)
- אל תשימי **service_role** בדפדפן או ב-Vercel

## מפסק חירום

```bash
npx supabase secrets set CHAT_ENABLED=false --project-ref srnehuymirirjmvrbqeb
```

## קישורים

- [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
