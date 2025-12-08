import { getAuthUser, logout } from "../autenticacao/auth.js"; // 🎯 NOVO: Importar Segurança

const servidor = "";

const params = new URLSearchParams(window.location.search);
const loja_servico_id = Number(params.get("loja_servico_id"));

const senhaContainer = document.getElementById("senha-container");
const contadorEspera = document.getElementById("contador-espera");
const btnNext = document.querySelector(".btn-next");

const btnConcluir =
  document.getElementById("btn-concluir-atual") ||
  document.querySelector(".btn-concluir");

// NOTA: O colaborador_id deve vir do req.user no backend, mas mantemos local para o fetch.
const colaborador_id = Number(localStorage.getItem("user_id")) || null;

if (!loja_servico_id) {
  alert("Serviço inválido.");
}

// ... (helpers UI permanecem inalterados) ...

// API (TODOS OS POSTS AGORA ENVIAM O TOKEN)
async function fetchFila() {
  // Rota pública, mas para consistência e debug, podemos enviar o token
  const res = await fetch(`${servidor}/fila/${loja_servico_id}`, {
    cache: "no-store"
  });
  if (!res.ok) return [];
  return await res.json();
}

async function chamarProximo() {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return null; }

  const res = await fetch(`${servidor}/chamarProximo`, {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 ENVIAR TOKEN
    },
    body: JSON.stringify({ loja_servico_id, colaborador_id })
  });

  if (res.status === 401 || res.status === 403) {
    alert("Sessão inválida ou sem permissões.");
    logout();
    return null;
  }

  const out = await res.json();
  if (!res.ok) {
    alert(out.error || out.message || "Erro ao chamar próximo.");
    return null;
  }
  return out; // pode ser null se não houver ninguém
}

async function concluirSenha(senha_id) {
  const user = getAuthUser();
  if (!user || !user.sessionToken) { logout(); return null; }

  const res = await fetch(`${servidor}/concluirSenha`, {
    method: "POST",
    headers: { 
      "content-type": "application/json",
      'Authorization': `Bearer ${user.sessionToken}` // 🎯 ENVIAR TOKEN
    },
    body: JSON.stringify({ senha_id })
  });
  
  if (res.status === 401 || res.status === 403) {
    alert("Sessão inválida ou sem permissões.");
    logout();
    return null;
  }


  const out = await res.json();
  if (!res.ok) {
    alert(out.error || out.message || "Erro ao concluir senha.");
    return null;
  }
  return out;
}

let senhaAtual = null;

async function atualizarPainel() {
  // Apenas a rota fetchFila é pública; esta função corre em loop.
  // Se houver necessidade de proteger a leitura do painel de espera, 
  // deve-se usar outra rota protegida. Por agora, apenas os comandos POST são protegidos.

  const fila = await fetchFila(); // fetchFila não está protegido

  // ... (restante da lógica de painel) ...
}

// eventos
btnNext?.addEventListener("click", async () => {
  const nova = await chamarProximo();
  if (!nova) alert("Não há ninguém em espera.");
  atualizarPainel();
});

// NOVO: concluir atual
btnConcluir?.addEventListener("click", async () => {
  if (!senhaAtual) {
    alert("Não há senha em atendimento.");
    return;
  }
  await concluirSenha(senhaAtual.id);
  senhaAtual = null;
  atualizarPainel();
});

// Inicialização e Polling
// Antes de iniciar o polling, verificamos se o user está logado
const userCheck = getAuthUser();
if (userCheck && userCheck.sessionToken) {
    setInterval(atualizarPainel, 3000);
    atualizarPainel();
} else {
    // Se o user não tiver token, não iniciamos a app do trabalhador e forçamos o login.
    logout(); 
}