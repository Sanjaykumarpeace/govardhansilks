/* ============================================================
   SRI GOVARDHAN SILKS — MASTER DIGITAL EXPERIENCE SCRIPT
   - 812-Frame Full-HD High-DPI Sequence Engine (0to10, 10to20, 20to27)
   - Batched Hardware-Accelerated Preload with Progressive Decoding
   - Silky-Smooth GSAP ScrollTrigger Pinned Scrubbing
   - Ethereal Gold Zari Particles & Atmospheric Lighting
   - Lookbook Category Filter, Saree Lightbox Modal & VIP Video Concierge
   - Custom Luxury Cursor & Mobile Navigation
============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. FRAME SEQUENCE CONFIGURATION (812 FRAMES)
  ============================================================ */
  const FRAME_SOURCES = [];

  // 0to10: 300 frames
  for (let i = 1; i <= 300; i++) {
    FRAME_SOURCES.push(`scroll-animations/0to10/ezgif-frame-${String(i).padStart(3, "0")}.jpg`);
  }
  // 10to20: 300 frames
  for (let i = 1; i <= 300; i++) {
    FRAME_SOURCES.push(`scroll-animations/10to20/ezgif-frame-${String(i).padStart(3, "0")}.jpg`);
  }
  // 20to27: 212 frames
  for (let i = 1; i <= 212; i++) {
    FRAME_SOURCES.push(`scroll-animations/20to27/ezgif-frame-${String(i).padStart(3, "0")}.jpg`);
  }

  const TOTAL_FRAMES = FRAME_SOURCES.length; // 812 frames
  const SCROLL_DISTANCE = window.innerWidth < 768 ? "280%" : "340%";

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
  const sceneKorvaiOverlay = $("sceneKorvaiOverlay");
  const sceneZariOverlay = $("sceneZariOverlay");
  const navBurger = $("navBurger");
  const mobileMenu = $("mobileMenu");
  const yearEl = $("year");

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     2. ENGINE STATE
  ============================================================ */
  const state = {
    images: new Array(TOTAL_FRAMES),
    loadedCount: 0,
    currentFrame: 0,
    lastDrawnFrame: -1,
    progress: 0,
    isReady: false,
    rafId: 0
  };

  /* ============================================================
     3. GOLDEN SPARKLES & AMBIENT PARTICLES
  ============================================================ */
  const SPARKLE_COUNT = window.innerWidth < 768 ? 14 : 28;
  const sparkleElements = [];

  if (sparklesContainer) {
    sparklesContainer.innerHTML = "";
    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const sp = document.createElement("div");
      sp.className = "golden-sparkle";
      sp.innerHTML = '<div class="sparkle-cross"></div>';

      const scale = (0.45 + Math.random() * 0.85).toFixed(2);
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
        speed: 1.6 + Math.random() * 2.4,
        delay: Math.random() * 3
      });
    }
  }

  // Floating Zari Dust Particles Layer
  const DOM_PARTICLE_COUNT = window.innerWidth < 768 ? 18 : 36;
  const domParticles = [];
  if (particlesLayer) {
    particlesLayer.innerHTML = "";
    for (let i = 0; i < DOM_PARTICLE_COUNT; i++) {
      const p = document.createElement("div");
      p.className = "gold-particle";
      const size = (2.2 + Math.random() * 3.8).toFixed(1);
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
     4. HIGH-DPI CANVAS RENDER ENGINE WITH COVER MATH
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

  // Find nearest loaded frame if current frame is still decoding
  function getRenderableFrame(targetIndex) {
    if (state.images[targetIndex]) return state.images[targetIndex];
    // Search outward for nearest loaded neighbor
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && state.images[prev]) return state.images[prev];
      const next = targetIndex + offset;
      if (next < TOTAL_FRAMES && state.images[next]) return state.images[next];
    }
    return null;
  }

  function drawSequenceFrame(img) {
    if (!ctx || !canvas || !img) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || img.width || 1920;
    const ih = img.naturalHeight || img.height || 1080;

    // Aspect-ratio cover calculation
    const scale = Math.max(cw / iw, ch / ih);
    const dw = Math.round(iw * scale);
    const dh = Math.round(ih * scale);

    const dx = Math.round((cw - dw) * 0.5);
    const dy = Math.round((ch - dh) * 0.5);

    // Deep ink background fill
    ctx.fillStyle = "#100c09";
    ctx.fillRect(0, 0, cw, ch);

    // Draw active animation frame
    ctx.drawImage(img, dx, dy, dw, dh);
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
    const img = getRenderableFrame(state.currentFrame);
    if (!img) {
      drawFallbackGradient();
      return;
    }
    if (state.lastDrawnFrame === state.currentFrame) return;
    state.lastDrawnFrame = state.currentFrame;
    drawSequenceFrame(img);
  }

  function requestCanvasDraw(force) {
    if (force) state.lastDrawnFrame = -1;
    if (!state.rafId) state.rafId = requestAnimationFrame(renderCanvas);
  }

  /* ============================================================
     5. HIGH-SPEED BATCHED PRELOADER WITH HARDWARE DECODE
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
        state.loadedCount++;
        updatePreloader(state.loadedCount, TOTAL_FRAMES);
        if (index === 0) requestCanvasDraw(true);
        resolve();
      };
      img.onerror = () => {
        state.loadedCount++;
        updatePreloader(state.loadedCount, TOTAL_FRAMES);
        resolve();
      };
      img.src = encodeURI(src);
    });
  }

  // Preload in two efficient tiers:
  // Tier 1: Immediate Keyframes (every 6th frame) for instant scrubbing + 1st frame
  // Tier 2: Remaining in-between frames in concurrent background batches
  async function preloadFrameSequence() {
    updatePreloader(0, TOTAL_FRAMES);

    // Step 1: Load the very first frame immediately
    await loadSingleFrame(FRAME_SOURCES[0], 0);
    state.isReady = true;
    requestCanvasDraw(true);

    // Step 2: Load keyframe stride (every 6th frame)
    const keyframeIndices = [];
    for (let i = 0; i < TOTAL_FRAMES; i += 6) {
      if (i !== 0) keyframeIndices.push(i);
    }
    // Also include the last frame
    if (!keyframeIndices.includes(TOTAL_FRAMES - 1)) {
      keyframeIndices.push(TOTAL_FRAMES - 1);
    }

    const CONCURRENCY = 16;
    async function processPool(indices) {
      let idx = 0;
      async function worker() {
        while (idx < indices.length) {
          const current = indices[idx++];
          if (!state.images[current]) {
            await loadSingleFrame(FRAME_SOURCES[current], current);
          }
        }
      }
      const workers = Array.from({ length: CONCURRENCY }, () => worker());
      await Promise.all(workers);
    }

    // Load keyframes first
    await processPool(keyframeIndices);

    // Dismiss preloader once keyframes are available
    setTimeout(() => {
      if (loader) loader.classList.add("hidden");
    }, 250);

    initTimeline();

    // Step 3: Concurrently load all remaining frames in the background
    const remainingIndices = [];
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      if (!state.images[i]) remainingIndices.push(i);
    }
    await processPool(remainingIndices);
  }

  /* ============================================================
     6. SCROLL PROGRESSION ORCHESTRATION
  ============================================================ */
  /* ============================================================
     6. SCROLL PROGRESSION ORCHESTRATION & DWELL STOPS
     - Stop 1: Frame 177 (0to10/ezgif-frame-177.jpg) [Progress 0.18 -> 0.23] (index 176)
     - Stop 2: Frame 299 (0to10/ezgif-frame-299.jpg) [Progress 0.35 -> 0.40] (index 298)
     - Stop 3: Frame 009 in 20to27 (20to27/ezgif-frame-009.jpg) [Progress 0.68 -> 0.73] (index 608)
  ============================================================ */
  function mapProgressToFrame(p) {
    if (p <= 0) return 0;
    if (p >= 1) return TOTAL_FRAMES - 1;

    // Segment 1: Progress 0.00 -> 0.18 => Frames 0 -> 176 (0to10/ezgif-frame-177.jpg)
    if (p < 0.18) {
      return Math.round((p / 0.18) * 176);
    }
    // STOP 1 PLATEAU: Progress 0.18 -> 0.23 => HOLD on Frame 177 (index 176)
    if (p <= 0.23) {
      return 176;
    }
    // Segment 2: Progress 0.23 -> 0.35 => Frames 176 -> 298 (0to10/ezgif-frame-299.jpg)
    if (p < 0.35) {
      const segT = (p - 0.23) / (0.35 - 0.23);
      return Math.round(176 + segT * (298 - 176));
    }
    // STOP 2 PLATEAU: Progress 0.35 -> 0.40 => HOLD on Frame 299 (index 298)
    if (p <= 0.40) {
      return 298;
    }
    // Segment 3: Progress 0.40 -> 0.68 => Frames 298 -> 608 (20to27/ezgif-frame-009.jpg)
    if (p < 0.68) {
      const segT = (p - 0.40) / (0.68 - 0.40);
      return Math.round(298 + segT * (608 - 298));
    }
    // STOP 3 PLATEAU: Progress 0.68 -> 0.73 => HOLD on Frame 608 (20to27/ezgif-frame-009.jpg)
    if (p <= 0.73) {
      return 608;
    }
    // Segment 4: Progress 0.73 -> 1.00 => Frames 608 -> 811 (End of sequence)
    const segT = (p - 0.73) / (1.00 - 0.73);
    return Math.round(608 + segT * (TOTAL_FRAMES - 1 - 608));
  }

  function applyCinematicProgress(progress) {
    state.progress = window.gsap
      ? gsap.utils.clamp(0, 1, progress)
      : Math.max(0, Math.min(1, progress));

    // Map scroll progress to 812 frames with 3 deliberate stops
    state.currentFrame = mapProgressToFrame(state.progress);
    requestCanvasDraw();

    // 1. SCENE 01: Landing Greeting Card (0% to 12%)
    if (sceneCard) {
      const cardProgress = Math.min(1, state.progress / 0.12);
      const cardOpacity = 1 - cardProgress;
      const cardScale = 1 + cardProgress * 0.05;
      const cardY = -cardProgress * 30;
      sceneCard.style.opacity = cardOpacity.toFixed(3);
      sceneCard.style.transform = `scale(${cardScale.toFixed(3)}) translateY(${cardY.toFixed(1)}px)`;
      sceneCard.style.pointerEvents = cardProgress > 0.85 ? "none" : "auto";
    }

    // 2. SCENE 02: Canvas Viewport (active from 4% to 100%)
    if (sceneCanvasView) {
      const canvasIn = state.progress < 0.04 ? 0 : Math.min(1, (state.progress - 0.04) / 0.05);
      sceneCanvasView.style.opacity = canvasIn.toFixed(3);
    }

    // 3. Sparkles & Zari Dust Floating Field (15% to 85%)
    if (sparklesContainer) {
      const spStart = 0.14, spEnd = 0.86;
      let spOp = 0;
      if (state.progress >= spStart && state.progress <= spEnd) {
        const mid = (spStart + spEnd) / 2;
        spOp = state.progress < mid
          ? (state.progress - spStart) / (mid - spStart)
          : (spEnd - state.progress) / (spEnd - mid);
      }
      sparklesContainer.style.opacity = spOp.toFixed(3);
    }

    if (particlesLayer) {
      const pStart = 0.18, pEnd = 0.88;
      let pOp = 0;
      if (state.progress >= pStart && state.progress <= pEnd) {
        const pMid = (pStart + pEnd) / 2;
        pOp = state.progress < pMid
          ? (state.progress - pStart) / (pMid - pStart)
          : (pEnd - state.progress) / (pEnd - pMid);
      }
      particlesLayer.style.opacity = pOp.toFixed(3);
    }

    // 4. Floating Story Journey Caption ("Enter through silk. Every thread weaves a 1000 years of heritage")
    // Aligned to lead directly up into Frame 177 stop
    if (journeyCaption) {
      const fadeInStart = 0.04;   // starts fading in early
      const fadeInEnd = 0.10;     // reaches 100% full opacity
      const fadeOutStart = 0.17;  // holds through approach to Stop 1 (Frame 177)
      const fadeOutEnd = 0.22;    // dissolves during Frame 177 hold

      let capOp = 0;
      if (state.progress >= fadeInStart && state.progress < fadeInEnd) {
        capOp = (state.progress - fadeInStart) / (fadeInEnd - fadeInStart);
      } else if (state.progress >= fadeInEnd && state.progress <= fadeOutStart) {
        capOp = 1; // 100% fully visible plateau
      } else if (state.progress > fadeOutStart && state.progress <= fadeOutEnd) {
        capOp = 1 - (state.progress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
      } else {
        capOp = 0;
      }

      journeyCaption.style.opacity = capOp.toFixed(3);
      journeyCaption.style.transform = `translateY(${((1 - capOp) * 16).toFixed(1)}px)`;
    }

    // 5. SCENE 02 CARD OVERLAY: The Korvai Technique ("Two Hearts, One Rhythm")
    // Appears swiftly after Stop 1 and fades out much sooner
    if (sceneKorvaiOverlay) {
      const korvaiStart = 0.235;  // starts fading in after Stop 1
      const korvaiIn = 0.255;     // reaches 100% full opacity quickly
      const korvaiOutStart = 0.275;// starts fading out much sooner
      const korvaiEnd = 0.298;    // fully dissolved by 0.298

      let kOp = 0;
      if (state.progress >= korvaiStart && state.progress < korvaiIn) {
        kOp = (state.progress - korvaiStart) / (korvaiIn - korvaiStart);
      } else if (state.progress >= korvaiIn && state.progress <= korvaiOutStart) {
        kOp = 1; // 100% fully visible plateau
      } else if (state.progress > korvaiOutStart && state.progress <= korvaiEnd) {
        kOp = 1 - (state.progress - korvaiOutStart) / (korvaiEnd - korvaiOutStart);
      } else {
        kOp = 0;
      }

      sceneKorvaiOverlay.style.opacity = kOp.toFixed(3);
      sceneKorvaiOverlay.style.pointerEvents = kOp > 0.5 ? "auto" : "none";
      sceneKorvaiOverlay.classList.toggle("active", kOp > 0.5);

      const korvaiCard = $("korvaiCard");
      if (korvaiCard && kOp > 0) {
        const localNorm = (state.progress - korvaiStart) / (korvaiEnd - korvaiStart);
        const shiftY = (localNorm * 28) - 14;
        korvaiCard.style.transform = `translateY(${-shiftY.toFixed(1)}px)`;
      }
    }

    // 6. SCENE 03 CARD OVERLAY: Pure Gold Zari (10to20 Frame 001 to 130)
    // Appears after Stop 2 (Frame 299) and finishes before Stop 3 (20to27 Frame 009)
    if (sceneZariOverlay) {
      const zStart = 0.405;   // right after Stop 2 (Frame 299)
      const zIn = 0.450;      // reaches 100% full opacity
      const zOutStart = 0.530;// holds 100% solid through Frame 130
      const zEnd = 0.590;     // dissolves smoothly before Stop 3 at Frame 608

      let zOp = 0;
      if (state.progress >= zStart && state.progress < zIn) {
        zOp = (state.progress - zStart) / (zIn - zStart);
      } else if (state.progress >= zIn && state.progress <= zOutStart) {
        zOp = 1; // 100% fully visible plateau
      } else if (state.progress > zOutStart && state.progress <= zEnd) {
        zOp = 1 - (state.progress - zOutStart) / (zEnd - zOutStart);
      } else {
        zOp = 0;
      }

      sceneZariOverlay.style.opacity = zOp.toFixed(3);
      sceneZariOverlay.style.pointerEvents = zOp > 0.5 ? "auto" : "none";
      sceneZariOverlay.classList.toggle("active", zOp > 0.5);

      const zariCard = $("zariCard");
      if (zariCard && zOp > 0) {
        const localNorm = (state.progress - zStart) / (zEnd - zStart);
        const shiftY = (localNorm * 36) - 18;
        zariCard.style.transform = `translateY(${-shiftY.toFixed(1)}px)`;
      }
    }
  }

  /* ============================================================
     7. GSAP SCROLLTRIGGER TIMELINE INITIALIZATION
  ============================================================ */
  function initTimeline() {
    if (isReducedMotion || !window.gsap || !window.ScrollTrigger) {
      initFallbackMode();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Animate golden sparkles
    sparkleElements.forEach((item) => {
      gsap.to(item.el, {
        opacity: 0.85,
        scale: item.baseScale * 1.35,
        rotation: 45,
        duration: item.speed,
        repeat: -1,
        yoyo: true,
        delay: item.delay,
        ease: "sine.inOut"
      });
    });

    // Animate gold dust particles
    domParticles.forEach((p) => {
      gsap.to(p, {
        y: -50 - Math.random() * 100,
        x: (Math.random() - 0.5) * 50,
        opacity: 0.35 + Math.random() * 0.65,
        duration: 3 + Math.random() * 3,
        repeat: -1,
        delay: Math.random() * 3,
        ease: "sine.inOut",
        yoyo: true
      });
    });

    // Pinned Sequence ScrollTrigger with Magnetic Stops at Frame 177, Frame 299 & 20to27 Frame 009
    ScrollTrigger.create({
      trigger: "#cinematic",
      start: "top top",
      end: `+=${SCROLL_DISTANCE}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      snap: {
        snapTo: (value) => {
          const stop1 = 0.205; // Frame 177 (0to10/ezgif-frame-177.jpg)
          const stop2 = 0.375; // Frame 299 (0to10/ezgif-frame-299.jpg)
          const stop3 = 0.705; // Frame 009 in 20to27 (20to27/ezgif-frame-009.jpg)
          if (Math.abs(value - stop1) < 0.045) return stop1;
          if (Math.abs(value - stop2) < 0.045) return stop2;
          if (Math.abs(value - stop3) < 0.045) return stop3;
          return value;
        },
        duration: { min: 0.2, max: 0.5 },
        delay: 0.06,
        ease: "power2.out"
      },
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => applyCinematicProgress(self.progress),
      onLeave: () => applyCinematicProgress(1),
      onEnterBack: () => applyCinematicProgress(0.999)
    });

    // Editorial Scroll Reveal Animations for Main Website
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
     8. 3D PERSPECTIVE CARD TILT & SAREE LIGHTBOX MODAL
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

  // Saree Modal Lightbox
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
     9. INTERACTIVE WEAVE FILTER TABS
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
              gsap.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
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
     10. VIRTUAL VIDEO SHOPPING BOOKING MODAL
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
     11. CUSTOM CURSOR & NAVIGATION INTERACTIONS
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
     12. INITIALIZATION & RESPONSIVE RESIZE HANDLING
  ============================================================ */
  let resizeTimer;
  function handleWindowResize() {
    resizeSequenceCanvas();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 150);
  }

  window.addEventListener("resize", handleWindowResize, { passive: true });
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      resizeSequenceCanvas();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 200);
  });

  resizeSequenceCanvas();
  drawFallbackGradient();
  preloadFrameSequence();

})();
