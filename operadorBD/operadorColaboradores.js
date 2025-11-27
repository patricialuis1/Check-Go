import supabase from "../config/supabaseClient.js";
import Colaborador from "../modelos/colaborador.js";

export default class OperadorColaboradores {

  async obterColaboradores() {
    const { data, error } = await supabase
      .from("users")
      .select("id, nome, email, role, loja_id, ativo")
      .eq("role", "Colaborador")
      .order("id", { ascending: true });

    if (error) throw error;
    return data.map(u =>
      new Colaborador(u.id, u.nome, u.email, null, u.role, u.loja_id, u.ativo)
    );
  }

  async obterColaborador(id) {
    const { data, error } = await supabase
      .from("users")
      .select("id, nome, email, role, loja_id, ativo")
      .eq("id", id)
      .single();

    if (error) throw error;
    return new Colaborador(data.id, data.nome, data.email, null, data.role, data.loja_id, data.ativo);
  }

  async inserirColaborador(colab) {
    const { data, error } = await supabase
      .from("users")
      .insert([{
        nome: colab.getNome(),
        email: colab.getEmail(),
        password: colab.getPassword(), // ideal: já vir hashado
        role: "Colaborador",
        loja_id: colab.getLojaId(),
        ativo: colab.getAtivo()
      }])
      .select("id, nome, email, role, loja_id, ativo")
      .single();

    if (error) throw error;
    return new Colaborador(data.id, data.nome, data.email, null, data.role, data.loja_id, data.ativo);
  }

  async atualizarColaborador(id, colab) {
    const payload = {
      nome: colab.getNome(),
      email: colab.getEmail(),
      loja_id: colab.getLojaId(),
      ativo: colab.getAtivo(),
      role: "Colaborador"
    };

    // só atualiza password se vier no body
    if (colab.getPassword()) payload.password = colab.getPassword();

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .select("id, nome, email, role, loja_id, ativo")
      .single();

    if (error) throw error;
    return new Colaborador(data.id, data.nome, data.email, null, data.role, data.loja_id, data.ativo);
  }

  async apagarColaborador(id) {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
}
