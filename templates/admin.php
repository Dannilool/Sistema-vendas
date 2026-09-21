<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION["usuario_id"])) {
    header("Location: /sistema-vendas/login.php");
    exit;
}

if (($_SESSION["usuario_perfil"] ?? "") !== "admin") {
    header("Location: /sistema-vendas/erro.php?codigo=403");
    exit;
}
