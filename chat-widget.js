(function () {
  const unavailableMessage =
    "הצ'אט אינו זמין כרגע. נשמח לחזור אליכם בנושא זה טלפונית.";
  const fallbackKnowledgeMessage =
    "איני יודעת לענות על כך מתוך המידע הקיים באתר. נשמח לחזור אליכם בנושא זה טלפונית.";
  const tooLongMessage =
    "השאלה ארוכה מדי לצ'אט. אנא קצרו אותה לעד 800 תווים ושלחו שוב.";
  const maxMessageChars = 800;
  const maxMessagesForChat = 8;

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

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function addMessage(list, role, text) {
    const item = createElement(
      "div",
      `chat-widget__message chat-widget__message--${role}`
    );
    item.textContent = text;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
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

  async function sendMessage({ list, statusEl, textarea, sendButton }) {
    const text = textarea.value.trim();
    if (!text || isSending) return;

    if (text.length > maxMessageChars) {
      setStatus(statusEl, tooLongMessage);
      return;
    }

    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
      setStatus(statusEl, unavailableMessage);
      addMessage(list, "assistant", unavailableMessage);
      return;
    }

    textarea.value = "";
    addMessage(list, "user", text);
    history.push({ role: "user", content: text });
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
      addMessage(list, "assistant", reply);
      history.push({ role: "assistant", content: reply });
    } catch (error) {
      console.warn("Chat function failed:", error);
      setStatus(statusEl, unavailableMessage);
      addMessage(list, "assistant", unavailableMessage);
    } finally {
      setSending(sendButton, textarea, false);
      textarea.focus();
    }
  }

  function initChatWidget() {
    if (document.querySelector(".chat-widget")) return;

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
    addMessage(
      list,
      "assistant",
      "שלום ותודה על הפנייה! אני המזכירה של נורית — אשמח לעזור במה שמופיע באתר: הרצאות, הדרכות או אפליקציות."
    );

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
      sendMessage({ list, statusEl, textarea, sendButton });
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
