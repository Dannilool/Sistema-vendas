"use strict";
(() => {
    /* =========================================================
       INTERFACES
    ========================================================= */
    /* =========================================================
       ELEMENTOS DO FORMULÁRIO
    ========================================================= */
    const formLogin = document.getElementById("formLogin");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    const mensagem = document.getElementById("mensagem");
    const btnLogin = document.getElementById("btnLogin");
    /* =========================================================
       VERIFICAÇÃO DOS ELEMENTOS
    ========================================================= */
    if (formLogin === null ||
        email === null ||
        senha === null ||
        mensagem === null ||
        btnLogin === null) {
        throw new Error("Elementos do formulário de login não encontrados.");
    }
    /* =========================================================
       MENSAGENS
    ========================================================= */
    function mostrarMensagem(texto, tipo) {
        if (mensagem === null) {
            return;
        }
        mensagem.textContent = texto;
        mensagem.className =
            `alert alert-${tipo}`;
    }
    function limparMensagem() {
        if (mensagem === null) {
            return;
        }
        mensagem.textContent = "";
        mensagem.className =
            "alert d-none";
    }
    /* =========================================================
       LOGIN
    ========================================================= */
    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();
        limparMensagem();
        /* ---------------------------------------------
           DESABILITA BOTÃO
        --------------------------------------------- */
        btnLogin.disabled = true;
        btnLogin.textContent =
            "Entrando...";
        try {
            /* -----------------------------------------
               REQUISIÇÃO
            ----------------------------------------- */
            const resposta = await fetch("/sistema-vendas/api/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email.value.trim(),
                    senha: senha.value
                })
            });
            /* -----------------------------------------
               LÊ RESPOSTA
            ----------------------------------------- */
            const dados = await resposta.json();
            /* -----------------------------------------
               VERIFICA ERRO HTTP
            ----------------------------------------- */
            if (!resposta.ok) {
                throw new Error(dados.mensagem ||
                    "Erro ao realizar o login.");
            }
            /* -----------------------------------------
               VERIFICA RESPOSTA DA API
            ----------------------------------------- */
            if (!dados.sucesso) {
                throw new Error(dados.mensagem ||
                    "E-mail ou senha inválidos.");
            }
            /* -----------------------------------------
               LOGIN REALIZADO
            ----------------------------------------- */
            mostrarMensagem("Login realizado com sucesso!", "success");
            /* -----------------------------------------
               REDIRECIONAMENTO
            ----------------------------------------- */
            setTimeout(() => {
                window.location.href =
                    "/sistema-vendas/index.php";
            }, 500);
        }
        catch (erro) {
            console.error("Erro no login:", erro);
            let mensagemErro = "Erro ao realizar login.";
            if (erro instanceof Error &&
                erro.message) {
                mensagemErro =
                    erro.message;
            }
            mostrarMensagem(mensagemErro, "danger");
        }
        finally {
            /* -----------------------------------------
               RESTAURA BOTÃO
            ----------------------------------------- */
            btnLogin.disabled = false;
            btnLogin.textContent =
                "Entrar";
        }
    });
})();
