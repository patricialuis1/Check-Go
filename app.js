// app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import OperadorServicos from "./operadorBD/operadorServicos.js";
import Servico from "./modelos/servico.js";

import OperadorLojas from "./operadorBD/operadorLojas.js";
import Loja from "./modelos/loja.js";

import OperadorColaboradores from "./operadorBD/operadorColaboradores.js";
import Colaborador from "./modelos/colaborador.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const APP = express();

APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
APP.use("/", express.static("public"));

//debug supabase
APP.get("/debug-servicos", async (req, res) => {
  const { data, error } = await supabase
    .from("servicos")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  res.json({ data, error });
});


//SERVICOS
// criar
APP.post("/novoServico", async (req, res) => {
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

// listar
APP.get("/servicos", async (req, res) => {
  try {
    console.log("➡️ GET /servicos");
    const bdo = new OperadorServicos();
    const coleccao = await bdo.obterServicos();
    return res.status(200).json(coleccao);
  } catch (err) {
    console.error("🔥 ERRO em GET /servicos");
    console.error(err?.stack || err);
    return res.status(500).json({
      message: err?.message || "Erro interno ao listar serviços",
    });
  }
});


// obter 1 (para detalhes/update)
APP.get("/servicos/:id", async (req, res) => {
  const bdo = new OperadorServicos();
  const servico = await bdo.obterServicoPorId(req.params.id);
  res.send(servico);
});

// atualizar
APP.post("/actualizarServico", async (req, res) => {
  const { id, nome, descricao } = req.body;

  const servico = new Servico(nome, descricao ?? "", id);
  const bdo = new OperadorServicos();
  await bdo.updateServico(servico);

  res.send({ resultado: "Serviço actualizado" });
});

// apagar
APP.post("/apagarServico", async (req, res) => {
  try {
    console.log("📦 body /apagarServico:", req.body);

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id em falta" });

    const bdo = new OperadorServicos();
    await bdo.apagarServico(Number(id));

    return res.json({ ok: true });
  } catch (err) {
    console.error("🔥 ERRO /apagarServico:", err?.stack || err);
    return res.status(500).json({ message: err.message });
  }
});



//LOJAS

//LOJAS

// criar loja (agora com serviços)
APP.post("/novaLoja", async (req, res) => {
  try {
    const { nome, morada, gerente_id, servicoIds } = req.body;

    if (!nome || nome.trim() === "" || !morada || morada.trim() === "") {
      return res.status(400).send({ response: "Campos vazios." });
    }

    if (!Array.isArray(servicoIds) || servicoIds.length === 0) {
      return res.status(400).send({ response: "A loja tem de ter pelo menos 1 serviço." });
    }

    // se estás a usar o novo modelo Loja (com object)
    const loja = new Loja({
      nome,
      morada,
      gerente_id: gerente_id ?? null
    });

    const bdo = new OperadorLojas();
    await bdo.inserirLoja(loja, servicoIds.map(Number));

    return res.send({ response: "ok" });
  } catch (err) {
    console.error("🔥 ERRO /novaLoja:", err?.stack || err);
    return res.status(500).send({ response: err.message || "Erro interno" });
  }
});


// listar lojas (já vem com serviços ativos + gerente nome/id)
APP.get("/lojas", async (req, res) => {
  try {
    const bdo = new OperadorLojas();
    const coleccao = await bdo.obterLojas(); 
    return res.status(200).json(coleccao);
  } catch (err) {
    console.error("🔥 ERRO /lojas:", err?.stack || err);
    return res.status(500).json({ message: err.message });
  }
});


// obter 1 loja (detalhes/update) — com serviços ativos + gerente nome/id
APP.get("/lojas/:id", async (req, res) => {
  try {
    const bdo = new OperadorLojas();
    const loja = await bdo.obterLojaPorId(Number(req.params.id));
    return res.status(200).json(loja);
  } catch (err) {
    console.error("🔥 ERRO /lojas/:id:", err?.stack || err);
    return res.status(500).json({ message: err.message });
  }
});


// atualizar loja (agora com serviços)
APP.post("/actualizarLoja", async (req, res) => {
  try {
    const { id, nome, morada, gerente_id, servicoIds } = req.body;

    if (!id) return res.status(400).json({ resultado: false, message: "id em falta" });
    if (!nome || nome.trim() === "" || !morada || morada.trim() === "") {
      return res.status(400).json({ resultado: false, message: "Campos vazios" });
    }

    if (!Array.isArray(servicoIds) || servicoIds.length === 0) {
      return res.status(400).json({
        resultado: false,
        message: "A loja tem de ter pelo menos 1 serviço."
      });
    }

    const loja = new Loja({
      id: Number(id),
      nome,
      morada,
      gerente_id: gerente_id ?? null
    });

    const bdo = new OperadorLojas();
    await bdo.updateLoja(loja, servicoIds.map(Number));

    return res.send({ resultado: true });
  } catch (err) {
    console.error("🔥 ERRO /actualizarLoja:", err?.stack || err);
    return res.status(500).json({ resultado: false, message: err.message });
  }
});


// apagar loja
APP.post("/apagarLoja", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ resultado: false, message: "id em falta" });

    const bdo = new OperadorLojas();
    await bdo.apagarLoja(Number(id));

    return res.send({ resultado: "ok" });
  } catch (err) {
    console.error("🔥 ERRO /apagarLoja:", err?.stack || err);
    return res.status(500).json({ resultado: false, message: err.message });
  }
});


export default APP;

