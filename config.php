<?php

date_default_timezone_set("America/Sao_Paulo");

$host = "localhost";
$db = "sistema_vendas";
$user = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $password
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

    $pdo->setAttribute(
        PDO::ATTR_DEFAULT_FETCH_MODE,
        PDO::FETCH_ASSOC
    );

} catch (PDOException $e) {
    die("Erro na conexão com o banco de dados.");
}