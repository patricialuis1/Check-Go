import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function carregarDetalhes() {
  if (!id) {
    alert("ID inválido.");
    window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
    return;
  }

  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const res = await fetch(servidor + "/colaboradores/" + id, {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // Enviar Token
    }
  });
  
  if (res.status === 401 || res.status === 403) {
      alert("Sem permissões ou sessão inválida para ver detalhes.");
      logout();
      return;
  }

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