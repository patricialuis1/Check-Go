import dotenv from "dotenv"
dotenv.config()

import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.log("DEBUG ENV =>", { url, key })
  throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não carregaram.")
}

export const supabase = createClient(url, key)
