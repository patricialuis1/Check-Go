const servidor = ""; // igual ao serviço

const ENDPOINTS = {
  LISTAR: `${servidor}/lojas`,          // GET
  APAGAR: `${servidor}/apagarLoja`,    // POST {id}
};

let idParaApagar = null;

async function actualizarLojas() {
  const URL = ENDPOINTS.LISTAR;
  const res = await fetch(URL, { cache: "no-store" });
  const json = await res.json();

  const container = document.getElementById("lista-lojas");
  container.innerHTML = "";

  json.forEach(element => {
    const linha = document.createElement("div");
    linha.className = "linha-tabela linha-servico";

    linha.innerHTML = `
      <div class="coluna-tabela coluna-id">${element.id}</div>
      <div class="coluna-tabela coluna-nome">${element.nome}</div>
      <div class="coluna-tabela coluna-descricao">${element.morada ?? ""}</div>
      <div class="coluna-tabela coluna-descricao">${element.gerente_id ?? "-"}</div>
      <div class="coluna-tabela coluna-acoes">
        <a href="/views/admin/abaLoja/detalhesLoja.html?id=${element.id}" class="botao-acao botao-acao-editar">
          <i class="fa fa-eye"></i>
        </a>
        <a href="/views/admin/abaLoja/updateLoja.html?id=${element.id}" class="botao-acao botao-acao-editar">
          <i class="fa fa-pencil"></i>
        </a>
        <button class="botao-acao botao-acao-apagar" onclick="abrirModalApagar(${element.id})">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    `;

    container.appendChild(linha);
  });
}

function abrirModalApagar(id) {
  idParaApagar = id;
  document.getElementById("modal-apagar-loja").style.display = "flex";
}

function fecharModalApagar() {
  idParaApagar = null;
  document.getElementById("modal-apagar-loja").style.display = "none";
}

async function apagarLojaConfirmado() {
  if (!idParaApagar) return;

  const res = await fetch(ENDPOINTS.APAGAR, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: idParaApagar })
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Erro apagarLoja:", res.status, txt);
    return;
  }

  fecharModalApagar();
  actualizarLojas();
}

window.onload = () => {
  document.getElementById("cancelar-apagar").onclick = (e) => {
    e.preventDefault();
    fecharModalApagar();
  };
  document.getElementById("confirmar-apagar").onclick = apagarLojaConfirmado;

  actualizarLojas();
};
