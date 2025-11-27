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

// criar loja
APP.post("/novaLoja", async (req, res) => {
  const { nome, morada, gerente_id } = req.body;

  if (!nome || nome.trim() === "" || !morada || morada.trim() === "") {
    res.send({ response: "Campos vazios." });
    return;
  }

  const loja = new Loja(nome, morada, gerente_id ?? null);
  const bdo = new OperadorLojas();
  await bdo.inserirLoja(loja);

  res.send({ response: "ok" });
});

// listar lojas
APP.get("/lojas", async (req, res) => {
  const bdo = new OperadorLojas();
  const coleccao = await bdo.obterLojas();
  res.send(coleccao);
});

// obter 1 loja (detalhes/update)
APP.get("/lojas/:id", async (req, res) => {
  const bdo = new OperadorLojas();
  const loja = await bdo.obterLojaPorId(req.params.id);
  res.send(loja);
});

// atualizar loja
APP.post("/actualizarLoja", async (req, res) => {
  const { id, nome, morada, gerente_id } = req.body;

  const loja = new Loja(nome, morada, gerente_id ?? null, id);
  const bdo = new OperadorLojas();
  await bdo.updateLoja(loja);

  res.send({ resultado: "Loja actualizada" });
});

// apagar loja
APP.post("/apagarLoja", async (req, res) => {
  const { id } = req.body;

  const bdo = new OperadorLojas();
  await bdo.apagarLoja(id);

  res.send({ resultado: "ok" });
});


export default APP;

