const CONTACT_EMAIL = "nurithec@gmail.com";

const topicLabels = {
  "public-lecture": "הרצאה לקהל הרחב",
  "staff-lecture": "הרצאה לצוותי הוראה/צוותי פיתוח",
  "app-development": "בקשה לפיתוח אפליקציה",
};

function field(value) {
  return typeof value === "string" ? value.trim() : "";
}

function topicLabel(topic) {
  return topicLabels[topic] || topic || "לא נבחר";
}

function buildText(payload) {
  return [
    "פנייה חדשה מטופס יצירת הקשר באתר:",
    "",
    `שם פרטי: ${field(payload.first_name)}`,
    `שם משפחה: ${field(payload.last_name)}`,
    `טלפון: ${field(payload.phone)}`,
    `דוא"ל: ${field(payload.email)}`,
    `נושא: ${topicLabel(payload.topic)}`,
    `נושא נוסף: ${field(payload.topic_open) || "-"}`,
    `מספר מילים: ${payload.word_count ?? 0}`,
    "",
    "הודעה:",
    field(payload.message) || "-",
  ].join("\n");
}

async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const payload = req.body || {};
  const requiredFields = ["first_name", "last_name", "phone", "email", "topic"];
  const missingFields = requiredFields.filter((key) => !field(payload[key]));

  if (missingFields.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missingFields });
  }

  const subject = `פנייה חדשה מהאתר - ${topicLabel(payload.topic)}`;
  const text = buildText(payload);
  const resendKey = process.env.RESEND_API_KEY;

  try {
    if (resendKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            process.env.CONTACT_FROM_EMAIL ||
            "Nurit Site <onboarding@resend.dev>",
          to: [CONTACT_EMAIL],
          reply_to: field(payload.email),
          subject,
          text,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        console.error("Resend failed:", detail);
        return res.status(502).json({ error: "Email send failed" });
      }

      return res.status(200).json({ ok: true });
    }

    const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: `${field(payload.first_name)} ${field(payload.last_name)}`.trim(),
        email: field(payload.email),
        _replyto: field(payload.email),
        _subject: subject,
        _template: "table",
        _captcha: false,
        phone: field(payload.phone),
        topic: topicLabel(payload.topic),
        topic_open: field(payload.topic_open) || "-",
        message: field(payload.message) || "-",
        word_count: payload.word_count ?? 0,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("FormSubmit failed:", detail);
      return res.status(502).json({ error: "Email send failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact email error:", error);
    return res.status(502).json({ error: "Email send failed" });
  }
}

module.exports = handler;
