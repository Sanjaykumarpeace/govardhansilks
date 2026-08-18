(() => {
  "use strict";

  const FRAME_DIR = "ezgif-red frames-100-jpg";
  const FRAME_COUNT = 100;
  const FRAME_PATTERN = (i) => `${FRAME_DIR}/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;
  const FOCUS_X = 0.51, FOCUS_Y = 0.43;
  const EYE_X = 0.49, EYE_Y = 0.355;
  const SCROLL_DISTANCE = "520%";

  const $ = (s) => document.getElementById(s);
  const canvas = $("sequenceCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const loadingFallback = $("loadingFallback");
  const loadingText = $("loadingText");
  const loadingBar = $("loadingBar");
  const sequencePin = $("sequencePin");
  const websitePreview = $("websitePreview");
  const eyeDarken = $("eyeDarken");
  const sequenceCopy = $("sequenceCopy");
  const particlesLayer = $("goldParticles");

  const prefersRM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    frame: 0, lastDrawn: -1, progress: 0,
    loaded: 0, ready: false, images: [],
    eyeX: EYE_X, eyeY: EYE_Y, raf: 0
  };

  /* --- Particles --- */
  const PARTICLE_COUNT = window.innerWidth < 640 ? 20 : 45;
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement("div");
    p.className = "gold-particle";
    const s = 2 + Math.random() * 4;
    Object.assign(p.style, {
      width: s + "px", height: s + "px",
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%"
    });
    particlesLayer.appendChild(p);
    particles.push(p);
  }

  /* --- Eye CSS vars --- */
  function setEyeVars(x, y) {
    const r = document.documentElement.style;
    r.setProperty("--eye-x", `${x * 100}%`);
    r.setProperty("--eye-y", `${y * 100}%`);
  }
  setEyeVars(state.eyeX, state.eyeY);

  /* --- Year --- */
  const yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Canvas resize --- */
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    requestDraw(true);
  }

  /* --- Draw --- */
  function drawCover(img) {
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const sc = Math.max(cw / iw, ch / ih);
    const dw = iw * sc, dh = ih * sc;
    let dx = cw * 0.5 - iw * FOCUS_X * sc;
    let dy = ch * 0.46 - ih * FOCUS_Y * sc;
    dx = Math.min(0, Math.max(cw - dw, dx));
    dy = Math.min(0, Math.max(ch - dh, dy));
    ctx.drawImage(img, dx, dy, dw, dh);
    state.eyeX = Math.max(0, Math.min(1, (dx + iw * EYE_X * sc) / cw));
    state.eyeY = Math.max(0, Math.min(1, (dy + ih * EYE_Y * sc) / ch));
    setEyeVars(state.eyeX, state.eyeY);
  }

  function drawFallback() {
    const w = canvas.width, h = canvas.height;
    const g = ctx.createRadialGradient(w * .5, h * .4, 12, w * .5, h * .42, Math.max(w, h) * .7);
    g.addColorStop(0, "#3a2716");
    g.addColorStop(.38, "#1c0f0f");
    g.addColorStop(1, "#100c09");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function draw() {
    state.raf = 0;
    if (!state.ready || !state.images[state.frame]) { drawFallback(); return; }
    if (state.lastDrawn === state.frame) return;
    state.lastDrawn = state.frame;
    ctx.fillStyle = "#100c09";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCover(state.images[state.frame]);
  }

  function requestDraw(force) {
    if (force) state.lastDrawn = -1;
    if (!state.raf) state.raf = requestAnimationFrame(draw);
  }

  /* --- Loading --- */
  function updateLoading() {
    const pct = Math.round((state.loaded / FRAME_COUNT) * 100);
    loadingText.textContent = `Preparing the silk sequence ${pct}%`;
    loadingBar.style.width = `${pct}%`;
  }

  function loadImage(src, idx) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = async () => {
        try { if (img.decode) await img.decode(); } catch (_) {}
        state.images[idx] = img;
        state.loaded++;
        updateLoading();
        if (idx === 0) requestDraw(true);
        resolve();
      };
      img.onerror = () => { state.loaded++; updateLoading(); resolve(); };
      img.src = encodeURI(src);
    });
  }

  async function preloadFrames() {
    updateLoading();
    const tasks = [];
    for (let i = 1; i <= FRAME_COUNT; i++) tasks.push(loadImage(FRAME_PATTERN(i), i - 1));
    await Promise.all(tasks);
    state.images = state.images.filter(Boolean);
    if (!state.images.length) {
      loadingText.textContent = "Frames not found — check the folder path.";
      return;
    }
    state.ready = true;
    state.frame = 0;
    loadingFallback.classList.add("is-hidden");
    requestDraw(true);
    initScroll();
  }

  /* --- Scroll progress --- */
  function applyProgress(progress) {
    state.progress = gsap ? gsap.utils.clamp(0, 1, progress) : Math.max(0, Math.min(1, progress));
    state.frame = Math.round(state.progress * (state.images.length - 1));
    requestDraw();

    // Copy overlay: fade in then out
    const introFade = 1 - Math.min(1, Math.max(0, (state.progress - .22) / .18));
    const copyOp = Math.min(1, Math.max(0, (state.progress - .08) / .18)) * introFade;
    sequenceCopy.style.opacity = copyOp.toFixed(3);
    sequenceCopy.style.transform = `translateY(${(1 - copyOp) * 18}px)`;

    // Particles: visible during mid-section
    const pStart = .3, pEnd = .75;
    const pOp = state.progress < pStart ? 0 : state.progress > pEnd ? 0
      : Math.min(1, (state.progress - pStart) / .1) * (1 - Math.max(0, (state.progress - (pEnd - .1)) / .1));
    particlesLayer.style.opacity = pOp.toFixed(3);

    // Eye reveal
    const revealProg = Math.min(1, Math.max(0, (state.progress - .82) / .18));
    const easedR = 1 - Math.pow(1 - revealProg, 3);
    const radius = easedR * 152;
    const ex = state.eyeX * 100, ey = state.eyeY * 100;
    websitePreview.style.opacity = revealProg > 0 ? "1" : "0";
    websitePreview.style.clipPath = `circle(${radius}% at ${ex}% ${ey}%)`;
    eyeDarken.style.opacity = Math.min(.92, revealProg * 1.25).toFixed(3);
  }

  /* --- Init GSAP scroll --- */
  function initScroll() {
    if (prefersRM || !window.gsap || !window.ScrollTrigger) {
      initFallback(); return;
    }
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(websitePreview, {
      opacity: 0,
      clipPath: `circle(0% at ${state.eyeX * 100}% ${state.eyeY * 100}%)`
    });

    // Particle float animations
    particles.forEach((p) => {
      gsap.to(p, {
        y: -60 - Math.random() * 100,
        x: (Math.random() - .5) * 50,
        opacity: .3 + Math.random() * .5,
        duration: 3 + Math.random() * 3,
        repeat: -1, delay: Math.random() * 3,
        ease: "sine.inOut", yoyo: true
      });
    });

    ScrollTrigger.create({
      trigger: sequencePin,
      start: "top top",
      end: `+=${SCROLL_DISTANCE}`,
      pin: true, pinSpacing: true,
      scrub: .65, anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => applyProgress(self.progress),
      onLeave: () => applyProgress(1),
      onEnterBack: () => applyProgress(.999)
    });

    // Section reveals
    gsap.utils.toArray(".reveal-on-scroll").forEach(el => {
      gsap.from(el, {
        autoAlpha: 0, y: 40, duration: .9, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    // 3D tilt on collection cards
    document.querySelectorAll(".collection-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale(1)";
      });
    });

    ScrollTrigger.refresh();
  }

  function initFallback() {
    sequencePin.style.position = "sticky";
    sequencePin.style.top = "0";
    document.body.style.minHeight = "420vh";
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      applyProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  drawFallback();
  preloadFrames();
})();
