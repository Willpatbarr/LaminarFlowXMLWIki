# <span style="color:#2AB8C9">LAM-8 — Scaffold the Go Backend Repo Folder Structure</span>

## Notes

Give HTTP handlers a package of their own before the first real endpoint lands,
and write the folder convention down. No new endpoints, no behaviour change —
every route this repo answers today answers identically afterwards.

[LAM-8](https://linear.app/willieworkspace/issue/LAM-8/scaffold-the-go-backend-repo-folder-structure)
lists six steps; four of them landed incidentally during E-LAM-0001:

| Ticket step | State |
| --- | --- |
| 1. Main entry point | **Done** — `main.go` |
| 2. API handlers folder | **This ticket** — Steps 1-4 |
| 3. Business logic folder | **Done** — `internal/document/` |
| 4. Migrations folder | **Done** — `migrations/`, with its own README |
| 5. Config folder | **Done** — `internal/config/` |
| 6. Document what belongs where | **This ticket** — Step 5 |

Every handler is currently an inline closure in `main.go:newMux`. Steps 1-3 move
the three of them into `internal/api/`, one function per endpoint, and leave
`main.go` holding startup only: config, pool, schema check, listen.

**Precondition — LAM-41 is not merged yet.**
[PR #12](https://github.com/Willpatbarr/LaminarFlow-Backend/pull/12) (`LAM-41-B` →
`E-LAM-0002-B`) is open and mergeable. Step 0 lands it, refreshes the epic
branch, and cuts `LAM-8-B` from the result in one block.

Out of scope, flagged rather than fixed:

- **Backend only — there is no `LAM-8-F`.** Nothing in this ticket touches
  `LaminarFlow-Frontend`, so Step 0 has one command block rather than two.
- **The folder map goes in `README.md`, not an ADR.** `docs/adr/README.md` rules
  out records that describe how the code currently looks, and routes rules that
  live better beside the thing they govern to that thing. The map is both, so it
  lands in the README and in the `internal/api` package comment.
- **`main.go` keeps `ensureSchema`, `frontendFS`, and `healthcheck`.** All three
  are startup and process concerns, not routing. Only `newMux` moves.
- **No `internal/api` handler is exported.** `NewMux` is the package's whole
  surface; `live`, `ready`, and `notFound` are reachable only through a route,
  which is what stops a caller wiring a handler somewhere the mux does not know
  about.

---

## Outline

<small>

- Step 0 — Land LAM-41 and open `LAM-8-B`
- Step 1 — Create the `api` package
- Step 2 — Move the health handlers
- Step 3 — Wire the mux and trim `main.go`
- Step 4 — Move the route tests
- Step 5 — Write down what belongs where
- Step 6 — Verify and open the PR

</small>

---

## Step 0 — Land LAM-41 and open `LAM-8-B`

### <span style="color:#A16BD9">0.1 · RUN — Merge PR #12 and Cut the Branch</span>
one block, start to finish: account, checks, merge, epic, branch, folder, checks

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
gh auth switch --user Willpatbarr &&
gh pr checks 12 --watch &&
gh pr merge 12 --merge &&
git fetch origin &&
git checkout E-LAM-0002-B &&
git merge --ff-only origin/E-LAM-0002-B &&
git checkout -b LAM-8-B &&
git push -u origin LAM-8-B &&
mkdir -p internal/api &&
./scripts/test.sh
```

- every line ends in `&&`, so the chain stops at the first failure rather than
  cutting a branch from a half-updated epic
- `gh pr checks 12 --watch` blocks until CI reports; it exits non-zero on a
  failed check, which is the one case where nothing after it should run
- `gh pr merge 12 --merge` keeps `LAM-41-B` on the remote — no `--delete-branch`
- `./scripts/test.sh` at the end is the start-line check: green here means
  anything red later belongs to LAM-8

**`LaminarFlow-Frontend` needs nothing.** No branch, no checkout, no merge —
`LAM-41-F` and the other ticket branches stay exactly where they are.

---

## Step 1 — Create the `api` package

<span style="color:#2E93DB">NEW GUIDED</span>

**Example** — `internal/db/db.go:1-4`
the package comment shape this repo uses — what the package owns, then the rule

`LaminarFlow-Backend/internal/api/api.go (new)`

### <span style="color:#2E93DB">1.1 — Declare the Package and Its Convention</span>
```go
// Package api owns the HTTP surface: one function per endpoint, grouped by
// resource, and nothing beyond parsing a request and formatting a response.
//
// Rules and SQL belong in internal/document and its siblings. A handler that
// grows a query is a handler in the wrong package - that is the convention
// this package exists to hold.
package api

import "net/http"
```

- this comment is half of ticket step 6; Step 5 writes the other half

### <span style="color:#2E93DB">1.2 — Add the `writeJSON` Helper</span>
```go
// writeJSON is the one way this package answers. Routing every handler through
// it means no endpoint can ship without the Content-Type a fetch() needs.
func writeJSON(w http.ResponseWriter, status int, body string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write([]byte(body))
}
```

- the closures in `main.go` set the header by hand three times, and the liveness
  one relies on an implicit 200 — `writeJSON` makes both explicit

### <span style="color:#2E93DB">1.3 — Add the `notFound` Handler</span>
```go
// notFound answers anything under /api/ that no handler claims.
//
// The prefix is registered even though nothing lives under it yet. Without it,
// Go's mux routes /api/anything to the frontend catch-all and a typo'd endpoint
// returns the HTML app shell with status 200 - which a fetch() reports as a
// JSON parse error, three layers from the cause.
func notFound() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusNotFound, `{"error":"not found"}`)
	}
}
```

- the comment comes from `main.go:180-183`; it is the reason the route exists
  and has to survive the move

---

## Step 2 — Move the health handlers

<span style="color:#2E93DB">NEW GUIDED</span>

**Example** — `main.go:156-178`
the two closures being moved, unchanged in behaviour

`LaminarFlow-Backend/internal/api/health.go (new)`

### <span style="color:#2E93DB">2.1 — Add the Imports and the Timeout Constant</span>
```go
package api

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Willpatbarr/LaminarFlow-Backend/internal/db"
)

const dbCheckTimeout = 3 * time.Second
```

- `dbCheckTimeout` leaves `main.go`'s const block in 3.3 — the readiness probe
  is the only thing that ever read it

### <span style="color:#2E93DB">2.2 — Add the `live` Handler</span>
```go
// live answers liveness. Deliberately does not touch Postgres: if this failed
// whenever the database blipped, a supervisor would restart a healthy process.
func live() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, `{"status":"ok"}`)
	}
}
```

### <span style="color:#2E93DB">2.3 — Add the `ready` Handler</span>
```go
// ready answers readiness. Proves the backend can still reach Postgres.
func ready(pool *pgxpool.Pool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), dbCheckTimeout)
		defer cancel()

		if err := db.Check(ctx, pool); err != nil {
			log.Printf("db check failed: %v", err)
			writeJSON(w, http.StatusServiceUnavailable, `{"status":"unavailable"}`)
			return
		}

		writeJSON(w, http.StatusOK, `{"status":"ok"}`)
	}
}
```

- taking `pool` as an argument rather than a package variable is what lets the
  tests in Step 4 hand it a throwaway database

---

## Step 3 — Wire the mux and trim `main.go`

### <span style="color:#2AB8C9">3.1 · NEW — Add the `routes.go` Imports</span>
`LaminarFlow-Backend/internal/api/routes.go (new)`
the third file in the package: package line and imports, nothing else yet

```go
package api

import (
	"io/fs"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Willpatbarr/LaminarFlow-Backend/internal/frontend"
)
```

### <span style="color:#2AB8C9">3.2 · NEW — Add the `NewMux` Func</span>
`LaminarFlow-Backend/internal/api/routes.go`
directly under the imports from 3.1 — the route table, in registration order

```go
// NewMux wires every route the server answers.
//
// Split out of main so it can be tested: main itself needs a real database URL
// and a listening socket, which is why the routing went unverified until LAM-39.
func NewMux(pool *pgxpool.Pool, bundle fs.FS) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", live())
	mux.HandleFunc("GET /healthz/db", ready(pool))
	mux.HandleFunc("/api/", notFound())

	// Everything else is the frontend: real files where they exist, the app
	// shell everywhere else so client-side routing survives a refresh.
	mux.Handle("/", frontend.New(bundle))

	return mux
}
```

- registration order is load-bearing: `/` is the catch-all, so it stays last
- **Why:**
  - **B** — ticket step 2: one function per endpoint, grouped by resource
  - **C** — three route registrations now read as three lines instead of forty

### <span style="color:#D98C3B">3.3 · EDIT — Drop `dbCheckTimeout` from `main.go`</span>
`main.go:22-28`
`healthcheckTimeout` is the only constant startup still owns

```diff
 const (
-	dbCheckTimeout = 3 * time.Second
-
 	// Short on purpose: a container healthcheck that hangs is indistinguishable
 	// from one that failed, but takes the whole interval to say so.
 	healthcheckTimeout = 2 * time.Second
 )
```

### <span style="color:#D98C3B">3.4 · EDIT — Swap the Import</span>
`main.go:14-16`
`frontend` is now reached through `api`, never directly from `main`

```diff
+	"github.com/Willpatbarr/LaminarFlow-Backend/internal/api"
 	"github.com/Willpatbarr/LaminarFlow-Backend/internal/config"
 	"github.com/Willpatbarr/LaminarFlow-Backend/internal/db"
-	"github.com/Willpatbarr/LaminarFlow-Backend/internal/frontend"
 	"github.com/Willpatbarr/LaminarFlow-Backend/internal/migrate"
```

- `db` stays — `main` still calls `db.Connect`; only `db.Check` moved

### <span style="color:#D98C3B">3.5 · EDIT — Call `api.NewMux`</span>
`main.go:60`
inside `main`, the one line that referenced the moved function

```go
func main() {
	...
 -	mux := newMux(pool, bundle)
 +	mux := api.NewMux(pool, bundle)

	addr := ":" + cfg.Port
	...
}
```

### <span style="color:#D98C3B">3.6 · EDIT — Delete `newMux`</span>
`main.go:147-195`
`main.go` now ends at `healthcheck`

```diff
 	return 0
 }
-
-// newMux wires every route the server answers.
-//
-// Split out of main so it can be tested: main itself needs a real database URL
-// and a listening socket, which is why the routing went unverified until LAM-39.
-func newMux(pool *pgxpool.Pool, bundle fs.FS) *http.ServeMux {
```

- the deletion runs to `:195`, the end of the file — 3.1 and 3.2 already hold
  every line of it that survives

---

## Step 4 — Move the route tests

### <span style="color:#A16BD9">4.1 · RUN — Move `main_test.go` into the Package</span>
`git mv` keeps the file's history attached to the tests rather than starting a new one

```bash
git mv main_test.go internal/api/api_test.go
```

- the whole file is mux tests — `main.go`'s startup functions have none today,
  so nothing is left behind

### <span style="color:#D98C3B">4.2 · EDIT — Repackage the Test File</span>
`internal/api/api_test.go:1`
in-package tests, so they can reach `live`, `ready`, and `notFound` directly

```diff
-package main
+package api
```

### <span style="color:#D98C3B">4.3 · EDIT — Rename the Constructor at Every Call</span>
`internal/api/api_test.go:48, 79, 123, 136`
three calls and one comment reference

```diff
-	return newMux(pool, bundle)
+	return NewMux(pool, bundle)
```

- `:136` is prose — "Delete the `/api/` registration in `newMux`" — and goes
  stale silently if it is missed, which is why it is in the same edit

---

## Step 5 — Write down what belongs where

### <span style="color:#3DAF62">5.1 · ADD — Add a `Where the code lives` Section to `README.md`</span>
`LaminarFlow-Backend/README.md:13`
after the ADR paragraph, before the deployment paragraph

```markdown
## Where the code lives

| Path | What belongs there |
| --- | --- |
| `main.go` | Startup only: config, pool, schema check, listen. |
| `cmd/` | Operator binaries — `migrate`, `reindex`. One folder each. |
| `internal/api/` | HTTP handlers, one per endpoint, grouped by resource. Thin. |
| `internal/document/` | Rules and SQL for the document write path. |
| `internal/db/` | The Postgres pool. The only package holding a driver. |
| `internal/config/` | Environment settings, parsed and validated once. |
| `internal/migrate/` | The migration runner. `migrations/` holds the SQL. |
| `internal/frontend/` | Serving the embedded bundle and the SPA fallback. |
| `migrations/` | Versioned SQL, one file per change, never edited after merge. |
| `web/` | The embedded frontend bundle. Written by a script, not by hand. |
```

- **Why:**
  - **B** — ticket step 6: the convention has to be written somewhere it will be
    read before the next folder gets added

### <span style="color:#3DAF62">5.2 · ADD — Name the Split in the Handler Rule</span>
`LaminarFlow-Backend/README.md:13`
one line under the table from 5.1, so the split is stated and not just listed

```markdown
A handler parses a request and formats a response. Anything that queries
Postgres or enforces a rule belongs in `internal/document/` or a sibling —
`internal/api/` never grows a query.
```

---

## Step 6 — Verify and open the PR

### <span style="color:#A16BD9">6.1 · RUN — Run the Full Check</span>
gofmt, build, vet, staticcheck, and the database tests, with `-count=1`

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
./scripts/test.sh
```

- the route tests now run as `internal/api`; a green run here means the move
  changed no behaviour, which is the whole claim of this ticket

### <span style="color:#A16BD9">6.2 · RUN — Start the Server</span>
the mux tests use a throwaway database; the wired binary is what deploys

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
set -a && source .env && set +a &&
go run .
```

- leave the server running and use a second terminal for 6.3; Ctrl-C when done

### <span style="color:#A16BD9">6.3 · RUN — Hit the Three Moved Routes</span>
one call per handler that changed packages, in a second terminal

```bash
curl -s localhost:8080/healthz; echo
curl -s localhost:8080/healthz/db; echo
curl -s localhost:8080/api/nope; echo
```

- expected, in order: `{"status":"ok"}`, `{"status":"ok"}`,
  `{"error":"not found"}`

### <span style="color:#A16BD9">6.4 · RUN — Commit, Push, and Open the PR</span>
base is the epic branch, as with every ticket in E-LAM-0002

```bash
git add -A &&
git commit -m "LAM-8 - give handlers a package and write down the layout" &&
git push &&
gh pr create --base E-LAM-0002-B --fill &&
gh pr checks --watch
```

### <span style="color:#A16BD9">6.5 · RUN — Switch the `gh` Account Back</span>
LaminarFlow is the only thing that pushes as `Willpatbarr`

```bash
gh auth switch --user willbarr_church
```
