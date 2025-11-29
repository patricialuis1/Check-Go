const servidor = "";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const form = document.getElementById("form-update-colab");
const lojaSelect = document.getElementById("loja_id");

async function carregarLojas() {
  const res = await fetch(servidor + "/lojas");
  const lojas = await res.json();

  lojaSelect.innerHTML =
    `<option value="">— Sem loja —</option>` +
    lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join("");
}

async function carregarColaborador() {
  if (!id) {
    alert("ID inválido.");
    window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
    return;
  }

  const res = await fetch(servidor + "/colaboradores/" + id);
  const c = await res.json();

  document.getElementById("nome").value = c.nome ?? "";
  document.getElementById("email").value = c.email ?? "";
  document.getElementById("role").value = c.role ?? "Colaborador";
  document.getElementById("ativo").checked = !!c.ativo;

  lojaSelect.value = c.loja_id ?? "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;
  const loja_id_raw = lojaSelect.value;
  const loja_id = loja_id_raw ? Number(loja_id_raw) : null;
  const ativo = document.getElementById("ativo").checked;

  if (!nome || !email) {
    alert("Nome e email são obrigatórios.");
    return;
  }

  if (role === "Gerente" && loja_id) {
  const ok = confirm("Esta loja já pode ter um gerente. Queres substituir o gerente atual?");
  if (!ok) return;
  }


  const res = await fetch(servidor + "/actualizarColaborador", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, nome, email, role, loja_id, ativo })
  });

  const out = await res.json();
  if (!out.resultado) {
    alert(out.message || "Erro ao atualizar colaborador.");
    return;
  }

  window.location.href = "/views/admin/abaColaborador/listaColaborador.html";
});

(async () => {
  await carregarLojas();
  await carregarColaborador();
})();
