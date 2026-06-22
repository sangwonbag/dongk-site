const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ymoshkaiwvnmhhcglpjj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bvEH85EF1ihAExThm4kIeA_lDvrPrlK";

async function test() {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log("Checking estimate_inquiries table...");
  const { data, error } = await client.from("estimate_inquiries").select("*").limit(1);
  if (error) {
    console.error("Error fetching estimate_inquiries:", error.message);
  } else {
    console.log("Successfully fetched from estimate_inquiries table:", data);
  }
}

test().catch(console.error);
