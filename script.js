const nav = document.querySelector("[data-nav]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initStarfield = () => {
  if (reduceMotion) return;

  const canvas = document.createElement("canvas");
  const aura = document.createElement("div");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.className = "starfield-canvas";
  aura.className = "cursor-aura";
  canvas.setAttribute("aria-hidden", "true");
  aura.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  document.body.prepend(aura);

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
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.22,
    pulse: Math.random() * Math.PI * 2,
    twinkle: 0.006 + Math.random() * 0.025,
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
      if (pointer.active) {
        const dx = star.x - pointer.x;
        const dy = star.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const radius = 150;

        if (distance < radius && distance > 0.1) {
          const push = (1 - distance / radius) * 5.2;
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

      if (pointer.active) {
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

    if (pointer.active) {
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
  window.addEventListener("pointermove", movePointer, { passive: true });
  window.addEventListener("pointerleave", hidePointer);
};

initStarfield();

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
    if (!parallax || reduceMotion) return;
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

if (!reduceMotion) {
  document.querySelectorAll(".event-card, .feature-card, .stat-card, .member-card, .robot-card, .timeline-card, .btn").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 5}deg) translateY(-4px)`;
    });

    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}
