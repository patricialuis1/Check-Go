// app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import OperadorServicos from "./operadorBD/operadorServicos.js";
import Servico from "./modelos/servico.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const APP = express();

APP.use(express.json());

APP.use("/", express.static("public"));


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
  const bdo = new OperadorServicos();
  const coleccao = await bdo.obterServicos();
  res.send(coleccao);
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
  const { id } = req.body;

  const bdo = new OperadorServicos();
  await bdo.apagarServico(id);

  res.send({ resultado: "ok" });
});

// 404 
APP.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "404.html"));
});

APP.listen(PORT, () => {
  console.log("A correr na porta: " + PORT);
});
