<?php

require "../templates/admin.php";
require "../templates/header.php";

?>

<div class="relatorios-page">

    <div class="relatorios-header">

        <div>

            <h2>
                Relatórios Financeiros
            </h2>

            <p>
                Analise vendas, custos, despesas e resultados da empresa.
            </p>

        </div>

        <a
            href="../index.php"
            class="btn btn-outline-secondary">

            ← Voltar

        </a>

    </div>

    <div id="mensagem"></div>

    <div class="card relatorios-filtros-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">
                    Período de análise
                </h5>

                <small>
                    Selecione o intervalo para atualizar os dados.
                </small>

            </div>

        </div>

        <div class="card-body">

            <div class="row g-3 align-items-end">

                <div class="col-md-4">

                    <label
                        for="dataInicio"
                        class="form-label">

                        Data inicial

                    </label>

                    <input
                        type="date"
                        id="dataInicio"
                        class="form-control">

                </div>

                <div class="col-md-4">

                    <label
                        for="dataFim"
                        class="form-label">

                        Data final

                    </label>

                    <input
                        type="date"
                        id="dataFim"
                        class="form-control">

                </div>

                <div class="col-md-4">

                    <div class="relatorios-filtro-acoes">

                        <button
                            type="button"
                            id="btnFiltrar"
                            class="btn btn-primary">

                            Filtrar relatório

                        </button>

                        <button
                            type="button"
                            id="btnLimpar"
                            class="btn btn-light">

                            Limpar

                        </button>

                    </div>

                </div>

            </div>

        </div>

    </div>

    <div class="relatorios-section-title">

        <span>💰</span>

        <h5>
            Resumo financeiro
        </h5>

    </div>

    <div class="row g-4 mb-4">

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-faturamento">

                <div class="card-body">

                    <div class="metrica-icone">
                        💰
                    </div>

                    <div class="metrica-label">
                        Faturamento
                    </div>

                    <div
                        id="faturamento"
                        class="metrica-valor">

                        R$ 0,00

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-custo">

                <div class="card-body">

                    <div class="metrica-icone">
                        📉
                    </div>

                    <div class="metrica-label">
                        Custo das mercadorias
                    </div>

                    <div
                        id="custoMercadorias"
                        class="metrica-valor">

                        R$ 0,00

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-lucro">

                <div class="card-body">

                    <div class="metrica-icone">
                        📈
                    </div>

                    <div class="metrica-label">
                        Lucro bruto
                    </div>

                    <div
                        id="lucroBruto"
                        class="metrica-valor">

                        R$ 0,00

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-liquido">

                <div class="card-body">

                    <div class="metrica-icone">
                        ✅
                    </div>

                    <div class="metrica-label">
                        Lucro líquido
                    </div>

                    <div
                        id="lucroLiquido"
                        class="metrica-valor">

                        R$ 0,00

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-despesas">

                <div class="card-body">

                    <div class="metrica-icone">
                        💳
                    </div>

                    <div class="metrica-label">
                        Despesas
                    </div>

                    <div
                        id="despesas"
                        class="metrica-valor">

                        R$ 0,00

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-compras">

                <div class="card-body">

                    <div class="metrica-icone">
                        🛍️
                    </div>

                    <div class="metrica-label">
                        Compras
                    </div>

                    <div
                        id="compras"
                        class="metrica-valor">

                        R$ 0,00

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-margem">

                <div class="card-body">

                    <div class="metrica-icone">
                        📊
                    </div>

                    <div class="metrica-label">
                        Margem bruta
                    </div>

                    <div
                        id="margemBruta"
                        class="metrica-valor">

                        0,00%

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-margem-liquida">

                <div class="card-body">

                    <div class="metrica-icone">
                        🎯
                    </div>

                    <div class="metrica-label">
                        Margem líquida
                    </div>

                    <div
                        id="margemLiquida"
                        class="metrica-valor">

                        0,00%

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-neutral">

                <div class="card-body">

                    <div class="metrica-icone">
                        📦
                    </div>

                    <div class="metrica-label">
                        Produtos vendidos
                    </div>

                    <div
                        id="produtosVendidos"
                        class="metrica-valor">

                        0

                    </div>

                </div>

            </div>

        </div>

        <div class="col-md-6 col-xl-3">

            <div class="card relatorio-metrica metrica-neutral">

                <div class="card-body">

                    <div class="metrica-icone">
                        🧾
                    </div>

                    <div class="metrica-label">
                        Total de vendas
                    </div>

                    <div
                        id="totalVendas"
                        class="metrica-valor">

                        0

                    </div>

                </div>

            </div>

        </div>

    </div>

    <div class="relatorios-section-title">

        <span>📊</span>

        <h5>
            Análise gráfica
        </h5>

    </div>

    <div class="row g-4 mb-4">

        <div class="col-lg-8">

            <div class="card relatorios-grafico-card h-100">

                <div class="card-header">

                    <div>

                        <h5 class="mb-1">
                            Evolução financeira
                        </h5>

                        <small>
                            Comparativo mensal dos principais indicadores.
                        </small>

                    </div>

                </div>

                <div class="card-body">

                    <div class="relatorio-grafico">

                        <canvas
                            id="graficoFinanceiro">
                        </canvas>

                    </div>

                </div>

            </div>

        </div>

        <div class="col-lg-4">

            <div class="card relatorios-grafico-card h-100">

                <div class="card-header">

                    <div>

                        <h5 class="mb-1">
                            Despesas x Compras
                        </h5>

                        <small>
                            Comparativo mensal dos gastos.
                        </small>

                    </div>

                </div>

                <div class="card-body">

                    <div class="relatorio-grafico">

                        <canvas
                            id="graficoDespesasCompras">
                        </canvas>

                    </div>

                </div>

            </div>

        </div>

    </div>

    <div class="card relatorios-grafico-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">
                    Faturamento por categoria
                </h5>

                <small>
                    Distribuição do faturamento entre as categorias.
                </small>

            </div>

        </div>

        <div class="card-body">

            <div class="relatorio-grafico relatorio-grafico-largo">

                <canvas
                    id="graficoCategorias">
                </canvas>

            </div>

        </div>

    </div>

    <div class="relatorios-section-title">

        <span>🏆</span>

        <h5>
            Desempenho dos produtos
        </h5>

    </div>

    <div class="card relatorios-tabela-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">
                    Ranking de lucro por produto
                </h5>

                <small>
                    Produtos ordenados pelo lucro gerado.
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table class="table relatorios-table align-middle">

                    <thead>

                        <tr>

                            <th>#</th>
                            <th>Produto</th>
                            <th>Qtd.</th>
                            <th>Faturamento</th>
                            <th>Custo</th>
                            <th>Lucro</th>
                            <th>Margem</th>

                        </tr>

                    </thead>

                    <tbody id="listaRankingLucro"></tbody>

                </table>

            </div>

        </div>

    </div>

    <div class="card relatorios-tabela-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">
                    Desempenho por produto
                </h5>

                <small>
                    Resultado individual de cada produto vendido.
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table class="table relatorios-table align-middle">

                    <thead>

                        <tr>

                            <th>#</th>
                            <th>Produto</th>
                            <th>Qtd.</th>
                            <th>Faturamento</th>
                            <th>Custo</th>
                            <th>Lucro</th>
                            <th>Margem</th>

                        </tr>

                    </thead>

                    <tbody id="listaProdutosRelatorio"></tbody>

                </table>

            </div>

        </div>

    </div>

    <div class="relatorios-section-title">

        <span>📂</span>

        <h5>
            Desempenho por categoria
        </h5>

    </div>

    <div class="card relatorios-tabela-card mb-4">

        <div class="card-header">

            <div>

                <h5 class="mb-1">
                    Resultado por categoria
                </h5>

                <small>
                    Comparação de vendas, custos e margens.
                </small>

            </div>

        </div>

        <div class="card-body p-0">

            <div class="table-responsive">

                <table class="table relatorios-table align-middle">

                    <thead>

                        <tr>

                            <th>Categoria</th>
                            <th>Qtd.</th>
                            <th>Faturamento</th>
                            <th>Custo</th>
                            <th>Lucro</th>
                            <th>Margem</th>

                        </tr>

                    </thead>

                    <tbody id="listaCategoriasRelatorio"></tbody>

                </table>

            </div>

        </div>

    </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script src="../js/relatorios.js"></script>

<?php

require "../templates/footer.php";

?>