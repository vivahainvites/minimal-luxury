/* =========================================================
   WEDDING INVITATION — SCRIPT.JS
   Vanilla JavaScript only. No frameworks, no jQuery.
   Organised by feature. Search for the ALL-CAPS section
   headers below to jump to a specific feature.
========================================================= */

/* ---------------------------------------------------------
   0. CONFIG — edit these values to personalise the site.
   The wedding date drives the countdown; the rest are used
   purely as readable placeholders you can bind to with
   data-bind attributes if you extend the markup.
--------------------------------------------------------- */
const CONFIG = {
  brideName: "Saanvi",
  groomName: "Shashank",
  // Countdown target: (year, monthIndex 0-11, day, hour, minute, second)
  weddingDate: new Date(2028, 11, 3, 18, 44, 0),
};

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  initCursorGlow();
  initParticlesFX();
  initScrollProgress();
  initDotNav();
  initScrollReveal();
  initMusicPlayer();
  initSlideshow();
  initCountdown();
  initMasonryLightbox();
  initRSVPForm();
  initBackToTop();
});

/* ---------------------------------------------------------
   1. PRELOADER — wax seal & envelope opening animation
--------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  const seal = document.getElementById("sealBtn");
  if (!preloader || !seal) return;

  let opened = false;

  const openInvitation = () => {
    if (opened) return;
    opened = true;
    preloader.classList.add("is-opening");
    document.body.style.overflow = "hidden";
    if (window.bgAudio) {
    window.bgAudio.play().catch(() => {});

    window.musicPlayer.classList.add("is-playing");
    window.musicIcon.className = "fa-solid fa-pause";
    window.musicToggle.setAttribute(
        "aria-label",
        "Pause background music"
    );
}
    setTimeout(() => {
      preloader.classList.add("is-hidden");
      document.body.style.overflow = "";
      // Kick off hero reveal once the invitation has opened
      document.querySelectorAll("#hero [data-reveal]").forEach((el, i) => {
        setTimeout(() => el.classList.add("is-visible"), i * 140);
      });
    }, 1000);
  };

  seal.addEventListener("click", openInvitation);
  seal.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openInvitation(); }
  });

  // Auto-open after a short pause so the moment still feels curated
  // even if the guest doesn't tap the seal.
  setTimeout(openInvitation, 4200);
}

/* ---------------------------------------------------------
   2. CURSOR GLOW FOLLOWER (desktop / fine pointers only)
--------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let raf = null;
  window.addEventListener("mousemove", (e) => {
    glow.classList.add("is-active");
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    });
  });
  window.addEventListener("mouseleave", () => glow.classList.remove("is-active"));
}

/* ---------------------------------------------------------
   3. FALLING PETALS + FLOATING HEARTS (canvas particle system)
--------------------------------------------------------- */
function initParticlesFX() {
  const canvas = document.getElementById("fxCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  if (reducedMotion) return; // respect reduced motion preference, skip animation loop

  const PETAL_COUNT = window.innerWidth < 700 ? 14 : 26;
  const HEART_COUNT = window.innerWidth < 700 ? 3 : 6;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  class Petal {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = rand(0, w);
      this.y = initial ? rand(-h, 0) : -20;
      this.size = rand(8, 16);
      this.speedY = rand(0.4, 1.1);
      this.speedX = rand(-0.5, 0.5);
      this.rotation = rand(0, 360);
      this.rotationSpeed = rand(-1, 1);
      this.sway = rand(0.5, 1.6);
      this.swayOffset = rand(0, Math.PI * 2);
      this.opacity = rand(0.5, 0.9);
      this.hue = Math.random() > 0.5 ? "gold" : "blush";
    }
    update(t) {
      this.y += this.speedY;
      this.x += Math.sin(t / 800 + this.swayOffset) * this.sway * 0.3 + this.speedX * 0.2;
      this.rotation += this.rotationSpeed;
      if (this.y > h + 20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      const grad = ctx.createLinearGradient(-this.size, 0, this.size, 0);
      if (this.hue === "gold") {
        grad.addColorStop(0, "#E8CE85");
        grad.addColorStop(1, "#D4AF37");
      } else {
        grad.addColorStop(0, "#F3D9CE");
        grad.addColorStop(1, "#D9A79A");
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.55, this.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  class Heart {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = rand(0, w);
      this.y = initial ? rand(h * 0.5, h) : h + 20;
      this.size = rand(10, 18);
      this.speed = rand(0.3, 0.7);
      this.swayOffset = rand(0, Math.PI * 2);
      this.opacity = rand(0.15, 0.35);
    }
    update() {
      this.y -= this.speed;
      this.x += Math.sin((this.y + this.swayOffset) / 60) * 0.4;
      if (this.y < -20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = "#B76E79";
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(s * 0.5, -s * 0.4, s, s * 0.3, 0, s);
      ctx.bezierCurveTo(-s, s * 0.3, -s * 0.5, -s * 0.4, 0, s * 0.3);
      ctx.fill();
      ctx.restore();
    }
  }

  const petals = Array.from({ length: PETAL_COUNT }, () => new Petal());
  const hearts = Array.from({ length: HEART_COUNT }, () => new Heart());

  function loop(t) {
    ctx.clearRect(0, 0, w, h);
    petals.forEach((p) => { p.update(t); p.draw(); });
    hearts.forEach((hrt) => { hrt.update(); hrt.draw(); });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ---------------------------------------------------------
   4. SCROLL PROGRESS BAR
--------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById("progressBar");
  if (!bar) return;
  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------------------------------------------------------
   5. SIDE DOT NAVIGATION — highlight active section
--------------------------------------------------------- */
function initDotNav() {
  const dots = document.querySelectorAll(".dot-nav__dot");
  if (!dots.length) return;
  const sections = Array.from(dots).map((d) => document.querySelector(d.getAttribute("href")));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.id;
          dots.forEach((d) => d.classList.toggle("active", d.getAttribute("href") === id));
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => s && observer.observe(s));
}

/* ---------------------------------------------------------
   6. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
--------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Skip hero items here; the preloader triggers those on open
          if (entry.target.closest("#hero")) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   7. MUSIC PLAYER — play / pause + animated equalizer
--------------------------------------------------------- */
function initMusicPlayer() {
  const player = document.getElementById("musicPlayer");
  const toggle = document.getElementById("musicToggle");
  const icon = document.getElementById("musicIcon");
  const audio = document.getElementById("bgAudio");

  if (!player || !toggle || !audio) return;

  toggle.addEventListener("click", () => {

    if (audio.paused) {

      audio.play().catch(() => {});
      player.classList.add("is-playing");
      icon.className = "fa-solid fa-pause";
      toggle.setAttribute("aria-label", "Pause background music");

    } else {

      audio.pause();
      player.classList.remove("is-playing");
      icon.className = "fa-solid fa-play";
      toggle.setAttribute("aria-label", "Play background music");

    }

  });

  // Make audio accessible from anywhere
  window.bgAudio = audio;
  window.musicPlayer = player;
  window.musicIcon = icon;
  window.musicToggle = toggle;
}

/* ---------------------------------------------------------
   8. COUPLE PHOTO SLIDESHOW — autoplay, arrows, dots, swipe
--------------------------------------------------------- */
function initSlideshow() {
  const track = document.getElementById("slideshowTrack");
  const dotsWrap = document.getElementById("slideshowDots");
  const prevBtn = document.getElementById("slidePrev");
  const nextBtn = document.getElementById("slideNext");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".slideshow__slide"));
  let current = 0;
  let autoplayTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", "Go to photo " + (i + 1));
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    restartAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 5000);
  }

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  // Swipe support
  let touchStartX = 0;
  track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) diff < 0 ? next() : prev();
  }, { passive: true });

  restartAutoplay();
}

/* ---------------------------------------------------------
   9. LIVE COUNTDOWN
--------------------------------------------------------- */
function initCountdown() {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");
  const timerWrap = document.getElementById("countdown-timer");
  const completeMsg = document.getElementById("countdownComplete");
  if (!daysEl) return;

  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const now = new Date();
    const diff = CONFIG.weddingDate - now;

    if (diff <= 0) {
      clearInterval(interval);
      timerWrap.hidden = true;
      completeMsg.hidden = false;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  tick();
  const interval = setInterval(tick, 1000);
}

/* ---------------------------------------------------------
   10. MASONRY GALLERY + LIGHTBOX (zoom, keyboard, swipe)
--------------------------------------------------------- */
function initMasonryLightbox() {
  const items = Array.from(document.querySelectorAll(".masonry__item img"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  const counter = document.getElementById("lightboxCounter");
  if (!items.length || !lightbox) return;

  let current = 0;

  function open(index) {
    current = index;
    render();
    lightbox.classList.add("is-active");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lightbox.classList.remove("is-active");
    document.body.style.overflow = "";
  }
  function render() {
    lightboxImg.src = items[current].src;
    lightboxImg.alt = items[current].alt;
    counter.textContent = (current + 1) + " / " + items.length;
  }
  function next() { current = (current + 1) % items.length; render(); }
  function prev() { current = (current - 1 + items.length) % items.length; render(); }

  items.forEach((img, i) => img.parentElement.addEventListener("click", () => open(i)));
  closeBtn.addEventListener("click", close);
  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  // Swipe support inside lightbox
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) diff < 0 ? next() : prev();
  }, { passive: true });
}

/* ---------------------------------------------------------
   11. RSVP FORM — validation + success popup
--------------------------------------------------------- */
function initRSVPForm() {
  const form = document.getElementById("rsvpForm");
  const modal = document.getElementById("rsvpModal");
  const modalClose = document.getElementById("modalClose");
  if (!form) return;

  const fields = {
    name: { el: document.getElementById("rsvpName"), err: document.getElementById("err-name") },
    phone: { el: document.getElementById("rsvpPhone"), err: document.getElementById("err-phone") },
    email: { el: document.getElementById("rsvpEmail"), err: document.getElementById("err-email") },
    guests: { el: document.getElementById("rsvpGuests"), err: document.getElementById("err-guests") },
  };

  function validate() {
    let valid = true;

    // Name — required, at least 2 characters
    if (!fields.name.el.value.trim() || fields.name.el.value.trim().length < 2) {
      setError(fields.name, "Please enter your full name.");
      valid = false;
    } else clearError(fields.name);

    // Phone — required, basic digit-length check
    const phoneDigits = fields.phone.el.value.replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      setError(fields.phone, "Please enter a valid phone number.");
      valid = false;
    } else clearError(fields.phone);

    // Email — required, standard pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(fields.email.el.value.trim())) {
      setError(fields.email, "Please enter a valid email address.");
      valid = false;
    } else clearError(fields.email);

    // Guests — required selection
    if (!fields.guests.el.value) {
      setError(fields.guests, "Please select the number of guests.");
      valid = false;
    } else clearError(fields.guests);

    return valid;
  }

  function setError(field, message) {
    field.el.classList.add("is-invalid");
    field.err.textContent = message;
  }
  function clearError(field) {
    field.el.classList.remove("is-invalid");
    field.err.textContent = "";
  }

  // Clear individual field errors as the guest corrects them
  Object.values(fields).forEach((f) => {
    f.el.addEventListener("input", () => clearError(f));
    f.el.addEventListener("change", () => clearError(f));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;

    // In production, send this data to your backend, a form
    // service (e.g. Formspree, Google Sheets via Apps Script),
    // or an email API. Here we simply log it and show success.
    const data = new FormData(form);
    console.log("RSVP submitted:", Object.fromEntries(data.entries()));

    modal.classList.add("is-active");
    form.reset();
  });

  modalClose.addEventListener("click", () => modal.classList.remove("is-active"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("is-active"); });
}

/* ---------------------------------------------------------
   12. BACK TO TOP
--------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
