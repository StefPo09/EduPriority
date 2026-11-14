/* eslint-disable @typescript-eslint/no-require-imports -- This test harness is CommonJS. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function load(relativePath, mocks = {}) {
  const filename = path.join(__dirname, "..", relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText;
  // eslint-disable-next-line @next/next/no-assign-module-variable -- This is an isolated test module.
  const module = new Module(filename);
  module.filename = filename;
  module.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = module.require.bind(module);
  module.require = (name) => name in mocks ? mocks[name] : originalRequire(name);
  module._compile(compiled, filename);
  return module.exports;
}

const account = { id: "1", name: "Student", email: "student@example.com", role: "student" };
const request = (body) => new Request("http://localhost/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
const credentials = { email: " student@example.com ", password: "password", role: "student" };

test("login keeps both bearer token spellings out of JSON and sets a secure session cookie", async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    const { POST } = load("src/app/api/auth/login/route.ts", {
      "@/lib/server-auth": { authenticateAccount: async (...args) => {
        assert.deepEqual(args, ["student@example.com", "password", "student"]);
        return { ...account, access_token: "secret", accessToken: "secret" };
      } },
    });
    const response = await POST(request(credentials));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), account);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /edupriority_access_token=secret/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=lax/i);
    assert.match(cookie, /Path=\//i);
    assert.match(cookie, /Max-Age=28800/i);
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

test("login preserves tokenless accounts and rejects invalid credentials", async () => {
  let result = account;
  let calls = 0;
  const { POST } = load("src/app/api/auth/login/route.ts", {
    "@/lib/server-auth": { authenticateAccount: async () => { calls++; return result; } },
  });
  const success = await POST(request(credentials));
  assert.deepEqual(await success.json(), account);
  assert.equal(success.headers.get("set-cookie"), null);
  result = undefined;
  const rejected = await POST(request(credentials));
  assert.equal(rejected.status, 401);
  assert.equal(rejected.headers.get("set-cookie"), null);
  const invalid = await POST(request({ ...credentials, role: "other" }));
  assert.equal(invalid.status, 400);
  assert.equal(calls, 2);
});

test("logout expires the matching HttpOnly cookie", async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    const { POST } = load("src/app/api/auth/logout/route.ts");
    const response = await POST();
    assert.equal(response.status, 200);
    const cookie = response.headers.get("set-cookie");
    assert.match(cookie, /edupriority_access_token=/);
    assert.match(cookie, /Max-Age=0/i);
    assert.match(cookie, /Path=\//i);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.match(cookie, /SameSite=lax/i);
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

test("development cookies retain HttpOnly and SameSite without requiring HTTPS", async () => {
  const originalEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "development";
    const login = load("src/app/api/auth/login/route.ts", {
      "@/lib/server-auth": { authenticateAccount: async () => ({ ...account, accessToken: "secret" }) },
    });
    const logout = load("src/app/api/auth/logout/route.ts");
    for (const response of [await login.POST(request(credentials)), await logout.POST()]) {
      const cookie = response.headers.get("set-cookie");
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=lax/i);
      assert.doesNotMatch(cookie, /(?:^|;\s*)Secure(?:;|$)/i);
    }
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
});

function component(relativePath) {
  const states = [];
  let index = 0;
  const navigations = [];
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const mocks = {
    react: { useState: (initial) => {
      const current = index++;
      if (!(current in states)) states[current] = typeof initial === "function" ? initial() : initial;
      return [states[current], (value) => { states[current] = value; }];
    } },
    "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
    "react-router": { useNavigate: () => (...args) => navigations.push(args), Link: "link" },
    "@/components/shared/ThemeContext": { useTheme: () => ({ theme: "light", setTheme() {} }) },
    "../components/settings/PageHeader": { default: () => null },
  };
  const Component = load(relativePath, mocks).default;
  return {
    navigations,
    render: (props = {}) => { index = 0; return Component(props); },
  };
}

function find(node, predicate) {
  if (!node || typeof node !== "object") return undefined;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = find(child, predicate);
    if (result) return result;
  }
  return undefined;
}

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("signup goes to login without storing an authenticated account; login still stores one", async () => {
  const originalFetch = global.fetch;
  const originalStorage = global.localStorage;
  try {
    global.localStorage = storage();
    global.fetch = async () => Response.json(account);
    for (const mode of ["signup", "login"]) {
      const form = component("src/components/auth/AuthForm.tsx");
      await form.render({ mode }).props.onSubmit({ preventDefault() {} });
      assert.deepEqual(form.navigations[0], [mode === "signup" ? "/login" : "/home"]);
      assert.equal(global.localStorage.getItem("edupriority:account") !== null, mode === "login");
    }
  } finally {
    global.fetch = originalFetch;
    global.localStorage = originalStorage;
  }
});

test("rejected signup does not navigate or store an account", async () => {
  const originalFetch = global.fetch;
  const originalStorage = global.localStorage;
  try {
    global.localStorage = storage();
    global.fetch = async () => Response.json({ error: "Signup failed" }, { status: 409 });
    const form = component("src/components/auth/AuthForm.tsx");
    await form.render({ mode: "signup" }).props.onSubmit({ preventDefault() {} });
    assert.equal(form.navigations.length, 0);
    assert.equal(global.localStorage.getItem("edupriority:account"), null);
    assert.ok(find(form.render({ mode: "signup" }), (node) => node.props.children === "Signup failed"));
  } finally {
    global.fetch = originalFetch;
    global.localStorage = originalStorage;
  }
});

test("logout waits for success and retains the account on failure", async () => {
  const originalFetch = global.fetch;
  const originalStorage = global.localStorage;
  const originalWindow = global.window;
  try {
    global.window = {};
    global.localStorage = storage();
    global.localStorage.setItem("edupriority:account", JSON.stringify(account));
    let resolveFetch;
    const calls = [];
    global.fetch = (...args) => {
      calls.push(args);
      return new Promise((resolve) => { resolveFetch = resolve; });
    };
    const settings = component("src/app-pages/SettingsPage.tsx");
    find(settings.render(), (node) => node.type === "button" && node.props.children === "Deconectare").props.onClick();
    let tree = settings.render();
    const confirm = find(tree, (node) => node.type === "button" && node.props.children === "Da, deconectează-mă");
    const pending = confirm.props.onClick();
    assert.deepEqual(calls[0], ["/api/auth/logout", { method: "POST" }]);
    assert.ok(global.localStorage.getItem("edupriority:account"));
    assert.equal(settings.navigations.length, 0);
    tree = settings.render();
    assert.equal(find(tree, (node) => node.type === "button" && node.props.children === "Da, deconectează-mă").props.disabled, true);
    resolveFetch(new Response(null, { status: 500 }));
    await pending;
    assert.ok(global.localStorage.getItem("edupriority:account"));
    assert.equal(settings.navigations.length, 0);
    tree = settings.render();
    assert.ok(find(tree, (node) => node.props.role === "alert"));
    global.fetch = async () => { throw new Error("network failure"); };
    await find(tree, (node) => node.type === "button" && node.props.children === "Da, deconectează-mă").props.onClick();
    assert.ok(global.localStorage.getItem("edupriority:account"));
    assert.equal(settings.navigations.length, 0);
    tree = settings.render();
    assert.ok(find(tree, (node) => node.props.role === "alert"));
    global.fetch = (...args) => {
      calls.push(args);
      return new Promise((resolve) => { resolveFetch = resolve; });
    };
    const retry = find(tree, (node) => node.type === "button" && node.props.children === "Da, deconectează-mă").props.onClick();
    resolveFetch(new Response(null, { status: 200 }));
    await retry;
    assert.equal(global.localStorage.getItem("edupriority:account"), null);
    assert.deepEqual(settings.navigations, [["/login", { replace: true }]]);
  } finally {
    global.fetch = originalFetch;
    global.localStorage = originalStorage;
    global.window = originalWindow;
  }
});