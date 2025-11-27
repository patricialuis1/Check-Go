const servidor = "";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("form-update-loja");
const nomeInput = document.getElementById("nome");
const moradaInput = document.getElementById("morada");
const gerenteInput = document.getElementById("gerente_id");
const listaServicosEl = document.getElementById("lista-servicos-checkboxes");

let servicosSelecionados = new Set();

async function carregarServicosELoja() {
  if (!id) {
    alert("ID inválido");
    window.location.href = "/views/admin/abaLoja/listaLoja.html";
    return;
  }

  const [resLoja, resServicos] = await Promise.all([
    fetch(servidor + "/lojas/" + id),
    fetch(servidor + "/servicos")
  ]);

  const loja = await resLoja.json();
  const servicos = await resServicos.json();

  nomeInput.value = loja.nome ?? "";
  moradaInput.value = loja.morada ?? "";
  gerenteInput.value = loja.gerente_id ?? "";

  servicosSelecionados = new Set(
    (loja.servicos_ids || []) // se backend mandar ids
  );

  // render checkboxes
  listaServicosEl.innerHTML = servicos.map(s => {
    const checked = servicosSelecionados.has(s.id) ? "checked" : "";
    return `
      <label style="display:flex;gap:8px;align-items:center;margin:6px 0;">
        <input type="checkbox" value="${s.id}" ${checked}>
        ${s.nome}
      </label>
    `;
  }).join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const morada = moradaInput.value.trim();
  const gerenteRaw = gerenteInput.value;
  const gerente_id = gerenteRaw ? Number(gerenteRaw) : null;

  const servicoIds = [...listaServicosEl.querySelectorAll("input[type=checkbox]:checked")]
    .map(cb => Number(cb.value));

  if (!nome) return alert("Nome é obrigatório.");
  if (!servicoIds.length) return alert("Tens de escolher pelo menos 1 serviço.");

  const res = await fetch(servidor + "/actualizarLoja", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, nome, morada, gerente_id, servicoIds })
  });

  const out = await res.json();
  if (!out.resultado) {
    alert("Erro ao atualizar loja");
    return;
  }

  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});

carregarServicosELoja();
