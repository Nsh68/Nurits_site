function initImageMover(options) {
  const page = document.querySelector(options.pageSelector);
  const target = document.querySelector(options.targetSelector);
  const toolbar = document.getElementById(options.toolbarId);
  const toggleBtn = document.getElementById(options.toggleBtnId);
  const resetBtn = document.getElementById(options.resetBtnId);
  const upBtn = document.getElementById(options.upBtnId);
  const downBtn = document.getElementById(options.downBtnId);
  const leftBtn = document.getElementById(options.leftBtnId);
  const rightBtn = document.getElementById(options.rightBtnId);
  const hint = document.getElementById(options.hintId);

  if (!page || !target || !toolbar || !toggleBtn || !resetBtn) return;

  const storageKey = options.storageKey;
  const cssVarX = options.cssVarX;
  const cssVarY = options.cssVarY;
  const step = options.step ?? 10;

  const defaults = {
    x: options.defaultX ?? 0,
    y: options.defaultY ?? 0,
  };

  let editing = false;
  let dragState = null;
  let state = load();

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      return {
        x: typeof parsed.x === "number" ? parsed.x : defaults.x,
        y: typeof parsed.y === "number" ? parsed.y : defaults.y,
      };
    } catch {
      return { ...defaults };
    }
  }

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }

  function apply() {
    page.style.setProperty(cssVarX, `${state.x}px`);
    page.style.setProperty(cssVarY, `${state.y}px`);
  }

  function setEditing(on) {
    editing = on;
    page.classList.toggle("is-image-editing", on);
    document.body.classList.toggle("is-image-editing", on);
    toggleBtn.setAttribute("aria-pressed", on ? "true" : "false");
    toggleBtn.textContent = on ? "סיום הזזה" : "הזז תמונה";
    if (hint) hint.hidden = !on;
  }

  function nudge(dx, dy) {
    state.x = clamp(state.x + dx, -800, 800);
    state.y = clamp(state.y + dy, -800, 800);
    apply();
    save();
  }

  function onPointerDown(event) {
    if (!editing) return;
    if (event.button !== undefined && event.button !== 0) return;
    if (!target.contains(event.target)) return;

    event.preventDefault();

    const rect = target.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: state.x,
      baseY: state.y,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
  }

  function onPointerMove(event) {
    if (!dragState) return;
    if (event.pointerId !== undefined && dragState.pointerId !== event.pointerId) return;

    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    state.x = clamp(dragState.baseX + dx, -800, 800);
    state.y = clamp(dragState.baseY + dy, -800, 800);
    apply();
  }

  function onPointerUp(event) {
    if (!dragState) return;
    if (event.pointerId !== undefined && dragState.pointerId !== event.pointerId) return;
    dragState = null;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    save();
  }

  toggleBtn.addEventListener("click", () => setEditing(!editing));
  resetBtn.addEventListener("click", () => {
    state = { ...defaults };
    apply();
    save();
  });

  if (upBtn) upBtn.addEventListener("click", () => nudge(0, -step));
  if (downBtn) downBtn.addEventListener("click", () => nudge(0, step));
  if (leftBtn) leftBtn.addEventListener("click", () => nudge(-step, 0));
  if (rightBtn) rightBtn.addEventListener("click", () => nudge(step, 0));

  target.addEventListener("pointerdown", onPointerDown);

  apply();
  setEditing(false);
}

(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(() => {
    try {
      initImageMover({
        pageSelector: ".page--lectures",
        targetSelector: ".page--lectures .lectures-visual-wrap",
        toolbarId: "image-move-toolbar-lectures",
        toggleBtnId: "image-move-toggle-lectures",
        resetBtnId: "image-move-reset-lectures",
        upBtnId: "image-move-up-lectures",
        downBtnId: "image-move-down-lectures",
        leftBtnId: "image-move-left-lectures",
        rightBtnId: "image-move-right-lectures",
        hintId: "image-move-hint-lectures",
        storageKey: "nurit-site-image-move-lectures-v1",
        cssVarX: "--lectures-image-x",
        cssVarY: "--lectures-image-y",
        defaultX: 0,
        defaultY: 0,
        step: 12,
      });

      initImageMover({
        pageSelector: ".page--training",
        targetSelector: ".page--training .training-testimonials",
        toolbarId: "image-move-toolbar-training-testimonials",
        toggleBtnId: "image-move-toggle-training-testimonials",
        resetBtnId: "image-move-reset-training-testimonials",
        upBtnId: "image-move-up-training-testimonials",
        downBtnId: "image-move-down-training-testimonials",
        leftBtnId: "image-move-left-training-testimonials",
        rightBtnId: "image-move-right-training-testimonials",
        hintId: "image-move-hint-training-testimonials",
        storageKey: "nurit-site-image-move-training-testimonials-v1",
        cssVarX: "--training-testimonials-x",
        cssVarY: "--training-testimonials-y",
        defaultX: 0,
        defaultY: 0,
        step: 12,
      });
    } catch {
      /* ignore */
    }
  });
})();

