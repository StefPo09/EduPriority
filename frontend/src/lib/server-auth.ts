import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type Account = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

const accounts: Account[] = [];

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function createAccount(name: string, email: string, password: string) {
  const normalizedEmail = email.toLowerCase();
  if (accounts.some((account) => account.email === normalizedEmail)) {
    return undefined;
  }

  const account = {
    id: crypto.randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
  };

  accounts.push(account);
  return { id: account.id, name: account.name, email: account.email };
}

export function authenticateAccount(email: string, password: string) {
  const account = accounts.find(
    (item) => item.email === email.toLowerCase(),
  );
  if (!account) return undefined;

  const [salt, storedHash] = account.passwordHash.split(":");
  const hash = scryptSync(password, salt, 64);
  if (!timingSafeEqual(hash, Buffer.from(storedHash, "hex"))) {
    return undefined;
  }

  return { id: account.id, name: account.name, email: account.email };
}

/*
 * Database boundary: replace account lookup and creation with database queries.
 * Passwords should remain hashed by the database/authentication service.
 */
