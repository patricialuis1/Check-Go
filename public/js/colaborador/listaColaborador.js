import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";

async function carregarColaboradores() {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const res = await fetch(servidor + "/colaboradores", {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // Enviar Token
    }
  });

  if (res.status === 401 || res.status === 403) {
    alert("Sessão inválida ou sem permissões para listar colaboradores.");
    logout();
    return;
  }

  if (!res.ok) {
    console.error("Erro /colaboradores", await res.text());
    return;
  }

  const colaboradores = await res.json();
  const tbody = document.getElementById("lista-colaboradores");
  tbody.innerHTML = "";

  colaboradores.forEach(c => {
    const lojaTxt = c.loja_nome ? `${c.loja_nome} (${c.loja_id})` : "-";
    const ativoTxt = c.ativo ? "Ativo" : "Inativo";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>

      <td>
        <a href="/views/admin/abaColaborador/detalhesColaborador.html?id=${c.id}"
           class="link-linha-loja">
          ${c.nome}
        </a>
      </td>

      <td>${c.email}</td>
      <td>${lojaTxt}</td>
      <td>${c.role}</td>
      <td>${ativoTxt}</td>
      <td>
        <a href="/views/admin/abaColaborador/updateColaborador.html?id=${c.id}"
           class="btn-acao" title="Editar">✏️</a>
        <button class="btn-acao btn-apagar" data-id="${c.id}" title="Apagar">🗑️</button>
      </td>
    `;

    tr.querySelector(".btn-apagar").addEventListener("click", async () => {
      if (!confirm("Apagar colaborador?")) return;
      
      const user = getAuthUser();
      if (!user || !user.sessionToken) { logout(); return; }
      
      const deleteRes = await fetch(servidor + "/apagarColaborador", {
        method: "POST",
        headers: { 
          "content-type": "application/json",
          'Authorization': `Bearer ${user.sessionToken}` // Enviar Token
        },
        body: JSON.stringify({ id: c.id })
      });
      
      if (deleteRes.status === 401 || deleteRes.status === 403) {
        alert("Sem permissões ou sessão inválida para apagar.");
        logout();
        return;
      }
      
      carregarColaboradores();
    });

    tbody.appendChild(tr);
  });
}

carregarColaboradores();