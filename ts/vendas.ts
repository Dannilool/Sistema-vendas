((): void => {

    interface Produto {
        id: number;
        nome: string;
        preco: number;
        estoque: number;
        categoria_id: number;
        categoria: string;
    }

    interface Venda {
        id: number;
        produto_id: number;
        produto: string;
        quantidade: number;
        valor_unitario: number;
        total: number;
        data_venda: string;
    }

    interface VendaDetalhes {
        id: number;
        produto_id: number;
        quantidade: number;
        valor_unitario: number;
        data_venda: string;
    }

    interface RespostaProdutos {
        sucesso: boolean;
        mensagem?: string;
        dados: Produto[];
    }

    interface RespostaVendas {
        sucesso: boolean;
        mensagem?: string;
        dados: Venda[];
    }

    interface RespostaVenda {
        sucesso: boolean;
        mensagem?: string;
        dados: Venda | VendaDetalhes;
        id?: number;
    }

    interface DadosVenda {
        id: number | null;
        produto_id: string;
        quantidade: string;
        valor_unitario: null;
        data_venda: string;
    }

    const form = document.getElementById(
        "formVenda"
    ) as HTMLFormElement | null;

    const idInput = document.getElementById(
        "id"
    ) as HTMLInputElement | null;

    const produtoInput = document.getElementById(
        "produto_id"
    ) as HTMLSelectElement | null;

    const quantidadeInput = document.getElementById(
        "quantidade"
    ) as HTMLInputElement | null;

    const dataInput = document.getElementById(
        "data_venda"
    ) as HTMLInputElement | null;

    const lista = document.getElementById(
        "listaVendas"
    ) as HTMLElement | null;

    const mensagem = document.getElementById(
        "mensagem"
    ) as HTMLElement | null;

    const tituloFormulario = document.getElementById(
        "tituloFormulario"
    ) as HTMLElement | null;

    const btnCancelar = document.getElementById(
        "btnCancelar"
    ) as HTMLButtonElement | null;

    const btnSalvar = form
        ? form.querySelector(
            'button[type="submit"]'
        ) as HTMLButtonElement | null
        : null;

    const produtos = new Map<number, Produto>();

    let vendaEmEdicao:
        | {
            id: number;
            produto_id: number;
            quantidade: number;
        }
        | null = null;

    let infoEstoque: HTMLDivElement | null = null;

    if (produtoInput) {

        const container = produtoInput.parentElement;

        if (container) {

            infoEstoque = document.createElement("div");

            infoEstoque.id = "infoEstoque";

            infoEstoque.className = "mt-2";

            infoEstoque.style.minHeight = "24px";

            container.appendChild(infoEstoque);
        }
    }

    function obterMensagemErro(
        erro: unknown
    ): string {

        if (erro instanceof Error) {
            return erro.message;
        }

        return "Ocorreu um erro inesperado.";
    }

    async function lerJson<T>(
        resposta: Response,
        mensagemPadrao: string
    ): Promise<T> {

        let resultado: unknown;

        try {

            resultado = await resposta.json();

        } catch {

            throw new Error(
                mensagemPadrao
            );
        }

        if (!resposta.ok) {

            const dados =
                resultado as {
                    mensagem?: string;
                };

            throw new Error(
                dados.mensagem ??
                mensagemPadrao
            );
        }

        return resultado as T;
    }

    function atualizarInformacoesEstoque(): void {

        if (
            !produtoInput ||
            !quantidadeInput ||
            !infoEstoque
        ) {
            return;
        }

        const produtoId =
            Number(produtoInput.value);

        if (
            produtoInput.value === "" ||
            Number.isNaN(produtoId)
        ) {

            infoEstoque.innerHTML =
                '<span class="text-muted">' +
                'Selecione um produto para consultar o estoque.' +
                '</span>';

            quantidadeInput.removeAttribute(
                "max"
            );

            quantidadeInput.setCustomValidity(
                ""
            );

            if (btnSalvar) {
                btnSalvar.disabled = false;
            }

            return;
        }

        const produto =
            produtos.get(produtoId);

        if (!produto) {

            infoEstoque.innerHTML =
                '<span class="text-muted">' +
                'Estoque não disponível.' +
                '</span>';

            quantidadeInput.removeAttribute(
                "max"
            );

            quantidadeInput.setCustomValidity(
                ""
            );

            if (btnSalvar) {
                btnSalvar.disabled = false;
            }

            return;
        }

        let estoqueDisponivel =
            Number(produto.estoque);

        if (
            vendaEmEdicao &&
            vendaEmEdicao.produto_id === produtoId
        ) {

            estoqueDisponivel +=
                vendaEmEdicao.quantidade;
        }

        if (estoqueDisponivel <= 0) {

            infoEstoque.innerHTML =
                '<span class="text-danger fw-bold">' +
                'Estoque disponível: 0 unidades' +
                '</span>';

            quantidadeInput.max = "0";

            quantidadeInput.setCustomValidity(
                "Este produto está sem estoque."
            );

            if (btnSalvar) {
                btnSalvar.disabled = true;
            }

            return;
        }

        const textoUnidade =
            estoqueDisponivel === 1
                ? "unidade"
                : "unidades";

        infoEstoque.innerHTML =
            '<span class="text-success fw-semibold">' +
            'Estoque disponível: ' +
            estoqueDisponivel +
            ' ' +
            textoUnidade +
            '</span>';

        quantidadeInput.max =
            String(estoqueDisponivel);

        const quantidade =
            Number(
                quantidadeInput.value
            );

        if (
            quantidadeInput.value !== "" &&
            (
                Number.isNaN(quantidade) ||
                quantidade <= 0
            )
        ) {

            quantidadeInput.setCustomValidity(
                "Informe uma quantidade válida."
            );

        } else if (
            quantidade > estoqueDisponivel
        ) {

            quantidadeInput.setCustomValidity(
                "Estoque insuficiente. Disponível: " +
                estoqueDisponivel +
                "."
            );

            infoEstoque.innerHTML =
                '<span class="text-danger fw-bold">' +
                'Estoque insuficiente. Disponível: ' +
                estoqueDisponivel +
                ' ' +
                textoUnidade +
                '.' +
                '</span>';

        } else {

            quantidadeInput.setCustomValidity(
                ""
            );
        }

        if (btnSalvar) {
            btnSalvar.disabled = false;
        }
    }

    async function carregarProdutos(): Promise<void> {

        if (!produtoInput) {
            return;
        }

        try {

            const resposta: Response =
                await fetch(
                    "../api/produtos.php?acao=listar"
                );

            const resultado:
                RespostaProdutos =
                await lerJson<RespostaProdutos>(
                    resposta,
                    "Erro ao conectar com a API de produtos."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível carregar os produtos."
                );
            }

            produtos.clear();

            resultado.dados.forEach(
                (produto: Produto): void => {

                    produtos.set(
                        Number(produto.id),
                        {
                            ...produto,
                            id: Number(produto.id),
                            preco: Number(produto.preco),
                            estoque: Number(produto.estoque),
                            categoria_id:
                                Number(produto.categoria_id)
                        }
                    );
                }
            );

            produtoInput.innerHTML = "";

            const opcaoInicial =
                document.createElement(
                    "option"
                );

            opcaoInicial.value = "";

            opcaoInicial.textContent =
                "Selecione um produto";

            produtoInput.appendChild(
                opcaoInicial
            );

            resultado.dados.forEach(
                (produto: Produto): void => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(produto.id);

                    const preco =
                        Number(
                            produto.preco
                        )
                            .toFixed(2)
                            .replace(".", ",");

                    option.textContent =
                        produto.nome +
                        " - R$ " +
                        preco +
                        " | Estoque: " +
                        Number(produto.estoque);

                    produtoInput.appendChild(
                        option
                    );
                }
            );

            if (vendaEmEdicao) {

                produtoInput.value =
                    String(
                        vendaEmEdicao.produto_id
                    );
            }

            atualizarInformacoesEstoque();

        } catch (erro: unknown) {

            mostrarMensagem(
                obterMensagemErro(erro),
                "danger"
            );
        }
    }

    async function carregarVendas(): Promise<void> {

        if (!lista) {
            return;
        }

        try {

            const resposta: Response =
                await fetch(
                    "../api/vendas.php?acao=listar"
                );

            const resultado:
                RespostaVendas =
                await lerJson<RespostaVendas>(
                    resposta,
                    "Erro ao conectar com a API de vendas."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível carregar as vendas."
                );
            }

            lista.innerHTML = "";

            if (
                resultado.dados.length === 0
            ) {

                const linha =
                    document.createElement(
                        "tr"
                    );

                const coluna =
                    document.createElement(
                        "td"
                    );

                coluna.colSpan = 7;

                coluna.className =
                    "text-center text-muted py-4";

                coluna.textContent =
                    "Nenhuma venda cadastrada.";

                linha.appendChild(
                    coluna
                );

                lista.appendChild(
                    linha
                );

                return;
            }

            resultado.dados.forEach(
                (venda: Venda): void => {

                    const linha =
                        document.createElement(
                            "tr"
                        );

                    const data =
                        new Date(
                            venda.data_venda.replace(
                                " ",
                                "T"
                            )
                        );

                    const dataFormatada =
                        data.toLocaleString(
                            "pt-BR"
                        );

                    const valores = [
                        String(venda.id),
                        venda.produto,
                        String(venda.quantidade),
                        "R$ " +
                        Number(
                            venda.valor_unitario
                        )
                            .toFixed(2)
                            .replace(".", ","),
                        "R$ " +
                        Number(
                            venda.total
                        )
                            .toFixed(2)
                            .replace(".", ","),
                        dataFormatada
                    ];

                    valores.forEach(
                        (
                            valor: string,
                            indice: number
                        ): void => {

                            const coluna =
                                document.createElement(
                                    "td"
                                );

                            coluna.textContent =
                                valor;

                            if (
                                indice === 4
                            ) {

                                const strong =
                                    document.createElement(
                                        "strong"
                                    );

                                strong.textContent =
                                    valor;

                                coluna.textContent =
                                    "";

                                coluna.appendChild(
                                    strong
                                );
                            }

                            linha.appendChild(
                                coluna
                            );
                        }
                    );

                    const colunaAcoes =
                        document.createElement(
                            "td"
                        );

                    const btnEditar =
                        document.createElement(
                            "button"
                        );

                    btnEditar.type =
                        "button";

                    btnEditar.className =
                        "btn btn-sm btn-warning me-1";

                    btnEditar.textContent =
                        "Editar";

                    btnEditar.dataset.editarVenda =
                        String(venda.id);

                    const btnExcluir =
                        document.createElement(
                            "button"
                        );

                    btnExcluir.type =
                        "button";

                    btnExcluir.className =
                        "btn btn-sm btn-danger";

                    btnExcluir.textContent =
                        "Excluir";

                    btnExcluir.dataset.excluirVenda =
                        String(venda.id);

                    colunaAcoes.appendChild(
                        btnEditar
                    );

                    colunaAcoes.appendChild(
                        btnExcluir
                    );

                    linha.appendChild(
                        colunaAcoes
                    );

                    lista.appendChild(
                        linha
                    );
                }
            );

        } catch (erro: unknown) {

            mostrarMensagem(
                obterMensagemErro(erro),
                "danger"
            );
        }
    }

    async function editarVenda(
        id: number
    ): Promise<void> {

        try {

            const resposta: Response =
                await fetch(
                    "../api/vendas.php?acao=buscar&id=" +
                    encodeURIComponent(
                        String(id)
                    )
                );

            const resultado:
                RespostaVenda =
                await lerJson<RespostaVenda>(
                    resposta,
                    "Erro ao buscar a venda."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível buscar a venda."
                );
            }

            const venda =
                resultado.dados as VendaDetalhes;

            if (
                !idInput ||
                !produtoInput ||
                !quantidadeInput
            ) {
                return;
            }

            vendaEmEdicao = {

                id:
                    Number(venda.id),

                produto_id:
                    Number(venda.produto_id),

                quantidade:
                    Number(venda.quantidade)
            };

            idInput.value =
                String(
                    venda.id
                );

            produtoInput.value =
                String(
                    venda.produto_id
                );

            quantidadeInput.value =
                String(
                    venda.quantidade
                );

            if (
                dataInput &&
                venda.data_venda
            ) {

                dataInput.value =
                    venda.data_venda
                        .replace(
                            " ",
                            "T"
                        )
                        .substring(
                            0,
                            16
                        );
            }

            if (tituloFormulario) {

                tituloFormulario.textContent =
                    "Editar venda";
            }

            atualizarInformacoesEstoque();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (erro: unknown) {

            mostrarMensagem(
                obterMensagemErro(erro),
                "danger"
            );
        }
    }

    if (form) {

        form.addEventListener(
            "submit",
            async (
                event: SubmitEvent
            ): Promise<void> => {

                event.preventDefault();

                if (
                    !idInput ||
                    !produtoInput ||
                    !quantidadeInput ||
                    !dataInput
                ) {
                    return;
                }

                if (
                    !form.checkValidity()
                ) {

                    form.reportValidity();

                    return;
                }

                const quantidade =
                    Number(
                        quantidadeInput.value
                    );

                const produtoId =
                    Number(
                        produtoInput.value
                    );

                const produto =
                    produtos.get(
                        produtoId
                    );

                if (!produto) {

                    mostrarMensagem(
                        "Selecione um produto válido.",
                        "danger"
                    );

                    return;
                }

                let estoqueDisponivel =
                    Number(
                        produto.estoque
                    );

                if (
                    vendaEmEdicao &&
                    vendaEmEdicao.produto_id === produtoId
                ) {

                    estoqueDisponivel +=
                        vendaEmEdicao.quantidade;
                }

                if (
                    quantidade <= 0 ||
                    quantidade > estoqueDisponivel
                ) {

                    mostrarMensagem(
                        "Estoque insuficiente. Disponível: " +
                        estoqueDisponivel +
                        ".",
                        "danger"
                    );

                    atualizarInformacoesEstoque();

                    return;
                }

                try {

                    const dados:
                        DadosVenda = {

                        id:
                            idInput.value
                                ? Number(
                                    idInput.value
                                )
                                : null,

                        produto_id:
                            produtoInput.value,

                        quantidade:
                            quantidadeInput.value,

                        valor_unitario:
                            null,

                        data_venda:
                            dataInput.value
                    };

                    if (btnSalvar) {
                        btnSalvar.disabled = true;
                    }

                    const resposta: Response =
                        await fetch(
                            "../api/vendas.php?acao=salvar",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        dados
                                    )
                            }
                        );

                    const resultado:
                        RespostaVenda =
                        await lerJson<RespostaVenda>(
                            resposta,
                            "Erro ao salvar a venda."
                        );

                    if (!resultado.sucesso) {

                        throw new Error(
                            resultado.mensagem ??
                            "Não foi possível salvar a venda."
                        );
                    }

                    mostrarMensagem(
                        resultado.mensagem ??
                        "Venda salva com sucesso.",
                        "success"
                    );

                    limparFormulario();

                    await carregarVendas();

                    await carregarProdutos();

                } catch (erro: unknown) {

                    mostrarMensagem(
                        obterMensagemErro(erro),
                        "danger"
                    );

                } finally {

                    if (btnSalvar) {
                        btnSalvar.disabled = false;
                    }
                }
            }
        );
    }

    if (produtoInput) {

        produtoInput.addEventListener(
            "change",
            (): void => {

                atualizarInformacoesEstoque();
            }
        );
    }

    if (quantidadeInput) {

        quantidadeInput.addEventListener(
            "input",
            (): void => {

                atualizarInformacoesEstoque();
            }
        );
    }

    async function excluirVenda(
        id: number
    ): Promise<void> {

        const confirmar =
            confirm(
                "Tem certeza que deseja excluir esta venda?"
            );

        if (!confirmar) {
            return;
        }

        try {

            const resposta: Response =
                await fetch(
                    "../api/vendas.php?acao=excluir&id=" +
                    encodeURIComponent(
                        String(id)
                    )
                );

            const resultado:
                RespostaVenda =
                await lerJson<RespostaVenda>(
                    resposta,
                    "Erro ao excluir a venda."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível excluir a venda."
                );
            }

            mostrarMensagem(
                resultado.mensagem ??
                "Venda excluída com sucesso.",
                "success"
            );

            await carregarVendas();

            await carregarProdutos();

        } catch (erro: unknown) {

            mostrarMensagem(
                obterMensagemErro(erro),
                "danger"
            );
        }
    }

    function limparFormulario(): void {

        vendaEmEdicao = null;

        if (idInput) {

            idInput.value =
                "";
        }

        if (produtoInput) {

            produtoInput.value =
                "";
        }

        if (quantidadeInput) {

            quantidadeInput.value =
                "";

            quantidadeInput.removeAttribute(
                "max"
            );

            quantidadeInput.setCustomValidity(
                ""
            );
        }

        if (dataInput) {

            dataInput.value =
                "";
        }

        if (tituloFormulario) {

            tituloFormulario.textContent =
                "Nova venda";
        }

        if (infoEstoque) {

            infoEstoque.innerHTML =
                '<span class="text-muted">' +
                'Selecione um produto para consultar o estoque.' +
                '</span>';
        }

        if (btnSalvar) {
            btnSalvar.disabled = false;
        }
    }

    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            limparFormulario
        );
    }

    function mostrarMensagem(
        texto: string,
        tipo: string
    ): void {

        if (!mensagem) {
            return;
        }

        mensagem.innerHTML =
            '<div class="alert alert-' +
            tipo +
            '">' +
            texto +
            '</div>';

        window.setTimeout(
            (): void => {

                if (mensagem) {

                    mensagem.innerHTML =
                        "";
                }

            },
            4000
        );
    }

    if (lista) {

        lista.addEventListener(
            "click",
            (event: MouseEvent): void => {

                const elemento =
                    event.target as HTMLElement;

                const botaoEditar =
                    elemento.closest(
                        "[data-editar-venda]"
                    ) as HTMLElement | null;

                if (botaoEditar) {

                    const id =
                        Number(
                            botaoEditar.dataset
                                .editarVenda
                        );

                    if (
                        !Number.isNaN(id)
                    ) {

                        void editarVenda(
                            id
                        );
                    }

                    return;
                }

                const botaoExcluir =
                    elemento.closest(
                        "[data-excluir-venda]"
                    ) as HTMLElement | null;

                if (botaoExcluir) {

                    const id =
                        Number(
                            botaoExcluir.dataset
                                .excluirVenda
                        );

                    if (
                        !Number.isNaN(id)
                    ) {

                        void excluirVenda(
                            id
                        );
                    }
                }
            }
        );
    }

    void carregarProdutos();

    void carregarVendas();

})();