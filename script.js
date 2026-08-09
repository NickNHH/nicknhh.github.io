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

  const slideTemplate = (project) => `
    <article data-slide="true" class="px-2">
      <div class="h-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/75">
        <img draggable="false" class="h-44 w-full object-cover" src="${project.image}" alt="${project.imageAlt || project.title}" />
        <div class="p-5">
          <h3 class="text-xl font-semibold">${project.title}</h3>
          <p class="mt-2 text-sm text-slate-300">${project.description}</p>
          <a draggable="false" href="${project.link}" class="mt-4 inline-block text-sm font-semibold text-blue-300 hover:text-blue-200">Live Demo -></a>
        </div>
      </div>
    </article>
  `;

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
      dot.classList.toggle("bg-blue-300", index === activeIndex);
      dot.classList.toggle("w-6", index === activeIndex);
      dot.classList.toggle("bg-slate-500/60", index !== activeIndex);
      dot.classList.toggle("w-2.5", index !== activeIndex);
    });
  };

  const buildDots = () => {
    dotsContainer.innerHTML = "";
    dots = originals.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "h-2.5 w-2.5 rounded-full bg-slate-500/60 transition-all duration-300";
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
    autoPlay = setInterval(next, 4200);
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

