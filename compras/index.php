<?php

require "../templates/header.php";

?>

<div class="compras-page">

    <div class="compras-header">

        <div>

            <h2>
                Compras
            </h2>

            <p>
                Registre entradas de mercadorias e acompanhe os custos de reposição.
            </p>

        </div>

    </div>

    <div
        id="mensagem"
        class="mb-3">
    </div>

    <div class="card compras-form-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">

                    <span id="tituloFormulario">
                        Nova compra
                    </span>

                </h5>

                <small>
                    Registre uma entrada de mercadoria no estoque.
                </small>

            </div>

        </div>

        <div class="card-body">

            <form id="formCompra">

                <input
                    type="hidden"
                    id="id">

                <div class="row g-4">

                    <div class="col-md-6">

                        <label
                            for="fornecedor"
                            class="form-label">

                            Fornecedor

                        </label>

                        <input
                            type="text"
                            id="fornecedor"
                            class="form-control"
                            maxlength="150"
                            placeholder="Nome do fornecedor">

                    </div>

                    <div class="col-md-6">

                        <label
                            for="data_compra"
                            class="form-label">

                            Data da compra

                        </label>

                        <input
                            type="datetime-local"
                            id="data_compra"
                            class="form-control"
                            required>

                    </div>

                    <div class="col-12">

                        <label
                            for="produto_id"
                            class="form-label">

                            Produto

                        </label>

                        <select
                            id="produto_id"
                            class="form-select"
                            required>

                            <option value="">
                                Selecione um produto
                            </option>

                        </select>

                        <div
                            id="infoProduto"
                            class="produto-info mt-2">

                            Selecione um produto.

                        </div>

                    </div>

                    <div class="col-md-4">

                        <label
                            for="quantidade"
                            class="form-label">

                            Quantidade

                        </label>

                        <input
                            type="number"
                            id="quantidade"
                            class="form-control"
                            min="1"
                            placeholder="0"
                            required>

                    </div>

                    <div class="col-md-4">

                        <label
                            for="custo_unitario"
                            class="form-label">

                            Custo unitário

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                R$
                            </span>

                            <input
                                type="number"
                                id="custo_unitario"
                                class="form-control"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                required>

                        </div>

                    </div>

                    <div class="col-md-4">

                        <label class="form-label">
                            Total da compra
                        </label>

                        <div
                            id="totalCompra"
                            class="form-control compra-total">

                            R$ 0,00

                        </div>

                    </div>

                </div>

                <div class="compra-form-actions mt-4">

                    <button
                        type="submit"
                        id="btnSalvar"
                        class="btn btn-primary">

                        Salvar compra

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

    <div class="card compras-lista-card">

        <div class="card-header compras-lista-header">

            <div>

                <h5 class="mb-1">
                    Compras cadastradas
                </h5>

                <small>
                    Histórico das entradas e respectivos custos.
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table
                    class="table compras-table align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Produto</th>
                            <th>Fornecedor</th>
                            <th>Quantidade</th>
                            <th>Custo unitário</th>
                            <th>Total</th>
                            <th>Data</th>
                            <th>Ações</th>

                        </tr>

                    </thead>

                    <tbody id="listaCompras"></tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<script src="/sistema-vendas/js/compras.js"></script>

<?php

require "../templates/footer.php";

?>