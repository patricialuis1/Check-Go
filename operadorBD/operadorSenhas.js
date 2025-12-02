import supabase from "../config/supabaseClient.js";

class OperadorSenhas {

  // ✅ ATÓMICO via RPC
  async tirarSenha(loja_servico_id, tipo = "Normal") {
    if (!loja_servico_id) throw new Error("loja_servico_id inválido");

    const { data, error } = await supabase.rpc("rpc_tirar_senha", {
      p_loja_servico_id: loja_servico_id,
      p_tipo: tipo
    });

    if (error) throw error;
    return data; // row da senha criada
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

  // ✅ “senhaAtual” definida aqui
  async obterEstadoFila(loja_servico_id) {
    const fila = await this.obterFila(loja_servico_id);

    const senhaAtual = fila
      .filter(s => s.status === "Atendimento")
      .sort((a, b) => new Date(a.hora_chamada || a.data_emissao) - new Date(b.hora_chamada || b.data_emissao))[0] || null;

    const emEspera = fila.filter(s => s.status === "Espera").length;

    return { senhaAtual, emEspera };
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

  // regra:
  // - se existir uma senha em Atendimento desta fila e NÃO foi concluída,
  //   ao chamar próximo ela vira Cancelado (cliente não estava lá)
  // - depois chama a 1ª senha em Espera -> Atendimento
  async chamarProximo(loja_servico_id, colaborador_id = null) {
    if (!loja_servico_id) throw new Error("loja_servico_id inválido");

    // 0) ver se já existe alguém em Atendimento
    const { data: atual, error: e0 } = await supabase
      .from("senhas")
      .select("*")
      .eq("loja_servico_id", loja_servico_id)
      .eq("status", "Atendimento")
      .order("hora_chamada", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (e0) throw e0;

    // 0.1) se existir, cancela (no-show)
    if (atual) {
      const { error: eCancel } = await supabase
        .from("senhas")
        .update({
          status: "Cancelado",
          hora_conclusao: new Date().toISOString()
        })
        .eq("id", atual.id);

      if (eCancel) throw eCancel;
    }

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
