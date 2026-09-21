<?php

require "../templates/header.php";

?>

<div class="despesas-page">

    <div class="despesas-header">

        <div>

            <h2>
                Despesas
            </h2>

            <p>
                Controle e acompanhe os gastos da empresa.
            </p>

        </div>

    </div>

    <div id="mensagem"></div>

    <div class="card despesas-form-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">

                    <span id="tituloFormulario">
                        Nova despesa
                    </span>

                </h5>

                <small>
                    Registre os gastos e mantenha o controle financeiro.
                </small>

            </div>

        </div>

        <div class="card-body">

            <form id="formDespesa">

                <input
                    type="hidden"
                    id="id">

                <div class="row g-4">

                    <div class="col-md-4">

                        <label
                            for="categoria"
                            class="form-label">

                            Categoria

                        </label>

                        <input
                            type="text"
                            id="categoria"
                            class="form-control"
                            placeholder="Ex.: Energia"
                            required>

                    </div>

                    <div class="col-md-5">

                        <label
                            for="descricao"
                            class="form-label">

                            Descrição

                        </label>

                        <input
                            type="text"
                            id="descricao"
                            class="form-control"
                            placeholder="Ex.: Conta de energia">

                    </div>

                    <div class="col-md-3">

                        <label
                            for="valor"
                            class="form-label">

                            Valor

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                R$
                            </span>

                            <input
                                type="number"
                                id="valor"
                                class="form-control"
                                min="0"
                                step="0.01"
                                placeholder="0,00"
                                required>

                        </div>

                    </div>

                    <div class="col-md-6">

                        <label
                            for="data_despesa"
                            class="form-label">

                            Data da despesa

                        </label>

                        <input
                            type="datetime-local"
                            id="data_despesa"
                            class="form-control"
                            required>

                    </div>

                </div>

                <div class="despesa-form-actions mt-4">

                    <button
                        type="submit"
                        id="btnSalvar"
                        class="btn btn-primary">

                        Salvar despesa

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

    <div class="card despesas-lista-card">

        <div class="card-header despesas-lista-header">

            <div>

                <h5 class="mb-1">
                    Despesas cadastradas
                </h5>

                <small>
                    Histórico dos gastos registrados no sistema.
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table class="table despesas-table align-middle">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Categoria</th>
                            <th>Descrição</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th>Ações</th>

                        </tr>

                    </thead>

                    <tbody id="listaDespesas"></tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<script src="/sistema-vendas/js/despesas.js"></script>

<?php

require "../templates/footer.php";

?>