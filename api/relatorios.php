<?php

require "../config.php";
require "auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    // =====================================
    // FILTROS
    // =====================================

    $dataInicio =
        isset($_GET["data_inicio"]) &&
        $_GET["data_inicio"] !== ""
        ? $_GET["data_inicio"]
        : null;

    $dataFim =
        isset($_GET["data_fim"]) &&
        $_GET["data_fim"] !== ""
        ? $_GET["data_fim"]
        : null;


    // =====================================
    // CONDIÇÕES DE VENDAS
    // =====================================

    $whereVendas = ["1 = 1"];
    $paramsVendas = [];

    if ($dataInicio !== null) {

        $whereVendas[] =
            "v.data_venda >= :data_inicio";

        $paramsVendas[":data_inicio"] =
            $dataInicio . " 00:00:00";
    }

    if ($dataFim !== null) {

        $whereVendas[] =
            "v.data_venda < :data_fim";

        $paramsVendas[":data_fim"] =
            date(
                "Y-m-d H:i:s",
                strtotime($dataFim . " +1 day")
            );
    }

    $whereSqlVendas =
        implode(
            " AND ",
            $whereVendas
        );


    // =====================================
    // RESUMO FINANCEIRO
    // =====================================

    $sqlResumo = "
        SELECT

            COALESCE(
                SUM(
                    v.quantidade *
                    v.valor_unitario
                ),
                0
            ) AS faturamento,

            COALESCE(
                SUM(
                    v.quantidade *
                    v.custo_unitario
                ),
                0
            ) AS custo_mercadorias,

            COALESCE(
                SUM(v.quantidade),
                0
            ) AS produtos_vendidos,

            COUNT(v.id) AS total_vendas

        FROM venda v

        INNER JOIN produto p
            ON p.id = v.produto_id

        WHERE $whereSqlVendas
    ";

    $stmt =
        $pdo->prepare($sqlResumo);

    $stmt->execute(
        $paramsVendas
    );

    $resumo =
        $stmt->fetch(
            PDO::FETCH_ASSOC
        );


    $faturamento =
        (float) $resumo["faturamento"];

    $custoMercadorias =
        (float) $resumo["custo_mercadorias"];

    $produtosVendidos =
        (int) $resumo["produtos_vendidos"];

    $totalVendas =
        (int) $resumo["total_vendas"];


    // =====================================
    // DESPESAS
    // =====================================

    $whereDespesas = ["1 = 1"];
    $paramsDespesas = [];

    if ($dataInicio !== null) {

        $whereDespesas[] =
            "data_despesa >= :despesa_inicio";

        $paramsDespesas[":despesa_inicio"] =
            $dataInicio . " 00:00:00";
    }

    if ($dataFim !== null) {

        $whereDespesas[] =
            "data_despesa < :despesa_fim";

        $paramsDespesas[":despesa_fim"] =
            date(
                "Y-m-d H:i:s",
                strtotime($dataFim . " +1 day")
            );
    }

    $sqlDespesas = "
        SELECT
            COALESCE(
                SUM(valor),
                0
            ) AS despesas

        FROM despesa

        WHERE " .
        implode(
            " AND ",
            $whereDespesas
        );

    $stmt =
        $pdo->prepare($sqlDespesas);

    $stmt->execute(
        $paramsDespesas
    );

    $resultadoDespesas =
        $stmt->fetch(
            PDO::FETCH_ASSOC
        );

    $despesas =
        (float) $resultadoDespesas["despesas"];


    // =====================================
    // COMPRAS
    // =====================================

    $whereCompras = ["1 = 1"];
    $paramsCompras = [];

    if ($dataInicio !== null) {

        $whereCompras[] =
            "c.data_compra >= :compra_inicio";

        $paramsCompras[":compra_inicio"] =
            $dataInicio . " 00:00:00";
    }

    if ($dataFim !== null) {

        $whereCompras[] =
            "c.data_compra < :compra_fim";

        $paramsCompras[":compra_fim"] =
            date(
                "Y-m-d H:i:s",
                strtotime($dataFim . " +1 day")
            );
    }

    $sqlCompras = "
        SELECT
            COALESCE(
                SUM(ci.total),
                0
            ) AS compras

        FROM compra_item ci

        INNER JOIN compra c
            ON c.id = ci.compra_id

        WHERE " .
        implode(
            " AND ",
            $whereCompras
        );

    $stmt =
        $pdo->prepare($sqlCompras);

    $stmt->execute(
        $paramsCompras
    );

    $resultadoCompras =
        $stmt->fetch(
            PDO::FETCH_ASSOC
        );

    $compras =
        (float) $resultadoCompras["compras"];


    // =====================================
    // LUCROS
    // =====================================

    $lucroBruto =
        $faturamento -
        $custoMercadorias;

    $lucroLiquido =
        $lucroBruto -
        $despesas;

    $margemBruta =
        $faturamento > 0
        ? (
            $lucroBruto /
            $faturamento
        ) * 100
        : 0;

    $margemLiquida =
        $faturamento > 0
        ? (
            $lucroLiquido /
            $faturamento
        ) * 100
        : 0;


    // =====================================
    // PRODUTOS MAIS VENDIDOS
    // =====================================

    $sqlProdutos = "
        SELECT

            p.id,

            p.nome,

            COALESCE(
                SUM(v.quantidade),
                0
            ) AS quantidade,

            COALESCE(
                SUM(
                    v.quantidade *
                    v.valor_unitario
                ),
                0
            ) AS faturamento,

            COALESCE(
                SUM(
                    v.quantidade *
                    v.custo_unitario
                ),
                0
            ) AS custo

        FROM venda v

        INNER JOIN produto p
            ON p.id = v.produto_id

        WHERE $whereSqlVendas

        GROUP BY
            p.id,
            p.nome

        ORDER BY
            quantidade DESC,
            faturamento DESC

        LIMIT 10
    ";

    $stmt =
        $pdo->prepare($sqlProdutos);

    $stmt->execute(
        $paramsVendas
    );

    $produtos =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    foreach ($produtos as &$produto) {

        $produto["id"] =
            (int) $produto["id"];

        $produto["quantidade"] =
            (int) $produto["quantidade"];

        $produto["faturamento"] =
            (float) $produto["faturamento"];

        $produto["custo"] =
            (float) $produto["custo"];

        $produto["lucro"] =
            $produto["faturamento"] -
            $produto["custo"];

        $produto["margem"] =
            $produto["faturamento"] > 0
            ? (
                $produto["lucro"] /
                $produto["faturamento"]
            ) * 100
            : 0;
    }

    unset($produto);


    // =====================================
    // CATEGORIAS
    // =====================================

    $sqlCategorias = "
        SELECT

            c.id,

            c.nome,

            COALESCE(
                SUM(v.quantidade),
                0
            ) AS quantidade,

            COALESCE(
                SUM(
                    v.quantidade *
                    v.valor_unitario
                ),
                0
            ) AS faturamento,

            COALESCE(
                SUM(
                    v.quantidade *
                    v.custo_unitario
                ),
                0
            ) AS custo

        FROM venda v

        INNER JOIN produto p
            ON p.id = v.produto_id

        INNER JOIN categoria c
            ON c.id = p.categoria_id

        WHERE $whereSqlVendas

        GROUP BY
            c.id,
            c.nome

        ORDER BY
            faturamento DESC
    ";

    $stmt =
        $pdo->prepare($sqlCategorias);

    $stmt->execute(
        $paramsVendas
    );

    $categorias =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    foreach ($categorias as &$categoria) {

        $categoria["id"] =
            (int) $categoria["id"];

        $categoria["quantidade"] =
            (int) $categoria["quantidade"];

        $categoria["faturamento"] =
            (float) $categoria["faturamento"];

        $categoria["custo"] =
            (float) $categoria["custo"];

        $categoria["lucro"] =
            $categoria["faturamento"] -
            $categoria["custo"];

        $categoria["margem"] =
            $categoria["faturamento"] > 0
            ? (
                $categoria["lucro"] /
                $categoria["faturamento"]
            ) * 100
            : 0;
    }

    unset($categoria);


    // =====================================
    // EVOLUÇÃO MENSAL
    // =====================================

    $evolucao = [];


    // -------------------------------------
    // VENDAS POR MÊS
    // -------------------------------------

    $sqlEvolucaoVendas = "
        SELECT

            DATE_FORMAT(
                v.data_venda,
                '%Y-%m'
            ) AS mes,

            COALESCE(
                SUM(
                    v.quantidade *
                    v.valor_unitario
                ),
                0
            ) AS faturamento,

            COALESCE(
                SUM(
                    v.quantidade *
                    v.custo_unitario
                ),
                0
            ) AS custo_mercadorias

        FROM venda v

        INNER JOIN produto p
            ON p.id = v.produto_id

        WHERE $whereSqlVendas

        GROUP BY
            DATE_FORMAT(
                v.data_venda,
                '%Y-%m'
            )

        ORDER BY
            mes
    ";

    $stmt =
        $pdo->prepare(
            $sqlEvolucaoVendas
        );

    $stmt->execute(
        $paramsVendas
    );

    $vendasMensais =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    // -------------------------------------
    // DESPESAS POR MÊS
    // -------------------------------------

    $sqlEvolucaoDespesas = "
        SELECT

            DATE_FORMAT(
                data_despesa,
                '%Y-%m'
            ) AS mes,

            COALESCE(
                SUM(valor),
                0
            ) AS despesas

        FROM despesa

        WHERE " .
        implode(
            " AND ",
            $whereDespesas
        ) . "

        GROUP BY
            DATE_FORMAT(
                data_despesa,
                '%Y-%m'
            )

        ORDER BY
            mes
    ";

    $stmt =
        $pdo->prepare(
            $sqlEvolucaoDespesas
        );

    $stmt->execute(
        $paramsDespesas
    );

    $despesasMensais =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    // -------------------------------------
    // COMPRAS POR MÊS
    // -------------------------------------

    $sqlEvolucaoCompras = "
        SELECT

            DATE_FORMAT(
                c.data_compra,
                '%Y-%m'
            ) AS mes,

            COALESCE(
                SUM(ci.total),
                0
            ) AS compras

        FROM compra_item ci

        INNER JOIN compra c
            ON c.id = ci.compra_id

        WHERE " .
        implode(
            " AND ",
            $whereCompras
        ) . "

        GROUP BY
            DATE_FORMAT(
                c.data_compra,
                '%Y-%m'
            )

        ORDER BY
            mes
    ";

    $stmt =
        $pdo->prepare(
            $sqlEvolucaoCompras
        );

    $stmt->execute(
        $paramsCompras
    );

    $comprasMensais =
        $stmt->fetchAll(
            PDO::FETCH_ASSOC
        );


    // -------------------------------------
    // MONTAR MESES DAS VENDAS
    // -------------------------------------

    foreach ($vendasMensais as $item) {

        $mes =
            $item["mes"];

        $faturamentoMes =
            (float) $item["faturamento"];

        $custoMes =
            (float) $item["custo_mercadorias"];

        $evolucao[$mes] = [

            "mes" =>
                $mes,

            "faturamento" =>
                $faturamentoMes,

            "custo_mercadorias" =>
                $custoMes,

            "despesas" =>
                0,

            "compras" =>
                0,

            "lucro_bruto" =>
                $faturamentoMes -
                $custoMes,

            "lucro_liquido" =>
                $faturamentoMes -
                $custoMes
        ];
    }


    // -------------------------------------
    // ADICIONAR DESPESAS
    // -------------------------------------

    foreach ($despesasMensais as $item) {

        $mes =
            $item["mes"];


        if (!isset($evolucao[$mes])) {

            $evolucao[$mes] = [

                "mes" =>
                    $mes,

                "faturamento" =>
                    0,

                "custo_mercadorias" =>
                    0,

                "despesas" =>
                    0,

                "compras" =>
                    0,

                "lucro_bruto" =>
                    0,

                "lucro_liquido" =>
                    0
            ];
        }


        $evolucao[$mes]["despesas"] =
            (float) $item["despesas"];
    }


    // -------------------------------------
    // ADICIONAR COMPRAS
    // -------------------------------------

    foreach ($comprasMensais as $item) {

        $mes =
            $item["mes"];


        if (!isset($evolucao[$mes])) {

            $evolucao[$mes] = [

                "mes" =>
                    $mes,

                "faturamento" =>
                    0,

                "custo_mercadorias" =>
                    0,

                "despesas" =>
                    0,

                "compras" =>
                    0,

                "lucro_bruto" =>
                    0,

                "lucro_liquido" =>
                    0
            ];
        }


        $evolucao[$mes]["compras"] =
            (float) $item["compras"];
    }


    // -------------------------------------
    // RECALCULAR LUCROS
    // -------------------------------------

    foreach ($evolucao as &$item) {

        $item["lucro_bruto"] =
            $item["faturamento"] -
            $item["custo_mercadorias"];

        $item["lucro_liquido"] =
            $item["lucro_bruto"] -
            $item["despesas"];
    }

    unset($item);


    // -------------------------------------
    // ORDENAR MESES
    // -------------------------------------

    ksort($evolucao);

    $evolucao =
        array_values($evolucao);


    // =====================================
    // RESPOSTA
    // =====================================

    echo json_encode(
        [
            "sucesso" => true,

            "periodo" => [

                "data_inicio" =>
                    $dataInicio,

                "data_fim" =>
                    $dataFim
            ],

            "financeiro" => [

                "faturamento" =>
                    $faturamento,

                "custo_mercadorias" =>
                    $custoMercadorias,

                "lucro_bruto" =>
                    $lucroBruto,

                "despesas" =>
                    $despesas,

                "lucro_liquido" =>
                    $lucroLiquido,

                "margem_bruta" =>
                    $margemBruta,

                "margem_liquida" =>
                    $margemLiquida,

                "compras" =>
                    $compras,

                "produtos_vendidos" =>
                    $produtosVendidos,

                "total_vendas" =>
                    $totalVendas
            ],

            "produtos" =>
                $produtos,

            "categorias" =>
                $categorias,

            "evolucao" =>
                $evolucao
        ],
        JSON_UNESCAPED_UNICODE
    );

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode(
        [
            "sucesso" => false,
            "mensagem" => $e->getMessage(),
            "linha" => $e->getLine()
        ],
        JSON_UNESCAPED_UNICODE
    );
}