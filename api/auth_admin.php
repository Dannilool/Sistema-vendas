<?php

require_once __DIR__ . "/auth.php";

if (($_SESSION["usuario_perfil"] ?? "") !== "admin") {

    http_response_code(403);

    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Acesso permitido somente para administradores."
    ]);

    exit;
}