# Nurits_site — אתר נורית שושני-הכל

אתר תדמית בעברית (RTL): הרצאות בביולוגיה, הדרכות מורים, פיתוח אפליקציות וטופס יצירת קשר.

## דפים

| דף | קובץ |
|----|------|
| בית | `index.html` |
| הרצאות | `lectures.html` |
| הדרכות | `training.html` |
| אפליקציות | `apps.html` |
| יצירת קשר | `contact.html` |

## הרצה מקומית

```bash
python -m http.server 8080
```

פתחי `http://localhost:8080` — לטופס יצירת קשר נדרש שרת (לא `file://`).

לפני שליחת טופס: העתיקי `supabase-config.example.js` ל-`supabase-config.js` ומלאי מפתחות Supabase.

## תיעוד

- [PRD.md](PRD.md) — דרישות מוצר וסטטוס יישום
- [PHASE1_IMPLEMENTATION.md](PHASE1_IMPLEMENTATION.md) — פאזות פיתוח
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) — חיבור Supabase, מייל וצ'אט
- [SESSION_SUMMARY.md](SESSION_SUMMARY.md) — היסטוריית פרויקט

## טכנולוגיות

HTML · CSS · JavaScript · Supabase · Edge Functions · Gemini Flash

## רישיון / זכויות

© Nurit Shoshani-Hechel — `This site was built by Nurit Shoshani-Hechel`
