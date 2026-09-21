"use strict";
(() => {
    let paginaAtual = 1;
    const limite = 5;
    function obterElemento(id) {
        return document.getElementById(id);
    }
    async function buscarVendas() {
        const categoriaElemento = obterElemento("filtroCategoria");
        const dataInicioElemento = obterElemento("filtroDataInicio");
        const dataFimElemento = obterElemento("filtroDataFim");
        if (categoriaElemento === null ||
            dataInicioElemento === null ||
            dataFimElemento === null) {
            throw new Error("Elementos dos filtros não encontrados.");
        }
        const parametros = new URLSearchParams();
        const categoria = categoriaElemento.value;
        const dataInicio = dataInicioElemento.value;
        const dataFim = dataFimElemento.value;
        if (categoria !== "") {
            parametros.append("categoria_id", categoria);
        }
        if (dataInicio !== "") {
            parametros.append("data_inicio", dataInicio);
        }
        if (dataFim !== "") {
            parametros.append("data_fim", dataFim);
        }
        parametros.append("pagina", paginaAtual.toString());
        parametros.append("limite", limite.toString());
        const resposta = await fetch(`api/dashboard.php?${parametros.toString()}`);
        if (!resposta.ok) {
            throw new Error(`Erro ao acessar a API de vendas. Status: ${resposta.status}`);
        }
        const dados = await resposta.json();
        if (!dados.sucesso) {
            throw new Error("A API retornou um erro.");
        }
        return dados;
    }
    async function buscarProdutos() {
        const resposta = await fetch("api/produtos.php?acao=listar");
        if (!resposta.ok) {
            throw new Error(`Erro ao acessar a API de produtos. Status: ${resposta.status}`);
        }
        const dados = await resposta.json();
        if (!dados.sucesso) {
            throw new Error("Não foi possível carregar os produtos.");
        }
        return dados.dados;
    }
    async function buscarCategorias() {
        const resposta = await fetch("api/categorias.php?acao=listar");
        if (!resposta.ok) {
            throw new Error(`Erro ao acessar a API de categorias. Status: ${resposta.status}`);
        }
        const dados = await resposta.json();
        if (!dados.sucesso) {
            throw new Error("Não foi possível carregar as categorias.");
        }
        return dados.dados;
    }
    function calcularMetricas(vendas, paginacao) {
        const faturamentoCalculado = vendas.reduce((total, venda) => {
            return total +
                (venda.quantidade *
                    venda.valor_unitario);
        }, 0);
        const ranking = vendas.reduce((contagem, venda) => {
            if (contagem[venda.produto] === undefined) {
                contagem[venda.produto] = 0;
            }
            contagem[venda.produto] +=
                venda.quantidade;
            return contagem;
        }, {});
        const rankingOrdenado = Object.entries(ranking)
            .map(([produto, quantidade]) => ({
            produto,
            quantidade
        }))
            .sort((a, b) => {
            return b.quantidade -
                a.quantidade;
        });
        const produtoMaisVendido = rankingOrdenado.length > 0
            ? rankingOrdenado[0].produto
            : "Nenhum dado registrado";
        return {
            faturamento: paginacao.faturamento > 0
                ? paginacao.faturamento
                : faturamentoCalculado,
            quantidadeVendida: paginacao.produtos_vendidos,
            quantidadeVendas: paginacao.total,
            produtoMaisVendido
        };
    }
    function encontrarEstoqueCritico(produtos) {
        return produtos.filter((produto) => {
            return produto.estoque <= 5;
        });
    }
    function encontrarVendasPorCategoria(vendas) {
        const resultado = {};
        vendas.forEach((venda) => {
            const categoria = venda.categoria;
            if (resultado[categoria] === undefined) {
                resultado[categoria] = 0;
            }
            resultado[categoria] +=
                venda.total;
        });
        return resultado;
    }
    function calcularRankingProdutos(vendas) {
        const contagem = vendas.reduce((resultado, venda) => {
            resultado[venda.produto] =
                (resultado[venda.produto] ?? 0) + venda.quantidade;
            return resultado;
        }, {});
        return Object.entries(contagem)
            .map(([produto, quantidade]) => ({
            produto,
            quantidade
        }))
            .sort((a, b) => {
            return b.quantidade -
                a.quantidade;
        });
    }
    function renderizarRankingProdutos(vendas) {
        const elemento = obterElemento("rankingProdutos");
        if (elemento === null) {
            return;
        }
        elemento.innerHTML = "";
        const ranking = calcularRankingProdutos(vendas);
        if (ranking.length === 0) {
            elemento.textContent =
                "Nenhum produto vendido.";
            return;
        }
        ranking
            .slice(0, 5)
            .forEach((item, indice) => {
            const linha = document.createElement("div");
            linha.className =
                "d-flex justify-content-between align-items-center border-bottom py-2";
            const esquerda = document.createElement("div");
            const posicao = document.createElement("strong");
            posicao.textContent =
                `${indice + 1}º `;
            const nome = document.createElement("span");
            nome.textContent =
                item.produto;
            esquerda.appendChild(posicao);
            esquerda.appendChild(nome);
            const quantidade = document.createElement("span");
            quantidade.className =
                "badge text-bg-primary";
            quantidade.textContent =
                `${item.quantidade} unidade(s)`;
            linha.appendChild(esquerda);
            linha.appendChild(quantidade);
            elemento.appendChild(linha);
        });
    }
    function renderizarFinanceiro(financeiro) {
        const custoElemento = obterElemento("custoMercadorias");
        const lucroBrutoElemento = obterElemento("lucroBruto");
        const despesasElemento = obterElemento("despesas");
        const lucroLiquidoElemento = obterElemento("lucroLiquido");
        const comprasElemento = obterElemento("comprasPeriodo");
        const estoqueQuantidadeElemento = obterElemento("estoqueQuantidade");
        const estoqueValorElemento = obterElemento("estoqueValor");
        const margemElemento = obterElemento("margemBruta");
        if (custoElemento !== null) {
            custoElemento.textContent =
                formatarMoeda(financeiro.custo_mercadorias);
        }
        if (lucroBrutoElemento !== null) {
            lucroBrutoElemento.textContent =
                formatarMoeda(financeiro.lucro_bruto);
        }
        if (despesasElemento !== null) {
            despesasElemento.textContent =
                formatarMoeda(financeiro.despesas);
        }
        if (lucroLiquidoElemento !== null) {
            lucroLiquidoElemento.textContent =
                formatarMoeda(financeiro.lucro_liquido);
        }
        if (comprasElemento !== null) {
            comprasElemento.textContent =
                formatarMoeda(financeiro.compras);
        }
        if (estoqueQuantidadeElemento !== null) {
            estoqueQuantidadeElemento.textContent =
                financeiro
                    .estoque_quantidade
                    .toString();
        }
        if (estoqueValorElemento !== null) {
            estoqueValorElemento.textContent =
                formatarMoeda(financeiro.estoque_valor);
        }
        if (margemElemento !== null) {
            margemElemento.textContent =
                financeiro.margem_bruta
                    .toFixed(2)
                    .replace(".", ",") +
                    "%";
        }
    }
    function renderizarMetricas(metricas) {
        const faturamentoElemento = obterElemento("faturamento");
        const totalVendasElemento = obterElemento("totalVendas");
        const produtosVendidosElemento = obterElemento("produtosVendidos");
        const produtoMaisVendidoElemento = obterElemento("produtoMaisVendido");
        if (faturamentoElemento !== null) {
            faturamentoElemento.textContent =
                metricas.faturamento.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });
        }
        if (totalVendasElemento !== null) {
            totalVendasElemento.textContent =
                metricas.quantidadeVendas.toString();
        }
        if (produtosVendidosElemento !== null) {
            produtosVendidosElemento.textContent =
                metricas.quantidadeVendida.toString();
        }
        if (produtoMaisVendidoElemento !== null) {
            produtoMaisVendidoElemento.textContent =
                metricas.produtoMaisVendido;
        }
    }
    function renderizarTabela(vendas) {
        const tabela = obterElemento("tabelaVendas");
        if (tabela === null) {
            return;
        }
        tabela.innerHTML = "";
        if (vendas.length === 0) {
            const linha = document.createElement("tr");
            const coluna = document.createElement("td");
            coluna.colSpan = 6;
            coluna.textContent =
                "Nenhum dado registrado.";
            coluna.className =
                "text-center py-4";
            linha.appendChild(coluna);
            tabela.appendChild(linha);
            return;
        }
        vendas.forEach((venda) => {
            const linha = document.createElement("tr");
            const valores = [
                venda.produto,
                venda.categoria,
                venda.quantidade.toString(),
                formatarMoeda(venda.valor_unitario),
                formatarMoeda(venda.total),
                formatarDataDashboard(venda.data_venda)
            ];
            valores.forEach((valor) => {
                const coluna = document.createElement("td");
                coluna.textContent =
                    valor;
                linha.appendChild(coluna);
            });
            tabela.appendChild(linha);
        });
    }
    function renderizarEstoqueCritico(produtos) {
        const elemento = obterElemento("estoqueCritico");
        if (elemento === null) {
            return;
        }
        elemento.innerHTML = "";
        const produtosCriticos = encontrarEstoqueCritico(produtos);
        if (produtosCriticos.length === 0) {
            elemento.textContent =
                "Nenhum produto com estoque crítico.";
            return;
        }
        produtosCriticos.forEach((produto) => {
            const item = document.createElement("div");
            item.className =
                "d-flex justify-content-between align-items-center border-bottom py-2";
            const nome = document.createElement("span");
            nome.textContent =
                produto.nome;
            const estoque = document.createElement("span");
            estoque.textContent =
                `${produto.estoque} unidade(s)`;
            estoque.className =
                "badge text-bg-warning";
            item.appendChild(nome);
            item.appendChild(estoque);
            elemento.appendChild(item);
        });
    }
    function renderizarVendasPorCategoria(vendas) {
        const elemento = obterElemento("vendasCategoria");
        if (elemento === null) {
            return;
        }
        elemento.innerHTML = "";
        if (vendas.length === 0) {
            elemento.textContent =
                "Nenhum dado registrado.";
            return;
        }
        const categorias = encontrarVendasPorCategoria(vendas);
        const nomesCategorias = Object.keys(categorias);
        if (nomesCategorias.length === 0) {
            elemento.textContent =
                "Nenhum dado registrado.";
            return;
        }
        nomesCategorias.forEach((categoria) => {
            const linha = document.createElement("div");
            linha.className =
                "d-flex justify-content-between align-items-center border-bottom py-2";
            const nome = document.createElement("span");
            nome.textContent =
                categoria;
            const valor = document.createElement("strong");
            valor.textContent =
                formatarMoeda(categorias[categoria]);
            linha.appendChild(nome);
            linha.appendChild(valor);
            elemento.appendChild(linha);
        });
    }
    function renderizarPaginacao(paginacao) {
        const btnAnterior = obterElemento("btnAnterior");
        const btnProxima = obterElemento("btnProxima");
        const paginaElemento = obterElemento("paginaAtual");
        const totalPaginas = paginacao.total > 0
            ? Math.ceil(paginacao.total /
                paginacao.limite)
            : 1;
        if (btnAnterior !== null) {
            btnAnterior.disabled =
                paginaAtual <= 1;
        }
        if (btnProxima !== null) {
            btnProxima.disabled =
                paginaAtual >= totalPaginas;
        }
        if (paginaElemento !== null) {
            paginaElemento.textContent =
                `Página ${paginaAtual} de ${totalPaginas}`;
        }
    }
    function formatarMoeda(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
    function formatarDataDashboard(data) {
        if (!data) {
            return "-";
        }
        const partes = data.trim().split(/\s+/);
        if (partes.length < 2) {
            return data;
        }
        const dataParte = partes[0];
        const horaParte = partes[1];
        const dataFormatada = dataParte
            .split("-")
            .reverse()
            .join("/");
        return `${dataFormatada} ${horaParte}`;
    }
    async function carregarDashboard() {
        try {
            const [respostaVendas, produtos] = await Promise.all([
                buscarVendas(),
                buscarProdutos()
            ]);
            paginaAtual =
                respostaVendas.paginacao.pagina;
            const vendas = respostaVendas.dados;
            const metricas = calcularMetricas(vendas, respostaVendas.paginacao);
            renderizarMetricas(metricas);
            renderizarFinanceiro(respostaVendas.financeiro);
            renderizarTabela(vendas);
            renderizarEstoqueCritico(produtos);
            renderizarVendasPorCategoria(vendas);
            renderizarRankingProdutos(vendas);
            renderizarPaginacao(respostaVendas.paginacao);
        }
        catch (erro) {
            console.error("Erro ao carregar dashboard:", erro);
            const tabela = obterElemento("tabelaVendas");
            if (tabela !== null) {
                tabela.innerHTML = "";
                const linha = document.createElement("tr");
                const coluna = document.createElement("td");
                coluna.colSpan = 6;
                coluna.className =
                    "text-center text-danger py-4";
                coluna.textContent =
                    "Não foi possível carregar os dados.";
                linha.appendChild(coluna);
                tabela.appendChild(linha);
            }
        }
    }
    async function carregarCategorias() {
        try {
            const categorias = await buscarCategorias();
            const select = obterElemento("filtroCategoria");
            if (select === null) {
                return;
            }
            select.innerHTML =
                '<option value="">Todas as categorias</option>';
            categorias.forEach((categoria) => {
                const option = document.createElement("option");
                option.value =
                    categoria.id.toString();
                option.textContent =
                    categoria.nome;
                select.appendChild(option);
            });
        }
        catch (erro) {
            console.error("Erro ao carregar categorias:", erro);
        }
    }
    function configurarEventos() {
        const btnLimpar = obterElemento("btnLimpar");
        const btnAnterior = obterElemento("btnAnterior");
        const btnProxima = obterElemento("btnProxima");
        const categoria = obterElemento("filtroCategoria");
        const dataInicio = obterElemento("filtroDataInicio");
        const dataFim = obterElemento("filtroDataFim");
        if (categoria !== null) {
            categoria.addEventListener("change", () => {
                paginaAtual = 1;
                void carregarDashboard();
            });
        }
        if (dataInicio !== null) {
            dataInicio.addEventListener("change", () => {
                paginaAtual = 1;
                void carregarDashboard();
            });
        }
        if (dataFim !== null) {
            dataFim.addEventListener("change", () => {
                paginaAtual = 1;
                void carregarDashboard();
            });
        }
        if (btnLimpar !== null) {
            btnLimpar.addEventListener("click", () => {
                if (categoria !== null) {
                    categoria.value = "";
                }
                if (dataInicio !== null) {
                    dataInicio.value = "";
                }
                if (dataFim !== null) {
                    dataFim.value = "";
                }
                paginaAtual = 1;
                void carregarDashboard();
            });
        }
        if (btnAnterior !== null) {
            btnAnterior.addEventListener("click", () => {
                if (paginaAtual > 1) {
                    paginaAtual--;
                    void carregarDashboard();
                }
            });
        }
        if (btnProxima !== null) {
            btnProxima.addEventListener("click", () => {
                paginaAtual++;
                void carregarDashboard();
            });
        }
    }
    function iniciarDashboard() {
        configurarEventos();
        void carregarCategorias();
        void carregarDashboard();
    }
    iniciarDashboard();
})();
