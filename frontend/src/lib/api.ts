const BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:8080";

interface AuthResponse {
  token: string;
  username: string;
}

async function request<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as T & { error?: string };

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed.");
  }

  return data;
}

/** Create a new account — returns JWT and username */
export function signup(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/signup", { username, password });
}

/** Sign in to an existing account — returns JWT and username */
export function login(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/login", { username, password });
}
