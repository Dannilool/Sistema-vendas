<?php

require "../config.php";

header("Content-Type: application/json; charset=UTF-8");

session_start();

try {

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
            "Dados de login inválidos."
        );
    }

    $email = trim(
        $dados["email"] ?? ""
    );

    $senha = $dados["senha"] ?? "";

    if ($email === "") {
        throw new Exception(
            "Informe o e-mail."
        );
    }

    if ($senha === "") {
        throw new Exception(
            "Informe a senha."
        );
    }

    $stmt = $pdo->prepare("
        SELECT
            id,
            nome,
            email,
            senha,
            perfil,
            ativo
        FROM usuario
        WHERE email = :email
        LIMIT 1
    ");

    $stmt->execute([
        ":email" => $email
    ]);

    $usuario = $stmt->fetch();

    if (!$usuario) {
        throw new Exception(
            "E-mail ou senha inválidos."
        );
    }

    if ((int) $usuario["ativo"] !== 1) {
        throw new Exception(
            "Este usuário está desativado."
        );
    }

    if (!password_verify(
        $senha,
        $usuario["senha"]
    )) {
        throw new Exception(
            "E-mail ou senha inválidos."
        );
    }

    session_regenerate_id(true);

    $_SESSION["usuario_id"] =
        (int) $usuario["id"];

    $_SESSION["usuario_nome"] =
        $usuario["nome"];

    $_SESSION["usuario_email"] =
        $usuario["email"];

    $_SESSION["usuario_perfil"] =
        $usuario["perfil"];

    echo json_encode([
        "sucesso" => true,
        "mensagem" => "Login realizado com sucesso.",
        "usuario" => [
            "id" => (int) $usuario["id"],
            "nome" => $usuario["nome"],
            "email" => $usuario["email"],
            "perfil" => $usuario["perfil"]
        ]
    ]);

} catch (Throwable $e) {

    http_response_code(400);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => $e->getMessage()
    ]);
}
