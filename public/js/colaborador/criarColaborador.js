import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";
const form = document.getElementById("form-criar-colab");
const lojaSelect = document.getElementById("loja_id");
const btnCancelar = document.getElementById("cancelar");

btnCancelar.addEventListener("click", () => {
  window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
});

async function carregarLojas() {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const res = await fetch(servidor + "/lojas", {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // Enviar Token
    }
  });
  
  if (res.status === 401 || res.status === 403) { logout(); return; }

  const lojas = await res.json();

  lojaSelect.innerHTML = `<option value="">— Sem loja —</option>` + 
    lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const loja_id_raw = lojaSelect.value;
  const loja_id = loja_id_raw ? Number(loja_id_raw) : null;
  const ativo = document.getElementById("ativo").checked;

  if (!nome || !email || !password) {
    alert("Nome, email e password são obrigatórios.");
    return;
  }

  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const res = await fetch(servidor + "/novoColaborador", {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` // Enviar Token
    },
    body: JSON.stringify({ nome, email, password, role, loja_id, ativo })
  });
  
  if (res.status === 401 || res.status === 403) {
    alert("Sem permissões para criar colaborador. A fazer logout.");
    logout();
    return;
  }


  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao criar colaborador");
    return;
  }

  window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
});

carregarLojas();