const escapeHtml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const requestedLanguage = new URLSearchParams(location.search).get("lang");
let language = requestedLanguage === "de" || requestedLanguage === "en" ? requestedLanguage : (localStorage.getItem("portfolio-language") || "en");
let projects = [];

const copy = {
  en: {
    description:"Portfolio of Nico Tuscano, UX/UI designer and frontend developer.", title:"Nico Tuscano · UX/UI & Frontend", skipLink:"Skip to content", brandLabel:"Nico Tuscano, back to top", menuOpen:"Open navigation", menuClose:"Close navigation", navLabel:"Main navigation", navWork:"Work", navProfile:"Profile", navContact:"Contact",
    heroEyebrow:"UX/UI design · Frontend development", heroTitle:"Interfaces for complex workflows.", heroText:"I work on the analysis, design, testing, and implementation of user interfaces. My projects range from medical control software to web applications and administrative tools.", workCta:"View all projects", baCta:"Bachelor thesis case study",
    statsLabel:"Portfolio statistics", statsTitle:"Portfolio overview", highlightedProjects:"Highlighted projects", yearsExperience:"Years learning & building", frameworksUsed:"Frameworks used", workEyebrow:"Selected projects", workTitle:"Projects and case studies", workIntro:"One complete UX case study and three selected implementation projects.", loadingProjects:"Loading projects…", profileEyebrow:"Profile", profileTitle:"UX/UI and frontend development", profileText:"I am particularly interested in projects where a user interface has to make a complex process understandable. I work from requirements and prototypes through usability tests to implementation.", contactTitle:"Contact", contactText:"You can contact me by email or find my projects on GitHub.", emailLink:"Email", githubLink:"GitHub", footerText:"UX/UI and frontend development.", challenge:"Challenge", role:"Role", outcome:"Outcome", readCase:"Read case study", viewOverview:"View project overview", projectLabel:"View project details", loadError:"Projects could not be loaded. Please try again later."
  },
  de: {
    description:"Portfolio von Nico Tuscano, UX/UI Designer und Frontend Developer.", title:"Nico Tuscano · UX/UI & Frontend", skipLink:"Zum Inhalt springen", brandLabel:"Nico Tuscano, zurück zum Seitenanfang", menuOpen:"Navigation öffnen", menuClose:"Navigation schliessen", navLabel:"Hauptnavigation", navWork:"Projekte", navProfile:"Profil", navContact:"Kontakt",
    heroEyebrow:"UX/UI Design · Frontend Development", heroTitle:"Interfaces für komplexe Abläufe.", heroText:"Ich beschäftige mich mit der Analyse, Gestaltung, Evaluation und Implementation von Benutzeroberflächen. Meine Projekte reichen von medizinischer Steuerungssoftware bis zu Webapplikationen und Administrationsoberflächen.", workCta:"Alle Projekte ansehen", baCta:"Case Study zur Bachelorarbeit",
    statsLabel:"Portfolio-Statistiken", statsTitle:"Portfolio-Übersicht", highlightedProjects:"Hervorgehobene Projekte", yearsExperience:"Jahre Lernen & Entwickeln", frameworksUsed:"Verwendete Frameworks", workEyebrow:"Ausgewählte Projekte", workTitle:"Projekte und Case Studies", workIntro:"Eine vollständige UX Case Study und drei ausgewählte Implementationsprojekte.", loadingProjects:"Projekte werden geladen…", profileEyebrow:"Profil", profileTitle:"UX/UI und Frontend-Entwicklung", profileText:"Mich interessieren besonders Projekte, bei denen eine Benutzeroberfläche einen komplexen Ablauf verständlich machen muss. Dabei arbeite ich von den Anforderungen und Prototypen über Usability-Tests bis zur Implementation.", contactTitle:"Kontakt", contactText:"Du kannst mich per E-Mail kontaktieren oder meine Projekte auf GitHub ansehen.", emailLink:"E-Mail", githubLink:"GitHub", footerText:"UX/UI und Frontend-Entwicklung.", challenge:"Aufgabe", role:"Rolle", outcome:"Ergebnis", readCase:"Case Study lesen", viewOverview:"Projektübersicht ansehen", projectLabel:"Projektdetails ansehen", loadError:"Die Projekte konnten nicht geladen werden. Bitte versuche es später erneut."
  }
};

const localize = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? (value[language] || value.en || value.de) : value;
const textIds = ["skipLink","navWork","navProfile","navContact","heroEyebrow","heroTitle","heroText","workCta","baCta","statsTitle","highlightedProjects","yearsExperience","frameworksUsed","workEyebrow","workTitle","workIntro","loadingProjects","profileEyebrow","profileTitle","profileText","contactTitle","contactText","emailLink","githubLink","footerText"];
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

const projectUrl = (project) => `${project.detailUrl}&lang=${language}`;
function projectCard(project, index) {
  const t = copy[language];
  const title = localize(project.title);
  const tags = project.stack.map((tag) => `<span class="project-tag">${escapeHtml(tag)}</span>`).join("");
  const featured = index === 0;
  const leadClass = featured ? " work-card-featured md:col-span-2 lg:grid-cols-[1.15fr_0.85fr]" : " work-card-secondary";
  return `<article class="work-card${leadClass}"><a class="work-image-wrap" href="${projectUrl(project)}" aria-label="${escapeHtml(`${t.projectLabel}: ${title}`)}"><img class="work-image" src="${escapeHtml(project.image)}" alt="${escapeHtml(localize(project.imageAlt))}" /><span class="work-status${featured ? " work-status-published" : ""}">${escapeHtml(localize(project.visual.label))}</span></a><div class="work-copy"><p class="eyebrow">${escapeHtml(localize(project.kicker))}</p><h3 class="mt-3 text-2xl font-extrabold sm:text-3xl">${escapeHtml(title)}</h3><dl class="project-summary"><div><dt>${t.role}</dt><dd>${escapeHtml(localize(project.role))}</dd></div><div><dt>${t.challenge}</dt><dd>${escapeHtml(localize(project.problem))}</dd></div><div><dt>${t.outcome}</dt><dd>${escapeHtml(localize(project.outcome))}</dd></div></dl><div class="mt-5 flex flex-wrap gap-2">${tags}</div><a class="case-link" href="${projectUrl(project)}">${project.status === "published" ? t.readCase : t.viewOverview}<span aria-hidden="true">→</span></a></div></article>`;
}

function renderProjects() {
  if (projects.length) document.getElementById("projectGrid").innerHTML = projects.map(projectCard).join("");
}

function applyLanguage(nextLanguage, updateHistory = false) {
  language = nextLanguage;
  const t = copy[language];
  document.documentElement.lang = language;
  document.title = t.title;
  document.querySelector('meta[name="description"]').content = t.description;
  textIds.forEach((id) => { const element = document.getElementById(id); if (element && t[id]) element.textContent = t[id]; });
  document.getElementById("brandLink").setAttribute("aria-label", t.brandLabel);
  menuToggle.setAttribute("aria-label", menuToggle.getAttribute("aria-expanded") === "true" ? t.menuClose : t.menuOpen);
  mainNav.setAttribute("aria-label", t.navLabel);
  document.getElementById("statsPanel").setAttribute("aria-label", t.statsLabel);
  document.getElementById("baCta").href = `project.html?project=ba-srt-laser-gui&lang=${language}`;
  document.querySelectorAll("[data-language]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.language === language)));
  if (updateHistory) {
    localStorage.setItem("portfolio-language", language);
    const url = new URL(location.href);
    url.searchParams.set("lang", language);
    history.replaceState(null, "", url);
  }
  renderProjects();
}

document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.language, true)));

function setMenu(open, returnFocus = false) {
  mainNav.classList.toggle("hidden", !open);
  mainNav.classList.toggle("flex", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? copy[language].menuClose : copy[language].menuOpen);
  if (!open && returnFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => setMenu(mainNav.classList.contains("hidden")));
mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") setMenu(false, true); });
document.addEventListener("pointerdown", (event) => { if (menuToggle.getAttribute("aria-expanded") === "true" && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false); });

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("reveal-visible"); observer.unobserve(entry.target); } }), {threshold:0.08});
  revealItems.forEach((item) => { item.classList.add("reveal-ready"); observer.observe(item); });
}

const sections = [...document.querySelectorAll("main > section[id]")];
const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }), {rootMargin:"-25% 0px -65%", threshold:0});
  sections.forEach((section) => sectionObserver.observe(section));
}

async function loadProjects() {
  try {
    const response = await fetch("projects.json", {cache:"no-store"});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    projects = await response.json();
    renderProjects();
  } catch (error) {
    console.error("Could not load projects", error);
    document.getElementById("projectGrid").innerHTML = `<p class="error-panel">${copy[language].loadError}</p>`;
  }
}

applyLanguage(language);
loadProjects();
document.getElementById("year").textContent = String(new Date().getFullYear());
