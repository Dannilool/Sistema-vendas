"use strict";

const btnLogout =
    document.getElementById("btnLogout") as HTMLButtonElement | null;

if (btnLogout !== null) {

    btnLogout.onclick = async (): Promise<void> => {

        const confirmou: boolean = window.confirm(
            "Deseja realmente sair do sistema?"
        );

        if (!confirmou) {
            return;
        }

        btnLogout.disabled = true;
        btnLogout.textContent = "Saindo...";

        try {

            const resposta: Response = await fetch(
                "/sistema-vendas/api/logout.php",
                {
                    method: "POST",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

            const texto: string =
                await resposta.text();

            const dados: {
                sucesso: boolean;
                mensagem?: string;
            } = JSON.parse(texto);

            if (!resposta.ok || !dados.sucesso) {
                throw new Error(
                    dados.mensagem ||
                    "Não foi possível sair."
                );
            }

            window.location.href =
                "/sistema-vendas/login.php";

        } catch (erro: unknown) {

            console.error(
                "Erro ao realizar logout:",
                erro
            );

            const mensagem: string =
                erro instanceof Error
                    ? erro.message
                    : "Erro ao realizar logout.";

            alert(mensagem);

            btnLogout.disabled = false;
            btnLogout.textContent = "Sair";
        }
    };
}