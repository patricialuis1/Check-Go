import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 IMPORTAR LOGOUT

const servidor = "";

async function actualizarLojas() {
  // 1. Verificar autenticação
  const user = getAuthUser(); 
  
  // 🎯 CRÍTICO: Verifica se existe o sessionToken (UUID) guardado
  if (!user || !user.sessionToken) {
    console.error("Utilizador não autenticado ou token de sessão em falta.");
    logout(); 
    return; 
  }

  const URL = servidor + "/lojas";
  const res = await fetch(URL, {
    headers: {
      // 🎯 ENVIA O TOKEN DE SESSÃO DA DB NO CABEÇALHO
      'Authorization': `Bearer ${user.sessionToken}` 
    }
  });
  
  // 2. Tratar erros de autorização do backend (401/403)
  if (res.status === 401 || res.status === 403) {
      alert("Sessão inválida ou sem permissões. A fazer logout.");
      logout(); // Força o redirecionamento
      return; 
  }
  
  if (!res.ok) {
    console.error("Erro a carregar lojas:", res.status);
    return;
  }
  
  const lojas = await res.json();
  const container = document.getElementById("lista-lojas");
  container.innerHTML = "";

  lojas.forEach(l => {
    const servicosTxt = (l.servicos && l.servicos.length)
      ? l.servicos.join(", ")
      : "-";

    const gerenteTxt = l.gerente_nome
      ? `${l.gerente_nome} (${l.gerente_id ?? "-"})`
      : (l.gerente_id ? `(${l.gerente_id})` : "-");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.id}</td>
      <td>
        <a href="/views/admin/abaLoja/detalhesLoja.html?id=${l.id}" class="link-linha-loja">
          ${l.nome}
        </a>
      </td>
      <td>${l.morada ?? ""}</td>
      <td>${servicosTxt}</td>
      <td>${gerenteTxt}</td>
      <td>
        <a href="/views/admin/abaLoja/updateLoja.html?id=${l.id}" class="btn-acao" title="Editar">✏️</a>
        <button class="btn-acao botao-acao-apagar" title="Apagar">🗑️</button>
      </td>
    `;

    tr.querySelector(".botao-acao-apagar").addEventListener("click", () => {
      if (confirm("Quer mesmo apagar a loja?")) apagarLoja(l.id);
    });

    container.appendChild(tr);
  });
}

async function apagarLoja(id) {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; }

  const res = await fetch(servidor + "/apagarLoja", {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` 
    },
    body: JSON.stringify({ id })
  });

  if (res.status === 401 || res.status === 403) { logout(); return; } 

  if (!res.ok) return;
  actualizarLojas();
}

actualizarLojas();