// OperadorBD/operadorLojas.js
import supabase from "../config/supabaseClient.js";
import Loja from "../modelos/loja.js";

class OperadorLojas {

  async inserirLoja(loja) {
    const { error } = await supabase
      .from("lojas")
      .insert([{
        nome: loja.nome,
        morada: loja.morada,
        gerente_id: loja.gerente_id
      }]);

    if (error) throw error;
    return true;
  }

  async obterLojas() {
    const { data, error } = await supabase
      .from("lojas")
      .select("id, nome, morada, gerente_id")
      .order("id", { ascending: true });

    if (error) throw error;

    return data.map(l => new Loja(l.nome, l.morada, l.gerente_id, l.id));
  }

  async apagarLoja(id) {
    const { error } = await supabase
      .from("lojas")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }

  async updateLoja(loja) {
    const { error } = await supabase
      .from("lojas")
      .update({
        nome: loja.nome,
        morada: loja.morada,
        gerente_id: loja.gerente_id
      })
      .eq("id", loja.id);

    if (error) throw error;
    return true;
  }

  async obterLojaPorId(id) {
    const { data, error } = await supabase
      .from("lojas")
      .select("id, nome, morada, gerente_id")
      .eq("id", id)
      .single();

    if (error) throw error;
    return new Loja(data.nome, data.morada, data.gerente_id, data.id);
  }
}

export default OperadorLojas;
