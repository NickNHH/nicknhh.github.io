const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isHidden = mainNav.classList.contains("hidden");
    mainNav.classList.toggle("hidden", !isHidden);
    mainNav.classList.toggle("flex", isHidden);
    menuToggle.setAttribute("aria-expanded", String(isHidden));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.add("hidden");
      mainNav.classList.remove("flex");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const countUp = (el) => {
  const target = Number(el.dataset.count || 0);
  const duration = 1400;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = String(Math.floor(progress * target));
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const setActiveLink = () => {
  let activeId = "";
  sections.forEach((section) => {
    const top = window.scrollY + 140;
    if (top >= section.offsetTop && top < section.offsetTop + section.offsetHeight) {
      activeId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href")?.replace("#", "");
    const isActive = href === activeId;
    link.classList.toggle("text-white", isActive);
    link.classList.toggle("bg-white/10", isActive);
    link.classList.toggle("text-slate-300", !isActive);
  });
};

window.addEventListener("scroll", setActiveLink);
window.addEventListener("load", setActiveLink);

const initProjectCarousel = () => {
  const viewport = document.getElementById("projectViewport");
  const track = document.getElementById("projectTrack");
  const nextButton = document.getElementById("nextProject");
  const prevButton = document.getElementById("prevProject");
  const dotsContainer = document.getElementById("projectDots");

  if (!viewport || !track || !nextButton || !prevButton || !dotsContainer) {
    return;
  }

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const visualTemplate = (project) => {
    const visual = project.visual || {};
    const image = escapeHtml(project.image);
    const imageAlt = escapeHtml(project.imageAlt || project.title);
    const accentColors = {
      cyan: "34 211 238",
      lime: "190 242 100",
      amber: "251 191 36",
      rose: "251 113 133"
    };
    const accent = accentColors[visual.accent] || accentColors.cyan;
    const label = escapeHtml(visual.label || "Interface");

    if (image) {
      return `
        <div class="project-visual project-image-visual" style="--accent: ${accent};">
          <img draggable="false" class="project-image" src="${image}" alt="${imageAlt}" />
          <div class="project-image-label" aria-hidden="true">${label}</div>
        </div>
      `;
    }

    return `
      <div class="project-visual" style="--accent: ${accent};" aria-hidden="true">
        <div class="visual-topline">
          <span>${label}</span>
        </div>
        <div class="visual-canvas">
          <span class="visual-node visual-node-a"></span>
          <span class="visual-node visual-node-b"></span>
          <span class="visual-node visual-node-c"></span>
          <span class="visual-rail visual-rail-a"></span>
          <span class="visual-rail visual-rail-b"></span>
          <span class="visual-rail visual-rail-c"></span>
        </div>
      </div>
    `;
  };

  const slideTemplate = (project) => {
    const tags = Array.isArray(project.stack) ? project.stack : [];
    const tagMarkup = tags.map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`).join("");
    const sourcePath = project.sourcePath
      ? `<p class="mt-4 truncate border-t border-stone-100/10 pt-3 text-xs text-stone-500" title="${escapeHtml(project.sourcePath)}">${escapeHtml(project.sourcePath)}</p>`
      : "";

    return `
      <article data-slide="true" class="px-2">
        <div class="project-card">
          ${visualTemplate(project)}
          <div class="p-5">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">${escapeHtml(project.kicker)}</p>
            <h3 class="mt-2 text-xl font-bold leading-tight">${escapeHtml(project.title)}</h3>
            <p class="mt-3 min-h-24 text-sm leading-6 text-stone-300">${escapeHtml(project.description)}</p>
            <p class="mt-4 text-sm text-stone-400"><span class="text-stone-200">Role:</span> ${escapeHtml(project.role)}</p>
            <div class="mt-4 flex flex-wrap gap-2">${tagMarkup}</div>
            ${sourcePath}
          </div>
        </div>
      </article>
    `;
  };

  const renderSlides = (projects) => {
    track.innerHTML = projects.map((project) => slideTemplate(project)).join("");
  };

  let originals = [];
  let dots = [];
  let slideWidth = 0;
  let visibleSlides = 1;
  let cloneCount = 1;
  let currentIndex = 1;
  let isTransitioning = false;
  let autoPlay = null;
  let pointerStartX = 0;
  let pointerCurrentX = 0;
  let pointerStartTime = 0;
  let dragOffsetX = 0;
  let didDrag = false;
  let suppressClickUntil = 0;
  let pointerActive = false;
  let pointerId = null;

  const getVisibleSlides = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const moveTo = (withTransition) => {
    track.style.transition = withTransition ? "transform 500ms ease" : "none";
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
  };

  const getActiveDotIndex = () => {
    if (!originals.length) return 0;
    return ((currentIndex - cloneCount) % originals.length + originals.length) % originals.length;
  };

  const updateDots = () => {
    const activeIndex = getActiveDotIndex();
    dots.forEach((dot, index) => {
      dot.classList.toggle("bg-cyan-300", index === activeIndex);
      dot.classList.toggle("w-6", index === activeIndex);
      dot.classList.toggle("bg-stone-500/60", index !== activeIndex);
      dot.classList.toggle("w-2", index !== activeIndex);
    });
  };

  const buildDots = () => {
    dotsContainer.innerHTML = "";
    dots = originals.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "h-2 w-2 bg-stone-500/60 transition-all duration-300";
      dot.setAttribute("aria-label", `Go to project ${index + 1}`);
      dot.addEventListener("click", () => {
        if (isTransitioning) return;
        currentIndex = cloneCount + index;
        moveTo(true);
        updateDots();
        restartAutoPlay();
      });
      dotsContainer.appendChild(dot);
      return dot;
    });
    updateDots();
  };

  const clearClones = () => {
    Array.from(track.querySelectorAll("[data-clone='true']")).forEach((clone) => clone.remove());
  };

  const setup = () => {
    clearClones();
    originals = Array.from(track.querySelectorAll("[data-slide='true']"));
    if (!originals.length) return;

    visibleSlides = getVisibleSlides();
    cloneCount = Math.min(visibleSlides, originals.length);

    const prependClones = originals.slice(-cloneCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.dataset.clone = "true";
      return clone;
    });

    const appendClones = originals.slice(0, cloneCount).map((slide) => {
      const clone = slide.cloneNode(true);
      clone.dataset.clone = "true";
      return clone;
    });

    prependClones.forEach((clone) => track.prepend(clone));
    appendClones.forEach((clone) => track.append(clone));

    const allSlides = Array.from(track.children);
    slideWidth = viewport.clientWidth / visibleSlides;
    allSlides.forEach((slide) => {
      slide.style.width = `${slideWidth}px`;
      slide.classList.add("shrink-0");
    });

    track.style.width = `${allSlides.length * slideWidth}px`;
    currentIndex = cloneCount;
    moveTo(false);
    buildDots();
  };

  const next = () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex += 1;
    moveTo(true);
  };

  const prev = () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex -= 1;
    moveTo(true);
  };

  const restartAutoPlay = () => {
    if (autoPlay) {
      clearInterval(autoPlay);
    }
    autoPlay = setInterval(next, 20000);
  };

  // Prevent native browser image/link dragging from hijacking swipe gestures.
  track.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  track.addEventListener(
    "click",
    (event) => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  track.addEventListener("transitionend", () => {
    const totalOriginals = originals.length;
    if (currentIndex >= totalOriginals + cloneCount) {
      currentIndex = cloneCount;
      moveTo(false);
    }
    if (currentIndex < cloneCount) {
      currentIndex = totalOriginals + cloneCount - 1;
      moveTo(false);
    }
    isTransitioning = false;
    updateDots();
  });

  nextButton.addEventListener("click", () => {
    next();
    restartAutoPlay();
  });

  prevButton.addEventListener("click", () => {
    prev();
    restartAutoPlay();
  });

  viewport.addEventListener("mouseenter", () => {
    if (autoPlay) clearInterval(autoPlay);
  });

  viewport.addEventListener("mouseleave", restartAutoPlay);

  // Swipe gesture support for mobile and trackpads with pointer events.
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    if (isTransitioning) {
      return;
    }

    pointerActive = true;
    pointerStartX = event.clientX;
    pointerCurrentX = event.clientX;
    pointerStartTime = performance.now();
    dragOffsetX = 0;
    didDrag = false;
    pointerId = event.pointerId;
    if (autoPlay) clearInterval(autoPlay);

    track.style.transition = "none";
    viewport.style.touchAction = "pan-y";
    viewport.style.userSelect = "none";
    viewport.classList.add("cursor-grabbing");
    event.preventDefault();
    viewport.setPointerCapture(pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!pointerActive || event.pointerId !== pointerId) {
      return;
    }

    pointerCurrentX = event.clientX;
    dragOffsetX = pointerCurrentX - pointerStartX;
    if (Math.abs(dragOffsetX) > 6) {
      didDrag = true;
    }

    const baseTranslate = -(currentIndex * slideWidth);
    track.style.transform = `translateX(${baseTranslate + dragOffsetX}px)`;
  });

  viewport.addEventListener("pointerup", (event) => {
    if (!pointerActive || event.pointerId !== pointerId) return;

    const delta = event.clientX - pointerStartX;
    const elapsed = performance.now() - pointerStartTime;
    const velocity = elapsed > 0 ? Math.abs(delta / elapsed) : 0;
    const distanceThreshold = Math.max(50, slideWidth * 0.18);
    const isFlick = velocity > 0.45 && Math.abs(delta) > 24;

    if (delta <= -distanceThreshold || (isFlick && delta < 0)) {
      next();
    } else if (delta >= distanceThreshold || (isFlick && delta > 0)) {
      prev();
    } else {
      moveTo(true);
    }

    if (didDrag) {
      suppressClickUntil = performance.now() + 220;
    }

    pointerActive = false;
    dragOffsetX = 0;
    didDrag = false;
    viewport.classList.remove("cursor-grabbing");
    restartAutoPlay();
    if (pointerId !== null && viewport.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }
    pointerId = null;
  });

  viewport.addEventListener("pointercancel", (event) => {
    if (pointerId !== null && event.pointerId !== pointerId) {
      return;
    }

    pointerActive = false;
    dragOffsetX = 0;
    didDrag = false;
    viewport.classList.remove("cursor-grabbing");
    moveTo(true);
    restartAutoPlay();
    if (pointerId !== null && viewport.hasPointerCapture(pointerId)) {
      viewport.releasePointerCapture(pointerId);
    }
    pointerId = null;
  });

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 200);
  });

  const start = async () => {
    try {
      const response = await fetch("projects.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to load projects.json (${response.status})`);
      }
      const projects = await response.json();
      if (!Array.isArray(projects) || !projects.length) {
        throw new Error("projects.json is empty or invalid");
      }
      renderSlides(projects);
      setup();
      restartAutoPlay();
    } catch (error) {
      console.error(error);
      track.innerHTML = "<p class='px-4 py-8 text-slate-300'>Could not load projects yet. Please check projects.json.</p>";
    }
  };

  start();
};

initProjectCarousel();

document.getElementById("year").textContent = String(new Date().getFullYear());

