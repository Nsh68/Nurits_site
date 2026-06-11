(() => {
  const MAX_WORDS = 150;
  const CATEGORY_ANCHORS = {
    "public-lecture": "public",
    teachers: "teachers",
    "app-development": "apps",
  };

  const form = document.getElementById("feedback-form");
  const thanks = document.getElementById("feedback-thanks");
  const thanksPublished = document.getElementById("feedback-thanks-published");
  const errorEl = document.getElementById("feedback-error");
  const warningsEl = document.getElementById("feedback-warnings");
  const warningTextEl = document.getElementById("feedback-warning-text");
  const warningFixBtn = document.getElementById("feedback-warning-fix");
  const warningProceedBtn = document.getElementById("feedback-warning-proceed");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const experienceField = document.getElementById("experience-text");
  const wordCountEl = document.getElementById("word-count");
  const displayNameGroup = document.getElementById("display-name-group");
  const sessionTypeField = document.getElementById("session-type-field");
  const sessionTypeSelect = document.getElementById("session-type");
  const teacherAudienceField = document.getElementById("teacher-audience-field");
  const subjectNameField = document.getElementById("subject-name-field");
  const categoryField = document.getElementById("category-field");
  const categorySelect = document.getElementById("category");
  const eventDateInput = document.getElementById("event-date");
  const qualityHintEl = document.getElementById("experience-quality-hint");
  const emailField = form ? form.elements.email : null;
  const emailErrorEl = document.getElementById("email-error");

  if (!form || !thanks) return;

  let warningsAcknowledged = false;
  let emailTouched = false;
  let emailValidateTimer = null;

  function todayIso() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function applyCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (!category || !categorySelect) return;
    const option = categorySelect.querySelector(`option[value="${category}"]`);
    if (!option) return;
    categorySelect.value = category;
    if (categoryField) categoryField.hidden = true;
    categorySelect.required = false;
    updateConditionalFields();
  }

  if (eventDateInput && !eventDateInput.value) {
    eventDateInput.value = todayIso();
  }

  function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { ok: false, message: 'נא למלא כתובת דוא"ל.' };
    }
    if (/[^\x00-\x7F]/.test(trimmed)) {
      return {
        ok: false,
        message:
          'כתובת דוא"ל לא תקינה — השתמשו באותיות באנגלית בלבד (למשל name@gmail.com).',
      };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(trimmed)) {
      return {
        ok: false,
        message:
          'כתובת דוא"ל לא תקינה — בדקו שיש @ וסיומת דומיין (למשל name@gmail.com).',
      };
    }
    return { ok: true };
  }

  function clearEmailFieldError() {
    if (emailErrorEl) {
      emailErrorEl.textContent = "";
      emailErrorEl.hidden = true;
    }
    if (emailField) {
      emailField.setAttribute("aria-invalid", "false");
      emailField.classList.remove("contact-form__input--error");
    }
  }

  function updateEmailFieldValidation(force = false) {
    if (!emailField || !emailErrorEl) return true;

    const value = emailField.value.trim();
    if (!value) {
      if (force || emailTouched) {
        emailErrorEl.textContent = 'נא למלא כתובת דוא"ל.';
        emailErrorEl.hidden = false;
        emailField.setAttribute("aria-invalid", "true");
        emailField.classList.add("contact-form__input--error");
        return false;
      }
      clearEmailFieldError();
      return false;
    }

    const check = validateEmail(value);
    if (!check.ok) {
      emailErrorEl.textContent = check.message;
      emailErrorEl.hidden = false;
      emailField.setAttribute("aria-invalid", "true");
      emailField.classList.add("contact-form__input--error");
      return false;
    }

    clearEmailFieldError();
    return true;
  }

  function scheduleEmailValidation() {
    if (!emailField) return;
    clearTimeout(emailValidateTimer);

    const run = () => {
      emailTouched = true;
      updateEmailFieldValidation(true);
    };

    const value = emailField.value;
    if (/[^\x00-\x7F]/.test(value)) {
      run();
      return;
    }

    if (value.includes("@") && value.trim().length >= 5) {
      emailValidateTimer = setTimeout(run, 450);
      return;
    }

    if (emailTouched) {
      updateEmailFieldValidation(true);
    } else {
      clearEmailFieldError();
    }
  }

  function countWords(text) {
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  }

  function looksLikeGibberish(text) {
    const trimmed = text.trim();
    if (trimmed.length < 10) return false;
    const letters = trimmed.replace(/\s/g, "");
    if (!letters.length) return false;
    const hebrew = (letters.match(/[\u0590-\u05FF]/g) || []).length;
    if (hebrew / letters.length < 0.45) return true;
    if (/(.)\1{4,}/.test(trimmed)) return true;
    if (/[qwertyuiopasdfghjklzxcvbnm]{6,}/i.test(trimmed)) return true;
    const words = trimmed.split(/\s+/).filter((w) => w.length > 2);
    if (words.length >= 4) {
      const unique = new Set(words.map((w) => w.toLowerCase()));
      if (unique.size === 1) return true;
    }
    return false;
  }

  function getConsentPublish() {
    const checked = form.querySelector('input[name="consent-publish"]:checked');
    return checked ? checked.value : "";
  }

  function getDisplayName() {
    const checked = form.querySelector('input[name="display-name"]:checked');
    return checked ? checked.value : "";
  }

  function getTeacherAudience() {
    const checked = form.querySelector('input[name="teacher-audience"]:checked');
    return checked ? checked.value : "";
  }

  function getFormValues() {
    return {
      fullName: form.elements["full-name"].value.trim(),
      email: form.elements.email.value.trim(),
      eventDate: form.elements["event-date"].value,
      category: categorySelect ? categorySelect.value : "",
      consent: getConsentPublish(),
      displayName: getDisplayName(),
      experience: experienceField ? experienceField.value.trim() : "",
      audience: getTeacherAudience(),
      sessionType: sessionTypeSelect?.value || "",
      subject: form.elements["subject-name"]?.value.trim() || "",
    };
  }

  function updateConditionalFields() {
    const consent = getConsentPublish();
    if (displayNameGroup) {
      displayNameGroup.hidden = consent !== "yes";
      const radios = displayNameGroup.querySelectorAll('input[name="display-name"]');
      radios.forEach((r) => {
        r.required = consent === "yes";
      });
    }

    const category = categorySelect ? categorySelect.value : "";
    const showSession = category === "public-lecture" || category === "teachers";
    if (sessionTypeField) {
      sessionTypeField.hidden = !showSession;
      if (sessionTypeSelect) sessionTypeSelect.required = showSession;
    }

    const showTeachers = category === "teachers";
    if (teacherAudienceField) {
      teacherAudienceField.hidden = !showTeachers;
      const radios = teacherAudienceField.querySelectorAll('input[name="teacher-audience"]');
      radios.forEach((r) => {
        r.required = showTeachers;
      });
    }

    const audience = getTeacherAudience();
    if (subjectNameField) {
      subjectNameField.hidden = !showTeachers || audience !== "single-subject";
      const subjectInput = document.getElementById("subject-name");
      if (subjectInput) subjectInput.required = showTeachers && audience === "single-subject";
    }
  }

  function validateForm() {
    const v = getFormValues();
    const blocking = [];
    const warnings = [];

    if (!v.fullName) {
      blocking.push({ message: "נא למלא שם מלא.", el: form.elements["full-name"] });
    }

    const emailCheck = validateEmail(v.email);
    if (!emailCheck.ok) {
      blocking.push({ message: emailCheck.message, el: form.elements.email });
    }

    if (!v.eventDate) {
      blocking.push({ message: "נא לבחור תאריך.", el: eventDateInput });
    }

    if (!v.category) {
      blocking.push({ message: "נא לבחור סוג התנסות.", el: categorySelect });
    }

    if (!v.consent) {
      blocking.push({
        message: "נא לבחור האם להסכים לפרסום באתר.",
        el: form.querySelector('input[name="consent-publish"]'),
      });
    } else if (v.consent === "yes" && !v.displayName) {
      blocking.push({
        message: "נא לבחור אם לפרסם בשם מלא או אנונימי.",
        el: displayNameGroup,
      });
    }

    if (!v.experience) {
      blocking.push({ message: "נא לכתוב את המשוב.", el: experienceField });
    } else {
      const words = countWords(v.experience);
      if (words > MAX_WORDS) {
        blocking.push({
          message: `המשוב ארוך מדי (${MAX_WORDS} מילים מקסימום).`,
          el: experienceField,
        });
      } else if (looksLikeGibberish(v.experience)) {
        warnings.push({
          message:
            "הטקסט נראה לא ברור או עם שגיאות — מומלץ לקרוא שוב. אפשר לתקן או לשלוח בכל זאת.",
          el: experienceField,
        });
      }
    }

    if (v.category === "public-lecture" || v.category === "teachers") {
      if (!v.sessionType) {
        blocking.push({ message: "נא לבחור סוג מפגש.", el: sessionTypeSelect });
      }
    }

    if (v.category === "teachers") {
      if (!v.audience) {
        blocking.push({
          message: "נא לבחור למי מיועדת ההדרכה.",
          el: teacherAudienceField,
        });
      } else if (v.audience === "single-subject" && !v.subject) {
        blocking.push({ message: "נא לציין מקצוע.", el: form.elements["subject-name"] });
      }
    }

    return { blocking, warnings };
  }

  function hasRequiredFieldsFilled() {
    const v = getFormValues();
    if (!v.fullName || !v.email || !v.eventDate || !v.category || !v.consent || !v.experience) {
      return false;
    }
    if (v.consent === "yes" && !v.displayName) return false;
    if (v.category === "public-lecture" || v.category === "teachers") {
      if (!v.sessionType) return false;
    }
    if (v.category === "teachers") {
      if (!v.audience) return false;
      if (v.audience === "single-subject" && !v.subject) return false;
    }
    return true;
  }

  function updateSubmitState() {
    if (!submitBtn || submitBtn.dataset.submitting === "true") return;
    const filled = hasRequiredFieldsFilled();
    submitBtn.disabled = false;
    submitBtn.setAttribute("aria-disabled", filled ? "false" : "true");
    submitBtn.classList.toggle("contact-form__submit--incomplete", !filled);
  }

  function updateTextQualityHint() {
    if (!experienceField || !qualityHintEl) return;
    const suspicious = looksLikeGibberish(experienceField.value);
    qualityHintEl.hidden = !suspicious || !warningsEl?.hidden;
    experienceField.setAttribute("aria-invalid", suspicious ? "true" : "false");
  }

  function updateWordCount() {
    if (!experienceField || !wordCountEl) return;
    const words = countWords(experienceField.value);
    wordCountEl.textContent = `${words} / ${MAX_WORDS} מילים`;
    wordCountEl.classList.toggle("contact-form__hint--error", words > MAX_WORDS);
    updateSubmitState();
  }

  function showError(message, focusEl) {
    hideWarnings();
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (focusEl && typeof focusEl.focus === "function") {
      focusEl.focus();
    }
  }

  function clearError() {
    if (!errorEl) return;
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  function hideWarnings() {
    if (warningsEl) warningsEl.hidden = true;
    if (warningTextEl) warningTextEl.textContent = "";
  }

  function showWarnings(warnings) {
    clearError();
    if (!warningsEl || !warningTextEl || !warnings.length) return;
    warningTextEl.textContent = warnings.map((w) => w.message).join(" ");
    warningsEl.hidden = false;
    warningsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const first = warnings[0]?.el;
    if (first && typeof first.focus === "function") first.focus();
  }

  function resetWarningsState() {
    warningsAcknowledged = false;
    hideWarnings();
  }

  function showFirstBlockingError(blocking) {
    if (!blocking.length) return false;
    const first = blocking[0];
    if (first.el === emailField) {
      emailTouched = true;
      updateEmailFieldValidation(true);
      emailField.focus();
      return true;
    }
    showError(first.message, first.el);
    return true;
  }

  function getClient() {
    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey || typeof window.supabase === "undefined") return null;
    return window.supabase.createClient(config.url, config.anonKey);
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.dataset.submitting = isSubmitting ? "true" : "false";
    submitBtn.textContent = isSubmitting ? "שולח..." : "שליחת משוב";
    if (isSubmitting) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-disabled", "true");
    } else {
      submitBtn.disabled = false;
      updateSubmitState();
    }
  }

  async function notifyByEmail(client, payload) {
    try {
      const { error } = await client.functions.invoke("send-tried-to-say-email", {
        body: payload,
      });
      if (error) console.warn("Feedback email notification failed:", error);
    } catch (err) {
      console.warn("Feedback email notification failed:", err);
    }
  }

  function showThanks(published, category) {
    const title = document.querySelector(".tried-to-say-page__title");
    const intro = document.querySelector(".tried-to-say-page__intro");
    form.classList.add("is-hidden");
    form.hidden = true;
    if (title) title.classList.add("is-hidden");
    if (intro) intro.classList.add("is-hidden");
    thanks.hidden = false;
    thanks.classList.add("is-visible");

    if (thanksPublished) {
      if (published && category) {
        const anchor = CATEGORY_ANCHORS[category] || "public";
        thanksPublished.hidden = false;
        thanksPublished.innerHTML =
          'המשוב שלכם מופיע עכשיו ב<a href="testimonials.html#' +
          anchor +
          '">דף המשובים</a>.';
      } else {
        thanksPublished.hidden = true;
      }
    }

    thanks.setAttribute("tabindex", "-1");
    thanks.focus();
  }

  function buildRow() {
    const consentPublish = getConsentPublish() === "yes";
    const category = categorySelect.value;
    const audience = getTeacherAudience();

    return {
      full_name: form.elements["full-name"].value.trim(),
      email: form.elements.email.value.trim(),
      event_date: form.elements["event-date"].value,
      category,
      session_type:
        category === "app-development" ? null : sessionTypeSelect?.value || null,
      teacher_audience: category === "teachers" ? audience : null,
      subject_name:
        category === "teachers" && audience === "single-subject"
          ? form.elements["subject-name"].value.trim()
          : null,
      experience_text: experienceField.value.trim(),
      consent_publish: consentPublish,
      display_name: consentPublish ? getDisplayName() : null,
      status: consentPublish ? "published" : "private",
      _consentPublish: consentPublish,
      _category: category,
    };
  }

  async function submitFeedback() {
    const client = getClient();
    if (!client) {
      showError("חיבור למסד הנתונים לא הוגדר.");
      return;
    }

    const row = buildRow();
    const consentPublish = row._consentPublish;
    const category = row._category;
    delete row._consentPublish;
    delete row._category;

    setSubmitting(true);
    const { error } = await client.from("participant_feedback").insert([row]);
    setSubmitting(false);

    if (error) {
      console.error("Feedback insert error:", error);
      showError("לא הצלחנו לשלוח את המשוב. נסו שוב בעוד רגע.");
      return;
    }

    await notifyByEmail(client, { ...row });
    showThanks(consentPublish, category);
  }

  function attemptSubmit() {
    clearError();
    const { blocking, warnings } = validateForm();

    if (showFirstBlockingError(blocking)) {
      return;
    }

    if (warnings.length && !warningsAcknowledged) {
      showWarnings(warnings);
      updateTextQualityHint();
      return;
    }

    hideWarnings();
    submitFeedback();
  }

  form.querySelectorAll('input[name="consent-publish"]').forEach((el) => {
    el.addEventListener("change", () => {
      resetWarningsState();
      updateConditionalFields();
      updateSubmitState();
    });
  });
  form.querySelectorAll('input[name="display-name"]').forEach((el) => {
    el.addEventListener("change", () => {
      resetWarningsState();
      updateSubmitState();
    });
  });
  form.querySelectorAll('input[name="teacher-audience"]').forEach((el) => {
    el.addEventListener("change", () => {
      resetWarningsState();
      updateConditionalFields();
      updateSubmitState();
    });
  });

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      resetWarningsState();
      updateConditionalFields();
      updateSubmitState();
    });
  }

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      resetWarningsState();
      clearError();
      updateSubmitState();
    });
    el.addEventListener("change", () => {
      resetWarningsState();
      clearError();
      updateSubmitState();
    });
  });

  if (emailField) {
    emailField.addEventListener("input", scheduleEmailValidation);
    emailField.addEventListener("blur", () => {
      emailTouched = true;
      updateEmailFieldValidation(true);
    });
  }

  if (experienceField) {
    experienceField.addEventListener("input", () => {
      updateWordCount();
      updateTextQualityHint();
    });
    updateWordCount();
    updateTextQualityHint();
  }

  if (warningFixBtn) {
    warningFixBtn.addEventListener("click", () => {
      resetWarningsState();
      const { warnings } = validateForm();
      const first = warnings[0]?.el;
      if (first && typeof first.focus === "function") first.focus();
    });
  }

  if (warningProceedBtn) {
    warningProceedBtn.addEventListener("click", () => {
      warningsAcknowledged = true;
      hideWarnings();
      attemptSubmit();
    });
  }

  applyCategoryFromUrl();
  updateConditionalFields();
  updateSubmitState();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    attemptSubmit();
  });
})();
