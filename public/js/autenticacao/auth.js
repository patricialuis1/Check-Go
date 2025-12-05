import supabasePublic from "./supabasePublic.js";

export function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("auth_user"));
  } catch {
    return null;
  }
}

export function requireAuth(rolesPermitidos = []) {
  const user = getAuthUser();
  if (!user) {
    window.location.href = "/views/autenticacao/login.html";
    return null;
  }

  if (rolesPermitidos.length && !rolesPermitidos.includes(user.role)) {
    alert("Sem permissões.");
    window.location.href = "/views/home.html";
    return null;
  }

  return user;
}

export async function logout() {
  localStorage.removeItem("auth_user");
  await supabasePublic.auth.signOut();
  window.location.href = "/views/autenticacao/login.html";
}
