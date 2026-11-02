import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

type Account = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AccountRole;
  school?: string;
  className?: string;
  subjects?: string[];
  accessToken?: string;
};

export type AccountRole = "teacher" | "student";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const accounts: Account[] = [];

async function authHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get("edupriority_access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function rejectBackendFailure(response: Response) {
  if (process.env.NODE_ENV === "production") {
    throw Object.assign(new Error(`Backend request failed with status ${response.status}`), { status: response.status });
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export async function createAccount(
  name: string,
  email: string,
  password: string,
  role: AccountRole,
  school?: string,
  subjects: string[] = [],
  className?: string,
) {
  // First attempt to create account in the Python backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ name, email, password, role, school, subjects, class_name: className }),
    });
    if (response.status === 201) {
      const account = (await response.json()) as {
        id: string;
        name: string;
        email: string;
        role: AccountRole;
        school?: string;
        className?: string;
        subjects?: string[];
        access_token?: string;
      };
      return { ...account, accessToken: account.access_token };
    }
    if (response.status === 409) {
      return undefined;
    }
    rejectBackendFailure(response);
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
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
    school,
    className,
    subjects,
  };

  accounts.push(account);
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    school: account.school,
    className: account.className,
    subjects: account.subjects,
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
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ email, password, role }),
    });
    if (response.ok) {
      const account = (await response.json()) as {
        id: string;
        name: string;
        email: string;
        role: AccountRole;
        school?: string;
        className?: string;
        subjects?: string[];
        access_token?: string;
      };
      return { ...account, accessToken: account.access_token };
    }
    if (process.env.NODE_ENV === "production" && response.status === 401) return undefined;
    rejectBackendFailure(response);
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
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
    school: account.school,
    className: account.className,
    subjects: account.subjects,
  };
}

export async function updateAccount(
  id: string,
  school: string | undefined,
  subjects: string[],
  className?: string,
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ id, school, subjects, class_name: className }),
    });
    if (response.ok) return await response.json();
    if (process.env.NODE_ENV === "production" && response.status === 404) return undefined;
    rejectBackendFailure(response);
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    // Backend offline, fallback to in-memory store
  }
  const account = accounts.find((item) => item.id === id);
  if (!account) return undefined;
  account.school = school;
  account.className = className ?? account.className;
  account.subjects = subjects;
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    school: account.school,
    subjects: account.subjects,
  };
}

export async function listTeachers() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/teachers`, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    if (response.ok) {
      return (await response.json()) as Array<{ id: string; name: string }>;
    }
    rejectBackendFailure(response);
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    // Backend offline, fallback to in-memory store
  }

  return accounts
    .filter((account) => account.role === "teacher")
    .map(({ id, name }) => ({ id, name }));
}
