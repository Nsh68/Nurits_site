import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const fallbackReply =
  "איני יודעת לענות על כך מתוך המידע הקיים באתר. נשמח לחזור אליכם בנושא זה טלפונית.";
const tooLongMessage =
  "השאלה ארוכה מדי לצ'אט. אנא קצרו אותה לעד 800 תווים ושלחו שוב.";
const maxMessageChars = 800;
const maxMessagesForGemini = 8;
const maxHistoryMessages = 6;
const maxOutputTokens = 300;

const siteKnowledge = `
מידע מאושר מתוך אתר נורית שושני-הכל:

נורית שושני-הכל:
- בוגרת מכון ויצמן למדע במדעי החיים ובהוראת הביולוגיה.
- בוגרת מכון כרם להוראה בתחום הביולוגיה והתנ"ך.
- בוגרת הקורס VIBE CODING של מכללת LetsAI.
- מחברת הספר "דרך הביולוגיה".
- בעלת ניסיון בהוראה בתיכון ובאקדמיה.
- בעלת ניסיון בהדרכת מורים ובהדרכת מפתחי חומרי למידה.
- בעלת ניסיון במתן הרצאות לקהל הרחב במגוון מסגרות.

הרצאות לקהל הרחב שניתן להזמין:
- חיידקים ווירוסים שחיים עלינו ובתוכנו קובעים את בריאותנו הפיזית והנפשית, ואפילו מתערבים בקבלת ההחלטות שלנו.
- אפיגנטיקה: מחשבותינו, מעשינו וסביבתנו משפיעים על ביטוי הגנים בתאי גופנו, עם דוגמאות ממחקרים פורצי דרך.
- ניצול וירוסים לריפוי מחלות זיהומיות ולריפוי מחלות אונקולוגיות, כולל סרטן.
- הנדסה גנטית: יישומים מפתיעים וסכנות עתידיות.
- גנטיקה בסיסית: מה הופך אותנו למה שאנחנו, מה קורה כשמשהו בגנים משתבש, ומתי וכיצד ניתן לתקן זאת.
- טכנולוגיות ביולוגיות במחקר פורנזי, חקר פשעים.
- סוגיות ביואתיות בעקבות התפתחויות בתחום הגנטיקה, יכולות, מימוש וחקיקה בהווה, והרהורים לגבי העתיד. ההרצאה מלווה בסרטונים.
- איזה עולם נותיר לדורות הבאים: פלסטיק, מיקרופלסטיק, אנחנו והים.

הדרכות מורים ומפתחי חומרי למידה:
- נורית מציעה הרצאות וסדנאות לשיפור איכות ההוראה ואיכות חומרי ההוראה.
- קהלי יעד: צוותי הוראה בבתי ספר, צוותי הוראה במכונים להכשרת מורים, צוותי הוראה במכללות ובאקדמיה, ומפתחי חומרי לימוד.
- ניתן להזמין הרצאה על מעבר מהוראה מסורתית להוראה אוריינית, פרוצדורלית ואפיסטמית, ומלמידה שבה המורה במרכז ללמידה פעילה.
- ניתן להזמין סדנאות לשילוב מיומנויות אורייניות ומדעיות בהתאם לנושא הנלמד.
- אפשר להזמין הרצאה בודדת או לשלב בין מספר הרצאות וסדנאות לכיסוי מיומנויות למידה מגוונות.
- מומחיותה בהוראה אוריינית כוללת שנות הוראה רבות, קורס שנתי על הוראה אוריינית למורי ביולוגיה, תפקיד מדריכה אוריינית ארצית בביולוגיה, ליווי מפתחי חומרי למידה בקמפוס IL, וכתיבת הספר "דרך הביולוגיה".
- הספר "דרך הביולוגיה" מיועד לתלמידי כיתה ט', כולל דוגמאות מחיי היום-יום, דפי עבודה לתלמידים מגוונים, והקניה מובנית של מיומנויות אורייניות ומדעיות.

פיתוח אפליקציות:
- ניתן להזמין פיתוח אפליקציות בהתאם לדרישה.
- תהליך העבודה כולל תכנון בפגישות עם נורית וקבלת תוצר בהתאם לדרישות. מספר סבבי העבודה תלוי ברמת המורכבות של הפרויקט.
- אפליקציות שפותחו: אפליקציה לעריכה והוצאה מחדש של ספרות קודש בתשלום; אפליקציה להעסקה ישירה של עובדים זרים במנוי חודשי בתשלום, חודש ראשון חינמי ולאחר מכן 100 שקלים לחודש.
- דוגמאות לחומרים שפותחו עבור הוצאת כנרת: אפליקציה ליצירת QR CODE סטטיים בהתאם לטבלת לינקים, סרטון פרסומת עם דף הרשמה לרכישת ספר לימוד, ודפי HTML לדוגמה בנושא גוף-נפש וסיכומי מחקרים ובהשוואות בין כלים לייצור תרשימים.
- אפליקציות לדוגמה לצורכי למידה: הדמיית מעבדת פוטוסינתזה, הדמיית מעבדת אוסמוזה, הדמיית מעבדת נשימה תאית, והדמיית מעבדת אנזימים.

יצירת קשר:
- באתר יש טופס יצירת קשר עם שם פרטי, שם משפחה, טלפון סלולרי, דוא"ל, נושא פנייה, נושא נוסף והודעה עד 200 מילים.
- נושאי הפנייה בטופס: הרצאה לקהל הרחב, הרצאה לצוותי הוראה/צוותי פיתוח, בקשה לפיתוח אפליקציה.
- לאחר שליחת פנייה מופיעה הודעה: תודה רבה! אשמח ליצור עמכם קשר ביום יומיים הקרובים. המשך יום טוב.

אם נשאלת שאלה שהתשובה לה לא מופיעה במידע המאושר הזה, יש להשיב בדיוק:
${fallbackReply}
`;

type ChatMessage = {
  role?: unknown;
  content?: unknown;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getGeminiApiKey() {
  return (
    Deno.env.get("GEMINI_API_KEY") ||
    Deno.env.get("GOOGLE_API_KEY") ||
    Deno.env.get("API_KEY") ||
    ""
  ).trim();
}

function getGeminiModels() {
  const configured = Deno.env.get("GEMINI_MODEL")?.trim();
  const defaults = ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-1.5-flash"];
  return configured ? [configured, ...defaults.filter((m) => m !== configured)] : defaults;
}

function normalizeRole(role: unknown) {
  return role === "assistant" || role === "model" ? "model" : "user";
}

function normalizeMessage(message: ChatMessage) {
  const content = typeof message.content === "string" ? message.content.trim() : "";
  if (!content) return null;

  return {
    role: normalizeRole(message.role),
    parts: [{ text: content.slice(0, maxMessageChars) }],
  };
}

function hasOversizedMessage(messages: unknown[]) {
  return messages.some((message) => {
    const content = (message as ChatMessage)?.content;
    return typeof content === "string" && content.trim().length > maxMessageChars;
  });
}

function validatePayload(payload: Record<string, unknown>) {
  if (
    typeof payload.message === "string" &&
    payload.message.trim().length > maxMessageChars
  ) {
    return tooLongMessage;
  }

  if (Array.isArray(payload.messages) && hasOversizedMessage(payload.messages)) {
    return tooLongMessage;
  }

  if (Array.isArray(payload.history) && hasOversizedMessage(payload.history)) {
    return tooLongMessage;
  }

  return null;
}

function buildMessages(payload: Record<string, unknown>) {
  if (Array.isArray(payload.messages)) {
    return payload.messages
      .slice(-maxMessagesForGemini)
      .map((message) => normalizeMessage(message as ChatMessage))
      .filter(Boolean);
  }

  const history = Array.isArray(payload.history)
    ? payload.history
        .slice(-maxHistoryMessages)
        .map((message) => normalizeMessage(message as ChatMessage))
        .filter(Boolean)
    : [];
  const message =
    typeof payload.message === "string"
      ? payload.message.trim().slice(0, maxMessageChars)
      : "";

  if (!message) return history;

  return [...history, { role: "user", parts: [{ text: message }] }];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return jsonResponse({ error: "Gemini API key is not configured" }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch (_error) {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonResponse({ error: validationError, reply: validationError }, 400);
  }

  const contents = buildMessages(payload);
  if (contents.length === 0) {
    return jsonResponse({ error: "Missing message content" }, 400);
  }

  const systemPrompt = `
את עוזרת וירטואלית ידידותית, מנומסת ונשית של אתר נורית שושני-הכל.
עני בעברית בלבד, בלשון נעימה, קצרה ובהירה.
מותר לך לענות רק מתוך המידע המאושר המצורף. אין להמציא פרטים, מחירים, תאריכים, זמינות, טלפונים, כתובות או הבטחות שאינם מופיעים במידע.
אם אין במידע המאושר תשובה ברורה לשאלה, השיבי בדיוק:
${fallbackReply}

${siteKnowledge}
`;

  const requestBody = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens,
    },
  });

  let geminiResponse: Response | null = null;
  let lastError = "";

  for (const model of getGeminiModels()) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: requestBody,
    });

    if (response.ok) {
      geminiResponse = response;
      break;
    }

    lastError = await response.text();
    console.error(`Gemini chat request failed for ${model}:`, lastError);
  }

  if (!geminiResponse) {
    return jsonResponse({ error: "Chat service unavailable" }, 502);
  }

  const geminiData = await geminiResponse.json();
  const reply =
    geminiData?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim() || fallbackReply;

  return jsonResponse({ reply });
});
