<?php

session_start();

if (!isset($_SESSION["usuario_id"])) {

    header("Location: /sistema-vendas/login.php");

    exit;
}

require "templates/auth.php";
require "templates/header.php";
?>

<link rel="stylesheet" href="assets/css/dashboard.css">

<div class="dashboard-header">

    <h2>
        Dashboard
    </h2>

    <p>
        Visão geral das vendas, estoque e desempenho financeiro
    </p>

</div>

<div class="row g-4 mb-4">

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-success">

            <div class="card-body">

                <div class="metric-icon">
                    💰
                </div>

                <div class="card-title">
                    Faturamento
                </div>

                <div
                    id="faturamento"
                    class="card-value">

                    R$ 0,00

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-primary">

            <div class="card-body">

                <div class="metric-icon">
                    🛒
                </div>

                <div class="card-title">
                    Total de Vendas
                </div>

                <div
                    id="totalVendas"
                    class="card-value">

                    0

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-neutral">

            <div class="card-body">

                <div class="metric-icon">
                    📦
                </div>

                <div class="card-title">
                    Produtos Vendidos
                </div>

                <div
                    id="produtosVendidos"
                    class="card-value">

                    0

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-featured metric-primary">

            <div class="card-body">

                <div class="metric-icon">
                    🏆
                </div>

                <div class="card-title">
                    Produto Mais Vendido
                </div>

                <div
                    id="produtoMaisVendido"
                    class="card-value">

                    Nenhum dado registrado

                </div>

            </div>

        </div>

    </div>

</div>

<div class="row g-4 mb-4">

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-danger">

            <div class="card-body">

                <div class="metric-icon">
                    📉
                </div>

                <div class="card-title">
                    Custo das Mercadorias
                </div>

                <div
                    id="custoMercadorias"
                    class="card-value">

                    R$ 0,00

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-primary">

            <div class="card-body">

                <div class="metric-icon">
                    📈
                </div>

                <div class="card-title">
                    Lucro Bruto
                </div>

                <div
                    id="lucroBruto"
                    class="card-value">

                    R$ 0,00

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-warning">

            <div class="card-body">

                <div class="metric-icon">
                    💳
                </div>

                <div class="card-title">
                    Despesas
                </div>

                <div
                    id="despesas"
                    class="card-value">

                    R$ 0,00

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-success">

            <div class="card-body">

                <div class="metric-icon">
                    ✅
                </div>

                <div class="card-title">
                    Lucro Líquido
                </div>

                <div
                    id="lucroLiquido"
                    class="card-value">

                    R$ 0,00

                </div>

            </div>

        </div>

    </div>

</div>

<div class="row g-4 mb-4">

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-neutral">

            <div class="card-body">

                <div class="metric-icon">
                    🧾
                </div>

                <div class="card-title">
                    Compras no período
                </div>

                <div
                    id="comprasPeriodo"
                    class="card-value">

                    R$ 0,00

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-primary">

            <div class="card-body">

                <div class="metric-icon">
                    📦
                </div>

                <div class="card-title">
                    Estoque atual
                </div>

                <div
                    id="estoqueQuantidade"
                    class="card-value">

                    0

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-neutral">

            <div class="card-body">

                <div class="metric-icon">
                    💼
                </div>

                <div class="card-title">
                    Valor do estoque
                </div>

                <div
                    id="estoqueValor"
                    class="card-value">

                    R$ 0,00

                </div>

            </div>

        </div>

    </div>

    <div class="col-md-6 col-xl-3">

        <div class="card dashboard-card metric-success">

            <div class="card-body">

                <div class="metric-icon">
                    📊
                </div>

                <div class="card-title">
                    Margem Bruta
                </div>

                <div
                    id="margemBruta"
                    class="card-value">

                    0,00%

                </div>

            </div>

        </div>

    </div>

</div>

<div class="card card-section filters-card mb-4">

    <div class="card-body">

        <div class="section-title">

            <span>🔎</span>

            <h5>
                Filtros de vendas
            </h5>

        </div>

        <div class="row g-3">

            <div class="col-md-4">

                <label
                    for="filtroCategoria"
                    class="form-label">

                    Categoria

                </label>

                <select
                    id="filtroCategoria"
                    class="form-select">

                    <option value="">
                        Todas as categorias
                    </option>

                </select>

            </div>

            <div class="col-md-3">

                <label
                    for="filtroDataInicio"
                    class="form-label">

                    Data inicial

                </label>

                <input
                    type="date"
                    id="filtroDataInicio"
                    class="form-control">

            </div>

            <div class="col-md-3">

                <label
                    for="filtroDataFim"
                    class="form-label">

                    Data final

                </label>

                <input
                    type="date"
                    id="filtroDataFim"
                    class="form-control">

            </div>

            <div class="col-md-2 d-flex align-items-end">

                <button
                    id="btnLimpar"
                    type="button"
                    class="btn btn-outline-secondary w-100">

                    Limpar

                </button>

            </div>

        </div>

    </div>

</div>

<div class="card card-section sales-card mb-4">

    <div class="card-body">

        <div class="section-title">

            <span>🛒</span>

            <h5>
                Vendas recentes
            </h5>

        </div>

        <div class="table-responsive">

            <table class="table table-hover align-middle">

                <thead>

                    <tr>

                        <th>Produto</th>

                        <th>Categoria</th>

                        <th>Quantidade</th>

                        <th>Valor unitário</th>

                        <th>Total</th>

                        <th>Data</th>

                    </tr>

                </thead>

                <tbody id="tabelaVendas">

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

        <div class="d-flex justify-content-between align-items-center mt-4">

            <button
                id="btnAnterior"
                class="btn btn-outline-secondary"
                type="button">

                ← Anterior

            </button>

            <span id="paginaAtual">

                Página 1

            </span>

            <button
                id="btnProxima"
                class="btn btn-outline-primary"
                type="button">

                Próxima →

            </button>

        </div>

    </div>

</div>

<div class="card card-section mb-4">

    <div class="card-body">

        <div class="section-title">

            <span>⚠️</span>

            <h5>
                Estoque crítico
            </h5>

        </div>

        <div id="estoqueCritico">

            <p class="text-muted mb-0">
                Carregando...
            </p>

        </div>

    </div>

</div>

<div class="card card-section mb-4">

    <div class="card-body">

        <div class="section-title">

            <span>📊</span>

            <h5>
                Vendas por categoria
            </h5>

        </div>

        <div id="vendasCategoria">

            <p class="text-muted mb-0">
                Carregando...
            </p>

        </div>

    </div>

</div>

<div class="card card-section mb-4">

    <div class="card-body">

        <div class="section-title">

            <span>🏆</span>

            <h5>
                Produtos mais vendidos
            </h5>

        </div>

        <div id="rankingProdutos">

            <p class="text-muted mb-0">
                Carregando...
            </p>

        </div>

    </div>

</div>

<script src="js/dashboard.js"></script>

<?php
require "templates/footer.php";
?>