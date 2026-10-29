import { execFile } from "node:child_process";
import { promisify } from "node:util";

const executeFile = promisify(execFile);

export type LocalSupabaseCredentials = {
  apiUrl: string;
  publishableKey: string;
  secretKey: string;
};

type AuthUserResponse = { id: string };
type SessionResponse = { access_token: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasStringProperty(value: unknown, property: string): value is Record<string, string> {
  return isRecord(value) && typeof value[property] === "string";
}

function commandForPnpm(): string {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

export async function localSupabaseCredentials(): Promise<LocalSupabaseCredentials> {
  const { stdout } = await executeFile(commandForPnpm(), ["supabase", "status", "-o", "env"], {
    cwd: process.cwd(),
    shell: process.platform === "win32"
  });
  const variables = new Map<string, string>();

  for (const line of stdout.split(/\r?\n/)) {
    const match = line.match(/^(?:export )?([A-Z_]+)=(.*)$/);
    if (match?.[1] && match[2]) variables.set(match[1], match[2].replace(/^['"]|['"]$/g, ""));
  }

  const apiUrl = variables.get("API_URL");
  const publishableKey = variables.get("PUBLISHABLE_KEY") ?? variables.get("ANON_KEY");
  const secretKey = variables.get("SECRET_KEY") ?? variables.get("SERVICE_ROLE_KEY");

  if (!apiUrl || !publishableKey || !secretKey) {
    throw new Error("Supabase local no expuso las credenciales efímeras esperadas.");
  }

  return { apiUrl, publishableKey, secretKey };
}

async function readJson(response: Response): Promise<unknown> {
  if (!response.ok) throw new Error(`Supabase local respondió ${response.status}.`);
  return response.json();
}

export async function createLocalTestUser(
  credentials: LocalSupabaseCredentials,
  email: string
): Promise<AuthUserResponse> {
  const response = await fetch(`${credentials.apiUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: credentials.secretKey,
      Authorization: `Bearer ${credentials.secretKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password: "LocalOnly-Test-Password-123!", email_confirm: true })
  });
  const body = await readJson(response);
  if (!hasStringProperty(body, "id"))
    throw new Error("La API de administración no devolvió un usuario válido.");
  return { id: body.id };
}

export async function loginAs(
  credentials: LocalSupabaseCredentials,
  email: string
): Promise<SessionResponse> {
  const response = await fetch(`${credentials.apiUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: credentials.publishableKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "LocalOnly-Test-Password-123!" })
  });
  const body = await readJson(response);
  if (!hasStringProperty(body, "access_token"))
    throw new Error("Auth local no devolvió una sesión válida.");
  return { access_token: body.access_token };
}

export async function deleteLocalTestUser(
  credentials: LocalSupabaseCredentials,
  userId: string
): Promise<void> {
  const response = await fetch(`${credentials.apiUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { apikey: credentials.secretKey, Authorization: `Bearer ${credentials.secretKey}` }
  });
  await readJson(response);
}
