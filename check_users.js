const { createClient } = require("@supabase/supabase-js");

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUsers() {
  console.log("Checking public.users table...");
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Failed to query public.users:", error);
  } else {
    console.log("public.users rows:", data);
  }
}

checkUsers();
