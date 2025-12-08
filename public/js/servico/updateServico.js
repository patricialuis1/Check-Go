import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("form-update-servico");
const nomeInput = document.getElementById("nome");
const descInput = document.getElementById("descricao");

async function carregarServico() {
  // 1. Obter Token
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege
  
  if (!id) {
    alert("ID inválido");
    window.location.href = "/views/admin/abaServico/listaServico.html";
    return;
  }

  const res = await fetch(servidor + "/servicos/" + id, {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    }
  });

  // 2. Tratar Erro de Autorização/Sessão (GET)
  if (res.status === 401 || res.status === 403) {
    alert("Sessão inválida ou sem permissões para carregar detalhes.");
    logout();
    return;
  }
  
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
  
  // 3. Obter Token (para POST)
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const res = await fetch(servidor + "/actualizarServico", {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    },
    body: JSON.stringify({ id: Number(id), nome, descricao })
  });
  
  // 4. Tratar Erro de Autorização/Sessão (POST)
  if (res.status === 401 || res.status === 403) {
    alert("Sem permissões para atualizar serviço. A fazer logout.");
    logout();
    return;
  }

  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao atualizar serviço");
    return;
  }

  window.location.href = "/views/admin/abaServico/listaServico.html";
});

carregarServico();