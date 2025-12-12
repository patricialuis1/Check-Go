import { getAuthUser, logout } from "../autenticacao/auth.js";

const servidor = ""; 

const params = new URLSearchParams(window.location.search);
const loja_servico_id = Number(params.get("loja_servico_id"));

// Elementos UI
const senhaContainer = document.getElementById("senha-container");
const contadorEspera = document.getElementById("contador-espera");
const btnNext = document.querySelector(".btn-next");
const btnConcluir = document.getElementById("btn-concluir-atual") || document.querySelector(".btn-concluir");
// ✅ NOVO: Botão de Cancelar
const btnCancelar = document.getElementById("btn-cancelar");

const colaborador_id = Number(localStorage.getItem("user_id")) || null;

if (!loja_servico_id) alert("Serviço inválido.");

let senhaAtual = null;

// --- UI HELPERS ---

function preencherSenha(container, numero) {
  if (!container) return;
  const s = "A" + String(numero).padStart(3, "0");
  container.innerHTML = "";
  s.split("").forEach(ch => {
    const d = document.createElement("div");
    d.className = "digit"; 
    d.textContent = ch;
    container.appendChild(d);
  });
}

function preencherVazio(container) {
  if (!container) return;
  container.innerHTML = "";
  ["-", "-", "-", "-"].forEach(ch => {
    const d = document.createElement("div");
    d.className = "digit";
    d.textContent = ch;
    container.appendChild(d);
  });
}

// --- API ---

async function apiCall(endpoint, body = {}) {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return null; }

  try {
    const res = await fetch(`${servidor}${endpoint}`, {
      method: "POST",
      headers: { 
        "content-type": "application/json",
        'Authorization': `Bearer ${user.sessionToken}`
      },
      body: JSON.stringify(body)
    });

    if (res.status === 401 || res.status === 403) { logout(); return null; }
    
    const out = await res.json();
    if (!res.ok) {
      alert(out.error || out.message || "Erro na operação.");
      return null;
    }
    return out;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchFila() {
  const res = await fetch(`${servidor}/fila/${loja_servico_id}`, { cache: "no-store" });
  if (!res.ok) return [];
  return await res.json();
}

// --- LÓGICA PRINCIPAL ---

async function atualizarPainel() {
  const fila = await fetchFila();
  
  // Atualiza contador
  const espera = fila.filter(t => t.status === "Espera");
  if (contadorEspera) contadorEspera.innerText = `Senhas em espera: ${espera.length}`;

  // Verifica se já estamos a atender alguém
  const emAtendimento = fila.find(t => t.status === "Atendimento");

  if (emAtendimento) {
    senhaAtual = emAtendimento;
    preencherSenha(senhaContainer, emAtendimento.numero);

    // MODO ATENDIMENTO:
    // 1. Bloqueia o "Próximo" (para não cancelar sem querer o atual)
    if (btnNext) {
        btnNext.disabled = true;
        btnNext.innerText = "Em Atendimento...";
        btnNext.style.opacity = "0.5";
        btnNext.style.cursor = "not-allowed";
    }
    // 2. Ativa opções de finalização
    if (btnConcluir) btnConcluir.style.display = "inline-block";
    if (btnCancelar) btnCancelar.style.display = "inline-block";

  } else {
    senhaAtual = null;
    preencherVazio(senhaContainer);

    // MODO LIVRE:
    // 1. Liberta o "Próximo"
    if (btnNext) {
        btnNext.disabled = false;
        btnNext.innerText = "Chamar o próximo";
        btnNext.style.opacity = "1";
        btnNext.style.cursor = "pointer";
    }
    // 2. Esconde opções de finalização (não há nada para fazer)
    if (btnConcluir) btnConcluir.style.display = "none";
    if (btnCancelar) btnCancelar.style.display = "none";
  }
}

// --- EVENTOS ---

// 1. Chamar Próximo
btnNext?.addEventListener("click", async () => {
  btnNext.innerText = "A chamar...";
  const nova = await apiCall("/chamarProximo", { loja_servico_id, colaborador_id });
  if (nova) {
    senhaAtual = nova;
  } else {
    alert("Não há ninguém em espera.");
  }
  atualizarPainel();
});

// 2. Concluir (Sucesso)
btnConcluir?.addEventListener("click", async () => {
  if (!senhaAtual) return;
  btnConcluir.innerText = "...";
  await apiCall("/concluirSenha", { senha_id: senhaAtual.id });
  senhaAtual = null;
  btnConcluir.innerText = "Concluir atendimento";
  atualizarPainel();
});

// 3. Cancelar (Não Compareceu) ✅ NOVO
btnCancelar?.addEventListener("click", async () => {
  if (!senhaAtual) return;
  
  if (!confirm(`A senha ${senhaAtual.numero} não compareceu?`)) return;

  btnCancelar.innerText = "...";
  // Usa a mesma rota de cancelamento que o cliente usaria, ou uma específica se tiveres
  await apiCall("/cancelarSenha", { senha_id: senhaAtual.id });
  
  senhaAtual = null;
  btnCancelar.innerText = "Não Compareceu";
  atualizarPainel();
});

// --- INICIALIZAÇÃO ---

const userCheck = getAuthUser();
if (userCheck && userCheck.sessionToken) {
    setInterval(atualizarPainel, 3000);
    atualizarPainel();
} else {
    logout(); 
}