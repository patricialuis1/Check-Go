import supabasePublic from "./supabasePublic.js";
import { logout } from "./auth.js"; // IMPORTAÇÃO OBRIGATÓRIA para limpar a sessão em caso de erro

const form = document.querySelector(".login-form");
const emailInput = form.querySelector('input[type="email"]');
const passInput = form.querySelector('input[type="password"]');


function redirectByRole(user) {
  // 🎯 ADMIN: Vai para a Lista de Lojas (que é o 1º item do menu lateral)
  if (user.role === "Administrador") {
    // Corrigido para /views/admin/abaLoja/listaLoja.html (mais lógico que listaLojas.html)
    window.location.href = "/views/admin/abaLoja/listaLoja.html";
    return;
  }

  // 🎯 GERENTE: Vai para os detalhes da sua loja (se tiver) ou para a dashboard
  if (user.role === "Gerente") {
    if (user.loja_id) {
      // Corrigido para a pasta correta /abaLoja/detalhesLoja.html
      window.location.href = `/views/admin/abaLoja/detalhesLoja.html?id=${user.loja_id}`;
    } else {
      // Gerente sem loja associada vai para o dashboard (mais seguro que a lista)
      window.location.href = "/views/admin/dashboard.html";
    }
    return;
  }

  // 🎯 COLABORADOR: Vai para a escolha de serviço na sua loja
  if (user.role === "Colaborador") {
    if (!user.loja_id) {
      alert("Colaborador sem loja associada. Contacte o Administrador.");
      window.location.href = "/views/home.html";
      return;
    }
    window.location.href = `/views/colaborador/escolherservico.html?loja_id=${user.loja_id}`;
    return;
  }

  // Se a role for desconhecida, faz logout por segurança
  window.location.href = "/views/home.html";
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  // 1) login Auth
  const { data, error: authError } = await supabasePublic.auth.signInWithPassword({
    email,
    password
  });

  // CRÍTICO: Tratamento de erro na autenticação
  if (authError || !data.user) {
    alert("Credenciais inválidas ou conta não verificada.");
    console.error("Auth Error:", authError?.message);
    return;
  }

  const authUser = data.user;

  // 2) ir buscar o perfil na tua tabela users (public.users)
  const { data: perfil, error: perfilError } = await supabasePublic
    .from("users")
    .select("id, nome, role, loja_id, ativo")
    .eq("auth_id", authUser.id)
    .maybeSingle();

  // CRÍTICO: Tratamento de erro no perfil (se o trigger falhou ou RLS bloqueou)
  if (perfilError || !perfil) {
    alert("Erro: O perfil de utilizador não foi encontrado na Base de Dados. Sessão terminada.");
    console.error("Perfil Error:", perfilError?.message);
    logout(); // Chama a função de logout do auth.js para limpar a sessão Auth/LS
    return;
  }

  // 3) Verificar se a conta está ativa
  if (!perfil.ativo) {
    alert("Conta desativada. Contacte o Administrador.");
    logout();
    return;
  }

  // 4) guardar sessão simples (guarda a loja_id para o Colaborador/Gerente)
  localStorage.setItem("auth_user", JSON.stringify(perfil));
  // Opcional, mas útil: localStorage.setItem("loja_id", perfil.loja_id);

  // 5) redirecionar por role
  redirectByRole(perfil);
});