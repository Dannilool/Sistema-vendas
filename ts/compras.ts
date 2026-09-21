((): void => {

    interface Produto {
        id: number;
        nome: string;
        preco: number;
        estoque: number;
        custo_reposicao: number;
        categoria_id: number;
        categoria: string;
    }

    interface Compra {
        id: number;
        fornecedor: string | null;
        data_compra: string;
        total: number;
        produto_id: number;
        produto: string;
        quantidade: number;
        custo_unitario: number;
    }

    interface Resposta<T> {
        sucesso: boolean;
        mensagem?: string;
        dados: T;
        id?: number;
    }


    const form =
        document.getElementById(
            "formCompra"
        ) as HTMLFormElement | null;

    const idInput =
        document.getElementById(
            "id"
        ) as HTMLInputElement | null;

    const fornecedorInput =
        document.getElementById(
            "fornecedor"
        ) as HTMLInputElement | null;

    const dataInput =
        document.getElementById(
            "data_compra"
        ) as HTMLInputElement | null;

    const produtoInput =
        document.getElementById(
            "produto_id"
        ) as HTMLSelectElement | null;

    const quantidadeInput =
        document.getElementById(
            "quantidade"
        ) as HTMLInputElement | null;

    const custoInput =
        document.getElementById(
            "custo_unitario"
        ) as HTMLInputElement | null;

    const totalCompra =
        document.getElementById(
            "totalCompra"
        ) as HTMLElement | null;

    const infoProduto =
        document.getElementById(
            "infoProduto"
        ) as HTMLElement | null;

    const lista =
        document.getElementById(
            "listaCompras"
        ) as HTMLElement | null;

    const mensagem =
        document.getElementById(
            "mensagem"
        ) as HTMLElement | null;

    const titulo =
        document.getElementById(
            "tituloFormulario"
        ) as HTMLElement | null;

    const btnCancelar =
        document.getElementById(
            "btnCancelar"
        ) as HTMLButtonElement | null;

    const btnSalvar =
        document.getElementById(
            "btnSalvar"
        ) as HTMLButtonElement | null;


    const produtos =
        new Map<number, Produto>();


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

        window.setTimeout((): void => {

            if (mensagem) {
                mensagem.innerHTML = "";
            }

        }, 4000);
    }


    function obterErro(
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

            resultado =
                await resposta.json();

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


    function formatarMoeda(
        valor: number
    ): string {

        return Number(valor)
            .toFixed(2)
            .replace(".", ",");
    }


    function atualizarTotal(): void {

        if (
            !quantidadeInput ||
            !custoInput ||
            !totalCompra
        ) {
            return;
        }

        const quantidade =
            Number(
                quantidadeInput.value
            );

        const custo =
            Number(
                custoInput.value
            );

        const total =
            (
                Number.isFinite(quantidade)
                ? quantidade
                : 0
            ) *
            (
                Number.isFinite(custo)
                ? custo
                : 0
            );

        totalCompra.textContent =
            "R$ " +
            formatarMoeda(total);
    }


    function atualizarProduto(): void {

        if (
            !produtoInput ||
            !infoProduto
        ) {
            return;
        }

        const produtoId =
            Number(
                produtoInput.value
            );

        if (!produtoInput.value) {

            infoProduto.innerHTML =
                "Selecione um produto.";

            return;
        }

        const produto =
            produtos.get(
                produtoId
            );

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
            formatarMoeda(
                Number(produto.custo_reposicao)
            ) +
            '</span>';


        if (
            custoInput &&
            !custoInput.value &&
            Number(produto.custo_reposicao) > 0
        ) {

            custoInput.value =
                String(
                    produto.custo_reposicao
                );

            atualizarTotal();
        }
    }


    async function carregarProdutos(): Promise<void> {

        if (!produtoInput) {
            return;
        }

        try {

            const resposta =
                await fetch(
                    "../api/produtos.php?acao=listar"
                );

            const resultado =
                await lerJson<
                    Resposta<Produto[]>
                >(
                    resposta,
                    "Erro ao carregar produtos."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível carregar os produtos."
                );
            }

            produtos.clear();

            produtoInput.innerHTML =
                '<option value="">' +
                'Selecione um produto' +
                '</option>';


            resultado.dados.forEach(
                (
                    produto: Produto
                ): void => {

                    produtos.set(
                        Number(produto.id),
                        {
                            ...produto,
                            id:
                                Number(produto.id),
                            estoque:
                                Number(produto.estoque),
                            preco:
                                Number(produto.preco),
                            custo_reposicao:
                                Number(
                                    produto.custo_reposicao
                                )
                        }
                    );


                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(produto.id);

                    option.textContent =
                        produto.nome +
                        " | Estoque: " +
                        Number(produto.estoque);

                    produtoInput.appendChild(
                        option
                    );
                }
            );

            atualizarProduto();

        } catch (erro: unknown) {

            mostrarMensagem(
                obterErro(erro),
                "danger"
            );
        }
    }


    async function carregarCompras(): Promise<void> {

        if (!lista) {
            return;
        }

        try {

            const resposta =
                await fetch(
                    "../api/compras.php?acao=listar"
                );

            const resultado =
                await lerJson<
                    Resposta<Compra[]>
                >(
                    resposta,
                    "Erro ao carregar compras."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível carregar as compras."
                );
            }

            lista.innerHTML = "";


            if (
                resultado.dados.length === 0
            ) {

                lista.innerHTML =
                    '<tr>' +
                    '<td colspan="8" ' +
                    'class="text-center text-muted py-4">' +
                    'Nenhuma compra cadastrada.' +
                    '</td>' +
                    '</tr>';

                return;
            }


            resultado.dados.forEach(
                (
                    compra: Compra
                ): void => {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    const valores: string[] = [

                        String(
                            compra.id
                        ),

                        compra.produto,

                        compra.fornecedor ??
                        "—",

                        String(
                            compra.quantidade
                        ),

                        "R$ " +
                        formatarMoeda(
                            Number(
                                compra.custo_unitario
                            )
                        ),

                        "R$ " +
                        formatarMoeda(
                            Number(
                                compra.total
                            )
                        ),

                        new Date(
                            compra.data_compra.replace(
                                " ",
                                "T"
                            )
                        ).toLocaleString(
                            "pt-BR"
                        )
                    ];


                    valores.forEach(
                        (
                            valor: string
                        ): void => {

                            const td =
                                document.createElement(
                                    "td"
                                );

                            td.textContent =
                                valor;

                            tr.appendChild(
                                td
                            );
                        }
                    );


                    const tdAcoes =
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

                    btnEditar.dataset.editarCompra =
                        String(
                            compra.id
                        );


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

                    btnExcluir.dataset.excluirCompra =
                        String(
                            compra.id
                        );


                    tdAcoes.appendChild(
                        btnEditar
                    );

                    tdAcoes.appendChild(
                        btnExcluir
                    );

                    tr.appendChild(
                        tdAcoes
                    );

                    lista.appendChild(
                        tr
                    );
                }
            );

        } catch (erro: unknown) {

            mostrarMensagem(
                obterErro(erro),
                "danger"
            );
        }
    }


    async function editarCompra(
        id: number
    ): Promise<void> {

        try {

            const resposta =
                await fetch(
                    "../api/compras.php?acao=buscar&id=" +
                    encodeURIComponent(
                        String(id)
                    )
                );

            const resultado =
                await lerJson<
                    Resposta<Compra>
                >(
                    resposta,
                    "Erro ao buscar compra."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível buscar a compra."
                );
            }


            const compra =
                resultado.dados;


            if (
                !idInput ||
                !fornecedorInput ||
                !dataInput ||
                !produtoInput ||
                !quantidadeInput ||
                !custoInput
            ) {
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
                String(
                    Number(
                        compra.custo_unitario
                    )
                );

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

        } catch (erro: unknown) {

            mostrarMensagem(
                obterErro(erro),
                "danger"
            );
        }
    }


    async function excluirCompra(
        id: number
    ): Promise<void> {

        if (
            !confirm(
                "Tem certeza que deseja excluir esta compra?"
            )
        ) {
            return;
        }


        try {

            const resposta =
                await fetch(
                    "../api/compras.php?acao=excluir&id=" +
                    encodeURIComponent(
                        String(id)
                    )
                );

            const resultado =
                await lerJson<
                    Resposta<Compra>
                >(
                    resposta,
                    "Erro ao excluir compra."
                );

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível excluir a compra."
                );
            }


            mostrarMensagem(
                resultado.mensagem ??
                "Compra excluída com sucesso.",
                "success"
            );


            await carregarProdutos();

            await carregarCompras();

        } catch (erro: unknown) {

            mostrarMensagem(
                obterErro(erro),
                "danger"
            );
        }
    }


    function limparFormulario(): void {

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

        produtoInput.addEventListener(
            "change",
            atualizarProduto
        );
    }


    if (quantidadeInput) {

        quantidadeInput.addEventListener(
            "input",
            atualizarTotal
        );
    }


    if (custoInput) {

        custoInput.addEventListener(
            "input",
            atualizarTotal
        );
    }


    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            limparFormulario
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            async (
                event: SubmitEvent
            ): Promise<void> => {

                event.preventDefault();


                if (
                    !produtoInput ||
                    !quantidadeInput ||
                    !custoInput ||
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

                const custo =
                    Number(
                        custoInput.value
                    );

                const produtoId =
                    Number(
                        produtoInput.value
                    );


                if (
                    quantidade <= 0 ||
                    custo < 0 ||
                    !produtoId
                ) {

                    mostrarMensagem(
                        "Preencha os dados corretamente.",
                        "danger"
                    );

                    return;
                }


                try {

                    if (btnSalvar) {
                        btnSalvar.disabled = true;
                    }


                    const dados = {

                        id:
                            idInput?.value
                                ? Number(
                                    idInput.value
                                )
                                : null,

                        fornecedor:
                            fornecedorInput?.value ??
                            "",

                        produto_id:
                            produtoInput.value,

                        quantidade:
                            quantidadeInput.value,

                        custo_unitario:
                            custoInput.value,

                        data_compra:
                            dataInput.value
                    };


                    const resposta =
                        await fetch(
                            "../api/compras.php?acao=salvar",
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


                    const resultado =
                        await lerJson<
                            Resposta<Compra>
                        >(
                            resposta,
                            "Erro ao salvar compra."
                        );


                    if (!resultado.sucesso) {

                        throw new Error(
                            resultado.mensagem ??
                            "Não foi possível salvar a compra."
                        );
                    }


                    mostrarMensagem(
                        resultado.mensagem ??
                        "Compra salva com sucesso.",
                        "success"
                    );


                    limparFormulario();

                    await carregarProdutos();

                    await carregarCompras();

                } catch (erro: unknown) {

                    mostrarMensagem(
                        obterErro(erro),
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


    if (lista) {

        lista.addEventListener(
            "click",
            (
                event: MouseEvent
            ): void => {

                const elemento =
                    event.target as HTMLElement;


                const editar =
                    elemento.closest(
                        "[data-editar-compra]"
                    ) as HTMLElement | null;


                if (editar) {

                    const id =
                        Number(
                            editar.dataset
                                .editarCompra
                        );

                    if (
                        !Number.isNaN(id)
                    ) {
                        void editarCompra(id);
                    }

                    return;
                }


                const excluir =
                    elemento.closest(
                        "[data-excluir-compra]"
                    ) as HTMLElement | null;


                if (excluir) {

                    const id =
                        Number(
                            excluir.dataset
                                .excluirCompra
                        );

                    if (
                        !Number.isNaN(id)
                    ) {
                        void excluirCompra(id);
                    }
                }
            }
        );
    }


    void carregarProdutos();

    void carregarCompras();

})();