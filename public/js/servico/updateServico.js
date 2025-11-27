const servidor = "http://localhost:3000/";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("form-update-servico");
const nomeInput = document.getElementById("nome");
const descInput = document.getElementById("descricao");

async function carregarServico() {
  if (!id) {
    alert("ID inválido");
    window.location.href = "/views/admin/abaServico/listaServico.html";
    return;
  }

  const res = await fetch(servidor + "servicos/" + id);
  const s = await res.json();

  if (!s || s.error) {
    alert("Serviço não encontrado");
    window.location.href = "/views/admin/abaServico/listaServico.html";
    return;
  }

  nomeInput.value = s.nome ?? "";
  descInput.value = s.descricao ?? "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const descricao = descInput.value.trim();

  if (!nome) {
    alert("Nome é obrigatório.");
    return;
  }

  const res = await fetch(servidor + "actualizarServico", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, nome, descricao })
  });

  const out = await res.json();
  if (!out.resultado) {
    alert("Erro ao atualizar serviço");
    return;
  }

  window.location.href = "/views/admin/abaServico/listaServico.html";
});

carregarServico();
