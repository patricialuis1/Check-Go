const servidor = "";

const params = new URLSearchParams(window.location.search);
const loja_servico_id = Number(params.get("loja_servico_id"));

const senhaContainer = document.getElementById("senha-container");
const contadorEspera = document.getElementById("contador-espera");
const btnNext = document.querySelector(".btn-next");

// títulos (opcional)
const elLoja1 = document.getElementById("loja-nome-1");
const elLoja2 = document.getElementById("loja-nome-2");
const elServicoNome = document.getElementById("servico-nome");

// id do colaborador logado (se guardas)
const colaborador_id = Number(localStorage.getItem("user_id")) || null;

if (!loja_servico_id) {
  alert("Serviço inválido.");
}

// helpers UI
function preencherSenha(numero, tipo = "Normal") {
  const letra = (tipo === "Prioritario") ? "P" : "A";
  const s = letra + String(numero).padStart(3, "0");

  senhaContainer.innerHTML = "";
  s.split("").forEach(ch => {
    const d = document.createElement("div");
    d.className = "digit";
    d.textContent = ch;
    senhaContainer.appendChild(d);
  });
}

function preencherVazio() {
  senhaContainer.innerHTML = "";
  ["-", "-", "-", "-"].forEach(ch => {
    const d = document.createElement("div");
    d.className = "digit";
    d.textContent = ch;
    senhaContainer.appendChild(d);
  });
}

// API
async function fetchFila() {
  const res = await fetch(`${servidor}/fila/${loja_servico_id}`, {
    cache: "no-store"
  });
  if (!res.ok) return [];
  return await res.json();
}

async function chamarProximo() {
  const res = await fetch(`${servidor}/chamarProximo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ loja_servico_id, colaborador_id })
  });

  const out = await res.json();
  if (!res.ok) {
    alert(out.error || "Erro ao chamar próximo.");
    return null;
  }
  return out; // pode ser null se não houver ninguém
}

async function atualizarPainel() {
  const fila = await fetchFila();

  // senha atual = mais recente em Atendimento, senão primeira em Espera
  const atendimentos = fila
    .filter(s => s.status === "Atendimento")
    .sort((a, b) => new Date(b.hora_chamada || 0) - new Date(a.hora_chamada || 0));

  let senhaAtual = atendimentos[0];

  if (!senhaAtual) {
    const esperas = fila
      .filter(s => s.status === "Espera")
      .sort((a, b) => new Date(a.data_emissao) - new Date(b.data_emissao));
    senhaAtual = esperas[0];
  }

  if (senhaAtual) preencherSenha(senhaAtual.numero, senhaAtual.tipo);
  else preencherVazio();

  const espera = fila.filter(s => s.status === "Espera").length;
  contadorEspera.textContent = `Senhas em espera: ${espera}`;
}

// eventos
btnNext.addEventListener("click", async () => {
  const nova = await chamarProximo();
  if (!nova) alert("Não há ninguém em espera.");
  atualizarPainel();
});

// loop
setInterval(atualizarPainel, 3000);
atualizarPainel();
