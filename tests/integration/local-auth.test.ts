import { afterEach, expect, test } from "vitest";

import {
  createLocalTestUser,
  deleteLocalTestUser,
  localSupabaseCredentials,
  loginAs,
  type LocalSupabaseCredentials
} from "../helpers/supabase-local";

let credentials: LocalSupabaseCredentials | undefined;
let createdUserId: string | undefined;

afterEach(async () => {
  if (credentials && createdUserId) await deleteLocalTestUser(credentials, createdUserId);
  createdUserId = undefined;
});

test("[SEG-AUT-02][RNF-019] loginAs crea una sesión local válida y consulta como su propio usuario", async () => {
  credentials = await localSupabaseCredentials();
  const email = `vitest-${crypto.randomUUID()}@local.zavia.test`;
  const user = await createLocalTestUser(credentials, email);
  createdUserId = user.id;
  const session = await loginAs(credentials, email);

  const authenticated = await fetch(`${credentials.apiUrl}/auth/v1/user`, {
    headers: { apikey: credentials.publishableKey, Authorization: `Bearer ${session.access_token}` }
  });
  expect(authenticated.ok).toBe(true);
  await expect(authenticated.json()).resolves.toMatchObject({ id: user.id });

  const rest = await fetch(`${credentials.apiUrl}/rest/v1/`, {
    headers: { apikey: credentials.publishableKey, Authorization: `Bearer ${session.access_token}` }
  });
  expect(rest.ok).toBe(true);
}, 15_000);
