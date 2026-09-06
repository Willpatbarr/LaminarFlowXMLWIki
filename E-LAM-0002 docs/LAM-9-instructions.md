# <span style="color:#2AB8C9">LAM-9 — Scaffold the React Frontend with Feature Folders and a Shared Component Library</span>

## Notes

Give `src/` the shape every later frontend ticket builds into: a routes layer, a
feature folder per domain, and a shared component library — plus the router that
the routes layer cannot exist without, and the Playwright scaffolding added to
the ticket today.

[LAM-9](https://linear.app/willieworkspace/issue/LAM-9/scaffold-the-react-frontend-repo-with-feature-based-folders-shared)
now lists six steps, none of them done:

| Ticket step | Where |
| --- | --- |
| 1. A `features/` directory, one folder per domain feature | Step 4 |
| 2. A shared components folder, with the rule of thumb in its README | Step 3 |
| 3. A thin `pages/`-or-`routes/` layer mapping URLs to screens | Step 5 |
| 4. One placeholder feature and one shared component | Steps 3 and 4 |
| 5. Flag that React does not enforce the boundaries | Step 8 |
| 6. Thin Playwright scaffolding, added 2026-09-05 | Step 7 |

**The router is already chosen — it is not an open decision.** The ticket says
picking one is part of the work, but Library Research (E-LAM-0000, 2026-09-02)
settled it: **TanStack Router** over React Router, because `validateSearch` and
`stringifySearchWith` make the nested filter tree typed, validated, URL-
serialized state, and saved views *are* search-param state. Step 1 installs it.

**Precondition — LAM-40 is not merged.**
[PR #6](https://github.com/Willpatbarr/LaminarFlow-Frontend/pull/6) is open with
green checks. Step 0 lands it and cuts `LAM-9-F` from the epic. The backend has
nothing open and gets no branch this ticket.

Out of scope, flagged rather than fixed:

- **No Base UI, no Tailwind, no design system.** Library Research picks
  `@base-ui/react` plus Tailwind, with shadcn used as a scaffold rather than a
  dependency, and calls out that Radix has no Combobox. That is a real ticket and
  should be filed before feature UI starts; this ticket writes one plain
  `Button` whose only job is to prove where shared components live.
- **`Button` ships a class name and no CSS.** Styling belongs with the design
  system decision above, so the component exposes a `button` hook and stops
  there.
- **No lint rule enforcing the import direction.** Ticket step 5 asks for the
  gap to be flagged, not closed — Step 8 writes it into the README.
- **Playwright's `webServer` boots `npm run dev`, not the Go binary.** Library
  Research describes the Go-binary shape, which is right once a route reads real
  API data. Nothing does yet, and cross-repo CI is its own job. The upgrade point
  is LAM-7's first real endpoint.
- **One leftover from LAM-40 gets fixed in passing.** `README.md:36` still has
  `## This repo never talks to Postgres` indented four spaces, so it renders as a
  code block. Step 8 is already editing that file.

---

## Outline

<small>

- Step 0 — Land LAM-40 and open `LAM-9-F`
- Step 1 — Install the router and Playwright
- Step 2 — Wire the router plugin into the build
- Step 3 — Create the shared component library
- Step 4 — Create the first feature folder
- Step 5 — Create the routes layer
- Step 6 — Delete the Vite demo page
- Step 7 — Scaffold the end-to-end smoke test
- Step 8 — Write down the boundary rules
- Step 9 — Verify and open the PR

</small>

---

## Step 0 — Land LAM-40 and open `LAM-9-F`

### <span style="color:#A16BD9">0.1 · RUN — Merge PR #6 and Cut the Branch</span>
one block: account, checks, merge, epic, branch, install, start-line check

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
gh auth switch --user Willpatbarr &&
gh pr checks 6 --watch &&
gh pr merge 6 --merge &&
git fetch origin &&
git checkout E-LAM-0002-F &&
git merge --ff-only origin/E-LAM-0002-F &&
git checkout -b LAM-9-F &&
git push -u origin LAM-9-F &&
npm ci &&
npm run lint && npm test && npm run build
```

- the backend needs nothing: PR #13 merged, `E-LAM-0002-B` is current, and no
  file in `LaminarFlow-Backend` changes this ticket

---

## Step 1 — Install the router and Playwright

### <span style="color:#A16BD9">1.1 · RUN — Install Three Packages and One Browser</span>
resolved 2026-09-05: router 1.170.32, plugin 1.168.35, Playwright 1.63.0

```bash
npm i @tanstack/react-router &&
npm i -D @tanstack/router-plugin @playwright/test &&
npx playwright install chromium
```

- `@tanstack/react-router` is a runtime dependency; the plugin and the test
  runner are dev-only
- `npx playwright install chromium` downloads a browser build (~150 MB) into a
  shared cache outside the repo — it is not a package and not in the lockfile
- Chromium only. Firefox and WebKit are a later decision, and each one is
  another download and another CI minute

---

## Step 2 — Wire the router plugin into the build

### <span style="color:#D98C3B">2.1 · EDIT — Import the Plugin and `fileURLToPath`</span>
`vite.config.ts:1-2`
above the existing imports

```diff
+import { fileURLToPath } from 'node:url'
+
+import { tanstackRouter } from '@tanstack/router-plugin/vite'
 import react from '@vitejs/plugin-react'
 import { defineConfig } from 'vitest/config'
```

### <span style="color:#D98C3B">2.2 · EDIT — Register the Plugin Before `react()`</span>
`vite.config.ts:16`
order is load-bearing, so it gets its own comment in the file

```diff
 export default defineConfig({
-  plugins: [react()],
+  plugins: [
+    // Must precede react(): the plugin generates the route modules that
+    // @vitejs/plugin-react then transforms.
+    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
+    react(),
+  ],
```

### <span style="color:#3DAF62">2.3 · ADD — Add the `@` Alias</span>
`vite.config.ts`
after the `plugins` array from 2.2, before `server`

```ts
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
```

- **Why:**
  - **C** — without it, a feature component reaching the shared library imports
    `../../../components/Button`, and every folder move rewrites that string
  - **B** — this ticket sets the conventions the rest of the frontend inherits,
    and an alias added later means rewriting every import in the repo

### <span style="color:#D98C3B">2.4 · EDIT — Teach TypeScript the Same Alias</span>
`tsconfig.app.json:6-7`
inside `compilerOptions`, next to the other resolution settings

```diff
     "module": "esnext",
+    "paths": { "@/*": ["./src/*"] },
     "types": ["vite/client"],
```

- Vite resolves the alias at build time and TypeScript resolves it at check
  time; both have to be told, and a mismatch shows up only as a red editor
- no `baseUrl`: the repo is on TypeScript 6.0, which errors on it as deprecated
  (TS5101). `paths` entries resolve relative to this file instead, which is why
  the pattern is `./src/*` rather than `src/*`

---

## Step 3 — Create the shared component library

### <span style="color:#2AB8C9">3.1 · NEW — Add the `Button` Component</span>
`LaminarFlow-Frontend/src/components/ui/Button.tsx (new)`
the whole file — the first and, for now, only shared component

```tsx
import type { ReactNode } from 'react'

// Domain-agnostic by construction: no ticket, document, or aspect appears in
// these props. That is the test for whether a component belongs in this folder.
type ButtonProps = {
  children: ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <button type="button" className="button" onClick={onClick}>
      {children}
    </button>
  )
}
```

- `import type` rather than `import`: `verbatimModuleSyntax` is on in
  `tsconfig.app.json`, so a value import of a type fails the build
- `type="button"` explicitly — a bare `<button>` inside a form submits it, which
  is the default that costs an afternoon later
- a class name with no stylesheet: styling waits for the design system ticket

### <span style="color:#2AB8C9">3.2 · NEW — Add `Button.test.tsx`</span>
`LaminarFlow-Frontend/src/components/ui/Button.test.tsx (new)`
the whole file — it replaces `App.test.tsx`, which Step 6 deletes

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

- the harness LAM-40 stood up stays proven across this ticket: one component
  test out, one component test in, no window where `npm test` runs nothing

### <span style="color:#2AB8C9">3.3 · NEW — Add `src/components/README.md`</span>
`LaminarFlow-Frontend/src/components/README.md (new)`
ticket step 2 asks for the rule of thumb to live here, not in the root README

```markdown
# Shared components

Domain-agnostic building blocks — buttons, modals, inputs, spinners.

**The rule of thumb.** A component belongs here if more than one feature uses
it, or if it knows nothing about the domain. It belongs in a feature folder if
it is specific to that feature: a Kanban card, a comment thread view.

Imports run one way. `features/` may import from here; nothing here may import
from `features/`. A shared component that needs a ticket type is not shared.
```

---

## Step 4 — Create the first feature folder

### <span style="color:#2AB8C9">4.1 · NEW — Add `TicketList`</span>
`LaminarFlow-Frontend/src/features/tickets/components/TicketList.tsx (new)`
the placeholder feature, proving a feature may reach into the shared library

```tsx
import { Button } from '@/components/ui/Button'

// Placeholder data until LAM-7 lands the API contract. The folder shape is the
// point of this file, not the content.
const tickets = ['Split the backend CI', 'Stand up the frontend test harness']

export function TicketList() {
  return (
    <section>
      <h1>Tickets</h1>
      <ul>
        {tickets.map((title) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
      <Button>New ticket</Button>
    </section>
  )
}
```

- `components/` under the feature, not files loose in `tickets/` — the sibling
  folders the README names next are where `api/` and state will go

### <span style="color:#2AB8C9">4.2 · NEW — Add `src/features/README.md`</span>
`LaminarFlow-Frontend/src/features/README.md (new)`
what a feature folder holds, written before there are four of them

```markdown
# Features

One folder per domain feature — `tickets/`, `documents/`, `aspects/`,
`comments/` — each holding everything that feature needs:

    tickets/
      components/   the feature's own UI
      api/          its calls to the backend
      state/        local state that only this feature cares about

A feature imports from `@/components`. It does not import from another feature:
if two features need the same thing, that thing is shared and moves.
```

---

## Step 5 — Create the routes layer

### <span style="color:#2AB8C9">5.1 · NEW — Add the Root Route</span>
`LaminarFlow-Frontend/src/routes/__root.tsx (new)`
the shell every route renders inside — `__root` is the plugin's reserved name

```tsx
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({ component: RootLayout })

function RootLayout() {
  return (
    <>
      <nav>
        <Link to="/">LaminarFlow</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  )
}
```

- `<Outlet />` is where the matched route renders; everything around it is on
  every screen

### <span style="color:#2AB8C9">5.2 · NEW — Add the `/` Route</span>
`LaminarFlow-Frontend/src/routes/index.tsx (new)`
`index.tsx` maps to `/`; the file path is the URL

```tsx
import { createFileRoute } from '@tanstack/react-router'

import { TicketList } from '@/features/tickets/components/TicketList'

export const Route = createFileRoute('/')({ component: HomePage })

// Wiring only: choose which feature components this URL shows, and lay them
// out. Logic that grows here belongs in the feature instead.
function HomePage() {
  return <TicketList />
}
```

### <span style="color:#D98C3B">5.3 · EDIT — Mount the Router in `main.tsx`</span>
`src/main.tsx:1-9`
the demo `App` goes; the router takes the whole tree

```diff
 import { StrictMode } from 'react'
 import { createRoot } from 'react-dom/client'
+import { RouterProvider, createRouter } from '@tanstack/react-router'
+
 import './index.css'
-import App from './App.tsx'
+import { routeTree } from './routeTree.gen'
+
+const router = createRouter({ routeTree })
+
+// Registers the route tree with the library's types, which is what makes
+// <Link to="/nope"> a compile error instead of a 404 at runtime.
+declare module '@tanstack/react-router' {
+  interface Register {
+    router: typeof router
+  }
+}
 
 createRoot(document.getElementById('root')!).render(
   <StrictMode>
-    <App />
+    <RouterProvider router={router} />
   </StrictMode>,
 )
```

### <span style="color:#A16BD9">5.4 · RUN — Generate `routeTree.gen.ts`</span>
the plugin writes it on dev-server start, so start one and stop it

```bash
npm run dev
```

- stop with Ctrl-C once Vite prints the local URL; `src/routeTree.gen.ts` now
  exists and **must be committed** — `npm run build` runs `tsc -b` before Vite,
  so a missing generated file fails the build before the plugin can write it
- this is also the first look at the new page: nav, `Tickets` heading, two list
  items, one button

---

## Step 6 — Delete the Vite demo page

### <span style="color:#A16BD9">6.1 · RUN — Remove the Template Files</span>
nothing imports them once 5.3 lands, and `git rm` keeps the deletion in history

```bash
git rm src/App.tsx src/App.css src/App.test.tsx &&
git rm -r src/assets &&
git rm public/icons.svg
```

- `public/favicon.svg` stays — `index.html` still references it
- `src/index.css` stays too: it is the global stylesheet with the colour and
  type variables, not demo-page layout

---

## Step 7 — Scaffold the end-to-end smoke test

### <span style="color:#2AB8C9">7.1 · NEW — Add `playwright.config.ts`</span>
`LaminarFlow-Frontend/playwright.config.ts (new)`
the whole file: one browser, one directory, a server it starts itself

```ts
import { defineConfig, devices } from '@playwright/test'

// Thin on purpose (Testing Strategy §4): the plumbing exists so a feature can
// add a browser test beside itself, not because broad coverage is wanted now.
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

- `webServer` means `npm run test:e2e` needs nothing running first — Playwright
  starts Vite, waits for the URL to answer, and shuts it down afterwards
- `reuseExistingServer` attaches to a dev server you already have open locally,
  and never does so in CI

### <span style="color:#2AB8C9">7.2 · NEW — Add the Smoke Test</span>
`LaminarFlow-Frontend/e2e/app.spec.ts (new)`
one test: the app boots, the shell renders, the route resolves

```ts
import { expect, test } from '@playwright/test'

test('the shell renders and / resolves to the tickets screen', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('link', { name: 'LaminarFlow' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Tickets' })).toBeVisible()
})
```

- asserting both proves the two halves separately: the root layout rendered, and
  the router matched `/` rather than falling through

### <span style="color:#D98C3B">7.3 · EDIT — Keep Vitest Out of `e2e/`</span>
`vite.config.ts`
inside the `test` block LAM-40 added, after `setupFiles`

```diff
   test: {
     environment: 'jsdom',
     setupFiles: ['./src/setupTests.ts'],
+    // Vitest's default glob also matches e2e/*.spec.ts. Without this it tries
+    // to run the Playwright specs under jsdom, where `page` does not exist.
+    include: ['src/**/*.test.{ts,tsx}'],
   },
```

### <span style="color:#D98C3B">7.4 · EDIT — Add the `test:e2e` Script</span>
`package.json:12`
after `test:watch`, keeping the test scripts together

```diff
     "test:watch": "vitest",
+    "test:e2e": "playwright test",
     "preview": "vite preview",
```

### <span style="color:#D98C3B">7.5 · EDIT — Type-Check the Playwright Files</span>
`tsconfig.node.json:22`
`tsconfig.app.json` covers `src` only, so these are unchecked without this

```diff
-  "include": ["vite.config.ts"]
+  "include": ["vite.config.ts", "playwright.config.ts", "e2e"]
```

### <span style="color:#D98C3B">7.6 · EDIT — Ignore Playwright's Output</span>
`.gitignore:12`
after `dist-ssr`, with the other build artifacts

```diff
 dist
 dist-ssr
+test-results
+playwright-report
 *.local
```

### <span style="color:#3DAF62">7.7 · ADD — Add the `e2e` CI Job</span>
`.github/workflows/ci.yml:28`
a second job, so the browser download never slows the fast checks

```yaml
  e2e:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: npm

      - run: npm ci

      # --with-deps pulls the system libraries the browser needs on a bare
      # runner; the config's webServer starts Vite itself.
      - run: npx playwright install --with-deps chromium

      - run: npm run test:e2e
```

- **Why:**
  - **B** — ticket step 6 asks for a CI job, not just a local script
  - **C** — separate job, not another step in `check`: a browser download and a
    dev-server boot have no business delaying a lint failure

---

## Step 8 — Write down the boundary rules

### <span style="color:#D98C3B">8.1 · EDIT — Unindent the Buried Heading</span>
`README.md:36`
LAM-40 step 6.1 caught the twin at `:27` and missed this one

```diff
-    ## This repo never talks to Postgres
+## This repo never talks to Postgres
```

### <span style="color:#D98C3B">8.2 · EDIT — Add `npm run test:e2e` to the Check List</span>
`README.md:32-34`
the list under `## Checks`, which now has a fourth entry

```diff
     npm run lint
     npm test
+    npm run test:e2e
     npm run build
```

### <span style="color:#3DAF62">8.3 · ADD — Add a `Where components live` Section</span>
`README.md`
after the `## Checks` block, before `## This repo never talks to Postgres`

```markdown
## Where components live

| Path | What belongs there |
| --- | --- |
| `src/routes/` | One file per URL. Thin — imports feature components, lays them out. |
| `src/features/<name>/` | One domain feature: its components, API calls, and state. |
| `src/components/ui/` | Domain-agnostic UI blocks used by more than one feature. |
| `e2e/` | Playwright specs — one per user-visible flow, not per component. |
```

### <span style="color:#3DAF62">8.4 · ADD — Say That Nothing Enforces It</span>
`README.md`
directly under the table from 8.3 — ticket step 5 is this paragraph

```markdown
Imports run one way — `routes/` → `features/` → `components/` — and **nothing
enforces it**. React has no compile-time module boundary the way Gradle modules
do in Kotlin, so a cross-feature import compiles happily. If that starts
happening, an import lint rule is the fix; there is deliberately none today.
```

---

## Step 9 — Verify and open the PR

### <span style="color:#A16BD9">9.1 · RUN — Run the Fast Checks</span>
lint, component tests, and the type-checking build

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Frontend &&
npm run lint && npm test && npm run build
```

- expected: one test file, one passing test, and a build that emits `dist/`
- if oxlint flags the generated `src/routeTree.gen.ts`, add
  `"ignorePatterns": ["src/routeTree.gen.ts"]` to `.oxlintrc.json` rather than
  editing a file the plugin rewrites

### <span style="color:#A16BD9">9.2 · RUN — Run the Browser Test</span>
Playwright starts and stops its own dev server, so run it from a clean shell

```bash
npm run test:e2e
```

- expected: `1 passed`. A failure here with 9.1 green means routing, not
  components — the mount in 5.3 or the generated tree from 5.4

### <span style="color:#A16BD9">9.3 · RUN — Commit, Push, and Open the PR</span>
`src/routeTree.gen.ts` is generated but tracked — check it is in the commit

```bash
git add -A &&
git status --short &&
git commit -m "LAM-9 - scaffold feature folders, shared components, and routing" &&
git push &&
gh pr create --base E-LAM-0002-F --fill &&
gh pr checks --watch
```
- `gh pr checks` now watches two jobs; the `e2e` one is new and slower

```bash
git push &&
gh pr create --base E-LAM-0002-F --fill &&
gh pr checks --watch
```
- if already committed

### <span style="color:#A16BD9">9.4 · RUN — Switch the `gh` Account Back</span>
LaminarFlow is the only thing that pushes as `Willpatbarr`

```bash
gh auth switch --user willbarr_church
```
