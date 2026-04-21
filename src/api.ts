import func2url from "../backend/func2url.json";

const AUTH = func2url.auth;
const BALANCE = func2url.balance;
const CASES = func2url.cases;

function getSessionId(): string {
  return localStorage.getItem("pd_session") || "";
}
function setSessionId(id: string) {
  localStorage.setItem("pd_session", id);
}
function clearSession() {
  localStorage.removeItem("pd_session");
}

async function req(url: string, method = "GET", body?: unknown) {
  const sid = getSessionId();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(sid ? { "X-Session-Id": sid } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

/* Хелпер: достаём session из тела или заголовков ответа */
async function authRequest(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка");
  // session_id либо в теле, либо в заголовке x-set-cookie
  if (data.session_id) {
    setSessionId(data.session_id);
  } else {
    const setCookie = res.headers.get("x-set-cookie") || "";
    const match = setCookie.match(/pd_session=([^;]+)/);
    if (match) setSessionId(match[1]);
  }
  return data;
}

/* Auth */
export async function login(email: string, password: string) {
  return authRequest(`${AUTH}/login`, { email, password });
}

export async function registerUser(username: string, email: string, password: string) {
  return authRequest(`${AUTH}/register`, { username, email, password });
}

export async function getMe() {
  return req(`${AUTH}/me`);
}

export async function logout() {
  await req(`${AUTH}/logout`, "POST");
  clearSession();
}

/* Balance */
export async function getBalance() {
  return req(`${BALANCE}/balance`);
}

export async function createDeposit(amount: number) {
  return req(`${BALANCE}/deposit`, "POST", { amount });
}

export async function getDeposits() {
  return req(`${BALANCE}/deposits`);
}

/* Admin */
export async function adminGetDeposits() {
  return req(`${BALANCE}/admin/deposits`);
}

export async function adminConfirmDeposit(deposit_id: number, action: "confirm" | "reject", reason?: string) {
  return req(`${BALANCE}/admin/confirm`, "POST", { deposit_id, action, reason });
}

export async function adminGetUsers() {
  return req(`${BALANCE}/admin/users`);
}

export async function adminAdjustBalance(user_id: number, delta: number, reason: string) {
  return req(`${BALANCE}/admin/adjust`, "POST", { user_id, delta, reason });
}

export async function adminGetSpins() {
  return req(`${CASES}/admin/spins`);
}

export async function adminClaimSpin(spin_id: number) {
  return req(`${CASES}/admin/claim`, "POST", { spin_id });
}

/* Cases */
export async function getCases() {
  return req(`${CASES}/cases`);
}

export async function spin(case_id: number, spin_count: number, client_seed?: string) {
  return req(`${CASES}/spin`, "POST", { case_id, spin_count, client_seed });
}

export async function getSpins() {
  return req(`${CASES}/spins`);
}

export async function verifyFairness(server_seed: string, client_seed: string, nonce: number, total_weight: number) {
  return req(`${CASES}/verify`, "POST", { server_seed, client_seed, nonce, total_weight });
}