const servidor = "";

async function actualizarLojas() {
  const URL = servidor + "/lojas";
  const res = await fetch(URL);
  console.log("URL:", URL, "status:", res.status);

  if (!res.ok) {
    const txt = await res.text();
    console.error("Erro /lojas:", txt);
    return;
  }

  const json = await res.json();
  const container = document.getElementById("lista-lojas");
  container.innerHTML = "";

  json.forEach(element => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${element.id}</td>

      <td>
        <a href="/views/admin/abaLoja/detalhesLoja.html?id=${element.id}" class="link-linha-loja">
          ${element.nome}
        </a>
      </td>

      <td>${element.morada ?? ""}</td>
      <td>${element.gerente_id ?? "-"}</td>

      <td>
        <a href="/views/admin/abaLoja/updateLoja.html?id=${element.id}" 
          class="btn-acao" title="Editar">✏️
        </a>

        <button class="btn-acao botao-acao-apagar" title="Apagar">
          🗑️
        </button>
      </td>
    `;

    tr.querySelector(".botao-acao-apagar").addEventListener("click", () => {
      if (confirm("Quer mesmo apagar a loja?")) {
        apagarLoja(element.id);
      }
    });

    container.appendChild(tr);
  });
}

async function apagarLoja(id) {
  console.log("🗑️ apagarLoja chamado com id:", id);

  const URL = servidor + "/apagarLoja";
  console.log("➡️ POST para:", URL);

  const res = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id })
  });

  console.log("⬅️ status apagarLoja:", res.status);

  const txt = await res.text();
  console.log("body apagarLoja:", txt);

  if (!res.ok) return;

  actualizarLojas();
}

actualizarLojas();
