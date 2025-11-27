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
// LISTAR
APP.get("/lojas", async (req, res) => {
  try {
    const bdo = new OperadorLojas();
    const lojas = await bdo.obterLojas();
    res.json(lojas);
  } catch (err) {
    console.error("ERRO GET /lojas:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// OBTER 1
APP.get("/lojas/:id", async (req, res) => {
  try {
    const bdo = new OperadorLojas();
    const loja = await bdo.obterLoja(req.params.id);
    res.json(loja);
  } catch (err) {
    console.error("ERRO GET /lojas/:id:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// INSERIR
APP.post("/lojas", async (req, res) => {
  try {
    const { nome, morada, gerente_id } = req.body;
    const nova = new Loja(null, nome, morada, gerente_id ?? null);
    const bdo = new OperadorLojas();
    const criada = await bdo.inserirLoja(nova);
    res.status(201).json(criada);
  } catch (err) {
    console.error("ERRO POST /lojas:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// ATUALIZAR
APP.put("/lojas/:id", async (req, res) => {
  try {
    const { nome, morada, gerente_id } = req.body;
    const loja = new Loja(req.params.id, nome, morada, gerente_id ?? null);
    const bdo = new OperadorLojas();
    const atualizada = await bdo.atualizarLoja(req.params.id, loja);
    res.json(atualizada);
  } catch (err) {
    console.error("ERRO PUT /lojas/:id:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// APAGAR
APP.post("/apagarServico", async (req, res) => {
  try {
    const { id } = req.body;

    const bdo = new OperadorServicos();
    await bdo.apagarServico(Number(id));

    return res.json({ ok: true });
  } catch (err) {
    console.error("ERRO /apagarServico:", err?.stack || err);
    return res.status(500).json({ message: err.message });
  }
});



//COLABORADORES

// LISTAR colaboradores
APP.get("/colaboradores", async (req, res) => {
  try {
    const bdo = new OperadorColaboradores();
    const lista = await bdo.obterColaboradores();
    res.json(lista);
  } catch (err) {
    console.error("ERRO GET /colaboradores:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// OBTER 1
APP.get("/colaboradores/:id", async (req, res) => {
  try {
    const bdo = new OperadorColaboradores();
    const colab = await bdo.obterColaborador(req.params.id);
    res.json(colab);
  } catch (err) {
    console.error("ERRO GET /colaboradores/:id:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// INSERIR
APP.post("/colaboradores", async (req, res) => {
  try {
    const { nome, email, password, loja_id } = req.body;
    const novo = new Colaborador(null, nome, email, password, "Colaborador", loja_id, true);
    const bdo = new OperadorColaboradores();
    const criado = await bdo.inserirColaborador(novo);
    res.status(201).json(criado);
  } catch (err) {
    console.error("ERRO POST /colaboradores:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// ATUALIZAR
APP.put("/colaboradores/:id", async (req, res) => {
  try {
    const { nome, email, password, loja_id, ativo } = req.body;
    const colab = new Colaborador(req.params.id, nome, email, password ?? null, "Colaborador", loja_id, ativo);
    const bdo = new OperadorColaboradores();
    const atualizado = await bdo.atualizarColaborador(req.params.id, colab);
    res.json(atualizado);
  } catch (err) {
    console.error("ERRO PUT /colaboradores/:id:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});

// APAGAR
APP.delete("/colaboradores/:id", async (req, res) => {
  try {
    const bdo = new OperadorColaboradores();
    await bdo.apagarColaborador(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("ERRO DELETE /colaboradores/:id:", err?.stack || err);
    res.status(500).json({ message: err.message });
  }
});



// 404 
APP.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

export default APP;

