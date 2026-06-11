(() => {
  const SESSION_LABELS = {
    lecture: "הרצאה",
    workshop: "סדנה",
    "lecture-workshop": "הרצאה + סדנה",
  };

  const TEACHER_AUDIENCE_LABELS = {
    "single-subject": null,
    "multi-subject": "מגוון מקצועות",
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function getClient() {
    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey || typeof window.supabase === "undefined") {
      return null;
    }
    return window.supabase.createClient(config.url, config.anonKey);
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value + "T12:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function renderCard(item) {
    const card = document.createElement("article");
    card.className = "feedback-card";

    const meta = document.createElement("div");
    meta.className = "feedback-card__meta";

    const author = document.createElement("span");
    author.className = "feedback-card__author";
    author.textContent = item.author_label || "אנונימי";
    meta.appendChild(author);

    const dateEl = document.createElement("time");
    dateEl.className = "feedback-card__date";
    dateEl.dateTime = item.event_date || "";
    dateEl.textContent = formatDate(item.event_date);
    meta.appendChild(dateEl);

    const tags = document.createElement("div");
    tags.className = "feedback-card__tags";

    if (item.session_type && SESSION_LABELS[item.session_type]) {
      const tag = document.createElement("span");
      tag.className = "feedback-card__tag";
      tag.textContent = SESSION_LABELS[item.session_type];
      tags.appendChild(tag);
    }

    if (item.category === "teachers") {
      const tag = document.createElement("span");
      tag.className = "feedback-card__tag";
      if (item.teacher_audience === "single-subject" && item.subject_name) {
        tag.textContent = item.subject_name.trim();
      } else if (item.teacher_audience === "multi-subject") {
        tag.textContent = TEACHER_AUDIENCE_LABELS["multi-subject"];
      }
      if (tag.textContent) tags.appendChild(tag);
    }

    const text = document.createElement("p");
    text.className = "feedback-card__text";
    text.textContent = item.experience_text || "";

    card.appendChild(meta);
    if (tags.childElementCount > 0) card.appendChild(tags);
    card.appendChild(text);
    return card;
  }

  function renderList(mount, items) {
    mount.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "testimonials-empty";
      empty.textContent = "בקרוב יופיעו כאן משובים.";
      mount.appendChild(empty);
      return;
    }

    const list = document.createElement("div");
    list.className = "testimonials-list__grid";
    for (const item of items) {
      list.appendChild(renderCard(item));
    }
    mount.appendChild(list);
  }

  function renderGallery(mount, _items) {
    mount.replaceChildren();
    mount.hidden = true;
  }

  async function loadCategory(client, category) {
    const listMount = document.querySelector(`[data-list="${category}"]`);
    const galleryMount = document.querySelector(`[data-gallery="${category}"]`);
    if (!listMount) return;

    const { data, error } = await client
      .from("participant_feedback_public")
      .select("*")
      .eq("category", category)
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Feedback load error:", error);
      listMount.replaceChildren();
      const err = document.createElement("p");
      err.className = "testimonials-empty";
      err.textContent = "לא ניתן לטעון משובים כרגע.";
      listMount.appendChild(err);
      return;
    }

    const items = data || [];
    if (galleryMount) renderGallery(galleryMount, items);
    renderList(listMount, items);
  }

  ready(async () => {
    const client = getClient();
    const categories = ["public-lecture", "teachers", "app-development"];

    if (!client) {
      for (const category of categories) {
        const mount = document.querySelector(`[data-list="${category}"]`);
        if (!mount) continue;
        mount.replaceChildren();
        const msg = document.createElement("p");
        msg.className = "testimonials-empty";
        msg.textContent = "חיבור למסד הנתונים לא הוגדר.";
        mount.appendChild(msg);
      }
      return;
    }

    await Promise.all(categories.map((c) => loadCategory(client, c)));

    const hash = window.location.hash.replace("#", "");
    const anchors = { public: "public", teachers: "teachers", apps: "apps" };
    if (hash && anchors[hash]) {
      const el = document.getElementById(anchors[hash]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
