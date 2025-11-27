import dotenv from "dotenv";


import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

console.log("SUPABASE_URL existe?", !!process.env.SUPABASE_URL);
console.log("SUPABASE_KEY existe?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!url || !key) {
  throw new Error("Supabase env vars em falta!");
}


export default supabase;
