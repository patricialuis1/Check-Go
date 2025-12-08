import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";
const form = document.getElementById("form-criar-loja");
const btnCancelar = document.querySelector(".btn-cancelar");
const listaServicosEl = document.getElementById("lista-servicos-checkboxes");

btnCancelar?.addEventListener("click", () => {
  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});

// carrega serviços para checkboxes (AGORA PROTEGIDO)
async function carregarServicos() {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege

  const res = await fetch(servidor + "/servicos", {
    headers: {
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    }
  });

  if (res.status === 401 || res.status === 403) {
    alert("Sessão inválida. Não pode carregar serviços.");
    logout();
    return;
  }
  
  const servicos = await res.json();

  listaServicosEl.innerHTML = servicos.map(s => `
    <label style="display:flex;gap:8px;align-items:center;margin:6px 0;">
      <input type="checkbox" value="${s.id}">
      ${s.nome}
    </label>
  `).join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const morada = document.getElementById("morada").value.trim();
  const gerenteRaw = document.getElementById("gerente_id").value;
  const gerente_id = gerenteRaw ? Number(gerenteRaw) : null;

  const servicoIds = [...listaServicosEl.querySelectorAll("input[type=checkbox]:checked")]
    .map(cb => Number(cb.value));

  if (!nome) return alert("Nome é obrigatório.");
  if (!servicoIds.length) return alert("Tens de escolher pelo menos 1 serviço.");

  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return; } // Verifica e protege
  
  const res = await fetch(servidor + "/novaLoja", {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 Enviar Token
    },
    body: JSON.stringify({ nome, morada, gerente_id, servicoIds })
  });

  if (res.status === 401 || res.status === 403) {
    alert("Sem permissões para criar loja. A fazer logout.");
    logout();
    return;
  }

  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao criar loja");
    return;
  }

  window.location.href = "/views/admin/abaLoja/listaLoja.html";
});

carregarServicos();