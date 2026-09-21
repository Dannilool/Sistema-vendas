<?php

require "../templates/header.php";

?>

<div class="vendas-page">

    <div class="vendas-header">

        <div>

            <h2>
                Vendas
            </h2>

            <p>
                Registre e acompanhe as vendas realizadas no sistema.
            </p>

        </div>

    </div>

    <div
        id="mensagem"
        class="alert d-none"
        role="alert">
    </div>

    <div class="card vendas-form-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">

                    <span id="tituloFormulario">
                        Nova venda
                    </span>

                </h5>

                <small>
                    Registre uma nova venda e acompanhe o estoque disponível.
                </small>

            </div>

        </div>

        <div class="card-body">

            <form id="formVenda">

                <input
                    type="hidden"
                    id="id">

                <div class="row g-4">

                    <div class="col-md-7">

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

                    </div>

                    <div class="col-md-5">

                        <label
                            for="quantidade"
                            class="form-label">

                            Quantidade

                        </label>

                        <input
                            type="number"
                            class="form-control"
                            id="quantidade"
                            min="1"
                            placeholder="Informe a quantidade"
                            required>

                    </div>

                    <div class="col-md-6">

                        <label
                            for="data_venda"
                            class="form-label">

                            Data da venda

                        </label>

                        <input
                            type="datetime-local"
                            class="form-control"
                            id="data_venda">

                    </div>

                </div>

                <div class="venda-form-actions mt-4">

                    <button
                        type="submit"
                        class="btn btn-primary">

                        Salvar venda

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

    <div class="card vendas-lista-card">

        <div class="card-header vendas-lista-header">

            <div>

                <h5 class="mb-1">
                    Vendas cadastradas
                </h5>

                <small>
                    Histórico das vendas registradas no sistema.
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table
                    class="table vendas-table align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Valor unitário</th>
                            <th>Total</th>
                            <th>Data</th>
                            <th>Ações</th>

                        </tr>

                    </thead>

                    <tbody id="listaVendas"></tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<script src="/sistema-vendas/js/vendas.js"></script>

<?php

require "../templates/footer.php";

?>