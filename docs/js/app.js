// -------- Data --------
const allAnnouncements = [
  { title: "New OSS Release", body: "We shipped v1.2 of Ledgernaut—now with faster sync.", href: "pages/open-source.html" },
  { title: "Bug Bash Friday", body: "Community triage session this Friday @ 2pm CT.", href: "pages/blog.html" },
  { title: "Security Update", body: "Important patch for OAuth proxy—review our notes.", href: "pages/blog.html" },
  { title: "Solutions", body: "Cloud-native platforms, data pipelines, and secure APIs built on proven OSS.", href: "pages/services.html" },
  { title: "Open Source", body: "We maintain libraries and contribute upstream. Sustainability matters.", href: "pages/open-source.html" },
  { title: "Work With Us", body: "Join a team that ships and shares. Remote-friendly, impact-driven.", href: "pages/careers.html" },
  { title: "Hiring Maintainers", body: "Paid part-time roles for OSS maintainers.", href: "pages/careers.html" },
  { title: "Client Spotlight", body: "Open standards integration for a fintech leader.", href: "pages/services.html" },
  { title: "RFP Window", body: "Seeking partners for healthcare data pipelines.", href: "pages/contact.html" },
  { title: "Sponsor Us", body: "Back our work to keep core libraries sustainable.", href: "pages/open-source.html" },
  { title: "Docs Refresh", body: "Improved developer guides & API examples.", href: "pages/blog.html" },
  { title: "Meetup", body: "Phoenix OSS meetup—cohosted with local devs.", href: "pages/blog.html" },
];

const highlightImages = [
  "img/highlights/engineer-4904884_640.jpg",
  "img/highlights/website-8305451_640.jpg",
  "img/highlights/engineer-4941172_640.jpg",
  "img/highlights/people-2557399_640.jpg",
  "img/highlights/hack-capital-uv5_bsypFUM-unsplash.jpg",
  "img/highlights/danial-igdery-FCHlYvR5gJI-unsplash.jpg",
  "img/highlights/kaleidico-3V8xo5Gbusk-unsplash.jpg",
  "img/highlights/mohammad-rahmani-q1p2DrLBtko-unsplash.jpg",
  "img/highlights/thisisengineering-t4qI2IDcL5s-unsplash.jpg",
];

// -------- Utils --------
const pickRandom = (source, n) => [...source].sort(() => Math.random() - 0.5).slice(0, n);

const renderCardContent = ann => `
  <h3 class="card-title">${ann.title}</h3>
  <p class="card-body">${ann.body}</p>
  ${ann.href ? `<a class="card-link" href="${ann.href}">Learn more →</a>` : ""}
`;

// -------- Layout Includes --------
async function inject(url, targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    target.innerHTML = await res.text();
  } catch {}
}

async function loadLayout() {
  const headerUrl = document.querySelector('#site-header')?.getAttribute('data-include') || 'partials/header.html';
  const footerUrl = document.querySelector('#site-footer')?.getAttribute('data-include') || 'partials/footer.html';
  await Promise.all([
    inject(headerUrl, '#site-header'),
    inject(footerUrl, '#site-footer'),
  ]);
}

// -------- Highlights --------
let highlightAnnouncements = pickRandom(allAnnouncements, 3);

const renderHighlights = () => {
  const images = pickRandom(highlightImages, 3);
  document.querySelectorAll("[data-highlight-slot]").forEach((slot, i) => {
    const img = images[i % images.length];
    slot.style.backgroundImage = `url(${img})`;
    slot.style.backgroundSize = "cover";
    slot.style.backgroundPosition = "center";
    slot.style.color = "#fff";
    if (highlightAnnouncements[i]) slot.innerHTML = renderCardContent(highlightAnnouncements[i]);
  });
};

setInterval(() => {
  highlightAnnouncements = pickRandom(allAnnouncements, 3);
  renderHighlights();
}, 30 * 60 * 1000);

// -------- Bottom Announcements --------
const rotateAnnouncementsGroup = (minMs = 4000, maxMs = 9000, slideMs = 500) => {
  const slots = document.querySelectorAll("[data-announcement-slot]");
  if (!slots.length) return;

  const pool = allAnnouncements.filter(a => !highlightAnnouncements.includes(a));
  if (!pool.length) return;

  const cursors = Array.from(slots, (_, i) => i % pool.length);

  slots.forEach((slot, i) => {
    slot.innerHTML = `<div class="card-content" style="transform:translateX(0);">${renderCardContent(pool[cursors[i]])}</div>`;
  });

  const randDelay = () => Math.floor(Math.random() * (maxMs - minMs)) + minMs;

  const flipOne = () => {
    const idx = Math.floor(Math.random() * slots.length);
    const slot = slots[idx];
    if (!slot) return;

    const oldContent = slot.querySelector(".card-content");
    cursors[idx] = (cursors[idx] + slots.length) % pool.length;

    const incoming = document.createElement("div");
    incoming.className = "card-content";
    incoming.style.transform = "translateX(-100%)";
    incoming.innerHTML = renderCardContent(pool[cursors[idx]]);
    slot.appendChild(incoming);

    void incoming.offsetWidth;
    incoming.style.transform = "translateX(0)";

    if (oldContent) {
      oldContent.classList.add("outgoing");
      oldContent.style.transform = "translateX(100%)";
      setTimeout(() => oldContent.remove(), slideMs);
    }

    setTimeout(flipOne, randDelay());
  };

  setTimeout(flipOne, randDelay());
};

// -------- Nav + Hamburger --------
let activeIndicator;

function initNav() {
  const header = document.querySelector('header');
  const nav = header?.querySelector('#primary-nav');
  if (!header || !nav) return;

  const btn = header.querySelector('.nav-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const open = header.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const href = a.getAttribute('href');
      if (!href) return;
      navigate(href);
    });
  });

  if (!activeIndicator) {
    activeIndicator = document.createElement('div');
    activeIndicator.className = 'nav-active-indicator';
    activeIndicator.style.position = 'absolute';
    activeIndicator.style.height = '3px';
    activeIndicator.style.background = 'var(--accent)';
    activeIndicator.style.bottom = '0';
    activeIndicator.style.transition = 'all 0.3s ease';
    nav.appendChild(activeIndicator);
  }

  updateActiveNav();
  window.addEventListener('resize', updateActiveNav);
}

function updateActiveNav() {
  const nav = document.querySelector('#primary-nav');
  if (!nav) return;

  // Normalize current path: always /<filename>.html or /
  let currentPath = location.pathname;
  if (currentPath === "/") currentPath = "/index.html";

  const links = nav.querySelectorAll('a');
  let active = null;

  links.forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    
    // Normalize href: ensure leading /
    const absHref = href.startsWith("/") ? href : "/" + href.replace(/^\/+/, "");

    a.classList.remove('active');
    if (absHref === currentPath) {
      a.classList.add('active');
      active = a;
    }
  });

  // Position indicator
  if (active && activeIndicator) {
    const rect = active.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    activeIndicator.style.width = rect.width + "px";
    activeIndicator.style.transform = `translateX(${rect.left - navRect.left}px)`;
  }
}
// -------- SPA Navigation & Redirects --------
const UNDER_CONSTRUCTION_PAGES = [
  "pages/services.html",
  "pages/blog.html",
  "pages/privacy.html",
  "pages/terms.html",
  "pages/open-source.html"
];

function normalizePath(p) {
  // Remove leading slash
  if (p.startsWith("/")) p = p.slice(1);

  // Collapse ../ or ./ in path
  const segments = p.split("/").filter(Boolean);
  const stack = [];
  for (const seg of segments) {
    if (seg === "..") stack.pop();
    else if (seg !== ".") stack.push(seg);
  }

  let normalized = stack.join("/");
  if (!normalized.endsWith(".html")) normalized += ".html";
  return normalized;
}

function maybeRedirect(norm) {
  if (UNDER_CONSTRUCTION_PAGES.includes(norm)) {
    const absPath = "/under-construction.html"; // ✅ always root-based
    location.replace(absPath);
    return true;
  }
  return false;
}

async function navigate(href) {
  const path = href.endsWith(".html") ? href : href + ".html";
  const norm = normalizePath(path);

  console.log(path);
  console.log(norm);

  if (maybeRedirect(norm)) return;

  if (norm === ".html" || norm === "index.html") {
    window.location.href = "/";
    return;
  }

  try {
    const absPath = "/" + norm.replace(/^\/+/, ""); // ✅ ensure absolute

    const res = await fetch(absPath, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${absPath}`);

    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const main = document.querySelector("main");
    if (main) main.innerHTML = doc.querySelector("main")?.innerHTML || "";

    history.pushState({}, "", absPath); // ✅ always absolute
    updateActiveNav();
  } catch (e) {
    console.error("Navigation error:", e);
  }
}

window.addEventListener("popstate", () => {
  navigate(location.pathname.replace(/^\//, ""));
});

 
// -------- Boot --------
document.addEventListener('DOMContentLoaded', async () => {
  await loadLayout();
  initNav();
  renderHighlights();
  rotateAnnouncementsGroup();
  updateActiveNav();
});
