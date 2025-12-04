import supabasePublic from "../config/supabasePublic.js";

const form = document.querySelector(".login-form");
const emailInput = form.querySelector('input[type="email"]');
const passInput = form.querySelector('input[type="password"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  // 1) login Auth
  const { data, error } = await supabasePublic.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    alert("Credenciais inválidas.");
    return;
  }

  const authUser = data.user;

  // 2) ir buscar o perfil na tua tabela users
  const { data: perfil, error: perfilError } = await supabasePublic
    .from("users")
    .select("id, nome, role, loja_id, ativo")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  if (perfilError || !perfil) {
    alert("Este utilizador não tem perfil na BD.");
    await supabasePublic.auth.signOut();
    return;
  }

  if (!perfil.ativo) {
    alert("Conta desativada.");
    await supabasePublic.auth.signOut();
    return;
  }

  // 3) guardar sessão simples
  localStorage.setItem("auth_user", JSON.stringify(perfil));

  // 4) redirecionar por role (automático para colaborador)
  redirectByRole(perfil);
});

function redirectByRole(user) {
  if (user.role === "Administrador") {
    window.location.href = "/views/admin/listaLojas.html";
    return;
  }

  if (user.role === "Gerente") {
    if (user.loja_id) {
      window.location.href = `/views/admin/detalhesLoja.html?id=${user.loja_id}`;
    } else {
      window.location.href = "/views/admin/listaLojas.html";
    }
    return;
  }

  if (user.role === "Colaborador") {
    if (!user.loja_id) {
      alert("Colaborador sem loja associada.");
      window.location.href = "/views/home.html";
      return;
    }
    window.location.href = `/views/colaborador/escolherservico.html?loja_id=${user.loja_id}`;
    return;
  }

  window.location.href = "/views/home.html";
}
