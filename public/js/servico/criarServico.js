import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 ESSENCIAL

// public/js/servico/criarServico.js
const servidor = "";

const form = document.getElementById("form-criar-servico");
const btnCancelar = document.querySelector(".btn-cancelar");

btnCancelar?.addEventListener("click", () => {
  window.location.href = "/views/admin/abaServico/listaServico.html";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

  if (!nome) {
    alert("Nome é obrigatório.");
    return;
  }
  
  // 1. Obter Token
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege
  
  const URL = servidor + "/novoServico";
  const res = await fetch(URL, {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token de Sessão
    },
    body: JSON.stringify({ nome, descricao })
  });
  
  // 2. Tratar Erro de Autorização/Sessão (API)
  if (res.status === 401 || res.status === 403) {
    alert("Sem permissões para criar serviço. A fazer logout.");
    logout();
    return;
  }

  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao criar serviço");
    return;
  }

  window.location.href = "/views/admin/abaServico/listaServico.html";
});