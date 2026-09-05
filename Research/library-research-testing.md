Research complete — everything below is verified against live repo/registry data as of today.

---

# Laminar Flow — Testing, CI & Deployment Tooling

## RECOMMENDED SETUP

### Go backend — add today
```
github.com/peterldowns/pgtestdb        v0.1.1   MIT   (per-test isolated DB via template cloning)
github.com/google/go-cmp               v0.7.0   BSD-3 (diffing in tests)
github.com/coder/websocket             v1.8.15  ISC   (when you build the WS layer)
```
Plus **zero-dependency** stdlib: `testing`, `net/http/httptest`, `testing/synctest` (stable since Go 1.25 — you're on 1.27), `go test -fuzz`, and a `-update` golden-file flag.

Tools (not modules): `gotestsum` v1.13.0, `golangci-lint` v2.13.2, `govulncheck` v1.1.4.

Deliberately **not** adding: testify, testcontainers-go, any mocking library, any snapshot library, clockwork. Reasoning in each entry.

### Frontend — add today
```
vitest                          4.1.11   MIT     (NOT 5.x — still RC)
@vitest/browser                 4.1.11   MIT
@vitest/browser-playwright      4.1.11   MIT
@testing-library/react          16.3.3   MIT
@testing-library/dom            10.4.1   MIT     (separate peer dep since RTL 16)
@testing-library/user-event      14.6.7   MIT
@testing-library/jest-dom        7.0.1    MIT
msw                              2.15.0   MIT     (HTTP + WebSocket mocking)
@playwright/test                 1.62.1   Apache-2.0
@axe-core/playwright             4.13.0   MPL-2.0
happy-dom                       20.13.2   MIT     (fast lane for non-IndexedDB tests)
```

### CI / build
GitHub Actions (2 workflows), plain multi-stage Dockerfile + buildx, **native arm64 runners (no QEMU)**, `go:embed` the SPA into the Go binary, distroless static base, Dependabot, `just` replacing COMMANDS.md.

### Wire it up in this order

1. **Fix the silent-skip footgun** — invert the default so `go test ./...` *fails* without a DB (~15 lines, no deps). See "Fix this now" §1.
2. **Adopt pgtestdb** — deletes the `DELETE FROM document` global-mutation fixture *and* the "did you point at the wrong DB" guard in one move. Unblocks `t.Parallel()`.
3. **GitHub Actions for the backend** — `services: postgres:17` + `./scripts/test.sh`. You currently have zero CI; this is the single biggest gap.
4. **Vitest + RTL + happy-dom** on the frontend (there is no test setup at all right now).
5. **Playwright scaffolding** — do it here, thin, with `webServer` booting the Go binary. Your stated requirement, and it's cheap once CI exists. One smoke test is enough initially.
6. **Vitest browser mode** for the IndexedDB optimistic-write/rollback tests (reuses the Playwright Chromium you just installed — near-zero marginal cost).
7. **MSW** for 401-mid-flight / 422-field-errors / network-failure simulation.
8. **Multi-arch Dockerfile + buildx release workflow.**
9. **`just`file** replacing COMMANDS.md.
10. **govulncheck + Dependabot + `go mod tidy` check** in CI.
11. Later, only if pain appears: kin-openapi contract test, rapid property tests, Playwright `toHaveScreenshot`.

---

# Go backend testing

## 1. Disposable Postgres

### pgtestdb — **USE (primary)**
- https://github.com/peterldowns/pgtestdb · **v0.1.1** · MIT · 513★ · last push 2026-08-07
- Model: runs your migrations **once** into a template DB keyed by a hash of the migrations, then `CREATE DATABASE ... TEMPLATE ...` per test. Claimed **~500ms once, ~10ms per clone**. Concurrency-safe via advisory locks, so `t.Parallel()` works. On failure it *leaves the DB alive and logs a connection string* — excellent solo-dev debugging.
- **pgx/v5 path is clean** (verified in source): `pgtestdb.New()` returns `*sql.DB`, but `pgtestdb.Custom(t, conf, migrator) *Config` gives you a `Config` with a `.URL()` method → feed straight to `pgxpool.New`. Use `Custom`.
- **Caveat for you:** `Config` takes discrete `Host/Port/User/Password/Database/Options` fields, not a URL. Parse your existing `TEST_DATABASE_URL` with `pgx.ParseConfig` and map the fields — ~8 lines, keeps your env-var-only config rule intact.
- **Caveat 2:** the bundled migrators are for golang-migrate, goose, dbmate, tern, atlas, bun, pgmigrate, rubenv/sql-migrate. There is **no adapter for plain numbered `.sql` files**, and your `0001_document.sql` naming won't satisfy golang-migrate (which wants `0001_x.up.sql`). But the `Migrator` interface is **exactly two methods** (verified in `testdb.go:99`):
  ```go
  type Migrator interface {
      Hash() (string, error)
      Migrate(context.Context, *sql.DB, Config) error
  }
  ```
  A migrator over `//go:embed migrations/*.sql` that SHA-256s the concatenated contents and `Exec`s them in filename order is ~30 lines. Write it once; it also means your test path exercises your real migration files, which is a genuine correctness win.
- darwin/arm64: irrelevant — it's pure Go talking to a Postgres you already run. Works identically against your `docker compose` Postgres locally and a `services: postgres` container in CI.
- **Setup cost: ~1 hour (mostly the custom migrator). Payoff: high** — it eliminates two live footguns and enables parallel tests.

### testcontainers-go — **CONSIDER (not primary)**
- https://github.com/testcontainers/testcontainers-go · **v0.44.0** (2026-08-07) · MIT · 4,969★ · last push 2026-09-02 — very actively maintained.
- macOS/Colima: officially supported. Since Colima v0.4.0 just `docker context use colima` and it auto-detects; older setups need `DOCKER_HOST=unix://$HOME/.colima/default/docker.sock` **and** `TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock`. Podman and Rancher Desktop also have documented paths. arm64 fine (Postgres publishes arm64 images).
- Why not primary: it solves "I have no Postgres" — but you already have a `docker-compose.yml` with a tuned Postgres 17. Adding it means paying container-start latency (seconds) and a Ryuk reaper sidecar on every run, on a laptop, for a problem you don't have. Its `reuse` mode claws some of that back but adds statefulness.
- Where it *does* earn its place: CI, if you'd rather not maintain a `services:` block. Marginal. **Verdict: skip now; revisit if you ever add Redis/S3/etc. to the stack.**

### fergusstrange/embedded-postgres — **AVOID (for your case)**
- https://github.com/fergusstrange/embedded-postgres · **v1.34.0** (2026-03-18) · MIT · 1,224★
- darwin/arm64: it pulls zonkyio/embedded-postgres-binaries (**v18.6.0**, 2026-08-28). Native Apple Silicon binaries only from **Postgres 18.3.0+**; anything earlier runs x86_64 under Rosetta 2. You're on **Postgres 17** in compose — so on your Mac you'd either be on Rosetta or forced to test against a *different major version than you deploy*. That's a silent-divergence risk, which is precisely the class of bug you're trying to eliminate.
- The "no Docker needed" pitch doesn't apply: you run Docker anyway.

### ory/dockertest — **AVOID**
- https://github.com/ory/dockertest · **v4.0.0** (2026-04-14) · Apache-2.0 · 4,524★ · last push 2026-07-17. Alive, but testcontainers-go has won this niche and has better docs. No reason to pick it in 2026.

### DATA-DOG/go-txdb — **AVOID**
- https://github.com/DATA-DOG/go-txdb · **v0.2.1** (2025-03-11) · 752★ — quiet.
- Fatal for you regardless of maintenance: it wraps every test in one transaction and rolls back. Your `document.Service.Save` is delete-then-insert and `RebuildIndex` almost certainly wants its own transaction — nested/own transactions inside a txdb connection are exactly where this breaks. It's also a `database/sql` driver, so it doesn't fit `pgxpool` naturally. Skip.

### docker-compose + TRUNCATE — **this is your status quo; replace it**
Works, but it's what produces the current design where a fixture issues `DELETE FROM document` against whatever URL it's handed, forcing a string-comparison safety check in `test.sh`. pgtestdb makes the whole category disappear.

---

## 2. Making skipped DB tests loud — the concrete pattern

Your `scripts/test.sh` is already a thoughtful guard, and your comments show you understand the problem. But the guard lives *outside* the test binary, so the footgun survives: `go test ./...`, IDE gutter-run buttons, `go test ./internal/document`, and anything a CI job does directly all still pass vacuously. GoLand's run buttons (you have `.idea/`) will not source `.env`.

**Fix: invert the default.** Absence of configuration should mean *fail*, and skipping should require an explicit, visible flag. Go already ships the flag for this — `-short`.

Put this in `internal/document/main_test.go`:

```go
var testDBURL string

func TestMain(m *testing.M) {
	flag.Parse() // required before testing.Short() is readable

	testDBURL = os.Getenv("TEST_DATABASE_URL")
	if testDBURL == "" {
		if testing.Short() {
			fmt.Fprintln(os.Stderr, "SKIPPING database tests: -short and no TEST_DATABASE_URL")
			os.Exit(0)
		}
		fmt.Fprintln(os.Stderr,
			"FAIL: TEST_DATABASE_URL is not set.\n"+
				"  These tests require a real Postgres. Run ./scripts/test.sh,\n"+
				"  or pass -short to deliberately skip them.")
		os.Exit(1)
	}
	os.Exit(m.Run())
}
```

Now:
- `go test ./...` → **exits 1 with an explanation.** The vacuous PASS is gone at the source.
- `go test -short ./...` → skips, and *says so*, and you had to ask for it.
- `./scripts/test.sh` → unchanged, still works.
- GoLand gutter-run → fails loudly instead of lying.

**Why not the alternatives:**
- **Build tags** (`//go:build integration`) — the classic choice, but it has the same failure mode you already have: forget the tag and the files aren't even compiled, so you get PASS *and* you don't get compile errors in your integration tests. Strictly worse for your stated concern. It also breaks IDE navigation unless you configure build tags per-project.
- **`t.Skip` on missing env var** — your current design. This is the bug.
- **`-run` patterns** — fragile, invisible, and doesn't compose across packages.
- **A library** — none needed. This is 15 lines of stdlib. Nothing on the market is worth a dependency here.

**Making CI assert the tests actually ran.** Belt-and-braces on top of the above: `go test -json` emits one `{"Action":"skip"}` per skipped test. Add to CI:

```bash
gotestsum --jsonfile test.json --format testname -- -race -count=1 ./...
python3 - <<'EOF'
import json,sys
ev=[json.loads(l) for l in open('test.json') if l.strip()]
passed=sum(1 for e in ev if e.get('Action')=='pass' and e.get('Test'))
skipped=[e['Test'] for e in ev if e.get('Action')=='skip' and e.get('Test')]
if passed == 0: sys.exit("FAIL: zero tests passed")
if skipped:     sys.exit(f"FAIL: tests skipped in CI: {skipped}")
print(f"{passed} tests passed, 0 skipped")
EOF
```
CI should tolerate **zero** skips. A skip in CI is either dead config or a lie.

Also add `-count=1` to `scripts/test.sh` — right now Go's test cache can serve a stale PASS for DB tests whose *inputs didn't change but whose database did*. And add `-race`: you're about to write a WebSocket hub.

---

## 3. Assertions / test structure

### stdlib `testing` + `google/go-cmp` — **USE**
- go-cmp: https://github.com/google/go-cmp · **v0.7.0** (2025-02-21) · BSD-3-Clause · 4,677★ · last push 2026-06-18. The release cadence is slow because it's **feature-complete and API-stable**, not abandoned — it's the de facto standard and Google-maintained.
- Your existing `document_test.go` is genuinely good stdlib-style test code: `t.Helper()` on fixtures, `t.Cleanup`, `t.Fatalf` for setup vs `t.Errorf` for assertions, a guard against the vacuous-pass case in `TestRebuildMatchesLiveIndex`. Don't add a framework to code that's already this clean.
- The one real gap: `maps.Equal(got, want)` tells you *that* the index differs and dumps both maps. With ~20 documents that output is unreadable. Swap to:
  ```go
  if diff := cmp.Diff(want, got); diff != "" {
      t.Errorf("index mismatch (-want +got):\n%s", diff)
  }
  ```
  This is the single highest-value test-library addition on the Go side.

### stretchr/testify — **AVOID (for this codebase)**
- https://github.com/stretchr/testify · **v1.12.1** (2026-08-19) · MIT · 26,198★ · last push 2026-09-02. Very much alive; this is not a maintenance objection.
- The `assert` vs `require` footgun is real and it bites hardest in exactly your scenario: `assert.NoError(t, err)` records a failure and **keeps going**, so the next line nil-derefs and you get a panic stack instead of your error message. `require` aborts. Both are one import away and read almost identically. On a solo project with no reviewer to catch it, that's a persistent papercut.
- Secondary objection: `assert.Equal(a, b)` takes `any, any`, so it silently compares mismatched types and gives worse diffs than go-cmp for nested maps — which is your main assertion shape.
- You've written clean stdlib tests already. Adding testify now means two idioms in one repo. **Skip it.**

### matryer/is — **AVOID**
v1.4.1, last release **2023-02-23**, last push 2024-02-08. 1,975★. Effectively frozen.

### frankban/quicktest — **AVOID**
v1.14.6, last push **2024-03-01**, no GitHub releases published. 527★. Dormant. (It was always "go-cmp with sugar" — just use go-cmp.)

### gotestsum — **USE (tooling, not a dependency)**
- https://github.com/gotestyourself/gotestsum · **v1.13.0** (2025-09-11) · Apache-2.0 · 2,715★ · last push 2026-04-15.
- Worth it for two reasons: `--format testname` output is far more readable than `go test` when you have DB tests taking seconds, and `--junitfile` gives GitHub Actions a proper test report. `--jsonfile` feeds the skip-detection script above.
- No built-in "fail on skip" flag (verified — it only has `--hide-summary=skipped` for display). Hence the script.

---

## 4. Golden-file / snapshot testing

**Verdict: stdlib + a `-update` flag. USE. No library.**

The entire pattern is ~15 lines and you'll want to read it later:

```go
var update = flag.Bool("update", false, "rewrite golden files")

func assertGolden(t *testing.T, name string, got []byte) {
	t.Helper()
	path := filepath.Join("testdata", name)
	if *update {
		if err := os.MkdirAll("testdata", 0o755); err != nil { t.Fatal(err) }
		if err := os.WriteFile(path, got, 0o644); err != nil { t.Fatal(err) }
		return
	}
	want, err := os.ReadFile(path)
	if err != nil { t.Fatalf("missing golden file (run: go test -update): %v", err) }
	if diff := cmp.Diff(string(want), string(got)); diff != "" {
		t.Errorf("%s mismatch (-want +got):\n%s", name, diff)
	}
}
```

This is high-value for exactly what you named: locking the **error envelope** and **list-response shape**. Pretty-print the JSON before writing so diffs are line-oriented and reviewable in git.

- **sebdah/goldie** — CONSIDER-but-don't: v2.8.0 (2025-10-11), MIT, 263★. Maintained, but 263 stars and a dependency to replace 15 lines.
- **bradleyjkemp/cupaloy** — **AVOID.** v2.8.0, last release **2022-09-14**, last push 2023-05-19. Dead.
- **approvals/go-approval-tests** — v1.14.0 (2026-06-30), Apache-2.0, **102★**. Actively maintained but tiny adoption; its model wants an external diff tool. Skip.

---

## 5. HTTP handler testing

### `net/http/httptest` — **USE. Sufficient.**
For a net/http service, `httptest.NewRequest` + `httptest.NewRecorder` is the whole answer. Nothing to add.

The high-value test here is the one you already identified: **enumerate every route and assert each is gated.** Do it structurally, not by hand — if your router is `http.ServeMux` (Go 1.22+ patterns), keep a package-level slice of route definitions that both `RegisterRoutes` and the test iterate, so a new route that isn't in the slice fails to be registered at all. That makes the test un-forgettable rather than merely present.

### kin-openapi — **CONSIDER (high value, defer to step ~10)**
- https://github.com/getkin/kin-openapi · **v0.149.0** (2026-08-28) · MIT · 3,290★ · last push 2026-09-01. Very actively maintained.
- Use `openapi3.NewLoader` + `routers/gorillamux` (works for plain paths) + `openapi3filter.ValidateResponse` in a single table-driven test that replays each handler's recorded response through the published spec. For an API-first open-core product this is genuinely high-value: it makes "the docs are wrong" a test failure.
- Order matters though: **write the spec first.** You don't have an OpenAPI document yet, and this is worthless without one. Defer until the API shape settles.

### Huma — **CONSIDER, but recognise what you're deciding**
- https://github.com/danielgtaylor/huma · **v2.39.1** (2026-07-29) · MIT · 4,367★.
- `humatest` is nice: `humatest.New(t)` gives a `TestAPI` with `api.Get("/foo")`, `api.Post("/foo", "X-H: v", body)`, plus `DumpRequest`/`DumpResponse` helpers. And Huma generates OpenAPI **from** your Go types, which removes the spec-drift problem entirely rather than testing for it.
- But this is a **framework migration**, not a test-tooling choice. Adopting it rewrites your handler layer and its validation model. Evaluate it on those merits when you build out the API — don't adopt a framework because you like its test helper.

### pb33f/libopenapi-validator — **AVOID for now**
v0.14.0 (2026-07-11), MIT, **146★**. Actively developed and the libopenapi family is well-regarded, but kin-openapi has 20x the adoption for the same job.

### Note for you: `testing/synctest` is stable
Confirmed: experimental in Go 1.24 under `GOEXPERIMENT=synctest`, **graduated to stable in Go 1.25**. You're on Go 1.27, so it's just there. This matters a lot below.

---

## 6. Property-based / fuzz testing

### Native `go test -fuzz` — **USE, narrowly**
Perfect fit for **cursor pagination**: your cursor is (presumably) an opaque encoded string, so `encode(decode(b)) == b` and "decode never panics on arbitrary input" are textbook `[]byte`-shaped fuzz targets. That second property is also a **security** property — cursors come from untrusted clients. Cheap to write, run it 60s in CI, commit the corpus to `testdata/fuzz`.

Limitation to know: native fuzzing only mutates a fixed set of primitive types (`[]byte`, `string`, ints, floats, bool, rune). Structured inputs need you to hand-roll a decoder from bytes → filter tree, which is doable but is the point where rapid starts winning.

### flyingmutant/rapid — **CONSIDER (for the filter→SQL compiler only)**
- https://github.com/flyingmutant/rapid · **v1.3.0** (2026-04-30) · **MPL-2.0** · 873★ · last push 2026-04-30. Maintained, has automatic shrinking and state-machine testing.
- License note: MPL-2.0 is file-level copyleft. It's a test-only dependency that never ships in your binary, so it's fine for open-core — but be aware it's not MIT/BSD like the rest of your tree.
- The nested AND/OR filter compiler is the **best property-testing candidate in your whole codebase**: generate a random filter tree, compile to SQL, run it against pgtestdb, and assert the returned rows match a naive in-Go evaluation of the same tree over the same fixtures. That's a real oracle, and shrinking will hand you a minimal failing tree instead of a 40-node monster.
- **But: not yet.** Table-driven tests over ~25 hand-picked trees (deep nesting, empty groups, single-child OR, NOT-of-NOT, mixed types, SQL-injection-shaped strings) will find most of your bugs for a fraction of the effort. Write those first. Reach for rapid when the table stops finding things — that's a real signal, and you'll have the oracle function written by then.

### leanovate/gopter — **AVOID**
v0.2.8, last release **2020-06-15**. 637★. Abandoned in all but name.

**Blunt verdict for one developer:** fuzz the cursor codec now (30 minutes, real security value). Table-test the filter compiler now. Add rapid to the filter compiler later, once the tables plateau.

---

## 7. Mocking — **you need nothing**

You rejected DB mocking, which was the right call and also removes ~90% of the demand for a mocking library. Everything else in your stack is either in-process or reachable via `httptest`. Hand-written interfaces satisfied by a 10-line struct literal in `_test.go` will cover any remaining case for a long time.

For the record, if you ever add a real external service:
- **uber-go/mock** — **the live fork. Confirmed:** `golang/mock` is **archived** (archived flag true, last push 2024-01-08, final release v1.6.0 from 2021-06-11). uber-go/mock is at **v0.6.0** (2025-08-18), Apache-2.0, 3,404★, last push 2026-08-25. This is what to use if you need generated mocks.
- **vektra/mockery** — **v3.7.4** (2026-08-23), BSD-3-Clause, 7,157★, very active. No paid tier or license change found; it's straightforwardly open source. Nicer config-driven UX than uber-go/mock.

**Verdict: SKIP both. Revisit only when a genuine external dependency appears.**

---

## 8. Coverage / mutation testing

- **`go test -cover`** — **USE**, it's free. Add `-coverprofile=cover.out` to CI and glance at it occasionally. Don't set a coverage gate; on a solo project a coverage threshold is a tax you pay to yourself.
- **`go build -cover` (integration coverage)** — **CONSIDER, and it's a neat fit for Playwright.** Introduced in **Go 1.20**. You can build the server binary with `go build -cover`, run it under Playwright with `GOCOVERDIR=./covdata`, then merge with your unit coverage: `go tool covdata merge -i=covdata,unitdata -o merged` and `go tool covdata textfmt -i=merged -o profile.txt`. This tells you what your E2E tests actually exercise in the Go layer — unusually useful for a single-binary app. Low priority, but genuinely cool and ~5 lines of CI.
- **gremlins** — **SKIP — premature for a solo dev.** https://github.com/go-gremlins/gremlins · v0.6.0 (2025-12-06) · Apache-2.0 · 403★. Mutation testing is a "we have good coverage and don't trust it" tool. You have three tests. Come back in two years, if ever.
- **go-mutesting** — **SKIP**, same reasoning and less maintained.

---

## 9. WebSocket server testing in Go

### coder/websocket — **USE**
- https://github.com/coder/websocket · **v1.8.15** (2026-06-15) · **ISC** · 5,445★. Maintained by Coder (took over from nhooyr, who ran it 2019–2024). Context-aware API, `wsjson` subpackage, zero-alloc reads/writes.
- Compare **gorilla/websocket**: 24,860★ but **last release v1.5.3 on 2024-06-14**, last push 2025-03-19. Mature and stable, but visibly slowing, and its API predates `context.Context` — which you will want for a hub with per-connection cancellation. For a greenfield Go 1.27 service, coder/websocket is the better pick.

**Testing pattern:** `httptest.NewServer(yourHandler)`, swap `http://` → `ws://`, dial with `websocket.Dial`. That's it — no helper library needed.

### Testing reconnect-after-sleep — this is where `synctest` earns its keep
Your reconnect logic will have exponential backoff with jitter. Testing that conventionally means either `time.Sleep`ing through real backoff (slow, flaky) or injecting a fake clock (a dependency and a design constraint).

`testing/synctest` (stable in Go 1.25) gives you a "bubble" with **virtual time**: time only advances when every goroutine in the bubble is blocked, and then it jumps instantly. A test of "5 reconnect attempts with backoff up to 30s" runs in microseconds, deterministically, with **no fake clock and no code changes**.

```go
func TestReconnectBackoff(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		// close the server, assert the client retries with the
		// expected delays; time.Sleep inside the client is virtual
	})
}
```

This is the strongest argument for being on Go 1.27 and it makes the clock libraries below largely redundant.

---

## 10. Time and randomness control

- **Dependency-injected `now func() time.Time`** — **USE.** For sprint dates, cursor timestamps, and token expiry this is the right design regardless of test tooling, and it costs one struct field. Same for randomness: inject a `*rand.Rand` (or an ID-generator interface) rather than calling package-level `rand`.
- **`testing/synctest`** — **USE** for anything involving *elapsed* time: timeouts, tickers, reconnect backoff, WebSocket keepalives. Covers the cases injection is awkward for.
- **jonboulle/clockwork** — **SKIP.** v0.5.0 (2025-01-02), Apache-2.0, 728★, last push 2025-11-21. Maintained and fine, but between `now func()` injection and synctest you have no remaining gap. Don't add it speculatively.
- **benbjohnson/clock** — **AVOID. Repository is archived** (confirmed; final release v1.3.5, 2023-05-18). Do not adopt.

---

# Frontend testing

## 11. Test runner — Vitest, and it's not close

### Vitest — **USE, pin to 4.1.x**
- **Latest stable dist-tag is `4.1.11` (2026-08-18), MIT.** Vitest 5 is **not released** — dist-tags show `beta: 5.0.0-beta.7` and `rc: 5.0.0-rc.4`. Don't take 5 yet.
- **Vite 8 support confirmed at the source.** vitest@4.1.11's declared peer range is `vite: "^6.0.0 || ^7.0.0 || ^8.0.0"`. You're on Vite 8.2.2 — supported, no workarounds.
- Also note Vitest 4 requires `@types/node` `^20 || ^22 || >=24`; you're on 24.13.3. Fine.
- Jest: **AVOID.** You'd be bolting a separate transform pipeline onto a Vite 8 project that just removed esbuild in favour of rolldown. Zero upside.
- Setup cost: ~20 minutes. Reuses your existing `vite.config.ts`.

**One Vitest 4 gotcha:** browser-mode providers are now **separate packages**. It's `@vitest/browser` **plus** `@vitest/browser-playwright` (also `@vitest/browser-webdriverio`, `@vitest/browser-preview`). Older tutorials showing `browser: { provider: 'playwright' }` with only `@vitest/browser` installed will not work.

## 12. Component testing

### React Testing Library — **USE**
- **`@testing-library/react@16.3.3` (2026-08-27), MIT.** React 19 is supported from 16.3.x; you're on React 19.2.8, so latest is correct.
- **Don't miss the peer dep:** since RTL 16, `@testing-library/dom` is a **separate install** (`10.4.1`, 2025-07-27). This is the #1 install error people hit.
- `@testing-library/user-event@14.6.7` (published **2026-09-02** — actively maintained) — **USE**. Always prefer it over `fireEvent`; it dispatches the realistic event sequences your keyboard-navigation goal depends on.
- `@testing-library/jest-dom@7.0.1` (2026-08-09) — **USE** for `toBeVisible`, `toHaveAccessibleName`, etc. Works with Vitest's `expect` via `@testing-library/jest-dom/vitest`.

### DOM environment — run a **two-lane** setup
This is the important architectural call, and it's the one your requirements force.

**Lane 1 — `happy-dom` (`20.13.2`, 2026-09-02, MIT), default for most tests.** Notably faster than jsdom and sufficient for pure logic, reducers, and presentational components including your skeleton variants. (`jsdom@30.0.1`, 2026-07-29 — also fine, just slower; pick one, happy-dom for speed.)

**Lane 2 — Vitest browser mode (`@vitest/browser` + `@vitest/browser-playwright`), for the sync layer.** Real Chromium. You need this because your three hardest behaviours are all things jsdom/happy-dom fake badly or not at all:
- **IndexedDB** — real implementation with real transaction semantics and real `structuredClone`
- **Drag and drop** — real pointer events
- **WebSockets** — real ones

Configure both as Vitest **projects** in one config, so `npm test` runs the fast lane and `npm run test:browser` runs the real-browser lane (and CI runs both). Browser mode shares the Playwright Chromium download with your E2E setup, so the marginal install cost is zero if you do Playwright first — which is the reason Playwright sits at step 5 in the order above.

## 13. IndexedDB in tests — **use browser mode for the tests that matter**

- **fake-indexeddb** — https://www.npmjs.com/package/fake-indexeddb · **6.2.5 (2025-11-07)** · Apache-2.0 · **CONSIDER**. It's the standard shim, it's what Dexie's own test suite has historically leaned on, and it covers the full IDB surface including `IDBKeyRange`. But the publish cadence has slowed (nearly a year old) and — more importantly — it is a *reimplementation*. Its transaction-lifetime and auto-commit behaviour is the classic source of "passes in tests, breaks in Safari."
- **Verdict, given optimistic-write-and-rollback is your stated priority: put those tests in Vitest browser mode against real IndexedDB.** A rollback test's entire value is that it faithfully models what the browser does when a write is abandoned mid-transaction. Testing that against a shim tests the shim.
- Keep fake-indexeddb available for the fast lane if you find yourself wanting sub-second iteration on pure store logic. It's a legitimate optimisation, just not the primary.
- Related: `dexie@4.4.5` (2026-08-14, Apache-2.0) and `idb@8.0.3` (2025-05-07, ISC) are both current if you haven't picked a wrapper yet.

## 14. API mocking

### MSW — **USE**
- **`msw@2.15.0` (2026-07-08), MIT.** Actively developed (weekly-ish patch cadence through 2026).
- **WebSocket support confirmed** — first-class, via the `ws` namespace: `ws.link(url)`, `.addEventListener('connection', ...)`, `client.send()`, `client.close(code, reason)`, `server.connect()` for passthrough, plus `broadcast()` / `broadcastExcept()`. Your instinct was right and it's directly relevant.
- Why MSW over the alternatives: it intercepts at the network layer, so your app code has no test-only branches, and **the same handlers work in Vitest (node), Vitest browser mode, and Playwright**. For a solo dev that "write once, use in three places" property is the whole ballgame.

**Your three specific scenarios:**
```ts
// network failure  → optimistic write must roll back
http.post('/api/issues', () => HttpResponse.error())

// 401 mid-flight   → in-place banner, preserve pending change, NO redirect
http.patch('/api/issues/:id', () => new HttpResponse(null, { status: 401 }))

// per-field 422    → map onto form fields
http.post('/api/issues', () => HttpResponse.json(
  { errors: { title: 'must not be empty', estimate: 'must be a positive integer' } },
  { status: 422 },
))
```
Use `server.use(...)` for per-test overrides so the 401 fires only on the *second* call — that's how you get "mid-optimistic-write" rather than "before the write."

- **nock** — **AVOID.** Node-http-only; won't work in browser mode, and MSW covers its cases.
- **miragejs** — **AVOID.** Stale, and it's a whole in-memory ORM you'd be maintaining in parallel with your real Go backend. Wrong shape for you.
- **Vite proxy to the real backend** — **USE, but for a different job.** This is how you satisfy your "at least one integration test against a real backend" requirement. That test belongs in Playwright (§16) with the Go binary booted, not in Vitest. Don't try to make Vitest talk to a real Postgres.

## 15. WebSocket testing on the client

- **MSW's `ws` API** — **USE.** Same library you already have, works in both Vitest lanes.
- **mock-socket** — **AVOID.** `9.3.1`, last published **2023-09-11**. Superseded by MSW's `ws`.
- **partysocket** — `1.3.0` (2026-06-23), MIT. Fine library if you want its reconnect logic rather than writing your own, but it has no special testing story. Orthogonal decision.

**Testing reconnect-after-sleep specifically.** Laptop sleep / WiFi drop is not a clean close — it's a socket that dies without a close frame, and then a burst of state change on reconnect. Test it in three layers:

1. **Unit (happy-dom + fake timers or MSW):** `client.close(1006, '')` — code 1006 is "abnormal closure," which is what sleep actually looks like. Assert your backoff schedule and that queued optimistic writes survive. Use Vitest's `vi.advanceTimersByTime` so backoff doesn't cost real seconds.
2. **Browser mode / Playwright:** the honest version. Playwright can drop the connection at the network layer — `await context.setOffline(true)`, wait, `setOffline(false)` — and assert the client re-establishes and **re-syncs missed changes**. This second part is the bug that actually ships: reconnecting is easy, catching up on what you missed while asleep is where the data loss is.
3. **CDP for true sleep simulation:** if you want to be thorough, `Emulation.setCPUThrottlingRate` / suspending the page via CDP gets closer to real sleep than `setOffline`. Optional; `setOffline` catches most of it.

## 16. E2E — Playwright, unambiguously

### Playwright — **USE**
- **`@playwright/test@1.62.1` (2026-07-30), Apache-2.0.** (1.60 was 2026-05-11, 1.61 was 2026-06-15 — roughly monthly.)
- darwin/arm64: native, first-class. CI: official, and works on the free `ubuntu-24.04-arm` runners.
- **Playwright wins over Cypress plainly, and here's the decisive reason for *you*:** Cypress runs your test inside the browser, one browser tab per test, which makes "two independent clients observing each other in real time" structurally awkward-to-impossible. Playwright drives browsers from outside, so multiple independent `BrowserContext`s in a single test is a *supported, ordinary* thing. Your WebSocket fan-out is one of your riskiest behaviours. That alone settles it. Secondary wins: `webServer`, better traces, faster, no paid dashboard nudge.

**Config for a Go-served SPA.** Because the Go binary serves the built SPA same-origin, your E2E setup is *simpler* than a typical split-stack app — one server, one origin, no CORS, no proxy:

```ts
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8081', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run build && ../LaminarFlow-Backend/laminarflow',
    url: 'http://127.0.0.1:8081/healthz',
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: '8081',
      DATABASE_URL: process.env.E2E_DATABASE_URL!,   // env-only, per your config rule
    },
  },
});
```
Note `url:` pointing at your existing `/healthz` — Playwright polls it and won't start tests until the Go server is genuinely up. Keep `E2E_BASE_URL` overridable so the same suite can run against a deployed instance later.

**Seeding the DB per test.** Don't use pgtestdb here (it's per-*Go*-test). Instead expose a test-only seeding path, gated by an env var that is **absent in production**:
- Cleanest: a `laminarflow seed --fixture=kanban` subcommand invoked from a `globalSetup` / fixture, so seeding uses your real domain code.
- Or a `POST /api/test/reset` endpoint registered only when `LAMINAR_E2E_MODE=1`. Make the permission gate cover it too, so your route-enumeration test doesn't get a hole punched in it.

**Auth state reuse (`storageState`).** Log in once in `globalSetup`, save `storageState` to a gitignored JSON file, and point projects at it. Saves a login round-trip per test and keeps tests focused. Keep **one** test that does a real interactive login so the login path itself stays covered. And keep a separate no-auth project for your session-expiry test — that one needs to control auth state precisely.

**Drag-and-drop Kanban.** The key detail, from the Playwright docs: *"If your page relies on the `dragover` event being dispatched, you need at least two mouse moves to trigger it in all browsers."* `locator.dragTo()` does hover → mouse down → move to target → mouse up, which is often **one** move and therefore silently does nothing.

What actually works depends on your library, and this should influence your library choice:
- **dnd-kit / pragmatic-drag-and-drop with pointer sensors** — these listen to `pointermove`, not HTML5 `dragover`. `dragTo()` frequently fails because there aren't enough intermediate moves and because drag activation constraints need a minimum distance. Use the manual sequence:
  ```ts
  const card = page.getByTestId('card-LAM-3');
  const col  = page.getByTestId('column-in-progress');
  await card.hover();
  await page.mouse.down();
  const box = await col.boundingBox();
  // several intermediate moves: clears activation distance, fires dragover twice+
  await page.mouse.move(box.x + box.width/2, box.y + 20, { steps: 10 });
  await page.mouse.move(box.x + box.width/2, box.y + 60, { steps: 10 });
  await page.mouse.up();
  ```
  The `steps` option is what generates the intermediate events. Try `dragTo()` first — when it works it's much less code — but expect to fall back to this.
- **Strong recommendation:** whatever DnD library you pick, also implement **keyboard-accessible drag** (dnd-kit and pragmatic-dnd both support this). It serves your stated keyboard-friendliness goal *and* it gives you a completely stable E2E path: `card.focus(); keyboard.press('Space'); keyboard.press('ArrowRight'); keyboard.press('Space')`. Test the keyboard path for *logic* (does the card move, does the order persist, does the optimistic update roll back on failure) and keep one mouse-drag test for the pointer plumbing. This converts your hardest E2E problem into an easy one.

**Two browser contexts for real-time WebSocket updates — the detailed version.** This is the test that justifies Playwright on its own, and it's the highest-value E2E test you can write:

```ts
test('a change in one client appears live in another', async ({ browser }) => {
  // Two fully independent contexts: separate cookies, storage, and WS connections.
  const alice = await browser.newContext({ storageState: 'e2e/.auth/alice.json' });
  const bob   = await browser.newContext({ storageState: 'e2e/.auth/bob.json' });
  const a = await alice.newPage();
  const b = await bob.newPage();

  await Promise.all([a.goto('/board/eng'), b.goto('/board/eng')]);

  // Make sure Bob's socket is actually established before Alice acts,
  // otherwise this test passes for the wrong reason (initial load, not push).
  await b.waitForEvent('websocket');

  // Alice renames an issue.
  await a.getByTestId('card-LAM-3').click();
  await a.getByLabel('Title').fill('Renamed by Alice');
  await a.getByRole('button', { name: 'Save' }).click();

  // Bob must see it WITHOUT a reload. The absence of b.reload() is the assertion.
  await expect(b.getByTestId('card-LAM-3')).toHaveText(/Renamed by Alice/, { timeout: 5000 });

  await Promise.all([alice.close(), bob.close()]);
});
```

Why each piece matters:
- **`browser.newContext()` twice, not `newPage()` twice** — pages in one context share cookies and storage. You'd be testing one logged-in user in two tabs, which is a different (and weaker) scenario. Separate contexts = separate sessions = separate WebSocket connections = a real fan-out test.
- **`b.waitForEvent('websocket')`** — without this the test races: if Bob's page happens to load *after* Alice's write, Bob sees the change via initial fetch and the test passes while the push path is entirely broken. This is the single most common way this test lies to you.
- **No `b.reload()`** — the whole point.
- **Extend it to the drop case:** `await bob.setOffline(true)`, Alice makes three changes, `setOffline(false)`, assert Bob converges on all three. That's your sleep/resync test at the E2E level, and it's where real bugs live.
- **Extend it to conflicts:** both clients edit the same field optimistically; assert they converge to the same value and neither is left showing a stale optimistic state.

Use `trace: 'on-first-retry'` — the trace viewer with inline network and console data (improved through the 2026 releases) is how you'll debug the inevitable flake in these without adding print statements.

## 17. Visual regression / snapshot — **real verdict below**

### Playwright `toHaveScreenshot()` — **USE**
Free, in-repo, no service, no account, snapshots committed to git and reviewed in diffs. Run it against a single `/dev/gallery` route (see below). Pin the browser version and run baselines in CI (Linux) to avoid the classic macOS-vs-Linux font-rendering churn — generate baselines with `--update-snapshots` in a CI job, not on your laptop.

### Storybook — **SKIP for now. Here's the real answer.**
- `storybook@10.6.0` (published **2026-09-02**), MIT. Extremely active, and the Vitest addon is legitimately good: `npx storybook add @storybook/addon-vitest` turns stories into browser-mode component tests (requires Vitest ≥3, a Vite-based framework, and Playwright Chromium — all of which you'll already have).
- **And yet: skip it.** Your frontend currently has **two `.tsx` files**. Storybook is a second build pipeline, a second config surface, a second set of dependency upgrades, and a per-component authoring tax (`*.stories.tsx` for everything) — paid by one person. It earns its cost when multiple people need a shared component catalogue to discover and agree on components. That is precisely the value you cannot realise.
- **Do this instead, at ~2% of the cost:** a single dev-only route, `/dev/gallery`, that imports every container component and renders each **twice — `loading` and loaded** — in a grid. It's one file. You get:
  - the visual catalogue (open it in a browser)
  - the per-component skeleton comparison, side by side, which is *exactly* your stated quality goal and is actually easier to eyeball in a grid than in Storybook's one-component-at-a-time view
  - one Playwright `toHaveScreenshot()` covering every component's every state
  - an axe scan over the whole gallery in one call
  Gate it behind an env var or dev-only route so it doesn't ship.
- **Revisit Storybook if** you take on a collaborator, or your component count passes ~40 and the gallery stops being navigable. Not before.

### Chromatic — **⚠️ PAID COMMERCIAL SERVICE. SKIP.**
Free tier is **5,000 snapshots/month, Chrome only**. Paid: **Starter $179/month**, Pro **$399/month**, Enterprise custom, overage **$0.008/snapshot**. It's a good product, but it's a hosted SaaS with a recurring bill and it uploads your open-core UI to a third party. Playwright screenshots in your own repo cost $0 and are reviewed in the same PR as the code. Not a close call for one developer.

### Others
- **Loki** — AVOID; Storybook-coupled, and you're not using Storybook.
- **jest-image-snapshot** — AVOID; you're not using Jest, and Playwright's built-in is better integrated.
- **Ladle (`@ladle/react` 5.1.1, 2025-11-04, MIT)** — CONSIDER *only* as a lighter Storybook if you later decide you want a component explorer. The `/dev/gallery` route beats it on cost. Note the year-old publish date.
- **Argos** — hosted service with a free OSS tier. SKIP; same reasoning as Chromatic, and you don't need it once screenshots are in-repo.

## 18. Accessibility testing — **USE, wire it in early**

- `@axe-core/playwright@4.13.0` (2026-08-11) and `axe-core@4.13.0` (2026-08-05), both **MPL-2.0** (dev-only, doesn't affect your product licensing).
- **Yes, worth it now**, and the reason is leverage, not virtue: keyboard-friendliness is a stated core quality target, and axe catches the structural prerequisites for it — missing accessible names, unlabelled form controls, focus-order traps, contrast failures in your dense UI. Wiring it in *after* you've built 40 components means a large remediation project; wiring it in at component #3 means it never accumulates.
- Setup is genuinely ~10 lines, and one scan of the `/dev/gallery` route covers your whole component library:
  ```ts
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
  ```
- Complement it with RTL role-based queries (`getByRole`) as your default query in component tests — that makes accessibility failures show up as *test* failures in normal development, which is worth more than the axe scan itself.
- **vitest-axe** — **AVOID.** `0.1.0`, last published **2022-10-21**. Dead. Use `@axe-core/playwright` in browser mode / E2E instead.

## 19. Type-level testing

- **`tsc --noEmit` in CI — USE. Non-negotiable.** Your `build` script is `tsc -b && vite build`, which does typecheck, but add a standalone `typecheck` script so CI can fail fast on types without a full bundle. Also note **oxlint 1.81.0** is available (you're on ^1.79.0).
- **expect-type `1.4.0` (2026-06-25), Apache-2.0 — CONSIDER.** This becomes worthwhile the moment you generate TypeScript types from the Go API (which you should — it's the natural payoff of an OpenAPI spec). Then `expectTypeOf<GeneratedIssue>().toMatchTypeOf<UiIssue>()` catches API drift at compile time, which is much cheaper than catching it in an E2E test. Until you have generated types, skip.
- **tsd** — AVOID; expect-type is better integrated with Vitest (which has `expectTypeOf` built in, so you may not even need the package).

---

# CI / build / deploy

## 20. CI — GitHub Actions

**You currently have no CI in either repo.** Given your entire stated concern is "a green test run should mean something," this is the largest single gap in the setup — the `test.sh` guard only protects the machine that runs it.

**Structure: one workflow per repo, single job each.** No matrix for tests — you deploy one Go version to one OS. A matrix here buys nothing and doubles your minutes.

**Backend workflow sketch:**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: postgres }
        options: >-
          --health-cmd pg_isready --health-interval 5s
          --health-timeout 5s --health-retries 10
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-go@v7        # built-in module+build caching, keyed on go.sum
        with: { go-version-file: go.mod, cache: true }
      - run: go mod tidy && git diff --exit-code -- go.mod go.sum   # tidy check
      - uses: golangci/golangci-lint-action@v9
      - run: go install gotest.tools/gotestsum@latest
      - run: gotestsum --jsonfile test.json --junitfile junit.xml -- -race -count=1 -coverprofile=cover.out ./...
        env:
          TEST_DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable
      - run: ./scripts/assert-no-skips.sh test.json    # §2
```
Verified action versions: `actions/setup-go` **v7.0.0** (2026-07-16), `actions/setup-node` **v7.0.0** (2026-07-14), `actions/cache` **v6.1.0** (2026-06-26), `golangci/golangci-lint-action` **v9.3.0** (2026-06-29), `docker/build-push-action` **v7.3.0** (2026-07-01), `docker/setup-buildx-action` **v4.3.0** (2026-08-19), `docker/setup-qemu-action` **v4.3.0** (2026-09-01), `docker/metadata-action` **v6.2.0** (2026-07-02). `golangci-lint` itself is **v2.13.2** (2026-08-27), GPL-3.0 (a CLI you invoke — no licensing implication for your product).

**Caching:**
- Go: `actions/setup-go@v7` with `cache: true` handles module + build cache automatically, keyed on `go.sum`. Don't hand-roll `actions/cache` for Go anymore.
- npm: `actions/setup-node@v7` with `cache: 'npm'`, keyed on `package-lock.json`.
- **Playwright browsers: cache these deliberately** — it's the biggest win. Key on the Playwright version so it invalidates on upgrade:
  ```yaml
  - uses: actions/cache@v6
    id: pw-cache
    with:
      path: ~/.cache/ms-playwright
      key: pw-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
  - if: steps.pw-cache.outputs.cache-hit != 'true'
    run: npx playwright install --with-deps chromium
  - if: steps.pw-cache.outputs.cache-hit == 'true'
    run: npx playwright install-deps chromium
  ```
  (The `install-deps`-on-cache-hit step is the bit people miss — the browser binary caches but the system libraries don't.)
- Install **only Chromium** unless you have a specific cross-browser requirement. Three browsers triples install time for a self-hosted app you'll access from one or two browsers.

**Coordinating two repos.** Your E2E tests need both. Three options, in increasing cost:
1. **Recommended: run E2E from the frontend repo, pull the backend binary from a published artifact.** The backend workflow publishes the container image (or a raw binary) on push to its default branch; the frontend E2E job pulls the latest and runs against it. Simple, no cross-repo tokens for the common path.
2. `repository_dispatch` from backend → frontend to trigger E2E on backend changes. Needs a PAT; adds moving parts.
3. **Honestly consider a monorepo.** You are one person, the two repos are lockstep-coupled (the Go binary *embeds* the SPA — they cannot version independently in any meaningful way), you're already coordinating them by hand through `.gitconfig-personal` and shared `.githooks`, and every E2E test needs both checked out. Two repos is costing you real complexity for a separation that doesn't exist in the artifact. If the split isn't load-bearing for licensing reasons, merging them would delete an entire class of CI problem. Worth 20 minutes of thought before you build cross-repo plumbing.

## 21. Multi-arch container builds

**Recommendation: plain multi-stage Dockerfile + buildx, built natively on both architectures with no QEMU.**

**Free arm64 runners — verified:** Linux (and Windows) arm64 GitHub-hosted runners went **GA for public repositories on 2025-08-07** and are **free**, with **4 vCPU** in public repos; labels `ubuntu-24.04-arm` / `ubuntu-22.04-arm`. As of **2026-01-29** arm64 standard runners are also available **in private repositories** (2 vCPU there, and **billed** at standard rates).

⚠️ **This matters for you specifically:** open-core with restrictive licensing suggests the repos may be private. If so, arm64 runner minutes are billable. Still cheap for a solo project, but budget for it — or, if the core repo is public, you get it free.

**Why native over QEMU:** cross-building arm64 under `docker/setup-qemu-action` is typically **5–20x slower** for the compile steps and occasionally hits emulation bugs in Node's native modules during the SPA build. With native runners you build each arch on its own runner in parallel, push by digest, then merge into one manifest:

```yaml
jobs:
  build:
    strategy:
      matrix:
        include:
          - { platform: linux/amd64, runner: ubuntu-latest }
          - { platform: linux/arm64, runner: ubuntu-24.04-arm }
    runs-on: ${{ matrix.runner }}
    steps:
      - uses: docker/setup-buildx-action@v4
      - uses: docker/build-push-action@v7
        with:
          platforms: ${{ matrix.platform }}
          outputs: type=image,push-by-digest=true,name-canonical=true,push=true
  merge:
    needs: build
    steps:
      - run: docker buildx imagetools create -t $IMAGE:$TAG $DIGESTS
```
No QEMU action needed at all.

**The single-image Dockerfile.** Your architecture — Go binary serves the built SPA same-origin — has a clean answer: **build the SPA, then `go:embed` it into the binary.** One stage per language, one artifact out.

```dockerfile
# --- SPA ---
FROM node:24-alpine AS web
WORKDIR /web
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build              # -> /web/dist

# --- Go ---
FROM golang:1.27-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=web /web/dist ./internal/web/dist   # embedded via //go:embed dist
ENV CGO_ENABLED=0
RUN go build -trimpath -ldflags="-s -w" -o /laminarflow .

# --- runtime ---
FROM gcr.io/distroless/static:nonroot
COPY --from=build /laminarflow /laminarflow
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/laminarflow"]
```
Note there's no `--platform` or `GOARCH` anywhere — on a native arm64 runner this just builds arm64. That's the simplicity dividend.

**Base image guidance:**
- **`gcr.io/distroless/static:nonroot` — RECOMMENDED.** pgx/v5 is pure Go, so `CGO_ENABLED=0` gives you a fully static binary. distroless/static includes **ca-certificates** (you need these if you ever make outbound TLS calls) and `/etc/passwd` for the nonroot user, and adds ~2MB. No shell, no package manager, minimal CVE surface — which matters for a self-hosted product other people will run.
- **`scratch`** — smallest, but you must `COPY` ca-certificates and tzdata yourself, and you get zero debuggability. distroless/static gives you the same security posture with fewer footguns. Prefer distroless.
- **`alpine`** — **the CGO/musl caveat you asked about doesn't apply to you**, precisely *because* pgx is pure Go and you can set `CGO_ENABLED=0`. (The classic trap is building with glibc and running on musl, or enabling CGO for a database driver — neither applies.) Alpine's advantage is a shell for debugging on a home server, which is a legitimate thing to want. Reasonable second choice; slightly larger CVE surface.
- **Chainguard images** — good, but the free tier only carries `:latest` tags (pinned/older versions are a paid subscription). For a self-hosted product you want reproducible pinned bases. Skip.

**Alternatives evaluated:**
- **GoReleaser** — https://github.com/goreleaser/goreleaser · v2.18.0 (2026-08-24) · MIT · 16,013★. ⚠️ **GoReleaser Pro is a paid closed-source product: Personal $165/yr ($15/mo), Startup $247/yr, Business $948/yr, Enterprise $3,300/yr.** Pro-only features include Windows/macOS installers, notarization, monorepo support, and split/merge builds. **Verdict: AVOID for this use case** — GoReleaser is a *release-artifact* tool (cross-compiled binaries, checksums, changelogs, Homebrew taps). You ship one container image. It can build Docker images, but it can't build your SPA, so you'd still need a Dockerfile. It solves a problem you don't have. (It would make sense if you later distribute standalone binaries for self-hosters — revisit then.)
- **ko** — https://github.com/ko-build/ko · v0.19.1 (2026-06-29) · Apache-2.0 · 8,515★. Excellent at what it does (no-Dockerfile, fast, multi-arch, distroless by default) but it builds **only Go**. It cannot run `npm run build`. You'd need a wrapper step that builds the SPA first, at which point you've reinvented the Dockerfile with extra steps. **AVOID.**
- **melange/apko** — apko v1.2.43, melange v0.59.3 (both 2026-08-31), Apache-2.0. Powerful (declarative, reproducible, SBOM-native) and genuinely the future of secure base images, but the learning curve is substantial. **SKIP — premature for a solo dev.**

## 22. Pre-commit hooks

**Recommendation: keep your plain git hooks. Add the checks to them. Don't adopt a hook manager.**

⚠️ **Concrete conflict you'd hit:** your `.gitconfig-personal` sets `core.hooksPath = /Users/willbarr/Developer/LaminarFlow/.githooks`, applied to every repo under `~/Developer/LaminarFlow/` via `includeIf`. **Lefthook and Husky both want to manage `core.hooksPath` themselves.** Installing either would either be overridden by your `includeIf` (hooks silently don't run — a new silent-failure footgun, exactly the class of bug you're trying to eliminate) or clobber your account-guard hooks. That's a real cost, not a hypothetical.

Your existing hooks are 10 lines each, work, and solve a genuinely important problem (wrong-GitHub-account pushes). The shared-hooksPath-across-both-repos arrangement is actually rather elegant. Just extend them:

```sh
# .githooks/pre-commit — after the existing email guard
if [ -f go.mod ]; then
    gofmt -l . | grep . && { echo "✗ gofmt needed"; exit 1; }
    go vet ./... || exit 1
elif [ -f package.json ]; then
    npx oxlint || exit 1
    npx tsc --noEmit || exit 1
fi
```
The `if [ -f go.mod ]` dispatch is what makes one shared hooks directory serve both repos — which is the actual reason a hook manager looks appealing, and it's three lines.

**Keep hooks fast.** Put `gofmt`/`vet`/`oxlint`/`tsc` in `pre-commit`; put the DB tests in `pre-push` at most, or leave them to CI. A pre-commit hook that takes 30 seconds gets `--no-verify`'d within a week.

For the record:
- **lefthook** — v2.1.12 (2026-08-28), MIT, 8,761★, very active. Genuinely the best hook manager (parallel execution, single YAML, no Node dependency for a Go project). Would be my pick **if you had no working hooks** — but the hooksPath conflict plus "replacing 20 lines of working shell with a config file and a binary" makes it net-negative today. **CONSIDER only if your hooks grow past ~50 lines or you want parallel execution.**
- **husky 9.1.7 (2024-11-18) + lint-staged 17.4.1 (2026-08-27)** — **AVOID.** Node-only; you'd be requiring `npm install` in the backend repo to run Go hooks. Wrong tool for a two-language setup. (Husky's last publish being nearly two years old is also notable, though it's a stable, feature-complete tool.)
- **pre-commit (Python)** — AVOID. Adds a Python toolchain to a Go+TS project.

## 23. Dependency updates / supply chain

**Worth it now:**
- **Dependabot — USE.** Zero infrastructure, native to GitHub, one `.github/dependabot.yml` per repo. Set `schedule: weekly` and **group** updates (`groups:` with a catch-all for minor+patch) — ungrouped Dependabot on a React+Vite project generates enough PR noise to train you to ignore it, which is worse than not having it. Enable its security alerts regardless.
- **govulncheck — USE.** https://github.com/golang/vuln · **v1.1.4** (2025-01-13) · BSD-3-Clause. Maintained by the Go team; the slow release cadence reflects stability, and the *vulnerability database* updates continuously and independently of the tool version. Its distinguishing feature is real value: it uses call-graph analysis to report only vulnerabilities you **actually reach**, so the signal-to-noise ratio is far better than a manifest scanner. One CI step: `go run golang.org/x/vuln/cmd/govulncheck@latest ./...`.
- **`go mod tidy` + `git diff --exit-code` — USE.** Two lines, catches drifted `go.mod`/`go.sum` before it confuses you later.
- **`npm audit --audit-level=high` — USE**, but don't fail the build on it. npm audit reports transitive dev-dependency issues that are unreachable in your shipped bundle; a hard gate here means routine red builds you learn to ignore. Report it, review it weekly.

**Defer:**
- **Renovate** — https://github.com/renovatebot/renovate · v44.59.1 (2026-09-02) · **AGPL-3.0** · 22,385★. More capable than Dependabot (better grouping, auto-merge policies, handles Dockerfile base images and GitHub Action versions in one place). **CONSIDER** if Dependabot's noise becomes a problem — the config investment is real, though. AGPL applies to Renovate itself, not your project.
- **osv-scanner** — v2.5.1 (2026-08-17), Apache-2.0, 10,962★. Broader than govulncheck (covers your npm tree and container image too) but without the reachability analysis, so noisier. **CONSIDER as a second scanner later**; govulncheck + Dependabot covers the high-value ground.
- **SBOM via syft** — v1.51.1 (2026-08-27), Apache-2.0, 9,503★. **SKIP for now.** SBOMs matter when enterprise customers demand them in procurement. You have zero users. It's one CI step to add on the day someone asks — and `docker buildx build --sbom=true` can generate one with a flag if you want it for free. Don't build a process around it now.
- **Socket** — ⚠️ commercial SaaS with a free OSS tier. **SKIP.** Overlaps Dependabot for your purposes.

## 24. Local dev orchestration

**Recommendation: `just`, and convert COMMANDS.md into the justfile.**
- https://github.com/casey/just · **1.58.0** (2026-08-03) · **CC0-1.0** (public domain) · 35,592★ · last push 2026-09-01.
- **Your `COMMANDS.md` is already a justfile written in prose.** Look at what's in it: every single entry is `set -a && source .env && set +a && <command>`. That prefix repeated eleven times is exactly what a task runner exists to delete — and `just` has native dotenv support (`set dotenv-load`), so the prefix vanishes entirely:
  ```just
  set dotenv-load

  test:        ./scripts/test.sh
  run:         go run .
  reindex:     go run ./cmd/reindex
  psql:        psql "$DATABASE_URL"
  migrate f:   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -1 -f migrations/{{f}}
  db-up:       docker compose up -d
  db-down:     docker compose down
  ```
  This is the highest value-per-minute item in this entire report. It converts documentation that can silently go stale into commands that fail loudly when wrong — the same principle as the test fix. Keep a short COMMANDS.md pointing at `just --list`, or delete it.
- **go-task** — v3.53.1 (2026-08-18), MIT, 16,083★. Equally good; YAML instead of make-like syntax, and it's Go so it fits your stack. Pick either — `just` has simpler semantics for "run this shell command," Task has better file-dependency/checksum support. Coin flip; I'd take `just` for the smaller concept count.
- **Tilt** (v0.37.7, 2026-08-15, Apache-2.0, 10,030★) — **SKIP — premature for a solo dev.** Built for multi-service Kubernetes development. You have one binary and one Postgres.
- **mise** (v2026.9.1, MIT, 33,389★) — **CONSIDER, different problem.** It's a toolchain version manager (pin Go 1.27 and Node 24 per-repo), not an orchestrator. Mildly useful for reproducibility, and it can also run tasks. If you want one tool for both, mise is defensible. But `go.mod`'s `go 1.27.0` directive plus an `.nvmrc` already covers 90% of it.
- **Nix / devenv** — **AVOID.** Excellent reproducibility, weeks of learning curve, and a permanent maintenance surface. Massively disproportionate here.

## 25. Runtime observability — **verdict: `log/slog` and almost nothing else**

Weighted exactly as you asked (one user, 4GB-class box, don't build an observability stack):

- **`log/slog` — USE. Do this one.** Stdlib since Go 1.21, zero dependencies, zero runtime cost you'd notice. Use `slog.NewJSONHandler` in production and a text handler in dev, both selected by env var. The reason this specifically matters for *you*: your host admin is **Cockpit**, which reads the systemd journal. Structured JSON logs with a request ID mean you can actually answer "what happened at 3am" from Cockpit's log viewer without an ELK stack. Add a request-ID middleware and log it on every request and error. This is your entire observability story for a long time and it's genuinely sufficient.
- **`net/http/pprof` — CONSIDER, env-gated.** Import it and register it on a **separate listener bound to `127.0.0.1`**, enabled only when `LAMINAR_DEBUG_ADDR` is set. Never on your main mux — the standard `import _ "net/http/pprof"` registers on `http.DefaultServeMux` and has repeatedly leaked profiling endpoints onto public services. Gated like this, it costs nothing and the day you have a memory leak on a 512MB-limited Postgres box you'll be extremely glad it's there. ~5 lines.
- **Prometheus client + `/metrics`** — https://github.com/prometheus/client_golang · v1.24.1 (2026-07-24) · Apache-2.0 · 6,023★. **SKIP for now.** The library is lightweight; the problem is that metrics without a scraper and a dashboard are just an unread endpoint, and Prometheus + Grafana on a 4GB box sharing RAM with a 512MB-capped Postgres is a poor trade for one user. If you later want basic health visibility, a `/healthz/stats` endpoint returning `pgxpool.Stat()`, goroutine count, and `runtime.MemStats` as JSON gives you 80% of the value for zero dependencies and no scraper.
- **OpenTelemetry — SKIP. Explicitly premature, and I'll say it plainly.** https://github.com/open-telemetry/opentelemetry-go · v1.46.0 (2026-08-25) · Apache-2.0 · 6,536★. Distributed tracing solves "which of my 30 services made this request slow." You have **one process**. The instrumentation is invasive (context plumbing through every layer), the collector is another service to run and update, and the payoff is zero at your topology. Revisit if you ever split the backend — which, per your own postponement of a staging environment, is not soon.

## 26. Database backup/restore

**Recommendation: `pg_dump -Fc` on a systemd timer, plus a `restore.sh` that you actually test. Nothing more.**

This directly serves your stated goal ("understandable and simple, ideally copying a database/file directory"), and it's worth noting **why `pg_dump` beats the file-copy instinct**: copying `/var/lib/postgresql/data` while Postgres is running produces a **corrupt, unrestorable backup** unless you bracket it with `pg_start_backup`/`pg_stop_backup` or use a proper base-backup tool. Given your `PGDATA_HOST` is a USB HDD, the temptation to just `cp -r` it is real and it would quietly give you worthless backups. `pg_dump` is consistent by design (it runs in a single MVCC snapshot) and needs no downtime.

```sh
# scripts/backup.sh
set -eu
: "${DATABASE_URL:?}" "${BACKUP_DIR:?}"
mkdir -p "$BACKUP_DIR"
out="$BACKUP_DIR/laminarflow-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --compress=9 --file="$out" "$DATABASE_URL"
# verify the dump is readable, not just that pg_dump exited 0
pg_restore --list "$out" >/dev/null
ls -1t "$BACKUP_DIR"/laminarflow-*.dump | tail -n +15 | xargs -r rm --
```
Notes on the details:
- `-Fc` (custom format) is the right choice over plain SQL: compressed, and `pg_restore` can do selective/parallel restore from it.
- **`pg_restore --list` as a verification step** is the cheap trick most scripts omit — `pg_dump` exiting 0 does not prove the file is intact.
- Keep `BACKUP_DIR` an env var, consistent with your config rule. Put it on a *different* volume from `PGDATA_HOST` — a backup on the same USB HDD as the database dies with the HDD.
- Schedule with a **systemd timer** rather than cron: you're already administering via Cockpit, which surfaces timer units and their failure state. A failed cron job is silent; a failed systemd unit is visible in Cockpit. That's the same "fail loudly" principle again.

**The part that actually matters — and the thing almost everyone skips:** write `scripts/restore.sh` and **exercise it in CI**. A backup you've never restored is a hypothesis. Add a CI job that creates a DB, runs migrations, seeds a row, dumps, drops, restores, and asserts the row is back. That single test is worth more than any backup tool on this list, and it's ~15 lines against the Postgres service container you already need for tests.

**Alternatives:**
- **pgBackRest** — v2.59.1 (2026-08-17), 4,350★. **AVOID — too heavy, correctly identified.** Built for multi-terabyte clusters with PITR, parallel compression, and remote repositories. Its config surface alone exceeds your entire application.
- **WAL-G** — v3.0.9 (2026-08-20), 4,239★. **AVOID.** Same reasoning; it's for continuous archiving to S3 with point-in-time recovery. If you ever need PITR (i.e. "restore to 14:32 yesterday" rather than "restore last night's dump"), revisit. One user does not need PITR.
- **barman** — v3.20.0 (2026-08-27), GPL-3.0, 3,227★. **AVOID.** Same class; also drags in a Python runtime.
- **`pg_basebackup`** — **CONSIDER as a complement, not a replacement.** It's a physical backup and it *is* the safe way to copy the data directory, so it satisfies your "copy a directory" instinct correctly. But it's per-cluster (not per-database), version-locked (you can't restore a PG17 basebackup into PG18), and larger. `pg_dump` is more portable and more understandable, which is what you asked for. Use `pg_dump` as primary.

---

# Fix this now

Concrete problems in the current setup, most important first.

### 1. ⚠️ The silent DB-test skip — the guard is outside the test binary
`internal/document/document_test.go:22` does `t.Skip("TEST_DATABASE_URL not set")`. `scripts/test.sh` guards against this, and it's a well-written script — but the guard can't protect anything that doesn't go through it: bare `go test ./...`, `go test ./internal/document`, **GoLand's gutter run buttons** (you have `.idea/`, and GoLand will not source `.env`), and any future CI job. The default is still "absence of config → vacuous PASS."

**Fix:** move the guard *into* the package and invert the default, per §2. `TestMain` fails with an explanatory message when `TEST_DATABASE_URL` is unset, unless `-short` was passed. ~15 lines, no dependencies. `test.sh` keeps working unchanged. Then update the README and COMMANDS.md notes — they currently document the footgun as a permanent fact of life, and after this fix they'd be wrong in a much better way.

### 2. ⚠️ The `TEST_DATABASE_URL != DATABASE_URL` check is a string comparison
`scripts/test.sh` compares the two URLs as strings. `postgres://…@localhost:5432/laminarflow` and `postgres://…@127.0.0.1:5432/laminarflow` are the same database and pass the check. So does adding `&application_name=x`. The consequence is `DELETE FROM document` against your real data.

**Fix:** adopt **pgtestdb** (§1). It creates a fresh, uniquely-named database per test from a template, so there is nothing to point at the wrong place and nothing to delete. The check, the fixture's `DELETE FROM document`, and the whole hazard class disappear together. Interim hardening if you defer pgtestdb: connect and assert `current_database()` ends in `_test`, rather than comparing URL strings.

### 3. ⚠️ No CI in either repo
No `.github/` in `LaminarFlow-Backend` or `LaminarFlow-Frontend`. Every check depends on you remembering to run it on the one machine that has `.env`. Given that "a green run should mean something" is your explicit concern, this is the biggest structural gap.

**Fix:** §20. Two workflows, single job each, `services: postgres:17`, plus the skip-detection step so CI fails if the DB tests didn't actually run.

### 4. The global-mutation fixture blocks parallelism and couples tests
`testPool` opens every test with `DELETE FROM document` against a shared database, so no test can call `t.Parallel()` and test order is load-bearing. `defaultWorkspace` additionally depends on migration 0003 having seeded exactly one row named `'Default'` — a hidden coupling between your test suite and a specific migration's data.

**Fix:** pgtestdb gives each test its own database; add `t.Parallel()`, and create the workspace explicitly per test instead of reading a seeded row.

### 5. `scripts/test.sh` is missing `-race` and `-count=1`
It runs a bare `go test ./...`. Two consequences: (a) Go's test cache can serve a stale PASS for DB tests whose *source* didn't change but whose *database state* did — a cached green from a database that no longer exists; (b) you're about to write a WebSocket hub with concurrent connections and no race detection.

**Fix:** `go test -race -count=1 ./...`. Also pipe through `gotestsum --format testname` for readable output once DB tests get slower.

### 6. ⚠️ Postgres is published on all interfaces
`docker-compose.yml` has `ports: - "${POSTGRES_PORT:-5432}:5432"`, which binds `0.0.0.0`. On a Tailscale-connected host that exposes Postgres to **every device on your tailnet** (and to the LAN), authenticated only by `POSTGRES_PASSWORD`, which defaults to `change-me` in `.env.example`.

**Fix:** bind to loopback — `"127.0.0.1:${POSTGRES_PORT:-5432}:5432"`. Your `.env.example` already documents the "backend elsewhere, reaching Postgres over the tailnet" case; if you genuinely need that, bind explicitly to the Tailscale interface IP rather than to everything, and require a strong password. Note also that the tailnet `DATABASE_URL` example uses `sslmode=disable`, so those credentials cross the network in the clear — Tailscale encrypts the transport, so this is defensible, but it's worth being deliberate about rather than accidental.

### 7. No frontend test setup at all
Zero test dependencies, no test script, no config. Your two highest-risk behaviours — optimistic IndexedDB writes with rollback, and WebSocket reconnection — are on this side.

**Fix:** steps 4–7 of the wire-up order. Vitest + RTL + happy-dom first (~30 min), then Playwright scaffolding, then browser mode for the sync tests.

### 8. Small stuff, worth 20 minutes total
- `LaminarFlow-Frontend/readme.txt` (23 bytes) sits next to `README.md`. Delete it.
- `.DS_Store` is committed at `/Users/willbarr/Developer/LaminarFlow/.DS_Store`. Add to a global gitignore.
- No `typecheck` script — `tsc -b` only runs as part of `build`. Add `"typecheck": "tsc --noEmit"` so CI can fail on types without bundling.
- No formatter. oxlint lints but doesn't format; add `prettier@3.9.6` with a `format:check` CI step, or accept the inconsistency deliberately.
- `oxlint` is at `^1.79.0`; **1.81.0** is current (2026-09-01).
- Convert COMMANDS.md to a justfile (§24) — highest value-per-minute item here.
- `.githooks/pre-commit` and `pre-push` only guard the GitHub account. Add `gofmt`/`go vet` and `oxlint`/`tsc --noEmit` with an `if [ -f go.mod ]` dispatch so one shared hooks dir serves both repos (§22).
- The reindex invariant test (`TestRebuildMatchesLiveIndex`) already exists and already guards against the vacuous-pass case with `if len(live) == 0`. That's good work — the only upgrade it needs is `cmp.Diff` instead of `maps.Equal` so failures are readable.

---

**Sources:** [testcontainers-go](https://github.com/testcontainers/testcontainers-go) · [testcontainers Colima docs](https://golang.testcontainers.org/system_requirements/using_colima/) · [pgtestdb](https://github.com/peterldowns/pgtestdb) · [pgtestdb on pkg.go.dev](https://pkg.go.dev/github.com/peterldowns/pgtestdb) · [embedded-postgres](https://github.com/fergusstrange/embedded-postgres) · [zonkyio/embedded-postgres-binaries](https://github.com/zonkyio/embedded-postgres-binaries) · [ory/dockertest](https://github.com/ory/dockertest) · [go-txdb](https://github.com/DATA-DOG/go-txdb) · [testify](https://github.com/stretchr/testify) · [go-cmp](https://github.com/google/go-cmp) · [gotestsum](https://github.com/gotestyourself/gotestsum) · [Go 1.25 release notes](https://go.dev/doc/go1.25) · [Go coverage for integration tests](https://go.dev/doc/build-cover) · [kin-openapi](https://github.com/getkin/kin-openapi) · [Huma](https://github.com/danielgtaylor/huma) · [humatest](https://pkg.go.dev/github.com/danielgtaylor/huma/v2/humatest) · [rapid](https://github.com/flyingmutant/rapid) · [uber-go/mock](https://github.com/uber-go/mock) · [golang/mock (archived)](https://github.com/golang/mock) · [mockery](https://github.com/vektra/mockery) · [gremlins](https://github.com/go-gremlins/gremlins) · [coder/websocket](https://github.com/coder/websocket) · [gorilla/websocket](https://github.com/gorilla/websocket) · [clockwork](https://github.com/jonboulle/clockwork) · [benbjohnson/clock](https://github.com/benbjohnson/clock) · [Vitest releases](https://main.vitest.dev/releases) · [Vite releases](https://vite.dev/releases) · [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) · [MSW ws API](https://mswjs.io/docs/api/ws/) · [MSW WebSocket docs](https://mswjs.io/docs/websocket/) · [Playwright input/drag docs](https://playwright.dev/docs/input) · [Playwright release notes](https://playwright.dev/docs/release-notes) · [Storybook Vitest addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon) · [Chromatic pricing](https://www.chromatic.com/pricing) · [GoReleaser Pro pricing](https://goreleaser.com/pro/) · [ko](https://github.com/ko-build/ko) · [arm64 runners GA for public repos](https://github.blog/changelog/2025-08-07-arm64-hosted-runners-for-public-repositories-are-now-generally-available/) · [arm64 runners in private repos](https://github.blog/changelog/2026-01-29-arm64-standard-runners-are-now-available-in-private-repositories/) · [lefthook](https://github.com/evilmartians/lefthook) · [just](https://github.com/casey/just) · [Renovate](https://github.com/renovatebot/renovate) · [golang/vuln](https://github.com/golang/vuln) · [osv-scanner](https://github.com/google/osv-scanner) · [syft](https://github.com/anchore/syft) · [opentelemetry-go](https://github.com/open-telemetry/opentelemetry-go) · [prometheus/client_golang](https://github.com/prometheus/client_golang) · [pgBackRest](https://github.com/pgbackrest/pgbackrest) · [WAL-G](https://github.com/wal-g/wal-g) · [barman](https://github.com/EnterpriseDB/barman)agentId: a5051475e980a30c6 (use SendMessage with to: 'a5051475e980a30c6', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 123394
tool_uses: 44
duration_ms: 849782</usage>