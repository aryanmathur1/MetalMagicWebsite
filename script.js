const nav = document.querySelector("[data-nav]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");

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
    if (!parallax || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
