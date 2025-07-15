import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tijpxhgdqcwofkaaxqri.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpanB4aGdkcWN3b2ZrYWF4cXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjU3MTcsImV4cCI6MjA2NjY0MTcxN30.POhN6xC7ydQB51NR-hf_6eHErM0lxpMisOVCJt8pMqk";

export const supabase = createClient(supabaseUrl, supabaseKey);