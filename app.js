// app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from 'uuid'; // 🎯 NOVO: Para gerar tokens de sessão

// Importar o NOVO MÓDULO DE SEGURANÇA
import { protegerRota, autorizarCargos } from "./seguranca/authMiddleware.js"; 


import OperadorServicos from "./operadorBD/operadorServicos.js";
import Servico from "./modelos/servico.js";

import OperadorLojas from "./operadorBD/operadorLojas.js";
import Loja from "./modelos/loja.js";

import OperadorColaboradores from "./operadorBD/operadorColaboradores.js";
import Colaborador from "./modelos/colaborador.js";

import OperadorSenhas from "./operadorBD/operadorSenhas.js";
import supabase from "./config/supabaseClient.js"; // Necessário para rotas de sessão


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const APP = express();

APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));


// =========================================================================
//                  NOVAS ROTAS DE SESSÃO NA DB
// =========================================================================

// Rota para criar o DB Session Token após login bem-sucedido no Frontend
APP.post("/createSession", async (req, res) => {
  try {
    const { auth_id } = req.body;
    if (!auth_id) return res.status(400).json({ resultado: false, message: "auth_id em falta." });

    const newSessionToken = uuidv4();
    
    // Armazena o novo token na coluna session_token do user
    const { error } = await supabase
      .from("users")
      .update({ session_token: newSessionToken })
      .eq("auth_id", auth_id);

    if (error) throw error;

    res.json({ sessionToken: newSessionToken });
    
  } catch (err) {
    console.error("🔥 ERRO /createSession:", err.message);
    res.status(500).json({ resultado: false, message: "Erro ao criar token de sessão." });
  }
});

// Rota para terminar a sessão (usada no logout do frontend)
APP.post("/deleteSession", async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.json({ resultado: true }); 

        const token = authHeader.split(' ')[1]; 

        // Apaga o token na tabela users (define como NULL)
        await supabase
            .from("users")
            .update({ session_token: null })
            .eq("session_token", token);

        res.json({ resultado: true }); 
    } catch (err) {
        console.error("🔥 ERRO /deleteSession:", err);
        res.status(500).json({ resultado: false, message: err.message });
    }
});


// -------- SENHAS (PÚBLICAS/PROTEGIDAS) --------

// ---------------- SENHAS ----------------

// Cliente tira senha (PÚBLICO)
APP.post("/tirarSenha", async (req, res) => {
  try {
    const { loja_servico_id, tipo } = req.body;
    const bdo = new OperadorSenhas();

    const senha = await bdo.tirarSenha(loja_servico_id, tipo || "Normal");
    res.json(senha);
  } catch (err) {
    console.error("🔥 ERRO /tirarSenha:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

// Fila de um serviço (Espera + Atendimento) (PÚBLICO)
APP.get("/fila/:loja_servico_id", async (req, res) => {
  try {
    const loja_servico_id = Number(req.params.loja_servico_id);
    const bdo = new OperadorSenhas();

    const fila = await bdo.obterFila(loja_servico_id);
    res.json(fila);
  } catch (err) {
    console.error("🔥 ERRO /fila/:loja_servico_id:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

// estado da fila (senha atual + nº em espera) (PÚBLICO)
APP.get("/estadoFila/:loja_servico_id", async (req, res) => {
  try {
    const loja_servico_id = Number(req.params.loja_servico_id);
    const bdo = new OperadorSenhas();

    const estado = await bdo.obterEstadoFila(loja_servico_id);
    res.json(estado);
  } catch (err) {
    console.error("🔥 ERRO /estadoFila/:loja_servico_id:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});


// Cliente cancela senha (PÚBLICO)
APP.post("/cancelarSenha", async (req, res) => {
  try {
    const { senha_id } = req.body;
    const bdo = new OperadorSenhas();

    const out = await bdo.cancelarSenha(senha_id);
    res.json(out);
  } catch (err) {
    console.error("🔥 ERRO /cancelarSenha:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

// ✅ COLABORADOR: chamar próxima senha (PROTEGIDO)
APP.post("/chamarProximo", protegerRota, autorizarCargos(["Colaborador", "Gerente", "Administrador"]), async (req, res) => {
  try {
    const { loja_servico_id, colaborador_id } = req.body;
    const bdo = new OperadorSenhas();

    const senha = await bdo.chamarProximo(loja_servico_id, colaborador_id || req.user.id);
    res.json(senha);
  } catch (err) {
    console.error("🔥 ERRO /chamarProximo:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

// ✅ COLABORADOR: concluir senha atual (PROTEGIDO)
APP.post("/concluirSenha", protegerRota, autorizarCargos(["Colaborador", "Gerente", "Administrador"]), async (req, res) => {
  try {
    const { senha_id } = req.body;
    const bdo = new OperadorSenhas();

    const out = await bdo.concluirSenha(senha_id);
    res.json(out);
  } catch (err) {
    console.error("🔥 ERRO /concluirSenha:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});


// ROTA LOGOUT (FRONTEND)
APP.get("/logout", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "autenticacao", "logout.html"));
});


//------------- FIM SENHAS ----------------

APP.use("/", express.static("public"));

// ... debug-servicos ...


// ===============================================
// SERVICOS (PROTEGIDO: Admin, Gerente)
// ===============================================

// criar (PROTEGIDO: Admin)
APP.post("/novoServico", protegerRota, autorizarCargos(["Administrador"]), async (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome || nome.trim() === "") {
    res.send({ response: "Nome vazio." });
    return;
  }

  const servico = new Servico(nome, descricao ?? "");
  const bdo = new OperadorServicos();
  await bdo.inserirServico(servico);

  res.send({ response: "ok" });
});

// listar (PROTEGIDO: Admin, Gerente)
APP.get("/servicos", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  try {
    const bdo = new OperadorServicos();
    const coleccao = await bdo.obterServicos();
    return res.status(200).json(coleccao);
  } catch (err) {
    console.error("🔥 ERRO em GET /servicos");
    return res.status(500).json({ resultado: false, message: err.message });
  }
});

// obter 1 (PROTEGIDO: Admin, Gerente)
APP.get("/servicos/:id", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  const bdo = new OperadorServicos();
  const servico = await bdo.obterServicoPorId(req.params.id);
  res.send(servico);
});

// atualizar (PROTEGIDO: Admin)
APP.post("/actualizarServico", protegerRota, autorizarCargos(["Administrador"]), async (req, res) => {
  const { id, nome, descricao } = req.body;

  const servico = new Servico(nome, descricao ?? "", id);
  const bdo = new OperadorServicos();
  await bdo.updateServico(servico);

  res.send({ resultado: "Serviço actualizado" });
});

// apagar (PROTEGIDO: Admin)
APP.post("/apagarServico", protegerRota, autorizarCargos(["Administrador"]), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id em falta" });

    const bdo = new OperadorServicos();
    await bdo.apagarServico(Number(id));

    return res.json({ ok: true });
  } catch (err) {
    console.error("🔥 ERRO /apagarServico:", err);
    return res.status(500).json({ resultado: false, message: err.message });
  }
});


// ===============================================
// LOJAS (PROTEGIDO: Admin, Gerente, Colaborador)
// ===============================================

// criar loja (PROTEGIDO: Admin)
APP.post("/novaLoja", protegerRota, autorizarCargos(["Administrador"]), async (req, res) => {
  try {
    const { nome, morada, gerente_id, servicoIds } = req.body;

    if (!nome || nome.trim() === "" || !morada || morada.trim() === "") {
      return res.status(400).send({ response: "Campos vazios." });
    }
    // ... (restante da validação)
    const loja = new Loja({ nome, morada, gerente_id: gerente_id ?? null });
    const bdo = new OperadorLojas();
    await bdo.inserirLoja(loja, servicoIds.map(Number));

    return res.send({ response: "ok" });
  } catch (err) {
    console.error("🔥 ERRO /novaLoja:", err);
    return res.status(500).send({ resultado: false, message: err.message });
  }
});


// listar lojas (PROTEGIDO: Todos os colaboradores/gestores)
APP.get("/lojas", protegerRota, autorizarCargos(["Administrador", "Gerente", "Colaborador"]), async (req, res) => {
  try {
    const bdo = new OperadorLojas();
    let coleccao = await bdo.obterLojas();
    
    // FILTRAGEM DE RECURSO: Gerente e Colaborador só vêem a sua loja
    if (req.user.role !== "Administrador" && req.user.loja_id) {
        coleccao = coleccao.filter(l => l.id === req.user.loja_id);
    }
    
    return res.status(200).json(coleccao);
  } catch (err) {
    console.error("🔥 ERRO /lojas:", err);
    return res.status(500).json({ resultado: false, message: err.message });
  }
});

// Rota pública para o utilizador/pesquisa na homepage
APP.get("/lojas/publicas", async (req, res) => {
  try {
    const bdo = new OperadorLojas();
    const coleccao = await bdo.obterLojas(); 
    return res.status(200).json(coleccao);
  } catch (err) {
    console.error("🔥 ERRO /lojas/publicas:", err?.stack || err);
    return res.status(500).json({ message: err.message });
  }
});


// obter 1 loja (PROTEGIDO: Todos os colaboradores/gestores)
APP.get("/lojas/:id", protegerRota, autorizarCargos(["Administrador", "Gerente", "Colaborador"]), async (req, res) => {
  try {
    const lojaId = Number(req.params.id);
    const bdo = new OperadorLojas();
    const loja = await bdo.obterLojaPorId(lojaId);
    
    // VERIFICAÇÃO DE RECURSO: Gerente e Colaborador só podem ver a sua loja
    if (req.user.role !== "Administrador" && req.user.loja_id !== lojaId) {
        return res.status(403).json({ resultado: false, message: "Proibido: Não tem acesso a detalhes desta loja." });
    }
    
    return res.status(200).json(loja);
  } catch (err) {
    console.error("🔥 ERRO /lojas/:id:", err);
    return res.status(500).json({ resultado: false, message: err.message });
  }
});


// atualizar loja (PROTEGIDO: Admin, Gerente)
APP.post("/actualizarLoja", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  try {
    const { id: lojaId, nome, morada, gerente_id, servicoIds } = req.body;

    // VERIFICAÇÃO DE RECURSO: Gerente só pode atualizar a sua loja
    if (req.user.role === "Gerente" && req.user.loja_id !== Number(lojaId)) {
        return res.status(403).json({ resultado: false, message: "Proibido: Gerente só pode atualizar a loja associada ao seu perfil." });
    }
    
    if (!lojaId) return res.status(400).json({ resultado: false, message: "id em falta" });
    // ... (restante da validação)
    const loja = new Loja({ id: Number(lojaId), nome, morada, gerente_id: gerente_id ?? null });
    const bdo = new OperadorLojas();
    await bdo.updateLoja(loja, servicoIds.map(Number));

    return res.send({ resultado: true });
  } catch (err) {
    console.error("🔥 ERRO /actualizarLoja:", err);
    return res.status(500).json({ resultado: false, message: err.message });
  }
});


// apagar loja (PROTEGIDO: Admin)
APP.post("/apagarLoja", protegerRota, autorizarCargos(["Administrador"]), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ resultado: false, message: "id em falta" });

    const bdo = new OperadorLojas();
    await bdo.apagarLoja(Number(id));

    return res.send({ resultado: "ok" });
  } catch (err) {
    console.error("🔥 ERRO /apagarLoja:", err);
    return res.status(500).json({ resultado: false, message: err.message });
  }
});


// ===============================================
// COLABORADORES (PROTEGIDO: Admin, Gerente)
// ===============================================

// Criar Colaborador (PROTEGIDO: Admin, Gerente)
APP.post("/novoColaborador", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  try {
    const { nome, email, password, role, loja_id, ativo } = req.body;
    
    // VERIFICAÇÃO DE RECURSO: Gerente só pode criar colaboradores para a sua loja
    if (req.user.role === "Gerente" && req.user.loja_id !== Number(loja_id)) {
        return res.status(403).send({ response: "Proibido: Gerente só pode criar colaboradores para a sua loja." });
    }
    // ... (restante da validação e criação)
    const colab = new Colaborador({ nome, email, role: role || "Colaborador", loja_id: loja_id || null, ativo: ativo !== undefined ? ativo : true });
    const bdo = new OperadorColaboradores();
    await bdo.inserirColaborador(colab, password);
    res.send({ response: "ok" });
  } catch (err) {
    console.error("🔥 ERRO /novoColaborador:", err);
    res.status(500).send({ resultado: false, message: err.message });
  }
});

// Listar Colaboradores (PROTEGIDO: Admin, Gerente)
APP.get("/colaboradores", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  try {
    const bdo = new OperadorColaboradores();
    let lista = await bdo.obterColaboradores();

    // FILTRAGEM DE RECURSO: Gerente só vê os da sua loja
    if (req.user.role === "Gerente" && req.user.loja_id) {
        lista = lista.filter(c => c.loja_id === req.user.loja_id);
    }
    
    res.status(200).json(lista);
  } catch (err) {
    console.error("🔥 ERRO /colaboradores:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

// Obter 1 Colaborador (PROTEGIDO: Admin, Gerente)
APP.get("/colaboradores/:id", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  try {
    const bdo = new OperadorColaboradores();
    const colab = await bdo.obterColaboradorPorId(Number(req.params.id));

    // VERIFICAÇÃO DE RECURSO: Gerente só vê os da sua loja
    if (req.user.role === "Gerente" && colab.loja_id !== req.user.loja_id) {
        return res.status(403).json({ resultado: false, message: "Proibido: Não tem acesso a detalhes de colaboradores fora da sua loja." });
    }

    res.status(200).json(colab);
  } catch (err) {
    console.error("🔥 ERRO /colaboradores/:id:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

APP.post("/actualizarColaborador", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  try {
    const { id, nome, email, role, loja_id, ativo } = req.body;
    
    // VERIFICAÇÃO DE RECURSO: Gerente só pode atualizar os da sua loja
    if (req.user.role === "Gerente" && (req.user.loja_id !== Number(loja_id))) {
        return res.status(403).json({ resultado: false, message: "Proibido: Gerente só pode atualizar colaboradores dentro da sua loja." });
    }

    // ... (restante da atualização)
    const colab = new Colaborador({ id: Number(id), nome, email, role: role || "Colaborador", loja_id: loja_id || null, ativo: ativo !== undefined ? ativo : true });
    const bdo = new OperadorColaboradores();
    await bdo.updateColaborador(colab);

    res.send({ resultado: true });
  } catch (err) {
    console.error("🔥 ERRO /actualizarColaborador:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

APP.post("/apagarColaborador", protegerRota, autorizarCargos(["Administrador", "Gerente"]), async (req, res) => {
  try {
    const { id: colabId } = req.body;
    
    // VERIFICAÇÃO DE RECURSO: Gerente só pode apagar os da sua loja
    const bdo = new OperadorColaboradores();
    const colabToDelete = await bdo.obterColaboradorPorId(Number(colabId));
    
    if (req.user.role === "Gerente" && colabToDelete.loja_id !== req.user.loja_id) {
        return res.status(403).json({ resultado: false, message: "Proibido: Gerente só pode apagar colaboradores da sua loja." });
    }

    await bdo.apagarColaborador(Number(colabId));
    res.send({ resultado: "ok" });
  } catch (err) {
    console.error("🔥 ERRO /apagarColaborador:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});

//UTILIZADOR - Escolher Servico de uma Loja (PÚBLICO)

// serviços ativos de uma loja (PÚBLICO)
APP.get("/lojas/:id/servicos", async (req, res) => {
  try {
    const lojaId = Number(req.params.id);
    const bdo = new OperadorLojas();
    const servicos = await bdo.obterServicosDaLoja(lojaId); 
    res.json(servicos);
  } catch (err) {
    console.error("🔥 ERRO /lojas/:id/servicos:", err);
    res.status(500).json({ resultado: false, message: err.message });
  }
});


export default APP;