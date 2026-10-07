const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");

menuToggle?.addEventListener("click", () => {
  const open = menu?.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(Boolean(open)));
});

document.querySelectorAll("[data-tabs]").forEach((tabs) => {
  const buttons = tabs.querySelectorAll("[data-tab]");
  const panels = tabs.querySelectorAll("[data-panel]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === target);
      });
    });
  });
});

// Hide photos that fail to load instead of showing a broken-image icon
document.querySelectorAll("img").forEach((img) => {
  const hide = () => (img.style.visibility = "hidden");
  img.addEventListener("error", hide);
  if (img.complete && img.naturalWidth === 0) hide();
});

// Starfield: fills the whole viewport on the home page, and just the header band on
// text-only page headers. Stars are stamped from pre-rendered sprites (no per-frame blur)
// and the loop stops whenever the canvas is off screen or the tab is hidden.
const initStarfield = (host, fixed) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.className = fixed ? "starfield starfield-fixed" : "starfield";
  canvas.setAttribute("aria-hidden", "true");
  host.prepend(canvas);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const colors = ["255,255,255", "216,190,250", "196,161,245"];
  const SPRITE = 48;
  const PUSH_RADIUS = 120;
  const LINE_RADIUS = 190;

  const sprites = colors.map((rgb) => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = SPRITE;
    const sctx = sprite.getContext("2d");
    const half = SPRITE / 2;
    const gradient = sctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, `rgba(${rgb},1)`);
    gradient.addColorStop(0.16, `rgba(${rgb},0.9)`);
    gradient.addColorStop(0.36, "rgba(170,120,240,0.26)");
    gradient.addColorStop(1, "rgba(170,120,240,0)");
    sctx.fillStyle = gradient;
    sctx.fillRect(0, 0, SPRITE, SPRITE);
    return sprite;
  });

  let width = 0;
  let height = 0;
  let stars = [];
  let frame = 0;
  let onScreen = true;
  const pointer = { x: -9999, y: -9999 };

  const makeStar = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 0.6 + Math.random() * 1.9,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    pulse: Math.random() * Math.PI * 2,
    twinkle: 0.012 + Math.random() * 0.028,
    color: Math.floor(Math.random() * colors.length),
  });

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(216, 190, 250)";

    for (const star of stars) {
      const dx = star.x - pointer.x;
      const dy = star.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < PUSH_RADIUS && distance > 0.1) {
        const push = (1 - distance / PUSH_RADIUS) * 3;
        star.x += (dx / distance) * push;
        star.y += (dy / distance) * push;
      }

      star.x += star.vx;
      star.y += star.vy;
      star.pulse += star.twinkle;

      if (star.x < -10) star.x = width + 10;
      if (star.x > width + 10) star.x = -10;
      if (star.y < -10) star.y = height + 10;
      if (star.y > height + 10) star.y = -10;

      const glow = 0.5 + Math.sin(star.pulse) * 0.3;
      const drawSize = (star.size + glow) * 6;
      ctx.globalAlpha = 0.3 + glow * 0.6;
      ctx.drawImage(sprites[star.color], star.x - drawSize / 2, star.y - drawSize / 2, drawSize, drawSize);

      // Thin line tying each nearby star to the cursor, fading out with distance
      const lineDistance = Math.hypot(star.x - pointer.x, star.y - pointer.y);
      if (lineDistance < LINE_RADIUS) {
        ctx.globalAlpha = 0.3 * (1 - lineDistance / LINE_RADIUS);
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;

    // Ring marking the area that pushes stars away from the cursor
    if (pointer.x > -PUSH_RADIUS && pointer.x < width + PUSH_RADIUS && pointer.y > -PUSH_RADIUS && pointer.y < height + PUSH_RADIUS) {
      const ringPulse = 4 * Math.sin(performance.now() * 0.004);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(196, 161, 245, 0.34)";
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, PUSH_RADIUS + ringPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(196, 161, 245, 0.16)";
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, PUSH_RADIUS * 0.5 - ringPulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const loop = () => {
    draw();
    frame = requestAnimationFrame(loop);
  };

  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (reduceMotion) draw();
    else if (onScreen && !document.hidden) loop();
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({ length: Math.min(110, Math.max(24, Math.floor((width * height) / 13000))) }, makeStar);
    sync();
  };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", sync);

  if (!fixed) {
    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    }).observe(canvas);
  }

  if (finePointer && !reduceMotion) {
    window.addEventListener(
      "pointermove",
      (event) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      },
      { passive: true }
    );
    document.documentElement.addEventListener("pointerleave", () => {
      pointer.x = pointer.y = -9999;
    });
  }
};

if (document.querySelector(".hero")) {
  initStarfield(document.body, true);
} else {
  document.querySelectorAll(".page-head").forEach((head) => initStarfield(head, false));
}
