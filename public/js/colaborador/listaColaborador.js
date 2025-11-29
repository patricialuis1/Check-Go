const servidor = "";

async function carregarColaboradores() {
  const res = await fetch(servidor + "/colaboradores");
  if (!res.ok) {
    console.error("Erro /colaboradores", await res.text());
    return;
  }

  const colaboradores = await res.json();
  const tbody = document.getElementById("lista-colaboradores");
  tbody.innerHTML = "";

  colaboradores.forEach(c => {
    const lojaTxt = c.loja_nome ? `${c.loja_nome} (${c.loja_id})` : "-";
    const ativoTxt = c.ativo ? "Ativo" : "Inativo";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>

      <td>
        <a href="/views/admin/abaColaborador/detalhesColaborador.html?id=${c.id}"
           class="link-linha-loja">
          ${c.nome}
        </a>
      </td>

      <td>${c.email}</td>
      <td>${lojaTxt}</td>
      <td>${c.role}</td>
      <td>${ativoTxt}</td>
      <td>
        <a href="/views/admin/abaColaborador/updateColaborador.html?id=${c.id}"
           class="btn-acao" title="Editar">✏️</a>
        <button class="btn-acao btn-apagar" data-id="${c.id}" title="Apagar">🗑️</button>
      </td>
    `;

    tr.querySelector(".btn-apagar").addEventListener("click", async () => {
      if (!confirm("Apagar colaborador?")) return;
      await fetch(servidor + "/apagarColaborador", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: c.id })
      });
      carregarColaboradores();
    });

    tbody.appendChild(tr);
  });
}

carregarColaboradores();
