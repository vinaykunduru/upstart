/* ==============================================
פונקציית ניקוי כוללת
============================================== */
function cleanupPage() {
  if (gsap && gsap.ScrollTrigger) {
    gsap.killTweensOf("*");
    gsap.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.clear();
  }

  // Cleanup mouse wheel effects
  if (window.mouseWheelEffects) {
    window.mouseWheelEffects.forEach((cleanup) => {
      if (typeof cleanup === "function") cleanup();
    });
    window.mouseWheelEffects = [];
  }

  const worksContainer = document.querySelector(".works-container");
  if (worksContainer) {
    if (worksContainer.infiniteScroll) {
      worksContainer.infiniteScroll.destroy();
      worksContainer.infiniteScroll = null;
    }
    const items = worksContainer.querySelectorAll(".works-item");
    items.forEach((item) => {
      if (item.destroy) item.destroy();
    });
    worksContainer.innerHTML = "";
  }

  document
    .querySelectorAll(
      ".slider, #video, .works-item, .tab-button, .tab-content, .image-container, .gallery-grid .image, #project-videos video"
    )
    .forEach((el) => {
      if (el.dragScroll) el.dragScroll.destroy();
      if (el.pause) {
        el.pause();
        el.currentTime = 0;
      }
      if (el.destroy) el.destroy();
      if (el._gsap) {
        gsap.killTweensOf(el);
      }
      if (el._scrollTrigger) {
        el._scrollTrigger.kill();
      }
    });

  if (window.cleanupCursor) window.cleanupCursor();
  if (window.customSmoothScroll) window.customSmoothScroll.destroy();
  if (window.verticalSmoothScroll) window.verticalSmoothScroll.destroy();
  if (window.navbarScrollHandler) window.navbarScrollHandler.destroy();

  if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
    if (typeof UnicornStudio.destroy === "function") {
      UnicornStudio.destroy();
    }
    window.UnicornStudio.isInitialized = false;
  }

  const scripts = document.querySelectorAll(
    'script[src*="unicornStudio.umd.js"]'
  );
  scripts.forEach((script) => script.remove());

  window.customSmoothScroll = null;
  window.navbarScrollHandler = null;
  window.verticalSmoothScroll = null;
  window.cleanupCursor = null;
  window.mouseWheelEffects = [];
  window.transitioning = false;
  window.scrollTo(0, 0);

  document.querySelectorAll(".active, .open, .clicked").forEach((el) => {
    el.classList.remove("active", "open", "clicked");
  });
}

/* ==============================================
אתחול כל הפונקציות
============================================== */
function initAllFunctions() {
  gsap.registerPlugin(SplitText, ScrollTrigger);

  // טיפול בטעינת תמונות
  const images = document.querySelectorAll("img[data-src]");
  images.forEach((img) => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
  });

  // טיפול בתמונות רקע
  const bgImages = document.querySelectorAll("[data-bg-src]");
  bgImages.forEach((el) => {
    if (el.dataset.bgSrc) {
      el.style.backgroundImage = `url(${el.dataset.bgSrc})`;
      el.removeAttribute("data-bg-src");
    }
  });

  // Initialize all effects
  initInfinityGallery();
  initSplitTextAnimations();
  initTabFilter();
  initPageLoad();
  initGsapAnimations();

  if (window.location.pathname === "/studio") {
    initUnicornStudio();
  }

  if (window.innerWidth >= 500) {
    initInteractiveCursor();
    initGridToSlider();
    initVerticalSmoothScroll();
  }

  initVideos();
  initCustomSmoothScrolling();
  initNavbarShowHide();
  initSliderDragging();
  refreshWebflowComponents();
  reloadFinsweetCMS();
  initVideoFeature();

  const overlayFirst = document.querySelector(".page-overlay-first");
  const overlaySecond = document.querySelector(".page-overlay-second");
  const pageWrapper = document.getElementById("page-wrapper");

  gsap.set([overlayFirst, overlaySecond], {
    display: "none",
    visibility: "hidden",
    opacity: 0,
  });

  // Add cleanup after page transition animation
  if (window.transitioning) {
    cleanupPage();
  }

  gsap.fromTo(
    pageWrapper,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.5,
      onComplete: () => {
        if (window.transitioning) {
          cleanupPage();
        }
        // Initialize mouse wheel effects after transition
        if (window.innerWidth >= 500) {
          initMouseWheelEffects();
        }
      },
    }
  );

  // Force scroll to top after initialization
  window.scrollTo(0, 0);

  if (gsap && gsap.ScrollTrigger) {
    gsap.ScrollTrigger.refresh();
  }
}

/* ==============================================
אירועים ומעברי דפים
============================================== */
document.addEventListener("loadingFinished", initAllFunctions);

function handleInternalLinkClicks(event) {
  const target = event.target.closest("a[href]");
  if (
    target &&
    target.id !== "toggle-button" &&
    !target.target &&
    !target.href.includes("#") &&
    !target.href.includes("mailto:") &&
    !target.href.includes("tel:")
  ) {
    const currentUrl = window.location.href;
    const targetUrl = target.href;

    const isNotFoundPage =
      document.title.toLowerCase().includes("404") ||
      document.body.innerText.toLowerCase().includes("page not found") ||
      document.body.innerText.toLowerCase().includes("não encontrada");

    const isThankYouPage = currentUrl.includes("/thank-you");

    if (currentUrl === targetUrl && !isNotFoundPage && !isThankYouPage) {
      event.preventDefault();
      return;
    }

    if (!isNotFoundPage && !isThankYouPage) {
      event.preventDefault();
      pageTransition(target.href);
    }
  }
}

document.body.addEventListener("click", handleInternalLinkClicks);
window.addEventListener("popstate", handlePopState);

async function pageTransition(url, isPopState = false) {
  if (url === window.location.href && !isPopState) {
    return;
  }

  const overlayFirst = document.querySelector(".page-overlay-first");
  const overlaySecond = document.querySelector(".page-overlay-second");
  const pageWrapper = document.getElementById("page-wrapper");

  gsap.set([overlayFirst, overlaySecond], {
    display: "block",
    visibility: "visible",
  });
  gsap.set(overlayFirst, {
    clipPath: "inset(50% 31% 20% 40%)",
    bottom: 0,
    rotate: 4,
    height: "0dvh",
    opacity: 1,
    transformOrigin: "bottom center",
  });

  const transitionIn = gsap.timeline();
  transitionIn
    .to(overlayFirst, {
      clipPath: "inset(0% 0% 0% 0%)",
      height: "100dvh",
      opacity: 1,
      rotate: 0,
      duration: 1.3,
      ease: "expo.inOut",
    })
    .to(overlaySecond, { opacity: 0.7, duration: 1, ease: "power2.inOut" }, 0);

  await transitionIn;

  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to load page: ${response.status}`);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, "text/html");
    const newContent = doc.querySelector("#page-wrapper").innerHTML;
    const newTitle = doc.querySelector("title").innerText;

    cleanupPage();

    pageWrapper.innerHTML = newContent;
    document.title = newTitle;

    // טיפול מיידי בתמונות
    const images = pageWrapper.querySelectorAll("img[data-src]");
    images.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      }
    });

    // טיפול מיידי בתמונות רקע
    const bgImages = pageWrapper.querySelectorAll("[data-bg-src]");
    bgImages.forEach((el) => {
      if (el.dataset.bgSrc) {
        el.style.backgroundImage = `url(${el.dataset.bgSrc})`;
        el.removeAttribute("data-bg-src");
      }
    });

    // Force scroll to top after content replacement
    window.scrollTo(0, 0);

    if (!isPopState) {
      window.history.pushState({ path: url }, newTitle, url);
    }

    initAllFunctions();
  } catch (error) {
    console.error(error);
  }

  gsap.set([overlayFirst, overlaySecond], { display: "none", opacity: 0 });

  document.body.addEventListener("click", handleInternalLinkClicks);
  window.addEventListener("popstate", handlePopState);
}

function handlePopState() {
  if (!window.transitioning) {
    pageTransition(window.location.href, true);
  }
}

/* ==============================================
Unicorn Studio Initialization
============================================== */
function initUnicornStudio() {
  const isStudioPage = window.location.pathname === "/studio";
  if (isStudioPage) {
    if (!window.UnicornStudio || !window.UnicornStudio.isInitialized) {
      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false };
      }
      var i = document.createElement("script");
      i.src = "https://cdn.unicorn.studio/v1.4.0/unicornStudio.umd.js";
      i.onload = function () {
        if (!window.UnicornStudio.isInitialized) {
          UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(i);
    }
  }
}

/* ==============================================
Reload FinSweet CMS Filter
============================================== */
function reloadFinsweetCMS() {
  const oldScript = document.querySelector('script[src*="cmsfilter.js"]');
  if (oldScript) {
    oldScript.remove();
  }
  const newScript = document.createElement("script");
  newScript.src =
    "https://cdn.jsdelivr.net/npm/@finsweet/attributes-cmsfilter@1/cmsfilter.js";
  newScript.async = true;
  newScript.onload = () => {};
  document.body.appendChild(newScript);
}

/* ==============================================
Unicorn Studio Initialization
============================================== */
function initUnicornStudio() {
  const isStudioPage = window.location.pathname === "/studio";
  if (isStudioPage) {
    if (!window.UnicornStudio || !window.UnicornStudio.isInitialized) {
      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false };
      }
      var i = document.createElement("script");
      i.src = "https://cdn.unicorn.studio/v1.4.0/unicornStudio.umd.js";
      i.onload = function () {
        if (!window.UnicornStudio.isInitialized) {
          UnicornStudio.init();
          window.UnicornStudio.isInitialized = true;
        }
      };
      (document.head || document.body).appendChild(i);
    }
  } else {
    if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
      if (typeof UnicornStudio.destroy === "function") {
        UnicornStudio.destroy();
      }
      window.UnicornStudio.isInitialized = false;
    }
  }
}

/* ==============================================
Page Load Functions
============================================== */
function initPageLoad() {
  const nextProjectLink = document.querySelector(".next-project-link img");
  const nextProjectImage = document.querySelector(".next-project-image");

  if (nextProjectLink && nextProjectImage) {
    nextProjectImage.appendChild(nextProjectLink);
  }

  gsap.set(".logo img, .burger", { opacity: 0 });
  gsap.to(".logo img, .burger", {
    opacity: 1,
    duration: 1,
    ease: "power4.inOut",
  });
}

/* ==============================================
Custom Smooth Scrolling
============================================== */

function initCustomSmoothScrolling() {
  if (
    window.customSmoothScroll &&
    typeof window.customSmoothScroll.destroy === "function"
  ) {
    window.customSmoothScroll.destroy();
  }

  const lerp = (start, end, t) => start * (1 - t) + end * t;
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  let isSliderDragging = false; // Flag to disable scroll events while dragging the slider

  class CustomSmoothScroll {
    constructor() {
      this.targetScroll = 0;
      this.currentScroll = 0;
      this.smoothness = window.innerWidth < 750 ? 0.03 : 0.056; // Apply lower smoothness for mobile
      this.scrollEnabled = true;
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.dragMultiplier = window.innerWidth < 750 ? 5 : 2;
      this.touchMultiplier = window.innerWidth < 750 ? 2.9 : 2.2;
      this.lastFrameTime = performance.now();
      this.bindedFunctions = {};
      this.init();
    }

    init() {
      this.applyStyles();
      this.bindEvents();
      this.setupSliderInteraction();
      this.updateBodyHeight();
      setTimeout(() => {
        this.scrollEnabled = true;
        this.forceScrollUpdate();
        this.smoothScrollLoop();
      }, 10);
    }

    applyStyles() {
      document.body.style.overflow = "hidden";
      document.documentElement.style.scrollBehavior = "auto";
    }

    bindEvents() {
      // Bind wheel event
      this.bindedFunctions.onWheel = (e) => this.onScroll(e.deltaY);
      window.addEventListener("wheel", this.bindedFunctions.onWheel, {
        passive: false,
      });

      // Touch events for scrolling
      this.bindedFunctions.startTouchDrag = (e) => this.startTouchDrag(e);
      window.addEventListener(
        "touchstart",
        this.bindedFunctions.startTouchDrag,
        { passive: true }
      );
      this.bindedFunctions.onTouchDrag = (e) => this.onTouchDrag(e);
      window.addEventListener("touchmove", this.bindedFunctions.onTouchDrag, {
        passive: false,
      });
      this.bindedFunctions.endTouchDrag = () => this.endTouchDrag();
      window.addEventListener("touchend", this.bindedFunctions.endTouchDrag);

      // Mouse events for scrolling
      this.bindedFunctions.startMouseDrag = (e) => this.startMouseDrag(e);
      window.addEventListener("mousedown", this.bindedFunctions.startMouseDrag);
      this.bindedFunctions.onMouseDrag = (e) => this.onMouseDrag(e);
      window.addEventListener("mousemove", this.bindedFunctions.onMouseDrag);
      this.bindedFunctions.endMouseDrag = () => this.endMouseDrag();
      window.addEventListener("mouseup", this.bindedFunctions.endMouseDrag);

      // Resize event to update body height
      this.bindedFunctions.onResize = () => this.updateBodyHeight();
      window.addEventListener("resize", this.bindedFunctions.onResize);
    }

    setupSliderInteraction() {
      document.querySelectorAll(".slider").forEach((slider) => {
        // Mobile touch events for slider
        slider.addEventListener("touchstart", (e) => this.startSliderDrag(e), {
          passive: true,
        });
        slider.addEventListener("touchmove", (e) => this.detectSliderDrag(e), {
          passive: false,
        });
        slider.addEventListener("touchend", () => this.endSliderDrag());
        slider.addEventListener("touchcancel", () => this.endSliderDrag());
        // Desktop mouse events for slider
        slider.addEventListener("mousedown", (e) => this.startSliderDrag(e));
        slider.addEventListener("mousemove", (e) => this.detectSliderDrag(e));
        slider.addEventListener("mouseup", () => this.endSliderDrag());
        slider.addEventListener("mouseleave", () => this.endSliderDrag());
      });
    }

    updateBodyHeight() {
      const scrollableContent = document.querySelector(".wrapper");
      if (scrollableContent) {
        document.body.style.height = `${scrollableContent.clientHeight}px`;
      }
    }

    onScroll(delta) {
      if (!this.scrollEnabled) return; // Removed isSliderDragging check here
      this.targetScroll = clamp(
        this.targetScroll + delta,
        0,
        document.body.scrollHeight - window.innerHeight
      );
    }

    startTouchDrag(e) {
      if (!this.scrollEnabled) return; // No check for isSliderDragging
      this.isDragging = true;
      this.startY = e.touches[0].clientY;
    }

    onTouchDrag(e) {
      if (!this.isDragging || !this.scrollEnabled) return;

      const currentY = e.touches[0].clientY;
      const delta = (this.startY - currentY) * this.touchMultiplier;

      const atTop = Math.round(this.currentScroll) <= 0;
      const pullingDown = delta < 0;

      if (atTop && pullingDown) return; // Allow browser to handle pull-to-refresh

      this.onScroll(delta);
      this.startY = currentY;
      e.preventDefault(); // Prevent only when not at top
    }

    endTouchDrag() {
      this.isDragging = false;
    }

    startMouseDrag(e) {
      if (!this.scrollEnabled) return; // No check for isSliderDragging
      this.isDragging = true;
      this.startY = e.clientY;
      document.body.style.cursor = "grabbing";
    }

    onMouseDrag(e) {
      if (!this.isDragging || !this.scrollEnabled) return;
      const delta = (this.startY - e.clientY) * this.dragMultiplier;
      this.onScroll(delta); // Allow scrolling even if dragging
      this.startY = e.clientY;
    }

    endMouseDrag() {
      this.isDragging = false;
      document.body.style.cursor = "";
    }

    startSliderDrag(e) {
      this.startX = e.clientX || e.touches[0].clientX;
      this.startY = e.clientY || e.touches[0].clientY;
      isSliderDragging = true;
    }

    detectSliderDrag(e) {
      e.preventDefault();
    }

    endSliderDrag() {
      isSliderDragging = false;
    }

    forceScrollUpdate() {
      this.targetScroll = window.scrollY;
      this.currentScroll = this.targetScroll;
      window.scrollTo(0, this.targetScroll);
    }

    smoothScrollLoop() {
      const now = performance.now();
      const deltaTime = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      if (this.scrollEnabled && !isSliderDragging) {
        const smoothingFactor =
          1 - Math.pow(1 - this.smoothness, deltaTime * 120);
        this.currentScroll = lerp(
          this.currentScroll,
          this.targetScroll,
          smoothingFactor
        );
        window.scrollTo(0, this.currentScroll);
      }
      requestAnimationFrame(() => this.smoothScrollLoop());
    }

    restart(position = 0) {
      this.targetScroll = position;
      this.currentScroll = position;
      window.scrollTo(0, position);
    }

    destroy() {
      this.scrollEnabled = false;
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.scrollBehavior = "";
      window.removeEventListener("wheel", this.bindedFunctions.onWheel);
      window.removeEventListener(
        "touchstart",
        this.bindedFunctions.startTouchDrag
      );
      window.removeEventListener("touchmove", this.bindedFunctions.onTouchDrag);
      window.removeEventListener("touchend", this.bindedFunctions.endTouchDrag);
      window.removeEventListener(
        "mousedown",
        this.bindedFunctions.startMouseDrag
      );
      window.removeEventListener("mousemove", this.bindedFunctions.onMouseDrag);
      window.removeEventListener("mouseup", this.bindedFunctions.endMouseDrag);
      window.removeEventListener("resize", this.bindedFunctions.onResize);
    }
  }

  window.customSmoothScroll = new CustomSmoothScroll();
}

/* ==============================================
Split Text Animations
============================================== */

function initSplitTextAnimations() {
  // Clean up existing ScrollTriggers before initializing new ones
  if (gsap.ScrollTrigger) {
    gsap.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }

  // Initialize SplitText for new content
  const newContent = document.querySelector("body");
  if (newContent) {
    const elements = newContent.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p, .btn, .nav, #theme-toggle, .scroll, .toggle-btn:not(.image-container *)"
    );
    elements.forEach((container) => {
      if (container.closest(".image-container")) return;
      const childElements = container.matches(".nav")
        ? container.querySelectorAll("a, .btn, p, #theme-toggle")
        : [container];
      childElements.forEach((element) => {
        const splitText = new SplitText(element, {
          type: "lines",
          linesClass: "line",
        });
        splitText.lines.forEach((line) => {
          line.style.display = "inline-block";
          line.style.width = "100%";
          line.style.lineHeight = "unset";
          line.style.visibility = "hidden";
        });
        // Force a reflow to ensure styles are applied
        splitText.lines.forEach((line) => line.offsetWidth);
        gsap.set(splitText.lines, {
          visibility: "visible",
          yPercent: 100,
          clipPath: "inset(0% 0% 120% 0%)",
          opacity: 1,
        });

        // Check if the current page is the home page
        const isHomePage =
          window.location.pathname === "/" ||
          window.location.pathname === "/index.html";

        gsap.to(splitText.lines, {
          yPercent: 0,
          clipPath: "inset(-20% -10% -10% 0%)",
          opacity: 1,
          stagger: 0.12,
          duration: 1.6,
          delay: isHomePage ? 0.5 : 0, // 0.5s delay only on home page
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 100%",
            end: "bottom 100%",
            toggleActions: "play none none reverse",
            once: true,
          },
        });
      });
    });
  }
}

/* ==============================================
Interactive Cursor
============================================== */
function initInteractiveCursor() {
  // Don't initialize on mobile
  if (window.innerWidth <= 500) return;

  const cursor = document.querySelector("#cursor");
  if (cursor) {
    const mouse = { x: -100, y: -100 };
    let isMoving = false;
    let isDragging = false;
    let cursorAnimationFrame;
    let cursorLocked = false;
    let dragTimeout;

    if (window.cursorAnimationFrame)
      cancelAnimationFrame(window.cursorAnimationFrame);
    if (window.cleanupCursor) window.cleanupCursor();
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });

    function trackMouseMovement(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isMoving = true;
    }

    function handleLinkEnter() {
      if (!cursorLocked) {
        cursor.classList.add("change");
        cursor.classList.remove("explore-change", "explore");
      }
    }

    function handleLinkLeave() {
      if (!cursorLocked) {
        cursor.classList.remove("change");
      }
    }

    function handleLinkClick() {
      cursor.classList.remove("change", "explore", "explore-change");
      cursorLocked = true;
      setTimeout(() => {
        cursorLocked = false;
      }, 1000);
    }

    function animateCursor() {
      if (isMoving) {
        gsap.to(cursor, {
          duration: 0.7,
          x: mouse.x,
          y: mouse.y,
          ease: "power3.out",
        });
        isMoving = false;
      }
      cursorAnimationFrame = requestAnimationFrame(animateCursor);
    }

    window.addEventListener("mousemove", trackMouseMovement);

    const links = document.querySelectorAll(
      "a:not(.recent-work-links a), a, .toggle-switch, .video-thumb, .toggle-btn, .image-container, .next-project, .work-slide img, .w-button, .tag, .all-cases, .toggle-btn"
    );
    links.forEach((link) => {
      link.addEventListener("mouseenter", handleLinkEnter);
      link.addEventListener("mouseleave", handleLinkLeave);
      link.addEventListener("click", handleLinkClick);
    });

    const worksSliders = document.querySelectorAll(
      ".hero .works-slider, .studio-gallery .slider"
    );
    worksSliders.forEach((slider) => {
      slider.addEventListener("mouseenter", () => {
        if (!cursorLocked) cursor.classList.add("explore");
      });
      slider.addEventListener("mouseleave", () => {
        if (!cursorLocked) cursor.classList.remove("explore");
      });
    });

    // Detect Hold and Drag
    function handleMouseDown(e) {
      dragTimeout = setTimeout(() => {
        isDragging = true;
        cursor.classList.add("drag");
      }, 150); // Add delay to prevent false triggers
    }

    function handleMouseMove(e) {
      if (isDragging) {
        cursor.classList.add("drag");
      }
    }

    function handleMouseUp(e) {
      if (isDragging) {
        isDragging = false;
        cursor.classList.remove("drag");
      }
      clearTimeout(dragTimeout);
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    animateCursor();

    window.cursorAnimationFrame = cursorAnimationFrame;
    window.cleanupCursor = function () {
      if (cursorAnimationFrame) cancelAnimationFrame(cursorAnimationFrame);
      window.removeEventListener("mousemove", trackMouseMovement);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }
}

//initInteractiveCursor();

/* ==============================================
Page GSAP Animations
============================================== */

function initGsapAnimations() {
  if (window.innerWidth < 500) {
    gsap.fromTo(
      ".work-slide",
      {
        clipPath: "inset(0 0 100% 0)", // Start with full clipping
        x: 2000, // Set x to 500 for mobile
        yPercent: 100,
        opacity: 1,
        transformOrigin: "center center",
      },
      {
        clipPath: "inset(0 0 0% 0)", // Unclipped to reveal the entire element
        x: 0, // Animate to original position
        yPercent: 0,
        opacity: 1,
        duration: 2, // Duration of the animation
        ease: "expo.inOut", // Smooth easing effect
        stagger: 0.05, // Stagger the animation for each slide
      }
    );
  } else {
    gsap.fromTo(
      ".work-slide",
      {
        clipPath: "inset(0 0 100% 0)", // Start with full clipping
        x: 3000, // Set x to 3000 for larger screens
        yPercent: 100,
        opacity: 1,
        transformOrigin: "center center",
      },
      {
        clipPath: "inset(0 0 0% 0)", // Unclipped to reveal the entire element
        x: 0, // Animate to original position
        yPercent: 0,
        opacity: 1,
        duration: 2, // Duration of the animation
        ease: "expo.inOut", // Smooth easing effect
        stagger: 0.05, // Stagger the animation for each slide
      }
    );
  }

  gsap.fromTo(
    ".image-container",
    {
      x: 3000, // Initial position off the screen to the right
      yPercent: 100,
      opacity: 0,
      transformOrigin: "top center",
    },
    {
      x: 0, // Animate to original position
      yPercent: 0,
      opacity: 1,
      delay: -0.5,
      duration: 2, // Duration of the animation
      ease: "expo.inOut", // Smooth easing effect
      stagger: 0.09, // Stagger the animation for each slide
    }
  );

  gsap.set(".hero .video-thumb video", {
    clipPath: "inset(100% 100% 0 0)",
  });

  gsap.to(".hero .video-thumb video", {
    clipPath: "inset(0% 0% 0 0)",
    duration: 2,
    delay: 0.5,
    ease: "expo.inOut",
  });

  gsap.from(".studio-headline img", {
    opacity: 0,
    y: 200,
    scale: 0.3,
    rotate: 15,
    duration: 2,
    delay: 0.5,
    ease: "power4.out",
  });

  gsap.set(".contact-image", {
    clipPath: "inset(10% 100% 10% 0%)",
  });

  gsap.to(".contact-image", {
    clipPath: "inset(0% 0% 0% 0)",
    duration: 1.8,
    ease: "expo.inOut",
  });

  gsap.set(".contact-image img", {
    scale: 2,
    rotate: 10,
  });

  gsap.to(".contact-image img", {
    scale: 1,
    rotate: 0,
    duration: 1.8,
    delay: -0.15,
    ease: "expo.inOut",
  });

  gsap.set(".works-filters .tag, .all-cases-radio", {
    yPercent: 200,
    scale: 0.8,
    clipPath: "inset(0% 0% 100% 0%)",
  });

  gsap.to(".works-filters .tag, .all-cases-radio", {
    yPercent: 0,
    scale: 1,
    duration: 1.5,
    clipPath: "inset(0% 0% -20% 0%)",
    ease: "expo.out", // Smooth easing effect
    stagger: 0.05,
  });

  let scrolled = false;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20 && !scrolled) {
      gsap.to(".header .logo", {
        clipPath: "inset(0 80% 0 0)",
        duration: 1,
        ease: "expo.out",
      });
      scrolled = true;
    } else if (window.scrollY <= 20 && scrolled) {
      gsap.to(".header .logo", {
        clipPath: "inset(0 0% 0 0)",
        duration: 1,
        ease: "expo.out",
      });
      scrolled = false;
    }
  });

  gsap.set(".w-input, .w-select, .btn:after", {
    clipPath: "inset(0 100% 0 0)",
  });

  gsap.to(".w-input, .w-select, .btn:after", {
    clipPath: "inset(0 0% 0 0)",
    duration: 1.2,
    ease: "power2.out",
    stagger: 0.2,
    scrollTrigger: {
      trigger: ".w-input, .w-select",
      start: "top 80%", // Adjust start position as needed
      toggleActions: "play none none none",
    },
  });

  document.querySelectorAll(".gallery-grid .image img").forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.15, yPercent: -15 },
      {
        scale: 1.15,
        yPercent: 0,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest(".image"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      }
    );
  });

  const easeSetting = "power4.out";
  const animationDuration = 0.8;

  gsap.utils.toArray(".work-slide").forEach((slide) => {
    let heading = slide.querySelector("h5");
    let image = slide.querySelector("img");

    gsap.set(heading, {
      yPercent: 200,
      rotate: 3,
      clipPath: "inset(0% 0% 100% 0%)",
    });
    gsap.set(image, { scale: 1 });

    let enterAnim = gsap
      .timeline({ paused: true })
      .to(heading, {
        yPercent: 0,
        rotate: 0,
        clipPath: "inset(0% 0% -8% 0%)",
        duration: animationDuration,
        ease: easeSetting,
      })
      .to(
        image,
        {
          scale: 1.3,
          rotate: 2,
          duration: animationDuration,
          ease: easeSetting,
        },
        "<"
      );

    let exitAnim = gsap
      .timeline({ paused: true })
      .to(heading, {
        yPercent: 200,
        rotate: 3,
        clipPath: "inset(0% 0% 100% 0%)",
        duration: animationDuration,
        ease: easeSetting,
      })
      .to(
        image,
        { scale: 1, rotate: 0, duration: animationDuration, ease: easeSetting },
        "<"
      );

    slide.addEventListener("mouseenter", () => {
      if (exitAnim.isActive()) exitAnim.progress(1); // Ensure exit animation doesn't interfere
      enterAnim.restart();
    });

    slide.addEventListener("mouseleave", () => {
      if (enterAnim.isActive()) enterAnim.progress(1); // Ensure enter animation doesn't interfere
      exitAnim.restart();
    });
  });

  gsap.set(".project-cover img", {
    clipPath: "inset(10% 100% 10% 0%)",
    scale: 1,
    rotate: 10,
    yPercent: 100,
  });

  gsap.to(".project-cover img", {
    clipPath: "inset(0% 0% 0% 0)",
    duration: 3,
    scale: 1,
    rotate: 0,
    delay: -1,
    yPercent: 0,
    ease: "expo.inOut",
  });

  gsap.to(".project-cover", {
    scale: () =>
      window.innerWidth / document.querySelector(".project-cover").offsetWidth,
    height: "80dvh", // Animate height to 100dvh
    y: -150,
    ease: "linear",
    scrollTrigger: {
      trigger: ".project-hero",
      start: "top 0%",
      end: "bottom 100%",
      scrub: 0.6,
      toggleActions: "play none none reverse",
    },
  });

  gsap.to(".project-cover img", {
    scale: 1.3, // Parallax effect on the image inside
    ease: "linear",
    scrollTrigger: {
      trigger: ".project-hero",
      start: "top 0%",
      end: "bottom 0%",
      scrub: 0.6,
      toggleActions: "play none none reverse",
    },
  });

  gsap.to(".project-headline", {
    yPercent: -150,
    ease: "linear",
    scrollTrigger: {
      trigger: ".project-hero",
      start: "top 0%",
      end: "bottom 0%",
      scrub: 1,
      toggleActions: "play none none reverse",
    },
  });

  gsap.from(".next-project", {
    clipPath: "inset(15% 15% 15% 15%)",
    duration: 4.5,
    ease: "power1.out",
    scrollTrigger: {
      trigger: ".next-project",
      start: "top 100%",
      end: "bottom 100%",
      scrub: 1,
      toggleActions: "play none none reverse",
    },
  });

  document.querySelectorAll(".gallery-grid .image").forEach((img) => {
    gsap.fromTo(
      img,
      {
        clipPath: "inset(10% 10% 10% 10%)",
        scale: 1,
        yPercent: 20,
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 2,
        scale: 1,
        delay: -1,
        yPercent: 0,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: img.closest(".gallery-grid .image"),
          start: "top bottom",
          end: "bottom top",
          scrub: false,
        },
      }
    );
  });

  document.querySelectorAll("#project-videos video").forEach((video) => {
    gsap.fromTo(
      video,
      {
        clipPath: "inset(10% 10% 10% 10%)",
        scale: 1,
        yPercent: 20,
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 2,
        scale: 1,
        delay: -1,
        yPercent: 0,
        ease: "power4.inOut",
        scrollTrigger: {
          trigger: video,
          start: "top bottom",
          end: "bottom top",
          scrub: false,
        },
      }
    );
  });
}

/* ==============================================
Infinite Horizontal Gallery
============================================== */

function initInfinityGallery() {
  class InfiniteHorizontalScroll {
    constructor(container) {
      if (!container) return;
      this.container = container;
      this.items = Array.from(this.container.children);
      if (this.items.length === 0) return;
      this.scrollX = 0;
      this.smoothScrollX = 0;
      this.touchStartY = 0;
      this.touchDeltaY = 0;
      this.previousDeltaY = 0;
      this.cloneItems();
      this.calculateDimensions();
      this.init();
    }

    cloneItems() {
      const fragmentBefore = document.createDocumentFragment();
      const fragmentAfter = document.createDocumentFragment();
      this.items.forEach((item) => {
        const cloneBefore = item.cloneNode(true);
        const cloneAfter = item.cloneNode(true);
        fragmentBefore.appendChild(cloneBefore);
        fragmentAfter.appendChild(cloneAfter);
      });
      this.container.insertBefore(fragmentBefore, this.container.firstChild);
      this.container.appendChild(fragmentAfter);
    }

    calculateDimensions() {
      this.totalWidth = 0;
      Array.from(this.container.children).forEach((item) => {
        const itemWidth = item.getBoundingClientRect().width;
        const itemMarginRight = parseFloat(getComputedStyle(item).marginRight);
        this.totalWidth += itemWidth + itemMarginRight;
      });
      const originalWidth = this.totalWidth / 3;
      this.scrollX = originalWidth;
      this.smoothScrollX = originalWidth;
      this.container.style.transform = `translateX(${-this.scrollX}px)`;
    }

    init() {
      this.bindEvents();
      this.animate();
      window.addEventListener("resize", () => {
        this.calculateDimensions();
      });
    }

    bindEvents() {
      document.addEventListener("wheel", (e) => this.handleWheel(e), {
        passive: false,
      });
      document.addEventListener("touchstart", (e) => this.handleTouchStart(e), {
        passive: true,
      });
      document.addEventListener("touchmove", (e) => this.handleTouchMove(e), {
        passive: false,
      });
      document.addEventListener("touchend", () => this.handleTouchEnd());
    }

    handleWheel(event) {
      if (event.target.closest("button, input, textarea, select")) return;
      event.preventDefault();
      this.scrollX += event.deltaY * 1.5;
      this.handleInfiniteScroll();
    }

    handleTouchStart(event) {
      this.touchStartY = event.touches[0].clientY;
      this.touchDeltaY = 0;
      this.previousDeltaY = 0;
    }

    handleTouchMove(event) {
      event.preventDefault();
      if (window.innerWidth < 750) {
        const touchY = event.touches[0].clientY;
        this.touchDeltaY = touchY - this.touchStartY;
        const touchSpeed = 4;
        this.scrollX -= (this.touchDeltaY - this.previousDeltaY) * touchSpeed;
        this.previousDeltaY = this.touchDeltaY;
      }
      this.handleInfiniteScroll();
    }

    handleTouchEnd() {
      this.touchDeltaY = 0;
      this.previousDeltaY = 0;
    }

    handleInfiniteScroll() {
      const originalWidth = this.totalWidth / 3;
      if (this.scrollX < 0) {
        this.scrollX += originalWidth;
        this.smoothScrollX += originalWidth;
      } else if (this.scrollX > this.totalWidth - originalWidth) {
        this.scrollX -= originalWidth;
        this.smoothScrollX -= originalWidth;
      }
    }

    animate() {
      this.smoothScrollX += (this.scrollX - this.smoothScrollX) * 0.06;
      this.container.style.transform = `translateX(${-this.smoothScrollX}px)`;
      requestAnimationFrame(() => this.animate());
    }
  }
  new InfiniteHorizontalScroll(document.querySelector(".works-container"));
}

/* ==============================================
Hide Content Until Loaded
============================================== */
document.body.style.visibility = "hidden";
window.addEventListener("load", function () {
  document.body.style.visibility = "visible";
  gsap.set(".logo img", { opacity: 1 });

  gsap.from(".logo img", { yPercent: 150, duration: 2, ease: "power4.inOut" });
  gsap.fromTo(
    "#cursor",
    { scale: 0, opacity: 0 },
    { scale: 1, delay: 1, opacity: 1, duration: 1, ease: "power2.inOut" }
  );
});

/* ==============================================
Show/Hide Grid on Keypress
============================================== */
document.addEventListener("keydown", function (event) {
  if (event.shiftKey && event.key === "G") {
    const gridOverlay = document.querySelector(".grid-overlay");
    if (gridOverlay) {
      gridOverlay.remove();
    } else {
      const overlay = document.createElement("div");
      overlay.className = "grid-overlay";
      for (let i = 0; i < 12; i++) {
        const column = document.createElement("div");
        overlay.appendChild(column);
      }
      document.body.appendChild(overlay);
    }
  }
});

/* ==============================================
Toggle Dark/Light Mode
============================================== */
const root = document.documentElement;
const toggleButton = document.querySelector("#theme-toggle");
const currentTheme = localStorage.getItem("theme") || "light";
if (currentTheme === "dark") {
  root.style.setProperty("--white", "#101010");
  root.style.setProperty("--black", "#ffffff");
} else {
  root.style.setProperty("--white", "#ffffff");
  root.style.setProperty("--black", "#101010");
}
toggleButton.addEventListener("click", () => {
  const isDarkMode = root.style.getPropertyValue("--white") === "#101010";
  if (isDarkMode) {
    root.style.setProperty("--white", "#ffffff");
    root.style.setProperty("--black", "#101010");
    localStorage.setItem("theme", "light");
  } else {
    root.style.setProperty("--white", "#101010");
    root.style.setProperty("--black", "#ffffff");
    localStorage.setItem("theme", "dark");
  }
});

/* ==============================================
Navbar Show/Hide
============================================== */
function initNavbarShowHide() {
  const nav = document.querySelector(".header");
  let lastScrollTop = 0;
  if (nav) {
    window.addEventListener("scroll", function () {
      const st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > 20) {
        nav.classList.add("fixed");
      } else {
        nav.classList.remove("fixed", "scroll");
      }
      if (Math.abs(st - lastScrollTop) > 20) {
        if (st > 100 && st > lastScrollTop) {
          nav.classList.add("scroll");
        } else if (st > 100 && st < lastScrollTop) {
          nav.classList.remove("scroll");
        }
        lastScrollTop = st;
      }
    });
  }
}

/* ==============================================
Slider Dragging Logic
============================================== */

function initSliderDragging() {
  /* ==============================================
 Slider Dragging Logic (Multiple Instances)
 ============================================== */

  class DragScroll {
    constructor(el, wrap, item) {
      this.el = el;
      this.wrap = this.el.querySelector(wrap);
      this.items = this.el.querySelectorAll(item);
      this.dragThreshold = 5;
      this.isDragging = false;
      this.isMouseDown = false;
      this.startX = 0;
      this.startY = 0;
      this.isHorizontalDrag = false;
      this.startTime = 0;
      this.progress = 0;
      this.x = 0;
      this.maxScroll = 0;
      this.gridGap = 0;
      this.sideMargin = 0;
      this.init();
    }

    init() {
      this.applySideMargins();
      this.bindEvents();
      this.calculate();
      this.raf();
    }

    bindEvents() {
      window.addEventListener("resize", () => {
        this.applySideMargins();
        this.calculate();
      });
      this.el.addEventListener("mousedown", (e) => this.handleStart(e));
      window.addEventListener("mousemove", (e) => this.handleMove(e));
      window.addEventListener("mouseup", (e) => this.handleEnd(e));
      this.el.addEventListener("touchstart", (e) => this.handleStart(e));
      window.addEventListener("touchmove", (e) => this.handleMove(e), {
        passive: false,
      });
      window.addEventListener("touchend", (e) => this.handleEnd(e));
      this.el.addEventListener("dragstart", (e) => this.preventDragOnLinks(e));
      window.addEventListener("wheel", (e) => this.handleWheel(e), {
        passive: false,
      });
    }

    applySideMargins() {
      const vw = window.innerWidth / 100;
      this.sideMargin = 4 * vw;

      this.wrap.style.paddingLeft = `${this.sideMargin}px`;
      this.wrap.style.paddingRight = `${this.sideMargin}px`;
    }

    calculate() {
      const computedStyle = window.getComputedStyle(this.wrap);
      const gridGap = parseFloat(
        computedStyle.getPropertyValue("grid-gap") || "0"
      );

      this.gridGap = gridGap;
      this.wrapWidth =
        Array.from(this.items).reduce(
          (acc, item) => acc + item.offsetWidth,
          0
        ) +
        this.gridGap * (this.items.length - 1) +
        this.sideMargin * 2;

      this.containerWidth = this.el.clientWidth;

      const lastItem = this.items[this.items.length - 1];
      const lastItemRight =
        lastItem.offsetLeft + lastItem.offsetWidth + this.sideMargin;

      this.maxScroll = lastItemRight - this.el.clientWidth;
      this.progress = Math.min(this.progress, this.maxScroll);
    }

    handleStart(e) {
      this.isDragging = false;
      this.isMouseDown = true;
      this.isHorizontalDrag = false;
      this.startX = e.clientX || e.touches[0].clientX;
      this.startY = e.clientY || e.touches[0].clientY;
      this.startTime = Date.now();
    }

    handleMove(e) {
      if (!this.isMouseDown) return;

      const currentX = e.clientX || e.touches[0].clientX;
      const currentY = e.clientY || e.touches[0].clientY;

      const deltaX = currentX - this.startX;
      const deltaY = currentY - this.startY;

      if (!this.isHorizontalDrag) {
        if (
          Math.abs(deltaX) > Math.abs(deltaY) &&
          Math.abs(deltaX) > this.dragThreshold
        ) {
          this.isHorizontalDrag = true;
        } else {
          return; // Prevent vertical drag
        }
      }

      if (this.isHorizontalDrag) {
        e.preventDefault();
        this.isDragging = true;
        this.progress += -deltaX * 2.5;
        this.startX = currentX;
        this.move();
      }
    }

    handleEnd() {
      this.isMouseDown = false;
      this.isDragging = false;
    }

    handleWheel(e) {
      const rect = this.el.getBoundingClientRect();
      const expandedViewportTop = -window.innerWidth * 0.5; // 50vw above
      const expandedViewportBottom =
        window.innerHeight + window.innerWidth * 0.5; // 50vw below

      const isInExpandedViewport =
        rect.top >= expandedViewportTop &&
        rect.bottom <= expandedViewportBottom;

      if (!isInExpandedViewport) return; // Block mousewheel if the slider is outside the expanded viewport

      e.preventDefault();

      const delta = e.deltaY * 4; // Adjust scroll sensitivity here
      const newProgress = Math.max(
        0,
        Math.min(this.progress + delta, this.maxScroll)
      ); // Keep within bounds

      // Animate the progress using GSAP
      gsap.to(this, {
        progress: newProgress,
        duration: 0.5, // Duration of the easing
        ease: "expo.out", // Easing type
        onUpdate: () => this.move(), // Update the position during the animation
      });
    }

    move() {
      // Update the wrap's transform based on the current progress
      this.wrap.style.transform = `translateX(${-this.progress}px)`;
    }

    move() {
      this.progress = Math.max(0, Math.min(this.progress, this.maxScroll));
      this.wrap.style.transform = `translateX(${-this.progress}px)`;
    }

    resetToStart() {
      this.progress = 0;
      this.move();
    }

    preventDragOnLinks(e) {
      if (e.target.tagName === "A") {
        e.preventDefault();
      }
    }

    raf() {
      this.x += (this.progress - this.x) * 0.1;
      this.wrap.style.transform = `translateX(${-this.x}px)`;
      requestAnimationFrame(this.raf.bind(this));
    }
  }

  // Initialize all sliders and store instances
  const sliders = [];
  document.querySelectorAll(".slider").forEach((sliderElement) => {
    sliders.push(
      new DragScroll(sliderElement, ".slider-wrapper", ".slider-item")
    );
  });

  // Add reset functionality for filters
  document
    .querySelectorAll(".category-filters .w-form-label")
    .forEach((label) => {
      label.addEventListener("click", () => {
        sliders.forEach((slider) => {
          slider.resetToStart();
        });
      });
    });
}

/* ==============================================
Grid to Slider Toggle
============================================== */
function initGridToSlider() {
  // Don't initialize on mobile
  if (window.innerWidth <= 500) return;

  const grid = document.querySelector(".grid-slider-gallery");
  const toggleBtn = document.querySelector(".toggle-btn");
  const filters = document.querySelector(".works-filters");
  if (!grid || !toggleBtn || !filters) return;
  let isGrid = true;
  const pxToVw = (px) => (px / window.innerWidth) * 100;
  toggleBtn.addEventListener("click", () => {
    const items = document.querySelectorAll(".image-container");
    const itemPositions = [];
    items.forEach((item) => {
      const rect = item.getBoundingClientRect();
      itemPositions.push({ x: rect.left, y: rect.top });
    });
    if (isGrid) {
      grid.style.position = "fixed";
      grid.style.top = "0";
      grid.style.right = "20";
      grid.style.width = "auto";
      grid.style.gridTemplateColumns = "1fr";
      grid.id = "slider-mode";
      toggleBtn.textContent = "Display Grid";
      gsap.to(filters, {
        left: "-40vw",
        bottom: "-35vh",
        duration: 0.9,
        ease: "expo.inOut",
      });
    } else {
      grid.style.position = "relative";
      grid.style.gridTemplateColumns = "repeat(2, 1fr)";
      grid.removeAttribute("id");
      toggleBtn.textContent = "Display Slider";
      gsap.to(filters, {
        left: "0vw",
        bottom: "0vw",
        duration: 0.9,
        ease: "expo.inOut",
      });
    }
    items.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const deltaX = pxToVw(itemPositions[index].x - rect.left);
      const deltaY = pxToVw(itemPositions[index].y - rect.top);
      gsap.fromTo(
        item,
        { x: `${deltaX}vw`, y: `${deltaY}vw` },
        { x: "0vw", y: "0vw", duration: 0.9, ease: "expo.inOut" }
      );
    });
    isGrid = !isGrid;
  });
}

/* ==============================================
Vertical Smooth Scroll for Grid/Slider
============================================== */

function initVerticalSmoothScroll() {
  const grid = document.querySelector(".grid-slider-gallery");
  if (!grid) return;
  let scrollY = 0;
  let smoothScrollY = 0;
  let isDragging = false;
  let startY = 0;
  const updateHeight = () => {
    const gridHeight = grid.scrollHeight;
    const containerHeight =
      grid.id === "slider-mode" ? window.innerHeight : grid.clientHeight;
    return gridHeight - containerHeight;
  };
  const animate = () => {
    const maxScroll = updateHeight();
    scrollY = Math.min(Math.max(scrollY, 0), maxScroll);
    smoothScrollY += (scrollY - smoothScrollY) * 0.1;
    grid.style.transform = `translateY(${-smoothScrollY}px)`;
    requestAnimationFrame(animate);
  };
  const startDrag = (event) => {
    isDragging = true;
    startY = event.clientY || event.touches[0].clientY;
  };
  const drag = (event) => {
    if (!isDragging) return;
    const currentY = event.clientY || event.touches[0].clientY;
    const delta = startY - currentY;
    startY = currentY;
    scrollY += delta * 1.5;
  };
  const endDrag = () => {
    isDragging = false;
  };
  const handleWheel = (event) => {
    event.preventDefault();
    scrollY += event.deltaY * 1.5;
  };
  const handlePageWheel = (event) => {
    if (grid.style.position === "fixed") {
      event.preventDefault();
      scrollY += event.deltaY * 1.5;
    }
  };
  grid.addEventListener("mousedown", startDrag);
  grid.addEventListener("touchstart", startDrag);
  window.addEventListener("mousemove", drag);
  window.addEventListener("touchmove", drag);
  window.addEventListener("mouseup", endDrag);
  window.addEventListener("touchend", endDrag);
  window.addEventListener("wheel", handleWheel, { passive: false });
  window.addEventListener("wheel", handlePageWheel, { passive: false });
  grid.style.position = "relative";
  grid.style.overflow = "visible";
  animate();
}

/* ==============================================
Tab Filter Initialization
============================================== */
function initTabFilter() {
  let allCases = document.querySelector(".all-cases-radio");
  let targetContainer = document.querySelector(".works-filters .all-tags");
  if (allCases && targetContainer) {
    targetContainer.prepend(allCases);
  }
}

/* ==============================================
Refresh Webflow Components and FinSweet CMS
============================================== */
function refreshWebflowComponents() {
  setTimeout(() => {
    if (window.Webflow) {
      try {
        Webflow.destroy();
        Webflow.ready();
      } catch (error) {}
    }
    if (window.fsAttributes && window.fsAttributes.cmsfilter) {
      window.fsAttributes.cmsfilter.forEach((instance) => {
        if (instance.listInstance) {
          instance.listInstance.update();
        }
      });
    } else {
      window.fsAttributes = window.fsAttributes || [];
      window.fsAttributes.push([
        "cmsfilter",
        (instances) => {
          instances.forEach((instance) => {
            instance.listInstance.update();
          });
        },
      ]);
    }
    document.dispatchEvent(new Event("readystatechange"));
  }, 300);
}

/* ==============================================
Mobile Menu Initialization
============================================== */

function initMobileMenu() {
  console.log("Initializing mobile menu...");

  if (window.innerWidth >= 500) return; // Only initialize on screens under 500px

  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  const pageWrapper = document.querySelector(".page-wrapper");
  const menuLinks = document.querySelectorAll(".mobile-menu-container");
  const menuOverlay = document.querySelector(".mega-menu-overlay");
  const menuBars = menuToggle ? menuToggle.querySelectorAll(".menu-bar") : [];

  // Ensure elements exist
  if (!menuToggle || !mobileMenu || menuBars.length < 2) {
    console.log("Missing menu elements. Aborting initialization.");
    return;
  }

  console.log("Found menu elements. Proceeding with initialization...");

  // Reset menu state visually
  mobileMenu.classList.remove("open");
  menuToggle.classList.remove("active", "clicked");
  gsap.set(mobileMenu, { display: "none" });
  gsap.set(pageWrapper, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 });

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Create GSAP timeline (paused initially)
  const menuTimeline = gsap.timeline({ paused: true });

  menuTimeline
    .set(mobileMenu, { display: "flex" }) // Ensure it's visible before animating
    .set(menuLinks, { opacity: 0, y: -500, x: 1800, scale: 8, rotate: 20 })
    .fromTo(
      mobileMenu,
      { clipPath: "inset(0% 0% 0% 100%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "expo.inOut" }
    )
    .to(menuOverlay, { opacity: 0.5 }, "-=1")
    .to(
      pageWrapper,
      {
        opacity: 0.3,
        x: -(viewportWidth * 0.3), // Adjust based on viewport width
        y: -(viewportHeight * 0.55), // Adjust based on viewport height
        scale: 2.5, // Scale based on the viewport size
        rotate: -5,
        duration: 1,
        ease: "expo.inOut",
      },
      "-=1"
    )
    .to(
      menuLinks,
      {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotate: 0,
        duration: 1,
        ease: "expo.inOut",
      },
      "-=1"
    );

  function toggleMenu() {
    const isOpen = mobileMenu.classList.contains("open");

    console.log(isOpen ? "Closing mobile menu..." : "Opening mobile menu...");

    menuToggle.classList.toggle("active", !isOpen);
    menuToggle.classList.toggle("clicked", !isOpen);

    if (!isOpen) {
      mobileMenu.classList.add("open");
      menuTimeline.timeScale(1).play(); // Open animation

      // Animate menu bars on open
      gsap.to(menuBars[0], { y: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(menuBars[1], {
        y: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      closeMenu(); // Close menu
    }
  }

  function closeMenu() {
    console.log("Closing menu...");

    menuTimeline
      .timeScale(1.2)
      .reverse()
      .eventCallback("onReverseComplete", () => {
        // Reset menu state
        mobileMenu.classList.remove("open");
        menuToggle.classList.remove("active", "clicked");
        gsap.set(mobileMenu, { display: "none" });

        // Fully revert pageWrapper back to normal
        gsap.set(pageWrapper, { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 });

        gsap.to(menuOverlay, { opacity: 0 }, "-=1");

        // Animate menu bars on close
        gsap.to(menuBars[0], {
          y: "-1.2vw",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(menuBars[1], {
          y: "1.2vw",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
  }

  // Ensure reset on link click
  menuLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Re-add event listeners on page load
  menuToggle.addEventListener("click", toggleMenu);

  // Re-enable the toggle functionality after any scroll (ensures it doesn't stop working)
  window.addEventListener("scroll", () => {
    // Ensuring menu toggle still works after scrolling
    if (!menuToggle.hasEventListener("click")) {
      menuToggle.addEventListener("click", toggleMenu);
    }
  });

  // Reset mobile menu after page transition
  document.addEventListener("pageTransitionComplete", () => {
    console.log("Page transition complete. Reinitializing mobile menu.");
    resetMobileMenu(); // Reinitialize mobile menu after transition
  });
}

// Ensure the mobile menu is initialized when the page loads or after page transition
function resetMobileMenu() {
  if (window.innerWidth < 500) {
    initMobileMenu();
  }
}

// Initialize the mobile menu immediately on page load and after page transition
window.addEventListener("load", () => {
  resetMobileMenu();
});

// Ensure re-initialization happens after page transitions as well
window.addEventListener("popstate", () => {
  resetMobileMenu();
});

/* ==============================================
   Responsive Behavior on Screen Resize
============================================== */

let lastWidth = window.innerWidth;
window.addEventListener("resize", () => {
  const currentWidth = window.innerWidth;
  if (
    (lastWidth > 500 && currentWidth <= 500) ||
    (lastWidth <= 500 && currentWidth > 500)
  ) {
    window.location.reload();
  }
  lastWidth = currentWidth;
});

function initVideos() {
  function convertDropboxLink(url) {
    return url
      .replace("www.dropbox.com", "dl.dropboxusercontent.com")
      .replace("dropbox.com", "dl.dropboxusercontent.com")
      .replace(/(\?dl=0|&dl=0)/g, "");
  }

  function updateVideoSources() {
    document.querySelectorAll("video source.video-src").forEach((source) => {
      const directLink = convertDropboxLink(source.src);
      source.src = directLink;
      const video = source.parentElement;
      if (video && typeof video.load === "function") {
        video.load();
      }
    });
  }

  updateVideoSources();
}

/*

function initVideos() {

  function convertDropboxLink(url) {
      return url.replace("www.dropbox.com", "dl.dropboxusercontent.com")
                .replace(/(\?dl=0|&dl=0)/g, ""); // Remove unnecessary parameters
  }

  function updateVideoSources() {
      document.querySelectorAll("#project-videos video source.video-src").forEach(source => {
          let directLink = convertDropboxLink(source.src);
          source.src = directLink;
          source.parentElement.load(); // Reload the video element
      });
  }

  // Automatically update all Dropbox video links
  updateVideoSources();

}

*/

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    let projectList = document.querySelectorAll(
      "#next-project-list .next-project-link"
    );

    if (projectList.length > 1) {
      let randomIndex = Math.floor(Math.random() * projectList.length);

      projectList.forEach((project, index) => {
        if (index !== randomIndex) {
          project.style.display = "none";
        }
      });
    }
  }, 300); // Delay to ensure elements are loaded
});

function initMouseWheelEffects() {
  if (window.innerWidth <= 500) return;

  const selector = ".image";
  const options = {
    threshold: 100,
    friction: 0.91,
    scaleFactor: 0.004,
    maxScale: 0.5,
    moveFactor: 0.2,
    maxMove: 40,
    velocityMultiplier: 0.05,
  };

  let lastY = 0;
  let velocity = 0;
  let isScrolling = false;
  let touchStartTime = 0;
  let frameId = null;

  function updateEffect() {
    if (!isScrolling) return;

    velocity *= options.friction;

    if (Math.abs(velocity) < 0.1) {
      isScrolling = false;
      velocity = 0;
      cancelAnimationFrame(frameId);
      return;
    }

    let scaleFactor =
      1 - Math.min(Math.abs(velocity) * options.scaleFactor, options.maxScale);
    let horizontalMove =
      Math.min(Math.abs(velocity) * options.moveFactor, options.maxMove) *
      (velocity > 0 ? 1 : -1);

    gsap.to(selector, {
      scale: scaleFactor,
      x: horizontalMove,
      duration: 1,
      ease: "power3.out",
    });

    frameId = requestAnimationFrame(updateEffect);
  }

  function handleWheelScroll(delta) {
    velocity += delta * options.velocityMultiplier;
    if (!isScrolling) {
      isScrolling = true;
      frameId = requestAnimationFrame(updateEffect);
    }
  }

  function handleTouchMove(e) {
    const currentY = e.touches[0].clientY;
    const deltaTime = Date.now() - touchStartTime;
    touchStartTime = Date.now();

    const delta = currentY - lastY;
    lastY = currentY;
    velocity += (delta / deltaTime) * options.velocityMultiplier * 10;

    if (!isScrolling) {
      isScrolling = true;
      frameId = requestAnimationFrame(updateEffect);
    }

    e.preventDefault();
  }

  function handleTouchStart(e) {
    lastY = e.touches[0].clientY;
    touchStartTime = Date.now();
    velocity = 0;
  }

  function handleTouchEnd() {}

  window.addEventListener("wheel", (e) => handleWheelScroll(e.deltaY), {
    passive: true,
  });
  window.addEventListener("touchstart", handleTouchStart, { passive: false });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd);
}

function initVideoFeature() {
  if (window.location.href.includes("/work")) return;

  const homeContainer = document.querySelector(".home");
  if (!homeContainer) return;

  const videoElement = homeContainer.querySelector("#video");
  const pageOverlay = homeContainer.querySelector(".page-overlay-video");
  const playReel = homeContainer.querySelector(".play-reel");
  const unmuteText = homeContainer.querySelector(".unmute-text");
  const isMobile = window.innerWidth < 500;

  let isExpanded = false;

  gsap.set(videoElement, { volume: 0 });
  videoElement.muted = true;

  if (unmuteText) {
    unmuteText.style.display = "none";
    unmuteText.addEventListener("click", (e) => {
      e.stopPropagation();
      videoElement.muted = false;
      gsap.to(videoElement, { volume: 1, duration: 1.2, ease: "power2.inOut" });
      gsap.to(unmuteText, {
        opacity: 0,
        duration: 0.5,
        ease: "expo.out",
        onComplete: () => (unmuteText.style.display = "none"),
      });
    });
  }

  function toggleVideo() {
    if (videoElement.paused) {
      videoElement.play();
    }

    if (!isExpanded) {
      gsap
        .timeline()
        .to(
          videoElement,
          {
            width: isMobile ? "84vw" : "92.361vw",
            height: isMobile ? "100dvh" : "100dvh",
            paddingTop: isMobile ? "17vw" : "7.8vw",
            duration: 1.4,
            ease: "expo.inOut",
          },
          0
        )
        .to(
          pageOverlay,
          {
            opacity: 1,
            duration: 1.4,
            ease: "expo.inOut",
            onStart: () => (pageOverlay.style.pointerEvents = "auto"),
          },
          0
        )
        .to(playReel, { opacity: 0, duration: 1.4, ease: "expo.inOut" }, 0)
        .to(
          videoElement,
          {
            volume: isMobile ? 0 : 1,
            duration: 1.2,
            ease: "power2.inOut",
            onStart: () => {
              if (!isMobile) videoElement.muted = false;
            },
          },
          0.1
        )
        .to(
          ".header, .burger",
          { opacity: 0, duration: 1.4, ease: "expo.inOut" },
          0
        );

      if (isMobile && unmuteText) {
        unmuteText.style.display = "block";
        gsap.fromTo(
          unmuteText,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", delay: 0.5 }
        );
      }

      isExpanded = true;
    } else {
      gsap
        .timeline()
        .to(
          videoElement,
          {
            width: isMobile ? "38.133vw" : "20.2vw",
            height: isMobile ? "21.5vw" : "12vw",
            paddingTop: isMobile ? "0%" : "0%",
            duration: 1.6,
            ease: "expo.inOut",
          },
          0
        )
        .to(
          pageOverlay,
          {
            opacity: 0,
            duration: 1.6,
            ease: "expo.inOut",
            onStart: () => (pageOverlay.style.pointerEvents = "none"),
          },
          0
        )
        .to(playReel, { opacity: 1, duration: 1.6, ease: "expo.inOut" }, 0)
        .to(
          videoElement,
          {
            volume: 0,
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => (videoElement.muted = true),
          },
          0
        )
        .to(
          ".header, .burger",
          { opacity: 1, duration: 1.6, ease: "expo.inOut" },
          0
        );

      if (isMobile && unmuteText) {
        gsap.to(unmuteText, {
          opacity: 0,
          duration: 0.6,
          ease: "expo.inOut",
          onComplete: () => (unmuteText.style.display = "none"),
        });
      }

      isExpanded = false;
    }
  }

  videoElement.addEventListener("click", toggleVideo);

  if (isMobile) {
    videoElement.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }
}
