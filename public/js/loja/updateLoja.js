const servidor = "";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("form-update-loja");
const nomeInput = document.getElementById("nome");
const moradaInput = document.getElementById("morada");
const gerenteInput = document.getElementById("gerente_id");

async function carregarLoja() {
  if (!id) {
    alert("ID inválido");
    window.location.href = "/views/admin/abaLoja/listaLoja.html";
    return;
  }

  const res = await fetch(servidor + "/lojas/" + id);
  const l = await res.json();

  if (!l || l.error) {
    alert("Loja não encontrada");
    window.location.href = "/views/admin/abaLoja/listaLoja.html";
    return;
  }

  nomeInput.value = l.nome ?? "";
  moradaInput.value = l.morada ?? "";
  gerenteInput.value = l.gerente_id ?? "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const morada = moradaInput.value.trim();
  const gerenteRaw = gerenteInput.value;
  const gerente_id = gerenteRaw ? Number(gerenteRaw) : null;

  if (!nome) {
    alert("Nome é obrigatório.");
    return;
  }

  const res = await fetch(servidor + "/actualizarLoja", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, nome, morada, gerente_id })
  });

  const out = await res.json();
  if (!out.resultado) {
    alert("Erro ao atualizar loja");
    return;
  }

  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});

carregarLoja();
