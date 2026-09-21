<?php

require "../config.php";

header("Content-Type: application/json; charset=UTF-8");

require "auth_admin.php";

try {

    $acao = $_GET["acao"] ?? "listar";

    switch ($acao) {

        /* =====================================================
           LISTAR
        ===================================================== */

        case "listar":

            $stmt = $pdo->query("
                SELECT
                    id,
                    nome,
                    email,
                    perfil,
                    ativo,
                    criado_em
                FROM usuario
                ORDER BY nome ASC
            ");

            $usuarios = $stmt->fetchAll();

            foreach ($usuarios as &$usuario) {
                $usuario["id"] = (int) $usuario["id"];
                $usuario["ativo"] = (int) $usuario["ativo"];
            }

            echo json_encode([
                "sucesso" => true,
                "dados" => $usuarios
            ]);

            break;


        /* =====================================================
           BUSCAR
        ===================================================== */

        case "buscar":

            $id = filter_input(
                INPUT_GET,
                "id",
                FILTER_VALIDATE_INT
            );

            if (!$id) {
                throw new Exception("ID do usuário inválido.");
            }

            $stmt = $pdo->prepare("
                SELECT
                    id,
                    nome,
                    email,
                    perfil,
                    ativo,
                    criado_em
                FROM usuario
                WHERE id = :id
                LIMIT 1
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $usuario = $stmt->fetch();

            if (!$usuario) {
                throw new Exception("Usuário não encontrado.");
            }

            $usuario["id"] = (int) $usuario["id"];
            $usuario["ativo"] = (int) $usuario["ativo"];

            echo json_encode([
                "sucesso" => true,
                "dados" => $usuario
            ]);

            break;


        /* =====================================================
           SALVAR
        ===================================================== */

        case "salvar":

            if ($_SERVER["REQUEST_METHOD"] !== "POST") {
                throw new Exception(
                    "Método de requisição inválido."
                );
            }

            $dados = json_decode(
                file_get_contents("php://input"),
                true
            );

            if (!is_array($dados)) {
                throw new Exception(
                    "Dados do usuário inválidos."
                );
            }

            $id = $dados["id"] ?? null;

            $nome = trim(
                $dados["nome"] ?? ""
            );

            $email = trim(
                $dados["email"] ?? ""
            );

            $senha = $dados["senha"] ?? "";

            $perfil = $dados["perfil"] ?? "usuario";

            if ($nome === "") {
                throw new Exception(
                    "Informe o nome."
                );
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new Exception(
                    "Informe um e-mail válido."
                );
            }

            if (!in_array(
                $perfil,
                ["admin", "usuario"],
                true
            )) {
                throw new Exception(
                    "Perfil inválido."
                );
            }


            /* =============================================
               EDITAR
               ============================================= */

            if ($id) {

                $id = (int) $id;

                $stmt = $pdo->prepare("
                    SELECT id
                    FROM usuario
                    WHERE id = :id
                ");

                $stmt->execute([
                    ":id" => $id
                ]);

                if (!$stmt->fetch()) {
                    throw new Exception(
                        "Usuário não encontrado."
                    );
                }


                /*
                 * Verifica e-mail duplicado
                 */

                $stmt = $pdo->prepare("
                    SELECT id
                    FROM usuario
                    WHERE email = :email
                    AND id <> :id
                    LIMIT 1
                ");

                $stmt->execute([
                    ":email" => $email,
                    ":id" => $id
                ]);

                if ($stmt->fetch()) {
                    throw new Exception(
                        "Este e-mail já está sendo utilizado."
                    );
                }


                /*
                 * Se informou senha, atualiza senha.
                 * Caso contrário, mantém a senha atual.
                 */

                if ($senha !== "") {

                    if (strlen($senha) < 6) {
                        throw new Exception(
                            "A senha deve possuir pelo menos 6 caracteres."
                        );
                    }

                    $senhaHash = password_hash(
                        $senha,
                        PASSWORD_DEFAULT
                    );

                    $stmt = $pdo->prepare("
                        UPDATE usuario
                        SET
                            nome = :nome,
                            email = :email,
                            senha = :senha,
                            perfil = :perfil
                        WHERE id = :id
                    ");

                    $stmt->execute([
                        ":nome" => $nome,
                        ":email" => $email,
                        ":senha" => $senhaHash,
                        ":perfil" => $perfil,
                        ":id" => $id
                    ]);
                } else {

                    $stmt = $pdo->prepare("
                        UPDATE usuario
                        SET
                            nome = :nome,
                            email = :email,
                            perfil = :perfil
                        WHERE id = :id
                    ");

                    $stmt->execute([
                        ":nome" => $nome,
                        ":email" => $email,
                        ":perfil" => $perfil,
                        ":id" => $id
                    ]);
                }


                echo json_encode([
                    "sucesso" => true,
                    "mensagem" =>
                    "Usuário atualizado com sucesso."
                ]);

                break;
            }


            /* =============================================
               NOVO USUÁRIO
               ============================================= */

            if ($senha === "") {
                throw new Exception(
                    "Informe uma senha."
                );
            }

            if (strlen($senha) < 6) {
                throw new Exception(
                    "A senha deve possuir pelo menos 6 caracteres."
                );
            }


            /*
             * Verifica e-mail duplicado
             */

            $stmt = $pdo->prepare("
                SELECT id
                FROM usuario
                WHERE email = :email
                LIMIT 1
            ");

            $stmt->execute([
                ":email" => $email
            ]);

            if ($stmt->fetch()) {
                throw new Exception(
                    "Este e-mail já está sendo utilizado."
                );
            }


            $senhaHash = password_hash(
                $senha,
                PASSWORD_DEFAULT
            );


            $stmt = $pdo->prepare("
                INSERT INTO usuario
                (
                    nome,
                    email,
                    senha,
                    perfil,
                    ativo
                )
                VALUES
                (
                    :nome,
                    :email,
                    :senha,
                    :perfil,
                    1
                )
            ");

            $stmt->execute([
                ":nome" => $nome,
                ":email" => $email,
                ":senha" => $senhaHash,
                ":perfil" => $perfil
            ]);


            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                "Usuário cadastrado com sucesso.",
                "id" =>
                (int) $pdo->lastInsertId()
            ]);

            break;


        /* =====================================================
           ALTERAR STATUS
        ===================================================== */

        case "alterar_status":

            if ($_SERVER["REQUEST_METHOD"] !== "POST") {
                throw new Exception(
                    "Método de requisição inválido."
                );
            }

            $dados = json_decode(
                file_get_contents("php://input"),
                true
            );

            if (!is_array($dados)) {
                throw new Exception(
                    "Dados inválidos."
                );
            }

            $id = isset($dados["id"])
                ? (int) $dados["id"]
                : 0;

            if ($id <= 0) {
                throw new Exception(
                    "ID do usuário inválido."
                );
            }


            /*
             * Não permite desativar a própria conta.
             */

            if ($id === (int) $_SESSION["usuario_id"]) {
                throw new Exception(
                    "Você não pode desativar o usuário atualmente logado."
                );
            }


            $stmt = $pdo->prepare("
                SELECT ativo
                FROM usuario
                WHERE id = :id
                LIMIT 1
            ");

            $stmt->execute([
                ":id" => $id
            ]);

            $usuario = $stmt->fetch();

            if (!$usuario) {
                throw new Exception(
                    "Usuário não encontrado."
                );
            }

            $novoStatus =
                ((int) $usuario["ativo"] === 1)
                ? 0
                : 1;


            $stmt = $pdo->prepare("
                UPDATE usuario
                SET ativo = :ativo
                WHERE id = :id
            ");

            $stmt->execute([
                ":ativo" => $novoStatus,
                ":id" => $id
            ]);


            echo json_encode([
                "sucesso" => true,
                "mensagem" =>
                $novoStatus === 1
                    ? "Usuário ativado com sucesso."
                    : "Usuário desativado com sucesso.",
                "ativo" => $novoStatus
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
