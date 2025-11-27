// public/js/servico/criarServico.js
const servidor = "";

const form = document.getElementById("form-criar-servico");
const btnCancelar = document.querySelector(".btn-cancelar");

btnCancelar?.addEventListener("click", () => {
  window.location.href = "/views/admin/abaServico/listaServico.html";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

  if (!nome) {
    alert("Nome é obrigatório.");
    return;
  }

  const URL = servidor + "/novoServico";
  const res = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome, descricao })
  });

  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao criar serviço");
    return;
  }

  window.location.href = "/views/admin/abaServico/listaServico.html";
});
