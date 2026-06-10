(function () {
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
  const maxStoredMessages = 40;

  let client = null;
  let isSending = false;
  const history = [];

  function getSupabaseClient() {
    if (client) return client;

    const config = window.SUPABASE_CONFIG;
    if (!config?.url || !config?.anonKey || typeof window.supabase === "undefined") {
      return null;
    }

    client = window.supabase.createClient(config.url, config.anonKey);
    return client;
  }

  function loadStoredState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.ui) || !Array.isArray(parsed.history)) return null;
      return parsed;
    } catch (_error) {
      return null;
    }
  }

  function saveState(uiMessages) {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ui: uiMessages.slice(-maxStoredMessages),
          history: history.slice(-maxStoredMessages),
        })
      );
    } catch (_error) {
      // Ignore quota or private-mode storage errors.
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

  function addMessage(list, role, text, uiMessages, persist = true) {
    renderMessage(list, role, text);
    if (persist && uiMessages) {
      uiMessages.push({ role, content: text });
      saveState(uiMessages);
    }
  }

  function restoreMessages(list, uiMessages) {
    list.textContent = "";
    uiMessages.forEach((message) => {
      renderMessage(list, message.role, message.content);
    });
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
    saveState(uiMessages);
    setStatus(statusEl, "");
    setSending(sendButton, textarea, true);

    try {
      const { data, error } = await supabaseClient.functions.invoke("chat", {
        body: { messages: history.slice(-maxMessagesForChat) },
      });

      if (error) throw error;

      const reply =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : fallbackKnowledgeMessage;
      addMessage(list, "assistant", reply, uiMessages);
      history.push({ role: "assistant", content: reply });
      saveState(uiMessages);
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

    const stored = loadStoredState();
    const uiMessages = stored?.ui?.length
      ? stored.ui.slice()
      : [{ role: "assistant", content: welcomeMessage }];

    if (stored?.history?.length) {
      stored.history.forEach((message) => history.push(message));
    }

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
    restoreMessages(list, uiMessages);

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
