import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";

async function actualizarServicos() {
  // 1. Obter Token
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const URL = servidor + "/servicos";
  const res = await fetch(URL, {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    }
  });
  console.log("URL:", URL, "status:", res.status);

  // 2. Tratar Erro de Autorização/Sessão (GET)
  if (res.status === 401 || res.status === 403) {
      alert("Sessão inválida ou sem permissões. A fazer logout.");
      logout();
      return; 
  }

  if (!res.ok) {
    const txt = await res.text();
    console.error("Erro /servicos:", txt);
    return;
  }

  const json = await res.json();

  const container = document.getElementById("lista-servicos");
  container.innerHTML = "";

  json.forEach(element => {
    const linha = document.createElement("div");
    linha.className = "linha-tabela linha-servico";

    linha.innerHTML = `
      <a href="/views/admin/abaServico/detalhesServico.html?id=${element.id}"
        class="link-linha-servico">
        <div class="coluna-tabela coluna-id">${element.id}</div>
        <div class="coluna-tabela coluna-nome">${element.nome}</div>
        <div class="coluna-tabela coluna-descricao">${element.descricao ?? ""}</div>
      </a>

      <div class="coluna-tabela coluna-acoes">
        <a href="/views/admin/abaServico/updateServico.html?id=${element.id}"
          class="botao-acao-servico botao-acao-editar">✏️</a>
        <button class="botao-acao-servico botao-acao-apagar" data-id="${element.id}">🗑️</button>
      </div>
    `;

    // Alterei para usar o data-id no botão em vez do onclick inline
    linha.querySelector(".botao-acao-apagar").addEventListener("click", (e) => {
      const idApagar = e.currentTarget.getAttribute('data-id');
      if (confirm("Quer mesmo apagar o serviço?")) {
        apagarServico(Number(idApagar));
      }
    });

    container.appendChild(linha);
  });
}

async function apagarServico(id) {
  console.log("🗑️ apagarServico chamado com id:", id);

  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const URL = servidor + "/apagarServico";
  console.log("➡️ POST para:", URL);

  const res = await fetch(URL, {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    },
    body: JSON.stringify({ id })
  });

  // 3. Tratar Erro de Autorização/Sessão (DELETE)
  if (res.status === 401 || res.status === 403) {
    alert("Sem permissões para apagar. A fazer logout.");
    logout();
    return; 
  }

  if (!res.ok) {
    const out = await res.json();
    alert(out.response || "Erro ao apagar serviço");
    return;
  }

  actualizarServicos();
}

actualizarServicos();