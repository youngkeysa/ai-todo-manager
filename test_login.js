const { createClient } = require("@supabase/supabase-js");

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log("Attempting sign in...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: "cfoforu@gmail.com", // user's email from screenshot
    password: "password123!", // dummy
  });

  if (signInError) {
    console.error("\n❌ Sign In Error:");
    console.error(signInError);
  } else {
    console.log("\n✅ Sign In Success!");
  }
}

testAuth();
