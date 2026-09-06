# <span style="color:#2AB8C9">LAM-40 — Stand Up the Frontend Test Harness</span>

## Notes

Give `LaminarFlow-Frontend` a test runner before LAM-9 lands a component library
in a repo that has none. Vitest and React Testing Library, one `test` script,
one real test against `App`, a CI step, and a README line saying so.

[LAM-40](https://linear.app/willieworkspace/issue/LAM-40/stand-up-the-frontend-test-harness)
lists five things; all five are in scope and none of them are done:

| Ticket step | Where |
| --- | --- |
| 1. Add Vitest and React Testing Library | Steps 1 and 2 |
| 2. Add a `test` script, passing on a clean checkout | Step 3, verified in 7.1 |
| 3. Write one real test against an existing component | Step 4 |
| 4. Add the test step to `.github/workflows/ci.yml` | Step 5 |
| 5. Note in the README that `npm test` is part of the checks | Step 6 |

**Frontend only, but the backend still needs Step 0.**
[PR #13](https://github.com/Willpatbarr/LaminarFlow-Backend/pull/13) (`LAM-8-B` →
`E-LAM-0002-B`) is open. Step 0.1 lands it so the backend epic is current;
Step 0.2 cuts `LAM-40-F` from `E-LAM-0002-F` and is where the work happens.

Versions resolved on 2026-09-05, all compatible with the repo's Vite 8 and
React 19.2: `vitest` 5.0.0 (peer `vite ^8.0.0`), `@testing-library/react` 16.3.3
(peer `react ^19`), `@testing-library/jest-dom` 7.0.1, `jsdom` 30.0.1,
`@testing-library/user-event` 14.6.7. Step 1 installs them unpinned so the
lockfile records what actually resolved.

Out of scope, flagged rather than fixed:

- **No Playwright, no end-to-end tests.** The Testing Strategy (E-LAM-0000, §3
  and §4) asks for the tool picked and one or two basic tests early, which is
  its own ticket — nothing in this repo can be driven end to end until LAM-9
  builds a page worth driving. Worth filing before LAM-9 closes.
- **No real-backend integration test.** Testing Strategy §2 chose a real Go
  backend against a disposable database for the optimistic-write reconciliation
  flow. That flow does not exist yet; this harness is the layer underneath it.
- **`App` is the only component that exists**, so it is the one Step 4 tests.
  Its counter button is the only interactive element in the repo, which makes it
  the only thing that can prove events and state work under jsdom.
- **Two README defects from LAM-6 get fixed in passing** (Step 6). Two `##`
  headings are indented four spaces, so they render as a code block rather than
  headings, and fifteen lines of Vite template outlived the section that owned
  them. Step 6 is already editing that file for ticket step 5.

---

## Outline

<small>

- Step 0 — Land LAM-8 and open `LAM-40-F`
- Step 1 — Install the harness
- Step 2 — Point Vitest at jsdom
- Step 3 — Add the `test` script
- Step 4 — Write the first real test
- Step 5 — Add the test step to CI
- Step 6 — Say so in the README
- Step 7 — Verify and open the PR

</small>

---

## Step 0 — Land LAM-8 and open `LAM-40-F`

### <span style="color:#A16BD9">0.1 · RUN — Merge PR #13 and Refresh the Backend Epic</span>
the backend gets no branch this ticket — this block only lands LAM-8 and stops

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend &&
gh auth switch --user Willpatbarr &&
gh pr checks 13 --watch &&
gh pr merge 13 --merge &&
git fetch origin &&
git checkout E-LAM-0002-B &&
git merge --ff-only origin/E-LAM-0002-B
```

### <span style="color:#A16BD9">0.2 · RUN — Cut `LAM-40-F` and Prove the Checkout</span>
the frontend has no open PRs, so the epic branch only needs fetching

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
git fetch origin &&
git checkout E-LAM-0002-F &&
git merge --ff-only origin/E-LAM-0002-F &&
git checkout -b LAM-40-F &&
git push -u origin LAM-40-F &&
npm ci &&
npm run lint &&
npm run build
```

- `E-LAM-0002-F` is ahead of `main` — it carries LAM-6's README rewrite, which
  Step 6 edits, so cutting from `main` would put the work on the wrong base
- no `nvm use` in the chain: `nvm` is a shell function that a pasted block
  cannot count on. Run it first if `node -v` is not 26
- `npm run lint && npm run build` green here is the start-line check: anything
  red after Step 1 belongs to the harness

---

## Step 1 — Install the harness

### <span style="color:#A16BD9">1.1 · RUN — Install Six Dev Dependencies</span>
unpinned, so the lockfile records what resolved rather than what was guessed

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
npm i -D vitest jsdom \
  @testing-library/react @testing-library/dom \
  @testing-library/jest-dom @testing-library/user-event
```

- `@testing-library/dom` is listed explicitly: React Testing Library has
  declared it a peer dependency since v16 rather than bundling it
- `jsdom` is the browser stand-in Vitest runs the components in — without it,
  `render` has no `document` to mount into
- `@testing-library/jest-dom` is the matcher set (`toBeInTheDocument` and
  friends); `user-event` drives clicks the way a browser does
- none of the six trips `scripts/check-no-db-driver.mjs`, which substring-matches
  database driver names against every dependency field

---

## Step 2 — Point Vitest at jsdom

### <span style="color:#D98C3B">2.1 · EDIT — Import `defineConfig` from `vitest/config`</span>
`vite.config.ts:2`
same function, but typed with the `test` key Vitest reads

```diff
 import react from '@vitejs/plugin-react'
-import { defineConfig } from 'vite'
+import { defineConfig } from 'vitest/config'
```

- **Why:**
  - **C** — Vite's own `defineConfig` rejects `test` as an unknown key, and
    `tsc -b` fails the build before Vitest ever runs
  - **B** — ticket step 1: Vitest reusing `vite.config.ts` is the reason it is
    the pick over a runner that needs a second build config

### <span style="color:#3DAF62">2.2 · ADD — Add the `test` Block</span>
`vite.config.ts:25`
last key in `defineConfig`, after the `server` block

```diff
 export default defineConfig({
   ...
+
+  test: {
+    environment: 'jsdom',
+    setupFiles: ['./src/setupTests.ts'],
+  },
 })
```

- `globals` stays off — tests import `describe`, `it`, and `expect` by name, so
  nothing depends on a `types` entry in `tsconfig.app.json`

### <span style="color:#2AB8C9">2.3 · NEW — Add `src/setupTests.ts`</span>
`LaminarFlow-Frontend/src/setupTests.ts (new)`
the whole file: matchers in, rendered components out, once per test

```ts
// Runs before every test file: registers the DOM matchers and guarantees each
// test starts against an empty document.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only registers its own cleanup when Vitest globals are on.
// They are off here, so unmounting is manual - without this, the second render
// in a file finds two copies of the component and every query throws.
afterEach(cleanup)
```

- `src/` is what `tsconfig.app.json` compiles, so this file is type-checked by
  `npm run build` like any other

---

## Step 3 — Add the `test` script

### <span style="color:#D98C3B">3.1 · EDIT — Add `test` and `test:watch`</span>
`package.json:9-10`
in `scripts`, directly after `lint`

```diff
   "scripts": {
     ...
     "lint": "oxlint && npm run check:boundary",
+    "test": "vitest run",
+    "test:watch": "vitest",
     "preview": "vite preview",
     ...
   },
```

- **What:**
  - `vitest run` executes once and exits; a bare `vitest` watches, which would
    hang the CI job added in Step 5 rather than failing it
- **Why:**
  - **B** — ticket step 2 asks for a `test` script that passes on a clean
    checkout, which means it has to terminate

---

## Step 4 — Write the first real test

<span style="color:#2E93DB">NEW GUIDED</span>

**Example** — `src/App.tsx:24-30`
the counter button under test — `Count is {count}` is its accessible name

`LaminarFlow-Frontend/src/App.test.tsx (new)`

### <span style="color:#2E93DB">4.1 — Import the Runner and the Component</span>
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'
```

### <span style="color:#2E93DB">4.2 — Assert the Heading Renders</span>
```tsx
describe('App', () => {
  it('renders the page heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'Get started' }),
    ).toBeInTheDocument()
  })
})
```

- querying by role and name rather than by class is the convention worth setting
  now: it is the same thing a screen reader looks for

### <span style="color:#2E93DB">4.3 — Assert the Counter Counts</span>
```tsx
describe('App', () => {
  ...  
  it('counts up when the counter is clicked', async () => {
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: /count is 0/i }))

    expect(
      screen.getByRole('button', { name: /count is 1/i }),
    ).toBeInTheDocument()
  })
})
```

- this is the assertion that proves the harness rather than the component: a
  passing click means jsdom, the React JSX transform, state, and re-render all
  work under Vitest
- `userEvent.click` is async because it dispatches the same event sequence a
  browser does — the `await` is not optional

---

## Step 5 — Add the test step to CI

### <span style="color:#3DAF62">5.1 · ADD — Run `npm test` Between Lint and Build</span>
`.github/workflows/ci.yml:24`
after `npm run lint`, before `npm run build`

```diff
     steps:
       ...
       - run: npm run lint
 
+      - run: npm test
+
       - run: npm run build
```

- **Why:**
  - **B** — ticket step 4; a harness CI does not run is a harness that rots
  - **C** — cheapest checks first: lint fails in seconds, tests in a few more,
    and the type-checking build is the slowest of the three

---

## Step 6 — Say so in the README

### <span style="color:#D98C3B">6.1 · EDIT — Unindent the Two Buried Headings</span>
`README.md:27, 35`
four leading spaces make markdown read a heading as a code block

```diff
-    ## Checks
+## Checks
```

- the same edit at `:35` for `## This repo never talks to Postgres`
- **Why:**
  - **C** — 6.2 adds a line to the `Checks` section; leaving the section inside
    a code block would render the new line as code too

### <span style="color:#D98C3B">6.2 · EDIT — Add `npm test` to the Check List</span>
`README.md:32-33`
the command list under `## Checks`, in the order CI runs them

```diff
 ## Checks
 
     npm run lint
+    npm test
     npm run build
```

- **Why:**
  - **B** — ticket step 5. LAM-6 wrote this list deliberately without `npm test`
    and said so in its own step 2.3; this ticket is what makes the line true

### <span style="color:#D98C3B">6.3 · EDIT — Delete the Orphaned Template Block</span>
`README.md:43-58`
a JSON block and a link left behind when LAM-6 deleted their heading

````diff
 To see this repo's build served by the backend the way production does it, run
 `./scripts/build-frontend.sh` in the backend repo.
-
-```json
-{
-  "$schema": "./node_modules/oxlint/configuration_schema.json",
-  "plugins": ["react", "typescript", "oxc"],
-  ...
-}
-```
-
-See the [Oxlint rules documentation](https://oxc.rs/...) for the full list.
````

- the deletion runs to `:58`, the end of the file — `.oxlintrc.json` is the live
  config and needs no copy in prose

---

## Step 7 — Verify and open the PR

### <span style="color:#A16BD9">7.1 · RUN — Run the Tests Alone</span>
the narrow check first, so a harness fault is not read as a lint fault

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
npm test
```

- expected: one test file, two passing tests, and the process exits on its own

### <span style="color:#A16BD9">7.2 · RUN — Run the Whole Check Set</span>
exactly what CI runs after Step 5, in the same order

```bash
npm run lint &&
npm test &&
npm run build
```

- `npm run build` is the one that proves `setupTests.ts` and `App.test.tsx`
  type-check, since `tsc -b` compiles everything under `src/`

### <span style="color:#A16BD9">7.3 · RUN — Prove It From a Clean Checkout</span>
ticket step 2 says the script passes on a clean checkout, so check that claim

```bash
rm -rf node_modules &&
npm ci &&
npm test
```

- `npm ci` installs strictly from `package-lock.json`, so a dependency that only
  works because it is still sitting in `node_modules` fails here

### <span style="color:#A16BD9">7.4 · RUN — Commit, Push, and Open the PR</span>
base is the frontend epic branch

```bash
git add -A &&
git commit -m "LAM-40 - stand up the frontend test harness" &&
git push &&
gh pr create --base E-LAM-0002-F --fill &&
gh pr checks --watch
```

### <span style="color:#A16BD9">7.5 · RUN — Switch the `gh` Account Back</span>
LaminarFlow is the only thing that pushes as `Willpatbarr`

```bash
gh auth switch --user willbarr_church
```
