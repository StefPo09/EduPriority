# EduPriority deployment

## Stop: public-production readiness

The build and deployment examples do **not** make this application safe for real student data. Public signup currently lets anyone claim a teacher role; teachers are automatically assigned to matching classes, and students can select/change to existing classes. Class summaries also aggregate requests across classes, uploads lack size/type controls, and login lacks rate limiting. Have these authorization, privacy, upload and abuse risks reviewed and fixed before public exposure. A private, access-controlled evaluation using synthetic data is safer. Existing demo accounts have published passwords; production startup no longer creates them, but does not remove them from an existing database. Review and remove or secure demo accounts deliberately after backup. Logout clears the browser cookie but cannot revoke an already copied bearer token before its eight-hour expiry.

The actual server OS, process manager, repository URL, existing EduPriority data, proxy/network topology, available ports and public IP are **unknown**. No ParkShare configuration has been modified. The commands below are an **example for a Linux systemd host**, not a claim about your server; adapt only after confirming its OS and deployment method. Never use them to replace or modify ParkShare services or proxy hosts. `192.168.111.140` is only an unverified ParkShare reference, not a known upstream address.

## Architecture and configuration

- Next.js 16/React serves pages and its own `/api/*` route handlers on port `3001`. These handlers call FastAPI using server-side `BACKEND_URL`; a blanket `/api/*` rewrite would shadow them and is intentionally not configured. The FastAPI-only `/api/health` is not a public Next.js route.
- FastAPI/SQLAlchemy uses SQLite and a local classifier. The example backend listens only on `127.0.0.1:8101`; check that `8101` is unused first. If not, change both the API unit's `--port` and `BACKEND_URL` consistently. Never use ParkShare's backend port. The backend is not publicly exposed.
- Next.js development uses `0.0.0.0:3001`; production `npm start` defaults to `127.0.0.1:3001`. The example web unit uses `FRONTEND_HOST`. Loopback works only when proxy and app share a network namespace. Otherwise bind to the application's actual private interface IP and firewall `3001` so only the proxy can connect; do not expose it to the Internet. Docker/VM/NPM isolation may require an appropriate reachable private interface and network route. Keep the backend on loopback.
- `allowedDevOrigins` includes local IPv4 addresses and `edupriority.adv.ro` for development only; it does not configure production routing. There are no OAuth or webhook callbacks. Production login uses an HttpOnly, Secure, SameSite=Lax cookie; HTTPS is required in browsers. The public origin is configured in DNS, the proxy and `CORS_ORIGINS`, not a `NEXT_PUBLIC_*` variable.
- The frontend passes its cookie as a bearer token to the backend; no forwarded client IP is needed. The API unit disables Uvicorn proxy-header trust. Restrict direct frontend access to the trusted proxy and configure that proxy to overwrite, not append untrusted incoming, forwarded headers. Do not globally trust arbitrary `X-Forwarded-*` headers. If client-IP-dependent behavior is added later, configure an explicit trusted-proxy list for the verified topology.

### Environment variables

Examples: `frontend/.env.production.example` and `backend/.env.production.example`. No production values are required at build time. These files are examples, not automatically loaded by the systemd units; the units read the separate runtime files below. Keep secrets outside Git, owned by root and mode `600`.

| Variable | Runtime consumer | Meaning |
| --- | --- | --- |
| `APP_ENV` | API | Set `production`; other values are rejected except `development`. |
| `SECRET_KEY` | API | Required in production, at least 32 characters, stable and randomly generated. Rotating it invalidates active tokens. |
| `DATABASE_URL` | API | SQLAlchemy URL; example `sqlite:////srv/edupriority/app/backend/edupriority.db`. The four slashes mean an absolute Unix path. |
| `CORS_ORIGINS` | API | Required in production: comma-separated explicit origins, e.g. `https://edupriority.adv.ro`, no paths or wildcard. Production disables the development LAN-origin regex. |
| `SEED_DEMO_DATA` | API | Development only: defaults to true, can be set to false. Production never seeds, regardless of this setting. |
| `GEMINI_API_KEY` | API | Optional and currently unused; the classifier is local. No external AI key is needed. |
| `BACKEND_URL` | web | Internal FastAPI origin, e.g. `http://127.0.0.1:8101`; no trailing `/api`. Never point it at port `3001` or ParkShare. |
| `FRONTEND_HOST` | example web unit | `127.0.0.1` for a shared network namespace, otherwise the verified private application IP. This is read by systemd, not Next.js configuration. |
| `NODE_ENV` | web | The production unit sets `production`; `next start` is the production server. |

SQLite defaults to `backend/edupriority.db`; uploads are stored in `backend/uploads`, and absolute upload paths are saved in the database. Keep their paths stable when moving or restoring existing data, or migrate paths deliberately after a backup. No production database or upload contents belong in Git. An empty production database starts without demo data or initial users/classes; decide how to provision them securely. The application performs `create_all` and several ad-hoc `ALTER TABLE` checks automatically on API startup; there is no separate versioned migration or down-migration command. Back up first, run only one API instance during startup, and test migrations on a copy.

## Linux systemd example: first deployment

Prerequisites: Linux/systemd, Git, `sudo`, OpenSSL, Node.js >= 20.9 (system-wide and available to systemd), npm, Python 3.10+ with `venv` and pip. The frontend lockfile is used by `npm ci`; Python requirements are lower bounds rather than a complete lockfile. A local clean install reported 16 moderate development-dependency advisories; `npm audit --omit=dev` reported zero. Review dependency advisories before deployment. Confirm network access to package registries and verify this code revision is available from your own repository: local uncommitted changes must first be reviewed, committed and pushed by you. Check out the intended branch/revision after cloning. Do not run these examples if the actual server uses a different process manager without adapting them.

1. On the application host, check `node --version`, `npm --version`, `python3 --version`, `systemctl --version` and `sudo ss -ltnp`. Confirm ports `3001` and `8101` are free in the application's network namespace. Identify the existing EduPriority DB/uploads, if any, and preserve their paths. Confirm the proxy-to-application route and intended private bind address.
2. Create a dedicated service account and clone into a separate path. Substitute your actual Git URL; do not run `useradd` if that account already exists without checking its ownership and use:

```sh
sudo useradd --system --user-group --home-dir /srv/edupriority --shell /usr/sbin/nologin edupriority
sudo install -d -o edupriority -g edupriority -m 750 /srv/edupriority
REPO_URL='REPLACE_WITH_EDUPRIORITY_GIT_URL'
sudo -u edupriority git clone "$REPO_URL" /srv/edupriority/app
cd /srv/edupriority/app
sudo -u edupriority git rev-parse HEAD
```

3. If migrating existing data, stop the old EduPriority process first and make a consistent backup of its SQLite database **and** uploads. Restore them at the paths expected above only after checking for collisions and absolute upload paths. Do not copy or overwrite ParkShare's data. For an existing EduPriority installation, take the backup described below before the new API ever starts.
4. Install dependencies and build as the service user:

```sh
sudo -u edupriority python3 -m venv /srv/edupriority/app/backend/.venv
sudo -u edupriority /srv/edupriority/app/backend/.venv/bin/python -m pip install -r /srv/edupriority/app/backend/requirements.txt
cd /srv/edupriority/app/frontend
sudo -u edupriority npm ci
sudo -u edupriority npm run build
```

5. Create runtime files **only on first installation**. Do not overwrite existing files or regenerate a working secret during updates. If either target exists, inspect it instead of running these commands:

```sh
sudo install -d -o root -g root -m 700 /etc/edupriority
if sudo test -e /etc/edupriority/api.env; then
  printf 'api.env already exists; leaving it unchanged\n'
else
  sudo install -o root -g root -m 600 /srv/edupriority/app/backend/.env.production.example /etc/edupriority/api.env &&
    printf 'SECRET_KEY=%s\n' "$(openssl rand -hex 32)" | sudo tee -a /etc/edupriority/api.env >/dev/null
fi
if sudo test -e /etc/edupriority/web.env; then
  printf 'web.env already exists; leaving it unchanged\n'
else
  sudo install -o root -g root -m 600 /srv/edupriority/app/frontend/.env.production.example /etc/edupriority/web.env
fi
```

The key is generated only when creating a new `api.env`. Edit the files securely with a root editor: set the correct `DATABASE_URL`, `CORS_ORIGINS`, `BACKEND_URL` and `FRONTEND_HOST` for the confirmed topology. Both files use systemd `EnvironmentFile` syntax; do not put secrets in shell history, repository files, logs, or support messages. Retain a secure backup of the key separately.

6. The provided unit files assume exactly `/srv/edupriority/app`, the `edupriority` account and backend port `8101`. Review and adjust copies if your verified paths or port differ. Install only these named units, not ParkShare's:

```sh
sudo install -m 644 /srv/edupriority/app/deploy/systemd/edupriority-api.service /etc/systemd/system/edupriority-api.service
sudo install -m 644 /srv/edupriority/app/deploy/systemd/edupriority-web.service /etc/systemd/system/edupriority-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now edupriority-api.service
sudo systemctl enable --now edupriority-web.service
sudo systemctl status edupriority-api.service edupriority-web.service --no-pager
sudo journalctl -u edupriority-api.service -u edupriority-web.service -n 100 --no-pager
```

Both units restart on failure and start at reboot. First API startup can create/migrate tables. If it fails, inspect logs; do not reset the DB. Check locally:

```sh
sudo ss -ltnp | grep -E ':(3001|8101)\b'
curl -fsS http://127.0.0.1:8101/api/health
curl -fsSI http://127.0.0.1:3001/
```

If the web unit binds a private IP rather than loopback, use that IP in the last URL. The health endpoint checks that the API process responds; it does not prove database readiness. Test login and an authenticated operation using authorized synthetic accounts after HTTPS is configured.

## Updates, backups, logs and rollback

Plan a maintenance window: the following stops only EduPriority. Record the current commit and chosen deployment branch. Ensure `git status --short` is clean for tracked files, and check out the intended branch before updating. Keep the old commit ID, the exact prior Python environment or dependency versions, and the matching backup. The unpinned Python requirements can otherwise resolve differently on rollback.

```sh
cd /srv/edupriority/app
sudo -u edupriority git rev-parse HEAD
sudo -u edupriority git status --short
sudo systemctl stop edupriority-web.service edupriority-api.service
sudo install -d -o root -g root -m 700 /srv/edupriority/backups
BACKUP="/srv/edupriority/backups/$(date +%Y%m%d-%H%M%S)"
sudo mkdir -m 700 "$BACKUP"
for f in edupriority.db edupriority.db-wal edupriority.db-shm; do
  if sudo test -f "/srv/edupriority/app/backend/$f"; then sudo cp -a "/srv/edupriority/app/backend/$f" "$BACKUP/"; fi
done
if sudo test -d /srv/edupriority/app/backend/uploads; then sudo cp -a /srv/edupriority/app/backend/uploads "$BACKUP/"; fi
sudo chmod -R go-rwx "$BACKUP"
```

These backup commands assume the example SQLite path. If `DATABASE_URL` points elsewhere, back up that actual database using its database-specific procedure instead. Keep the app stopped while copying SQLite and uploads together; verify and periodically test restoring backups, store an encrypted off-host copy, and restrict access. Do not back up ParkShare or copy production data into Git.

After the backup, update the intended branch with a fast-forward only and rebuild. Review upstream changes and migrations before restarting. If the checked-in systemd templates changed, compare them with your installed units, merge any required changes without losing your local adaptations, and run `sudo systemctl daemon-reload` before restarting:

```sh
sudo -u edupriority git pull --ff-only
sudo -u edupriority /srv/edupriority/app/backend/.venv/bin/python -m pip install -r /srv/edupriority/app/backend/requirements.txt
cd /srv/edupriority/app/frontend
sudo -u edupriority npm ci
sudo -u edupriority npm run build
sudo systemctl start edupriority-api.service
sudo systemctl start edupriority-web.service
sudo systemctl status edupriority-api.service edupriority-web.service --no-pager
sudo journalctl -u edupriority-api.service -u edupriority-web.service -n 100 --no-pager
```

If a build or migration fails, leave EduPriority stopped until repaired; never wipe the database to make it start. For code rollback, stop the two EduPriority units, check for local changes, switch to the recorded previous commit (`sudo -u edupriority git switch --detach PREVIOUS_COMMIT` after replacing the placeholder), reinstall the previous dependencies, rebuild, and start both units. A code rollback alone may not undo schema changes: if incompatible, restore the matching database **and** uploads backup at their original absolute paths with the services stopped, then verify ownership and startup. Restoring a backup discards changes since that backup; obtain approval and preserve the newer data first. Switch back to the intended branch before later updates. Logs: `sudo journalctl -u edupriority-web.service -f` and `sudo journalctl -u edupriority-api.service -f`; restart only these services with `sudo systemctl restart edupriority-api.service edupriority-web.service`.

## DNS, HTTPS proxy and live verification

1. Determine the actual public endpoint used by the proxy, its network namespace and the application's reachable private IP. Create the `edupriority.adv.ro` DNS A/AAAA records only for verified endpoints. Remove or omit an AAAA record if IPv6 does not actually route to the proxy. Leave ParkShare records untouched.
2. Create a **separate** HTTPS proxy host for `edupriority.adv.ro`, forwarding HTTP to the actual application host/private address on `3001`. Never use the proxy host IP as the upstream without verifying it is also the app host. Open public `80/443` to the proxy for certificate issuance and HTTPS, and allow only proxy-to-app traffic on `3001` if hosts/namespaces differ. Keep `8101` private. Check existing firewall rules before adding narrowly scoped rules.
3. If the active proxy is Nginx Proxy Manager: create a new Proxy Host, domain `edupriority.adv.ro`, scheme `http`, Forward Hostname/IP = **verified app-reachable address**, Forward Port `3001`, and enable Websockets Support if required. On SSL request a new Let's Encrypt certificate for this domain, agree to the terms, and enable Force SSL after issuance. Verify automatic renewal and inbound validation reachability. Use NPM's normal forwarding headers and ensure any custom configuration overwrites untrusted forwarded headers. Do not edit ParkShare's host, certificate or settings. If NPM is not active, configure the actual proxy equivalently.
4. From an independent machine, replace `VERIFIED_PUBLIC_IPV4` with the actual proxy endpoint and check DNS, TLS, routing and ParkShare before and after deployment:

```sh
dig +short A edupriority.adv.ro
dig +short AAAA edupriority.adv.ro
dig +short A parkshare.adv.ro
curl -fIs https://parkshare.adv.ro/
curl -fIs --resolve edupriority.adv.ro:443:VERIFIED_PUBLIC_IPV4 https://edupriority.adv.ro/
curl -fIs https://edupriority.adv.ro/
curl -fIs https://edupriority.adv.ro/login
openssl s_client -connect edupriority.adv.ro:443 -servername edupriority.adv.ro </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
curl -fIs https://parkshare.adv.ro/
```

Confirm the expected certificate name, validity and renewal, the actual IP returned by DNS, and the EduPriority page content; an HTTP status alone does not prove correct proxy routing. Check proxy-to-app connectivity from the proxy namespace and test login/authenticated data with authorized synthetic accounts. `--resolve` tests a specific endpoint before DNS propagation while retaining TLS hostname verification. No live DNS, certificate, server, proxy or end-to-end browser verification is implied by these instructions.