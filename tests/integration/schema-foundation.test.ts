import { expect, test } from "vitest";

import { localSupabaseCredentials } from "../helpers/supabase-local";

const publicTables = [
  "profiles",
  "accounts",
  "categories",
  "transactions",
  "transfers",
  "budgets",
  "goals",
  "goal_entries",
  "recurring_rules",
  "import_batches",
  "activity_days",
  "achievements",
  "insight_dismissals",
  "user_stats",
  "demo_signups"
] as const;

test("[RNF-017][SEG-INF-01] la migración inicial expone las 15 tablas públicas del modelo", async () => {
  const credentials = await localSupabaseCredentials();

  for (const table of publicTables) {
    const response = await fetch(`${credentials.apiUrl}/rest/v1/${table}?select=*&limit=1`, {
      headers: { apikey: credentials.publishableKey }
    });
    expect(response.status, table).toBe(200);
  }
}, 30_000);
