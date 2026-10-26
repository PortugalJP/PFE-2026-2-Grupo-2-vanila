// 1. Theme (light / dark)
// ----------------------------------------------------------
const THEME_KEY = "theme";
const THEME_ICONS = {
  sun: `<circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />`,
  moon: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />`,
};
function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}
 
function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
  }
}
function getInitialTheme() {
  const saved = getSavedTheme();
  if (saved === "light" || saved === "dark") return saved;
 
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}
 
function applyTheme(theme) {
  const isDark = theme === "dark";
 
  // The CSS reads this attribute: :root[data-theme="dark"] { ... }
  document.documentElement.setAttribute("data-theme", theme);
 
  const themeToggle = document.querySelector("#themeToggle");
  if (!themeToggle) return;
 
  themeToggle.setAttribute("aria-pressed", String(isDark));
  const icon = themeToggle.querySelector("svg");
  if (icon) icon.innerHTML = isDark ? THEME_ICONS.sun : THEME_ICONS.moon;
}
 
function initTheme() {
  // Applied even if the page has no toggle button, so the theme is global
  applyTheme(getInitialTheme());
 
  const themeToggle = document.querySelector("#themeToggle");
  if (!themeToggle) return;
 
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    saveTheme(next);
  });
}
 
// ----------------------------------------------------------
// 2. Hamburger menu (mobile only)
// ----------------------------------------------------------
function initMenu() {
  const menuBtn = document.querySelector("#menuBtn");
  const nav = document.querySelector("#nav");
  if (!menuBtn || !nav) return;
 
  function setMenu(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  }
 
  // Click on the hamburger: open if closed, close if open
  menuBtn.addEventListener("click", () => {
    const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });
 
  // Close after choosing a link (one listener for all links)
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
 
  // Close with the Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });
 
  // Reset when the window grows to desktop size (where the menu is always visible)
  const desktop = window.matchMedia("(min-width: 980px)");
  desktop.addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });
}
 
// ----------------------------------------------------------
// Start everything
// ----------------------------------------------------------
initTheme();
initMenu();
 