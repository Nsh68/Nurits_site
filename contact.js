(function () {
  const form = document.getElementById("contact-form");
  const thanks = document.getElementById("contact-thanks");
  const messageField = document.getElementById("message");
  const wordCountEl = document.getElementById("word-count");
  const errorEl = document.getElementById("contact-error");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const requiredFields = form
    ? ["full-name", "phone", "email", "topic"].map((name) => form.elements[name])
    : [];
  const MAX_WORDS = 200;

  if (!form || !thanks) return;

  function isEmailValid(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isFormComplete() {
    const fullName = form.elements["full-name"].value.trim();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    const topic = form.elements.topic.value;

    return Boolean(fullName && phone && email && isEmailValid(email) && topic);
  }

  function updateSubmitState() {
    if (!submitBtn || submitBtn.dataset.submitting === "true") return;
    submitBtn.disabled = !isFormComplete();
  }

  function countWords(text) {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  function updateWordCount() {
    if (!messageField || !wordCountEl) return;

    const words = countWords(messageField.value);
    wordCountEl.textContent = `${words} / ${MAX_WORDS} מילים`;
    wordCountEl.classList.toggle("contact-form__hint--error", words > MAX_WORDS);
    messageField.setAttribute(
      "aria-invalid",
      words > MAX_WORDS ? "true" : "false"
    );
  }

  if (messageField && wordCountEl) {
    messageField.addEventListener("input", updateWordCount);
    updateWordCount();
  }

  requiredFields.forEach((field) => {
    if (!field) return;
    field.addEventListener("input", updateSubmitState);
    field.addEventListener("change", updateSubmitState);
  });
  updateSubmitState();

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  function splitFullName(fullName) {
    const trimmed = fullName.trim();
    const spaceIndex = trimmed.indexOf(" ");

    if (spaceIndex === -1) {
      return { first_name: trimmed, last_name: "—" };
    }

    const first = trimmed.slice(0, spaceIndex).trim();
    const last = trimmed.slice(spaceIndex + 1).trim();
    return {
      first_name: first || trimmed,
      last_name: last || "—",
    };
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.dataset.submitting = isSubmitting ? "true" : "false";
    submitBtn.disabled = isSubmitting || !isFormComplete();
    submitBtn.textContent = isSubmitting ? "שולח..." : "שליחה";
  }

  function validateRequiredFields() {
    const fullName = form.elements["full-name"].value.trim();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    const topic = form.elements.topic.value;

    if (!fullName) {
      showError("נא למלא שם מלא.");
      form.elements["full-name"].focus();
      return false;
    }
    if (!phone) {
      showError("נא למלא טלפון סלולרי.");
      form.elements.phone.focus();
      return false;
    }
    if (!email) {
      showError('נא למלא כתובת דוא"ל.');
      form.elements.email.focus();
      return false;
    }
    if (!isEmailValid(email)) {
      showError('נא למלא כתובת דוא"ל תקינה.');
      form.elements.email.focus();
      return false;
    }
    if (!topic) {
      showError("נא לבחור נושא לפניה.");
      form.elements.topic.focus();
      return false;
    }
    return true;
  }

  const CONTACT_EMAIL = "nurithec@gmail.com";
  const topicLabels = {
    "public-lecture": "הרצאה לקהל הרחב",
    "staff-lecture": "הרצאה לצוותי הוראה/צוותי פיתוח",
    "app-development": "בקשה לפיתוח אפליקציה",
  };

  // Kept for future Supabase use (chat, database). Not required for sending the form.
  function getSupabaseClient() {
    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey) {
      return null;
    }
    if (typeof window.supabase === "undefined") {
      return null;
    }
    return window.supabase.createClient(config.url, config.anonKey);
  }

  function showThanks() {
    const title = document.querySelector(".page--contact .page__title");

    form.classList.add("is-hidden");
    if (title) title.classList.add("is-hidden");
    thanks.classList.add("is-visible");
    thanks.hidden = false;
    thanks.setAttribute("tabindex", "-1");
    thanks.focus();
  }

  function topicLabel(topic) {
    return topicLabels[topic] || topic || "לא נבחר";
  }

  function emailFields(payload) {
    return {
      name: `${payload.first_name} ${payload.last_name}`.trim(),
      email: payload.email,
      _replyto: payload.email,
      _subject: `פנייה חדשה מהאתר - ${topicLabel(payload.topic)}`,
      _template: "table",
      _captcha: false,
      phone: payload.phone,
      topic: topicLabel(payload.topic),
      topic_open: payload.topic_open || "-",
      message: payload.message || "-",
      word_count: payload.word_count ?? 0,
    };
  }

  async function postJson(url, body, extraHeaders) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(extraHeaders || {}),
      },
      body: JSON.stringify(body),
    });
    return response;
  }

  async function sendContactEmail(payload) {
    try {
      const apiResponse = await postJson("/api/contact", payload);
      if (apiResponse.ok) return true;
    } catch (_error) {
      // Local static server has no /api/contact — fall through.
    }

    const formResponse = await postJson(
      `https://formsubmit.co/ajax/${CONTACT_EMAIL}`,
      emailFields(payload)
    );
    const data = await formResponse.json().catch(() => ({}));
    const failed =
      !formResponse.ok || data.success === false || data.success === "false";
    if (failed) {
      throw new Error(data.message || "Email delivery failed");
    }
    return true;
  }

  // Optional archive for when Supabase is connected again. Never blocks email.
  function trySaveToSupabase(payload) {
    const client = getSupabaseClient();
    if (!client) return;

    client
      .from("contact_inquiries")
      .insert([payload])
      .then(({ error }) => {
        if (error) {
          console.warn("Supabase archive skipped (kept for future use):", error);
        }
      })
      .catch((error) => {
        console.warn("Supabase archive skipped (kept for future use):", error);
      });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const honeypot = form.elements.website;
    if (honeypot && honeypot.value.trim()) {
      showThanks();
      return;
    }

    if (!validateRequiredFields()) {
      updateSubmitState();
      return;
    }

    const words = messageField ? countWords(messageField.value) : 0;
    if (words > MAX_WORDS) {
      if (messageField) messageField.focus();
      updateWordCount();
      showError(`ההודעה ארוכה מדי (${MAX_WORDS} מילים מקסימום).`);
      return;
    }

    const { first_name, last_name } = splitFullName(
      form.elements["full-name"].value
    );

    const payload = {
      first_name,
      last_name,
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      topic: form.elements.topic.value,
      topic_open: form.elements["topic-open"].value.trim() || null,
      message: messageField ? messageField.value.trim() : "",
      word_count: words,
    };

    setSubmitting(true);

    try {
      await sendContactEmail(payload);
      trySaveToSupabase(payload);
      showThanks();
    } catch (error) {
      console.error("Contact email error:", error);
      showError(
        "לא הצלחנו לשלוח את הטופס. נסו שוב בעוד רגע, או פנו בדוא״ל ישירות ל-nurithec@gmail.com."
      );
    } finally {
      setSubmitting(false);
    }
  });
})();
