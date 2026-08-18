/* ============================================================
   SRI GOVARDHAN SILKS — MASTER DIGITAL EXPERIENCE SCRIPT
   - 100-Frame High-DPI Centered Model Canvas Engine
   - Ethereal Dream World Atmosphere (White Shades, Clouds, Sparkles)
   - GSAP ScrollTrigger Pinned Camera Flow
   - Three.js WebGL 3D Silk Simulation & Gold Dust Field
   - Heritage Silk Editorial Interactivity & Weave Filtering
   - Saree Lightbox Modal & VIP Video Shopping Booking Modal
============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. CONSTANTS & CONFIGURATION
  ============================================================ */
  const CONFIG = {
    frameCount: 100,
    frameDir: "ezgif-red frames-100-jpg",
    framePattern: (i) => `ezgif-red frames-100-jpg/ezgif-frame-${String(i).padStart(3, "0")}.jpg`,
    eyeNormalizedX: 0.49,    // Model eye position in frame
    eyeNormalizedY: 0.355,   // Model eye position in frame
    scrollDistance: "520%"
  };

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* Helper Selector */
  const $ = (id) => document.getElementById(id);

  /* DOM Elements */
  const loader = $("loader");
  const loaderFill = $("loaderFill");
  const loaderPct = $("loaderPct");
  const loaderText = $("loaderText");
  const sceneCard = $("sceneCard");
  const sceneCanvasView = $("sceneCanvasView");
  const canvas = $("sequenceCanvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;
  const eyeDarken = $("eyeDarken");
  const particlesLayer = $("goldParticles");
  const sparklesContainer = $("sparklesContainer");
  const journeyCaption = $("journeyCaption");
  const sceneSilkWebGL = $("sceneSilkWebGL");
  const eyePortal = $("eyePortal");
  const navBurger = $("navBurger");
  const mobileMenu = $("mobileMenu");
  const yearEl = $("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     2. STATE MANAGEMENT
  ============================================================ */
  const state = {
    loadedFrames: 0,
    images: [],
    currentFrame: 0,
    lastDrawnFrame: -1,
    progress: 0,
    isReady: false,
    eyeScreenX: 0.5,
    eyeScreenY: 0.36,
    rafId: 0
  };

  /* Set Dynamic Eye CSS Variables for Overlay Alignment */
  function updateEyeVars(x, y) {
    const root = document.documentElement.style;
    root.setProperty("--eye-x", `${(x * 100).toFixed(2)}%`);
    root.setProperty("--eye-y", `${(y * 100).toFixed(2)}%`);
  }
  updateEyeVars(state.eyeScreenX, state.eyeScreenY);

  /* ============================================================
     3. DREAM WORLD GOLDEN SPARKLES & PARTICLES GENERATION
  ============================================================ */
  const SPARKLE_COUNT = window.innerWidth < 768 ? 16 : 32;
  const sparkleElements = [];

  if (sparklesContainer) {
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const sp = document.createElement("div");
      sp.className = "golden-sparkle";
      sp.innerHTML = '<div class="sparkle-cross"></div>';

      const scale = (0.5 + Math.random() * 0.9).toFixed(2);
      const posX = (5 + Math.random() * 90).toFixed(1);
      const posY = (10 + Math.random() * 80).toFixed(1);

      Object.assign(sp.style, {
        left: `${posX}%`,
        top: `${posY}%`,
        transform: `scale(${scale})`
      });

      sparklesContainer.appendChild(sp);
      sparkleElements.push({
        el: sp,
        baseScale: parseFloat(scale),
        speed: 1.5 + Math.random() * 2.5,
        delay: Math.random() * 3
      });
    }
  }

  // Floating Zari Dust Particles Layer
  const DOM_PARTICLE_COUNT = window.innerWidth < 768 ? 22 : 48;
  const domParticles = [];
  if (particlesLayer) {
    for (let i = 0; i < DOM_PARTICLE_COUNT; i++) {
      const p = document.createElement("div");
      p.className = "gold-particle";
      const size = (2.5 + Math.random() * 4.5).toFixed(1);
      Object.assign(p.style, {
        width: `${size}px`,
        height: `${size}px`,
        left: `${(Math.random() * 100).toFixed(1)}%`,
        top: `${(Math.random() * 100).toFixed(1)}%`
      });
      particlesLayer.appendChild(p);
      domParticles.push(p);
    }
  }

  /* ============================================================
     4. HIGH-DPI CENTERED CANVAS RENDER ENGINE
  ============================================================ */
  function resizeSequenceCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    requestCanvasDraw(true);
  }

  function drawSequenceFrame(img) {
    if (!ctx || !canvas) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    const isMobile = window.innerWidth < 768;
    const maxViewportRatioW = isMobile ? 0.98 : 0.88;
    const maxViewportRatioH = isMobile ? 0.96 : 0.92;

    const scale = Math.min((cw * maxViewportRatioW) / iw, (ch * maxViewportRatioH) / ih);
    const dw = Math.round(iw * scale);
    const dh = Math.round(ih * scale);

    const dx = Math.round((cw - dw) * 0.5);
    const dy = Math.round((ch - dh) * 0.5);

    const bgGrad = ctx.createRadialGradient(cw * 0.5, ch * 0.48, dw * 0.2, cw * 0.5, ch * 0.48, Math.max(cw, ch) * 0.7);
    bgGrad.addColorStop(0, "#1f1218");
    bgGrad.addColorStop(0.5, "#120c0e");
    bgGrad.addColorStop(1, "#080605");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cw, ch);

    ctx.drawImage(img, dx, dy, dw, dh);

    const featherGrad = ctx.createRadialGradient(
      cw * 0.5, ch * 0.5,
      Math.min(dw, dh) * 0.44,
      cw * 0.5, ch * 0.5,
      Math.max(dw, dh) * 0.65
    );
    featherGrad.addColorStop(0, "rgba(8, 6, 5, 0)");
    featherGrad.addColorStop(0.7, "rgba(8, 6, 5, 0.25)");
    featherGrad.addColorStop(1, "rgba(8, 6, 5, 0.95)");
    ctx.fillStyle = featherGrad;
    ctx.fillRect(0, 0, cw, ch);

    state.eyeScreenX = Math.max(0, Math.min(1, (dx + dw * CONFIG.eyeNormalizedX) / cw));
    state.eyeScreenY = Math.max(0, Math.min(1, (dy + dh * CONFIG.eyeNormalizedY) / ch));
    updateEyeVars(state.eyeScreenX, state.eyeScreenY);
  }

  function drawFallbackGradient() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.48, Math.max(w, h) * 0.7);
    grad.addColorStop(0, "#3d131d");
    grad.addColorStop(0.4, "#1d120e");
    grad.addColorStop(1, "#080605");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  function renderCanvas() {
    state.rafId = 0;
    if (!state.isReady || !state.images[state.currentFrame]) {
      drawFallbackGradient();
      return;
    }
    if (state.lastDrawnFrame === state.currentFrame) return;
    state.lastDrawnFrame = state.currentFrame;

    drawSequenceFrame(state.images[state.currentFrame]);
  }

  function requestCanvasDraw(force) {
    if (force) state.lastDrawnFrame = -1;
    if (!state.rafId) state.rafId = requestAnimationFrame(renderCanvas);
  }

  /* ============================================================
     5. ASYNC FRAME PRELOADER
  ============================================================ */
  function updatePreloader(loaded, total) {
    const pct = Math.min(100, Math.round((loaded / total) * 100));
    if (loaderFill) loaderFill.style.width = `${pct}%`;
    if (loaderPct) loaderPct.textContent = `${pct}%`;
  }

  function loadSingleFrame(src, index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = async () => {
        try {
          if (img.decode) await img.decode();
        } catch (_) {}
        state.images[index] = img;
        state.loadedFrames++;
        updatePreloader(state.loadedFrames, CONFIG.frameCount);
        if (index === 0) requestCanvasDraw(true);
        resolve();
      };
      img.onerror = () => {
        state.loadedFrames++;
        updatePreloader(state.loadedFrames, CONFIG.frameCount);
        resolve();
      };
      img.src = encodeURI(src);
    });
  }

  async function preloadFrameSequence() {
    updatePreloader(0, CONFIG.frameCount);
    const loadPromises = [];
    for (let i = 1; i <= CONFIG.frameCount; i++) {
      loadPromises.push(loadSingleFrame(CONFIG.framePattern(i), i - 1));
    }
    await Promise.all(loadPromises);

    state.images = state.images.filter(Boolean);
    state.isReady = state.images.length > 0;
    state.currentFrame = 0;

    setTimeout(() => {
      if (loader) loader.classList.add("hidden");
    }, 300);

    requestCanvasDraw(true);
    initTimeline();
  }

  /* ============================================================
     6. THREE.JS 3D FLOWING SILK & GOLD PARTICLES WEBGL
  ============================================================ */
  let silkScene, silkCamera, silkRenderer, silkMesh, threeParticles;

  function initThreeSilk() {
    const container = $("silkThreeCanvas");
    if (!container || !window.THREE) return;

    silkScene = new THREE.Scene();
    silkCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    silkCamera.position.z = 5;

    silkRenderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    silkRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    silkRenderer.setSize(window.innerWidth, window.innerHeight);

    const silkGeo = new THREE.PlaneGeometry(12, 8, 48, 48);
    const silkMat = new THREE.MeshStandardMaterial({
      color: 0xb8925a,
      roughness: 0.28,
      metalness: 0.85,
      side: THREE.DoubleSide
    });

    silkMesh = new THREE.Mesh(silkGeo, silkMat);
    silkMesh.rotation.x = -0.35;
    silkScene.add(silkMesh);

    const ambLight = new THREE.AmbientLight(0x4a1522, 1.8);
    silkScene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xf3d493, 2.5);
    dirLight1.position.set(5, 5, 4);
    silkScene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8d6935, 1.5);
    dirLight2.position.set(-5, -3, 3);
    silkScene.add(dirLight2);

    const pCount = window.innerWidth < 768 ? 140 : 320;
    const pGeo = new THREE.BufferGeometry();
    const posArr = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount * 3; i += 3) {
      posArr[i] = (Math.random() - 0.5) * 14;
      posArr[i + 1] = (Math.random() - 0.5) * 10;
      posArr[i + 2] = (Math.random() - 0.5) * 8;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.045,
      color: 0xd4af37,
      transparent: true,
      opacity: 0.85
    });

    threeParticles = new THREE.Points(pGeo, pMat);
    silkScene.add(threeParticles);

    let clock = new THREE.Clock();
    function animateThree() {
      requestAnimationFrame(animateThree);
      const time = clock.getElapsedTime();

      if (silkMesh) {
        const pos = silkMesh.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getY(i);
          const z = Math.sin(u * 0.8 + time * 1.5) * 0.45 + Math.cos(v * 0.9 + time * 1.2) * 0.35;
          pos.setZ(i, z);
        }
        pos.needsUpdate = true;
        silkMesh.rotation.z = Math.sin(time * 0.2) * 0.05;
      }

      if (threeParticles) {
        threeParticles.rotation.y = time * 0.04;
        threeParticles.rotation.x = Math.sin(time * 0.03) * 0.02;
      }

      silkRenderer.render(silkScene, silkCamera);
    }
    animateThree();

    window.addEventListener("resize", () => {
      if (!silkCamera || !silkRenderer) return;
      silkCamera.aspect = window.innerWidth / window.innerHeight;
      silkCamera.updateProjectionMatrix();
      silkRenderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ============================================================
     7. SCROLL PROGRESSION & TIMELINE ORCHESTRATION
  ============================================================ */
  function applyCinematicProgress(progress) {
    state.progress = window.gsap
      ? gsap.utils.clamp(0, 1, progress)
      : Math.max(0, Math.min(1, progress));

    if (state.images.length > 0) {
      state.currentFrame = Math.round(state.progress * (state.images.length - 1));
      requestCanvasDraw();
    }

    // 1. SCENE 01: Landing Card Departure (0% to 15%)
    if (sceneCard) {
      const cardProgress = Math.min(1, state.progress / 0.15);
      const cardOpacity = 1 - cardProgress;
      const cardScale = 1 + cardProgress * 0.06;
      const cardY = -cardProgress * 40;
      sceneCard.style.opacity = cardOpacity.toFixed(3);
      sceneCard.style.transform = `scale(${cardScale.toFixed(3)}) translateY(${cardY.toFixed(1)}px)`;
      sceneCard.style.pointerEvents = cardProgress > 0.8 ? "none" : "auto";
    }

    // 2. SCENE 02-06: Model Canvas in Dream World Reveal & Journey (10% to 92%)
    if (sceneCanvasView) {
      const canvasOpacity = state.progress < 0.08 ? 0 : Math.min(1, (state.progress - 0.08) / 0.08);
      const canvasFadeOut = state.progress > 0.92 ? 1 - (state.progress - 0.92) / 0.08 : 1;
      sceneCanvasView.style.opacity = (canvasOpacity * canvasFadeOut).toFixed(3);
    }

    // 3. Sparkles Twinkle & Dream Cloud Drift Modulation
    if (sparklesContainer) {
      const spStart = 0.12, spEnd = 0.88;
      let spOp = 0;
      if (state.progress >= spStart && state.progress <= spEnd) {
        const mid = (spStart + spEnd) / 2;
        spOp = state.progress < mid ? (state.progress - spStart) / (mid - spStart) : (spEnd - state.progress) / (spEnd - mid);
      }
      sparklesContainer.style.opacity = spOp.toFixed(3);
    }

    // 4. Journey Overlay Caption (25% to 60%)
    if (journeyCaption) {
      const start = 0.22, end = 0.62;
      let capOp = 0;
      if (state.progress >= start && state.progress <= end) {
        const mid = (start + end) / 2;
        capOp = state.progress < mid ? (state.progress - start) / (mid - start) : (end - state.progress) / (end - mid);
      }
      journeyCaption.style.opacity = capOp.toFixed(3);
      journeyCaption.style.transform = `translateY(${((1 - capOp) * 18).toFixed(1)}px)`;
    }

    // 5. Gold Particles Dispersion (35% to 85%)
    if (particlesLayer) {
      const pStart = 0.28, pEnd = 0.88;
      let pOp = 0;
      if (state.progress >= pStart && state.progress <= pEnd) {
        const pMid = (pStart + pEnd) / 2;
        pOp = state.progress < pMid ? (state.progress - pStart) / (pMid - pStart) : (pEnd - state.progress) / (pEnd - pMid);
      }
      particlesLayer.style.opacity = pOp.toFixed(3);
    }

    // 6. Eye Darken Lighting Focus (75% to 92%)
    if (eyeDarken) {
      const eyeDarkenProg = state.progress < 0.72 ? 0 : Math.min(0.94, (state.progress - 0.72) / 0.18);
      eyeDarken.style.opacity = eyeDarkenProg.toFixed(3);
    }

    // 7. SCENE 07: Three.js Silk Flow Layer (84% to 100%)
    if (sceneSilkWebGL) {
      const silkProg = state.progress < 0.84 ? 0 : Math.min(1, (state.progress - 0.84) / 0.12);
      sceneSilkWebGL.style.opacity = silkProg.toFixed(3);
    }

    // 8. Eye Portal Expansion Veil (84% to 100%)
    if (eyePortal) {
      const portalProg = state.progress < 0.82 ? 0 : Math.min(1, (state.progress - 0.82) / 0.18);
      const easedRadius = 1 - Math.pow(1 - portalProg, 3);
      const radiusPct = (easedRadius * 155).toFixed(1);
      const ex = (state.eyeScreenX * 100).toFixed(2);
      const ey = (state.eyeScreenY * 100).toFixed(2);

      eyePortal.style.opacity = portalProg > 0 ? "1" : "0";
      eyePortal.style.clipPath = `circle(${radiusPct}% at ${ex}% ${ey}%)`;
    }
  }

  /* ============================================================
     8. GSAP SCROLLTRIGGER SETUP
  ============================================================ */
  function initTimeline() {
    if (isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      initFallbackMode();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    sparkleElements.forEach((item) => {
      gsap.to(item.el, {
        opacity: 0.9,
        scale: item.baseScale * 1.3,
        rotation: 45,
        duration: item.speed,
        repeat: -1,
        yoyo: true,
        delay: item.delay,
        ease: "sine.inOut"
      });
    });

    domParticles.forEach((p) => {
      gsap.to(p, {
        y: -60 - Math.random() * 120,
        x: (Math.random() - 0.5) * 60,
        opacity: 0.4 + Math.random() * 0.6,
        duration: 3.5 + Math.random() * 3.5,
        repeat: -1,
        delay: Math.random() * 3,
        ease: "sine.inOut",
        yoyo: true
      });
    });

    ScrollTrigger.create({
      trigger: "#cinematic",
      start: "top top",
      end: `+=${CONFIG.scrollDistance}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.65,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => applyCinematicProgress(self.progress),
      onLeave: () => applyCinematicProgress(1),
      onEnterBack: () => applyCinematicProgress(0.999)
    });

    gsap.utils.toArray(".reveal-on-scroll").forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      });
    });

    initCardTilt();
    initWeaveFilter();
    initVideoBookingModal();
    ScrollTrigger.refresh();
  }

  function initFallbackMode() {
    const cine = $("cinematic");
    if (cine) cine.style.display = "block";
    const spacer = $("cineSpacer");
    if (spacer) spacer.style.height = "0";
    if (sceneCanvasView) sceneCanvasView.style.opacity = "1";
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  /* ============================================================
     9. 3D PERSPECTIVE CARD TILT & SAREE LIGHTBOX MODAL
  ============================================================ */
  function initCardTilt() {
    if (isTouch) return;
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0px)";
      });
    });
  }

  // Saree Modal Logic
  const sareeModal = $("sareeModal");
  const modalImg = $("modalImg");
  const modalTitle = $("modalTitle");
  const modalDesc = $("modalDesc");
  const modalWhatsAppBtn = $("modalWhatsAppBtn");
  const modalBookVideoBtn = $("modalBookVideoBtn");
  const modalClose = $("modalClose");
  const modalBackdrop = $("modalBackdrop");

  function openSareeModal(imgSrc, title, desc) {
    if (!sareeModal) return;
    if (modalImg) modalImg.src = imgSrc;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;

    if (modalWhatsAppBtn) {
      const msg = encodeURIComponent(`Hello Sri Govardhan Silks, I am interested in knowing more about: ${title}`);
      modalWhatsAppBtn.href = `https://wa.me/917090902843?text=${msg}`;
    }

    sareeModal.classList.add("active");
    sareeModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeSareeModal() {
    if (!sareeModal) return;
    sareeModal.classList.remove("active");
    sareeModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".editorial-card, .collection-card").forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.getAttribute("data-saree-img");
      const title = card.getAttribute("data-saree-title");
      const desc = card.getAttribute("data-saree-desc");
      if (img && title) openSareeModal(img, title, desc);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeSareeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeSareeModal);

  /* ============================================================
     10. INTERACTIVE WEAVE FILTER TABS
  ============================================================ */
  function initWeaveFilter() {
    const tabs = document.querySelectorAll(".filter-btn, .glass-tab");
    const cards = document.querySelectorAll(".editorial-card, .collection-card");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        const filterVal = tab.getAttribute("data-filter");

        cards.forEach((card) => {
          const cat = card.getAttribute("data-category");
          if (filterVal === "all" || cat === filterVal) {
            card.style.display = "flex";
            if (window.gsap) {
              gsap.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" });
            }
          } else {
            card.style.display = "none";
          }
        });

        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  }

  /* ============================================================
     11. VIRTUAL VIDEO SHOPPING BOOKING MODAL
  ============================================================ */
  function initVideoBookingModal() {
    const videoModal = $("videoBookingModal");
    const videoModalClose = $("videoModalClose");
    const videoModalBackdrop = $("videoModalBackdrop");
    const openBtns = [
      $("openVideoBookingBtn"),
      modalBookVideoBtn
    ].filter(Boolean);

    function openVideoModal() {
      if (sareeModal && sareeModal.classList.contains("active")) {
        closeSareeModal();
      }
      if (videoModal) {
        videoModal.classList.add("active");
        videoModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }
    }

    function closeVideoModal() {
      if (videoModal) {
        videoModal.classList.remove("active");
        videoModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
    }

    openBtns.forEach((btn) => btn.addEventListener("click", openVideoModal));
    if (videoModalClose) videoModalClose.addEventListener("click", closeVideoModal);
    if (videoModalBackdrop) videoModalBackdrop.addEventListener("click", closeVideoModal);

    const bookingForm = $("videoBookingForm");
    if (bookingForm) {
      bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = $("clientName").value;
        const phone = $("clientPhone").value;
        const date = $("callDate").value;
        const time = $("callTime").value;

        const msg = encodeURIComponent(
          `*New Video Shopping Appointment Request:*\n` +
          `• Name: ${name}\n` +
          `• Phone: ${phone}\n` +
          `• Preferred Date: ${date}\n` +
          `• Preferred Time: ${time}\n` +
          `• Store: Sri Govardhan Silks, Bengaluru`
        );

        window.open(`https://wa.me/917090902843?text=${msg}`, "_blank");
        closeVideoModal();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSareeModal();
        closeVideoModal();
      }
    });
  }

  /* ============================================================
     12. CUSTOM CURSOR & NAVIGATION INTERACTIONS
  ============================================================ */
  if (!isTouch) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    (function loopCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (ring) ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(loopCursor);
    })();

    document.querySelectorAll("a, button, [data-tilt], .editorial-card, .filter-btn").forEach((el) => {
      el.addEventListener("mouseenter", () => ring && ring.classList.add("expand"));
      el.addEventListener("mouseleave", () => ring && ring.classList.remove("expand"));
    });
  }

  // Mobile Hamburger Toggle
  if (navBurger && mobileMenu) {
    navBurger.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("open");
      navBurger.classList.toggle("active", isOpen);
      navBurger.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        navBurger.classList.remove("active");
        navBurger.setAttribute("aria-expanded", "false");
        mobileMenu.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      });
    });
  }

  // Smooth Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ============================================================
     13. INITIALIZATION
  ============================================================ */
  window.addEventListener("resize", resizeSequenceCanvas, { passive: true });
  resizeSequenceCanvas();
  drawFallbackGradient();
  initThreeSilk();
  preloadFrameSequence();

})();
