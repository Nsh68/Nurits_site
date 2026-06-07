import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const topicLabels: Record<string, string> = {
  "public-lecture": "הרצאה לקהל הרחב",
  "staff-lecture": "הרצאה לצוותי הוראה/צוותי פיתוח",
  "app-development": "בקשה לפיתוח אפליקציה",
};

type ContactPayload = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  topic?: string;
  topic_open?: string | null;
  message?: string;
  word_count?: number;
};

function fieldValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildEmail(payload: ContactPayload) {
  const topic = fieldValue(payload.topic);
  const topicLabel = topicLabels[topic] || topic || "לא נבחר";
  const topicOpen = fieldValue(payload.topic_open);
  const message = fieldValue(payload.message);
  const lines = [
    "פנייה חדשה מטופס יצירת הקשר באתר:",
    "",
    `שם פרטי: ${fieldValue(payload.first_name)}`,
    `שם משפחה: ${fieldValue(payload.last_name)}`,
    `טלפון: ${fieldValue(payload.phone)}`,
    `דוא\"ל: ${fieldValue(payload.email)}`,
    `נושא: ${topicLabel}`,
    `נושא נוסף: ${topicOpen || "-"}`,
    `מספר מילים: ${payload.word_count ?? 0}`,
    "",
    "הודעה:",
    message || "-",
  ];

  return {
    subject: `פנייה חדשה מהאתר - ${topicLabel}`,
    text: lines.join("\n"),
    html: lines
      .map((line) =>
        line
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      )
      .join("<br>"),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const emailWebhookUrl = Deno.env.get("CONTACT_EMAIL_WEBHOOK_URL");
  if (!emailWebhookUrl) {
    return new Response(
      JSON.stringify({ error: "CONTACT_EMAIL_WEBHOOK_URL is not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const payload = (await req.json()) as ContactPayload;
  const requiredFields = ["first_name", "last_name", "phone", "email", "topic"];
  const missingFields = requiredFields.filter(
    (field) => !fieldValue(payload[field as keyof ContactPayload])
  );

  if (missingFields.length > 0) {
    return new Response(
      JSON.stringify({ error: "Missing required fields", missingFields }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { subject, text, html } = buildEmail(payload);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const webhookToken = Deno.env.get("CONTACT_EMAIL_WEBHOOK_TOKEN");

  if (webhookToken) {
    headers.Authorization = `Bearer ${webhookToken}`;
  }

  const response = await fetch(emailWebhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      to: Deno.env.get("CONTACT_EMAIL_TO") || "Nurithec@gmail.com",
      subject,
      text,
      html,
      fields: payload,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Contact email webhook failed:", detail);

    return new Response(JSON.stringify({ error: "Email webhook failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
