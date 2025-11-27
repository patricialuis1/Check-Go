const servidor = "";
const form = document.getElementById("form-criar-loja");
const btnCancelar = document.querySelector(".btn-cancelar");
const listaServicosEl = document.getElementById("lista-servicos-checkboxes");

btnCancelar?.addEventListener("click", () => {
  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});

// carrega serviços para checkboxes
async function carregarServicos() {
  const res = await fetch(servidor + "/servicos");
  const servicos = await res.json();

  listaServicosEl.innerHTML = servicos.map(s => `
    <label style="display:flex;gap:8px;align-items:center;margin:6px 0;">
      <input type="checkbox" value="${s.id}">
      ${s.nome}
    </label>
  `).join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const morada = document.getElementById("morada").value.trim();
  const gerenteRaw = document.getElementById("gerente_id").value;
  const gerente_id = gerenteRaw ? Number(gerenteRaw) : null;

  const servicoIds = [...listaServicosEl.querySelectorAll("input[type=checkbox]:checked")]
    .map(cb => Number(cb.value));

  if (!nome) return alert("Nome é obrigatório.");
  if (!servicoIds.length) return alert("Tens de escolher pelo menos 1 serviço.");

  const res = await fetch(servidor + "/novaLoja", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome, morada, gerente_id, servicoIds })
  });

  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao criar loja");
    return;
  }

  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});

carregarServicos();
