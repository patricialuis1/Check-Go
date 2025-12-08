import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nomeEl = document.getElementById("det-nome");
const moradaEl = document.getElementById("det-morada");
const gerenteEl = document.getElementById("det-gerente");
const servicosEl = document.getElementById("det-servicos"); // adiciona no HTML

async function carregarDetalhes() {
  if (!id) { nomeEl.textContent = "Loja não encontrada"; return; }
  
  // 1. Obter Token
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege
  
  const res = await fetch(servidor + "/lojas/" + id, {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    }
  });

  // 2. Tratar Erro de Autorização/Sessão
  if (res.status === 401 || res.status === 403) {
      alert("Sem permissões para ver detalhes. A fazer logout.");
      logout();
      return;
  }
  
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