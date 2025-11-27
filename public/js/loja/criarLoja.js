const servidor = "";

const form = document.getElementById("form-criar-loja");
const btnCancelar = document.querySelector(".btn-cancelar");

btnCancelar?.addEventListener("click", () => {
  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const morada = document.getElementById("morada").value.trim();
  const gerenteRaw = document.getElementById("gerente_id").value;
  const gerente_id = gerenteRaw ? Number(gerenteRaw) : null;

  if (!nome) {
    alert("Nome é obrigatório.");
    return;
  }

  const URL = servidor + "/novaLoja";
  const res = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome, morada, gerente_id })
  });

  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao criar loja");
    return;
  }

  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});
