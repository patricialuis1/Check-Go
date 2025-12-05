// OperadorBD/operadorColaboradores.js
import supabase from "../config/supabaseClient.js";
import Colaborador from "../modelos/colaborador.js";

class OperadorColaboradores {

  // criar colaborador
async inserirColaborador(colab, password) {
    
    // 1. Criar o utilizador no Supabase Auth (auth.users)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: colab.email,
      password: password,
      email_confirm: true, // Confirma o email automaticamente (criado por Admin)
    });

    if (authError) {
      // Supabase Auth lança erros como "User already registered"
      throw authError; 
    }

    const authUserId = authData.user.id;

    // 2. Atualizar o perfil public.users criado automaticamente pelo Trigger
    // Usamos o authUserId para encontrar o perfil e aplicar as permissões Admin.
    const { error: updateError } = await supabase
      .from("users")
      .update({
        nome: colab.nome,
        email: colab.email,
        role: colab.role,
        loja_id: colab.loja_id,
        ativo: colab.ativo
      })
      .eq("auth_id", authUserId); // O 'auth_id' que o Trigger criou

    if (updateError) {
      // Se falhar a atualização do perfil, limpamos o user Auth para evitar órfãos
      await supabase.auth.admin.deleteUser(authUserId);
      throw updateError;
    }
    
    return true;
  }


  // listar colaboradores (com nome da loja)
  async obterColaboradores() {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        nome,
        email,
        role,
        loja_id,
        ativo,
        loja:lojas!users_loja_id_fkey (
          id,
          nome
        )
      `)
      .order("id", { ascending: true });

    if (error) throw error;

    return data.map(u => new Colaborador({
      id: u.id,
      nome: u.nome,
      email: u.email,
      role: u.role,
      loja_id: u.loja_id,
      loja_nome: u.loja?.nome ?? null,
      ativo: u.ativo
    }));
  }

  // obter 1 colaborador
  async obterColaboradorPorId(id) {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        nome,
        email,
        role,
        loja_id,
        ativo,
        loja:lojas!users_loja_id_fkey (
          id,
          nome
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return new Colaborador({
      id: data.id,
      nome: data.nome,
      email: data.email,
      role: data.role,
      loja_id: data.loja_id,
      loja_nome: data.loja?.nome ?? null,
      ativo: data.ativo
    });
  }

  // atualizar colaborador
  async updateColaborador(colab) {
    const { error } = await supabase
      .from("users")
      .update({
        nome: colab.nome,
        email: colab.email,
        role: colab.role,
        loja_id: colab.loja_id,
        ativo: colab.ativo
      })
      .eq("id", colab.id);

    if (error) throw error;
    return true;
  }

  // apagar colaborador
  async apagarColaborador(id) {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
}

export default OperadorColaboradores;
