import { authClient } from "../lib/auth-client.ts";

export default async function checkAuth(): Promise<boolean> {
  const { data: session, error } = await authClient.getSession();

  if (error) {
    throw new Error(error.message || "Unable to check authentication.");
  }

  return session !== null;
}
