<?php

require "../templates/admin.php";
require "../templates/header.php";

?>

<div class="produtos-page">

    <div class="produtos-header">

        <div>

            <h2>
                Produtos
            </h2>

            <p>
                Cadastre, edite e acompanhe os produtos do seu estoque.
            </p>

        </div>

        <a
            href="../index.php"
            class="btn btn-outline-secondary">

            ← Voltar

        </a>

    </div>

    <div id="mensagem"></div>

    <div class="card produtos-form-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">
                    <span id="tituloFormulario">
                        Novo produto
                    </span>
                </h5>

                <small>
                    Preencha as informações do produto
                </small>

            </div>

        </div>

        <div class="card-body">

            <form id="formProduto">

                <input
                    type="hidden"
                    id="id">

                <div class="row g-4">

                    <div class="col-md-12">

                        <label
                            for="nome"
                            class="form-label">

                            Nome do produto

                        </label>

                        <input
                            type="text"
                            class="form-control"
                            id="nome"
                            placeholder="Digite o nome do produto"
                            required>

                    </div>

                    <div class="col-md-6 col-xl-3">

                        <label
                            for="preco"
                            class="form-label">

                            Preço de venda

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                R$
                            </span>

                            <input
                                type="number"
                                class="form-control"
                                id="preco"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                required>

                        </div>

                    </div>

                    <div class="col-md-6 col-xl-3">

                        <label
                            for="custo_reposicao"
                            class="form-label">

                            Custo de reposição

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                R$
                            </span>

                            <input
                                type="number"
                                class="form-control"
                                id="custo_reposicao"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                required>

                        </div>

                        <div class="form-text">
                            Valor para repor o produto.
                        </div>

                    </div>

                    <div class="col-md-6 col-xl-3">

                        <label
                            for="estoque"
                            class="form-label">

                            Estoque

                        </label>

                        <input
                            type="number"
                            class="form-control"
                            id="estoque"
                            min="0"
                            step="1"
                            placeholder="0"
                            required>

                    </div>

                    <div class="col-md-6 col-xl-3">

                        <label
                            for="categoria_id"
                            class="form-label">

                            Categoria

                        </label>

                        <select
                            id="categoria_id"
                            class="form-select"
                            required>

                            <option value="">
                                Selecione uma categoria
                            </option>

                        </select>

                    </div>

                </div>

                <div class="produto-form-actions mt-4">

                    <button
                        type="submit"
                        class="btn btn-primary">

                        Salvar produto

                    </button>

                    <button
                        type="button"
                        id="btnCancelar"
                        class="btn btn-light">

                        Cancelar

                    </button>

                </div>

            </form>

        </div>

    </div>

    <div class="card produtos-lista-card">

        <div class="card-header produtos-lista-header">

            <div>

                <h5 class="mb-1">
                    Produtos cadastrados
                </h5>

                <small>
                    Visualização do estoque e margem dos produtos
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table
                    class="table produtos-table align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Produto</th>
                            <th>Custo</th>
                            <th>Venda</th>
                            <th>Lucro</th>
                            <th>Margem</th>
                            <th>Estoque</th>
                            <th>Categoria</th>
                            <th>Ações</th>

                        </tr>

                    </thead>

                    <tbody id="listaProdutos"></tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<script src="../js/produtos.js"></script>

<?php

require "../templates/footer.php";

?>