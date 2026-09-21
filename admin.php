<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION["usuario_id"])) {
    header("Location: login.php");
    exit;
}

if (($_SESSION["usuario_perfil"] ?? "") !== "admin") {
    http_response_code(403);
    exit("Acesso negado.");
}