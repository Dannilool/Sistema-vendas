"use strict";
(() => {
    // ===============================
    // TIPOS
    // ===============================
    // ===============================
    // ELEMENTOS
    // ===============================
    const form = document.getElementById("formProduto");
    const idInput = document.getElementById("id");
    const nomeInput = document.getElementById("nome");
    const precoInput = document.getElementById("preco");
    const custoReposicaoInput = document.getElementById("custo_reposicao");
    const estoqueInput = document.getElementById("estoque");
    const categoriaInput = document.getElementById("categoria_id");
    const lista = document.getElementById("listaProdutos");
    const mensagem = document.getElementById("mensagem");
    const tituloFormulario = document.getElementById("tituloFormulario");
    const btnCancelar = document.getElementById("btnCancelar");
    // ===============================
    // ERROS
    // ===============================
    function obterMensagemErro(erro) {
        if (erro instanceof Error) {
            return erro.message;
        }
        return "Ocorreu um erro inesperado.";
    }
    // ===============================
    // FORMATAÇÃO
    // ===============================
    function formatarMoeda(valor) {
        return Number(valor)
            .toFixed(2)
            .replace(".", ",");
    }
    function calcularLucro(preco, custo) {
        return preco - custo;
    }
    function calcularMargem(preco, custo) {
        if (preco <= 0) {
            return 0;
        }
        return (((preco - custo) / preco) *
            100);
    }
    function obterClasseMargem(margem) {
        if (margem < 0) {
            return "text-danger fw-bold";
        }
        if (margem < 20) {
            return "text-warning fw-bold";
        }
        return "text-success fw-bold";
    }
    function obterBadgeEstoque(estoque) {
        if (estoque <= 0) {
            return `
                <span class="badge bg-danger">
                    Sem estoque
                </span>
            `;
        }
        if (estoque <= 5) {
            return `
                <span class="badge bg-warning text-dark">
                    ${estoque} - Baixo
                </span>
            `;
        }
        return `
            <span class="badge bg-success">
                ${estoque}
            </span>
        `;
    }
    // ===============================
    // CARREGAR CATEGORIAS
    // ===============================
    async function carregarCategorias() {
        if (!categoriaInput) {
            return;
        }
        try {
            const resposta = await fetch("../api/categorias.php?acao=listar");
            if (!resposta.ok) {
                throw new Error("Erro ao conectar com a API de categorias.");
            }
            const resultado = await resposta.json();
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível carregar as categorias.");
            }
            categoriaInput.innerHTML = `
                <option value="">
                    Selecione uma categoria
                </option>
            `;
            resultado.dados.forEach((categoria) => {
                categoriaInput.innerHTML += `
                        <option value="${categoria.id}">
                            ${categoria.nome}
                        </option>
                    `;
            });
        }
        catch (erro) {
            mostrarMensagem(obterMensagemErro(erro), "danger");
        }
    }
    // ===============================
    // CARREGAR PRODUTOS
    // ===============================
    async function carregarProdutos() {
        if (!lista) {
            return;
        }
        try {
            const resposta = await fetch("../api/produtos.php?acao=listar");
            if (!resposta.ok) {
                throw new Error("Erro ao conectar com a API de produtos.");
            }
            const resultado = await resposta.json();
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível carregar os produtos.");
            }
            lista.innerHTML = "";
            if (resultado.dados.length === 0) {
                lista.innerHTML = `
                    <tr>
                        <td
                            colspan="8"
                            class="text-center text-muted py-4">

                            Nenhum produto cadastrado.

                        </td>
                    </tr>
                `;
                return;
            }
            resultado.dados.forEach((produto) => {
                const lucro = calcularLucro(produto.preco, produto.custo_reposicao);
                const margem = calcularMargem(produto.preco, produto.custo_reposicao);
                const classeMargem = obterClasseMargem(margem);
                lista.innerHTML += `
                        <tr>

                            <td>
                                ${produto.id}
                            </td>

                            <td>
                                <strong>
                                    ${produto.nome}
                                </strong>
                            </td>

                            <td>
                                R$ ${formatarMoeda(produto.custo_reposicao)}
                            </td>

                            <td>
                                R$ ${formatarMoeda(produto.preco)}
                            </td>

                            <td class="${classeMargem}">
                                R$ ${formatarMoeda(lucro)}
                            </td>

                            <td class="${classeMargem}">
                                ${margem.toFixed(2).replace(".", ",")}%
                            </td>

                            <td>
                                ${obterBadgeEstoque(produto.estoque)}
                            </td>

                            <td>
                                ${produto.categoria}
                            </td>

                            <td class="text-nowrap">

                                <button
                                    type="button"
                                    class="btn btn-sm btn-warning"
                                    data-editar-produto="${produto.id}">

                                    Editar

                                </button>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-danger"
                                    data-excluir-produto="${produto.id}">

                                    Excluir

                                </button>

                            </td>

                        </tr>
                    `;
            });
        }
        catch (erro) {
            mostrarMensagem(obterMensagemErro(erro), "danger");
        }
    }
    // ===============================
    // EDITAR PRODUTO
    // ===============================
    async function editarProduto(id) {
        try {
            const resposta = await fetch(`../api/produtos.php?acao=buscar&id=${id}`);
            if (!resposta.ok) {
                throw new Error("Erro ao buscar o produto.");
            }
            const resultado = await resposta.json();
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível buscar o produto.");
            }
            const produto = resultado.dados;
            if (!idInput ||
                !nomeInput ||
                !precoInput ||
                !custoReposicaoInput ||
                !estoqueInput ||
                !categoriaInput) {
                return;
            }
            idInput.value =
                String(produto.id);
            nomeInput.value =
                produto.nome;
            precoInput.value =
                String(produto.preco);
            custoReposicaoInput.value =
                String(produto.custo_reposicao);
            estoqueInput.value =
                String(produto.estoque);
            categoriaInput.value =
                String(produto.categoria_id);
            if (tituloFormulario) {
                tituloFormulario.textContent =
                    "Editar produto";
            }
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
        catch (erro) {
            mostrarMensagem(obterMensagemErro(erro), "danger");
        }
    }
    // ===============================
    // SALVAR PRODUTO
    // ===============================
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!idInput ||
                !nomeInput ||
                !precoInput ||
                !custoReposicaoInput ||
                !estoqueInput ||
                !categoriaInput) {
                return;
            }
            try {
                const dados = {
                    id: idInput.value
                        ? Number(idInput.value)
                        : null,
                    nome: nomeInput.value,
                    preco: precoInput.value,
                    custo_reposicao: custoReposicaoInput.value,
                    estoque: estoqueInput.value,
                    categoria_id: categoriaInput.value
                };
                const resposta = await fetch("../api/produtos.php?acao=salvar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dados)
                });
                if (!resposta.ok) {
                    const resultadoErro = await resposta.json()
                        .catch(() => null);
                    throw new Error(resultadoErro?.mensagem ??
                        "Erro ao salvar o produto.");
                }
                const resultado = await resposta.json();
                if (!resultado.sucesso) {
                    throw new Error(resultado.mensagem ??
                        "Não foi possível salvar o produto.");
                }
                mostrarMensagem(resultado.mensagem ??
                    "Produto salvo com sucesso.", "success");
                limparFormulario();
                await carregarProdutos();
            }
            catch (erro) {
                mostrarMensagem(obterMensagemErro(erro), "danger");
            }
        });
    }
    // ===============================
    // EXCLUIR PRODUTO
    // ===============================
    async function excluirProduto(id) {
        const confirmar = confirm("Tem certeza que deseja excluir este produto?");
        if (!confirmar) {
            return;
        }
        try {
            const resposta = await fetch(`../api/produtos.php?acao=excluir&id=${id}`);
            const resultado = await resposta.json();
            if (!resposta.ok || !resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível excluir o produto.");
            }
            mostrarMensagem(resultado.mensagem ??
                "Produto excluído com sucesso.", "success");
            await carregarProdutos();
        }
        catch (erro) {
            mostrarMensagem(obterMensagemErro(erro), "danger");
        }
    }
    // ===============================
    // LIMPAR FORMULÁRIO
    // ===============================
    function limparFormulario() {
        if (idInput) {
            idInput.value = "";
        }
        if (nomeInput) {
            nomeInput.value = "";
        }
        if (precoInput) {
            precoInput.value = "";
        }
        if (custoReposicaoInput) {
            custoReposicaoInput.value = "";
        }
        if (estoqueInput) {
            estoqueInput.value = "";
        }
        if (categoriaInput) {
            categoriaInput.value = "";
        }
        if (tituloFormulario) {
            tituloFormulario.textContent =
                "Novo produto";
        }
    }
    // ===============================
    // BOTÃO CANCELAR
    // ===============================
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limparFormulario);
    }
    // ===============================
    // MENSAGENS
    // ===============================
    function mostrarMensagem(texto, tipo) {
        if (!mensagem) {
            return;
        }
        mensagem.innerHTML = `
            <div class="alert alert-${tipo}">
                ${texto}
            </div>
        `;
        setTimeout(() => {
            if (mensagem) {
                mensagem.innerHTML = "";
            }
        }, 4000);
    }
    // ===============================
    // EVENTOS DOS BOTÕES
    // ===============================
    if (lista) {
        lista.addEventListener("click", (event) => {
            const elemento = event.target;
            const botaoEditar = elemento.closest("[data-editar-produto]");
            if (botaoEditar) {
                const id = Number(botaoEditar.dataset.editarProduto);
                if (!Number.isNaN(id)) {
                    void editarProduto(id);
                }
                return;
            }
            const botaoExcluir = elemento.closest("[data-excluir-produto]");
            if (botaoExcluir) {
                const id = Number(botaoExcluir.dataset.excluirProduto);
                if (!Number.isNaN(id)) {
                    void excluirProduto(id);
                }
            }
        });
    }
    // ===============================
    // INICIALIZAÇÃO
    // ===============================
    void carregarCategorias();
    void carregarProdutos();
})();
