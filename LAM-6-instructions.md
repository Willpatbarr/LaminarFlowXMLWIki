# <span style="color:#2AB8C9">LAM-6 — Split Into Separate Frontend and Backend Repos</span>

Finish the two-repo split: give each repo a README that states its role and
points at the other, and stop the backend's image build from pinning a dead
frontend branch.

[LAM-6](https://linear.app/willieworkspace/issue/LAM-6/split-into-separate-frontend-and-backend-repos)
asks for three things. Two are already done. The ticket's own status note claimed
otherwise until 2026-09-05, when the E-LAM-0002 audit corrected it — the note had
predated both LAM-38 and LAM-29:

| Ticket step | State |
| --- | --- |
| 1. Two separate repos | **Done** under E-LAM-0001 — separate `.git`, separate remotes |
| 2. Independent CI in each | **Done** — `.github/workflows/ci.yml` exists in both |
| 3. A README in each stating its role | **Backend partial, frontend not started** |

The frontend README is still the unmodified Vite + React template. That is the
bulk of what is left.

Out of scope, flagged rather than fixed:

- **The backend `image` CI job checks out the frontend repo.** That bends the
  ticket's "zero knowledge of the other repo's toolchain" wording, but it is the
  deliberate outcome of LAM-28 — one image serving both from one origin. The
  `check` job, which runs the actual test suite, stays fully independent.
- **Neither repo's `main` holds the real work.** Both are still on their initial
  commit; everything lives on `E-LAM-0001-B` / `E-LAM-0001-F`. Landing the epic
  on `main` is its own ticket, not this one.
- **No folder-structure section in the frontend README.** LAM-9 owns the
  feature-based scaffold, so documenting it now would describe files that do not
  exist yet — including the router it needs and does not yet have.
- **No test script in the frontend.** `npm run lint` is the only gate today.
  [LAM-40](https://linear.app/willieworkspace/issue/LAM-40/stand-up-the-frontend-test-harness)
  was filed on 2026-09-05 to add Vitest, a `test` script, and the CI step. Step
  2.3 writes the README's check list without `npm test` for that reason.

---

## Outline

<small>

- Step 1 — Open the E-LAM-0002 branches
- Step 2 — Write the frontend README
- Step 3 — Delete the placeholder `readme.txt`
- Step 4 — Name the backend and link the frontend
- Step 5 — Point the image build at the current frontend branch
- Step 6 — Push and verify

</small>

---

## Step 1 — Open the E-LAM-0002 branches

Neither repo has an `E-LAM-0002` branch yet. Both epic branches cut from
`E-LAM-0001-*`, not `main` — `main` is still the initial commit in both repos.

### <span style="color:#A16BD9">1.1 · RUN — Switch the `gh` Account</span>
LaminarFlow pushes as `Willpatbarr`, not the work account

```bash
gh auth switch --user Willpatbarr
```

### <span style="color:#A16BD9">1.2 · RUN — Cut the Frontend Branches</span>
`LaminarFlow-Frontend` — epic off `E-LAM-0001-F`, then the ticket off the epic

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend
git checkout E-LAM-0001-F && git pull
git checkout -b E-LAM-0002-F && git push -u origin E-LAM-0002-F
git checkout -b LAM-6-F
```

- `E-LAM-0002-F` has to be pushed before Step 5 — the backend CI checks it out by name

### <span style="color:#A16BD9">1.3 · RUN — Cut the Backend Branches</span>
`LaminarFlow-Backend` — same shape, `-B` suffix

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend
git checkout E-LAM-0001-B && git pull
git checkout -b E-LAM-0002-B && git push -u origin E-LAM-0002-B
git checkout -b LAM-6-B
```

---

## Step 2 — Write the frontend README

<span style="color:#C95B7A">REPLACE GUIDED</span>

**Example** — `LaminarFlow-Backend/README.md:1-16`
the sibling README `LaminarFlow-Frontend/README.md` mirrors in tone — short
sections, each pointing at the file that owns the detail

`LaminarFlow-Frontend/README.md (replaces the Vite template)`

### <span style="color:#C95B7A">2.1 — Add the Title and Role</span>
```markdown
# LaminarFlow — Frontend

The React + TypeScript client for LaminarFlow, a Linear clone with some added
functionality. The Go API, schema, and migrations live in
[LaminarFlow-Backend](https://github.com/Willpatbarr/LaminarFlow-Backend).
```
- the role sentence plus the cross-link is the whole of ticket step 3

### <span style="color:#C95B7A">2.2 — Add the `Running it` Section</span>
```markdown
## Running it

Node is pinned in [.nvmrc](.nvmrc) — `nvm use` picks it up, and CI reads the
same file, so local and CI cannot drift.

    npm ci
    npm run dev
```

### <span style="color:#C95B7A">2.3 — Add the `Checks` Section</span>
```markdown
## Checks

`npm run build` type-checks with `tsc -b` before Vite emits the bundle, so a
type error fails the build rather than shipping.

    npm run lint
    npm run build
```
- `npm test` is deliberately absent — LAM-40 adds both the script and that line

### <span style="color:#C95B7A">2.4 — Add the `Postgres` Boundary Section</span>
```markdown
## This repo never talks to Postgres

[scripts/check-no-db-driver.mjs](scripts/check-no-db-driver.mjs) fails
`npm run lint` if a database driver reaches the dependency tree. Every read and
write goes through the backend's HTTP API.
```
- the boundary LAM-39 added — worth stating, because nothing in the code says it

### <span style="color:#C95B7A">2.5 — Add the `Bundle Handoff` Section</span>
```markdown
## How the bundle reaches the server

The backend serves this app and the API from one origin, and pulls `dist/` in
itself — `scripts/build-frontend.sh` locally, a BuildKit named context for the
container image. Nothing in this repo needs to know about either.
```

---

## Step 3 — Delete the placeholder `readme.txt`

### <span style="color:#A16BD9">3.1 · RUN — Remove `readme.txt`</span>
`LaminarFlow-Frontend/readme.txt`
tracked one-line placeholder from the initial commit, superseded by Step 2

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend
git rm readme.txt
```

- it is the only file on the frontend's `main`, so leave `main` alone — delete it here only

---

## Step 4 — Name the backend and link the frontend

### <span style="color:#D98C3B">4.1 · EDIT — Retitle `README.md` and Link the Frontend</span>
`LaminarFlow-Backend/README.md:1-2`
the title never said which half of the split this repo is

```diff
-# LaminarFlow
-Linear Clone with some added functionality
+# LaminarFlow — Backend
+
+The Go API, schema, and migrations for LaminarFlow, a Linear clone with some
+added functionality. The React client lives in
+[LaminarFlow-Frontend](https://github.com/Willpatbarr/LaminarFlow-Frontend).
```

- **Why:**
  - **B** — ticket step 3: each README states its role and points to the other repo
  - **C** — lines 14-16 already describe the bundle handoff, so they need no edit

---

## Step 5 — Point the image build at the current frontend branch

### <span style="color:#D98C3B">5.1 · EDIT — Bump `FRONTEND_REF` to `E-LAM-0002-F`</span>
`LaminarFlow-Backend/.github/workflows/ci.yml:59-61`
`E-LAM-0001-F` stops receiving frontend work the moment Step 1.2 lands

```diff
     env:
       # The frontend repo supplies the bundle through a BuildKit named context.
-      # E-LAM-0001-F rather than main because main is still the initial commit
-      # and has no package.json. Change this to main once the epic lands.
-      FRONTEND_REF: E-LAM-0001-F
+      # An epic branch rather than main: main is still the initial commit and
+      # has no package.json. Bump this when a new epic branch opens.
+      FRONTEND_REF: E-LAM-0002-F
```

- **Why:**
  - **C** — left alone, the image job builds a frontend that no longer moves,
    so a broken bundle passes CI
- **Where:**
  - the `env:` block on the `image` job, not the `check` job

---

## Step 6 — Push and verify

### <span style="color:#A16BD9">6.1 · RUN — Verify the Frontend Locally</span>
proves the README's commands are the real ones before publishing them

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend
npm ci && npm run lint && npm run build
```

### <span style="color:#A16BD9">6.2 · RUN — Push Both Ticket Branches</span>
`LAM-6-F` first — Step 5.1 fails CI until `E-LAM-0002-F` exists on origin

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend && git push -u origin LAM-6-F
cd ~/Developer/LaminarFlow/LaminarFlow-Backend && git push -u origin LAM-6-B
```

### <span style="color:#A16BD9">6.3 · RUN — Watch the Backend Run</span>
the `image` job is the one Step 5.1 touched — confirm it resolves the new ref

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend
gh run watch
```

### <span style="color:#A16BD9">6.4 · RUN — Switch the `gh` Account Back</span>
LaminarFlow is the only thing that pushes as `Willpatbarr`

```bash
gh auth switch --user willbarr_church
```
