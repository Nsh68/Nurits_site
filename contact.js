(function () {
  const form = document.getElementById("contact-form");
  const thanks = document.getElementById("contact-thanks");
  const messageField = document.getElementById("message");
  const wordCountEl = document.getElementById("word-count");
  const errorEl = document.getElementById("contact-error");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const MAX_WORDS = 200;

  if (!form || !thanks) return;

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
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "שולח..." : "שליחה";
  }

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
    form.classList.add("is-hidden");
    thanks.classList.add("is-visible");
    thanks.hidden = false;
    thanks.setAttribute("tabindex", "-1");
    thanks.focus();
  }

  async function notifyByEmail(client, payload) {
    try {
      const { error } = await client.functions.invoke("send-contact-email", {
        body: payload,
      });

      if (error) {
        console.warn("Contact email notification failed:", error);
      }
    } catch (error) {
      console.warn("Contact email notification failed:", error);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const words = messageField ? countWords(messageField.value) : 0;
    if (words > MAX_WORDS) {
      if (messageField) messageField.focus();
      updateWordCount();
      showError(`ההודעה ארוכה מדי (${MAX_WORDS} מילים מקסימום).`);
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      showError(
        "חיבור למסד הנתונים לא הוגדר. צרו קובץ supabase-config.js עם כתובת הפרויקט ומפתח anon."
      );
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

    const { error } = await client.from("contact_inquiries").insert([payload]);

    setSubmitting(false);

    if (error) {
      console.error("Supabase insert error:", error);
      showError(
        "לא הצלחנו לשלוח את הטופס. נסו שוב בעוד רגע, או פנו בדוא״ל ישירות."
      );
      return;
    }

    notifyByEmail(client, payload);
    showThanks();
  });
})();
