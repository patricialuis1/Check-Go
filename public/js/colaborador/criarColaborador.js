const servidor = "";
const form = document.getElementById("form-criar-colab");
const lojaSelect = document.getElementById("loja_id");
const btnCancelar = document.getElementById("cancelar");

btnCancelar.addEventListener("click", () => {
  window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
});

async function carregarLojas() {
  const res = await fetch(servidor + "/lojas");
  const lojas = await res.json();

  lojaSelect.innerHTML = `<option value="">— Sem loja —</option>` + 
    lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const loja_id_raw = lojaSelect.value;
  const loja_id = loja_id_raw ? Number(loja_id_raw) : null;
  const ativo = document.getElementById("ativo").checked;

  if (!nome || !email || !password) {
    alert("Nome, email e password são obrigatórios.");
    return;
  }

  const res = await fetch(servidor + "/novoColaborador", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nome, email, password, role, loja_id, ativo })
  });

  const out = await res.json();
  if (out.response !== "ok") {
    alert(out.response || "Erro ao criar colaborador");
    return;
  }

  window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
});

carregarLojas();
