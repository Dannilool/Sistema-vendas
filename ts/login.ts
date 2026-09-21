"use strict";

((): void => {

    /* =========================================================
       INTERFACES
    ========================================================= */

    interface RespostaLogin {
        sucesso: boolean;
        mensagem?: string;
        usuario?: {
            perfil: string;
        };
    }


    /* =========================================================
       ELEMENTOS DO FORMULÁRIO
    ========================================================= */

    const formLogin =
        document.getElementById("formLogin") as HTMLFormElement | null;

    const email =
        document.getElementById("email") as HTMLInputElement | null;

    const senha =
        document.getElementById("senha") as HTMLInputElement | null;

    const mensagem =
        document.getElementById("mensagem") as HTMLElement | null;

    const btnLogin =
        document.getElementById("btnLogin") as HTMLButtonElement | null;


    /* =========================================================
       VERIFICAÇÃO DOS ELEMENTOS
    ========================================================= */

    if (
        formLogin === null ||
        email === null ||
        senha === null ||
        mensagem === null ||
        btnLogin === null
    ) {
        throw new Error(
            "Elementos do formulário de login não encontrados."
        );
    }


    /* =========================================================
       MENSAGENS
    ========================================================= */

    function mostrarMensagem(
        texto: string,
        tipo: string
    ): void {

        if (mensagem === null) {
            return;
        }

        mensagem.textContent = texto;

        mensagem.className =
            `alert alert-${tipo}`;
    }


    function limparMensagem(): void {

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

    formLogin.addEventListener(
        "submit",
        async (evento: SubmitEvent): Promise<void> => {

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

                const resposta: Response =
                    await fetch(
                        "/sistema-vendas/api/login.php",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email:
                                    email.value.trim(),

                                senha:
                                    senha.value
                            })
                        }
                    );


                /* -----------------------------------------
                   LÊ RESPOSTA
                ----------------------------------------- */

                const dados: RespostaLogin =
                    await resposta.json();


                /* -----------------------------------------
                   VERIFICA ERRO HTTP
                ----------------------------------------- */

                if (!resposta.ok) {

                    throw new Error(
                        dados.mensagem ||
                        "Erro ao realizar o login."
                    );

                }


                /* -----------------------------------------
                   VERIFICA RESPOSTA DA API
                ----------------------------------------- */

                if (!dados.sucesso) {

                    throw new Error(
                        dados.mensagem ||
                        "E-mail ou senha inválidos."
                    );

                }


                /* -----------------------------------------
                   LOGIN REALIZADO
                ----------------------------------------- */

                mostrarMensagem(
                    "Login realizado com sucesso!",
                    "success"
                );


                /* -----------------------------------------
                   REDIRECIONAMENTO
                ----------------------------------------- */

                setTimeout(
                    (): void => {

                        if (dados.usuario?.perfil === "admin") {
                            window.location.href =
                                "/sistema-vendas/index.php";
                        } else {
                            window.location.href =
                                "/sistema-vendas/vendas/index.php";
                        }

                    },
                    500
                );


            } catch (erro: unknown) {

                console.error(
                    "Erro no login:",
                    erro
                );


                let mensagemErro: string =
                    "Erro ao realizar login.";


                if (
                    erro instanceof Error &&
                    erro.message
                ) {

                    mensagemErro =
                        erro.message;

                }


                mostrarMensagem(
                    mensagemErro,
                    "danger"
                );


            } finally {

                /* -----------------------------------------
                   RESTAURA BOTÃO
                ----------------------------------------- */

                btnLogin.disabled = false;

                btnLogin.textContent =
                    "Entrar";

            }

        }
    );

})();