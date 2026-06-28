const nav = document.querySelector("[data-nav]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktopInteractive = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isHomePage = window.location.pathname === "/" || window.location.pathname.endsWith("/index.html");
const canUseCursorEffects = () => isDesktopInteractive && window.innerWidth >= 900;

const initStarfield = () => {
  if (reduceMotion) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.className = "starfield-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);

  let aura = null;
  let readout = null;
  if (canUseCursorEffects()) {
    aura = document.createElement("div");
    readout = document.createElement("div");
    aura.className = "cursor-aura";
    readout.className = "cursor-readout";
    aura.setAttribute("aria-hidden", "true");
    readout.setAttribute("aria-hidden", "true");
    document.body.prepend(aura);
    document.body.prepend(readout);
  }

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let stars = [];
  const pointer = { x: -9999, y: -9999, active: false };
  const colors = ["rgba(255,255,255,", "rgba(216,180,254,", "rgba(192,132,252,"];

  const makeStar = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    baseSize: 0.7 + Math.random() * 2.4,
    vx: (Math.random() - 0.5) * 0.76,
    vy: (Math.random() - 0.5) * 0.76,
    pulse: Math.random() * Math.PI * 2,
    twinkle: 0.018 + Math.random() * 0.04,
    color: colors[Math.floor(Math.random() * colors.length)],
  });

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const targetCount = Math.min(260, Math.max(120, Math.floor((width * height) / 7800)));
    stars = Array.from({ length: targetCount }, makeStar);
  };

  const movePointer = (event) => {
    if (!canUseCursorEffects()) return;

    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    document.body.classList.add("cursor-active");
    document.documentElement.style.setProperty("--cursor-x", `${pointer.x}px`);
    document.documentElement.style.setProperty("--cursor-y", `${pointer.y}px`);
  };

  const hidePointer = () => {
    pointer.active = false;
    document.body.classList.remove("cursor-active");
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
      if (pointer.active && canUseCursorEffects()) {
        const dx = star.x - pointer.x;
        const dy = star.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const radius = 150;

        if (distance < radius && distance > 0.1) {
          const push = (1 - distance / radius) * 8.2;
          star.x += (dx / distance) * push;
          star.y += (dy / distance) * push;
        }
      }

      star.x += star.vx;
      star.y += star.vy;
      star.pulse += star.twinkle;

      if (star.x < -12) star.x = width + 12;
      if (star.x > width + 12) star.x = -12;
      if (star.y < -12) star.y = height + 12;
      if (star.y > height + 12) star.y = -12;

      const glow = 0.34 + Math.sin(star.pulse) * 0.22;
      const size = star.baseSize + glow;
      ctx.beginPath();
      ctx.fillStyle = `${star.color}${0.42 + glow})`;
      ctx.shadowBlur = 16 + size * 4;
      ctx.shadowColor = "#c084fc";
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fill();

      if (star.baseSize > 2.2) {
        ctx.strokeStyle = `${star.color}0.26)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(star.x - size * 3.5, star.y);
        ctx.lineTo(star.x + size * 3.5, star.y);
        ctx.moveTo(star.x, star.y - size * 3.5);
        ctx.lineTo(star.x, star.y + size * 3.5);
        ctx.stroke();
      }

      if (pointer.active && canUseCursorEffects()) {
        const lineDistance = Math.hypot(star.x - pointer.x, star.y - pointer.y);
        if (lineDistance < 190) {
          ctx.strokeStyle = `rgba(216, 180, 254, ${0.22 * (1 - lineDistance / 190)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
    }

    if (pointer.active && canUseCursorEffects()) {
      const ringPulse = 6 * Math.sin(performance.now() * 0.006);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 148 + ringPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(192, 132, 252, 0.2)";
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 78 - ringPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  if (canUseCursorEffects()) {
    window.addEventListener("pointermove", movePointer, { passive: true });
    window.addEventListener("pointerleave", hidePointer);
  }
};

initStarfield();

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const updateScrollStory = () => {
  const hero = document.querySelector(".hero");
  const story = document.querySelector(".home-story");

  if (isHomePage) {
    hero?.style.setProperty("--hero-progress", "0");
    story?.style.setProperty("--story-progress", "0");
    return;
  }

  hero?.style.removeProperty("--hero-progress");
  story?.style.removeProperty("--story-progress");
};

updateScrollStory();
window.addEventListener("scroll", updateScrollStory, { passive: true });
window.addEventListener("resize", updateScrollStory, { passive: true });

const setNavState = () => {
  nav?.classList.toggle("scrolled", window.scrollY > 16);
};

setNavState();
window.addEventListener("scroll", setNavState, { passive: true });

menuToggle?.addEventListener("click", () => {
  menu?.classList.toggle("open");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 6, 5) * 55}ms`;
  revealObserver.observe(el);
});

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const duration = 1300;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.55 }
);

document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

const handleImageFailure = (img) => {
  const parent = img.closest(".hero-visual, .member-card, .brand, .event-with-media");
  if (!parent) return;
  if (parent.classList.contains("member-card") && !parent.dataset.initial) {
    const name = parent.querySelector("h3")?.textContent.trim() || "MM";
    parent.dataset.initial = name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  parent.classList.add("image-failed");
};

document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", () => handleImageFailure(img));
  if (img.complete && img.naturalWidth === 0) handleImageFailure(img);
});

const parallax = document.querySelector("[data-parallax]");
window.addEventListener(
  "scroll",
  () => {
    if (!parallax || reduceMotion || !isDesktopInteractive || !isHomePage) return;
    parallax.style.transform = `translateY(${window.scrollY * 0.04}px)`;
  },
  { passive: true }
);

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

if (!reduceMotion && canUseCursorEffects()) {
  const hoverSelector = [
    ".hero-copy",
    ".hero-visual",
    ".story-panel",
    ".event-card",
    ".feature-card",
    ".section-copy",
    ".stat-card",
    ".member-card",
    ".robot-card",
    ".timeline-card",
    ".season-photo-slot",
    ".robot-photo-slot",
    ".video-frame",
    ".tab-list button",
    ".btn",
    ".nav-links a",
    ".footer-links a",
    ".socials a",
  ].join(", ");

  const readout = document.querySelector(".cursor-readout");

  const labelFor = (el) =>
    el.dataset.hoverLabel ||
    el.querySelector("h1, h2, h3, strong")?.textContent?.trim() ||
    el.textContent.trim().split(/\s+/).slice(0, 4).join(" ");

  document.querySelectorAll(hoverSelector).forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const isSmall = el.matches(".btn, .nav-links a, .footer-links a, .socials a, .tab-list button");
      const scale = isSmall ? 1.1 : 1.055;
      const lift = isSmall ? -2 : -10;
      el.style.setProperty("--local-x", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--local-y", `${(y + 0.5) * 100}%`);
      el.style.setProperty("--hover-spot", "1");
      el.style.transform = `perspective(900px) rotateX(${-y * 9}deg) rotateY(${x * 11}deg) translateY(${lift}px) scale(${scale})`;
      if (readout) {
        readout.textContent = labelFor(el);
        readout.classList.add("active");
      }
    });

    el.addEventListener("pointerleave", () => {
      el.style.removeProperty("--hover-spot");
      el.style.transform = "";
      readout?.classList.remove("active");
    });
  });
}
