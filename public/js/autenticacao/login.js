import supabasePublic from "./supabasePublic.js";
import { logout } from "./auth.js"; 

const form = document.querySelector(".login-form");
const emailInput = form.querySelector('input[type="email"]');
const passInput = form.querySelector('input[type="password"]');


function redirectByRole(user) {
  if (user.role === "Administrador") {
    window.location.href = "/views/admin/dashboard.html";
    return;
  }

  if (user.role === "Gerente") {
    if (user.loja_id) {
      window.location.href = `/views/admin/abaLoja/detalhesLoja.html?id=${user.loja_id}`;
    } else {
      window.location.href = "/views/admin/dashboard.html";
    }
    return;
  }

  if (user.role === "Colaborador") {
    if (!user.loja_id) {
      alert("Colaborador sem loja associada. Contacte o Administrador.");
      window.location.href = "/views/home.html";
      return;
    }
    window.location.href = `/views/colaborador/escolherservico.html?loja_id=${user.loja_id}`;
    return;
  }

  window.location.href = "/views/home.html";
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  // 1) Login Auth (Obtem auth_id)
  const { data, error: authError } = await supabasePublic.auth.signInWithPassword({
    email,
    password
  });

  if (authError || !data.user) {
    alert("Credenciais inválidas ou conta não verificada.");
    console.error("Auth Error:", authError?.message);
    return;
  }

  const authUserId = data.user.id; // ID necessário para a rota createSession

  // 2) ir buscar o perfil na tua tabela users (public.users)
  const { data: perfil, error: perfilError } = await supabasePublic
    .from("users")
    .select("id, nome, role, loja_id, ativo, auth_id") // Incluímos auth_id para ser redundante
    .eq("auth_id", authUserId)
    .maybeSingle();

  if (perfilError || !perfil) {
    alert("Erro: O perfil de utilizador não foi encontrado na Base de Dados. Sessão terminada.");
    console.error("Perfil Error:", perfilError?.message);
    logout();
    return;
  }

  // 3) Verificar se a conta está ativa
  if (!perfil.ativo) {
    alert("Conta desativada. Contacte o Administrador.");
    logout();
    return;
  }
  
  // 🎯 4) CRÍTICO: CHAMA A ROTA DO BACKEND PARA CRIAR O TOKEN NA DB
  const tokenRes = await fetch("/createSession", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ auth_id: authUserId }) 
  });
  
  if (!tokenRes.ok) {
    alert("Erro ao iniciar sessão: Falha na criação do token de sessão. A fazer logout.");
    await supabasePublic.auth.signOut(); // Limpa a sessão auth parcial
    return;
  }
  const { sessionToken } = await tokenRes.json(); // <-- Obtém o novo token UUID da DB


  // 5) guardar sessão simples: Perfil + Token de Sessão (UUID)
  const userProfile = { ...perfil, sessionToken }; // Guarda o novo token UUID
  localStorage.setItem("auth_user", JSON.stringify(userProfile));

  // 6) redirecionar por role
  redirectByRole(userProfile);
});