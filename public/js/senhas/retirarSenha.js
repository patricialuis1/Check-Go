const servidor = ""; 


const params = new URLSearchParams(window.location.search);
const loja_servico_id = Number(params.get("loja_servico_id"));

if (!loja_servico_id) {
  alert("Serviço inválido. Volta atrás e escolhe um serviço.");
}


const estadoInicial = document.getElementById("estado-inicial");
const estadoRetirado = document.getElementById("estado-retirado");
const estadoConcluido = document.getElementById("estado-concluido");


const btnVoltarLoja = document.getElementById("btn-voltar-loja"); // Botão "Outro Serviço"
const btnIrHome = document.getElementById("btn-ir-home");         // Botão "Sair"

const senhaAtualInicialEl = document.getElementById("senha-atual");
const senhaAtualRetiradoEl = document.querySelector("#estado-retirado .senha");
const minhaSenhaEl = document.getElementById("senha-user");


const btnRetirar = document.querySelector(".senha-btn");
const btnCancelar = document.querySelector(".cancel-btn");
const btnTempo = document.querySelector(".tempo-btn");

// Estado Local
let minhaSenha = null;
let ultimoNumeroPessoas = -1; 


function falar(texto) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); 
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'pt-PT'; 
    msg.rate = 1.1;     
    msg.pitch = 1;
    window.speechSynthesis.speak(msg);
  }
}



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


const mostrarEstadoRetirado = function () {
    estadoInicial.classList.remove("ativo");
    setTimeout(() => {
      estadoInicial.style.display = "none";
      if(estadoConcluido) estadoConcluido.style.display = "none"; 
      
      estadoRetirado.style.display = "block";
      setTimeout(() => estadoRetirado.classList.add("ativo"), 10);
    }, 300);
};

const voltarParaEstadoInicial = function () {

    estadoRetirado.classList.remove("ativo");
    if(estadoConcluido) estadoConcluido.classList.remove("ativo");
    

    minhaSenha = null; 
    ultimoNumeroPessoas = -1; 

    setTimeout(() => {
      estadoRetirado.style.display = "none";
      if (estadoConcluido) estadoConcluido.style.display = "none";

      estadoInicial.style.display = "block";
      setTimeout(() => estadoInicial.classList.add("ativo"), 10);
    }, 300);
};

function mostrarEstadoConcluido() {
  estadoInicial.classList.remove("ativo");
  estadoRetirado.classList.remove("ativo");
  
  minhaSenha = null; 
  ultimoNumeroPessoas = -1;

  setTimeout(() => {
    estadoInicial.style.display = "none";
    estadoRetirado.style.display = "none";

    if (estadoConcluido) {
      estadoConcluido.style.display = "block";
      setTimeout(() => estadoConcluido.classList.add("ativo"), 10);
      

      falar("Atendimento concluído. Obrigado.");
    }
  }, 300);
}



async function fetchFila() {
  const res = await fetch(`${servidor}/fila/${loja_servico_id}`, { cache: "no-store" });
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
  return out;
}

async function cancelarSenhaAPI(senha_id) {
  await fetch(`${servidor}/cancelarSenha`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ senha_id })
  }).catch(() => {});
}



async function atualizarEstado() {
  
  const fila = await fetchFila();

  const totalPessoasEspera = fila.filter(s => s.status === "Espera").length;
  
  const contadorEl = document.getElementById("contador-fila-inicial");
  
  if (contadorEl) {
      if (totalPessoasEspera === 0) {
          contadorEl.textContent = "Fila vazia. É a tua vez!";
      } else if (totalPessoasEspera === 1) {
          contadorEl.textContent = "1 pessoa na fila";
      } else {
          contadorEl.textContent = `${totalPessoasEspera} pessoas na fila`;
      }
  }


  const emAtendimento = fila.find(s => s.status === "Atendimento");
  const primeiraEspera = fila.find(s => s.status === "Espera");
  const senhaAtual = emAtendimento || primeiraEspera;

  if (senhaAtual) {
    preencherSenha(senhaAtualInicialEl, senhaAtual.numero);
    preencherSenha(senhaAtualRetiradoEl, senhaAtual.numero);
  } else {
    preencherVazio(senhaAtualInicialEl);
    preencherVazio(senhaAtualRetiradoEl);
  }

  if (!minhaSenha) return;


  preencherSenha(minhaSenhaEl, minhaSenha.numero);


  const minhaNaBD = fila.find(s => s.id === minhaSenha.id);

  if (minhaNaBD) {
    minhaSenha.status = minhaNaBD.status; 

    if (minhaNaBD.status === "Concluido") {
      mostrarEstadoConcluido();
      return;
    }
    if (minhaNaBD.status === "Cancelado") {
      alert("A sua senha foi cancelada.");
      voltarParaEstadoInicial();
      return;
    }
  } else {

    if (minhaSenha.status === "Atendimento") {
      mostrarEstadoConcluido();
      return;
    }
    if (minhaSenha.status === "Espera") {
      voltarParaEstadoInicial();
      return;
    }
  }

  // Cálculo de Tempo e Áudio
  const pessoasAFrente = fila
    .filter(s => s.status === "Espera" || s.status === "Atendimento")
    .filter(s => s.numero < minhaSenha.numero)
    .length;

  // Atualizar Texto
  if (btnTempo) {
    if (minhaSenha.status === "Atendimento") {
        btnTempo.textContent = "Dirija-se ao balcão!";
        btnTempo.classList.add("pulsar"); 
    } else {
        btnTempo.classList.remove("pulsar");
        btnTempo.textContent = pessoasAFrente <= 0
            ? "É a sua vez!"
            : `${pessoasAFrente} pessoas à frente`;
    }
  }

  // Lógica de Voz
  if (minhaSenha.status === "Atendimento" && ultimoNumeroPessoas !== -99) {
      falar(`Senha A ${minhaSenha.numero}. É a sua vez!`);
      ultimoNumeroPessoas = -99; 
  } 
  else if (minhaSenha.status === "Espera") {
      if (pessoasAFrente !== ultimoNumeroPessoas) {
          if (pessoasAFrente === 2) {
              falar("Atenção. Tem duas pessoas à sua frente.");
          } else if (pessoasAFrente === 1) {
              falar("Prepare-se. Tem apenas uma pessoa à sua frente.");
          }
          ultimoNumeroPessoas = pessoasAFrente;
      }
  }
}

// --- Eventos ---

if (btnRetirar) {
  btnRetirar.addEventListener("click", async () => {
    if (minhaSenha) return;
    
    // Desbloquear áudio no mobile
    if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));

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
    voltarParaEstadoInicial();
  });
}

if (btnVoltarLoja) {
    btnVoltarLoja.addEventListener("click", (e) => {
        e.preventDefault();
        window.history.back(); 
    });
}

if (btnIrHome) {
    btnIrHome.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/views/home.html"; 
    });
}

// --- Inicialização ---
setInterval(atualizarEstado, 3000);
atualizarEstado();