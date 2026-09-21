<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$codigo = (int) ($_GET["codigo"] ?? 403);

if ($codigo === 403) {
    $titulo = "Acesso não autorizado";
    $mensagem = "Você não tem permissão para acessar esta página.";
    $icone = "🔒";
} else {
    $codigo = 404;
    $titulo = "Página não encontrada";
    $mensagem = "A página que você tentou acessar não foi encontrada.";
    $icone = "🔎";
}

$logado = isset($_SESSION["usuario_id"]);
$admin = ($_SESSION["usuario_perfil"] ?? "") === "admin";

if (!$logado) {
    $urlVoltar = "/sistema-vendas/login.php";
    $textoBotao = "Voltar para o login";
} elseif ($admin) {
    $urlVoltar = "/sistema-vendas/index.php";
    $textoBotao = "Voltar ao dashboard";
} else {
    $urlVoltar = "/sistema-vendas/vendas/index.php";
    $textoBotao = "Ir para Vendas";
}

http_response_code($codigo);

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">
    <title><?= $codigo ?> - VendasPro</title>
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet">
    <link
        rel="stylesheet"
        href="/sistema-vendas/assets/css/erro.css">
</head>

<body>
    <main class="erro-page">
        <section class="erro-card">
            <div class="erro-icone">
                <?= $icone ?>
            </div>

            <div class="erro-codigo">
                <?= $codigo ?>
            </div>

            <h1><?= htmlspecialchars($titulo, ENT_QUOTES, "UTF-8") ?></h1>

            <p>
                <?= htmlspecialchars($mensagem, ENT_QUOTES, "UTF-8") ?>
            </p>

            <a
                href="<?= htmlspecialchars($urlVoltar, ENT_QUOTES, "UTF-8") ?>"
                class="btn btn-primary px-4 py-2">
                <?= htmlspecialchars($textoBotao, ENT_QUOTES, "UTF-8") ?>
            </a>
        </section>
    </main>
</body>

</html>
