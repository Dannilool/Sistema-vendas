"use strict";
/* =====================================================
   NAMESPACE USUÁRIOS
   ===================================================== */
var UsuariosPagina;
(function (UsuariosPagina) {
    /* =====================================================
       ELEMENTOS
       ===================================================== */
    const tabelaUsuarios = document.getElementById("tabelaUsuarios");
    const formUsuario = document.getElementById("formUsuario");
    const modalElemento = document.getElementById("modalUsuario");
    const btnNovoUsuario = document.getElementById("btnNovoUsuario");
    const btnSalvar = document.getElementById("btnSalvar");
    const tituloModal = document.getElementById("tituloModal");
    const mensagem = document.getElementById("mensagem");
    const mensagemModal = document.getElementById("mensagemModal");
    const usuarioId = document.getElementById("usuarioId");
    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    const perfil = document.getElementById("perfil");
    /* =====================================================
       MODAL
       ===================================================== */
    let modalUsuario = null;
    /* =====================================================
       MENSAGENS
       ===================================================== */
    function mostrarMensagem(elemento, texto, tipo) {
        if (elemento === null) {
            return;
        }
        elemento.textContent = texto;
        elemento.className =
            `alert alert-${tipo}`;
    }
    function limparMensagem(elemento) {
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
    async function carregarUsuarios() {
        try {
            const resposta = await fetch("../api/usuarios.php?acao=listar");
            if (!resposta.ok) {
                throw new Error(`Erro ao acessar a API de usuários. Status: ${resposta.status}`);
            }
            const dados = await resposta.json();
            if (!dados.sucesso) {
                throw new Error("Não foi possível carregar os usuários.");
            }
            renderizarUsuarios(dados.dados);
        }
        catch (erro) {
            console.error("Erro ao carregar usuários:", erro);
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
    function renderizarUsuarios(usuarios) {
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
        usuarios.forEach((usuario) => {
            const linha = document.createElement("tr");
            const status = usuario.ativo === 1
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
            const perfilTexto = usuario.perfil === "admin"
                ? "Administrador"
                : "Usuário";
            const criado = formatarDataUsuario(usuario.criado_em);
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
                : "btn-outline-success"}"
                                data-acao="status"
                                data-id="${usuario.id}">

                                ${usuario.ativo === 1
                ? "Desativar"
                : "Ativar"}

                            </button>

                        </div>

                    </td>
                `;
            tabelaUsuarios.appendChild(linha);
        });
    }
    /* =====================================================
       NOVO USUÁRIO
       ===================================================== */
    function novoUsuario() {
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
        limparMensagem(mensagemModal);
        if (modalUsuario !== null) {
            modalUsuario.show();
        }
        else {
            console.error("Modal de usuário não foi inicializado.");
        }
    }
    /* =====================================================
       EDITAR USUÁRIO
       ===================================================== */
    async function editarUsuario(id) {
        try {
            const resposta = await fetch(`../api/usuarios.php?acao=buscar&id=${id}`);
            if (!resposta.ok) {
                throw new Error("Erro ao buscar usuário.");
            }
            const dados = await resposta.json();
            if (!dados.sucesso ||
                !dados.dados) {
                throw new Error(dados.mensagem ||
                    "Usuário não encontrado.");
            }
            const usuario = dados.dados;
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
            limparMensagem(mensagemModal);
            if (modalUsuario === null) {
                console.error("Modal de usuário não foi inicializado.");
                return;
            }
            modalUsuario.show();
        }
        catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Erro ao buscar usuário.";
            mostrarMensagem(mensagem, mensagemErro, "danger");
        }
    }
    /* =====================================================
       ALTERAR STATUS
       ===================================================== */
    async function alterarStatus(id) {
        const confirmar = window.confirm("Deseja realmente alterar o status deste usuário?");
        if (!confirmar) {
            return;
        }
        try {
            const resposta = await fetch("../api/usuarios.php?acao=alterar_status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id
                })
            });
            if (!resposta.ok) {
                throw new Error("Erro ao alterar status.");
            }
            const dados = await resposta.json();
            if (!dados.sucesso) {
                throw new Error(dados.mensagem ||
                    "Não foi possível alterar o status.");
            }
            mostrarMensagem(mensagem, dados.mensagem ||
                "Status alterado com sucesso.", "success");
            await carregarUsuarios();
        }
        catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Erro ao alterar status.";
            mostrarMensagem(mensagem, mensagemErro, "danger");
        }
    }
    /* =====================================================
       SALVAR USUÁRIO
       ===================================================== */
    async function salvarUsuario() {
        if (nome === null ||
            email === null ||
            senha === null ||
            perfil === null) {
            return;
        }
        limparMensagem(mensagemModal);
        if (btnSalvar !== null) {
            btnSalvar.disabled = true;
            btnSalvar.textContent =
                "Salvando...";
        }
        try {
            const id = usuarioId?.value
                ? Number(usuarioId.value)
                : null;
            const resposta = await fetch("../api/usuarios.php?acao=salvar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id,
                    nome: nome.value.trim(),
                    email: email.value.trim(),
                    senha: senha.value,
                    perfil: perfil.value
                })
            });
            if (!resposta.ok) {
                throw new Error("Erro ao salvar usuário.");
            }
            const dados = await resposta.json();
            if (!dados.sucesso) {
                throw new Error(dados.mensagem ||
                    "Não foi possível salvar o usuário.");
            }
            modalUsuario?.hide();
            mostrarMensagem(mensagem, dados.mensagem ||
                "Usuário salvo com sucesso.", "success");
            await carregarUsuarios();
        }
        catch (erro) {
            const mensagemErro = erro instanceof Error
                ? erro.message
                : "Erro ao salvar usuário.";
            mostrarMensagem(mensagemModal, mensagemErro, "danger");
        }
        finally {
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
    function configurarEventosUsuario() {
        btnNovoUsuario?.addEventListener("click", novoUsuario);
        formUsuario?.addEventListener("submit", (evento) => {
            evento.preventDefault();
            void salvarUsuario();
        });
        tabelaUsuarios?.addEventListener("click", (evento) => {
            const alvo = evento.target;
            const botao = alvo.closest("button");
            if (botao === null) {
                return;
            }
            const id = Number(botao.dataset.id);
            const acao = botao.dataset.acao;
            if (!id) {
                return;
            }
            if (acao === "editar") {
                void editarUsuario(id);
            }
            if (acao === "status") {
                void alterarStatus(id);
            }
        });
    }
    /* =====================================================
       UTILITÁRIOS
       ===================================================== */
    function escaparHTMLUsuario(texto) {
        const elemento = document.createElement("div");
        elemento.textContent =
            texto;
        return elemento.innerHTML;
    }
    /* =====================================================
       FORMATAÇÃO DE DATA
       ===================================================== */
    function formatarDataUsuario(data) {
        if (!data) {
            return "-";
        }
        const partes = data.split(" ");
        if (partes.length < 2) {
            return data;
        }
        const dataParte = partes[0]
            .split("-")
            .reverse()
            .join("/");
        return `${dataParte} ${partes[1]}`;
    }
    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */
    function iniciarUsuarios() {
        if (modalElemento === null) {
            console.error("Elemento #modalUsuario não encontrado.");
        }
        else if (typeof bootstrap === "undefined") {
            console.error("Bootstrap não foi carregado.");
        }
        else {
            modalUsuario =
                new bootstrap.Modal(modalElemento);
        }
        configurarEventosUsuario();
        void carregarUsuarios();
    }
    iniciarUsuarios();
})(UsuariosPagina || (UsuariosPagina = {}));
