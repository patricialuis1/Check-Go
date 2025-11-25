const API = "http://localhost:3000/servicos";
const lista = document.getElementById("lista-servicos");
const modal = document.getElementById("modal-apagar-servico");
const btnConfirmarApagar = modal?.querySelector(".botao-modal-perigo");
let idParaApagar = null;

async function carregarServicos() {
  const res = await fetch(API);
  const servicos = await res.json();

  lista.innerHTML = "";

  servicos.forEach(s => {
    const linha = document.createElement("div");
    linha.className = "linha-tabela linha-servico";
    linha.dataset.servicoId = s.id;

    linha.innerHTML = `
      <a href="/views/admin/abaServico/detalhesServico.html?id=${s.id}" class="link-linha-servico">
        <div class="coluna-tabela coluna-id">${s.id}</div>
        <div class="coluna-tabela coluna-nome">${s.nome}</div>
        <div class="coluna-tabela coluna-descricao">${s.descricao ?? ""}</div>
      </a>

      <div class="coluna-tabela coluna-acoes">
        <a href="/views/admin/abaServico/updateServico.html?id=${s.id}"
           class="botao-acao-servico botao-acao-editar">
          <i class="fa-solid fa-pen-to-square" aria-hidden="true"></i>
        </a>

        <a href="#modal-apagar-servico"
           class="botao-acao-servico botao-acao-apagar"
           data-id="${s.id}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </a>
      </div>
    `;

    lista.appendChild(linha);
  });

  // hooks de apagar
  document.querySelectorAll(".botao-acao-apagar").forEach(btn => {
    btn.addEventListener("click", () => {
      idParaApagar = btn.dataset.id;
    });
  });
}

btnConfirmarApagar?.addEventListener("click", async () => {
  if (!idParaApagar) return;
  await fetch(`${API}/${idParaApagar}`, { method: "DELETE" });
  idParaApagar = null;
  window.location.hash = ""; // fecha modal
  carregarServicos();
});

carregarServicos();
