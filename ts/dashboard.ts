((): void => {

    interface Venda {
        venda_id: number;
        produto_id: number;
        produto: string;
        categoria_id: number;
        categoria: string;
        quantidade: number;
        valor_unitario: number;
        total: number;
        data_venda: string;
    }

    interface Produto {
        id: number;
        nome: string;
        preco: number;
        estoque: number;
        categoria_id: number;
        categoria: string;
    }

    interface Categoria {
        id: number;
        nome: string;
    }

    interface Paginacao {
        pagina: number;
        limite: number;
        offset: number;
        total: number;
        faturamento: number;
        produtos_vendidos: number;
    }

    interface Financeiro {
        faturamento: number;
        custo_mercadorias: number;
        lucro_bruto: number;
        despesas: number;
        lucro_liquido: number;
        margem_bruta: number;
        compras: number;
        estoque_quantidade: number;
        estoque_valor: number;
    }

    interface RespostaDashboard {
        sucesso: boolean;
        dados: Venda[];
        paginacao: Paginacao;
        financeiro: Financeiro;
    }

    interface RespostaProdutos {
        sucesso: boolean;
        dados: Produto[];
    }

    interface RespostaCategorias {
        sucesso: boolean;
        dados: Categoria[];
    }

    interface Metricas {
        faturamento: number;
        quantidadeVendida: number;
        quantidadeVendas: number;
        produtoMaisVendido: string;
    }

    let paginaAtual: number = 1;

    const limite: number = 5;

    function obterElemento<T extends HTMLElement>(
        id: string
    ): T | null {

        return document.getElementById(id) as T | null;
    }

    async function buscarVendas(): Promise<RespostaDashboard> {

        const categoriaElemento =
            obterElemento<HTMLSelectElement>(
                "filtroCategoria"
            );

        const dataInicioElemento =
            obterElemento<HTMLInputElement>(
                "filtroDataInicio"
            );

        const dataFimElemento =
            obterElemento<HTMLInputElement>(
                "filtroDataFim"
            );

        if (
            categoriaElemento === null ||
            dataInicioElemento === null ||
            dataFimElemento === null
        ) {

            throw new Error(
                "Elementos dos filtros não encontrados."
            );
        }

        const parametros: URLSearchParams =
            new URLSearchParams();

        const categoria: string =
            categoriaElemento.value;

        const dataInicio: string =
            dataInicioElemento.value;

        const dataFim: string =
            dataFimElemento.value;

        if (categoria !== "") {

            parametros.append(
                "categoria_id",
                categoria
            );
        }

        if (dataInicio !== "") {

            parametros.append(
                "data_inicio",
                dataInicio
            );
        }

        if (dataFim !== "") {

            parametros.append(
                "data_fim",
                dataFim
            );
        }

        parametros.append(
            "pagina",
            paginaAtual.toString()
        );

        parametros.append(
            "limite",
            limite.toString()
        );

        const resposta: Response =
            await fetch(
                `api/dashboard.php?${parametros.toString()}`
            );

        if (!resposta.ok) {

            throw new Error(
                `Erro ao acessar a API de vendas. Status: ${resposta.status}`
            );
        }

        const dados: RespostaDashboard =
            await resposta.json();

        if (!dados.sucesso) {

            throw new Error(
                "A API retornou um erro."
            );
        }

        return dados;
    }

    async function buscarProdutos(): Promise<Produto[]> {

        const resposta: Response =
            await fetch(
                "api/produtos.php?acao=listar"
            );

        if (!resposta.ok) {

            throw new Error(
                `Erro ao acessar a API de produtos. Status: ${resposta.status}`
            );
        }

        const dados: RespostaProdutos =
            await resposta.json();

        if (!dados.sucesso) {

            throw new Error(
                "Não foi possível carregar os produtos."
            );
        }

        return dados.dados;
    }

    async function buscarCategorias(): Promise<Categoria[]> {

        const resposta: Response =
            await fetch(
                "api/categorias.php?acao=listar"
            );

        if (!resposta.ok) {

            throw new Error(
                `Erro ao acessar a API de categorias. Status: ${resposta.status}`
            );
        }

        const dados: RespostaCategorias =
            await resposta.json();

        if (!dados.sucesso) {

            throw new Error(
                "Não foi possível carregar as categorias."
            );
        }

        return dados.dados;
    }

    function calcularMetricas(
        vendas: Venda[],
        paginacao: Paginacao
    ): Metricas {

        const faturamentoCalculado: number =
            vendas.reduce(
                (
                    total: number,
                    venda: Venda
                ): number => {

                    return total +
                        (
                            venda.quantidade *
                            venda.valor_unitario
                        );
                },
                0
            );

        const ranking: Record<string, number> =
            vendas.reduce(
                (
                    contagem: Record<string, number>,
                    venda: Venda
                ): Record<string, number> => {

                    if (
                        contagem[venda.produto] === undefined
                    ) {
                        contagem[venda.produto] = 0;
                    }

                    contagem[venda.produto] +=
                        venda.quantidade;

                    return contagem;
                },
                {}
            );

        const rankingOrdenado:
            Array<{
                produto: string;
                quantidade: number;
            }> =
            Object.entries(ranking)
                .map(
                    (
                        [produto, quantidade]
                    ): {
                        produto: string;
                        quantidade: number;
                    } => ({
                        produto,
                        quantidade
                    })
                )
                .sort(
                    (
                        a,
                        b
                    ): number => {

                        return b.quantidade -
                            a.quantidade;
                    }
                );

        const produtoMaisVendido: string =
            rankingOrdenado.length > 0
                ? rankingOrdenado[0].produto
                : "Nenhum dado registrado";

        return {
            faturamento:
                paginacao.faturamento > 0
                    ? paginacao.faturamento
                    : faturamentoCalculado,

            quantidadeVendida:
                paginacao.produtos_vendidos,

            quantidadeVendas:
                paginacao.total,

            produtoMaisVendido
        };
    }

    function encontrarEstoqueCritico(
        produtos: Produto[]
    ): Produto[] {

        return produtos.filter(
            (
                produto: Produto
            ): boolean => {

                return produto.estoque <= 5;
            }
        );
    }

    function encontrarVendasPorCategoria(
        vendas: Venda[]
    ): Record<string, number> {

        const resultado:
            Record<string, number> = {};

        vendas.forEach(
            (
                venda: Venda
            ): void => {

                const categoria: string =
                    venda.categoria;

                if (
                    resultado[categoria] === undefined
                ) {
                    resultado[categoria] = 0;
                }

                resultado[categoria] +=
                    venda.total;
            }
        );

        return resultado;
    }

    function calcularRankingProdutos(
        vendas: Venda[]
    ): Array<{
        produto: string;
        quantidade: number;
    }> {

        const contagem:
            Record<string, number> =
            vendas.reduce(
                (
                    resultado: Record<string, number>,
                    venda: Venda
                ): Record<string, number> => {

                    resultado[venda.produto] =
                        (
                            resultado[venda.produto] ?? 0
                        ) + venda.quantidade;

                    return resultado;
                },
                {}
            );

        return Object.entries(contagem)
            .map(
                (
                    [produto, quantidade]
                ): {
                    produto: string;
                    quantidade: number;
                } => ({
                    produto,
                    quantidade
                })
            )
            .sort(
                (
                    a,
                    b
                ): number => {

                    return b.quantidade -
                        a.quantidade;
                }
            );
    }

    function renderizarRankingProdutos(
        vendas: Venda[]
    ): void {

        const elemento =
            obterElemento<HTMLElement>(
                "rankingProdutos"
            );

        if (elemento === null) {
            return;
        }

        elemento.innerHTML = "";

        const ranking =
            calcularRankingProdutos(vendas);

        if (ranking.length === 0) {

            elemento.textContent =
                "Nenhum produto vendido.";

            return;
        }

        ranking
            .slice(0, 5)
            .forEach(
                (
                    item,
                    indice
                ): void => {

                    const linha =
                        document.createElement(
                            "div"
                        );

                    linha.className =
                        "d-flex justify-content-between align-items-center border-bottom py-2";

                    const esquerda =
                        document.createElement(
                            "div"
                        );

                    const posicao =
                        document.createElement(
                            "strong"
                        );

                    posicao.textContent =
                        `${indice + 1}º `;

                    const nome =
                        document.createElement(
                            "span"
                        );

                    nome.textContent =
                        item.produto;

                    esquerda.appendChild(
                        posicao
                    );

                    esquerda.appendChild(
                        nome
                    );

                    const quantidade =
                        document.createElement(
                            "span"
                        );

                    quantidade.className =
                        "badge text-bg-primary";

                    quantidade.textContent =
                        `${item.quantidade} unidade(s)`;

                    linha.appendChild(
                        esquerda
                    );

                    linha.appendChild(
                        quantidade
                    );

                    elemento.appendChild(
                        linha
                    );
                }
            );
    }

    function renderizarFinanceiro(
        financeiro: Financeiro
    ): void {

        const custoElemento =
            obterElemento<HTMLElement>(
                "custoMercadorias"
            );

        const lucroBrutoElemento =
            obterElemento<HTMLElement>(
                "lucroBruto"
            );

        const despesasElemento =
            obterElemento<HTMLElement>(
                "despesas"
            );

        const lucroLiquidoElemento =
            obterElemento<HTMLElement>(
                "lucroLiquido"
            );

        const comprasElemento =
            obterElemento<HTMLElement>(
                "comprasPeriodo"
            );

        const estoqueQuantidadeElemento =
            obterElemento<HTMLElement>(
                "estoqueQuantidade"
            );

        const estoqueValorElemento =
            obterElemento<HTMLElement>(
                "estoqueValor"
            );

        const margemElemento =
            obterElemento<HTMLElement>(
                "margemBruta"
            );

        if (custoElemento !== null) {

            custoElemento.textContent =
                formatarMoeda(
                    financeiro.custo_mercadorias
                );
        }

        if (lucroBrutoElemento !== null) {

            lucroBrutoElemento.textContent =
                formatarMoeda(
                    financeiro.lucro_bruto
                );
        }

        if (despesasElemento !== null) {

            despesasElemento.textContent =
                formatarMoeda(
                    financeiro.despesas
                );
        }

        if (lucroLiquidoElemento !== null) {

            lucroLiquidoElemento.textContent =
                formatarMoeda(
                    financeiro.lucro_liquido
                );
        }

        if (comprasElemento !== null) {

            comprasElemento.textContent =
                formatarMoeda(
                    financeiro.compras
                );
        }

        if (
            estoqueQuantidadeElemento !== null
        ) {

            estoqueQuantidadeElemento.textContent =
                financeiro
                    .estoque_quantidade
                    .toString();
        }

        if (
            estoqueValorElemento !== null
        ) {

            estoqueValorElemento.textContent =
                formatarMoeda(
                    financeiro.estoque_valor
                );
        }

        if (margemElemento !== null) {

            margemElemento.textContent =
                financeiro.margem_bruta
                    .toFixed(2)
                    .replace(".", ",") +
                "%";
        }
    }

    function renderizarMetricas(
        metricas: Metricas
    ): void {

        const faturamentoElemento =
            obterElemento<HTMLElement>(
                "faturamento"
            );

        const totalVendasElemento =
            obterElemento<HTMLElement>(
                "totalVendas"
            );

        const produtosVendidosElemento =
            obterElemento<HTMLElement>(
                "produtosVendidos"
            );

        const produtoMaisVendidoElemento =
            obterElemento<HTMLElement>(
                "produtoMaisVendido"
            );

        if (faturamentoElemento !== null) {

            faturamentoElemento.textContent =
                metricas.faturamento.toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );
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

    function renderizarTabela(
        vendas: Venda[]
    ): void {

        const tabela =
            obterElemento<HTMLTableSectionElement>(
                "tabelaVendas"
            );

        if (tabela === null) {
            return;
        }

        tabela.innerHTML = "";

        if (vendas.length === 0) {

            const linha =
                document.createElement("tr");

            const coluna =
                document.createElement("td");

            coluna.colSpan = 6;

            coluna.textContent =
                "Nenhum dado registrado.";

            coluna.className =
                "text-center py-4";

            linha.appendChild(coluna);

            tabela.appendChild(linha);

            return;
        }

        vendas.forEach(
            (
                venda: Venda
            ): void => {

                const linha =
                    document.createElement("tr");

                const valores: string[] = [

                    venda.produto,

                    venda.categoria,

                    venda.quantidade.toString(),

                    formatarMoeda(
                        venda.valor_unitario
                    ),

                    formatarMoeda(
                        venda.total
                    ),

                    formatarDataDashboard(
                        venda.data_venda
                    )
                ];

                valores.forEach(
                    (
                        valor: string
                    ): void => {

                        const coluna =
                            document.createElement("td");

                        coluna.textContent =
                            valor;

                        linha.appendChild(
                            coluna
                        );
                    }
                );

                tabela.appendChild(
                    linha
                );
            }
        );
    }

    function renderizarEstoqueCritico(
        produtos: Produto[]
    ): void {

        const elemento =
            obterElemento<HTMLElement>(
                "estoqueCritico"
            );

        if (elemento === null) {
            return;
        }

        elemento.innerHTML = "";

        const produtosCriticos =
            encontrarEstoqueCritico(
                produtos
            );

        if (produtosCriticos.length === 0) {

            elemento.textContent =
                "Nenhum produto com estoque crítico.";

            return;
        }

        produtosCriticos.forEach(
            (
                produto: Produto
            ): void => {

                const item =
                    document.createElement("div");

                item.className =
                    "d-flex justify-content-between align-items-center border-bottom py-2";

                const nome =
                    document.createElement("span");

                nome.textContent =
                    produto.nome;

                const estoque =
                    document.createElement("span");

                estoque.textContent =
                    `${produto.estoque} unidade(s)`;

                estoque.className =
                    "badge text-bg-warning";

                item.appendChild(nome);
                item.appendChild(estoque);

                elemento.appendChild(item);
            }
        );
    }

    function renderizarVendasPorCategoria(
        vendas: Venda[]
    ): void {

        const elemento =
            obterElemento<HTMLElement>(
                "vendasCategoria"
            );

        if (elemento === null) {
            return;
        }

        elemento.innerHTML = "";

        if (vendas.length === 0) {

            elemento.textContent =
                "Nenhum dado registrado.";

            return;
        }

        const categorias =
            encontrarVendasPorCategoria(
                vendas
            );

        const nomesCategorias =
            Object.keys(categorias);

        if (nomesCategorias.length === 0) {

            elemento.textContent =
                "Nenhum dado registrado.";

            return;
        }

        nomesCategorias.forEach(
            (
                categoria: string
            ): void => {

                const linha =
                    document.createElement("div");

                linha.className =
                    "d-flex justify-content-between align-items-center border-bottom py-2";

                const nome =
                    document.createElement("span");

                nome.textContent =
                    categoria;

                const valor =
                    document.createElement("strong");

                valor.textContent =
                    formatarMoeda(
                        categorias[categoria]
                    );

                linha.appendChild(nome);
                linha.appendChild(valor);

                elemento.appendChild(linha);
            }
        );
    }

    function renderizarPaginacao(
        paginacao: Paginacao
    ): void {

        const btnAnterior =
            obterElemento<HTMLButtonElement>(
                "btnAnterior"
            );

        const btnProxima =
            obterElemento<HTMLButtonElement>(
                "btnProxima"
            );

        const paginaElemento =
            obterElemento<HTMLElement>(
                "paginaAtual"
            );

        const totalPaginas: number =
            paginacao.total > 0
                ? Math.ceil(
                    paginacao.total /
                    paginacao.limite
                )
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

    function formatarMoeda(
        valor: number
    ): string {

        return valor.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    function formatarDataDashboard(
        data: string
    ): string {

        if (!data) {
            return "-";
        }

        const partes: string[] =
            data.trim().split(/\s+/);

        if (partes.length < 2) {

            return data;
        }

        const dataParte: string =
            partes[0];

        const horaParte: string =
            partes[1];

        const dataFormatada: string =
            dataParte
                .split("-")
                .reverse()
                .join("/");

        return `${dataFormatada} ${horaParte}`;
    }

    async function carregarDashboard(): Promise<void> {

        try {

            const [
                respostaVendas,
                produtos
            ] = await Promise.all([
                buscarVendas(),
                buscarProdutos()
            ]);

            paginaAtual =
                respostaVendas.paginacao.pagina;

            const vendas: Venda[] =
                respostaVendas.dados;

            const metricas: Metricas =
                calcularMetricas(
                    vendas,
                    respostaVendas.paginacao
                );

            renderizarMetricas(
                metricas
            );

            renderizarFinanceiro(
                respostaVendas.financeiro
            );

            renderizarTabela(
                vendas
            );

            renderizarEstoqueCritico(
                produtos
            );

            renderizarVendasPorCategoria(
                vendas
            );

            renderizarRankingProdutos(
                vendas
            );

            renderizarPaginacao(
                respostaVendas.paginacao
            );

        } catch (erro: unknown) {

            console.error(
                "Erro ao carregar dashboard:",
                erro
            );

            const tabela =
                obterElemento<HTMLTableSectionElement>(
                    "tabelaVendas"
                );

            if (tabela !== null) {

                tabela.innerHTML = "";

                const linha =
                    document.createElement("tr");

                const coluna =
                    document.createElement("td");

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

    async function carregarCategorias(): Promise<void> {

        try {

            const categorias: Categoria[] =
                await buscarCategorias();

            const select =
                obterElemento<HTMLSelectElement>(
                    "filtroCategoria"
                );

            if (select === null) {
                return;
            }

            select.innerHTML =
                '<option value="">Todas as categorias</option>';

            categorias.forEach(
                (
                    categoria: Categoria
                ): void => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        categoria.id.toString();

                    option.textContent =
                        categoria.nome;

                    select.appendChild(
                        option
                    );
                }
            );

        } catch (erro: unknown) {

            console.error(
                "Erro ao carregar categorias:",
                erro
            );
        }
    }

    function configurarEventos(): void {

        const btnLimpar =
            obterElemento<HTMLButtonElement>(
                "btnLimpar"
            );

        const btnAnterior =
            obterElemento<HTMLButtonElement>(
                "btnAnterior"
            );

        const btnProxima =
            obterElemento<HTMLButtonElement>(
                "btnProxima"
            );

        const categoria =
            obterElemento<HTMLSelectElement>(
                "filtroCategoria"
            );

        const dataInicio =
            obterElemento<HTMLInputElement>(
                "filtroDataInicio"
            );

        const dataFim =
            obterElemento<HTMLInputElement>(
                "filtroDataFim"
            );

        if (categoria !== null) {

            categoria.addEventListener(
                "change",
                (): void => {

                    paginaAtual = 1;

                    void carregarDashboard();
                }
            );
        }

        if (dataInicio !== null) {

            dataInicio.addEventListener(
                "change",
                (): void => {

                    paginaAtual = 1;

                    void carregarDashboard();
                }
            );
        }

        if (dataFim !== null) {

            dataFim.addEventListener(
                "change",
                (): void => {

                    paginaAtual = 1;

                    void carregarDashboard();
                }
            );
        }

        if (btnLimpar !== null) {

            btnLimpar.addEventListener(
                "click",
                (): void => {

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
                }
            );
        }

        if (btnAnterior !== null) {

            btnAnterior.addEventListener(
                "click",
                (): void => {

                    if (paginaAtual > 1) {

                        paginaAtual--;

                        void carregarDashboard();
                    }
                }
            );
        }

        if (btnProxima !== null) {

            btnProxima.addEventListener(
                "click",
                (): void => {

                    paginaAtual++;

                    void carregarDashboard();
                }
            );
        }
    }

    function iniciarDashboard(): void {

        configurarEventos();

        void carregarCategorias();

        void carregarDashboard();
    }

    iniciarDashboard();

})();