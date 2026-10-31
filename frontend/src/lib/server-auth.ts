import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type Account = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AccountRole;
};

export type AccountRole = "teacher" | "student";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const accounts: Account[] = [];

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export async function createAccount(
  name: string,
  email: string,
  password: string,
  role: AccountRole,
) {
  // First attempt to create account in the Python backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (response.status === 201) {
      return (await response.json()) as {
        id: string;
        name: string;
        email: string;
        role: AccountRole;
      };
    }
    if (response.status === 409) {
      return undefined;
    }
  } catch {
    // Backend offline, fallback to in-memory store
  }

  const normalizedEmail = email.toLowerCase();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    return undefined;
  }

  const account = {
    id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role,
  };

  accounts.push(account);
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

export async function authenticateAccount(
  email: string,
  password: string,
  role: AccountRole,
) {
  // First attempt to authenticate against Python backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    if (response.ok) {
      return (await response.json()) as {
        id: string;
        name: string;
        email: string;
        role: AccountRole;
      };
    }
  } catch {
    // Backend offline, fallback to in-memory store
  }

  const account = accounts.find(
    (item) => item.email === email.toLowerCase(),
  );
  if (!account) return undefined;

  const [salt, storedHash] = account.passwordHash.split(":");
  const hash = scryptSync(password, salt, 64);
  if (!timingSafeEqual(hash, Buffer.from(storedHash, "hex"))) {
    return undefined;
  }

  if (account.role !== role) return undefined;

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };
}

export async function listTeachers() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/teachers`, {
      cache: "no-store",
    });
    if (response.ok) {
      return (await response.json()) as Array<{ id: string; name: string }>;
    }
  } catch {
    // Backend offline, fallback to in-memory store
  }

  return accounts
    .filter((account) => account.role === "teacher")
    .map(({ id, name }) => ({ id, name }));
}
