// operadorBD/operadorLojas.js
import supabase from "../config/supabaseClient.js";
import Loja from "../modelos/loja.js";

class OperadorLojas {

  async inserirLoja(loja, servicoIds = []) {
    if (!servicoIds.length) {
      throw new Error("A loja tem de ter pelo menos um serviço.");
    }

    const { data: novaLoja, error: e1 } = await supabase
      .from("lojas")
      .insert([{
        nome: loja.nome,
        morada: loja.morada,
        gerente_id: loja.gerente_id
      }])
      .select("id")
      .single();

    if (e1) throw e1;

    const rows = servicoIds.map(servico_id => ({
      loja_id: novaLoja.id,
      servico_id,
      ativo: true
    }));

    const { error: e2 } = await supabase
      .from("lojas_servicos")
      .insert(rows);

    if (e2) throw e2;

    return true;
  }

  async obterLojas() {
    const { data, error } = await supabase
      .from("lojas")
      .select(`
        id,
        nome,
        morada,
        gerente_id,
        gerente:users!lojas_gerente_id_fkey (
          id,
          nome
        ),
        lojas_servicos (
          ativo,
          servicos (
            id,
            nome
          )
        )
      `)
      .order("id", { ascending: true });

    if (error) throw error;
    



    return data.map(l => {
      const servicosAtivos = (l.lojas_servicos || [])
        .filter(ls => ls.ativo)
        .map(ls => ls.servicos?.nome)
        .filter(Boolean);

      return new Loja({
        id: l.id,
        nome: l.nome,
        morada: l.morada,
        gerente_id: l.gerente?.id ?? l.gerente_id ?? null,
        gerente_nome: l.gerente?.nome ?? null,
        servicos: servicosAtivos
      });
    });
  }

  async obterLojaPorId(id) {
  const { data, error } = await supabase
    .from("lojas")
    .select(`
      id,
      nome,
      morada,
      gerente_id,
      gerente:users!lojas_gerente_id_fkey (
        id,
        nome
      ),
      lojas_servicos (
        ativo,
        servico_id,
        servicos (
          id,
          nome
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  const servicosAtivos = (data.lojas_servicos || [])
    .filter(ls => ls.ativo);

  const servicosNomes = servicosAtivos
    .map(ls => ls.servicos?.nome)
    .filter(Boolean);

  const servicosIds = servicosAtivos
    .map(ls => ls.servico_id)
    .filter(Boolean);

  // devolve um objeto normal com ids + nomes
  return {
    id: data.id,
    nome: data.nome,
    morada: data.morada,
    gerente_id: data.gerente?.id ?? data.gerente_id ?? null,
    gerente_nome: data.gerente?.nome ?? null,
    servicos: servicosNomes,
    servicos_ids: servicosIds
  };
}


  async updateLoja(loja, servicoIds = []) {
    if (!servicoIds.length) {
      throw new Error("A loja tem de ter pelo menos um serviço.");
    }

    const { error: e1 } = await supabase
      .from("lojas")
      .update({
        nome: loja.nome,
        morada: loja.morada,
        gerente_id: loja.gerente_id
      })
      .eq("id", loja.id);

    if (e1) throw e1;

    const { error: e2 } = await supabase
      .from("lojas_servicos")
      .delete()
      .eq("loja_id", loja.id);

    if (e2) throw e2;

    const rows = servicoIds.map(servico_id => ({
      loja_id: loja.id,
      servico_id,
      ativo: true
    }));

    const { error: e3 } = await supabase
      .from("lojas_servicos")
      .insert(rows);

    if (e3) throw e3;

    return true;
  }

  async apagarLoja(id) {
    const { error } = await supabase
      .from("lojas")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }


   async obterServicosDaLoja(lojaId) {
    const { data, error } = await supabase
      .from("lojas_servicos")
      .select(`
        id,
        ativo,
        servicos (
          id,
          nome
        )
      `)
      .eq("loja_id", lojaId)
      .eq("ativo", true);

    if (error) throw error;

    return (data || []).map(ls => ({
      loja_servico_id: ls.id,
      servico_id: ls.servicos?.id,
      nome: ls.servicos?.nome
    }));
  }

}



export default OperadorLojas;
