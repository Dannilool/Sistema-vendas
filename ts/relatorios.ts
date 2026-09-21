// =====================================================
// TIPOS DO CHART.JS
// =====================================================

interface ChartDataset {
    label: string;
    data: number[];
    tension?: number;
}

interface ChartTooltipContext {
    dataset: {
        label: string;
    };
    parsed: {
        y: number;
    };
}

interface ChartConfig {
    type: "line" | "bar";

    data: {
        labels: string[];
        datasets: ChartDataset[];
    };

    options: {
        responsive: boolean;
        maintainAspectRatio: boolean;

        interaction?: {
            mode: "index";
            intersect: boolean;
        };

        scales?: {
            y?: {
                beginAtZero: boolean;

                ticks: {
                    callback: (
                        value: number
                    ) => string;
                };
            };
        };

        plugins?: {
            tooltip?: {
                callbacks: {
                    label: (
                        contexto: ChartTooltipContext
                    ) => string;
                };
            };
        };
    };
}

interface ChartInstance {
    destroy(): void;
}

interface ChartConstructor {
    new(
        elemento: HTMLCanvasElement,
        configuracao: ChartConfig
    ): ChartInstance;
}

declare const Chart: ChartConstructor;


// =====================================================
// APLICAÇÃO
// =====================================================

((): void => {

    // =================================================
    // TIPOS
    // =================================================

    interface Financeiro {
        faturamento: number;
        custo_mercadorias: number;
        lucro_bruto: number;
        despesas: number;
        lucro_liquido: number;
        margem_bruta: number;
        margem_liquida: number;
        compras: number;
        produtos_vendidos: number;
        total_vendas: number;
    }

    interface Produto {
        id: number;
        nome: string;
        quantidade: number;
        faturamento: number;
        custo: number;
        lucro: number;
        margem: number;
    }

    interface Categoria {
        id: number;
        nome: string;
        quantidade: number;
        faturamento: number;
        custo: number;
        lucro: number;
        margem: number;
    }

    interface EvolucaoMensal {
        mes: string;
        faturamento: number;
        custo_mercadorias: number;
        despesas: number;
        compras: number;
        lucro_bruto: number;
        lucro_liquido: number;
    }

    interface Resposta {
        sucesso: boolean;
        mensagem?: string;
        financeiro: Financeiro;
        produtos: Produto[];
        categorias: Categoria[];
        evolucao: EvolucaoMensal[];
    }


    // =================================================
    // VARIÁVEIS DOS GRÁFICOS
    // =================================================

    let graficoFinanceiro:
        ChartInstance | null = null;

    let graficoDespesasCompras:
        ChartInstance | null = null;

    let graficoCategorias:
        ChartInstance | null = null;


    // =================================================
    // ELEMENTOS
    // =================================================

    const dataInicio =
        document.getElementById(
            "dataInicio"
        ) as HTMLInputElement | null;


    const dataFim =
        document.getElementById(
            "dataFim"
        ) as HTMLInputElement | null;


    const btnFiltrar =
        document.getElementById(
            "btnFiltrar"
        ) as HTMLButtonElement | null;


    const btnLimpar =
        document.getElementById(
            "btnLimpar"
        ) as HTMLButtonElement | null;


    const mensagem =
        document.getElementById(
            "mensagem"
        ) as HTMLElement | null;


    const tabelaProdutos =
        document.getElementById(
            "listaProdutosRelatorio"
        ) as HTMLElement | null;


    const tabelaCategorias =
        document.getElementById(
            "listaCategoriasRelatorio"
        ) as HTMLElement | null;


    // =================================================
    // FORMATAÇÃO
    // =================================================

    function moeda(
        valor: number
    ): string {

        return valor.toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }


    function percentual(
        valor: number
    ): string {

        return (
            valor
                .toFixed(2)
                .replace(".", ",")
            + "%"
        );
    }


    function formatarMes(
        mes: string
    ): string {

        const partes =
            mes.split("-");


        if (
            partes.length !== 2
        ) {
            return mes;
        }


        return (
            `${partes[1]}/${partes[0]}`
        );
    }


    // =================================================
    // MENSAGEM
    // =================================================

    function mostrarMensagem(
        texto: string,
        tipo: string
    ): void {

        if (!mensagem) {
            return;
        }


        mensagem.innerHTML = `
            <div class="alert alert-${tipo}">
                ${texto}
            </div>
        `;


        window.setTimeout(
            (): void => {

                if (mensagem) {
                    mensagem.innerHTML = "";
                }

            },
            4000
        );
    }


    // =================================================
    // CARREGAR RELATÓRIO
    // =================================================

    async function carregarRelatorio():
        Promise<void> {

        try {

            const parametros =
                new URLSearchParams();


            if (
                dataInicio &&
                dataInicio.value !== ""
            ) {

                parametros.set(
                    "data_inicio",
                    dataInicio.value
                );
            }


            if (
                dataFim &&
                dataFim.value !== ""
            ) {

                parametros.set(
                    "data_fim",
                    dataFim.value
                );
            }


            const resposta =
                await fetch(
                    `../api/relatorios.php?${parametros.toString()}`
                );


            const dadosRecebidos =
                await resposta.json();


            const resultado =
                dadosRecebidos as Resposta;


            if (
                !resposta.ok ||
                !resultado.sucesso
            ) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível carregar o relatório."
                );
            }


            renderizarFinanceiro(
                resultado.financeiro
            );


            renderizarProdutos(
                resultado.produtos
            );


            renderizarCategorias(
                resultado.categorias
            );


            renderizarGraficos(
                resultado.evolucao
            );

            renderizarRankingLucro(
                resultado.produtos
            );

            renderizarGraficoCategorias(
                resultado.categorias
            );

        } catch (
        erro: unknown
        ) {

            const texto =
                erro instanceof Error
                    ? erro.message
                    : "Erro inesperado.";


            mostrarMensagem(
                texto,
                "danger"
            );
        }
    }


    // =================================================
    // FINANCEIRO
    // =================================================

    function renderizarFinanceiro(
        financeiro: Financeiro
    ): void {

        const valores:
            Record<string, string> = {

            faturamento:
                `R$ ${moeda(
                    financeiro.faturamento
                )}`,

            custoMercadorias:
                `R$ ${moeda(
                    financeiro.custo_mercadorias
                )}`,

            lucroBruto:
                `R$ ${moeda(
                    financeiro.lucro_bruto
                )}`,

            despesas:
                `R$ ${moeda(
                    financeiro.despesas
                )}`,

            lucroLiquido:
                `R$ ${moeda(
                    financeiro.lucro_liquido
                )}`,

            margemBruta:
                percentual(
                    financeiro.margem_bruta
                ),

            margemLiquida:
                percentual(
                    financeiro.margem_liquida
                ),

            compras:
                `R$ ${moeda(
                    financeiro.compras
                )}`,

            produtosVendidos:
                financeiro.produtos_vendidos
                    .toLocaleString("pt-BR"),

            totalVendas:
                financeiro.total_vendas
                    .toLocaleString("pt-BR")
        };


        Object.entries(
            valores
        ).forEach(
            (
                entrada: [string, string]
            ): void => {

                const elemento =
                    document.getElementById(
                        entrada[0]
                    );


                if (elemento) {

                    elemento.textContent =
                        entrada[1];
                }
            }
        );
    }


    // =================================================
    // PRODUTOS
    // =================================================

    function renderizarProdutos(
        produtos: Produto[]
    ): void {

        if (!tabelaProdutos) {
            return;
        }


        tabelaProdutos.innerHTML = "";


        if (
            produtos.length === 0
        ) {

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


        produtos.forEach(
            (
                produto: Produto,
                index: number
            ): void => {

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
                            R$ ${moeda(
                    produto.faturamento
                )}
                        </td>

                        <td>
                            R$ ${moeda(
                    produto.custo
                )}
                        </td>

                        <td>
                            R$ ${moeda(
                    produto.lucro
                )}
                        </td>

                        <td>
                            ${percentual(
                    produto.margem
                )}
                        </td>

                    </tr>
                `;
            }
        );
    }


    // =================================================
    // CATEGORIAS
    // =================================================

    function renderizarCategorias(
        categorias: Categoria[]
    ): void {

        if (!tabelaCategorias) {
            return;
        }


        tabelaCategorias.innerHTML =
            "";


        if (
            categorias.length === 0
        ) {

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


        categorias.forEach(
            (
                categoria: Categoria
            ): void => {

                tabelaCategorias.innerHTML += `
                    <tr>

                        <td>
                            ${categoria.nome}
                        </td>

                        <td>
                            ${categoria.quantidade}
                        </td>

                        <td>
                            R$ ${moeda(
                    categoria.faturamento
                )}
                        </td>

                        <td>
                            R$ ${moeda(
                    categoria.custo
                )}
                        </td>

                        <td>
                            R$ ${moeda(
                    categoria.lucro
                )}
                        </td>

                        <td>
                            ${percentual(
                    categoria.margem
                )}
                        </td>

                    </tr>
                `;
            }
        );
    }


    // =================================================
    // GRÁFICOS
    // =================================================

    function renderizarGraficos(
        evolucao: EvolucaoMensal[]
    ): void {

        const canvasFinanceiro =
            document.getElementById(
                "graficoFinanceiro"
            ) as HTMLCanvasElement | null;


        const canvasDespesasCompras =
            document.getElementById(
                "graficoDespesasCompras"
            ) as HTMLCanvasElement | null;


        if (
            !canvasFinanceiro ||
            !canvasDespesasCompras
        ) {
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

        const labels =
            evolucao.map(
                (
                    item: EvolucaoMensal
                ): string =>
                    formatarMes(
                        item.mes
                    )
            );


        // =============================================
        // GRÁFICO FINANCEIRO
        // =============================================

        const configuracaoFinanceiro:
            ChartConfig = {

            type: "line",

            data: {

                labels,

                datasets: [

                    {
                        label:
                            "Faturamento",

                        data:
                            evolucao.map(
                                (
                                    item:
                                        EvolucaoMensal
                                ): number =>
                                    item.faturamento
                            ),

                        tension:
                            0.3
                    },


                    {
                        label:
                            "Lucro bruto",

                        data:
                            evolucao.map(
                                (
                                    item:
                                        EvolucaoMensal
                                ): number =>
                                    item.lucro_bruto
                            ),

                        tension:
                            0.3
                    },


                    {
                        label:
                            "Lucro líquido",

                        data:
                            evolucao.map(
                                (
                                    item:
                                        EvolucaoMensal
                                ): number =>
                                    item.lucro_liquido
                            ),

                        tension:
                            0.3
                    }

                ]
            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                interaction: {

                    mode:
                        "index",

                    intersect:
                        false
                },

                scales: {

                    y: {

                        beginAtZero:
                            true,

                        ticks: {

                            callback:
                                (
                                    value:
                                        number
                                ): string => {

                                    return (
                                        "R$ " +
                                        value.toLocaleString(
                                            "pt-BR"
                                        )
                                    );
                                }
                        }
                    }
                },

                plugins: {

                    tooltip: {

                        callbacks: {

                            label:
                                (
                                    contexto:
                                        ChartTooltipContext
                                ): string => {

                                    const valor =
                                        contexto.parsed.y
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits:
                                                        2,

                                                    maximumFractionDigits:
                                                        2
                                                }
                                            );


                                    return (
                                        contexto
                                            .dataset
                                            .label
                                        +
                                        ": R$ " +
                                        valor
                                    );
                                }
                        }
                    }
                }
            }
        };


        // =============================================
        // GRÁFICO DESPESAS X COMPRAS
        // =============================================

        const configuracaoDespesasCompras:
            ChartConfig = {

            type:
                "bar",

            data: {

                labels,

                datasets: [

                    {
                        label:
                            "Despesas",

                        data:
                            evolucao.map(
                                (
                                    item:
                                        EvolucaoMensal
                                ): number =>
                                    item.despesas
                            )
                    },


                    {
                        label:
                            "Compras",

                        data:
                            evolucao.map(
                                (
                                    item:
                                        EvolucaoMensal
                                ): number =>
                                    item.compras
                            )
                    }

                ]
            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                scales: {

                    y: {

                        beginAtZero:
                            true,

                        ticks: {

                            callback:
                                (
                                    value:
                                        number
                                ): string => {

                                    return (
                                        "R$ " +
                                        value.toLocaleString(
                                            "pt-BR"
                                        )
                                    );
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
            new Chart(
                canvasFinanceiro,
                configuracaoFinanceiro
            );


        graficoDespesasCompras =
            new Chart(
                canvasDespesasCompras,
                configuracaoDespesasCompras
            );
    }


    // =================================================
    // RANKING DE LUCRO
    // =================================================

    function renderizarRankingLucro(
        produtos: Produto[]
    ): void {

        const tabelaRanking =
            document.getElementById(
                "listaRankingLucro"
            ) as HTMLElement | null;


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


        const ranking =
            [...produtos].sort(
                (
                    primeiro: Produto,
                    segundo: Produto
                ): number =>
                    segundo.lucro -
                    primeiro.lucro
            );


        ranking.forEach(
            (
                produto: Produto,
                index: number
            ): void => {

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
                        R$ ${moeda(
                    produto.faturamento
                )}
                    </td>

                    <td>
                        R$ ${moeda(
                    produto.custo
                )}
                    </td>

                    <td>
                        <strong>
                            R$ ${moeda(
                    produto.lucro
                )}
                        </strong>
                    </td>

                    <td>
                        ${percentual(
                    produto.margem
                )}
                    </td>

                </tr>
            `;
            }
        );
    }


    // =================================================
    // GRÁFICO POR CATEGORIA
    // =================================================

    function renderizarGraficoCategorias(
        categorias: Categoria[]
    ): void {

        const canvas =
            document.getElementById(
                "graficoCategorias"
            ) as HTMLCanvasElement | null;


        if (!canvas) {
            return;
        }


        if (graficoCategorias) {

            graficoCategorias.destroy();

            graficoCategorias =
                null;
        }


        const labels =
            categorias.map(
                (
                    categoria: Categoria
                ): string =>
                    categoria.nome
            );


        const valores =
            categorias.map(
                (
                    categoria: Categoria
                ): number =>
                    categoria.faturamento
            );


        const configuracao:
            ChartConfig = {

            type: "bar",

            data: {

                labels,

                datasets: [

                    {
                        label:
                            "Faturamento",

                        data:
                            valores
                    }

                ]
            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                scales: {

                    y: {

                        beginAtZero:
                            true,

                        ticks: {

                            callback:
                                (
                                    value: number
                                ): string => {

                                    return (
                                        "R$ " +
                                        value.toLocaleString(
                                            "pt-BR"
                                        )
                                    );
                                }
                        }
                    }
                },

                plugins: {

                    tooltip: {

                        callbacks: {

                            label:
                                (
                                    contexto:
                                        ChartTooltipContext
                                ): string => {

                                    return (
                                        "Faturamento: R$ " +
                                        contexto.parsed.y
                                            .toLocaleString(
                                                "pt-BR",
                                                {
                                                    minimumFractionDigits:
                                                        2,

                                                    maximumFractionDigits:
                                                        2
                                                }
                                            )
                                    );
                                }
                        }
                    }
                }
            }
        };


        graficoCategorias =
            new Chart(
                canvas,
                configuracao
            );
    }


    // =================================================
    // BOTÃO FILTRAR
    // =================================================

    if (btnFiltrar) {

        btnFiltrar.addEventListener(
            "click",
            (): void => {

                void carregarRelatorio();
            }
        );
    }


    // =================================================
    // BOTÃO LIMPAR
    // =================================================

    if (btnLimpar) {

        btnLimpar.addEventListener(
            "click",
            (): void => {

                if (dataInicio) {
                    dataInicio.value = "";
                }


                if (dataFim) {
                    dataFim.value = "";
                }


                void carregarRelatorio();
            }
        );
    }


    // =================================================
    // INICIALIZAÇÃO
    // =================================================

    void carregarRelatorio();

})();
