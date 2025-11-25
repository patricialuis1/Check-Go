import express from "express"
import cors from "cors"
import { supabase } from "./supabaseClient.js"

const app = express()
app.use(cors())
app.use(express.json())

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/views", (req,res,next)=>{
  console.log("ENTROU NO PREFIXO /views:", req.path);
  next();
});


// Serve a pasta public
app.use(express.static(path.join(__dirname, "public")));



// LISTAR
app.get("/servicos", async (req, res) => {
  const { data, error } = await supabase
    .from("servicos")
    .select("id, nome, descricao")
    .order("id", { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// CRIAR
app.post("/servicos", async (req, res) => {
  const { nome, descricao } = req.body

  const { data, error } = await supabase
    .from("servicos")
    .insert([{ nome, descricao }])
    .select("id")
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true, id: data.id })
})

// EDITAR
app.put("/servicos/:id", async (req, res) => {
  const { id } = req.params
  const { nome, descricao } = req.body

  const { error } = await supabase
    .from("servicos")
    .update({ nome, descricao })
    .eq("id", id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

// APAGAR
app.delete("/servicos/:id", async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from("servicos")
    .delete()
    .eq("id", id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

app.listen(3000, () => console.log("API ON http://localhost:3000"))
