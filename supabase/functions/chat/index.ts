import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const fallbackReply =
  "איני יודעת לענות על כך מתוך המידע הקיים באתר. נשמח לחזור אליכם בנושא זה טלפונית.";
const unclearReply =
  "לא הצלחתי להבין את השאלה. אפשר לנסח שוב? אני יכולה לעזור בנושאי האתר — הרצאות, הדרכות, אפליקציות או יצירת קשר.";
const greetingReply =
  "שלום ותודה על הפנייה! אני כאן לעזור במה שמופיע באתר — הרצאות, הדרכות או אפליקציות. במה תרצו לשמוע?";
const lecturesPageReply =
  'נורית מציעה מגוון הרצאות מרתקות לקהל הרחב! כדי לראות את הרשימה המלאה, עברו ללשונית "הרצאות לקהל הרחב" באתר. אם אחרי הקריאה משהו לא ברור — חזרו אליי ואשמח לעזור.';
const trainingPageReply =
  'בנושא הדרכות מורים ומפתחי חומרי למידה יש באתר מידע מפורט. עברו ללשונית "הדרכות מורים ומפתחי חומרי למידה", ואם משהו לא ברור — חזרו אליי.';
const appsPageReply =
  'בנושא פיתוח אפליקציות יש באתר הסבר מפורט. עברו ללשונית "פיתוח אפליקציות", ואם משהו לא ברור — חזרו אליי.';
const contactPageReply =
  'ליצירת קשר ושליחת פנייה, עברו ללשונית "יצירת קשר" באתר — שם מחכה לכם טופס מלא. אם משהו לא ברור — חזרו אליי.';
const tooLongMessage =
  "השאלה ארוכה מדי לצ'אט. אנא קצרו אותה לעד 800 תווים ושלחו שוב.";
const maxMessageChars = 800;
const maxMessagesForGemini = 8;
const maxHistoryMessages = 6;
const maxOutputTokens = 500;

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

דפי האתר (להפניה במקום רשימות ארוכות בצ'אט):
- הרצאות לקהל הרחב: lectures.html
- הדרכות מורים ומפתחי חומרי למידה: training.html
- פיתוח אפליקציות: apps.html
- יצירת קשר: contact.html

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

function getLatestUserMessage(payload: Record<string, unknown>) {
  if (Array.isArray(payload.messages)) {
    for (let i = payload.messages.length - 1; i >= 0; i -= 1) {
      const message = payload.messages[i] as ChatMessage;
      if (message?.role === "user" && typeof message.content === "string") {
        return message.content.trim();
      }
    }
  }

  if (typeof payload.message === "string") {
    return payload.message.trim();
  }

  return "";
}

const ENGLISH_KEY_TO_HEBREW: Record<string, string> = {
  q: "/",
  w: "'",
  e: "ק",
  r: "ר",
  t: "א",
  y: "ו",
  u: "ה",
  i: "ן",
  o: "ם",
  p: "פ",
  a: "ש",
  s: "ד",
  d: "ג",
  f: "כ",
  g: "ע",
  h: "י",
  j: "ח",
  k: "ל",
  l: "ך",
  z: "ז",
  x: "ס",
  c: "ב",
  v: "ה",
  b: "נ",
  n: "מ",
  m: "צ",
  ",": "ת",
  ".": "ץ",
};

const LECTURE_SUBTOPICS =
  /אפיגנט|חיידק|וירוס|גנט|פלסטיק|מיקרופלסטיק|פורנזי|ביואת|הנדסה|אפיסטמ|אוריינית/;

type RoutedIntent =
  | "greeting"
  | "unclear"
  | "lectures_broad"
  | "training_broad"
  | "apps_broad"
  | "contact_broad"
  | "specific";

function hebrewLettersOnly(text: string) {
  return text.replace(/[^\u0590-\u05FF]/g, "");
}

function flipKeyboardLayout(text: string) {
  return text
    .split("")
    .map((char) => ENGLISH_KEY_TO_HEBREW[char.toLowerCase()] ?? char)
    .join("");
}

function resolveUserMessage(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (/[\u0590-\u05FF]/.test(trimmed)) return trimmed;

  if (/^[a-zA-Z\s.,'?!\-]+$/i.test(trimmed)) {
    const flipped = flipKeyboardLayout(trimmed);
    if (hebrewLettersOnly(flipped).length >= 3) {
      return flipped;
    }
  }

  return trimmed;
}

function isGreeting(text: string) {
  const normalized = text.trim().replace(/[!?.,]+$/g, "");
  if (
    /^(שלום|אהלן|היי|הי|בוקר טוב|ערב טוב|מה נשמע|מה שלומך|מה קורה)$/i.test(
      normalized
    )
  ) {
    return true;
  }
  return /^(שלום|אהלן|היי|הי)[\s,]+(מה נשמע|מה שלומך|מה קורה)/i.test(normalized);
}

function isSpecificQuestion(text: string) {
  const he = hebrewLettersOnly(text);
  if (LECTURE_SUBTOPICS.test(he)) return true;
  if (
    /(מה זה|מהו|מה עניין|מה ב|מה לגבי|ספר|מחיר|כמה|איך|למה|מתי|הסבר|פרט|דוגמ|מי זה|ספר)/.test(
      text
    )
  ) {
    return true;
  }
  return /what is|tell me about|how much|how do/i.test(text);
}

function isBroadLecturesIntent(text: string) {
  const he = hebrewLettersOnly(text);
  if (!/הרצא/.test(he) && !/lecture/i.test(text)) return false;
  if (isSpecificQuestion(text) && LECTURE_SUBTOPICS.test(he)) return false;
  if (/מתעניינ/.test(he) && /הרצא/.test(he)) return true;
  if (/^(הרצאות|הרצאה)$/.test(he)) return true;
  if (/הרצא/.test(he) && !LECTURE_SUBTOPICS.test(he)) return true;
  return /lectures?/i.test(text);
}

function isBroadTrainingIntent(text: string) {
  const he = hebrewLettersOnly(text);
  if (!/הדרכ|מורים|מורה|מפתחי חומרי|חומרי למידה/.test(he)) return false;
  if (isSpecificQuestion(text) && /אוריינית|ביולוגיה|ספר/.test(he)) return false;
  return true;
}

function isBroadAppsIntent(text: string) {
  const he = hebrewLettersOnly(text);
  if (!/אפליקצ|פיתוח/.test(he) && !/apps?/i.test(text)) return false;
  if (isSpecificQuestion(text) && /פוטוסינתזה|אוסמוזה|אנזימים|QR|HTML/.test(text)) {
    return false;
  }
  return true;
}

function isBroadContactIntent(text: string) {
  const he = hebrewLettersOnly(text);
  return /יצירת קשר|ליצור קשר|צור קשר|טופס|פנייה|לפנות/.test(he) ||
    /contact/i.test(text);
}

function isTrulyUnclear(text: string) {
  const resolved = resolveUserMessage(text);
  const he = hebrewLettersOnly(resolved);
  if (he.length >= 2) return false;
  const latin = resolved.replace(/[^a-zA-Z]/g, "");
  if (latin.length >= 4 && /[aeiou]/i.test(latin)) return false;
  return true;
}

function detectIntent(rawText: string): RoutedIntent {
  const text = resolveUserMessage(rawText);
  if (!text || isTrulyUnclear(rawText)) return "unclear";
  if (isGreeting(text)) return "greeting";
  if (isBroadLecturesIntent(text)) return "lectures_broad";
  if (isBroadTrainingIntent(text)) return "training_broad";
  if (isBroadAppsIntent(text)) return "apps_broad";
  if (isBroadContactIntent(text)) return "contact_broad";
  return "specific";
}

function replyForIntent(intent: RoutedIntent) {
  switch (intent) {
    case "greeting":
      return greetingReply;
    case "unclear":
      return unclearReply;
    case "lectures_broad":
      return lecturesPageReply;
    case "training_broad":
      return trainingPageReply;
    case "apps_broad":
      return appsPageReply;
    case "contact_broad":
      return contactPageReply;
    default:
      return null;
  }
}

function getRecoveryReply(text: string) {
  if (/נתקע|נקטע|נשבר|לא עובד|באמצע|מה קורה/i.test(text)) {
    return "מצטערת על החבט! נסו לשאול שוב בקצרה, או עברו ללשונית הרלוונטית באתר. אני כאן לעזור.";
  }
  return null;
}

function getKnownSubtopicReply(text: string) {
  const he = hebrewLettersOnly(text);
  if (/אפיגנט/.test(he)) {
    return "הרצאה על אפיגנטיקה עוסקת באופן שבו מחשבותינו, מעשינו וסביבתנו משפיעים על ביטוי הגנים בתאי גופנו, עם דוגמאות ממחקרים פורצי דרך. לפרטים נוספים — לשונית \"הרצאות לקהל הרחב\".";
  }
  if (/וירוס|חיידק/.test(he)) {
    if (/ריפוי|אונקולוג|סרטן|זיהומ|ניצול/.test(he)) {
      return "נורית מציעה הרצאה על ניצול וירוסים לריפוי מחלות זיהומיות ולריפוי מחלות אונקולוגיות, כולל סרטן. לפרטים נוספים עברו ללשונית \"הרצאות לקהל הרחב\", ואם משהו לא ברור — חזרו אליי.";
    }
    return 'באתר מופיעות שתי הרצאות בנושא וירוסים: האחת על חיידקים ווירוסים שחיים עלינו ובתוכנו ומשפיעים על בריאותנו, והשנייה על ניצול וירוסים לריפוי מחלות זיהומיות ואונקולוגיות. לפרטים נוספים — לשונית "הרצאות לקהל הרחב".';
  }
  return null;
}

function sanitizeReply(raw: string) {
  let text = raw.trim();
  if (!text) return null;

  const leakedReasoning =
    /formulate the response|step \d+|^\d+\.\s*\*+/im.test(text) ||
    (/^[a-z0-9 ._-]+$/i.test(text) && !/[\u0590-\u05FF]/.test(text));

  if (leakedReasoning) {
    const hebrewOnly = text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => /[\u0590-\u05FF]/.test(line) && !/formulate|step \d/i.test(line));
    text = hebrewOnly.join("\n").trim();
  }

  text = text
    .replace(/^\d+\.\s*\*\*[^*]+\*\*\s*/gim, "")
    .replace(/\*\*/g, "")
    .trim();

  if (!text || /formulate the response/i.test(text)) return null;
  return text;
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

  const latestUserMessage = getLatestUserMessage(payload);
  const isFirstTurn = contents.length === 1;
  const intent = detectIntent(latestUserMessage);

  if (intent === "greeting" && isFirstTurn) {
    return jsonResponse({ reply: greetingReply });
  }
  if (intent === "unclear") {
    return jsonResponse({ reply: unclearReply });
  }

  const routedReply = replyForIntent(intent);
  if (routedReply && intent !== "greeting") {
    return jsonResponse({ reply: routedReply });
  }

  const resolvedMessage = resolveUserMessage(latestUserMessage);
  const recoveryReply = getRecoveryReply(resolvedMessage);
  if (recoveryReply) {
    return jsonResponse({ reply: recoveryReply });
  }

  const subtopicReply = getKnownSubtopicReply(resolvedMessage);
  if (subtopicReply) {
    return jsonResponse({ reply: subtopicReply });
  }

  const systemPrompt = `
את המזכירה הווירטואלית של אתר נורית שושני-הכל — מנומסת, חביבה, עם חוש הומור בינוני.
עני בעברית, בקצרה (עד 3–4 משפטים), רק לפי המידע המאושר למטה.
אל תפרטי רשימות ארוכות — אם נשאלים על נושא כללי, הפני ללשונית המתאימה באתר.
שמרי על המשכיות השיחה: התייחסי למה שכבר נאמר בפנייה.
אין להמציא פרטים, מחירים, תאריכים, זמינות, טלפונים או הבטחות.
אם אין תשובה במידע המאושר, השיבי בדיוק:
${fallbackReply}

פורמט: רק תשובה סופית בעברית, בלי markdown, בלי כוכביות, בלי שלבי חשיבה באנגלית.

${siteKnowledge}
`;

  const requestBody = JSON.stringify({
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.4,
      topP: 0.85,
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
  const rawReply =
    geminiData?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim() || "";
  const reply = sanitizeReply(rawReply) || fallbackReply;

  return jsonResponse({ reply });
});
