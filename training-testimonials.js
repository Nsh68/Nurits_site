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

  ready(async () => {
    const mount = document.getElementById("training-testimonials");
    if (!mount) return;

    try {
      const res = await fetch("assets/testimonials_snippet.html", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      const html = await res.text();
      const items = parseSnippet(html);
      render(items, mount);
    } catch {
      mount.textContent = "לא ניתן לטעון תגובות כרגע.";
    }
  });
})();

