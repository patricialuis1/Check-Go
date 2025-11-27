const servidor = "";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nomeEl = document.getElementById("det-nome");
const moradaEl = document.getElementById("det-morada");
const gerenteEl = document.getElementById("det-gerente");
const servicosEl = document.getElementById("det-servicos"); // adiciona no HTML

async function carregarDetalhes() {
  if (!id) { nomeEl.textContent = "Loja não encontrada"; return; }

  const res = await fetch(servidor + "/lojas/" + id);
  const l = await res.json();

  if (!l || l.error) { nomeEl.textContent = "Loja não encontrada"; return; }

  nomeEl.textContent = l.nome ?? "—";
  moradaEl.textContent = l.morada ?? "—";

  const gerenteTxt = l.gerente_nome
    ? `${l.gerente_nome} (${l.gerente_id ?? "-"})`
    : (l.gerente_id ? `(${l.gerente_id})` : "—");

  gerenteEl.textContent = gerenteTxt;

  servicosEl.textContent = (l.servicos?.length)
    ? l.servicos.join(", ")
    : "—";
}

carregarDetalhes();
