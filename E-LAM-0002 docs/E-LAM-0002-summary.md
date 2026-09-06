# <span style="color:#2AB8C9">E-LAM-0002 — Repo Structure & Frontend Architecture</span>

Six tickets, two repos, 2026-09-05 to 2026-09-06. The epic that turned two
repositories that merely existed into two repositories with a shape: a package
per concern on the backend, a feature-based `src/` on the frontend, and a
generated contract between them. Both epic branches are merged to `main`
(backend PR #15, frontend PR #9) and the Linear project is Completed.

---

## 1. The six tickets

| # | Ticket | What landed | Repos |
| --- | --- | --- | --- |
| 1 | **LAM-6** | READMEs stating each repo's role, linking the other | both |
| 2 | **LAM-41** | Image build moved to `release.yml`, tags and dispatch | backend |
| 3 | **LAM-8** | `internal/api/`, and the folder map written down | backend |
| 4 | **LAM-40** | Vitest, RTL, jsdom, and `npm test` in CI | frontend |
| 5 | **LAM-9** | TanStack Router, feature folders, Playwright smoke | frontend |
| 6 | **LAM-7** | A generated OpenAPI contract, Go to TypeScript | both |

Every one is Done in Linear. Each has its own instruction document in this
folder, written before the work and corrected during it.

---

## 2. Where the repos landed

### 2.1 `LaminarFlow-Backend`

```
main.go            startup only - config, pool, schema check, listen
cmd/openapi/       prints api/openapi.json, run by CI as a drift check
internal/api/      one file per resource, thin handlers, huma declarations
api/openapi.json   the committed contract
```

- `main.go` lost 56 lines: every route it used to own moved into `internal/api/`
- `ci.yml` dropped from 174 lines to 47 — the `check` job and nothing else
- `release.yml` is new: 142 lines, triggered by a `v*` tag, a manual dispatch
  with a `frontend_ref` input, or a pull request touching the Dockerfile

### 2.2 `LaminarFlow-Frontend`

```
src/routes/        one file per URL, thin - TanStack Router, file-based
src/features/      one folder per domain feature, starting with tickets/
src/components/ui/ domain-agnostic blocks, currently one Button
src/api/           the generated schema, the typed client, one call
e2e/               Playwright, one smoke test
```

- the Vite demo went with LAM-9: `App.tsx`, `App.css`, `src/assets/`, and
  `public/icons.svg` are gone, replaced by a router and a real screen
- three test layers exist where there were none: component tests under jsdom,
  a contract test with a stubbed `fetch`, and a browser smoke test

---

## 3. Decisions that outlive the epic

| Decision | Why | Source |
| --- | --- | --- |
| **TanStack Router** over React Router | Typed, validated URL state — saved views *are* search params | Library Research |
| **Vitest + RTL** over Jest | Reuses `vite.config.ts`, no second build config | Testing Strategy |
| **Huma**, Go-first OpenAPI | Recursive schemas, RFC 9457 errors, validation pre-handler | Library Research |
| **`/api/v1/`** from the first endpoint | Cheapest place to set a prefix, worst place to retrofit one | API Design §4 |
| **Feature folders** over type folders | One feature in one place; retrofitting later is expensive | Repo Structure §3 |
| **Contract committed**, not fetched | Neither build depends on the other repo being present | LAM-7 |
| **The image build is a release** | The coupling was in the trigger, not the architecture | LAM-41 |

---

## 4. Deferred on purpose

Each of these was flagged in a ticket's instruction doc rather than quietly
skipped. None has a ticket yet.

1. **The design system.** Library Research picks `@base-ui/react` plus Tailwind,
   with shadcn as a scaffold rather than a dependency. LAM-9 shipped one
   unstyled `Button` to prove the folder, not to start a component library.
2. **Enforced import boundaries.** `routes/` → `features/` → `components/` is
   documented and unenforced; React has no compile-time module boundary. A lint
   rule is the fix if it starts happening.
3. **End-to-end against the real stack.** Playwright's `webServer` boots
   `npm run dev`, not the Go binary. The upgrade point is the first route that
   reads real API data.
4. **The optimistic-write integration test.** Testing Strategy §2 chose a real
   backend against a disposable database for reconciliation. That flow does not
   exist yet.
5. **MSW**, for 401-mid-flight, 422 field errors, and network failure. One
   endpoint with no error cases does not need a mock server.
6. **`oasdiff`** as a breaking-change gate, and **TanStack Query wrappers** —
   both are steps in the researched pipeline that need a second consumer and
   real server state respectively.
7. **`openapi-typescript` as a devDependency.** Every published version pins
   `typescript@^5.x` and this repo is on 6.0.3, so the generator runs through
   `npx` until that changes.

---

## 5. By the numbers

| | Backend | Frontend |
| --- | --- | --- |
| Pull requests merged | 5 | 5 |
| Files changed | 16 | 33 |
| Lines added / removed | +618 / −193 | +3,119 / −733 |
| New folders | `internal/api/`, `cmd/openapi/`, `api/` | `routes/`, `features/`, `components/`, `api/`, `e2e/` |
| CI jobs at the end | 2 — `check`, plus `image` in `release.yml` | 2 — `check` and `e2e` |

Frontend line counts include `package-lock.json` and the generated
`schema.d.ts` and `routeTree.gen.ts`; the hand-written total is closer to 300.

---

## 6. What is next

`E-LAM-0003 — Database Schema` is the only epic in Planned; everything from
E-LAM-0004 onward sits in Backlog. Before E-LAM-0003 starts, the seven deferred
items in §4 are worth turning into tickets while the reasoning is still fresh —
the design system in particular, since the next frontend ticket that builds real
UI will otherwise make that decision by accident.
