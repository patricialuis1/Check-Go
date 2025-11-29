const servidor = "";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function carregarDetalhes() {
  if (!id) {
    alert("ID inválido.");
    window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
    return;
  }

  const res = await fetch(servidor + "/colaboradores/" + id);
  const c = await res.json();

  document.getElementById("det-nome").textContent = c.nome ?? "—";
  document.getElementById("det-email").textContent = c.email ?? "—";
  document.getElementById("det-role").textContent = c.role ?? "—";

  const lojaTxt = c.loja_nome
    ? `${c.loja_nome} (${c.loja_id})`
    : (c.loja_id ? `(${c.loja_id})` : "—");

  document.getElementById("det-loja").textContent = lojaTxt;
  document.getElementById("det-ativo").textContent = c.ativo ? "Ativo" : "Inativo";
}

carregarDetalhes();
