<?php

require "../templates/admin.php";
require "../templates/header.php";

?>

<link
    rel="stylesheet"
    href="../assets/css/usuarios.css">

<div class="usuarios-page">

    <div class="usuarios-header">

        <div>

            <h2>
                Usuários
            </h2>

            <p>
                Gerencie os usuários e os níveis de acesso ao sistema.
            </p>

        </div>

        <button
            type="button"
            id="btnNovoUsuario"
            class="btn btn-primary">

            + Novo usuário

        </button>

    </div>

    <div
        id="mensagem"
        class="alert d-none"
        role="alert">
    </div>

    <div class="card usuarios-lista-card">

        <div class="card-header">

            <div>

                <h5 class="mb-1">
                    Usuários cadastrados
                </h5>

                <small>
                    Consulte os usuários, perfis e status de acesso.
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table class="table usuarios-table align-middle">

                    <thead>

                        <tr>

                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Perfil</th>
                            <th>Status</th>
                            <th>Criado em</th>

                            <th class="text-end">
                                Ações
                            </th>

                        </tr>

                    </thead>

                    <tbody id="tabelaUsuarios">

                        <tr>

                            <td
                                colspan="6"
                                class="text-center text-muted py-4">

                                Carregando...

                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<div
    class="modal fade"
    id="modalUsuario"
    tabindex="-1"
    aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content usuario-modal">

            <div class="modal-header">

                <div>

                    <h5
                        class="modal-title"
                        id="tituloModal">

                        Novo usuário

                    </h5>

                    <small>
                        Preencha os dados de acesso.
                    </small>

                </div>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Fechar">
                </button>

            </div>

            <form id="formUsuario">

                <div class="modal-body">

                    <input
                        type="hidden"
                        id="usuarioId">

                    <div class="mb-3">

                        <label
                            for="nome"
                            class="form-label">

                            Nome

                        </label>

                        <input
                            type="text"
                            id="nome"
                            class="form-control"
                            placeholder="Nome do usuário"
                            required>

                    </div>

                    <div class="mb-3">

                        <label
                            for="email"
                            class="form-label">

                            E-mail

                        </label>

                        <input
                            type="email"
                            id="email"
                            class="form-control"
                            placeholder="usuario@exemplo.com"
                            required>

                    </div>

                    <div class="mb-3">

                        <label
                            for="senha"
                            class="form-label">

                            Senha

                        </label>

                        <input
                            type="password"
                            id="senha"
                            class="form-control"
                            placeholder="Digite a senha"
                            minlength="6">

                        <div
                            id="ajudaSenha"
                            class="form-text">

                            Mínimo de 6 caracteres.

                        </div>

                    </div>

                    <div class="mb-3">

                        <label
                            for="perfil"
                            class="form-label">

                            Perfil

                        </label>

                        <select
                            id="perfil"
                            class="form-select"
                            required>

                            <option value="usuario">
                                Usuário
                            </option>

                            <option value="admin">
                                Administrador
                            </option>

                        </select>

                    </div>

                    <div
                        id="mensagemModal"
                        class="alert d-none"
                        role="alert">
                    </div>

                </div>

                <div class="modal-footer">

                    <button
                        type="button"
                        class="btn btn-light"
                        data-bs-dismiss="modal">

                        Cancelar

                    </button>

                    <button
                        type="submit"
                        id="btnSalvar"
                        class="btn btn-primary">

                        Salvar

                    </button>

                </div>

            </form>

        </div>

    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>

<script src="../js/usuarios.js"></script>

<?php

require "../templates/footer.php";

?>