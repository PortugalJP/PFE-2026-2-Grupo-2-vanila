console.log("Hello, World!");
// Mapa: ao clicar, troca o botão pelo Google Maps
const mapa = document.getElementById("mapa");
const botaoMapa = document.getElementById("botao-mapa");

if (mapa && botaoMapa) {
  botaoMapa.addEventListener("click", function () {
    const endereco = mapa.getAttribute("data-endereco");
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", "https://www.google.com/maps?q=" + endereco + "&output=embed");
    iframe.setAttribute("title", "Localização da academia");
    mapa.removeChild(botaoMapa);
    mapa.appendChild(iframe);
  });
}