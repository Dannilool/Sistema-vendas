<?php

require_once __DIR__ . "/auth.php";

?>

<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">

    <title>Sistema de Gestão de Vendas</title>


    <!-- BOOTSTRAP -->

    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
        rel="stylesheet">


    <!-- CSS PRINCIPAL -->

    <link
        rel="stylesheet"
        href="/sistema-vendas/assets/css/style.css">

</head>


<body>

    <div class="d-flex min-vh-100">


        <!-- =====================================================
         MENU LATERAL
    ====================================================== -->

        <aside class="sidebar">


            <!-- LOGO -->

            <div class="sidebar-logo">

                <h4>
                    📊 VendasPro
                </h4>

                <span>
                    Sistema de Gestão
                </span>

            </div>


            <!-- MENU -->

            <nav class="sidebar-menu">


                <!-- DASHBOARD -->

                <a
                    href="/sistema-vendas/index.php"
                    class="menu-item">

                    📊 Dashboard

                </a>


                <!-- CATEGORIAS -->

                <a
                    href="/sistema-vendas/categorias/index.php"
                    class="menu-item">

                    📁 Categorias

                </a>


                <!-- PRODUTOS -->

                <a
                    href="/sistema-vendas/produtos/index.php"
                    class="menu-item">

                    📦 Produtos

                </a>


                <!-- VENDAS -->

                <a
                    href="/sistema-vendas/vendas/index.php"
                    class="menu-item">

                    🛒 Vendas

                </a>
                <?php if (($_SESSION["usuario_perfil"] ?? "") === "admin"): ?>

                    <a
                        href="/sistema-vendas/usuarios/index.php"
                        class="menu-item">

                        👥 Usuários

                    </a>

                <?php endif; ?>

            </nav>


        </aside>



        <!-- =====================================================
         CONTEÚDO PRINCIPAL
    ====================================================== -->

        <main class="main-content">


            <!-- =================================================
             TOPBAR
        ================================================== -->

            <header class="topbar">


                <div>

                    <h5 class="mb-0">
                        Sistema de Gestão de Vendas
                    </h5>

                    <small class="text-muted">
                        Controle de produtos e vendas
                    </small>

                </div>


                <!-- USUÁRIO -->

                <div class="usuario d-flex align-items-center gap-3">

                    <span>
                        👤
                        <?= htmlspecialchars(
                            $_SESSION["usuario_nome"] ?? "Usuário",
                            ENT_QUOTES,
                            "UTF-8"
                        ) ?>
                    </span>

                    <button
                        type="button"
                        id="btnLogout"
                        class="btn btn-sm btn-outline-danger">
                        Sair
                    </button>

                </div>


            </header>



            <!-- =================================================
             ÁREA DA PÁGINA
        ================================================== -->

            <div class="container-fluid p-4">