// OperadorBD/operadorServicos.js
import supabase from "../config/supabaseClient.js";
import Servico from "../modelos/servico.js";

class OperadorServicos {

  async inserirServico(servico) {
    const { error } = await supabase
      .from("servicos")
      .insert([{ nome: servico.nome, descricao: servico.descricao }]);

    if (error) throw error;
    return true;
  }

  async obterServicos() {
    const { data, error } = await supabase
      .from("servicos")
      .select("id, nome, descricao")
      .order("id", { ascending: true });

    if (error) throw error;

    // devolve coleção de objetos Servico como no teu template
    return data.map(s => new Servico(s.nome, s.descricao, s.id));
  }

async apagarServico(id) {
  const { error } = await supabase
    .from("servicos")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}


  async updateServico(servico) {
    const { error } = await supabase
      .from("servicos")
      .update({ nome: servico.nome, descricao: servico.descricao })
      .eq("id", servico.id);

    if (error) throw error;
    return true;
  }

  async obterServicoPorId(id) {
    const { data, error } = await supabase
      .from("servicos")
      .select("id, nome, descricao")
      .eq("id", id)
      .single();

    if (error) throw error;
    return new Servico(data.nome, data.descricao, data.id);
  }
}

export default OperadorServicos;
