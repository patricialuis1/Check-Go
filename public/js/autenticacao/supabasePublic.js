import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://zzftdgnxiwqteyqfglzi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6ZnRkZ254aXdxdGV5cWZnbHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NDQ5NDIsImV4cCI6MjA3NzIyMDk0Mn0.cnSoyHeuk884w_RofQZaeynxQVoJ4s-k0ryt_B4oodw";

const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabasePublic;
