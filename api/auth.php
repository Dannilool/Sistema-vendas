<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json; charset=UTF-8");

if (!isset($_SESSION["usuario_id"])) {
    http_response_code(401);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Usuário não autenticado."
    ]);

    exit;
}

if (($_SESSION["usuario_perfil"] ?? "") === "admin") {
    return;
}

$arquivoAtual = basename($_SERVER["SCRIPT_NAME"] ?? "");
$metodo = strtoupper($_SERVER["REQUEST_METHOD"] ?? "GET");
$acao = $_GET["acao"] ?? "listar";

$acessoPermitido = false;

if ($arquivoAtual === "vendas.php") {
    $acessoPermitido = true;
}

if (
    $arquivoAtual === "produtos.php" &&
    $metodo === "GET" &&
    in_array($acao, ["listar", "buscar"], true)
) {
    $acessoPermitido = true;
}

if (!$acessoPermitido) {
    http_response_code(403);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Acesso não autorizado."
    ]);

    exit;
}
