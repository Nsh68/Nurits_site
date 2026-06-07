# חיבור טופס יצירת קשר ל-Supabase

## 1. יצירת פרויקט ב-Supabase

1. היכנסי ל-[https://supabase.com](https://supabase.com) וצרי פרויקט חדש.
2. שמרי את **Project URL** ו-**anon public** key (תחת Project Settings → API).

## 2. יצירת הטבלה

1. ב-Supabase: **SQL Editor** → New query.
2. העתיקי את כל התוכן מ-`supabase/schema.sql` והריצי (Run).

## 3. הגדרת האתר

1. העתיקי `supabase-config.example.js` ל-`supabase-config.js`.
2. מלאי את `url` ו-`anonKey` (מפתח **anon public** בלבד — לא את service_role).

```javascript
window.SUPABASE_CONFIG = {
  url: "https://xxxxx.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
};
```

## 4. שליחת התראה למייל

הטופס ממשיך לשמור פניות בטבלת `contact_inquiries`. אחרי שמירה מוצלחת, הדפדפן קורא ל-Supabase Edge Function בשם `send-contact-email`. הפונקציה נמצאת ב-`supabase/functions/send-contact-email/index.ts` ושומרת סודות בצד השרת בלבד.

כדי ששליחת המייל תעבוד בפועל צריך לחבר ספק מייל/אוטומציה שמקבל Webhook ושולח הודעה לכתובת `Nurithec@gmail.com`:

1. צרי Webhook אצל ספק מייל או כלי אוטומציה מאובטח (למשל Resend/SendGrid/Mailgun דרך endpoint משלך, Make, Zapier וכדומה).
2. הגדירי ב-Supabase את הסודות של הפונקציה:

```bash
supabase secrets set CONTACT_EMAIL_WEBHOOK_URL="https://example.com/your-email-webhook"
supabase secrets set CONTACT_EMAIL_WEBHOOK_TOKEN="optional-secret-token"
supabase secrets set CONTACT_EMAIL_TO="Nurithec@gmail.com"
```

3. פרסי את הפונקציה:

```bash
supabase functions deploy send-contact-email
```

ה-Webhook יקבל `POST` עם המבנה הבא:

```json
{
  "to": "Nurithec@gmail.com",
  "subject": "פנייה חדשה מהאתר - ...",
  "text": "כל פרטי הפנייה כטקסט",
  "html": "כל פרטי הפנייה ב-HTML",
  "fields": {
    "first_name": "...",
    "last_name": "...",
    "phone": "...",
    "email": "...",
    "topic": "...",
    "topic_open": "...",
    "message": "...",
    "word_count": 0
  }
}
```

אין לשים מפתחות SMTP/API בתוך `contact.js` או `supabase-config.js`.

## 5. בדיקה

1. הריצי את האתר דרך שרת מקומי (לא `file://`):  
   `python -m http.server 8080`
2. פתחי `http://localhost:8080/contact.html`, מלאי טופס ושלחי.
3. ב-Supabase: **Table Editor** → `contact_inquiries` — אמורה להופיע שורה חדשה.
4. אחרי פריסת הפונקציה והגדרת הסודות, בדקי שה-Webhook קיבל קריאה ושהמייל הגיע ל-`Nurithec@gmail.com`.

## 6. צ'אט בסיסי עם Gemini Flash

באתר נוסף ווידג'ט צ'אט קטן שמופיע בכל העמודים. קוד הווידג'ט נמצא ב-`chat-widget.js`. הדפדפן קורא ל-Supabase Edge Function בשם `chat`, והפונקציה קוראת ל-Gemini Flash בצד השרת בלבד. אין לשים מפתח Gemini בקבצי האתר.

הפונקציה נמצאת ב-`supabase/functions/chat/index.ts` וכוללת קונטקסט עברי קצר מתוך תכני האתר. הבוט מונחה לענות רק לפי המידע הזה. אם המידע אינו מופיע באתר, עליו לענות:  
`איני יודעת לענות על כך מתוך המידע הקיים באתר. נשמח לחזור אליכם בנושא זה טלפונית.`

מגבלות עלות ובטיחות שמוגדרות בקוד:

- הודעת משתמש מוגבלת ל-800 תווים. הודעה ארוכה יותר נדחית עם הודעה ידידותית בעברית.
- נשלחות ל-Gemini רק עד 8 הודעות אחרונות מהשיחה.
- במבנה ישן של `history` + `message`, נשלחות עד 6 הודעות היסטוריה ועוד ההודעה הנוכחית.
- תשובת Gemini מוגבלת ל-300 טוקנים, עם `temperature` נמוך של `0.2`.
- אין שמירת rate limit מתמשכת, כדי לא להוסיף תלות או אחסון חדש.

להגדרת הסודות:

```bash
supabase secrets set GEMINI_API_KEY="your-gemini-api-key"
supabase secrets set GEMINI_MODEL="gemini-1.5-flash"
```

`GEMINI_MODEL` אופציונלי. אם לא מגדירים אותו, הפונקציה משתמשת ב-`gemini-1.5-flash`.

לפריסת פונקציית הצ'אט:

```bash
supabase functions deploy chat
```

לאחר הפריסה, ודאי ש-`supabase-config.js` מכיל את כתובת הפרויקט ואת מפתח ה-`anon public` של אותו פרויקט. הווידג'ט לא יענה בפועל עד שהפונקציה `chat` תיפרס ו-`GEMINI_API_KEY` יוגדר כסוד ב-Supabase.

## אבטחה

- מדיניות RLS מאפשרת לגולשים **רק INSERT** (שליחת טופס).
- אין גישת קריאה ציבורית לפניות — צפייה רק בלוח הבקרה של Supabase.
- מפתח Gemini נשמר כסוד של Supabase Edge Function ואינו נשלח לדפדפן.

## שדות בטבלה

| עמודה | תיאור |
|--------|--------|
| first_name | שם פרטי |
| last_name | שם משפחה |
| phone | טלפון |
| email | דוא״ל |
| topic | ערך הנושא מהרשימה |
| topic_open | נושא נוסף (אופציונלי) |
| message | הודעה |
| word_count | מספר מילים |
