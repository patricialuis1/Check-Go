import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("form-update-colab");
const lojaSelect = document.getElementById("loja_id");
// ... (restantes variáveis)

async function carregarLojas() {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Proteção

  const res = await fetch(servidor + "/lojas", {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}`
    }
  });

  if (res.status === 401 || res.status === 403) { logout(); return; }
  
  const lojas = await res.json();

  lojaSelect.innerHTML =
    `<option value="">— Sem loja —</option>` +
    lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join("");
}

async function carregarColaborador() {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Proteção

  if (!id) {
    alert("ID inválido.");
    window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
    return;
  }

  const res = await fetch(servidor + "/colaboradores/" + id, {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}`
    }
  });
  
  if (res.status === 401 || res.status === 403) { logout(); return; }

  const c = await res.json();

  document.getElementById("nome").value = c.nome ?? "";
  document.getElementById("email").value = c.email ?? "";
  document.getElementById("role").value = c.role ?? "Colaborador";
  document.getElementById("ativo").checked = !!c.ativo;

  lojaSelect.value = c.loja_id ?? "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;
  const loja_id_raw = lojaSelect.value;
  const loja_id = loja_id_raw ? Number(loja_id_raw) : null;
  const ativo = document.getElementById("ativo").checked;

  if (!nome || !email) {
    alert("Nome e email são obrigatórios.");
    return;
  }

  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Proteção

  const res = await fetch(servidor + "/actualizarColaborador", {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}`
    },
    body: JSON.stringify({ id, nome, email, role, loja_id, ativo })
  });
  
  if (res.status === 401 || res.status === 403) {
    alert("Sem permissões ou sessão inválida para atualizar.");
    logout();
    return;
  }

  const out = await res.json();
  if (!out.resultado) {
    alert(out.message || "Erro ao atualizar colaborador.");
    return;
  }

  window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
});

(async () => {
  await carregarLojas();
  await carregarColaborador();
})();