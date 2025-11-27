const servidor = "";

async function actualizarLojas() {
  const URL = servidor + "/lojas";
  const res = await fetch(URL);

  if (!res.ok) {
    console.error("Erro /lojas:", await res.text());
    return;
  }

  const lojas = await res.json();
  const container = document.getElementById("lista-lojas");
  container.innerHTML = "";

  lojas.forEach(l => {
    const servicosTxt = (l.servicos && l.servicos.length)
      ? l.servicos.join(", ")
      : "-";

    const gerenteTxt = l.gerente_nome
      ? `${l.gerente_nome} (${l.gerente_id ?? "-"})`
      : (l.gerente_id ? `(${l.gerente_id})` : "-");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.id}</td>
      <td>
        <a href="/views/admin/abaLoja/detalhesLoja.html?id=${l.id}" class="link-linha-loja">
          ${l.nome}
        </a>
      </td>
      <td>${l.morada ?? ""}</td>
      <td>${servicosTxt}</td>
      <td>${gerenteTxt}</td>
      <td>
        <a href="/views/admin/abaLoja/updateLoja.html?id=${l.id}" class="btn-acao" title="Editar">✏️</a>
        <button class="btn-acao botao-acao-apagar" title="Apagar">🗑️</button>
      </td>
    `;

    tr.querySelector(".botao-acao-apagar").addEventListener("click", () => {
      if (confirm("Quer mesmo apagar a loja?")) apagarLoja(l.id);
    });

    container.appendChild(tr);
  });
}

async function apagarLoja(id) {
  const res = await fetch(servidor + "/apagarLoja", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id })
  });

  if (!res.ok) return;
  actualizarLojas();
}

actualizarLojas();
