(function () {
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const messageField = document.getElementById("message");
  const wordCountEl = document.getElementById("word-count");
  const MAX_WORDS = 200;

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

})();
