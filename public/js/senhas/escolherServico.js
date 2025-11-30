const servidor = "";

// a loja vem por querystring (?loja_id=1) ou por QR
const params = new URLSearchParams(window.location.search);
const loja_id = Number(params.get("loja_id"));

const titulo = document.querySelector(".page-title");
const lista = document.querySelector(".servico-list");

if (!loja_id) {
  alert("Loja inválida. Volta atrás e escolhe uma loja.");
}

// Vai buscar loja + serviços ativos
async function fetchServicosDaLoja() {
  const res = await fetch(`${servidor}/lojas/${loja_id}/servicos`);
  if (!res.ok) return [];
  return await res.json();
}

function renderServicos(servicos) {
  lista.innerHTML = "";

  if (!servicos.length) {
    lista.innerHTML = `<p>Esta loja não tem serviços ativos.</p>`;
    return;
  }

  servicos.forEach(s => {
    // s precisa vir como: { loja_servico_id, nome }
    const a = document.createElement("a");
    a.className = "servico-btn";
    a.href = `retirarSenha.html?loja_servico_id=${s.loja_servico_id}`;
    a.textContent = s.nome;
    lista.appendChild(a);
  });
}

async function init() {
  // opcional: atualizar titulo com nome da loja
  const lojaRes = await fetch(`${servidor}/lojas/${loja_id}`);
  if (lojaRes.ok) {
    const loja = await lojaRes.json();
    if (loja?.nome) titulo.textContent = loja.nome;
  }

  const servicos = await fetchServicosDaLoja();
  renderServicos(servicos);
}

init();
