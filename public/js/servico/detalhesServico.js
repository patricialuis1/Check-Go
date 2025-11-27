const servidor = "";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nomeEl = document.getElementById("det-nome");
const descEl = document.getElementById("det-desc");

async function carregarDetalhes() {
  if (!id) {
    nomeEl.textContent = "Serviço não encontrado";
    return;
  }

  const res = await fetch(servidor + "/servicos/" + id);
  const s = await res.json();

  if (!s || s.error) {
    nomeEl.textContent = "Serviço não encontrado";
    return;
  }

  nomeEl.textContent = s.nome ?? "—";
  descEl.textContent = s.descricao ?? "";
}

carregarDetalhes();
