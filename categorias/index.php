<?php

require "../templates/admin.php";
require "../templates/header.php";

?>

<div class="categorias-page">

    <div class="categorias-header">

        <div>

            <h2>
                Categorias
            </h2>

            <p>
                Organize os produtos por categorias para facilitar a gestão.
            </p>

        </div>

        <a
            href="../index.php"
            class="btn btn-outline-secondary">

            ← Voltar

        </a>

    </div>

    <div id="mensagem"></div>

    <div class="card categorias-form-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">

                    <span id="tituloFormulario">
                        Nova categoria
                    </span>

                </h5>

                <small>
                    Cadastre uma nova categoria de produtos
                </small>

            </div>

        </div>

        <div class="card-body">

            <form id="formCategoria">

                <input
                    type="hidden"
                    id="id">

                <div class="row g-4 align-items-end">

                    <div class="col-md-9">

                        <label
                            for="nome"
                            class="form-label">

                            Nome da categoria

                        </label>

                        <input
                            type="text"
                            class="form-control"
                            id="nome"
                            placeholder="Digite o nome da categoria"
                            required>

                    </div>

                    <div class="col-md-3">

                        <div class="categorias-form-actions">

                            <button
                                type="submit"
                                class="btn btn-primary">

                                Salvar categoria

                            </button>

                            <button
                                type="button"
                                id="btnCancelar"
                                class="btn btn-light">

                                Cancelar

                            </button>

                        </div>

                    </div>

                </div>

            </form>

        </div>

    </div>

    <div class="card categorias-lista-card">

        <div class="card-header categorias-lista-header">

            <div>

                <h5 class="mb-1">
                    Categorias cadastradas
                </h5>

                <small>
                    Categorias disponíveis no sistema
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table
                    class="table categorias-table align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Nome</th>
                            <th>Ações</th>

                        </tr>

                    </thead>

                    <tbody id="listaCategorias"></tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<script src="../js/categorias.js"></script>

<?php

require "../templates/footer.php";

?>