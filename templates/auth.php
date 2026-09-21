<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION["usuario_id"])) {
    header("Location: /sistema-vendas/login.php");
    exit;
}

$rotaAtual = parse_url(
    $_SERVER["REQUEST_URI"] ?? "",
    PHP_URL_PATH
) ?? "";

$rotaNormalizada = rtrim($rotaAtual, "/");

if (
    ($_SESSION["usuario_perfil"] ?? "") !== "admin" &&
    $rotaNormalizada !== "/sistema-vendas/vendas" &&
    $rotaNormalizada !== "/sistema-vendas/vendas/index.php"
) {
    header("Location: /sistema-vendas/erro.php?codigo=403");
    exit;
}
