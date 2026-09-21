<?php

require "../config.php";
require "auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    $acao = $_GET["acao"] ?? "listar";

    switch ($acao) {

        // =====================================
        // LISTAR VENDAS
        // =====================================

        case "listar":

            $stmt = $pdo->query("
                SELECT
                    v.id,
                    v.produto_id,
                    p.nome AS produto,
                    v.quantidade,
                    v.valor_unitario,
                    (v.quantidade * v.valor_unitario) AS total,
                    v.data_venda
                FROM venda v
                INNER JOIN produto p
                    ON p.id = v.produto_id
                ORDER BY v.data_venda DESC
            ");

            $vendas = $stmt->fetchAll();

            echo json_encode([
                "sucesso" => true,
                "dados" => $vendas
            ]);

            break;


        // =====================================
        // BUSCAR VENDA
        // =====================================

        case "buscar":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception("ID da venda inválido.");
            }

            $stmt = $pdo->prepare("
                SELECT
                    id,
                    produto_id,
                    quantidade,
                    valor_unitario,
                    data_venda
                FROM venda
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $venda = $stmt->fetch();

            if (!$venda) {
                throw new Exception("Venda não encontrada.");
            }

            echo json_encode([
                "sucesso" => true,
                "dados" => $venda
            ]);

            break;


        // =====================================
        // SALVAR VENDA
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

            $produtoId = $dados["produto_id"] ?? null;

            $quantidade = $dados["quantidade"] ?? null;

            $dataVenda = $dados["data_venda"] ?? null;


            // =================================
            // VALIDAÇÕES
            // =================================

            if (
                !is_numeric($produtoId) ||
                (int)$produtoId <= 0
            ) {
                throw new Exception("Selecione um produto.");
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


            if (!$dataVenda) {
                $dataVenda = date("Y-m-d H:i:s");
            }


            // =================================
            // INICIAR TRANSAÇÃO
            // =================================

            $pdo->beginTransaction();


            // =================================
            // NOVA VENDA
            // =================================

            if (!$id) {

                // Bloqueia o produto enquanto verifica/atualiza estoque
                $stmt = $pdo->prepare("
                  SELECT
                        id,
                        preco,
                        estoque,
                        custo_reposicao
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
                        "O produto selecionado não existe."
                    );
                }


                $estoqueAtual = (int)$produto["estoque"];


                if ($quantidade > $estoqueAtual) {

                    throw new Exception(
                        "Estoque insuficiente. Disponível: "
                            . $estoqueAtual
                            . "."
                    );
                }


                // Preço vem sempre do produto
                $valorUnitario = $produto["preco"];
                $custoUnitario = $produto["custo_reposicao"];

                // Desconta estoque
                $stmt = $pdo->prepare("
                    UPDATE produto
                    SET estoque = estoque - :quantidade
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":quantidade" => $quantidade,
                    ":id" => $produtoId
                ]);


                // Cadastra venda
                $stmt = $pdo->prepare("
                    INSERT INTO venda
                    (
                        produto_id,
                        quantidade,
                        valor_unitario,
                        custo_unitario,
                        data_venda
                    )
                    VALUES
                    (
                        :produto_id,
                        :quantidade,
                        :valor_unitario,
                        :custo_unitario,
                        :data_venda
                    )
                ");

                $stmt->execute([
                    ":produto_id" =>
                    $produtoId,

                    ":quantidade" =>
                    $quantidade,

                    ":valor_unitario" =>
                    $valorUnitario,

                    ":custo_unitario" =>
                    $custoUnitario,

                    ":data_venda" =>
                    $dataVenda
                ]);


                $pdo->commit();


                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                    "Venda cadastrada e estoque atualizado com sucesso.",
                    "id" => $pdo->lastInsertId()
                ]);

                break;
            }


            // =================================
            // EDITAR VENDA
            // =================================

            $id = (int)$id;

            if ($id <= 0) {
                throw new Exception("ID da venda inválido.");
            }


            // Busca e bloqueia a venda
            $stmt = $pdo->prepare("
                SELECT
                    id,
                    produto_id,
                    quantidade
                FROM venda
                WHERE id = :id
                FOR UPDATE
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $vendaAntiga = $stmt->fetch();

            if (!$vendaAntiga) {
                throw new Exception(
                    "Venda não encontrada."
                );
            }


            $produtoAntigoId =
                (int)$vendaAntiga["produto_id"];

            $quantidadeAntiga =
                (int)$vendaAntiga["quantidade"];


            // =================================
            // MESMO PRODUTO
            // =================================

            if ($produtoAntigoId === $produtoId) {

                $stmt = $pdo->prepare("
                    SELECT
                        id,
                        preco,
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


                $estoqueAtual =
                    (int)$produto["estoque"];


                // Devolve a quantidade antiga
                $estoqueDisponivel =
                    $estoqueAtual + $quantidadeAntiga;


                if ($quantidade > $estoqueDisponivel) {

                    throw new Exception(
                        "Estoque insuficiente. Disponível: "
                            . $estoqueDisponivel
                            . "."
                    );
                }


                // Ajusta estoque
                $novoEstoque =
                    $estoqueDisponivel - $quantidade;


                $stmt = $pdo->prepare("
                    UPDATE produto
                    SET estoque = :estoque
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":estoque" => $novoEstoque,
                    ":id" => $produtoId
                ]);


                $valorUnitario =
                    $produto["preco"];


                // Atualiza venda
                $stmt = $pdo->prepare("
                    UPDATE venda
                    SET
                        produto_id = :produto_id,
                        quantidade = :quantidade,
                        valor_unitario = :valor_unitario,
                        data_venda = :data_venda
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":produto_id" => $produtoId,
                    ":quantidade" => $quantidade,
                    ":valor_unitario" => $valorUnitario,
                    ":data_venda" => $dataVenda,
                    ":id" => $id
                ]);


                $pdo->commit();


                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                    "Venda atualizada e estoque ajustado com sucesso."
                ]);

                break;
            }


            // =================================
            // TROCOU O PRODUTO DA VENDA
            // =================================

            // Primeiro bloqueia os dois produtos
            $idsProdutos = [
                $produtoAntigoId,
                $produtoId
            ];

            sort($idsProdutos);

            foreach ($idsProdutos as $idProduto) {

                $stmt = $pdo->prepare("
                    SELECT
                        id,
                        preco,
                        estoque
                    FROM produto
                    WHERE id = :id
                    FOR UPDATE
                ");

                $stmt->execute([
                    ":id" => $idProduto
                ]);

                $produto = $stmt->fetch();

                if (!$produto) {
                    throw new Exception(
                        "Um dos produtos selecionados não existe."
                    );
                }

                if ($idProduto === $produtoId) {
                    $produtoNovo = $produto;
                }

                if ($idProduto === $produtoAntigoId) {
                    $produtoAntigo = $produto;
                }
            }


            $estoqueNovo =
                (int)$produtoNovo["estoque"];


            if ($quantidade > $estoqueNovo) {

                throw new Exception(
                    "Estoque insuficiente para o novo produto. Disponível: "
                        . $estoqueNovo
                        . "."
                );
            }


            // Devolve estoque do produto antigo
            $stmt = $pdo->prepare("
                UPDATE produto
                SET estoque = estoque + :quantidade
                WHERE id = :id
            ");

            $stmt->execute([
                ":quantidade" => $quantidadeAntiga,
                ":id" => $produtoAntigoId
            ]);


            // Retira estoque do novo produto
            $stmt = $pdo->prepare("
                UPDATE produto
                SET estoque = estoque - :quantidade
                WHERE id = :id
            ");

            $stmt->execute([
                ":quantidade" => $quantidade,
                ":id" => $produtoId
            ]);


            $valorUnitario =
                $produtoNovo["preco"];


            $custoUnitario =
               $produto["custo_reposicao"];


            // Atualiza venda
            $stmt = $pdo->prepare("
                UPDATE venda
                SET
                    custo_unitario = :custo_unitario,
                    produto_id = :produto_id,
                    quantidade = :quantidade,
                    valor_unitario = :valor_unitario,
                    data_venda = :data_venda
                WHERE id = :id
            ");

            $stmt->execute([
                ":custo_unitario" =>$custoUnitario,
                ":produto_id" => $produtoId,
                ":quantidade" => $quantidade,
                ":valor_unitario" => $valorUnitario,
                ":data_venda" => $dataVenda,
                ":id" => $id
            ]);


            $pdo->commit();


            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                "Venda atualizada e estoque ajustado com sucesso."
            ]);

            break;


        // =====================================
        // EXCLUIR VENDA
        // =====================================

        case "excluir":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception(
                    "ID da venda inválido."
                );
            }


            $pdo->beginTransaction();


            // Busca a venda e bloqueia o registro
            $stmt = $pdo->prepare("
                SELECT
                    id,
                    produto_id,
                    quantidade
                FROM venda
                WHERE id = :id
                FOR UPDATE
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $venda = $stmt->fetch();

            if (!$venda) {
                throw new Exception(
                    "Venda não encontrada."
                );
            }


            $produtoId =
                (int)$venda["produto_id"];

            $quantidade =
                (int)$venda["quantidade"];


            // Bloqueia produto
            $stmt = $pdo->prepare("
                SELECT id
                FROM produto
                WHERE id = :id
                FOR UPDATE
            ");

            $stmt->execute([
                ":id" => $produtoId
            ]);

            if (!$stmt->fetch()) {
                throw new Exception(
                    "Produto da venda não encontrado."
                );
            }


            // Devolve estoque
            $stmt = $pdo->prepare("
                UPDATE produto
                SET estoque = estoque + :quantidade
                WHERE id = :id
            ");

            $stmt->execute([
                ":quantidade" => $quantidade,
                ":id" => $produtoId
            ]);


            // Exclui venda
            $stmt = $pdo->prepare("
                DELETE FROM venda
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);


            $pdo->commit();


            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                "Venda excluída e estoque restaurado com sucesso."
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
        "mensagem" => $e->getMessage()
    ]);
}
