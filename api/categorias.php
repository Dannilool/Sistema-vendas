<?php

require "../config.php";
require "auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    $acao = $_GET["acao"] ?? "listar";

    switch ($acao) {

        case "listar":

            $stmt = $pdo->query("
                SELECT id, nome
                FROM categoria
                ORDER BY nome
            ");

            $categorias = $stmt->fetchAll();

            echo json_encode([
                "sucesso" => true,
                "dados" => $categorias
            ]);

            break;

        case "buscar":

            $id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

            if (!$id) {
                throw new Exception("ID da categoria inválido.");
            }

            $stmt = $pdo->prepare("
                SELECT id, nome
                FROM categoria
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $categoria = $stmt->fetch();

            if (!$categoria) {
                throw new Exception("Categoria não encontrada.");
            }

            echo json_encode([
                "sucesso" => true,
                "dados" => $categoria
            ]);

            break;

        case "salvar":

            $dados = json_decode(
                file_get_contents("php://input"),
                true
            );

            $id = $dados["id"] ?? null;
            $nome = trim($dados["nome"] ?? "");

            if ($nome === "") {
                throw new Exception(
                    "Informe o nome da categoria."
                );
            }

            if ($id) {

                $stmt = $pdo->prepare("
                    UPDATE categoria
                    SET nome = :nome
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":nome" => $nome,
                    ":id" => $id
                ]);

                echo json_encode([
                    "sucesso" => true,
                    "mensagem" => "Categoria atualizada com sucesso."
                ]);

            } else {

                $stmt = $pdo->prepare("
                    INSERT INTO categoria (nome)
                    VALUES (:nome)
                ");

                $stmt->execute([
                    ":nome" => $nome
                ]);

                echo json_encode([
                    "sucesso" => true,
                    "mensagem" => "Categoria cadastrada com sucesso.",
                    "id" => $pdo->lastInsertId()
                ]);
            }

            break;

        case "excluir":

            $id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT);

            if (!$id) {
                throw new Exception("ID da categoria inválido.");
            }

            $stmt = $pdo->prepare("
                SELECT COUNT(*)
                FROM produto
                WHERE categoria_id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $quantidadeProdutos = (int) $stmt->fetchColumn();

            if ($quantidadeProdutos > 0) {

                throw new Exception(
                    "Não é possível excluir esta categoria porque existem produtos vinculados a ela."
                );
            }

            $stmt = $pdo->prepare("
                DELETE FROM categoria
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Categoria excluída com sucesso."
            ]);

            break;

        default:

            throw new Exception("Ação inválida.");
    }

} catch (Throwable $e) {

    http_response_code(400);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => $e->getMessage()
    ]);
}