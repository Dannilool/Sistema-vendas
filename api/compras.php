<?php

require "../config.php";
require "auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    $acao = $_GET["acao"] ?? "listar";

    switch ($acao) {

        // =====================================
        // LISTAR COMPRAS
        // =====================================

        case "listar":

            $stmt = $pdo->query("
                SELECT
                    c.id,
                    c.fornecedor,
                    c.data_compra,
                    c.total,
                    ci.produto_id,
                    p.nome AS produto,
                    ci.quantidade,
                    ci.custo_unitario
                FROM compra c
                INNER JOIN compra_item ci
                    ON ci.compra_id = c.id
                INNER JOIN produto p
                    ON p.id = ci.produto_id
                ORDER BY c.data_compra DESC, c.id DESC
            ");

            echo json_encode([
                "sucesso" => true,
                "dados" => $stmt->fetchAll()
            ]);

            break;


        // =====================================
        // BUSCAR COMPRA
        // =====================================

        case "buscar":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception("ID da compra inválido.");
            }

            $stmt = $pdo->prepare("
                SELECT
                    c.id,
                    c.fornecedor,
                    c.data_compra,
                    c.total,
                    ci.produto_id,
                    ci.quantidade,
                    ci.custo_unitario
                FROM compra c
                INNER JOIN compra_item ci
                    ON ci.compra_id = c.id
                WHERE c.id = :id
                LIMIT 1
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $compra = $stmt->fetch();

            if (!$compra) {
                throw new Exception("Compra não encontrada.");
            }

            echo json_encode([
                "sucesso" => true,
                "dados" => $compra
            ]);

            break;


        // =====================================
        // SALVAR COMPRA
        // =====================================

        case "salvar":

            $dados = json_decode(
                file_get_contents("php://input"),
                true
            );

            if (!is_array($dados)) {
                throw new Exception("Dados inválidos.");
            }

            $id = $dados["id"] ?? null;

            $fornecedor =
                trim($dados["fornecedor"] ?? "");

            $produtoId =
                $dados["produto_id"] ?? null;

            $quantidade =
                $dados["quantidade"] ?? null;

            $custoUnitario =
                $dados["custo_unitario"] ?? null;

            $dataCompra =
                $dados["data_compra"] ?? null;


            // =================================
            // VALIDAÇÕES
            // =================================

            if (
                !is_numeric($produtoId) ||
                (int)$produtoId <= 0
            ) {
                throw new Exception(
                    "Selecione um produto."
                );
            }

            $produtoId = (int)$produtoId;


            if (
                !is_numeric($quantidade) ||
                (int)$quantidade <= 0
            ) {
                throw new Exception(
                    "Informe uma quantidade válida."
                );
            }

            $quantidade = (int)$quantidade;


            if (
                !is_numeric($custoUnitario) ||
                (float)$custoUnitario < 0
            ) {
                throw new Exception(
                    "Informe um custo válido."
                );
            }

            $custoUnitario =
                round((float)$custoUnitario, 2);


            if (!$dataCompra) {
                $dataCompra =
                    date("Y-m-d H:i:s");
            }


            // =================================
            // TRANSAÇÃO
            // =================================

            $pdo->beginTransaction();


            // =================================
            // NOVA COMPRA
            // =================================

            if (!$id) {

                $stmt = $pdo->prepare("
                    SELECT
                        id,
                        estoque
                    FROM produto
                    WHERE id = :id
                    FOR UPDATE
                ");

                $stmt->execute([
                    ":id" => $produtoId
                ]);

                $produto = $stmt->fetch();

                if (!$produto) {
                    throw new Exception(
                        "Produto não encontrado."
                    );
                }


                $total =
                    round(
                        $quantidade * $custoUnitario,
                        2
                    );


                // Cria compra
                $stmt = $pdo->prepare("
                    INSERT INTO compra
                    (
                        fornecedor,
                        data_compra,
                        total
                    )
                    VALUES
                    (
                        :fornecedor,
                        :data_compra,
                        :total
                    )
                ");

                $stmt->execute([
                    ":fornecedor" =>
                        $fornecedor !== ""
                            ? $fornecedor
                            : null,

                    ":data_compra" =>
                        $dataCompra,

                    ":total" =>
                        $total
                ]);


                $compraId =
                    (int)$pdo->lastInsertId();


                // Cria item
                $stmt = $pdo->prepare("
                    INSERT INTO compra_item
                    (
                        compra_id,
                        produto_id,
                        quantidade,
                        custo_unitario,
                        total
                    )
                    VALUES
                    (
                        :compra_id,
                        :produto_id,
                        :quantidade,
                        :custo_unitario,
                        :total
                    )
                ");

                $stmt->execute([
                    ":compra_id" =>
                        $compraId,

                    ":produto_id" =>
                        $produtoId,

                    ":quantidade" =>
                        $quantidade,

                    ":custo_unitario" =>
                        $custoUnitario,

                    ":total" =>
                        $total
                ]);


                // Entrada no estoque + custo novo
                $stmt = $pdo->prepare("
                    UPDATE produto
                    SET
                        estoque = estoque + :quantidade,
                        custo_reposicao = :custo
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":quantidade" =>
                        $quantidade,

                    ":custo" =>
                        $custoUnitario,

                    ":id" =>
                        $produtoId
                ]);


                $pdo->commit();


                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                        "Compra registrada e estoque atualizado com sucesso.",
                    "id" =>
                        $compraId
                ]);

                break;
            }


            // =================================
            // EDITAR COMPRA
            // =================================

            $id = (int)$id;

            if ($id <= 0) {
                throw new Exception(
                    "ID da compra inválido."
                );
            }


            // Busca compra antiga
            $stmt = $pdo->prepare("
                SELECT
                    c.id,
                    c.fornecedor,
                    c.data_compra,
                    ci.produto_id,
                    ci.quantidade,
                    ci.custo_unitario
                FROM compra c
                INNER JOIN compra_item ci
                    ON ci.compra_id = c.id
                WHERE c.id = :id
                FOR UPDATE
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $compraAntiga =
                $stmt->fetch();

            if (!$compraAntiga) {
                throw new Exception(
                    "Compra não encontrada."
                );
            }


            $produtoAntigoId =
                (int)$compraAntiga["produto_id"];

            $quantidadeAntiga =
                (int)$compraAntiga["quantidade"];

            $custoAntigo =
                (float)$compraAntiga["custo_unitario"];


            // Bloqueia produto antigo
            $ids = [
                $produtoAntigoId,
                $produtoId
            ];

            $ids = array_unique($ids);

            sort($ids);


            foreach ($ids as $idProduto) {

                $stmt = $pdo->prepare("
                    SELECT
                        id,
                        estoque,
                        custo_reposicao
                    FROM produto
                    WHERE id = :id
                    FOR UPDATE
                ");

                $stmt->execute([
                    ":id" => $idProduto
                ]);

                if (!$stmt->fetch()) {
                    throw new Exception(
                        "Produto da compra não encontrado."
                    );
                }
            }


            // =================================
            // MESMO PRODUTO
            // =================================

            if (
                $produtoAntigoId === $produtoId
            ) {

                $stmt = $pdo->prepare("
                    SELECT
                        estoque,
                        custo_reposicao
                    FROM produto
                    WHERE id = :id
                    FOR UPDATE
                ");

                $stmt->execute([
                    ":id" => $produtoId
                ]);

                $produto =
                    $stmt->fetch();


                $estoqueAtual =
                    (int)$produto["estoque"];


                $novoEstoque =
                    $estoqueAtual
                    - $quantidadeAntiga
                    + $quantidade;


                if ($novoEstoque < 0) {
                    throw new Exception(
                        "Não é possível editar esta compra porque o estoque já foi utilizado em quantidade incompatível."
                    );
                }


                $total =
                    round(
                        $quantidade * $custoUnitario,
                        2
                    );


                // Atualiza compra
                $stmt = $pdo->prepare("
                    UPDATE compra
                    SET
                        fornecedor = :fornecedor,
                        data_compra = :data_compra,
                        total = :total
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":fornecedor" =>
                        $fornecedor !== ""
                            ? $fornecedor
                            : null,

                    ":data_compra" =>
                        $dataCompra,

                    ":total" =>
                        $total,

                    ":id" =>
                        $id
                ]);


                // Atualiza item
                $stmt = $pdo->prepare("
                    UPDATE compra_item
                    SET
                        quantidade = :quantidade,
                        custo_unitario = :custo,
                        total = :total
                    WHERE compra_id = :compra_id
                ");

                $stmt->execute([
                    ":quantidade" =>
                        $quantidade,

                    ":custo" =>
                        $custoUnitario,

                    ":total" =>
                        $total,

                    ":compra_id" =>
                        $id
                ]);


                // Atualiza estoque/custo
                $stmt = $pdo->prepare("
                    UPDATE produto
                    SET
                        estoque = :estoque,
                        custo_reposicao = :custo
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":estoque" =>
                        $novoEstoque,

                    ":custo" =>
                        $custoUnitario,

                    ":id" =>
                        $produtoId
                ]);


                $pdo->commit();


                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                        "Compra atualizada com sucesso."
                ]);

                break;
            }


            // =================================
            // TROCOU O PRODUTO
            // =================================

            // Retira a entrada antiga
            $stmt = $pdo->prepare("
                UPDATE produto
                SET estoque = estoque - :quantidade
                WHERE id = :id
                  AND estoque >= :quantidade
            ");

            $stmt->execute([
                ":quantidade" =>
                    $quantidadeAntiga,

                ":id" =>
                    $produtoAntigoId
            ]);


            if ($stmt->rowCount() === 0) {
                throw new Exception(
                    "Não é possível trocar o produto desta compra porque o estoque atual não permite retirar a entrada anterior."
                );
            }


            // Adiciona novo produto
            $stmt = $pdo->prepare("
                UPDATE produto
                SET estoque = estoque + :quantidade,
                    custo_reposicao = :custo
                WHERE id = :id
            ");

            $stmt->execute([
                ":quantidade" =>
                    $quantidade,

                ":custo" =>
                    $custoUnitario,

                ":id" =>
                    $produtoId
            ]);


            $total =
                round(
                    $quantidade * $custoUnitario,
                    2
                );


            // Atualiza compra
            $stmt = $pdo->prepare("
                UPDATE compra
                SET
                    fornecedor = :fornecedor,
                    data_compra = :data_compra,
                    total = :total
                WHERE id = :id
            ");

            $stmt->execute([
                ":fornecedor" =>
                    $fornecedor !== ""
                        ? $fornecedor
                        : null,

                ":data_compra" =>
                    $dataCompra,

                ":total" =>
                    $total,

                ":id" =>
                    $id
            ]);


            // Atualiza item
            $stmt = $pdo->prepare("
                UPDATE compra_item
                SET
                    produto_id = :produto_id,
                    quantidade = :quantidade,
                    custo_unitario = :custo,
                    total = :total
                WHERE compra_id = :compra_id
            ");

            $stmt->execute([
                ":produto_id" =>
                    $produtoId,

                ":quantidade" =>
                    $quantidade,

                ":custo" =>
                    $custoUnitario,

                ":total" =>
                    $total,

                ":compra_id" =>
                    $id
            ]);


            $pdo->commit();


            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                    "Compra atualizada com sucesso."
            ]);

            break;


        // =====================================
        // EXCLUIR COMPRA
        // =====================================

        case "excluir":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception(
                    "ID da compra inválido."
                );
            }


            $pdo->beginTransaction();


            // Busca compra
            $stmt = $pdo->prepare("
                SELECT
                    ci.produto_id,
                    ci.quantidade
                FROM compra_item ci
                WHERE ci.compra_id = :id
                FOR UPDATE
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $item =
                $stmt->fetch();

            if (!$item) {
                throw new Exception(
                    "Compra não encontrada."
                );
            }


            $produtoId =
                (int)$item["produto_id"];

            $quantidade =
                (int)$item["quantidade"];


            // Bloqueia produto
            $stmt = $pdo->prepare("
                SELECT
                    estoque
                FROM produto
                WHERE id = :id
                FOR UPDATE
            ");

            $stmt->execute([
                ":id" => $produtoId
            ]);

            $produto =
                $stmt->fetch();

            if (!$produto) {
                throw new Exception(
                    "Produto não encontrado."
                );
            }


            if (
                (int)$produto["estoque"]
                < $quantidade
            ) {
                throw new Exception(
                    "Não é possível excluir esta compra porque parte desse estoque já foi utilizado."
                );
            }


            // Retira entrada do estoque
            $stmt = $pdo->prepare("
                UPDATE produto
                SET estoque = estoque - :quantidade
                WHERE id = :id
            ");

            $stmt->execute([
                ":quantidade" =>
                    $quantidade,

                ":id" =>
                    $produtoId
            ]);


            // Descobre o custo da última compra
            // restante desse produto
            $stmt = $pdo->prepare("
                SELECT
                    ci.custo_unitario
                FROM compra_item ci
                INNER JOIN compra c
                    ON c.id = ci.compra_id
                WHERE
                    ci.produto_id = :produto_id
                    AND c.id <> :compra_id
                ORDER BY
                    c.data_compra DESC,
                    c.id DESC
                LIMIT 1
            ");

            $stmt->execute([
                ":produto_id" =>
                    $produtoId,

                ":compra_id" =>
                    $id
            ]);

            $ultimaCompra =
                $stmt->fetch();


            $novoCusto =
                $ultimaCompra
                    ? (float)$ultimaCompra["custo_unitario"]
                    : 0.00;


            // Restaura custo
            $stmt = $pdo->prepare("
                UPDATE produto
                SET custo_reposicao = :custo
                WHERE id = :id
            ");

            $stmt->execute([
                ":custo" =>
                    $novoCusto,

                ":id" =>
                    $produtoId
            ]);


            // Exclui compra
            $stmt = $pdo->prepare("
                DELETE FROM compra
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" =>
                    $id
            ]);


            $pdo->commit();


            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                    "Compra excluída e estoque ajustado com sucesso."
            ]);

            break;


        default:

            throw new Exception(
                "Ação inválida."
            );
    }


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);

    echo json_encode([
        "sucesso" => false,
        "mensagem" =>
            $e->getMessage()
    ]);
}