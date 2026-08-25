(function () {
  // Set to true to show the LLM assistant ("המזכירה") on the site again.
  const CHAT_WIDGET_ENABLED = false;
  if (!CHAT_WIDGET_ENABLED) return;

  const unavailableMessage =
    "הצ'אט אינו זמין כרגע. נשמח לחזור אליכם בנושא זה טלפונית.";
  const fallbackKnowledgeMessage =
    "איני יודעת לענות על כך מתוך המידע הקיים באתר. נשמח לחזור אליכם בנושא זה טלפונית.";
  const tooLongMessage =
    "השאלה ארוכה מדי לצ'אט. אנא קצרו אותה לעד 800 תווים ושלחו שוב.";
  const welcomeMessage =
    "שלום ותודה על הפנייה! אני המזכירה של נורית — אשמח לעזור במה שמופיע באתר: הרצאות, הדרכות או אפליקציות.";
  const storageKey = "nurit-chat-state-v2";
  const maxMessageChars = 800;
  const maxMessagesForChat = 8;
  const maxLectureContextChars = 12000;

  const lectureSources = [
    {
      path: "assets/microbiome.lecture.txt",
      label: "הרצאה על מיקרוביום, חיידקים ווירוסים",
      match(text) {
        if (/מיקרוב/i.test(text)) return true;
        if (/חיידק/i.test(text)) return true;
        if (/וירוס|ווירוס/i.test(text) && /ריפוי|אונקולוג|סרטן|ניצול/i.test(text)) {
          return false;
        }
        return /וירוס|ווירוס|microbiome/i.test(text);
      },
    },
    {
      path: "assets/epigenetics.lecture.txt",
      label: "הרצאה על אפיגנטיקה",
      match(text) {
        return /אפיגנט|epigenet/i.test(text);
      },
    },
    {
      path: "assets/basic genetic lecture.txt",
      label: "הרצאה על גנטיקה בסיסית",
      match(text) {
        if (/אפיגנט|מיקרוב|חיידק|וירוס|ווירוס|הנדסה גנטית/i.test(text)) {
          return false;
        }
        if (/גנטיקה בסיסית/i.test(text)) return true;
        return /(?:^|\s)גנטיק(?:ה|ת)\b|תורש(?:ה|ת)|מנדל|דנ\"א|\bdna\b/i.test(text);
      },
    },
    {
      path: "assets/Genetic engineering lecture.txt",
      label: "הרצאה על הנדסה גנטית",
      match(text) {
        return /הנדסה גנטית|genetic engineering/i.test(text);
      },
    },
    {
      path: "assets/Pricing.txt",
      label: "מחירי הרצאות וסדנאות",
      match(text) {
        return /מחיר|עלות|כמה עול|תמחור|pricing|price/i.test(text);
      },
    },
  ];

  let client = null;
  let isSending = false;
  const history = [];
  const loadedAssets = new Map();
  const sentContextPaths = new Set();

  function getSupabaseClient() {
    if (client) return client;

    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey || typeof window.supabase === "undefined") {
      return null;
    }

    client = window.supabase.createClient(config.url, config.anonKey);
    return client;
  }

  function clearPersistedState() {
    try {
      localStorage.removeItem(storageKey);
    } catch (_error) {
      // Ignore private-mode storage errors.
    }
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function renderMessage(list, role, text) {
    const item = createElement(
      "div",
      `chat-widget__message chat-widget__message--${role}`
    );
    item.textContent = text;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
  }

  function addMessage(list, role, text, uiMessages) {
    renderMessage(list, role, text);
    if (uiMessages) {
      uiMessages.push({ role, content: text });
    }
  }

  function resetChatSession(list, uiMessages) {
    history.length = 0;
    uiMessages.length = 0;
    uiMessages.push({ role: "assistant", content: welcomeMessage });
    list.textContent = "";
    renderMessage(list, "assistant", welcomeMessage);
    loadedAssets.clear();
    sentContextPaths.clear();
    clearPersistedState();
  }

  function setStatus(statusEl, text) {
    statusEl.textContent = text || "";
    statusEl.hidden = !text;
  }

  function setSending(button, textarea, sending) {
    isSending = sending;
    button.disabled = sending;
    textarea.disabled = sending;
    button.textContent = sending ? "שולחת..." : "שליחה";
  }

  function buildMatchText(currentText) {
    const recent = history
      .slice(-4)
      .map((message) => message.content)
      .join(" ");
    return `${recent} ${currentText}`.trim();
  }

  function getMatchingSources(text) {
    return lectureSources.filter((source) => source.match(text));
  }

  async function loadAsset(path) {
    if (loadedAssets.has(path)) {
      return loadedAssets.get(path);
    }

    try {
      const response = await fetch(encodeURI(path), { cache: "no-store" });
      if (!response.ok) return null;
      const content = (await response.text()).trim();
      if (!content) return null;
      loadedAssets.set(path, content);
      return content;
    } catch (_error) {
      return null;
    }
  }

  async function getRelevantLectureContext(text) {
    const matchText = buildMatchText(text);
    const sources = getMatchingSources(matchText);
    if (!sources.length) return null;

    const newSources = sources.filter((source) => !sentContextPaths.has(source.path));
    if (!newSources.length) return null;

    const sections = [];
    for (const source of newSources) {
      const content = await loadAsset(source.path);
      if (content) {
        sections.push(`=== ${source.label} ===\n${content}`);
        sentContextPaths.add(source.path);
      }
    }

    if (!sections.length) return null;

    const combined = sections.join("\n\n");
    return combined.length > maxLectureContextChars
      ? combined.slice(0, maxLectureContextChars)
      : combined;
  }

  async function sendMessage({ list, statusEl, textarea, sendButton, uiMessages }) {
    const text = textarea.value.trim();
    if (!text || isSending) return;

    if (text.length > maxMessageChars) {
      setStatus(statusEl, tooLongMessage);
      return;
    }

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      setStatus(statusEl, unavailableMessage);
      addMessage(list, "assistant", unavailableMessage, uiMessages);
      return;
    }

    textarea.value = "";
    addMessage(list, "user", text, uiMessages);
    history.push({ role: "user", content: text });
    setStatus(statusEl, "");
    setSending(sendButton, textarea, true);

    try {
      const lectureContext = await getRelevantLectureContext(text);
      const body = { messages: history.slice(-maxMessagesForChat) };
      if (lectureContext) {
        body.lectureContext = lectureContext;
      }

      const { data, error } = await supabaseClient.functions.invoke("chat", {
        body,
      });

      if (error) throw error;

      const reply =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : fallbackKnowledgeMessage;
      addMessage(list, "assistant", reply, uiMessages);
      history.push({ role: "assistant", content: reply });
    } catch (error) {
      console.warn("Chat function failed:", error);
      setStatus(statusEl, unavailableMessage);
      renderMessage(list, "assistant", unavailableMessage);
    } finally {
      setSending(sendButton, textarea, false);
      textarea.focus();
    }
  }

  function initChatWidget() {
    if (document.querySelector(".chat-widget")) return;

    clearPersistedState();

    const uiMessages = [{ role: "assistant", content: welcomeMessage }];

    const root = createElement("section", "chat-widget");
    root.setAttribute("aria-label", "צ'אט מידע");

    const toggle = createElement("button", "chat-widget__toggle", "שאלי אותי");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");

    const panel = createElement("div", "chat-widget__panel");
    panel.hidden = true;

    const header = createElement("div", "chat-widget__header");
    const title = createElement("div", "chat-widget__title", "המזכירה של נורית");
    const close = createElement("button", "chat-widget__close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "סגירת הצ'אט");
    header.append(title, close);

    const list = createElement("div", "chat-widget__messages");
    list.setAttribute("aria-live", "polite");
    renderMessage(list, "assistant", welcomeMessage);

    const statusEl = createElement("p", "chat-widget__status");
    statusEl.hidden = true;

    const form = createElement("form", "chat-widget__form");
    const textarea = createElement("textarea", "chat-widget__input");
    textarea.name = "chat-message";
    textarea.rows = 2;
    textarea.maxLength = maxMessageChars;
    textarea.placeholder = "כתבו שאלה קצרה...";
    textarea.setAttribute("aria-label", "שאלה לצ'אט");

    const sendButton = createElement("button", "chat-widget__send", "שליחה");
    sendButton.type = "submit";
    form.append(textarea, sendButton);

    panel.append(header, list, statusEl, form);
    root.append(toggle, panel);
    document.body.appendChild(root);

    function openPanel() {
      panel.hidden = false;
      root.classList.add("chat-widget--open");
      toggle.setAttribute("aria-expanded", "true");
      textarea.focus();
    }

    function closePanel() {
      resetChatSession(list, uiMessages);
      panel.hidden = true;
      root.classList.remove("chat-widget--open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }

    toggle.addEventListener("click", () => {
      if (panel.hidden) {
        openPanel();
      } else {
        closePanel();
      }
    });

    close.addEventListener("click", closePanel);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      sendMessage({ list, statusEl, textarea, sendButton, uiMessages });
    });

    textarea.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatWidget);
  } else {
    initChatWidget();
  }
})();
