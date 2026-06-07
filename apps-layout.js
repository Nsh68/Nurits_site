(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(initAppsLayoutEditor);
})();

function initAppsLayoutEditor() {
  const page = document.querySelector(".page--apps");
  const canvas = document.getElementById("apps-layout-canvas");
  const textEl = document.getElementById("apps-layout-text");
  const imageEl = document.getElementById("apps-layout-image");
  const imageImg = imageEl ? imageEl.querySelector("img") : null;
  const toggleBtn = document.getElementById("apps-layout-toggle");
  const resetBtn = document.getElementById("apps-layout-reset");
  const rotateInput = document.getElementById("apps-layout-rotate");
  const rotateValue = document.getElementById("apps-layout-rotate-value");
  const rotateWrap = document.getElementById("apps-layout-rotate-wrap");
  const hint = document.getElementById("apps-layout-hint");

  if (!page || !canvas || !textEl || !imageEl || !toggleBtn) return;

  const STORAGE_KEY = "nurit-site-apps-layout-v1";
  const IMAGE_SCALE = 0.9;
  const DEFAULTS = {
    text: { x: 32, y: 0, w: 58 },
    image: { x: 0, y: 0, w: 43.2, rotate: 32 },
  };

  let layout = loadLayout();
  let editing = false;
  let dragState = null;

  function cloneLayout(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function loadLayout() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneLayout(DEFAULTS);
      const parsed = JSON.parse(raw);
      return {
        text: { ...DEFAULTS.text, ...parsed.text },
        image: { ...DEFAULTS.image, ...parsed.image },
      };
    } catch {
      return cloneLayout(DEFAULTS);
    }
  }

  function saveLayout() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      /* ignore */
    }
  }

  function isStackedLayout() {
    return window.matchMedia("(max-width: 900px)").matches && !editing;
  }

  function constrainLayout() {
    if (layout.text.x < 0) layout.text.x = 0;
    if (layout.text.w > 96) layout.text.w = 96;
    if (layout.text.x + layout.text.w > 99.5) {
      layout.text.x = Math.max(0, Math.round((99.5 - layout.text.w) * 10) / 10);
    }
  }

  function applyLayout() {
    constrainLayout();
    const imageW = Math.round(layout.image.w * IMAGE_SCALE * 10) / 10;

    page.style.setProperty("--apps-text-x", `${layout.text.x}%`);
    page.style.setProperty("--apps-text-y", `${layout.text.y}%`);
    page.style.setProperty("--apps-text-w", `${layout.text.w}%`);
    page.style.setProperty("--apps-image-x", `${layout.image.x}%`);
    page.style.setProperty("--apps-image-y", `${layout.image.y}%`);
    page.style.setProperty("--apps-image-w", `${imageW}%`);
    page.style.setProperty("--apps-image-rotate", `${layout.image.rotate}deg`);

    if (isStackedLayout()) {
      textEl.style.left = "";
      textEl.style.top = "";
      textEl.style.width = "";
      imageEl.style.left = "";
      imageEl.style.top = "";
      imageEl.style.width = "";
    } else {
      const important = editing ? "important" : "";
      textEl.style.setProperty("left", `${layout.text.x}%`, important);
      textEl.style.setProperty("top", `${layout.text.y}%`, important);
      textEl.style.setProperty("width", `${layout.text.w}%`, important);
      imageEl.style.setProperty("left", `${layout.image.x}%`, important);
      imageEl.style.setProperty("top", `${layout.image.y}%`, important);
      imageEl.style.setProperty("width", `${imageW}%`, important);
      textEl.style.position = "absolute";
      imageEl.style.position = "absolute";
    }

    if (imageImg) {
      imageImg.style.transform = `rotate(${layout.image.rotate}deg)`;
    }

    if (rotateInput) rotateInput.value = String(layout.image.rotate);
    if (rotateValue) rotateValue.textContent = `${layout.image.rotate}°`;

    requestAnimationFrame(updateCanvasHeight);
  }

  function updateCanvasHeight() {
    let maxBottom = 0;
    [textEl, imageEl].forEach((el) => {
      const bottom = el.offsetTop + el.offsetHeight;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    canvas.style.minHeight = `${Math.max(maxBottom + 40, 400)}px`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setEditing(on) {
    editing = on;
    page.classList.toggle("is-layout-editing", on);
    toggleBtn.setAttribute("aria-pressed", on ? "true" : "false");
    toggleBtn.textContent = on ? "סיום גרירה" : "גרור ומקם אלמנטים";
    if (rotateWrap) rotateWrap.hidden = !on;
    if (hint) hint.hidden = !on;
    applyLayout();
    updateCanvasHeight();
  }

  function onPointerDown(event) {
    if (!editing) return;

    const item = event.target.closest(".apps-layout-item");
    if (!item || !canvas.contains(item)) return;
    if (event.button !== undefined && event.button !== 0) return;

    event.preventDefault();

    const id = item.dataset.layoutId;
    if (!id || !layout[id]) return;

    item.classList.add("is-dragging");

    const rect = canvas.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    dragState = {
      id,
      item,
      pointerId: event.pointerId,
      offsetX: event.clientX - itemRect.left,
      offsetY: event.clientY - itemRect.top,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(event) {
    if (!dragState) return;
    if (event.pointerId !== undefined && dragState.pointerId !== event.pointerId) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    let x =
      ((event.clientX - rect.left - dragState.offsetX) / dragState.canvasWidth) *
      100;
    let y =
      ((event.clientY - rect.top - dragState.offsetY) / dragState.canvasHeight) *
      100;

    const w = layout[dragState.id].w;
    x = clamp(x, -4, 100 - w + 4);
    y = clamp(y, -6, 92);

    layout[dragState.id].x = Math.round(x * 10) / 10;
    layout[dragState.id].y = Math.round(y * 10) / 10;
    applyLayout();
  }

  function onPointerUp(event) {
    if (!dragState) return;
    if (event.pointerId !== undefined && dragState.pointerId !== event.pointerId) {
      return;
    }

    dragState.item.classList.remove("is-dragging");
    dragState = null;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    saveLayout();
    updateCanvasHeight();
  }

  function toggleEditing() {
    setEditing(!editing);
  }

  toggleBtn.addEventListener("click", toggleEditing);

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      layout = cloneLayout(DEFAULTS);
      saveLayout();
      applyLayout();
    });
  }

  if (rotateInput) {
    rotateInput.addEventListener("input", () => {
      layout.image.rotate = Number(rotateInput.value);
      if (rotateValue) rotateValue.textContent = `${layout.image.rotate}°`;
      applyLayout();
      saveLayout();
    });
  }

  [textEl, imageEl].forEach((item) => {
    item.addEventListener("pointerdown", onPointerDown);
  });

  window.addEventListener("resize", applyLayout);

  window.toggleAppsLayoutEdit = toggleEditing;

  applyLayout();
}
