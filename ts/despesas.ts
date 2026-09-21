((): void => {

    interface Despesa {
        id: number;
        categoria: string;
        descricao: string | null;
        valor: number;
        data_despesa: string;
    }

    interface Resposta<T> {
        sucesso: boolean;
        mensagem?: string;
        dados: T;
        id?: number;
    }


    const form =
        document.getElementById(
            "formDespesa"
        ) as HTMLFormElement | null;

    const idInput =
        document.getElementById(
            "id"
        ) as HTMLInputElement | null;

    const categoriaInput =
        document.getElementById(
            "categoria"
        ) as HTMLInputElement | null;

    const descricaoInput =
        document.getElementById(
            "descricao"
        ) as HTMLInputElement | null;

    const valorInput =
        document.getElementById(
            "valor"
        ) as HTMLInputElement | null;

    const dataInput =
        document.getElementById(
            "data_despesa"
        ) as HTMLInputElement | null;

    const lista =
        document.getElementById(
            "listaDespesas"
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


    function formatarMoeda(
        valor: number
    ): string {

        return Number(valor)
            .toFixed(2)
            .replace(".", ",");
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


    async function carregarDespesas(): Promise<void> {

        if (!lista) {
            return;
        }

        try {

            const resposta =
                await fetch(
                    "../api/despesas.php?acao=listar"
                );

            const resultado =
                await lerJson<
                    Resposta<Despesa[]>
                >(
                    resposta,
                    "Erro ao carregar despesas."
                );


            if (!resultado.sucesso) {
                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível carregar as despesas."
                );
            }


            lista.innerHTML = "";


            if (
                resultado.dados.length === 0
            ) {

                lista.innerHTML =
                    '<tr>' +
                    '<td colspan="6" ' +
                    'class="text-center text-muted py-4">' +
                    'Nenhuma despesa cadastrada.' +
                    '</td>' +
                    '</tr>';

                return;
            }


            resultado.dados.forEach(
                (
                    despesa: Despesa
                ): void => {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    const valores = [
                        String(despesa.id),
                        despesa.categoria,
                        despesa.descricao ?? "—",
                        "R$ " +
                        formatarMoeda(
                            Number(
                                despesa.valor
                            )
                        ),
                        new Date(
                            despesa.data_despesa
                                .replace(
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

                    btnEditar.dataset.editarDespesa =
                        String(
                            despesa.id
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

                    btnExcluir.dataset.excluirDespesa =
                        String(
                            despesa.id
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
                erro instanceof Error
                    ? erro.message
                    : "Erro inesperado.",
                "danger"
            );
        }
    }


    async function editarDespesa(
        id: number
    ): Promise<void> {

        try {

            const resposta =
                await fetch(
                    "../api/despesas.php?acao=buscar&id=" +
                    encodeURIComponent(
                        String(id)
                    )
                );


            const resultado =
                await lerJson<
                    Resposta<Despesa>
                >(
                    resposta,
                    "Erro ao buscar despesa."
                );


            const despesa =
                resultado.dados;


            if (
                !idInput ||
                !categoriaInput ||
                !descricaoInput ||
                !valorInput ||
                !dataInput
            ) {
                return;
            }


            idInput.value =
                String(despesa.id);

            categoriaInput.value =
                despesa.categoria;

            descricaoInput.value =
                despesa.descricao ?? "";

            valorInput.value =
                String(despesa.valor);

            dataInput.value =
                despesa.data_despesa
                    .replace(
                        " ",
                        "T"
                    )
                    .substring(
                        0,
                        16
                    );


            if (titulo) {
                titulo.textContent =
                    "Editar despesa";
            }


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (erro: unknown) {

            mostrarMensagem(
                erro instanceof Error
                    ? erro.message
                    : "Erro inesperado.",
                "danger"
            );
        }
    }


    async function excluirDespesa(
        id: number
    ): Promise<void> {

        if (
            !confirm(
                "Tem certeza que deseja excluir esta despesa?"
            )
        ) {
            return;
        }


        try {

            const resposta =
                await fetch(
                    "../api/despesas.php?acao=excluir&id=" +
                    encodeURIComponent(
                        String(id)
                    )
                );


            const resultado =
                await lerJson<
                    Resposta<Despesa>
                >(
                    resposta,
                    "Erro ao excluir despesa."
                );


            if (!resultado.sucesso) {
                throw new Error(
                    resultado.mensagem ??
                    "Não foi possível excluir a despesa."
                );
            }


            mostrarMensagem(
                resultado.mensagem ??
                "Despesa excluída com sucesso.",
                "success"
            );


            await carregarDespesas();

        } catch (erro: unknown) {

            mostrarMensagem(
                erro instanceof Error
                    ? erro.message
                    : "Erro inesperado.",
                "danger"
            );
        }
    }


    function limparFormulario(): void {

        if (idInput) {
            idInput.value = "";
        }

        if (categoriaInput) {
            categoriaInput.value = "";
        }

        if (descricaoInput) {
            descricaoInput.value = "";
        }

        if (valorInput) {
            valorInput.value = "";
        }

        if (dataInput) {
            dataInput.value = "";
        }

        if (titulo) {
            titulo.textContent =
                "Nova despesa";
        }
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
                    !categoriaInput ||
                    !valorInput ||
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

                        categoria:
                            categoriaInput.value,

                        descricao:
                            descricaoInput?.value ??
                            "",

                        valor:
                            valorInput.value,

                        data_despesa:
                            dataInput.value
                    };


                    const resposta =
                        await fetch(
                            "../api/despesas.php?acao=salvar",
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
                            Resposta<Despesa>
                        >(
                            resposta,
                            "Erro ao salvar despesa."
                        );


                    if (!resultado.sucesso) {
                        throw new Error(
                            resultado.mensagem ??
                            "Não foi possível salvar a despesa."
                        );
                    }


                    mostrarMensagem(
                        resultado.mensagem ??
                        "Despesa salva com sucesso.",
                        "success"
                    );


                    limparFormulario();

                    await carregarDespesas();

                } catch (erro: unknown) {

                    mostrarMensagem(
                        erro instanceof Error
                            ? erro.message
                            : "Erro inesperado.",
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
                        "[data-editar-despesa]"
                    ) as HTMLElement | null;


                if (editar) {

                    const id =
                        Number(
                            editar.dataset
                                .editarDespesa
                        );

                    if (
                        !Number.isNaN(id)
                    ) {
                        void editarDespesa(id);
                    }

                    return;
                }


                const excluir =
                    elemento.closest(
                        "[data-excluir-despesa]"
                    ) as HTMLElement | null;


                if (excluir) {

                    const id =
                        Number(
                            excluir.dataset
                                .excluirDespesa
                        );

                    if (
                        !Number.isNaN(id)
                    ) {
                        void excluirDespesa(id);
                    }
                }
            }
        );
    }


    void carregarDespesas();

})();