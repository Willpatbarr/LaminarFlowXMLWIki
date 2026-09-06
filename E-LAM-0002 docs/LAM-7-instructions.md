# <span style="color:#2AB8C9">LAM-7 — Set Up a Generated API Contract to Keep Frontend and Backend in Sync</span>

## Notes

Make the API a real artifact: declared once in Go, emitted as
`api/openapi.json`, pulled into the frontend, and turned into TypeScript the
compiler enforces. One placeholder endpoint proves the pipeline end to end
before any real endpoint depends on it.

[LAM-7](https://linear.app/willieworkspace/issue/LAM-7/set-up-a-generated-api-contract-to-keep-frontend-and-backend-in-sync)
lists four steps, none started:

| Ticket step | Where |
| --- | --- |
| 1. Choose the contract mechanism | Decided below — Go-first OpenAPI |
| 2. Wire up generation, commit where the frontend can consume it | Steps 4-6 |
| 3. A placeholder endpoint, proved end to end | Steps 2 and 10 |
| 4. Document the update workflow in both READMEs | Step 9 |

**Step 1 is already answered.** Library Research (E-LAM-0000, 2026-09-02) picked
the whole pipeline: author with `huma.Register` in Go, generate
`api/openapi.json`, commit it, have CI fail on drift, and consume it in the
frontend through `openapi-typescript` plus `openapi-fetch`. One runtime
dependency on the frontend, one Go module on the backend, and the generator
itself invoked through `npx`. TypeScript-from-Go structs is the option not
taken.

**Verified 2026-09-05, not assumed.** This exact code was compiled and run
before the doc was written: `huma` v2.39.1 with the `humago` adapter registers
onto the existing `http.ServeMux` beside the health handlers, `/api/v1/ping`
answers 200 while `/api/nope` still falls to the JSON 404, the generator's
output is byte-identical across runs, and `openapi-typescript` 7.13.0 turns the
result into a typed `paths` map. The comment boxes below survive `gofmt`,
`go vet`, and `go build` untouched, and change no byte of the generated spec.

**Two things verification missed, both found on 2026-09-06 by running the
steps.** First, Step 6.1:
`openapi-typescript` declares `typescript@^5.x` as a peer through its latest
release, and this repo is on 6.0.3, so installing it as a devDependency fails
with `ERESOLVE`. The spike had generated types in a scratch directory with no
TypeScript of its own, which is exactly the case that hides the conflict. Step
6.1 now installs `openapi-fetch` alone and 6.4 runs the generator through
`npx` — verified against this repo, with the local 6.0.3 untouched.

Second, Step 10.2: the client in 7.1 originally took `baseUrl: '/'` and the test
in 7.3 stubbed `globalThis.fetch`. Both are wrong under jsdom — Node's `Request`
rejects a relative URL, and openapi-fetch captures `fetch` when the client is
created, which is before any test can stub it. Both are fixed in 7.1, and
`npm run lint && npm test && npm run build` is green on this branch.

**Every file this ticket creates uses the OMLR comment boxes**
(`OMLR_code_comments.md`); nothing existing is backfilled, so the two styles sit
side by side until a later pass. Three things that follow from putting the
format into Go and JavaScript:

- **A file header needs a blank line before `package`.** Attached, it becomes a
  package doc comment — and `internal/api/api.go` already owns that one for the
  package.
- **`gofmt` leaves the boxes alone**, verified on all three new Go files. It
  never re-indents or re-wraps a `/* */` block, and `staticcheck`'s
  doc-comment-form checks (ST1000, ST1020) are off in its default set, so the
  boxes do not fight `./scripts/test.sh`.
- **`omlr_align.py` only globs `.swift .kt .java .ts .tsx .js .py`** when handed
  a directory, so `.go` and `.mjs` files are skipped unless named explicitly —
  `python3 omlr_align.py internal/api/ping.go` works, `--check .` misses it.
  Two entries in that `suffix in {…}` set would close the gap.

Test files get no boxes: a test body is its own documentation, and §2's trigger
is about functions whose parameters, body, or return are worth explaining.

**Precondition — LAM-9 is not merged.**
[PR #7](https://github.com/Willpatbarr/LaminarFlow-Frontend/pull/7) is open and
mergeable. Step 0 lands it and cuts both branches: this is the first ticket in
the epic that touches **both repos**, so it has two command blocks and ends with
two pull requests.

Decisions this doc makes, flagged because the ticket did not make them:

- **The endpoint is `/api/v1/ping`, not `/api/ping`.** API Design §4 lists
  versioning as open, but the first real endpoint is the cheapest moment to set
  a prefix and the most expensive one to add later. Change 2.4's `Path` if you
  want it unversioned.
- **Huma's defaults also mount `/docs`, `/openapi.json`, `/openapi.yaml`, and
  `/schemas/…` on the same mux.** That is a self-describing API and a docs page
  for free, reachable on the tailnet; nothing else in the app changes. Turn them
  off by clearing the paths on the config in 3.2 if you would rather not serve
  them.
- **Responses carry a `$schema` link.** The ping body is
  `{"$schema": "http://<host>/schemas/PingBody.json", "message": "pong", …}` —
  huma's self-description, built from the request host. It appears in the
  generated TypeScript as an optional `readonly $schema`.

Out of scope, flagged rather than fixed:

- **No chi, no validator, no real resources.** Library Research names four other
  backend modules; this ticket adds one. CRUD, the nested filter compiler, and
  cursor pagination are their own tickets — `ping` exists only to prove the pipe.
- **No `oasdiff` breaking-change gate.** Step 7 of the researched pipeline;
  worth a ticket once a second consumer exists, pointless against one endpoint.
- **No TanStack Query wrappers.** The research is explicit that hooks should be
  hand-written rather than generated, and there is no server state to cache yet.
- **`getPing` is not wired into the UI.** Step 10 proves the runtime path with
  `curl` through the dev proxy instead, so the Playwright smoke test keeps
  passing with no backend running.

---

## Outline

<small>

- Step 0 — Land LAM-9 and open both branches
- Step 1 — Add Huma to the backend
- Step 2 — Declare the ping endpoint
- Step 3 — Mount Huma on the mux
- Step 4 — Write the spec generator
- Step 5 — Generate the spec and fail CI on drift
- Step 6 — Pull the contract into the frontend
- Step 7 — Type the client and prove the call
- Step 8 — Fail frontend CI when the types drift
- Step 9 — Document the workflow in both READMEs
- Step 10 — Verify end to end and open both PRs

</small>

---

## Step 0 — Land LAM-9 and open both branches

### <span style="color:#A16BD9">0.1 · RUN — Merge PR #7 and Cut `LAM-7-F`</span>
the frontend first, because it is the one with something to land

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
gh auth switch --user Willpatbarr &&
gh pr checks 7 --watch &&
gh pr merge 7 --merge &&
git fetch origin &&
git checkout E-LAM-0002-F &&
git merge --ff-only origin/E-LAM-0002-F &&
git checkout -b LAM-7-F &&
git push -u origin LAM-7-F
```

### <span style="color:#A16BD9">0.2 · RUN — Cut `LAM-7-B` and Check the Start Line</span>
the backend epic is already current — PR #13 merged and nothing is open

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
git fetch origin &&
git checkout E-LAM-0002-B &&
git merge --ff-only origin/E-LAM-0002-B &&
git checkout -b LAM-7-B &&
git push -u origin LAM-7-B &&
./scripts/test.sh
```

- the backend leads: the frontend cannot pull a spec that has not been pushed,
  so Steps 1-5 land on `LAM-7-B` before Step 6 fetches from it

---

## Step 1 — Add Huma to the backend

### <span style="color:#A16BD9">1.1 · RUN — Add the Module</span>
one module, MIT, and the adapter for the stdlib mux ships inside it

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
go get github.com/danielgtaylor/huma/v2@v2.39.1
```

- **no `go mod tidy` yet.** Nothing imports huma until Step 2, and tidy removes
  a requirement no file uses — which then makes the import unresolvable, and an
  editor with organize-on-save deletes the import line for you. Tidy runs in
  10.1, once the imports exist
- pinned rather than `@latest`, the same reason `staticcheck` is pinned in
  `ci.yml:40` — a release must not turn a passing branch red on its own
- `humago` is the adapter for Go 1.22+ `ServeMux`, so nothing here needs chi or
  any other router

---

## Step 2 — Declare the ping endpoint

<span style="color:#2E93DB">NEW GUIDED</span>

**Example** — `internal/api/health.go:15-21`
the sibling handler file this one sits beside — same package, same shape

`LaminarFlow-Backend/internal/api/ping.go (new)`

### <span style="color:#2E93DB">2.1 — Add the File Header and Imports</span>
```go
/*
╔═ ping.go ═════════════════════════════════════════════════════════════════════════════
║  http handlers · ping endpoint
╠═ declares ════════════════════════════════════════════════════════════════════════════
║      PingBody       response schema
║      PingOutput     huma output wrapper
╠═ reached from ════════════════════════════════════════════════════════════════════════
║      NewHumaAPI  →  GET /api/v1/ping
╚═══════════════════════════════════════════════════════════════════════════════════════
*/

package api

import (
	"context"
	"net/http"
	"time"

	"github.com/danielgtaylor/huma/v2"
)
```

- the blank line under the box is load-bearing in Go: without it the comment
  attaches to `package api` as a second package doc, and `api.go` already owns
  that one

### <span style="color:#2E93DB">2.2 — Add the `PingBody` Struct</span>
```go
/*
┏━ PingBody ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃  the response contract, mirrored into TypeScript
┣━ attributes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃      Message    string      always "pong"
┃      Time       time.Time   UTC
┣━ created by ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃      registerPing            one per request
*/
type PingBody struct {
	Message string    `json:"message" doc:"Always \"pong\"." example:"pong"`
	Time    time.Time `json:"time" doc:"Server time, UTC."`
}
```

- every field here becomes a property in `api/openapi.json` and a field in the
  frontend's generated TypeScript
- `doc:` and `example:` are not decoration — they are what lands in the spec,
  and from there in the editor tooltip on the frontend

### <span style="color:#2E93DB">2.3 — Add the `PingOutput` Wrapper</span>
```go
/*
┏━ PingOutput ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃  wrapper huma reads the JSON body off
┣━ attributes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃      Body       PingBody    the whole response
*/
type PingOutput struct {
	Body PingBody
}
```

- the wrapper is what leaves room for headers and a status on the same type
  once an endpoint needs them

### <span style="color:#2E93DB">2.4 — Add `registerPing`</span>
```go
/*
┌─ api ───────────────────────────────────────────
│  declares GET /api/v1/ping and its schema
├─ in ────────────────────────────────────────────
│      api    huma.API
├─ example ───────────────────────────────────────
│      GET /api/v1/ping  →  200 {"message":"pong"}
*/
func registerPing(api huma.API) {
	huma.Register(api, huma.Operation{
		OperationID: "ping",
		Method:      http.MethodGet,
		Path:        "/api/v1/ping",
		Summary:     "Ping the API",
	}, func(ctx context.Context, _ *struct{}) (*PingOutput, error) {
		return &PingOutput{Body: PingBody{Message: "pong", Time: time.Now().UTC()}}, nil
	})
}
```

- the declaration is the documentation: one place to change, so the two cannot
  drift
- `OperationID` becomes the TypeScript operation name, so it is an API-visible
  name rather than an internal one
- `*struct{}` as the input: no path parameters, no query, no body

---

## Step 3 — Mount Huma on the mux

### <span style="color:#2AB8C9">3.1 · NEW — Add the `openapi.go` Header and Imports</span>
`LaminarFlow-Backend/internal/api/openapi.go (new)`
file header and imports; 3.2 adds the only function in the file

```go
/*
╔═ openapi.go ══════════════════════════════════════════════════════════════════════════
║  http handlers · api contract
╠═ reached from ════════════════════════════════════════════════════════════════════════
║      NewMux         →  every documented route
║      cmd/openapi    →  api/openapi.json
╚═══════════════════════════════════════════════════════════════════════════════════════
*/

package api

import (
	"net/http"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humago"
)
```

### <span style="color:#2AB8C9">3.2 · NEW — Add `NewHumaAPI`</span>
`LaminarFlow-Backend/internal/api/openapi.go`
one place that knows every documented endpoint, callable without a database

```go
/*
┌─ api ───────────────────────────────────────────
│  registers every documented endpoint on mux
├─ in ────────────────────────────────────────────
│      mux    *http.ServeMux
├─ out ───────────────────────────────────────────
│      huma.API    the same API cmd/openapi emits
├─ example ───────────────────────────────────────
│      empty mux  →  /api/v1/ping, /docs
*/
func NewHumaAPI(mux *http.ServeMux) huma.API {
	api := humago.New(mux, huma.DefaultConfig("LaminarFlow", "0.1.0"))

	registerPing(api)

	return api
}
```

- `cmd/openapi` calls the same function with a throwaway mux, so it needs no
  database and no socket
- **Why:**
  - **C** — the generator and the server must register the same operations or
    the committed spec is fiction; one function makes that structural

### <span style="color:#D98C3B">3.3 · EDIT — Register the API Inside `NewMux`</span>
`internal/api/routes.go:15-27`
one line, between the health routes and the catch-all

```go
func NewMux(pool *pgxpool.Pool, bundle fs.FS) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", live())
	mux.HandleFunc("GET /healthz/db", ready(pool))
 +	NewHumaAPI(mux)
	mux.HandleFunc("/api/", notFound())
	...
	return mux
}
```

- **What:**
  - `NewHumaAPI` registers its own routes on `mux`, so the return value is only
    needed by the generator
- **Why:**
  - **C** — `ServeMux` matches by specificity, not registration order, so
    `GET /api/v1/ping` wins over `/api/` and every other `/api/…` path still
    returns the JSON 404. Verified, not assumed

---

## Step 4 — Write the spec generator

<span style="color:#2E93DB">NEW GUIDED</span>

**Example** — `cmd/migrate/main.go:1-10`
the shape a `cmd/` binary uses here: package comment first, usage in it

`LaminarFlow-Backend/cmd/openapi/main.go (new)`

### <span style="color:#2E93DB">4.1 — Add the File Header and Imports</span>
```go
/*
╔═ main.go ═════════════════════════════════════════════════════════════════════════════
║  tooling · openapi generator
╠═ reached from ════════════════════════════════════════════════════════════════════════
║      go run ./cmd/openapi  >  api/openapi.json
║      ci.yml                →  drift check
╚═══════════════════════════════════════════════════════════════════════════════════════
*/

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/Willpatbarr/LaminarFlow-Backend/internal/api"
)
```

- it builds the same `huma.API` the server does, so the committed spec cannot
  describe endpoints the binary does not serve

### <span style="color:#2E93DB">4.2 — Build the Document</span>
```go
/*
┌─ openapi ───────────────────────────────────────
│  prints the OpenAPI document, indented, to stdout
├─ out ───────────────────────────────────────────
│      exit 0     spec on stdout
│      exit 1     message on stderr
├─ example ───────────────────────────────────────
│      go run ./cmd/openapi  →  153 lines of JSON
*/
func main() {
	spec, err := api.NewHumaAPI(http.NewServeMux()).OpenAPI().MarshalJSON()
	if err != nil {
		fmt.Fprintf(os.Stderr, "openapi: %v\n", err)
		os.Exit(1)
	}
	...
}
```

- the throwaway mux is discarded — only the registration side effect matters

### <span style="color:#2E93DB">4.3 — Indent It</span>
```go
	var pretty bytes.Buffer
	if err := json.Indent(&pretty, spec, "", "  "); err != nil {
		fmt.Fprintf(os.Stderr, "openapi: %v\n", err)
		os.Exit(1)
	}
	pretty.WriteString("\n")
```

- indented and newline-terminated because the file is committed and read as a
  diff; Go marshals maps with sorted keys, so two runs are byte-identical

### <span style="color:#2E93DB">4.4 — Write It Out</span>
```go
	if _, err := pretty.WriteTo(os.Stdout); err != nil {
		os.Exit(1)
	}
}
```

- stdout rather than a path argument: the caller decides where it lands, which
  is what lets CI generate to a pipe and compare without touching the file

---

## Step 5 — Generate the spec and fail CI on drift

### <span style="color:#A16BD9">5.1 · RUN — Generate `api/openapi.json`</span>
first run creates the file; every later run is the check

```bash
mkdir -p api &&
go run ./cmd/openapi > api/openapi.json &&
head -12 api/openapi.json
```

- expect roughly 150 lines: the `ping` path, `PingBody`, and the RFC 9457
  `ErrorModel` and `ErrorDetail` schemas huma emits for every API

### <span style="color:#3DAF62">5.2 · ADD — Fail the Build When the Spec Is Stale</span>
`.github/workflows/ci.yml:49`
appended to the `check` job, after `Run checks` and its `env` block

```yaml
      - name: Run checks
        run: ./scripts/test.sh
        ...

 +      # The spec is generated but committed, so the only way it goes stale is
 +      # a handler change without a regeneration. This is that alarm.
 +      - name: Check the OpenAPI spec is current
 +        run: |
 +          go run ./cmd/openapi > api/openapi.json
 +          git diff --exit-code api/openapi.json
```

- **Why:**
  - **B** — ticket step 2 wants the output committed somewhere the frontend can
    consume; a committed artifact needs a guard or it rots
  - **C** — `git diff --exit-code` is the whole mechanism: regenerate, and fail
    if the working tree moved

---

## Step 6 — Pull the contract into the frontend

### <span style="color:#A16BD9">6.1 · RUN — Install the One Package</span>
`openapi-fetch` is the only thing that ships; the generator runs through `npx`

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
npm i openapi-fetch
```

- resolved 2026-09-06: `openapi-fetch` 0.17.0, and no peer conflicts
- **`openapi-typescript` is deliberately not a devDependency.** Every published
  version through 7.13.0 declares `peerDependencies: { typescript: "^5.x" }`,
  and this repo is on TypeScript 6.0.3, so `npm i -D` fails with `ERESOLVE`
- it is a build-time code generator whose output is committed, so it does not
  need to be in the dependency tree at all — 6.4 pins the version in the script
  instead, and `npx` resolves the tool's own TypeScript in its own prefix

### <span style="color:#2AB8C9">6.2 · NEW — Add the Pull Script's Fetch</span>
`LaminarFlow-Frontend/scripts/api-pull.mjs (new)`
package line, the ref, and the request; 6.3 writes the result

```js
/*
╔═ api-pull.mjs ════════════════════════════════════════════════════════════════════════
║  tooling · api contract
╠═ reached from ════════════════════════════════════════════════════════════════════════
║      npm run api:pull  →  api/openapi.json
╚═══════════════════════════════════════════════════════════════════════════════════════
*/

import { mkdirSync, writeFileSync } from 'node:fs'

const repo = 'https://raw.githubusercontent.com/Willpatbarr/LaminarFlow-Backend'
const ref = process.env.API_REF ?? 'main'
const url = `${repo}/${ref}/api/openapi.json`

const res = await fetch(url)
```

- fetched and committed rather than imported: a build here never depends on the
  backend repo being checked out next to it
- `API_REF` exists for exactly the case this ticket is in: the spec is on a
  branch and not yet on `main`

### <span style="color:#2AB8C9">6.3 · NEW — Add the Pull Script's Write</span>
`LaminarFlow-Frontend/scripts/api-pull.mjs`
directly under 6.2 — fail loudly, then write

```js
if (!res.ok) {
  console.error(`✗ ${res.status} fetching ${url}`)
  process.exit(1)
}

mkdirSync('api', { recursive: true })
writeFileSync('api/openapi.json', await res.text())
console.log(`✓ pulled api/openapi.json from ${ref}`)
```

- a 404 here means the backend branch has not been pushed, which is the one
  mistake worth naming rather than letting it land as unparseable JSON

### <span style="color:#3DAF62">6.4 · ADD — Add the Two API Scripts</span>
`package.json:12`
after `test:e2e`, keeping generation separate from fetching

```json
  "scripts": {
    ...
    "test:e2e": "playwright test",
 +    "api:pull": "node scripts/api-pull.mjs && npm run api:types",
 +    "api:types": "npx -y openapi-typescript@7.13.0 api/openapi.json -o src/api/schema.d.ts",
    "preview": "vite preview",
    ...
  },
```

- two scripts, not one: CI regenerates from the committed spec, which is what
  makes the Step 8 drift check meaningful
- the `@7.13.0` pin lives in the script because the tool is not in
  `package-lock.json` to pin it — move it into `devDependencies` and drop the
  `npx` once openapi-typescript supports TypeScript 6

### <span style="color:#A16BD9">6.5 · RUN — Pull From the Ticket Branch</span>
`LAM-7-B` rather than `main`, because Step 5's commit lives there for now

```bash
API_REF=LAM-7-B npm run api:pull &&
head -20 src/api/schema.d.ts
```

- both `api/openapi.json` and `src/api/schema.d.ts` are committed: the first is
  the contract, the second is the compiler's copy of it

---

## Step 7 — Type the client and prove the call

### <span style="color:#2AB8C9">7.1 · NEW — Add the Typed Client</span>
`LaminarFlow-Frontend/src/api/client.ts (new)`
the whole file — one client, typed by the generated paths

```ts
/*
╔═ client.ts ═══════════════════════════════════════════════════════════════════════════
║  api · typed fetch client
╠═ declares ════════════════════════════════════════════════════════════════════════════
║      api      Client<paths>
╠═ reached from ════════════════════════════════════════════════════════════════════════
║      every feature's api/ folder
╚═══════════════════════════════════════════════════════════════════════════════════════
*/

import createClient from 'openapi-fetch'

import type { paths } from './schema'

export const api = createClient<paths>({
  baseUrl: location.origin,
  fetch: (request) => globalThis.fetch(request),
})
```

- same-origin by decision (LAM-28): the backend serves this bundle and the API
  from one port, and `vite.config.ts` proxies `/api` in dev, so the app's own
  origin is always the right base — 5173 in dev, the deployed host in production
- `location.origin` rather than `'/'`: openapi-fetch builds a `Request`, and
  Node's `Request` cannot parse a relative URL, so a bare `/` fails under jsdom
  even though a browser resolves it fine
- the `fetch` wrapper is what makes 7.3 possible. Passing `globalThis.fetch`
  directly captures the reference at import time, so a stub installed later in a
  test is never seen; calling through `globalThis` defers the lookup to request
  time

### <span style="color:#2AB8C9">7.2 · NEW — Add `getPing`</span>
`LaminarFlow-Frontend/src/api/ping.ts (new)`
the whole file — the first call to cross the contract

```ts
import { api } from './client'

/*
┌─ api ───────────────────────────────────────────
│  fetches the ping endpoint through the contract
├─ out ───────────────────────────────────────────
│      PingBody    message, time, $schema
├─ example ───────────────────────────────────────
│      GET /api/v1/ping  →  { message: "pong" }
*/
export async function getPing() {
  const { data, error } = await api.GET('/api/v1/ping')
  if (error) {
    throw new Error('ping failed')
  }
  return data
}
```

- renaming `message` in the Go struct breaks this function at build time, which
  is the entire point of the pipeline
- the path string is checked against the generated `paths`, so a typo is a
  compile error rather than a 404 at runtime

### <span style="color:#2AB8C9">7.3 · NEW — Add the Test</span>
`LaminarFlow-Frontend/src/api/ping.test.ts (new)`
the whole file — proves the parse, with the type check coming free from `tsc -b`

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'

import { getPing } from './ping'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getPing', () => {
  it('returns the parsed body', async () => {
    const body = { message: 'pong', time: '2026-09-05T00:00:00Z' }
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(body)))

    await expect(getPing()).resolves.toMatchObject({ message: 'pong' })
  })
})
```

- stubbing `fetch` rather than adding MSW: one endpoint with no error cases
  does not need a mock server yet, and Library Research puts MSW at the point
  where 401-mid-flight and field errors need testing

---

## Step 8 — Fail frontend CI when the types drift

### <span style="color:#3DAF62">8.1 · ADD — Regenerate and Diff in CI</span>
`.github/workflows/ci.yml:24`
in the `check` job, after `npm run lint` and before `npm test`

```yaml
      - run: npm run lint

 +      # Regenerated from the committed spec, so a spec pulled without a
 +      # regeneration fails here rather than at the next call site.
 +      - name: Check the generated types are current
 +        run: |
 +          npm run api:types
 +          git diff --exit-code src/api/schema.d.ts

      - run: npm test
```

---

## Step 9 — Document the workflow in both READMEs

### <span style="color:#3DAF62">9.1 · ADD — Add `Changing the API` to the Backend README</span>
`LaminarFlow-Backend/README.md:13`
after the ADR paragraph, before `## Where the code lives`

```markdown
## Changing the API

Endpoints are declared with `huma.Register` in `internal/api/`. The declaration
is the documentation — after changing one, regenerate the spec and commit it:

    go run ./cmd/openapi > api/openapi.json

CI regenerates it and fails if the committed copy differs. The frontend pulls
that file, so a change here is not real until it is committed.
```

- **Why:**
  - **B** — ticket step 4, the backend half: "when you change an endpoint, run X"

### <span style="color:#3DAF62">9.2 · ADD — Add `Consuming the API` to the Frontend README</span>
`LaminarFlow-Frontend/README.md:36`
after the `## Checks` block, before `## Where components live`

```markdown
## Consuming the API

    npm run api:pull

Fetches `api/openapi.json` from the backend's `main` and regenerates
`src/api/schema.d.ts`. Both are committed. Pass `API_REF=<branch>` to pull from
a branch that has not merged yet.

Calls go through `src/api/client.ts`, which is typed from the generated schema:
a path or field the backend does not have is a build error, not a 404.
```

---

## Step 10 — Verify end to end and open both PRs

### <span style="color:#A16BD9">10.1 · RUN — Check the Backend</span>
the full gate, then the generator's own determinism

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
go mod tidy &&
./scripts/test.sh &&
go run ./cmd/openapi | diff - api/openapi.json &&
echo "✓ spec is current"
```

- `go mod tidy` belongs here, not in 1.1: it keeps huma now that three files
  import it, and pulls in `chi`, `cbor`, and `float16` as huma's own indirects

### <span style="color:#A16BD9">10.2 · RUN — Check the Frontend</span>
`npm run build` is where the generated types earn their place

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
npm run lint && npm test && npm run build
```

- if oxlint flags the generated `src/api/schema.d.ts`, add it to
  `ignorePatterns` in `.oxlintrc.json` rather than editing a generated file

### <span style="color:#A16BD9">10.3 · RUN — Start Both Halves</span>
two terminals: the Go server on 8080, Vite on 5173

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
set -a && source .env && set +a &&
go run .
```

- second terminal: `cd ~/Developer/LaminarFlow/LaminarFlow-Frontend && npm run dev`

### <span style="color:#A16BD9">10.4 · RUN — Call It Through the Proxy</span>
port 5173, not 8080 — this is the same-origin path the app really uses

```bash
curl -s localhost:5173/api/v1/ping; echo
curl -s -o /dev/null -w '%{http_code}\n' localhost:5173/api/nope
```

- expected: a JSON body with `message`, `time`, and a `$schema` link, then
  `404` — the catch-all still owns every path the contract does not claim
- `localhost:8080/docs` in a browser is the same contract, rendered

### <span style="color:#A16BD9">10.5 · RUN — Push the Backend and Open Its PR</span>
backend first: the frontend's committed spec came from this branch

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
git add -A && git status --short &&
git commit -m "LAM-7 - generate the API contract from the Go handlers" &&
git push &&
gh pr create --base E-LAM-0002-B --fill
```

### <span style="color:#A16BD9">10.6 · RUN — Push the Frontend and Open Its PR</span>
`api/openapi.json` and `src/api/schema.d.ts` are both in this commit

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
git add -A && git status --short &&
git commit -m "LAM-7 - consume the generated API contract" &&
git push &&
gh pr create --base E-LAM-0002-F --fill &&
gh pr checks --watch
```

- after both merge, re-run `npm run api:pull` with no `API_REF` once, to prove
  the `main` default resolves — it should produce no diff

### <span style="color:#A16BD9">10.7 · RUN — Switch the `gh` Account Back</span>
LaminarFlow is the only thing that pushes as `Willpatbarr`

```bash
gh auth switch --user willbarr_church
```
