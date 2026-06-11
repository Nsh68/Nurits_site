# Nurits_site — אתר נורית שושני-הכל

אתר תדמית בעברית (RTL): הרצאות בביולוגיה, הדרכות מורים, פיתוח אפליקציות, טופס יצירת קשר, ומשובי משתתפים (מתוכנן).

## דפים

| דף | קובץ | סטטוס |
|----|------|--------|
| בית | `index.html` | קיים |
| הרצאות | `lectures.html` | קיים |
| הדרכות | `training.html` | קיים |
| אפליקציות | `apps.html` | קיים |
| יצירת קשר | `contact.html` | קיים |
| משובים | `testimonials.html` | מתוכנן |
| ניסינו ורצינו לומר (טופס QR) | `tried-to-say.html` | מתוכנן — כולל תמונות קהל אופציונליות |

## הרצה מקומית

```bash
python -m http.server 8080
```

פתחי `http://localhost:8080` — לטופס יצירת קשר נדרש שרת (לא `file://`).

לפני שליחת טופס: העתיקי `supabase-config.example.js` ל-`supabase-config.js` ומלאי מפתחות Supabase.

## תיעוד

- [PRD.md](PRD.md) — דרישות מוצר וסטטוס יישום
- [TESTIMONIALS.md](TESTIMONIALS.md) — מפרט «ניסינו ורצינו לומר» / דף משובים
- [TASKS_2026-06-11.md](TASKS_2026-06-11.md) — משימות יישום (צ'אט + משובים)
- [PHASE1_IMPLEMENTATION.md](PHASE1_IMPLEMENTATION.md) — פאזות פיתוח
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) — חיבור Supabase, מייל וצ'אט
- [SESSION_SUMMARY.md](SESSION_SUMMARY.md) — היסטוריית פרויקט

## טכנולוגיות

HTML · CSS · JavaScript · Supabase · Edge Functions · Gemini Flash

## רישיון / זכויות

© Nurit Shoshani-Hechel — `This site was built by Nurit Shoshani-Hechel`
