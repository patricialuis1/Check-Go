const servidor = "";

async function actualizarServicos() {
  const URL = servidor + "/servicos";
  const res = await fetch(URL);
  console.log("URL:", URL, "status:", res.status);

  if (!res.ok) {
  const txt = await res.text();
  console.error("Erro /servicos:", txt);
  return;
  }

  const json = await res.json();

  const container = document.getElementById("lista-servicos");
  container.innerHTML = "";

  json.forEach(element => {
    const linha = document.createElement("div");
    linha.className = "linha-tabela linha-servico";

    linha.innerHTML = `
      <a href="/views/admin/abaServico/detalhesServico.html?id=${element.id}"
        class="link-linha-servico">
        <div class="coluna-tabela coluna-id">${element.id}</div>
        <div class="coluna-tabela coluna-nome">${element.nome}</div>
        <div class="coluna-tabela coluna-descricao">${element.descricao ?? ""}</div>
      </a>

      <div class="coluna-tabela coluna-acoes">
        <a href="/views/admin/abaServico/updateServico.html?id=${element.id}"
          class="botao-acao-servico botao-acao-editar">✏️</a>

        <button class="botao-acao-servico botao-acao-apagar">🗑️</button>
      </div>
    `;


    linha.querySelector(".botao-acao-apagar").addEventListener("click", () => {
      if (confirm("Quer mesmo apagar o serviço?")) {
        apagarServico(element.id);
      }
    });

    container.appendChild(linha);
  });
}

async function apagarServico(id) {
  const URL = servidor + "apagarServico";
  await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id })
  });

  actualizarServicos();
}

actualizarServicos();
