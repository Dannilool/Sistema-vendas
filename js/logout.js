"use strict";
const btnLogout = document.getElementById("btnLogout");
if (btnLogout !== null) {
    btnLogout.onclick = async () => {
        const confirmou = window.confirm("Deseja realmente sair do sistema?");
        if (!confirmou) {
            return;
        }
        btnLogout.disabled = true;
        btnLogout.textContent = "Saindo...";
        try {
            const resposta = await fetch("/sistema-vendas/api/logout.php", {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                }
            });
            const texto = await resposta.text();
            const dados = JSON.parse(texto);
            if (!resposta.ok || !dados.sucesso) {
                throw new Error(dados.mensagem ||
                    "Não foi possível sair.");
            }
            window.location.href =
                "/sistema-vendas/login.php";
        }
        catch (erro) {
            console.error("Erro ao realizar logout:", erro);
            const mensagem = erro instanceof Error
                ? erro.message
                : "Erro ao realizar logout.";
            alert(mensagem);
            btnLogout.disabled = false;
            btnLogout.textContent = "Sair";
        }
    };
}
