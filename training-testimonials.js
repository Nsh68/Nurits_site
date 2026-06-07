(() => {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function parseSnippet(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    return Array.from(tpl.content.querySelectorAll("article.testimonial")).map((a) => {
      const time = a.querySelector("time")?.textContent?.trim() ?? "";
      const message = a.querySelector("p")?.textContent?.trim() ?? "";
      return { time, message };
    });
  }

  function render(items, mount) {
    if (!items.length) {
      mount.textContent = "אין תגובות להצגה כרגע.";
      return;
    }

    const list = document.createElement("div");
    list.className = "training-testimonials__list";

    for (const item of items) {
      const row = document.createElement("div");
      row.className = "training-testimonial";

      const meta = document.createElement("div");
      meta.className = "training-testimonial__meta";

      const timeEl = document.createElement("time");
      timeEl.className = "training-testimonial__time";
      timeEl.textContent = item.time;
      meta.appendChild(timeEl);

      const msg = document.createElement("p");
      msg.className = "training-testimonial__message";
      msg.textContent = item.message;

      row.appendChild(meta);
      row.appendChild(msg);
      list.appendChild(row);
    }

    mount.replaceChildren(list);
  }

  function fitTestimonialsPanel() {
    const section = document.querySelector(".training-testimonials");
    const alignTarget = document.querySelector(".training-page__title--section");
    const stack = document.querySelector(".training-visual-stack");
    const lastPanel = document.querySelector(
      ".training-grid__content .training-panel-list:last-of-type .training-panel-list__item:last-child"
    );
    if (!section || !alignTarget || !lastPanel || !stack) return;

    if (window.matchMedia("(max-width: 900px)").matches) {
      section.style.position = "";
      section.style.top = "";
      section.style.left = "";
      section.style.right = "";
      section.style.width = "";
      section.style.height = "";
      section.style.marginTop = "";
      return;
    }

    const stackRect = stack.getBoundingClientRect();
    const targetRect = alignTarget.getBoundingClientRect();
    const lastRect = lastPanel.getBoundingClientRect();
    const top = targetRect.top - stackRect.top;
    const height = lastRect.bottom - targetRect.top;
    const card = document.querySelector(".training-testimonial");
    const list = document.querySelector(".training-testimonials__list");
    let rowExtra = 75;
    if (card && list) {
      const gap = parseFloat(getComputedStyle(list).gap) || 0;
      rowExtra = card.offsetHeight + gap;
    }

    section.style.position = "absolute";
    section.style.top = `${Math.round(Math.max(0, top))}px`;
    section.style.left = "0";
    section.style.right = "0";
    section.style.width = "100%";
    section.style.marginTop = "0";
    section.style.height = `${Math.round(Math.max(220, height + rowExtra - 30))}px`;
  }

  ready(async () => {
    const mount = document.getElementById("training-testimonials");
    if (!mount) return;

    try {
      const res = await fetch("assets/testimonials_snippet.html", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const html = await res.text();
      const items = parseSnippet(html);
      render(items, mount);
      requestAnimationFrame(() => {
        fitTestimonialsPanel();
        requestAnimationFrame(fitTestimonialsPanel);
      });
    } catch {
      mount.textContent = "לא ניתן לטעון תגובות כרגע.";
    }

    const img = document.querySelector(".training-grid__visual img");
    if (img && !img.complete) {
      img.addEventListener("load", fitTestimonialsPanel, { once: true });
    }

    window.addEventListener("resize", fitTestimonialsPanel);
    if (document.fonts?.ready) {
      document.fonts.ready.then(fitTestimonialsPanel);
    }
  });
})();

