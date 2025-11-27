import supabase from "../config/supabaseClient.js";
import Loja from "../modelos/loja.js";

export default class OperadorLojas {

  async obterLojas() {
    const { data, error } = await supabase
      .from("lojas")
      .select("id, nome, morada, gerente_id")
      .order("id", { ascending: true });

    if (error) throw error;
    return data.map(l => new Loja(l.id, l.nome, l.morada, l.gerente_id));
  }

  async obterLoja(id) {
    const { data, error } = await supabase
      .from("lojas")
      .select("id, nome, morada, gerente_id")
      .eq("id", id)
      .single();

    if (error) throw error;
    return new Loja(data.id, data.nome, data.morada, data.gerente_id);
  }

  async inserirLoja(loja) {
    const { data, error } = await supabase
      .from("lojas")
      .insert([{
        nome: loja.getNome(),
        morada: loja.getMorada(),
        gerente_id: loja.getGerenteId()
      }])
      .select()
      .single();

    if (error) throw error;
    return new Loja(data.id, data.nome, data.morada, data.gerente_id);
  }

  async atualizarLoja(id, loja) {
    const { data, error } = await supabase
      .from("lojas")
      .update({
        nome: loja.getNome(),
        morada: loja.getMorada(),
        gerente_id: loja.getGerenteId()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return new Loja(data.id, data.nome, data.morada, data.gerente_id);
  }

  async apagarLoja(id) {
    const { error } = await supabase
      .from("lojas")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
}
