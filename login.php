<?php

session_start();

if (isset($_SESSION["usuario_id"])) {

    if (($_SESSION["usuario_perfil"] ?? "") === "admin") {
        header("Location: /sistema-vendas/index.php");
    } else {
        header("Location: /sistema-vendas/vendas/index.php");
    }

    exit;
}

?>

<!DOCTYPE html>

<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        Login - Sistema de Vendas
    </title>


    <!-- BOOTSTRAP -->

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
    >


    <!-- CSS DO LOGIN -->

    <link
        rel="stylesheet"
        href="/sistema-vendas/assets/css/login.css"
    >

</head>


<body>


<main class="login-container">


    <div class="login-card">


        <!-- TÍTULO -->

        <div class="text-center mb-4">

            <h1 class="login-title">
                Sistema de Vendas
            </h1>

            <p class="text-muted">
                Acesse sua conta
            </p>

        </div>


        <!-- FORMULÁRIO -->

        <form id="formLogin">


            <!-- E-MAIL -->

            <div class="mb-3">

                <label
                    for="email"
                    class="form-label"
                >
                    E-mail
                </label>

                <input
                    type="email"
                    id="email"
                    class="form-control"
                    placeholder="Digite seu e-mail"
                    autocomplete="email"
                    required
                >

            </div>


            <!-- SENHA -->

            <div class="mb-3">

                <label
                    for="senha"
                    class="form-label"
                >
                    Senha
                </label>

                <input
                    type="password"
                    id="senha"
                    class="form-control"
                    placeholder="Digite sua senha"
                    autocomplete="current-password"
                    required
                >

            </div>


            <!-- MENSAGEM -->

            <div
                id="mensagem"
                class="alert d-none"
                role="alert"
            >
            </div>


            <!-- BOTÃO -->

            <button
                type="submit"
                id="btnLogin"
                class="btn btn-primary w-100"
            >

                Entrar

            </button>


        </form>


    </div>


</main>


<!-- JAVASCRIPT -->

<script src="/sistema-vendas/js/login.js"></script>

</body>

</html>