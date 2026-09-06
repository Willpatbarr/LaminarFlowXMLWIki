# <span style="color:#2AB8C9">LAM-6 — Split Into Separate Frontend and Backend Repos</span>

## Notes

Finish the two-repo split: give each repo a README that states its role and
points at the other, and point the backend's image build at `main` instead of a
per-epic branch pin.

[LAM-6](https://linear.app/willieworkspace/issue/LAM-6/split-into-separate-frontend-and-backend-repos)
asks for three things. Two are already done. The ticket's own status note claimed
otherwise until 2026-09-05, when the E-LAM-0002 audit corrected it — the note had
predated both LAM-38 and LAM-29:

| Ticket step | State |
| --- | --- |
| 1. Two separate repos | **Done** under E-LAM-0001 — separate `.git`, separate remotes |
| 2. Independent CI in each | **Done** — `.github/workflows/ci.yml` exists in both |
| 3. A README in each stating its role | **Both partial — neither links the other** |

Both READMEs already state their role: the backend's since LAM-4, the frontend's
since LAM-28 rewrote it. What neither does is **link the other repo** — the half
of ticket step 3 that is actually outstanding. The frontend also still carries
three sections of leftover Vite template.

**Precondition — do this first.** Land `E-LAM-0001-B` and `E-LAM-0001-F` on
`main` in their repos. Every step below assumes `main` carries the real work:
Step 1 cuts the E-LAM-0002 branches from it, and Step 5 points the image build
at it.

Out of scope, flagged rather than fixed:

- **The backend `image` CI job checks out the frontend repo, on every commit.**
  The `check` job is already independent — `scripts/test.sh` never touches the
  frontend. The coupling is in the workflow's *trigger*, not the architecture.
  [LAM-41](https://linear.app/willieworkspace/issue/LAM-41/split-the-backend-ci-so-day-to-day-pushes-dont-build-the-frontend)
  moves the image build to tags and `workflow_dispatch`, and turns
  `FRONTEND_REF` into a dispatch input. ADR-2 is unaffected.
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
- Step 2 — Finish the frontend README
- Step 3 — Delete the placeholder `readme.txt`
- Step 4 — Name the backend and link the frontend
- Step 5 — Point the image build at `main`
- Step 6 — Push and verify

</small>

---

## Step 1 — Open the E-LAM-0002 branches

Neither repo has an `E-LAM-0002` branch yet. Both epic branches cut from `main`,
which now carries E-LAM-0001. Each ticket branch then cuts from its epic.

### <span style="color:#A16BD9">1.1 · RUN — Switch the `gh` Account</span>
LaminarFlow pushes as `Willpatbarr`, not the work account

```bash
gh auth switch --user Willpatbarr
```

### <span style="color:#A16BD9">1.2 · RUN — Cut the Frontend Branches</span>
`LaminarFlow-Frontend` — epic off `main`, then the ticket off the epic

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend
git checkout main && git pull
git checkout -b E-LAM-0002-F && git push -u origin E-LAM-0002-F
git checkout -b LAM-6-F
```

### <span style="color:#A16BD9">1.3 · RUN — Cut the Backend Branches</span>
`LaminarFlow-Backend` — same shape, `-B` suffix

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend
git checkout main && git pull
git checkout -b E-LAM-0002-B && git push -u origin E-LAM-0002-B
git checkout -b LAM-6-B
```

---

## Step 2 — Finish the frontend README

`LaminarFlow-Frontend/README.md`

LAM-28 already wrote the title, the role line, and a `Same-origin deployment`
section. Three sections are missing, and three sections of Vite template remain.

### <span style="color:#D98C3B">2.1 · EDIT — Link the Backend Repo</span>
`README.md:3`
the one thing ticket step 3 literally requires, and the only part absent

```diff
 # LaminarFlow — Frontend
 
 React + TypeScript + Vite. Built with `npm run build` into `dist/`.
+
+The Go API, schema, and migrations live in
+[LaminarFlow-Backend](https://github.com/Willpatbarr/LaminarFlow-Backend).
```

### <span style="color:#3DAF62">2.2 · ADD — Add the `Running it` Section</span>
`README.md:18`
after `Same-origin deployment`, before the template sections 2.5 removes

```markdown
## Running it

Node is pinned in [.nvmrc](.nvmrc) — `nvm use` picks it up, and CI reads the
same file, so local and CI cannot drift.

    npm ci
    npm run dev
```

### <span style="color:#3DAF62">2.3 · ADD — Add the `Checks` Section</span>
`README.md:18`
directly after 2.2

```markdown
## Checks

`npm run build` type-checks with `tsc -b` before Vite emits the bundle, so a
type error fails the build rather than shipping.

    npm run lint
    npm run build
```
- `npm test` is deliberately absent — LAM-40 adds both the script and that line

### <span style="color:#3DAF62">2.4 · ADD — Add the Postgres Boundary Section</span>
`README.md:18`
directly after 2.3

```markdown
## This repo never talks to Postgres

[scripts/check-no-db-driver.mjs](scripts/check-no-db-driver.mjs) fails
`npm run lint` if a database driver reaches the dependency tree. Every read and
write goes through the backend's HTTP API.
```
- the boundary LAM-39 added — worth stating, because nothing in the code says it

### <span style="color:#D98C3B">2.5 · EDIT — Delete the Three Template Sections</span>
`README.md:19-50`
`## Template notes` to end of file, inherited from the Vite scaffold

```diff
-## Template notes
-
-Inherited from the Vite React+TS template, kept for reference.
-...
-## React Compiler
-...
-## Expanding the Oxlint configuration
-...
```

- **Why:**
  - **C** — plugin comparisons and Oxlint setup advice describe the template, not
    this repo; `.oxlintrc.json` is the live config and already exists

---

## Step 3 — Delete the placeholder `readme.txt`

### <span style="color:#A16BD9">3.1 · RUN — Remove `readme.txt`</span>
`LaminarFlow-Frontend/readme.txt`
tracked one-line placeholder from the initial commit, superseded by Step 2

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend
git rm readme.txt
```

- `readme.txt` reaches `main` with the epic; this removes it on the ticket branch

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

## Step 5 — Point the image build at `main`

### <span style="color:#D98C3B">5.1 · EDIT — Set `FRONTEND_REF` to `main`</span>
`LaminarFlow-Backend/.github/workflows/ci.yml:59-61`
the branch pin existed only because `main` was empty

```diff
     env:
       # The frontend repo supplies the bundle through a BuildKit named context.
-      # E-LAM-0001-F rather than main because main is still the initial commit
-      # and has no package.json. Change this to main once the epic lands.
-      FRONTEND_REF: E-LAM-0001-F
+      # main, now that E-LAM-0001 has landed there. The image job builds the
+      # backend under test against the last frontend that shipped.
+      FRONTEND_REF: main
```

- **Why:**
  - **C** — a branch pin goes stale every epic; `main` does not
- **Where:**
  - the `env:` block on the `image` job, not the `check` job

**This is what the original comment asked for** — "Change this to main once the
epic lands." LAM-41 later replaces the constant entirely with a
`workflow_dispatch` input, so a release can pin an exact frontend version.

---

## Step 6 — Push and verify

### <span style="color:#A16BD9">6.1 · RUN — Verify the Frontend Locally</span>
proves the README's commands are the real ones before publishing them

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend
npm ci && npm run lint && npm run build
```

### <span style="color:#A16BD9">6.2 · RUN — Push Both Ticket Branches</span>
order does not matter — Step 5.1 points at `main`, not at either ticket branch

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
