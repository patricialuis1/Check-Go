const servidor = "";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nomeEl = document.getElementById("det-nome");
const moradaEl = document.getElementById("det-morada");
const gerenteEl = document.getElementById("det-gerente");

async function carregarDetalhes() {
  if (!id) {
    nomeEl.textContent = "Loja não encontrada";
    return;
  }

  const res = await fetch(servidor + "/lojas/" + id);
  const l = await res.json();

  if (!l || l.error) {
    nomeEl.textContent = "Loja não encontrada";
    return;
  }

  nomeEl.textContent = l.nome ?? "—";
  moradaEl.textContent = l.morada ?? "";
  gerenteEl.textContent = l.gerente_id ?? "—";
}

carregarDetalhes();
