<?php

require "../config.php";
require "auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    $acao = $_GET["acao"] ?? "listar";

    switch ($acao) {

        // =========================
        // LISTAR PRODUTOS
        // =========================
        case "listar":

            $stmt = $pdo->query("
                SELECT
                    p.id,
                    p.nome,
                    p.preco,
                    p.custo_reposicao,
                    p.estoque,
                    p.categoria_id,
                    c.nome AS categoria
                FROM produto p
                INNER JOIN categoria c
                    ON c.id = p.categoria_id
                ORDER BY p.nome
            ");

            $produtos = $stmt->fetchAll();

            foreach ($produtos as &$produto) {

                $produto["id"] =
                    (int) $produto["id"];

                $produto["preco"] =
                    (float) $produto["preco"];

                $produto["custo_reposicao"] =
                    (float) $produto["custo_reposicao"];

                $produto["estoque"] =
                    (int) $produto["estoque"];

                $produto["categoria_id"] =
                    (int) $produto["categoria_id"];
            }

            unset($produto);

            echo json_encode([
                "sucesso" => true,
                "dados" => $produtos
            ]);

            break;


        // =========================
        // BUSCAR PRODUTO
        // =========================
        case "buscar":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception(
                    "ID do produto inválido."
                );
            }

            $stmt = $pdo->prepare("
                SELECT
                    id,
                    nome,
                    preco,
                    custo_reposicao,
                    estoque,
                    categoria_id
                FROM produto
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $produto = $stmt->fetch();

            if (!$produto) {
                throw new Exception(
                    "Produto não encontrado."
                );
            }

            $produto["id"] =
                (int) $produto["id"];

            $produto["preco"] =
                (float) $produto["preco"];

            $produto["custo_reposicao"] =
                (float) $produto["custo_reposicao"];

            $produto["estoque"] =
                (int) $produto["estoque"];

            $produto["categoria_id"] =
                (int) $produto["categoria_id"];

            echo json_encode([
                "sucesso" => true,
                "dados" => $produto
            ]);

            break;


        // =========================
        // SALVAR PRODUTO
        // =========================
        case "salvar":

            $dados = json_decode(
                file_get_contents("php://input"),
                true
            );

            $id =
                $dados["id"] ?? null;

            $nome =
                trim($dados["nome"] ?? "");

            $preco =
                $dados["preco"] ?? null;

            $custoReposicao =
                $dados["custo_reposicao"] ?? null;

            $estoque =
                $dados["estoque"] ?? null;

            $categoriaId =
                $dados["categoria_id"] ?? null;


            // =========================
            // VALIDAÇÕES
            // =========================

            if ($nome === "") {
                throw new Exception(
                    "Informe o nome do produto."
                );
            }

            if (
                !is_numeric($preco) ||
                $preco < 0
            ) {
                throw new Exception(
                    "Informe um preço válido."
                );
            }

            if (
                !is_numeric($custoReposicao) ||
                $custoReposicao < 0
            ) {
                throw new Exception(
                    "Informe um custo de reposição válido."
                );
            }

            if (
                !is_numeric($estoque) ||
                $estoque < 0
            ) {
                throw new Exception(
                    "Informe um estoque válido."
                );
            }

            if (
                !is_numeric($categoriaId) ||
                $categoriaId <= 0
            ) {
                throw new Exception(
                    "Selecione uma categoria."
                );
            }


            // =========================
            // VERIFICA CATEGORIA
            // =========================

            $stmt = $pdo->prepare("
                SELECT id
                FROM categoria
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $categoriaId
            ]);

            if (!$stmt->fetch()) {
                throw new Exception(
                    "A categoria selecionada não existe."
                );
            }


            // =========================
            // EDITAR
            // =========================

            if ($id) {

                $stmt = $pdo->prepare("
                    UPDATE produto
                    SET
                        nome = :nome,
                        preco = :preco,
                        custo_reposicao = :custo_reposicao,
                        estoque = :estoque,
                        categoria_id = :categoria_id
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":nome" =>
                    $nome,

                    ":preco" =>
                    $preco,

                    ":custo_reposicao" =>
                    $custoReposicao,

                    ":estoque" =>
                    $estoque,

                    ":categoria_id" =>
                    $categoriaId,

                    ":id" =>
                    $id
                ]);

                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                    "Produto atualizado com sucesso."
                ]);
            }

            // =========================
            // CADASTRAR
            // =========================
            else {

                $stmt = $pdo->prepare("
                    INSERT INTO produto
                    (
                        nome,
                        preco,
                        custo_reposicao,
                        estoque,
                        categoria_id
                    )
                    VALUES
                    (
                        :nome,
                        :preco,
                        :custo_reposicao,
                        :estoque,
                        :categoria_id
                    )
                ");

                $stmt->execute([
                    ":nome" =>
                    $nome,

                    ":preco" =>
                    $preco,

                    ":custo_reposicao" =>
                    $custoReposicao,

                    ":estoque" =>
                    $estoque,

                    ":categoria_id" =>
                    $categoriaId
                ]);

                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                    "Produto cadastrado com sucesso.",
                    "id" =>
                    (int) $pdo->lastInsertId()
                ]);
            }

            break;


        // =========================
        // EXCLUIR PRODUTO
        // =========================
        case "excluir":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception(
                    "ID do produto inválido."
                );
            }


            $stmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM venda
                WHERE produto_id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $quantidadeVendas =
                (int) $stmt->fetchColumn();


            if ($quantidadeVendas > 0) {

                throw new Exception(
                    "Não é possível excluir este produto porque existem vendas vinculadas a ele."
                );
            }


            $stmt = $pdo->prepare("
                DELETE FROM produto
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                "Produto excluído com sucesso."
            ]);

            break;


        default:

            throw new Exception(
                "Ação inválida."
            );
    }
} catch (Throwable $e) {

    http_response_code(400);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => $e->getMessage()
    ]);
}
