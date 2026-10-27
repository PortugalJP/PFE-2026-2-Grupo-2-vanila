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

/* JS DO AGENDAMENTO */
const calendario = document.getElementById("calendario");

if (calendario) {
  // Horários de cada dia (domingo fechado)
  const horasSemana = ["08:00", "10:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  const horasSabado = ["10:00", "14:00", "15:00", "16:00", "17:00"];
  const totalMeses = 3;

  const nomesMeses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const nomesDias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"];

  let mes = 0;   // 0 = mês atual
  let dia = "";  // dia escolhido (dd/mm/aaaa)
  let hora = ""; // horário escolhido
  let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

  const tabela = calendario.querySelector("tbody");
  const listaHorarios = document.getElementById("horarios");
  const form = document.getElementById("form");
  const mensagem = document.getElementById("mensagem");
  const avisarWhatsapp = document.getElementById("avisarWhatsapp");
  const radios = document.querySelectorAll('input[name="programa"]');

  // ---------- Datas ----------
  function hoje() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function doisDigitos(n) {
    return String(n).padStart(2, "0");
  }

  function formatar(d) {
    return doisDigitos(d.getDate()) + "/" + doisDigitos(d.getMonth() + 1) + "/" + d.getFullYear();
  }

  function paraData(texto) {
    const [d, m, a] = texto.split("/");
    return new Date(a, m - 1, d);
  }

  // Ex.: "quarta-feira, 28 de outubro"
  function textoDoDia(texto) {
    const d = paraData(texto);
    return nomesDias[d.getDay()] + ", " + d.getDate() + " de " + nomesMeses[d.getMonth()];
  }

  // ---------- Reservas ----------
  function horasDoDia(texto) {
    return paraData(texto).getDay() === 6 ? horasSabado : horasSemana;
  }

  function reservado(id) {
    return reservas.some((r) => r.id === id);
  }

  function passou(texto, h) {
    const inicio = paraData(texto);
    inicio.setHours(parseInt(h));
    return inicio < new Date();
  }

  function temLivre(texto) {
    return horasDoDia(texto).some((h) => !reservado(texto + " " + h) && !passou(texto, h));
  }

  // ---------- Desenho da página ----------
  function mostrarCalendario() {
    const primeiro = new Date(hoje().getFullYear(), hoje().getMonth() + mes, 1);
    const ano = primeiro.getFullYear();
    const m = primeiro.getMonth();
    const totalDias = new Date(ano, m + 1, 0).getDate();
    const celulas = [];

    // dias vazios antes do dia 1
    for (let i = 0; i < primeiro.getDay(); i++) {
      celulas.push("<td></td>");
    }

    for (let n = 1; n <= totalDias; n++) {
      const data = new Date(ano, m, n);
      const chave = formatar(data);
      if (data.getDay() === 0) {
        celulas.push(`<td class="domingo">${n}</td>`);
      } else if (data < hoje()) {
        celulas.push(`<td><button type="button" class="dia" disabled>${n}</button></td>`);
      } else {
        const classe = chave === dia ? "dia selecionado" : "dia";
        const ponto = temLivre(chave) ? '<span class="ponto"></span>' : "";
        celulas.push(`<td><button type="button" class="${classe}" data-dia="${chave}">${n}${ponto}</button></td>`);
      }
    }

    // completa a última semana
    while (celulas.length % 7 !== 0) {
      celulas.push("<td></td>");
    }

    let linhas = "";
    for (let i = 0; i < celulas.length; i += 7) {
      linhas += "<tr>" + celulas.slice(i, i + 7).join("") + "</tr>";
    }
    tabela.innerHTML = linhas;

    document.getElementById("mesTitulo").textContent = nomesMeses[m] + " " + ano;
    document.getElementById("mesAnterior").disabled = mes === 0;
    document.getElementById("mesProximo").disabled = mes === totalMeses - 1;
  }

  function mostrarHorarios() {
    document.getElementById("dataTexto").textContent = dia ? textoDoDia(dia) : "Escolha um dia no calendário.";

    if (!dia) {
      listaHorarios.innerHTML = "";
      return;
    }

    listaHorarios.innerHTML = horasDoDia(dia).map((h) => {
      if (reservado(dia + " " + h)) {
        return `<li><button type="button" class="horario" disabled><span>${h}</span><span>Lotado</span></button></li>`;
      }
      if (passou(dia, h)) {
        return `<li><button type="button" class="horario" disabled><span>${h}</span><span>Encerrado</span></button></li>`;
      }
      if (h === hora) {
        return `<li><button type="button" class="horario selecionado" data-hora="${h}"><span>${h}</span><span>Selecionado</span></button></li>`;
      }
      return `<li><button type="button" class="horario" data-hora="${h}"><span>${h}</span></button></li>`;
    }).join("");
  }

  // Programa marcado (PKZ ou One to One)
  function programa() {
    let marcado = radios[0];
    radios.forEach((r) => {
      if (r.checked) {
        marcado = r;
      }
    });
    return marcado;
  }

  function mostrarResumo() {
    const p = programa();
    document.getElementById("resumoPrograma").textContent = p.dataset.detalhe;
    document.getElementById("rotuloNome").textContent = p.dataset.rotulo;
    document.getElementById("resumoData").textContent = dia ? textoDoDia(dia) : "—";
    document.getElementById("resumoHorario").textContent = hora || "—";

    // destaca o cartão do programa escolhido
    radios.forEach((r) => {
      if (r.checked) {
        r.closest(".programa").classList.add("escolhido");
      } else {
        r.closest(".programa").classList.remove("escolhido");
      }
    });
  }

  function mostrarTudo() {
    mostrarCalendario();
    mostrarHorarios();
    mostrarResumo();
  }

  function aviso(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = tipo || "";
  }

  // ---------- Cliques ----------
  tabela.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-dia]");
    if (botao) {
      dia = botao.dataset.dia;
      hora = "";
      aviso("");
      mostrarTudo();
    }
  });

  listaHorarios.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-hora]");
    if (botao) {
      hora = botao.dataset.hora;
      aviso("");
      mostrarTudo();
    }
  });

  document.getElementById("mesAnterior").onclick = function () {
    mes--;
    mostrarCalendario();
  };

  document.getElementById("mesProximo").onclick = function () {
    mes++;
    mostrarCalendario();
  };

  radios.forEach((r) => {
    r.addEventListener("change", () => {
      aviso("");
      mostrarResumo();
    });
  });

  // ---------- Enviar ----------
  form.onsubmit = function (e) {
    e.preventDefault();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const digitos = [...telefone].filter((c) => c >= "0" && c <= "9").length;

    if (!dia || !hora) {
      return aviso("Escolha um dia e um horário.", "erro");
    }
    if (nome.length < 2) {
      return aviso("Digite o nome (mínimo de 2 letras).", "erro");
    }
    if (!email.includes("@") || !email.includes(".")) {
      return aviso("Digite um e-mail válido, como seuemail@exemplo.com.", "erro");
    }
    if (digitos < 10 || digitos > 11) {
      return aviso("Digite o telefone com DDD, como (21) 90000-0000.", "erro");
    }

    // relê as reservas (outra aba pode ter reservado o mesmo horário)
    reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    if (reservado(dia + " " + hora) || passou(dia, hora)) {
      hora = "";
      mostrarTudo();
      return aviso("Esse horário não está mais disponível. Escolha outro.", "erro");
    }

    const p = programa().dataset.nome;
    reservas.push({ id: dia + " " + hora, programa: p, nome: nome, email: email, telefone: telefone });
    localStorage.setItem("reservas", JSON.stringify(reservas));

    const resumo = p + ", " + textoDoDia(dia) + ", às " + hora;

    // link do WhatsApp com o resumo do agendamento
    avisarWhatsapp.setAttribute("href", "https://wa.me/55XXXXXXXXXXX?text=Olá! Acabei de agendar uma aula experimental: " + resumo + ". Meu nome é " + nome + ".");
    avisarWhatsapp.hidden = false;

    hora = "";
    form.reset();
    mostrarTudo();
    aviso("Agendamento confirmado: " + resumo + ".", "sucesso");
  };

  // ---------- Botões de teste (do código do professor) ----------
  const caixaDados = document.getElementById("dados");

  document.getElementById("verDados").onclick = function () {
    caixaDados.textContent = JSON.stringify(reservas, null, 2);
    caixaDados.hidden = !caixaDados.hidden;
  };

  document.getElementById("reset").onclick = function () {
    localStorage.removeItem("reservas");
    location.reload();
  };

  // ---------- Início: abre no primeiro dia com horário livre ----------
  const d = hoje();
  for (let i = 0; i < 60 && (d.getDay() === 0 || !temLivre(formatar(d))); i++) {
    d.setDate(d.getDate() + 1);
  }
  dia = formatar(d);
  mes = (d.getFullYear() - hoje().getFullYear()) * 12 + d.getMonth() - hoje().getMonth();

  mostrarTudo();
}
