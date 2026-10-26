(() => {
  "use strict";

  // A mesma chave de tema utilizada pela referência One to One.
  const root = document.documentElement;
  const themeButton = document.getElementById("themeToggle");
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem("theme");
  } catch {
    // O tema continua funcionando quando o armazenamento está bloqueado.
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (!themeButton) return;

    const label = theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";
    themeButton.setAttribute("aria-label", label);
    themeButton.setAttribute("title", label);
  }

  applyTheme(savedTheme === "light" ? "light" : "dark");

  if (themeButton) {
    themeButton.hidden = false;

    themeButton.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);

      try {
        localStorage.setItem("theme", nextTheme);
      } catch {
        // A preferência é aplicada mesmo quando não pode ser salva.
      }
    });
  }

  // FAQ: botões nativos já oferecem ativação por Enter e Espaço.
  const faq = document.querySelector("[data-faq]");

  if (faq) {
    const items = Array.from(faq.querySelectorAll(".faq-question"))
      .map((button) => {
        const panelId = button.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        return { button, panel };
      })
      .filter((item) => item.panel && faq.contains(item.panel));

    function setExpanded(item, expanded) {
      item.button.setAttribute("aria-expanded", String(expanded));
      item.panel.hidden = !expanded;
    }

    items.forEach((item, index) => {
      setExpanded(item, index === 0);

      item.button.addEventListener("click", () => {
        const shouldOpen = item.button.getAttribute("aria-expanded") !== "true";

        items.forEach((other) => {
          setExpanded(other, other === item && shouldOpen);
        });
      });
    });
  }

  // Menu móvel: fecha por link, clique externo e tecla Escape.
  const menuButton = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");

  if (menuButton && nav) {
    const mobile = window.matchMedia("(max-width: 1040px)");

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }

    menuButton.hidden = false;
    setMenu(false);

    menuButton.addEventListener("click", () => {
      const shouldOpen = menuButton.getAttribute("aria-expanded") !== "true";
      setMenu(shouldOpen);

      if (shouldOpen) {
        const firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        const focusInMenu = nav.contains(document.activeElement);
        setMenu(false);
        if (focusInMenu) menuButton.focus();
      }
    });

    function handleBreakpoint() {
      const focused = document.activeElement;
      setMenu(false);

      if (mobile.matches && nav.contains(focused)) {
        menuButton.focus();
      } else if (!mobile.matches && focused === menuButton) {
        const activeLink = nav.querySelector('[aria-current="page"]');
        if (activeLink) activeLink.focus();
      }
    }

    if (typeof mobile.addEventListener === "function") {
      mobile.addEventListener("change", handleBreakpoint);
    } else if (typeof mobile.addListener === "function") {
      mobile.addListener(handleBreakpoint);
    }
  }
})();