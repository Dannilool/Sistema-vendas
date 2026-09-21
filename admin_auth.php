<?php

require_once __DIR__ . "/api/auth.php";

if (($_SESSION["usuario_perfil"] ?? "") !== "admin") {

    header("Location: /sistema-vendas/index.php");

    exit;
}