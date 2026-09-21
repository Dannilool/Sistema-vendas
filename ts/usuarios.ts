interface Usuario {
    id: number;
    nome: string;
    email: string;
    perfil: string;
    ativo: number;
    criado_em: string;
}

interface RespostaUsuarios {
    sucesso: boolean;
    dados: Usuario[];
}

interface RespostaUsuario {
    sucesso: boolean;
    mensagem?: string;
    dados?: Usuario;
    id?: number;
    ativo?: number;
}

interface ModalBootstrap {
    show(): void;
    hide(): void;
}

interface BootstrapGlobal {
    Modal: new (
        elemento: HTMLElement
    ) => ModalBootstrap;
}

declare const bootstrap: BootstrapGlobal | undefined;


/* =====================================================
   NAMESPACE USUÁRIOS
   ===================================================== */

namespace UsuariosPagina {

    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const tabelaUsuarios =
        document.getElementById(
            "tabelaUsuarios"
        ) as HTMLTableSectionElement | null;

    const formUsuario =
        document.getElementById(
            "formUsuario"
        ) as HTMLFormElement | null;

    const modalElemento =
        document.getElementById(
            "modalUsuario"
        ) as HTMLElement | null;

    const btnNovoUsuario =
        document.getElementById(
            "btnNovoUsuario"
        ) as HTMLButtonElement | null;

    const btnSalvar =
        document.getElementById(
            "btnSalvar"
        ) as HTMLButtonElement | null;

    const tituloModal =
        document.getElementById(
            "tituloModal"
        ) as HTMLElement | null;

    const mensagem =
        document.getElementById(
            "mensagem"
        ) as HTMLElement | null;

    const mensagemModal =
        document.getElementById(
            "mensagemModal"
        ) as HTMLElement | null;

    const usuarioId =
        document.getElementById(
            "usuarioId"
        ) as HTMLInputElement | null;

    const nome =
        document.getElementById(
            "nome"
        ) as HTMLInputElement | null;

    const email =
        document.getElementById(
            "email"
        ) as HTMLInputElement | null;

    const senha =
        document.getElementById(
            "senha"
        ) as HTMLInputElement | null;

    const perfil =
        document.getElementById(
            "perfil"
        ) as HTMLSelectElement | null;


    /* =====================================================
       MODAL
       ===================================================== */

    let modalUsuario: ModalBootstrap | null = null;


    /* =====================================================
       MENSAGENS
       ===================================================== */

    function mostrarMensagem(
        elemento: HTMLElement | null,
        texto: string,
        tipo: string
    ): void {

        if (elemento === null) {
            return;
        }

        elemento.textContent = texto;

        elemento.className =
            `alert alert-${tipo}`;
    }


    function limparMensagem(
        elemento: HTMLElement | null
    ): void {

        if (elemento === null) {
            return;
        }

        elemento.textContent = "";

        elemento.className =
            "alert d-none";
    }


    /* =====================================================
       CARREGAR USUÁRIOS
       ===================================================== */

    async function carregarUsuarios(): Promise<void> {

        try {

            const resposta =
                await fetch(
                    "../api/usuarios.php?acao=listar"
                );

            if (!resposta.ok) {

                throw new Error(
                    `Erro ao acessar a API de usuários. Status: ${resposta.status}`
                );
            }

            const dados:
                RespostaUsuarios =
                await resposta.json();

            if (!dados.sucesso) {

                throw new Error(
                    "Não foi possível carregar os usuários."
                );
            }

            renderizarUsuarios(
                dados.dados
            );

        } catch (erro: unknown) {

            console.error(
                "Erro ao carregar usuários:",
                erro
            );

            if (tabelaUsuarios !== null) {

                tabelaUsuarios.innerHTML = `
                    <tr>
                        <td
                            colspan="6"
                            class="text-center text-danger py-4">
                            Não foi possível carregar os usuários.
                        </td>
                    </tr>
                `;
            }
        }
    }


    /* =====================================================
       RENDERIZAR USUÁRIOS
       ===================================================== */

    function renderizarUsuarios(
        usuarios: Usuario[]
    ): void {

        if (tabelaUsuarios === null) {
            return;
        }

        tabelaUsuarios.innerHTML = "";

        if (usuarios.length === 0) {

            tabelaUsuarios.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="text-center text-muted py-4">
                        Nenhum usuário cadastrado.
                    </td>
                </tr>
            `;

            return;
        }

        usuarios.forEach(
            (usuario: Usuario): void => {

                const linha =
                    document.createElement("tr");

                const status =
                    usuario.ativo === 1
                        ? `
                            <span
                                class="badge text-bg-success usuario-status">
                                Ativo
                            </span>
                        `
                        : `
                            <span
                                class="badge text-bg-secondary usuario-status">
                                Inativo
                            </span>
                        `;

                const perfilTexto =
                    usuario.perfil === "admin"
                        ? "Administrador"
                        : "Usuário";

                const criado =
                    formatarDataUsuario(
                        usuario.criado_em
                    );

                linha.innerHTML = `

                    <td>
                        ${escaparHTMLUsuario(usuario.nome)}
                    </td>

                    <td>
                        ${escaparHTMLUsuario(usuario.email)}
                    </td>

                    <td>
                        ${perfilTexto}
                    </td>

                    <td>
                        ${status}
                    </td>

                    <td>
                        ${criado}
                    </td>

                    <td>

                        <div class="usuario-acoes">

                            <button
                                type="button"
                                class="btn btn-sm btn-outline-primary"
                                data-acao="editar"
                                data-id="${usuario.id}">

                                Editar

                            </button>

                            <button
                                type="button"
                                class="btn btn-sm ${usuario.ativo === 1
                        ? "btn-outline-danger"
                        : "btn-outline-success"
                    }"
                                data-acao="status"
                                data-id="${usuario.id}">

                                ${usuario.ativo === 1
                        ? "Desativar"
                        : "Ativar"
                    }

                            </button>

                        </div>

                    </td>
                `;

                tabelaUsuarios.appendChild(
                    linha
                );
            }
        );
    }


    /* =====================================================
       NOVO USUÁRIO
       ===================================================== */

    function novoUsuario(): void {

        formUsuario?.reset();

        if (usuarioId !== null) {
            usuarioId.value = "";
        }

        if (tituloModal !== null) {

            tituloModal.textContent =
                "Novo usuário";
        }

        if (senha !== null) {
            senha.value = "";
            senha.required = true;
        }

        limparMensagem(
            mensagemModal
        );

        if (modalUsuario !== null) {

            modalUsuario.show();

        } else {

            console.error(
                "Modal de usuário não foi inicializado."
            );
        }
    }


    /* =====================================================
       EDITAR USUÁRIO
       ===================================================== */

    async function editarUsuario(
        id: number
    ): Promise<void> {

        try {

            const resposta =
                await fetch(
                    `../api/usuarios.php?acao=buscar&id=${id}`
                );

            if (!resposta.ok) {

                throw new Error(
                    "Erro ao buscar usuário."
                );
            }

            const dados:
                RespostaUsuario =
                await resposta.json();

            if (
                !dados.sucesso ||
                !dados.dados
            ) {

                throw new Error(
                    dados.mensagem ||
                    "Usuário não encontrado."
                );
            }

            const usuario =
                dados.dados;

            if (usuarioId !== null) {

                usuarioId.value =
                    usuario.id.toString();
            }

            if (nome !== null) {

                nome.value =
                    usuario.nome;
            }

            if (email !== null) {

                email.value =
                    usuario.email;
            }

            if (perfil !== null) {

                perfil.value =
                    usuario.perfil;
            }

            if (senha !== null) {

                senha.value = "";
                senha.required = false;
            }

            if (tituloModal !== null) {

                tituloModal.textContent =
                    "Editar usuário";
            }

            limparMensagem(
                mensagemModal
            );

            if (modalUsuario === null) {
                console.error(
                    "Modal de usuário não foi inicializado."
                );
                return;
            }

            modalUsuario.show();

        } catch (erro: unknown) {

            const mensagemErro =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao buscar usuário.";

            mostrarMensagem(
                mensagem,
                mensagemErro,
                "danger"
            );
        }
    }


    /* =====================================================
       ALTERAR STATUS
       ===================================================== */

    async function alterarStatus(
        id: number
    ): Promise<void> {

        const confirmar =
            window.confirm(
                "Deseja realmente alterar o status deste usuário?"
            );

        if (!confirmar) {
            return;
        }

        try {

            const resposta =
                await fetch(
                    "../api/usuarios.php?acao=alterar_status",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            id
                        })
                    }
                );

            if (!resposta.ok) {

                throw new Error(
                    "Erro ao alterar status."
                );
            }

            const dados:
                RespostaUsuario =
                await resposta.json();

            if (!dados.sucesso) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível alterar o status."
                );
            }

            mostrarMensagem(
                mensagem,
                dados.mensagem ||
                "Status alterado com sucesso.",
                "success"
            );

            await carregarUsuarios();

        } catch (erro: unknown) {

            const mensagemErro =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao alterar status.";

            mostrarMensagem(
                mensagem,
                mensagemErro,
                "danger"
            );
        }
    }


    /* =====================================================
       SALVAR USUÁRIO
       ===================================================== */

    async function salvarUsuario(): Promise<void> {

        if (
            nome === null ||
            email === null ||
            senha === null ||
            perfil === null
        ) {
            return;
        }

        limparMensagem(
            mensagemModal
        );

        if (btnSalvar !== null) {

            btnSalvar.disabled = true;

            btnSalvar.textContent =
                "Salvando...";
        }

        try {

            const id =
                usuarioId?.value
                    ? Number(usuarioId.value)
                    : null;

            const resposta =
                await fetch(
                    "../api/usuarios.php?acao=salvar",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            id,

                            nome:
                                nome.value.trim(),

                            email:
                                email.value.trim(),

                            senha:
                                senha.value,

                            perfil:
                                perfil.value
                        })
                    }
                );

            if (!resposta.ok) {

                throw new Error(
                    "Erro ao salvar usuário."
                );
            }

            const dados:
                RespostaUsuario =
                await resposta.json();

            if (!dados.sucesso) {

                throw new Error(
                    dados.mensagem ||
                    "Não foi possível salvar o usuário."
                );
            }

            modalUsuario?.hide();

            mostrarMensagem(
                mensagem,
                dados.mensagem ||
                "Usuário salvo com sucesso.",
                "success"
            );

            await carregarUsuarios();

        } catch (erro: unknown) {

            const mensagemErro =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao salvar usuário.";

            mostrarMensagem(
                mensagemModal,
                mensagemErro,
                "danger"
            );

        } finally {

            if (btnSalvar !== null) {

                btnSalvar.disabled = false;

                btnSalvar.textContent =
                    "Salvar";
            }
        }
    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    function configurarEventosUsuario(): void {

        btnNovoUsuario?.addEventListener(
            "click",
            novoUsuario
        );

        formUsuario?.addEventListener(
            "submit",
            (evento: SubmitEvent): void => {

                evento.preventDefault();

                void salvarUsuario();
            }
        );

        tabelaUsuarios?.addEventListener(
            "click",
            (evento: MouseEvent): void => {

                const alvo =
                    evento.target as HTMLElement;

                const botao =
                    alvo.closest(
                        "button"
                    ) as HTMLButtonElement | null;

                if (botao === null) {
                    return;
                }

                const id =
                    Number(
                        botao.dataset.id
                    );

                const acao =
                    botao.dataset.acao;

                if (!id) {
                    return;
                }

                if (acao === "editar") {

                    void editarUsuario(id);
                }

                if (acao === "status") {

                    void alterarStatus(id);
                }
            }
        );
    }


    /* =====================================================
       UTILITÁRIOS
       ===================================================== */

    function escaparHTMLUsuario(
        texto: string
    ): string {

        const elemento =
            document.createElement("div");

        elemento.textContent =
            texto;

        return elemento.innerHTML;
    }


    /* =====================================================
       FORMATAÇÃO DE DATA
       ===================================================== */

    function formatarDataUsuario(
        data: string
    ): string {

        if (!data) {
            return "-";
        }

        const partes: string[] =
            data.split(" ");

        if (partes.length < 2) {
            return data;
        }

        const dataParte: string =
            partes[0]
                .split("-")
                .reverse()
                .join("/");

        return `${dataParte} ${partes[1]}`;
    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    function iniciarUsuarios(): void {

        if (modalElemento === null) {
            console.error(
                "Elemento #modalUsuario não encontrado."
            );
        } else if (typeof bootstrap === "undefined") {
            console.error(
                "Bootstrap não foi carregado."
            );
        } else {
            modalUsuario =
                new bootstrap.Modal(
                    modalElemento
                );
        }

        configurarEventosUsuario();

        void carregarUsuarios();
    }


    iniciarUsuarios();
}