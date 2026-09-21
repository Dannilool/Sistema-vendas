"use strict";
// =====================================================
// TIPOS DO CHART.JS
// =====================================================
// =====================================================
// APLICAÇÃO
// =====================================================
(() => {
    // =================================================
    // TIPOS
    // =================================================
    // =================================================
    // VARIÁVEIS DOS GRÁFICOS
    // =================================================
    let graficoFinanceiro = null;
    let graficoDespesasCompras = null;
    let graficoCategorias = null;
    // =================================================
    // ELEMENTOS
    // =================================================
    const dataInicio = document.getElementById("dataInicio");
    const dataFim = document.getElementById("dataFim");
    const btnFiltrar = document.getElementById("btnFiltrar");
    const btnLimpar = document.getElementById("btnLimpar");
    const mensagem = document.getElementById("mensagem");
    const tabelaProdutos = document.getElementById("listaProdutosRelatorio");
    const tabelaCategorias = document.getElementById("listaCategoriasRelatorio");
    // =================================================
    // FORMATAÇÃO
    // =================================================
    function moeda(valor) {
        return valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    function percentual(valor) {
        return (valor
            .toFixed(2)
            .replace(".", ",")
            + "%");
    }
    function formatarMes(mes) {
        const partes = mes.split("-");
        if (partes.length !== 2) {
            return mes;
        }
        return (`${partes[1]}/${partes[0]}`);
    }
    // =================================================
    // MENSAGEM
    // =================================================
    function mostrarMensagem(texto, tipo) {
        if (!mensagem) {
            return;
        }
        mensagem.innerHTML = `
            <div class="alert alert-${tipo}">
                ${texto}
            </div>
        `;
        window.setTimeout(() => {
            if (mensagem) {
                mensagem.innerHTML = "";
            }
        }, 4000);
    }
    // =================================================
    // CARREGAR RELATÓRIO
    // =================================================
    async function carregarRelatorio() {
        try {
            const parametros = new URLSearchParams();
            if (dataInicio &&
                dataInicio.value !== "") {
                parametros.set("data_inicio", dataInicio.value);
            }
            if (dataFim &&
                dataFim.value !== "") {
                parametros.set("data_fim", dataFim.value);
            }
            const resposta = await fetch(`../api/relatorios.php?${parametros.toString()}`);
            const dadosRecebidos = await resposta.json();
            const resultado = dadosRecebidos;
            if (!resposta.ok ||
                !resultado.sucesso) {
                throw new Error(resultado.mensagem ??
                    "Não foi possível carregar o relatório.");
            }
            renderizarFinanceiro(resultado.financeiro);
            renderizarProdutos(resultado.produtos);
            renderizarCategorias(resultado.categorias);
            renderizarGraficos(resultado.evolucao);
            renderizarRankingLucro(resultado.produtos);
            renderizarGraficoCategorias(resultado.categorias);
        }
        catch (erro) {
            const texto = erro instanceof Error
                ? erro.message
                : "Erro inesperado.";
            mostrarMensagem(texto, "danger");
        }
    }
    // =================================================
    // FINANCEIRO
    // =================================================
    function renderizarFinanceiro(financeiro) {
        const valores = {
            faturamento: `R$ ${moeda(financeiro.faturamento)}`,
            custoMercadorias: `R$ ${moeda(financeiro.custo_mercadorias)}`,
            lucroBruto: `R$ ${moeda(financeiro.lucro_bruto)}`,
            despesas: `R$ ${moeda(financeiro.despesas)}`,
            lucroLiquido: `R$ ${moeda(financeiro.lucro_liquido)}`,
            margemBruta: percentual(financeiro.margem_bruta),
            margemLiquida: percentual(financeiro.margem_liquida),
            compras: `R$ ${moeda(financeiro.compras)}`,
            produtosVendidos: financeiro.produtos_vendidos
                .toLocaleString("pt-BR"),
            totalVendas: financeiro.total_vendas
                .toLocaleString("pt-BR")
        };
        Object.entries(valores).forEach((entrada) => {
            const elemento = document.getElementById(entrada[0]);
            if (elemento) {
                elemento.textContent =
                    entrada[1];
            }
        });
    }
    // =================================================
    // PRODUTOS
    // =================================================
    function renderizarProdutos(produtos) {
        if (!tabelaProdutos) {
            return;
        }
        tabelaProdutos.innerHTML = "";
        if (produtos.length === 0) {
            tabelaProdutos.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="text-center text-muted py-4">

                        Nenhuma venda encontrada
                        no período.

                    </td>
                </tr>
            `;
            return;
        }
        produtos.forEach((produto, index) => {
            tabelaProdutos.innerHTML += `
                    <tr>

                        <td>
                            ${index + 1}
                        </td>

                        <td>
                            <strong>
                                ${produto.nome}
                            </strong>
                        </td>

                        <td>
                            ${produto.quantidade}
                        </td>

                        <td>
                            R$ ${moeda(produto.faturamento)}
                        </td>

                        <td>
                            R$ ${moeda(produto.custo)}
                        </td>

                        <td>
                            R$ ${moeda(produto.lucro)}
                        </td>

                        <td>
                            ${percentual(produto.margem)}
                        </td>

                    </tr>
                `;
        });
    }
    // =================================================
    // CATEGORIAS
    // =================================================
    function renderizarCategorias(categorias) {
        if (!tabelaCategorias) {
            return;
        }
        tabelaCategorias.innerHTML =
            "";
        if (categorias.length === 0) {
            tabelaCategorias.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="text-center text-muted py-4">

                        Nenhuma venda encontrada
                        no período.

                    </td>
                </tr>
            `;
            return;
        }
        categorias.forEach((categoria) => {
            tabelaCategorias.innerHTML += `
                    <tr>

                        <td>
                            ${categoria.nome}
                        </td>

                        <td>
                            ${categoria.quantidade}
                        </td>

                        <td>
                            R$ ${moeda(categoria.faturamento)}
                        </td>

                        <td>
                            R$ ${moeda(categoria.custo)}
                        </td>

                        <td>
                            R$ ${moeda(categoria.lucro)}
                        </td>

                        <td>
                            ${percentual(categoria.margem)}
                        </td>

                    </tr>
                `;
        });
    }
    // =================================================
    // GRÁFICOS
    // =================================================
    function renderizarGraficos(evolucao) {
        const canvasFinanceiro = document.getElementById("graficoFinanceiro");
        const canvasDespesasCompras = document.getElementById("graficoDespesasCompras");
        if (!canvasFinanceiro ||
            !canvasDespesasCompras) {
            return;
        }
        // =============================================
        // DESTRUIR GRÁFICOS EXISTENTES
        // =============================================
        if (graficoFinanceiro) {
            graficoFinanceiro.destroy();
            graficoFinanceiro =
                null;
        }
        if (graficoDespesasCompras) {
            graficoDespesasCompras.destroy();
            graficoDespesasCompras =
                null;
        }
        // =============================================
        // LABELS
        // =============================================
        const labels = evolucao.map((item) => formatarMes(item.mes));
        // =============================================
        // GRÁFICO FINANCEIRO
        // =============================================
        const configuracaoFinanceiro = {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Faturamento",
                        data: evolucao.map((item) => item.faturamento),
                        tension: 0.3
                    },
                    {
                        label: "Lucro bruto",
                        data: evolucao.map((item) => item.lucro_bruto),
                        tension: 0.3
                    },
                    {
                        label: "Lucro líquido",
                        data: evolucao.map((item) => item.lucro_liquido),
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return ("R$ " +
                                    value.toLocaleString("pt-BR"));
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (contexto) => {
                                const valor = contexto.parsed.y
                                    .toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                return (contexto
                                    .dataset
                                    .label
                                    +
                                        ": R$ " +
                                    valor);
                            }
                        }
                    }
                }
            }
        };
        // =============================================
        // GRÁFICO DESPESAS X COMPRAS
        // =============================================
        const configuracaoDespesasCompras = {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Despesas",
                        data: evolucao.map((item) => item.despesas)
                    },
                    {
                        label: "Compras",
                        data: evolucao.map((item) => item.compras)
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return ("R$ " +
                                    value.toLocaleString("pt-BR"));
                            }
                        }
                    }
                }
            }
        };
        // =============================================
        // CRIAR GRÁFICOS
        // =============================================
        graficoFinanceiro =
            new Chart(canvasFinanceiro, configuracaoFinanceiro);
        graficoDespesasCompras =
            new Chart(canvasDespesasCompras, configuracaoDespesasCompras);
    }
    // =================================================
    // RANKING DE LUCRO
    // =================================================
    function renderizarRankingLucro(produtos) {
        const tabelaRanking = document.getElementById("listaRankingLucro");
        if (!tabelaRanking) {
            return;
        }
        tabelaRanking.innerHTML = "";
        if (produtos.length === 0) {
            tabelaRanking.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted py-4">

                    Nenhuma venda encontrada
                    no período.

                </td>

            </tr>
        `;
            return;
        }
        const ranking = [...produtos].sort((primeiro, segundo) => segundo.lucro -
            primeiro.lucro);
        ranking.forEach((produto, index) => {
            tabelaRanking.innerHTML += `
                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        <strong>
                            ${produto.nome}
                        </strong>
                    </td>

                    <td>
                        ${produto.quantidade}
                    </td>

                    <td>
                        R$ ${moeda(produto.faturamento)}
                    </td>

                    <td>
                        R$ ${moeda(produto.custo)}
                    </td>

                    <td>
                        <strong>
                            R$ ${moeda(produto.lucro)}
                        </strong>
                    </td>

                    <td>
                        ${percentual(produto.margem)}
                    </td>

                </tr>
            `;
        });
    }
    // =================================================
    // GRÁFICO POR CATEGORIA
    // =================================================
    function renderizarGraficoCategorias(categorias) {
        const canvas = document.getElementById("graficoCategorias");
        if (!canvas) {
            return;
        }
        if (graficoCategorias) {
            graficoCategorias.destroy();
            graficoCategorias =
                null;
        }
        const labels = categorias.map((categoria) => categoria.nome);
        const valores = categorias.map((categoria) => categoria.faturamento);
        const configuracao = {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Faturamento",
                        data: valores
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return ("R$ " +
                                    value.toLocaleString("pt-BR"));
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (contexto) => {
                                return ("Faturamento: R$ " +
                                    contexto.parsed.y
                                        .toLocaleString("pt-BR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }));
                            }
                        }
                    }
                }
            }
        };
        graficoCategorias =
            new Chart(canvas, configuracao);
    }
    // =================================================
    // BOTÃO FILTRAR
    // =================================================
    if (btnFiltrar) {
        btnFiltrar.addEventListener("click", () => {
            void carregarRelatorio();
        });
    }
    // =================================================
    // BOTÃO LIMPAR
    // =================================================
    if (btnLimpar) {
        btnLimpar.addEventListener("click", () => {
            if (dataInicio) {
                dataInicio.value = "";
            }
            if (dataFim) {
                dataFim.value = "";
            }
            void carregarRelatorio();
        });
    }
    // =================================================
    // INICIALIZAÇÃO
    // =================================================
    void carregarRelatorio();
})();
