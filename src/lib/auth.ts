import { cookies } from "next/headers";

export async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function isAuthenticated() {
  const token = await getToken();
  return !!token;
}
