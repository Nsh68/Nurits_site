import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const categoryLabels: Record<string, string> = {
  "public-lecture": "הרצאות לקהל הרחב",
  teachers: "הדרכות ומשובי מורים",
  "app-development": "פיתוח אפליקציות",
};

const sessionLabels: Record<string, string> = {
  lecture: "הרצאה",
  workshop: "סדנה",
  "lecture-workshop": "הרצאה + סדנה",
};

type FeedbackPayload = {
  id?: string;
  full_name?: string;
  email?: string;
  event_date?: string;
  category?: string;
  session_type?: string | null;
  teacher_audience?: string | null;
  subject_name?: string | null;
  experience_text?: string;
  consent_publish?: boolean;
  display_name?: string | null;
  status?: string;
};

function fieldValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildAdminEmail(payload: FeedbackPayload) {
  const category = fieldValue(payload.category);
  const categoryLabel = categoryLabels[category] || category || "—";
  const session = payload.session_type
    ? sessionLabels[payload.session_type] || payload.session_type
    : "—";
  const published = payload.consent_publish ? "כן" : "לא";
  const displayName =
    payload.display_name === "full"
      ? "שם מלא"
      : payload.display_name === "anonymous"
        ? "אנונימי"
        : "—";
  const teacherLine =
    payload.teacher_audience === "single-subject"
      ? `מורים ל: ${fieldValue(payload.subject_name) || "מקצוע אחד"}`
      : payload.teacher_audience === "multi-subject"
        ? "מורים ל: מגוון מקצועות"
        : "";

  const lines = [
    "משוב חדש — התנסינו ורצינו לומר:",
    "",
    `מזהה: ${fieldValue(payload.id) || "—"}`,
    `שם: ${fieldValue(payload.full_name)}`,
    `דוא\"ל: ${fieldValue(payload.email)}`,
    `תאריך מפגש: ${fieldValue(payload.event_date)}`,
    `קטגוריה: ${categoryLabel}`,
    `סוג מפגש: ${session}`,
    teacherLine,
    `הסכמה לפרסום באתר: ${published}`,
    `פרסום שם: ${displayName}`,
    `סטטוס: ${fieldValue(payload.status) || "—"}`,
    "",
    "משוב:",
    fieldValue(payload.experience_text) || "—",
  ].filter(Boolean);

  return {
    subject: `משוב חדש מהאתר — ${categoryLabel}`,
    text: lines.join("\n"),
    html: lines.map(escapeHtml).join("<br>"),
  };
}

function buildThankYouEmail(payload: FeedbackPayload) {
  const name = fieldValue(payload.full_name) || "ידיד/ה";
  const lines = [
    `שלום ${name},`,
    "",
    "תודה רבה ששיתפתם אותנו ב«התנסינו ורצינו לומר». קיבלנו את המשוב שלכם ואנו מעריכים את הזמן שהקדשתם.",
    "",
    "בברכה,",
    "נורית שושני-הכל",
  ];

  return {
    subject: "תודה על המשוב — נורית שושני-הכל",
    text: lines.join("\n"),
    html: lines.map(escapeHtml).join("<br>"),
  };
}

async function sendViaWebhook(
  webhookUrl: string,
  body: Record<string, unknown>,
  token?: string,
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Webhook failed");
  }
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

  const webhookUrl =
    Deno.env.get("TRIED_TO_SAY_WEBHOOK_URL") ||
    Deno.env.get("CONTACT_EMAIL_WEBHOOK_URL");
  if (!webhookUrl) {
    return new Response(
      JSON.stringify({ error: "Email webhook URL is not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const payload = (await req.json()) as FeedbackPayload;
  const required = ["full_name", "email", "event_date", "category", "experience_text"];
  const missing = required.filter((f) => !fieldValue(payload[f as keyof FeedbackPayload]));

  if (missing.length > 0) {
    return new Response(
      JSON.stringify({ error: "Missing required fields", missing }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const adminTo =
    Deno.env.get("TRIED_TO_SAY_EMAIL_TO") ||
    Deno.env.get("CONTACT_EMAIL_TO") ||
    "Nurithec@gmail.com";
  const participantEmail = fieldValue(payload.email);
  const token =
    Deno.env.get("TRIED_TO_SAY_WEBHOOK_TOKEN") ||
    Deno.env.get("CONTACT_EMAIL_WEBHOOK_TOKEN");

  const adminMail = buildAdminEmail(payload);
  const thankYouMail = buildThankYouEmail(payload);

  try {
    await sendViaWebhook(
      webhookUrl,
      {
        to: adminTo,
        subject: adminMail.subject,
        text: adminMail.text,
        html: adminMail.html,
        fields: payload,
      },
      token,
    );

    if (participantEmail) {
      await sendViaWebhook(
        webhookUrl,
        {
          to: participantEmail,
          subject: thankYouMail.subject,
          text: thankYouMail.text,
          html: thankYouMail.html,
          fields: { type: "participant-thank-you", ...payload },
        },
        token,
      );
    }
  } catch (error) {
    console.error("Tried-to-say email failed:", error);
    return new Response(JSON.stringify({ error: "Email webhook failed" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
