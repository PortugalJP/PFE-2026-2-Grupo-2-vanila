// Agendamento

const horas = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const totalMeses = 3; // Meses

let mes = 0; // Mês
let dia = ""; // Dia
let hora = ""; // Hora
// Reservas
let reservas = JSON.parse(localStorage.getItem("reservas")) || [];

const $ = id => document.getElementById(id);
const tabela = $("calendario").querySelector("tbody");

// Header
{
  const nav = $("nav"), menuBtn = $("menuBtn");
  $("themeToggle").onclick = () => {
    const proximo = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = proximo; // Tema
    try { localStorage.setItem("theme", proximo); } catch (e) {} // Salva
  };
  menuBtn.onclick = () => menuBtn.setAttribute("aria-expanded", nav.classList.toggle("is-open"));
  nav.onclick = e => { if (e.target.closest("a")) { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); } };
}

// Datas
const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const pad = n => String(n).padStart(2, "0");
const formatar = d => pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
const paraData = texto => { const [d, m, a] = texto.split("/"); return new Date(a, m - 1, d); };
const textoDoDia = texto => paraData(texto).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

// Reservas
// Conflito
const reservado = id => reservas.some(r => r.id === id);
// Já passou
const passou = (d, h) => { const inicio = paraData(d); inicio.setHours(parseInt(h)); return inicio < new Date(); };
// Tem vaga
const temLivre = d => horas.some(h => !reservado(d + " " + h) && !passou(d, h));

// Desenho
function mostrarCalendario() {
  const primeiro = new Date(hoje().getFullYear(), hoje().getMonth() + mes, 1);
  const ano = primeiro.getFullYear(), m = primeiro.getMonth();
  const celulas = Array(primeiro.getDay()).fill("<td></td>"); // Vazias

  for (let n = 1, total = new Date(ano, m + 1, 0).getDate(); n <= total; n++) {
    const data = new Date(ano, m, n), chave = formatar(data), sel = chave === dia;
    if (data.getDay() === 0) { // Domingo
      celulas.push(`<td class="domingo">${n}</td>`);
    } else if (data < hoje()) { // Passado
      celulas.push(`<td><button type="button" class="dia" disabled>${n}</button></td>`);
    } else { // Livre
      celulas.push(`<td><button type="button" class="dia${sel ? " selecionado" : ""}" data-dia="${chave}" aria-pressed="${sel}">${n}${temLivre(chave) ? '<i class="ponto"></i>' : ""}</button></td>`);
    }
  }
  while (celulas.length % 7) celulas.push("<td></td>"); // Completa

  let linhas = "";
  for (let i = 0; i < celulas.length; i += 7) linhas += "<tr>" + celulas.slice(i, i + 7).join("") + "</tr>";
  tabela.innerHTML = linhas;

  $("mesTitulo").textContent = primeiro.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(" de ", " ");
  $("mesAnterior").disabled = mes === 0;
  $("mesProximo").disabled = mes === totalMeses - 1;
}

function mostrarHorarios() {
  $("dataTexto").textContent = dia ? textoDoDia(dia) : "Escolha um dia no calendário.";
  $("horarios").innerHTML = !dia ? "" : horas.map(h => {
    if (reservado(dia + " " + h)) return `<button type="button" class="horario" disabled><span>${h}</span><span>Lotado</span></button>`;
    if (passou(dia, h))           return `<button type="button" class="horario" disabled><span>${h}</span><span>Encerrado</span></button>`;
    const sel = h === hora;
    return `<button type="button" class="horario${sel ? " selecionado" : ""}" data-hora="${h}" aria-pressed="${sel}"><span>${h}</span>${sel ? "<span>Selecionado</span>" : ""}</button>`;
  }).join("");
}

const programa = () => document.querySelector('input[name="programa"]:checked');

function mostrarResumo() {
  $("resumoPrograma").textContent = programa().dataset.detalhe;
  $("rotuloNome").textContent = programa().dataset.rotulo;
  $("resumoData").textContent = dia ? textoDoDia(dia) : "—";
  $("resumoHorario").textContent = hora || "—";
}

function mostrarTudo() { mostrarCalendario(); mostrarHorarios(); mostrarResumo(); }

const msg = (texto, tipo = "") => { $("mensagem").textContent = texto; $("mensagem").className = tipo; };

// Cliques
tabela.onclick = e => { // Dias
  const botao = e.target.closest("[data-dia]");
  if (botao) { dia = botao.dataset.dia; hora = ""; msg(""); mostrarTudo(); }
};
$("horarios").onclick = e => { // Horários
  const botao = e.target.closest("[data-hora]");
  if (botao) { hora = botao.dataset.hora; msg(""); mostrarTudo(); }
};
$("mesAnterior").onclick = () => { mes--; mostrarCalendario(); };
$("mesProximo").onclick = () => { mes++; mostrarCalendario(); };
document.querySelectorAll('input[name="programa"]').forEach(r => r.onchange = () => { msg(""); mostrarResumo(); });

// Enviar
$("form").onsubmit = e => {
  e.preventDefault();
  const nome = $("nome").value.trim(); // Limpa
  const email = $("email").value.trim();
  const telefone = $("telefone").value.trim();
  const digitos = [...telefone].filter(c => c >= "0" && c <= "9").length;

  if (!dia || !hora)                         return msg("Escolha um dia e um horário.", "erro");
  if (nome.length < 2)                       return msg("Digite o nome (mínimo de 2 letras).", "erro");
  if (!email || !$("email").checkValidity()) return msg("Digite um e-mail válido, como seuemail@exemplo.com.", "erro");
  if (digitos < 10 || digitos > 11)          return msg("Digite o telefone com DDD, como (21) 90000-0000.", "erro");

  // Reler
  reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  if (reservado(dia + " " + hora) || passou(dia, hora)) {
    hora = "";
    mostrarTudo();
    return msg("Esse horário não está mais disponível. Escolha outro.", "erro");
  }

  const p = programa().dataset.nome;
  reservas.push({ id: dia + " " + hora, programa: p, nome, email, telefone });
  localStorage.setItem("reservas", JSON.stringify(reservas));

  const resumo = `${p}, ${textoDoDia(dia)}, às ${hora}`;
  hora = "";
  $("form").reset();
  mostrarTudo();
  msg("Agendamento confirmado: " + resumo + ".", "sucesso");
};

// Início
// Programa
const pedido = new URLSearchParams(location.search).get("programa");
document.querySelectorAll('input[name="programa"]').forEach(r => { if (r.value === pedido) r.checked = true; });

// Primeiro dia
const d = hoje();
for (let i = 0; i < 60 && (d.getDay() === 0 || !temLivre(formatar(d))); i++) d.setDate(d.getDate() + 1);
dia = formatar(d);
mes = (d.getFullYear() - hoje().getFullYear()) * 12 + d.getMonth() - hoje().getMonth(); // Mês

mostrarTudo();
