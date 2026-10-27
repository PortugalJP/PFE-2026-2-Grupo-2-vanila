
document.addEventListener("DOMContentLoaded", function () {

    // FILTROS DOS TREINADORES

    const botoes = document.querySelectorAll(".equipe button");
    const treinadores = document.querySelectorAll(".treinador");

    botoes.forEach(function (botao) {

        botao.addEventListener("click", function () {

            const filtro = botao.textContent.trim().toLowerCase();

            treinadores.forEach(function (treinador) {

                const categoria = treinador
                    .querySelector("p")
                    .textContent.trim().toLowerCase();

                if (filtro === "todos" || categoria === filtro) {
                    treinador.style.display = "";
                } else {
                    treinador.style.display = "none";
                }

            });

            // Atualizar botão selecionado

            botoes.forEach(function (item) {
                item.classList.remove("selecionado");
            });

            botao.classList.add("selecionado");

        });

    });


    // ALTERNAR TEMA CLARO E ESCURO

    const botaoTema = document.querySelector(".tema");

    if (botaoTema) {

        botaoTema.addEventListener("click", function () {

            document.body.classList.toggle("modo-claro");

            if (document.body.classList.contains("modo-claro")) {
                botaoTema.textContent = "☾";
            } else {
                botaoTema.textContent = "☼";
            }

        });

    }

});
