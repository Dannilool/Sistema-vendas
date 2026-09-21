"use strict";
(() => {
    const form = document.getElementById("formCategoria");
    const idInput = document.getElementById("id");
    const nomeInput = document.getElementById("nome");
    const lista = document.getElementById("listaCategorias");
    const mensagem = document.getElementById("mensagem");
    const tituloFormulario = document.getElementById("tituloFormulario");
    const btnCancelar = document.getElementById("btnCancelar");
    /* =========================================================
       CARREGAR CATEGORIAS
       ========================================================= */
    async function carregarCategorias() {
        if (lista === null) {
            return;
        }
        try {
            const resposta = await fetch("../api/categorias.php?acao=listar");
            if (!resposta.ok) {
                throw new Error(`Erro ao acessar a API de categorias. Status: ${resposta.status}`);
            }
            const resultado = await resposta.json();
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ||
                    "Não foi possível carregar as categorias.");
            }
            lista.innerHTML = "";
            if (resultado.dados.length === 0) {
                const linha = document.createElement("tr");
                const coluna = document.createElement("td");
                coluna.colSpan = 3;
                coluna.className =
                    "text-center py-4";
                coluna.textContent =
                    "Nenhuma categoria cadastrada.";
                linha.appendChild(coluna);
                lista.appendChild(linha);
                return;
            }
            resultado.dados.forEach((categoria) => {
                const linha = document.createElement("tr");
                const colunaId = document.createElement("td");
                colunaId.textContent =
                    categoria.id.toString();
                const colunaNome = document.createElement("td");
                colunaNome.textContent =
                    categoria.nome;
                const colunaAcoes = document.createElement("td");
                const btnEditar = document.createElement("button");
                btnEditar.type = "button";
                btnEditar.className =
                    "btn btn-sm btn-warning me-1";
                btnEditar.textContent = "Editar";
                btnEditar.addEventListener("click", () => {
                    void editarCategoria(categoria.id);
                });
                const btnExcluir = document.createElement("button");
                btnExcluir.type = "button";
                btnExcluir.className =
                    "btn btn-sm btn-danger";
                btnExcluir.textContent = "Excluir";
                btnExcluir.addEventListener("click", () => {
                    void excluirCategoria(categoria.id);
                });
                colunaAcoes.appendChild(btnEditar);
                colunaAcoes.appendChild(btnExcluir);
                linha.appendChild(colunaId);
                linha.appendChild(colunaNome);
                linha.appendChild(colunaAcoes);
                lista.appendChild(linha);
            });
        }
        catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Erro ao carregar categorias.";
            mostrarMensagem(mensagemErro, "danger");
        }
    }
    /* =========================================================
       EDITAR CATEGORIA
       ========================================================= */
    async function editarCategoria(id) {
        if (idInput === null ||
            nomeInput === null) {
            return;
        }
        try {
            const resposta = await fetch(`../api/categorias.php?acao=buscar&id=${id}`);
            if (!resposta.ok) {
                throw new Error(`Erro ao buscar categoria. Status: ${resposta.status}`);
            }
            const resultado = await resposta.json();
            if (!resultado.sucesso ||
                resultado.dados === undefined) {
                throw new Error(resultado.mensagem ||
                    "Categoria não encontrada.");
            }
            idInput.value =
                resultado.dados.id.toString();
            nomeInput.value =
                resultado.dados.nome;
            if (tituloFormulario !== null) {
                tituloFormulario.textContent =
                    "Editar categoria";
            }
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
        catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Erro ao buscar categoria.";
            mostrarMensagem(mensagemErro, "danger");
        }
    }
    /* =========================================================
       SALVAR CATEGORIA
       ========================================================= */
    async function salvarCategoria(event) {
        event.preventDefault();
        if (idInput === null ||
            nomeInput === null) {
            return;
        }
        try {
            const dados = {
                id: idInput.value !== ""
                    ? Number(idInput.value)
                    : null,
                nome: nomeInput.value.trim()
            };
            const resposta = await fetch("../api/categorias.php?acao=salvar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });
            if (!resposta.ok) {
                throw new Error(`Erro ao salvar categoria. Status: ${resposta.status}`);
            }
            const resultado = await resposta.json();
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ||
                    "Não foi possível salvar a categoria.");
            }
            mostrarMensagem(resultado.mensagem ||
                "Categoria salva com sucesso.", "success");
            limparFormulario();
            await carregarCategorias();
        }
        catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Erro ao salvar categoria.";
            mostrarMensagem(mensagemErro, "danger");
        }
    }
    /* =========================================================
       EXCLUIR CATEGORIA
       ========================================================= */
    async function excluirCategoria(id) {
        const confirmar = window.confirm("Tem certeza que deseja excluir esta categoria?");
        if (!confirmar) {
            return;
        }
        try {
            const resposta = await fetch(`../api/categorias.php?acao=excluir&id=${id}`);
            if (!resposta.ok) {
                throw new Error(`Erro ao excluir categoria. Status: ${resposta.status}`);
            }
            const resultado = await resposta.json();
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ||
                    "Não foi possível excluir a categoria.");
            }
            mostrarMensagem(resultado.mensagem ||
                "Categoria excluída com sucesso.", "success");
            await carregarCategorias();
        }
        catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Erro ao excluir categoria.";
            mostrarMensagem(mensagemErro, "danger");
        }
    }
    /* =========================================================
       LIMPAR FORMULÁRIO
       ========================================================= */
    function limparFormulario() {
        if (idInput !== null) {
            idInput.value = "";
        }
        if (nomeInput !== null) {
            nomeInput.value = "";
        }
        if (tituloFormulario !== null) {
            tituloFormulario.textContent =
                "Nova categoria";
        }
    }
    /* =========================================================
       MENSAGENS
       ========================================================= */
    function mostrarMensagem(texto, tipo) {
        if (mensagem === null) {
            return;
        }
        mensagem.innerHTML = `
        <div class="alert alert-${tipo}">
            ${texto}
        </div>
    `;
        window.setTimeout(() => {
            mensagem.innerHTML = "";
        }, 4000);
    }
    /* =========================================================
       EVENTOS
       ========================================================= */
    if (form !== null) {
        form.addEventListener("submit", (event) => {
            void salvarCategoria(event);
        });
    }
    if (btnCancelar !== null) {
        btnCancelar.addEventListener("click", () => {
            limparFormulario();
        });
    }
    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */
    void carregarCategorias();
})();
