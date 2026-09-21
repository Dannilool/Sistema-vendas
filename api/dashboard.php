<?php

require "../config.php";
require "auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    // =====================================
    // FILTROS
    // =====================================

    $categoriaId =
        isset($_GET["categoria_id"]) &&
        $_GET["categoria_id"] !== ""
        ? (int) $_GET["categoria_id"]
        : null;

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

    $limite =
        isset($_GET["limite"])
        ? (int) $_GET["limite"]
        : 10;

    $pagina =
        isset($_GET["pagina"])
        ? (int) $_GET["pagina"]
        : 1;

    if ($limite <= 0) {
        $limite = 10;
    }

    if ($pagina <= 0) {
        $pagina = 1;
    }

    $offset = ($pagina - 1) * $limite;


    // =====================================
    // VENDAS VIA STORED PROCEDURE
    // =====================================

    $sqlProcedure = "
        CALL sp_buscar_vendas(
            ?,
            ?,
            ?,
            ?,
            ?
        )
    ";

    $stmt = $pdo->prepare($sqlProcedure);

    $stmt->bindValue(
        1,
        $categoriaId,
        $categoriaId === null
            ? PDO::PARAM_NULL
            : PDO::PARAM_INT
    );

    $stmt->bindValue(
        2,
        $dataInicio,
        $dataInicio === null
            ? PDO::PARAM_NULL
            : PDO::PARAM_STR
    );

    $stmt->bindValue(
        3,
        $dataFim,
        $dataFim === null
            ? PDO::PARAM_NULL
            : PDO::PARAM_STR
    );

    $stmt->bindValue(
        4,
        $limite,
        PDO::PARAM_INT
    );

    $stmt->bindValue(
        5,
        $offset,
        PDO::PARAM_INT
    );

    $stmt->execute();

    $resultadoProcedure =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt->closeCursor();


    // =====================================
    // NORMALIZAR VENDAS
    // =====================================

    $vendas = [];

    foreach ($resultadoProcedure as $venda) {

        $vendas[] = [

            "venda_id" =>
                (int) $venda["venda_id"],

            "produto_id" =>
                (int) $venda["produto_id"],

            "produto" =>
                $venda["produto"],

            "categoria_id" =>
                (int) $venda["categoria_id"],

            "categoria" =>
                $venda["categoria"],

            "quantidade" =>
                (int) $venda["quantidade"],

            "custo_reposicao" =>
                (float) $venda["custo_reposicao"],

            "custo_unitario" =>
                (float) $venda["custo_unitario"],

            "valor_unitario" =>
                (float) $venda["valor_unitario"],

            "total" =>
                (float) $venda["total_venda"],

            "data_venda" =>
                $venda["data_venda"]
        ];
    }


    // =====================================
    // RESUMO RETORNADO PELA PROCEDURE
    // =====================================

    $total = 0;

    $faturamentoReal = 0.0;

    $produtosVendidos = 0;

    if (!empty($resultadoProcedure)) {

        $primeiraLinha =
            $resultadoProcedure[0];

        $total =
            (int) $primeiraLinha["total_registros"];

        $faturamentoReal =
            (float) $primeiraLinha["faturamento"];

        $produtosVendidos =
            (int) $primeiraLinha["produtos_vendidos"];
    }


    // =====================================
    // CUSTO DAS MERCADORIAS
    // =====================================

    $whereVendas = ["1 = 1"];

    $paramsVendas = [];

    if ($categoriaId !== null) {

        $whereVendas[] =
            "p.categoria_id = :categoria_id";

        $paramsVendas[":categoria_id"] =
            $categoriaId;
    }

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


    $sqlCusto = "
        SELECT

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
    ";

    $stmt = $pdo->prepare($sqlCusto);

    $stmt->execute($paramsVendas);

    $resultadoCusto =
        $stmt->fetch(PDO::FETCH_ASSOC);

    $custoMercadorias =
        (float) $resultadoCusto["custo_mercadorias"];


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

    $stmt = $pdo->prepare($sqlDespesas);

    $stmt->execute($paramsDespesas);

    $resultadoDespesas =
        $stmt->fetch(PDO::FETCH_ASSOC);

    $despesas =
        (float) $resultadoDespesas["despesas"];


    // =====================================
    // COMPRAS
    // =====================================

    $whereCompras = ["1 = 1"];

    $paramsCompras = [];

    if ($categoriaId !== null) {

        $whereCompras[] =
            "p.categoria_id = :compra_categoria";

        $paramsCompras[":compra_categoria"] =
            $categoriaId;
    }

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

        INNER JOIN produto p
            ON p.id = ci.produto_id

        WHERE " .
        implode(
            " AND ",
            $whereCompras
        );

    $stmt = $pdo->prepare($sqlCompras);

    $stmt->execute($paramsCompras);

    $resultadoCompras =
        $stmt->fetch(PDO::FETCH_ASSOC);

    $compras =
        (float) $resultadoCompras["compras"];


    // =====================================
    // ESTOQUE
    // =====================================

    $whereEstoque = ["1 = 1"];

    $paramsEstoque = [];

    if ($categoriaId !== null) {

        $whereEstoque[] =
            "categoria_id = :estoque_categoria";

        $paramsEstoque[":estoque_categoria"] =
            $categoriaId;
    }

    $sqlEstoque = "
        SELECT

            COALESCE(
                SUM(estoque),
                0
            ) AS quantidade,

            COALESCE(
                SUM(
                    estoque *
                    custo_reposicao
                ),
                0
            ) AS valor

        FROM produto

        WHERE " .
        implode(
            " AND ",
            $whereEstoque
        );

    $stmt = $pdo->prepare($sqlEstoque);

    $stmt->execute($paramsEstoque);

    $resultadoEstoque =
        $stmt->fetch(PDO::FETCH_ASSOC);

    $estoqueQuantidade =
        (int) $resultadoEstoque["quantidade"];

    $estoqueValor =
        (float) $resultadoEstoque["valor"];


    // =====================================
    // LUCROS
    // =====================================

    $lucroBruto =
        $faturamentoReal -
        $custoMercadorias;

    $lucroLiquido =
        $lucroBruto -
        $despesas;

    $margemBruta =
        $faturamentoReal > 0
        ? (
            $lucroBruto /
            $faturamentoReal
        ) * 100
        : 0;


    // =====================================
    // RESPOSTA
    // =====================================

    echo json_encode(
        [
            "sucesso" => true,

            "dados" => $vendas,

            "paginacao" => [

                "pagina" =>
                    $pagina,

                "limite" =>
                    $limite,

                "offset" =>
                    $offset,

                "total" =>
                    $total,

                "faturamento" =>
                    $faturamentoReal,

                "produtos_vendidos" =>
                    $produtosVendidos
            ],

            "financeiro" => [

                "faturamento" =>
                    $faturamentoReal,

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

                "compras" =>
                    $compras,

                "estoque_quantidade" =>
                    $estoqueQuantidade,

                "estoque_valor" =>
                    $estoqueValor
            ]
        ],
        JSON_UNESCAPED_UNICODE
    );

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode(
        [
            "sucesso" => false,
            "mensagem" => $e->getMessage(),
            "arquivo" => $e->getFile(),
            "linha" => $e->getLine()
        ],
        JSON_UNESCAPED_UNICODE
    );
}