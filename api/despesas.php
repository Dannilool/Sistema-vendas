<?php

require "../config.php";
require "auth.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    $acao = $_GET["acao"] ?? "listar";

    switch ($acao) {

        case "listar":

            $stmt = $pdo->query("
                SELECT
                    id,
                    categoria,
                    descricao,
                    valor,
                    data_despesa
                FROM despesa
                ORDER BY data_despesa DESC, id DESC
            ");

            echo json_encode([
                "sucesso" => true,
                "dados" => $stmt->fetchAll()
            ]);

            break;


        case "buscar":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception(
                    "ID da despesa inválido."
                );
            }

            $stmt = $pdo->prepare("
                SELECT
                    id,
                    categoria,
                    descricao,
                    valor,
                    data_despesa
                FROM despesa
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $despesa = $stmt->fetch();

            if (!$despesa) {
                throw new Exception(
                    "Despesa não encontrada."
                );
            }

            echo json_encode([
                "sucesso" => true,
                "dados" => $despesa
            ]);

            break;


        case "salvar":

            $dados = json_decode(
                file_get_contents("php://input"),
                true
            );

            if (!is_array($dados)) {
                throw new Exception(
                    "Dados inválidos."
                );
            }

            $id = $dados["id"] ?? null;

            $categoria =
                trim($dados["categoria"] ?? "");

            $descricao =
                trim($dados["descricao"] ?? "");

            $valor =
                $dados["valor"] ?? null;

            $dataDespesa =
                $dados["data_despesa"] ?? null;


            if ($categoria === "") {
                throw new Exception(
                    "Informe a categoria."
                );
            }

            if (
                !is_numeric($valor) ||
                (float)$valor < 0
            ) {
                throw new Exception(
                    "Informe um valor válido."
                );
            }

            $valor =
                round((float)$valor, 2);

            if (!$dataDespesa) {
                $dataDespesa =
                    date("Y-m-d H:i:s");
            }


            if ($id) {

                $id = (int)$id;

                if ($id <= 0) {
                    throw new Exception(
                        "ID da despesa inválido."
                    );
                }

                $stmt = $pdo->prepare("
                    UPDATE despesa
                    SET
                        categoria = :categoria,
                        descricao = :descricao,
                        valor = :valor,
                        data_despesa = :data_despesa
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":categoria" =>
                        $categoria,

                    ":descricao" =>
                        $descricao !== ""
                            ? $descricao
                            : null,

                    ":valor" =>
                        $valor,

                    ":data_despesa" =>
                        $dataDespesa,

                    ":id" =>
                        $id
                ]);

                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                        "Despesa atualizada com sucesso."
                ]);

            } else {

                $stmt = $pdo->prepare("
                    INSERT INTO despesa
                    (
                        categoria,
                        descricao,
                        valor,
                        data_despesa
                    )
                    VALUES
                    (
                        :categoria,
                        :descricao,
                        :valor,
                        :data_despesa
                    )
                ");

                $stmt->execute([
                    ":categoria" =>
                        $categoria,

                    ":descricao" =>
                        $descricao !== ""
                            ? $descricao
                            : null,

                    ":valor" =>
                        $valor,

                    ":data_despesa" =>
                        $dataDespesa
                ]);

                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                        "Despesa cadastrada com sucesso.",
                    "id" =>
                        $pdo->lastInsertId()
                ]);
            }

            break;


        case "excluir":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception(
                    "ID da despesa inválido."
                );
            }

            $stmt = $pdo->prepare("
                DELETE FROM despesa
                WHERE id = :id
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            if ($stmt->rowCount() === 0) {
                throw new Exception(
                    "Despesa não encontrada."
                );
            }

            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                    "Despesa excluída com sucesso."
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
        "mensagem" =>
            $e->getMessage()
    ]);
}