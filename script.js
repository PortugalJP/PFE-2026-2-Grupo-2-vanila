/* JS GERAL */
const button = document.getElementById("menuBtn");
const menu = document.getElementById("nav");

if (button && menu) {
  function closeMenu() {
    menu.classList.remove("activated");
    button.setAttribute("aria-expanded", false);
  }

  function toggleMenu() {
    const isOpen = menu.classList.toggle("activated");
    button.setAttribute("aria-expanded", isOpen);
  }

  button.addEventListener("click", toggleMenu);

  // fecha ao clicar fora
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !button.contains(e.target)) {
      closeMenu();
    }
  });

  // fecha com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  });
}


/* JS DA INDEX  */
const perguntas = document.querySelectorAll(".faq-question");

perguntas.forEach((pergunta) => {
  pergunta.addEventListener("click", () => {
    const resposta = document.getElementById(pergunta.getAttribute("aria-controls"));
    const estavaAberta = pergunta.getAttribute("aria-expanded") === "true";

    perguntas.forEach((outra) => {
      document.getElementById(outra.getAttribute("aria-controls")).classList.remove("aberto");
      outra.setAttribute("aria-expanded", false);
    });

    if (!estavaAberta) {
      resposta.classList.add("aberto");
      pergunta.setAttribute("aria-expanded", true);
    }
  });
});


/* JS DA EQUIPE */
const filtros = document.querySelectorAll("[data-filtro]");
const treinadores = document.querySelectorAll(".treinador");

filtros.forEach((filtro) => {
  filtro.addEventListener("click", () => {
    const escolhido = filtro.getAttribute("data-filtro");

    filtros.forEach((outro) => outro.classList.remove("ativo"));
    filtro.classList.add("ativo");

    treinadores.forEach((treinador) => {
      const programa = treinador.getAttribute("data-programa");
      if (escolhido === "todos" || escolhido === programa) {
        treinador.style.display = "block";
      } else {
        treinador.style.display = "none";
      }
    });
  });
});