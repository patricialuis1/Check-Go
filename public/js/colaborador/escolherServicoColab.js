const servidor = "";

const params = new URLSearchParams(window.location.search);
let loja_id = Number(params.get("loja_id"));

// fallback: se guardas loja do user logado
if (!loja_id) {
  loja_id = Number(localStorage.getItem("loja_id"));
}

const titulo = document.querySelector(".page-title");
const lista = document.querySelector(".servico-list");

if (!loja_id) {
  alert("Não foi possível identificar a loja do colaborador.");
}

// tenta rota completa (recomendada)
async function fetchServicosDaLoja() {
  const res = await fetch(`${servidor}/lojas/${loja_id}/servicos`);
  if (!res.ok) throw new Error("rota /lojas/:id/servicos não existe");
  return await res.json(); 
  // esperado: [{loja_servico_id, nome}]
}

function renderServicos(servicos) {
  lista.innerHTML = "";

  if (!servicos.length) {
    lista.innerHTML = `<p>Esta loja não tem serviços ativos.</p>`;
    return;
  }

  servicos.forEach(s => {
    const a = document.createElement("a");
    a.className = "servico-btn";
    a.href = `menuTrabalhador.html?loja_servico_id=${s.loja_servico_id}`;
    a.textContent = s.nome;
    lista.appendChild(a);
  });
}

(async () => {
  try {
    // título da loja (opcional)
    const lojaRes = await fetch(`${servidor}/lojas/${loja_id}`);
    if (lojaRes.ok) {
      const loja = await lojaRes.json();
      if (loja?.nome) titulo.textContent = loja.nome;
    }

    const servicos = await fetchServicosDaLoja();
    renderServicos(servicos);

  } catch (err) {
    console.error(err);
    lista.innerHTML = `<p>Erro ao carregar serviços da loja.</p>`;
  }
})();
