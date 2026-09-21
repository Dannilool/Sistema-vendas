"use strict";
(() => {
    const form = document.getElementById("formCompra");
    const idInput = document.getElementById("id");
    const fornecedorInput = document.getElementById("fornecedor");
    const dataInput = document.getElementById("data_compra");
    const produtoInput = document.getElementById("produto_id");
    const quantidadeInput = document.getElementById("quantidade");
    const custoInput = document.getElementById("custo_unitario");
    const totalCompra = document.getElementById("totalCompra");
    const infoProduto = document.getElementById("infoProduto");
    const lista = document.getElementById("listaCompras");
    const mensagem = document.getElementById("mensagem");
    const titulo = document.getElementById("tituloFormulario");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnSalvar = document.getElementById("btnSalvar");
    const produtos = new Map();
    function mostrarMensagem(texto, tipo) {
        if (!mensagem) {
            return;
        }
        mensagem.innerHTML =
            '<div class="alert alert-' +
                tipo +
                '">' +
                texto +
                '</div>';
        window.setTimeout(() => {
            if (mensagem) {
                mensagem.innerHTML = "";
            }
        }, 4000);
    }
    function obterErro(erro) {
        if (erro instanceof Error) {
            return erro.message;
        }
        return "Ocorreu um erro inesperado.";
    }
    async function lerJson(resposta, mensagemPadrao) {
        let resultado;
        try {
            resultado =
                await resposta.json();
        }
        catch {
            throw new Error(mensagemPadrao);
        }
        if (!resposta.ok) {
            const dados = resultado;
            throw new Error(dados.mensagem ??
                mensagemPadrao);
        }
        return resultado;
    }
    function formatarMoeda(valor) {
        return Number(valor)
            .toFixed(2)
            .replace(".", ",");
    }
    function atualizarTotal() {
        if (!quantidadeInput ||
            !custoInput ||
            !totalCompra) {
            return;
        }
        const quantidade = Number(quantidadeInput.value);
        const custo = Number(custoInput.value);
        const total = (Number.isFinite(quantidade)
            ? quantidade
            : 0) *
            (Number.isFinite(custo)
                ? custo
                : 0);
        totalCompra.textContent =
            "R$ " +
                formatarMoeda(total);
    }
    function atualizarProduto() {
        if (!produtoInput ||
            !infoProduto) {
            return;
        }
        const produtoId = Number(produtoInput.value);
        if (!produtoInput.value) {
            infoProduto.innerHTML =
                "Selecione um produto.";
            return;
        }
        const produto = produtos.get(produtoId);
        if (!produto) {
            infoProduto.innerHTML =
                "Produto não encontrado.";
            return;
        }
        infoProduto.innerHTML =
            '<span class="text-muted">' +
                'Estoque atual: ' +
                Number(produto.estoque) +
                ' unidades | ' +
                'Custo atual: R$ ' +
                formatarMoeda(Number(produto.custo_reposicao)) +
                '</span>';
        if (custoInput &&
            !custoInput.value &&
            Number(produto.custo_reposicao) > 0) {
            custoInput.value =
                String(produto.custo_reposicao);
            atualizarTotal();
        }
    }
    async function carregarProdutos() {
        if (!produtoInput) {
            return;
        }
        try {
            const resposta = await fetch("../api/produtos.php?acao=listar");
            const resultado = await lerJson(resposta, "Erro ao carregar produtos.");
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível carregar os produtos.");
            }
            produtos.clear();
            produtoInput.innerHTML =
                '<option value="">' +
                    'Selecione um produto' +
                    '</option>';
            resultado.dados.forEach((produto) => {
                produtos.set(Number(produto.id), {
                    ...produto,
                    id: Number(produto.id),
                    estoque: Number(produto.estoque),
                    preco: Number(produto.preco),
                    custo_reposicao: Number(produto.custo_reposicao)
                });
                const option = document.createElement("option");
                option.value =
                    String(produto.id);
                option.textContent =
                    produto.nome +
                        " | Estoque: " +
                        Number(produto.estoque);
                produtoInput.appendChild(option);
            });
            atualizarProduto();
        }
        catch (erro) {
            mostrarMensagem(obterErro(erro), "danger");
        }
    }
    async function carregarCompras() {
        if (!lista) {
            return;
        }
        try {
            const resposta = await fetch("../api/compras.php?acao=listar");
            const resultado = await lerJson(resposta, "Erro ao carregar compras.");
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível carregar as compras.");
            }
            lista.innerHTML = "";
            if (resultado.dados.length === 0) {
                lista.innerHTML =
                    '<tr>' +
                        '<td colspan="8" ' +
                        'class="text-center text-muted py-4">' +
                        'Nenhuma compra cadastrada.' +
                        '</td>' +
                        '</tr>';
                return;
            }
            resultado.dados.forEach((compra) => {
                const tr = document.createElement("tr");
                const valores = [
                    String(compra.id),
                    compra.produto,
                    compra.fornecedor ??
                        "—",
                    String(compra.quantidade),
                    "R$ " +
                        formatarMoeda(Number(compra.custo_unitario)),
                    "R$ " +
                        formatarMoeda(Number(compra.total)),
                    new Date(compra.data_compra.replace(" ", "T")).toLocaleString("pt-BR")
                ];
                valores.forEach((valor) => {
                    const td = document.createElement("td");
                    td.textContent =
                        valor;
                    tr.appendChild(td);
                });
                const tdAcoes = document.createElement("td");
                const btnEditar = document.createElement("button");
                btnEditar.type =
                    "button";
                btnEditar.className =
                    "btn btn-sm btn-warning me-1";
                btnEditar.textContent =
                    "Editar";
                btnEditar.dataset.editarCompra =
                    String(compra.id);
                const btnExcluir = document.createElement("button");
                btnExcluir.type =
                    "button";
                btnExcluir.className =
                    "btn btn-sm btn-danger";
                btnExcluir.textContent =
                    "Excluir";
                btnExcluir.dataset.excluirCompra =
                    String(compra.id);
                tdAcoes.appendChild(btnEditar);
                tdAcoes.appendChild(btnExcluir);
                tr.appendChild(tdAcoes);
                lista.appendChild(tr);
            });
        }
        catch (erro) {
            mostrarMensagem(obterErro(erro), "danger");
        }
    }
    async function editarCompra(id) {
        try {
            const resposta = await fetch("../api/compras.php?acao=buscar&id=" +
                encodeURIComponent(String(id)));
            const resultado = await lerJson(resposta, "Erro ao buscar compra.");
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível buscar a compra.");
            }
            const compra = resultado.dados;
            if (!idInput ||
                !fornecedorInput ||
                !dataInput ||
                !produtoInput ||
                !quantidadeInput ||
                !custoInput) {
                return;
            }
            idInput.value =
                String(compra.id);
            fornecedorInput.value =
                compra.fornecedor ??
                    "";
            produtoInput.value =
                String(compra.produto_id);
            quantidadeInput.value =
                String(compra.quantidade);
            custoInput.value =
                String(Number(compra.custo_unitario));
            dataInput.value =
                compra.data_compra
                    .replace(" ", "T")
                    .substring(0, 16);
            if (titulo) {
                titulo.textContent =
                    "Editar compra";
            }
            atualizarProduto();
            atualizarTotal();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
        catch (erro) {
            mostrarMensagem(obterErro(erro), "danger");
        }
    }
    async function excluirCompra(id) {
        if (!confirm("Tem certeza que deseja excluir esta compra?")) {
            return;
        }
        try {
            const resposta = await fetch("../api/compras.php?acao=excluir&id=" +
                encodeURIComponent(String(id)));
            const resultado = await lerJson(resposta, "Erro ao excluir compra.");
            if (!resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível excluir a compra.");
            }
            mostrarMensagem(resultado.mensagem ??
                "Compra excluída com sucesso.", "success");
            await carregarProdutos();
            await carregarCompras();
        }
        catch (erro) {
            mostrarMensagem(obterErro(erro), "danger");
        }
    }
    function limparFormulario() {
        if (idInput) {
            idInput.value = "";
        }
        if (fornecedorInput) {
            fornecedorInput.value = "";
        }
        if (produtoInput) {
            produtoInput.value = "";
        }
        if (quantidadeInput) {
            quantidadeInput.value = "";
        }
        if (custoInput) {
            custoInput.value = "";
        }
        if (dataInput) {
            dataInput.value = "";
        }
        if (titulo) {
            titulo.textContent =
                "Nova compra";
        }
        if (infoProduto) {
            infoProduto.textContent =
                "Selecione um produto.";
        }
        atualizarTotal();
    }
    if (produtoInput) {
        produtoInput.addEventListener("change", atualizarProduto);
    }
    if (quantidadeInput) {
        quantidadeInput.addEventListener("input", atualizarTotal);
    }
    if (custoInput) {
        custoInput.addEventListener("input", atualizarTotal);
    }
    if (btnCancelar) {
        btnCancelar.addEventListener("click", limparFormulario);
    }
    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!produtoInput ||
                !quantidadeInput ||
                !custoInput ||
                !dataInput) {
                return;
            }
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            const quantidade = Number(quantidadeInput.value);
            const custo = Number(custoInput.value);
            const produtoId = Number(produtoInput.value);
            if (quantidade <= 0 ||
                custo < 0 ||
                !produtoId) {
                mostrarMensagem("Preencha os dados corretamente.", "danger");
                return;
            }
            try {
                if (btnSalvar) {
                    btnSalvar.disabled = true;
                }
                const dados = {
                    id: idInput?.value
                        ? Number(idInput.value)
                        : null,
                    fornecedor: fornecedorInput?.value ??
                        "",
                    produto_id: produtoInput.value,
                    quantidade: quantidadeInput.value,
                    custo_unitario: custoInput.value,
                    data_compra: dataInput.value
                };
                const resposta = await fetch("../api/compras.php?acao=salvar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(dados)
                });
                const resultado = await lerJson(resposta, "Erro ao salvar compra.");
                if (!resultado.sucesso) {
                    throw new Error(resultado.mensagem ??
                        "Não foi possível salvar a compra.");
                }
                mostrarMensagem(resultado.mensagem ??
                    "Compra salva com sucesso.", "success");
                limparFormulario();
                await carregarProdutos();
                await carregarCompras();
            }
            catch (erro) {
                mostrarMensagem(obterErro(erro), "danger");
            }
            finally {
                if (btnSalvar) {
                    btnSalvar.disabled = false;
                }
            }
        });
    }
    if (lista) {
        lista.addEventListener("click", (event) => {
            const elemento = event.target;
            const editar = elemento.closest("[data-editar-compra]");
            if (editar) {
                const id = Number(editar.dataset
                    .editarCompra);
                if (!Number.isNaN(id)) {
                    void editarCompra(id);
                }
                return;
            }
            const excluir = elemento.closest("[data-excluir-compra]");
            if (excluir) {
                const id = Number(excluir.dataset
                    .excluirCompra);
                if (!Number.isNaN(id)) {
                    void excluirCompra(id);
                }
            }
        });
    }
    void carregarProdutos();
    void carregarCompras();
})();
