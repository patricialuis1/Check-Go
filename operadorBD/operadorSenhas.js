import supabase from "../config/supabaseClient.js";

class OperadorSenhas {

  async tirarSenha(loja_servico_id, tipo = "Normal") {
    if (!loja_servico_id) throw new Error("loja_servico_id inválido");

    // último número daquela fila
    const { data: maxData, error: e1 } = await supabase
      .from("senhas")
      .select("numero")
      .eq("loja_servico_id", loja_servico_id)
      .order("numero", { ascending: false })
      .limit(1);

    if (e1) throw e1;

    const nextNum = (maxData?.[0]?.numero || 0) + 1;

    const { data, error: e2 } = await supabase
      .from("senhas")
      .insert({
        numero: nextNum,
        tipo,
        status: "Espera",
        loja_servico_id
      })
      .select()
      .single();

    if (e2) throw e2;

    return data;
  }

  async obterFila(loja_servico_id) {
    const { data, error } = await supabase
      .from("senhas")
      .select("*")
      .eq("loja_servico_id", loja_servico_id)
      .in("status", ["Espera", "Atendimento"])
      .order("data_emissao", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async cancelarSenha(senha_id) {
    const { data, error } = await supabase
      .from("senhas")
      .update({ status: "Cancelado" })
      .eq("id", senha_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ✅ chamar próxima senha (primeira Espera -> Atendimento)
  async chamarProximo(loja_servico_id, colaborador_id = null) {
    // 1) buscar próxima em espera
    const { data: prox, error: e1 } = await supabase
      .from("senhas")
      .select("*")
      .eq("loja_servico_id", loja_servico_id)
      .eq("status", "Espera")
      .order("data_emissao", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (e1) throw e1;
    if (!prox) return null;

    // 2) atualizar para atendimento
    const { data: atualizada, error: e2 } = await supabase
      .from("senhas")
      .update({
        status: "Atendimento",
        colaborador_id,
        hora_chamada: new Date().toISOString()
      })
      .eq("id", prox.id)
      .select()
      .single();

    if (e2) throw e2;

    return atualizada;
  }

  // ✅ concluir senha atual
  async concluirSenha(senha_id) {
    const { data, error } = await supabase
      .from("senhas")
      .update({
        status: "Concluido",
        hora_conclusao: new Date().toISOString()
      })
      .eq("id", senha_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default OperadorSenhas;
