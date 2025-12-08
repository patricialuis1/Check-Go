import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const nomeEl = document.getElementById("det-nome");
const descEl = document.getElementById("det-desc");

async function carregarDetalhes() {
  // 1. Obter Token
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege
  
  if (!id) {
    nomeEl.textContent = "Serviço não encontrado";
    return;
  }

  const res = await fetch(servidor + "/servicos/" + id, {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    }
  });
  
  // 2. Tratar Erro de Autorização/Sessão
  if (res.status === 401 || res.status === 403) {
    alert("Sessão inválida ou sem permissões para carregar detalhes.");
    logout();
    return;
  }

  const s = await res.json();

  if (!s || s.error) {
    nomeEl.textContent = "Serviço não encontrado";
    return;
  }

  nomeEl.textContent = s.nome ?? "—";
  descEl.textContent = s.descricao ?? "";
}

carregarDetalhes();