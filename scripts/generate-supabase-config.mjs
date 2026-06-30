import { writeFileSync, existsSync } from "node:fs";

const url = process.env.SUPABASE_URL?.trim() || "";
const anonKey = process.env.SUPABASE_ANON_KEY?.trim() || "";
const isVercel = Boolean(process.env.VERCEL);

if (!url || !anonKey) {
  if (!isVercel && existsSync("supabase-config.js")) {
    console.log("SUPABASE env not set — keeping existing supabase-config.js.");
    process.exit(0);
  }
  console.warn(
    "SUPABASE_URL / SUPABASE_ANON_KEY not set — writing placeholder supabase-config.js."
  );
}

const contents = `window.SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
};
`;

writeFileSync("supabase-config.js", contents, "utf8");

if (url && anonKey) {
  console.log("Generated supabase-config.js for deployment.");
}
