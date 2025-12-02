const servidor = ""; // deixa vazio se a tua API está na mesma origem

// --- ler loja_servico_id da query ---
const params = new URLSearchParams(window.location.search);
const loja_servico_id = Number(params.get("loja_servico_id"));

if (!loja_servico_id) {
  alert("Serviço inválido. Volta atrás e escolhe um serviço.");
}

// --- elementos (respeitar ids/classes do HTML) ---
const estadoInicial = document.getElementById("estado-inicial");
const estadoRetirado = document.getElementById("estado-retirado");
const estadoConcluido = document.getElementById("estado-concluido"); // ✅ nova div final

// senha atual no estado inicial tem id
const senhaAtualInicialEl = document.getElementById("senha-atual");

// senha atual no estado retirado NÃO tem id no teu HTML,
// por isso vamos buscar a PRIMEIRA .senha dentro de estado-retirado
const senhaAtualRetiradoEl = document.querySelector("#estado-retirado .senha");

// minha senha tem id
const minhaSenhaEl = document.getElementById("senha-user");

// botões
const btnRetirar = document.querySelector(".senha-btn");
const btnCancelar = document.querySelector(".cancel-btn");
const btnTempo = document.querySelector(".tempo-btn");

let minhaSenha = null;

// --- UI helpers ---
function preencherSenha(container, numero, tipo = "Normal") {
  if (!container) return;

  const letra = (tipo === "Prioritario") ? "P" : "A";
  const s = letra + String(numero).padStart(3, "0");

  container.innerHTML = "";
  s.split("").forEach(ch => {
    const d = document.createElement("div");
    d.className = "digit";     // respeita a tua class
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

// --- usa as tuas funções inline se existirem, se não, cria fallback ---
const mostrarEstadoRetirado =
  window.mostrarEstadoRetirado ||
  function () {
    estadoInicial.classList.remove("ativo");
    setTimeout(() => {
      estadoInicial.style.display = "none";
      estadoRetirado.style.display = "block";
      setTimeout(() => estadoRetirado.classList.add("ativo"), 10);
    }, 300);
  };

const voltarParaEstadoInicial =
  window.voltarParaEstadoInicial ||
  function () {
    estadoRetirado.classList.remove("ativo");
    estadoConcluido?.classList.remove("ativo");

    setTimeout(() => {
      estadoRetirado.style.display = "none";
      if (estadoConcluido) estadoConcluido.style.display = "none";

      estadoInicial.style.display = "block";
      setTimeout(() => estadoInicial.classList.add("ativo"), 10);
    }, 300);
  };

// ✅ mostrar estado concluído
function mostrarEstadoConcluido() {
  estadoInicial.classList.remove("ativo");
  estadoRetirado.classList.remove("ativo");

  setTimeout(() => {
    estadoInicial.style.display = "none";
    estadoRetirado.style.display = "none";

    if (estadoConcluido) {
      estadoConcluido.style.display = "block";
      setTimeout(() => estadoConcluido.classList.add("ativo"), 10);
    }
  }, 300);
}

// --- API calls ---
async function fetchFila() {
  const res = await fetch(`${servidor}/fila/${loja_servico_id}`, {
    cache: "no-store"
  });
  if (!res.ok) return [];
  return await res.json();
}

async function tirarSenhaAPI() {
  const res = await fetch(`${servidor}/tirarSenha`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ loja_servico_id, tipo: "Normal" })
  });

  const out = await res.json();
  if (!res.ok) {
    alert(out.error || out.message || "Erro ao tirar senha.");
    return null;
  }
  return out; // {id, numero, tipo, status, data_emissao}
}

async function cancelarSenhaAPI(senha_id) {
  await fetch(`${servidor}/cancelarSenha`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ senha_id })
  }).catch(() => {});
}

// --- lógica de atualização ---
async function atualizarEstado() {
  const fila = await fetchFila();

  // senha atual = Atendimento, senão primeira em Espera
  const emAtendimento = fila.find(s => s.status === "Atendimento");
  const primeiraEspera = fila.find(s => s.status === "Espera");
  const senhaAtual = emAtendimento || primeiraEspera;

  if (senhaAtual) {
    // atualiza as DUAS caixas de “Senha Atual”
    preencherSenha(senhaAtualInicialEl, senhaAtual.numero, senhaAtual.tipo);
    preencherSenha(senhaAtualRetiradoEl, senhaAtual.numero, senhaAtual.tipo);
  } else {
    preencherVazio(senhaAtualInicialEl);
    preencherVazio(senhaAtualRetiradoEl);
  }

  if (!minhaSenha) return;

  // atualiza minha senha na UI
  preencherSenha(minhaSenhaEl, minhaSenha.numero, minhaSenha.tipo);

  // procurar a minha senha na fila da BD
  const minhaNaBD = fila.find(s => s.id === minhaSenha.id);

  // ✅ se já foi concluída -> mostrar ecrã final
  if (minhaNaBD && minhaNaBD.status === "Concluido") {
    minhaSenha = null;
    mostrarEstadoConcluido();
    return;
  }

  // ✅ se foi cancelada (cliente faltou ou cancelou)
  if (minhaNaBD && minhaNaBD.status === "Cancelado") {
    minhaSenha = null;
    voltarParaEstadoInicial();
    return;
  }

  // pessoas à frente: conta Espera + Atendimento com numero menor
  const pessoasAFrente = fila
    .filter(s => s.status === "Espera" || s.status === "Atendimento")
    .filter(s => s.numero < minhaSenha.numero)
    .length;

  if (btnTempo) {
    btnTempo.textContent =
      pessoasAFrente <= 0
        ? "Já é a tua vez!"
        : `${pessoasAFrente} pessoas à tua frente`;
  }

  // se estou a ser atendido
  if (minhaNaBD && minhaNaBD.status === "Atendimento") {
    if (btnTempo) btnTempo.textContent = "Está a ser atendido";
  }
}

// --- eventos ---
if (btnRetirar) {
  btnRetirar.addEventListener("click", async () => {
    if (minhaSenha) return;

    const senha = await tirarSenhaAPI();
    if (!senha) return;

    minhaSenha = senha;
    mostrarEstadoRetirado();
    atualizarEstado();
  });
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", async () => {
    if (!minhaSenha) {
      voltarParaEstadoInicial();
      return;
    }

    await cancelarSenhaAPI(minhaSenha.id);
    minhaSenha = null;

    voltarParaEstadoInicial();
    atualizarEstado();
  });
}

// --- polling “tempo real” ---
setInterval(atualizarEstado, 3000);
atualizarEstado();
