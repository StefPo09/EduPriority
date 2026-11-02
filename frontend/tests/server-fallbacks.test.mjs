import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import ts from "typescript";

function load(relativePath, mocks = {}) {
  const filename = path.join(fileURLToPath(new URL("..", import.meta.url)), relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  const originalRequire = createRequire(filename);
  const loadDependency = (name) => name in mocks ? mocks[name] : originalRequire(name);
  const execute = runInThisContext(`(function (exports, require) {\n${compiled}\n})`, { filename });
  execute(exports, loadDependency);
  return exports;
}

const headers = { cookies: async () => ({ get: () => ({ value: "token" }) }) };
const response = (status, body = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" },
});
const unavailable = () => { throw new Error("backend unavailable"); };
const account = ["Teacher", "teacher@example.com", "password", "teacher"];
const request = { student: "Student", priority: 3 };

function loadAuth() {
  return load("src/lib/server-auth.ts", { "next/headers": headers });
}

function loadRequests() {
  return load("src/lib/server-requests.ts", { "next/headers": headers });
}

function loadMaterials(requests) {
  return load("src/app/api/materials/route.ts", {
    "next/headers": headers,
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/server-requests": requests,
  });
}

function upload() {
  const data = new FormData();
  data.append("file", new File(["content"], "lesson.txt", { type: "text/plain" }));
  data.append("teacherId", "teacher-1");
  return new Request("http://localhost/api/materials", { method: "POST", body: data });
}

test("production auth never falls back after rejection or backend failure", async () => {
  process.env.NODE_ENV = "development";
  global.fetch = unavailable;
  const auth = loadAuth();
  const local = await auth.createAccount(...account);
  process.env.NODE_ENV = "production";

  for (const status of [400, 403, 422, 500]) {
    global.fetch = async () => response(status);
    for (const action of [
      () => auth.createAccount("Other", "other@example.com", "password", "student"),
      () => auth.authenticateAccount(account[1], account[2], account[3]),
      () => auth.updateAccount(local.id, "School", []),
      () => auth.listTeachers(),
    ]) {
      await assert.rejects(action, (error) => error.status === status);
    }
  }

  global.fetch = async () => response(401);
  assert.equal(await auth.authenticateAccount(account[1], account[2], account[3]), undefined);
  for (const action of [
    () => auth.createAccount(...account),
    () => auth.updateAccount(local.id, "School", []),
    () => auth.listTeachers(),
  ]) await assert.rejects(action, (error) => error.status === 401);
  global.fetch = async () => response(409);
  assert.equal(await auth.createAccount(...account), undefined);
  global.fetch = async () => response(404);
  assert.equal(await auth.updateAccount(local.id, "School", []), undefined);

  global.fetch = unavailable;
  for (const action of [
    () => auth.createAccount(...account),
    () => auth.authenticateAccount(account[1], account[2], account[3]),
    () => auth.updateAccount(local.id, "School", []),
    () => auth.listTeachers(),
  ]) await assert.rejects(action, /backend unavailable/);

  global.fetch = async () => new Response("not json", { status: 200 });
  await assert.rejects(() => auth.authenticateAccount(account[1], account[2], account[3]));
  global.fetch = async () => new Response("not json", { status: 201 });
  await assert.rejects(() => auth.createAccount(...account));
});

test("production requests never fall back on rejection or backend failure", async () => {
  process.env.NODE_ENV = "development";
  global.fetch = unavailable;
  const requests = loadRequests();
  const local = await requests.insertRequest(request);
  await requests.insertMaterial({ name: "lesson.txt", size: 12, type: "text/plain" });
  process.env.NODE_ENV = "production";

  const actions = [
    () => requests.listRequests(),
    () => requests.findRequest(local.id),
    () => requests.insertRequest(request),
    () => requests.updateRequest(local.id, { status: "resolved" }),
    () => requests.listMaterials(),
    () => requests.findClassSummary("A"),
    () => requests.listClasses(),
    () => requests.findSchedule("A"),
    () => requests.getOverview(),
  ];
  for (const status of [401, 403, 422, 500]) {
    global.fetch = async () => response(status);
    for (const action of actions) {
      await assert.rejects(action, (error) => error.status === status);
    }
  }
  global.fetch = async () => response(404);
  assert.equal(await requests.findRequest(local.id), undefined);
  assert.equal(await requests.updateRequest(local.id, {}), undefined);

  global.fetch = unavailable;
  for (const action of actions) await assert.rejects(action, /backend unavailable/);
  await assert.rejects(() => requests.insertMaterial({ name: "x", size: 1, type: "" }));

  global.fetch = async () => new Response("not json", { status: 200 });
  await assert.rejects(() => requests.listRequests());
});

test("successful backend results are used in production", async () => {
  process.env.NODE_ENV = "production";
  const auth = loadAuth();
  const requests = loadRequests();
  global.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer token");
    return response(url.endsWith("signup") ? 201 : 200, { id: "backend", access_token: "backend-token" });
  };
  assert.equal((await auth.createAccount(...account)).accessToken, "backend-token");
  assert.equal((await auth.authenticateAccount(account[1], account[2], account[3])).id, "backend");
  assert.equal((await requests.insertRequest(request)).id, "backend");
});

test("production uploads return backend failures and never insert locally", async () => {
  process.env.NODE_ENV = "production";
  let inserts = 0;
  const route = loadMaterials({ insertMaterial: async () => { inserts++; }, listMaterials: async () => [] });
  global.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, "Bearer token");
    assert.equal(options.body.get("teacher_id"), "teacher-1");
    return response(413, { detail: "too large" });
  };
  const rejected = await route.POST(upload());
  assert.equal(rejected.status, 413);
  assert.deepEqual(await rejected.json(), { detail: "too large" });
  global.fetch = unavailable;
  assert.equal((await route.POST(upload())).status, 502);
  global.fetch = async () => new Response("not json", { status: 201 });
  assert.equal((await route.POST(upload())).status, 502);
  global.fetch = async () => response(201, { id: "backend-material" });
  const created = await route.POST(upload());
  assert.equal(created.status, 201);
  assert.equal((await created.json()).id, "backend-material");
  const empty = new FormData();
  assert.equal((await route.POST(new Request("http://localhost/api/materials", { method: "POST", body: empty }))).status, 400);
  assert.equal(inserts, 0);
});

test("production material reads propagate backend failures", async () => {
  process.env.NODE_ENV = "production";
  const route = loadMaterials(loadRequests());
  global.fetch = async () => response(403);
  await assert.rejects(() => route.GET(new Request("http://localhost/api/materials?teacherId=teacher-1")),
    (error) => error.status === 403);
});

test("development preserves local fallbacks on rejection and network errors", async () => {
  process.env.NODE_ENV = "development";
  const auth = loadAuth();
  const requests = loadRequests();
  global.fetch = async () => response(500);
  const local = await auth.createAccount(...account);
  assert.equal((await auth.authenticateAccount(account[1], account[2], account[3])).id, local.id);
  assert.equal((await auth.updateAccount(local.id, "School", [])).school, "School");
  assert.equal((await auth.listTeachers()).length, 1);
  const inserted = await requests.insertRequest(request);
  assert.equal((await requests.findRequest(inserted.id)).id, inserted.id);
  assert.equal((await requests.updateRequest(inserted.id, { status: "resolved" })).status, "resolved");
  assert.equal((await requests.listRequests()).length, 1);
  assert.equal((await requests.findClassSummary("A")).totalRequests, 0);
  assert.deepEqual(await requests.listClasses(), []);
  assert.deepEqual((await requests.findSchedule("A")).slots, []);
  assert.equal((await requests.getOverview()).week.received, 1);
  const route = loadMaterials(requests);
  assert.equal((await route.POST(upload())).status, 201);
  global.fetch = unavailable;
  assert.equal((await route.POST(upload())).status, 201);
  assert.equal((await requests.listMaterials()).length, 2);
});