All three researchers are back. Reconciling their findings with mine — there are three overrides worth flagging, all pointing the same direction.

---

# Laminar Flow — React UI & Interaction Layer

**All data verified 2026-09-02** against the npm registry API, GitHub API, caniuse, and official docs. Nothing below is from memory.

The headline: **one library choice cascades through six of your thirteen slots.** Base UI shipped 1.0 and is now the only headless library with a Combobox — and its Combobox/Autocomplete happens to ship first-party primitives for your filter chips, your command palette, *and* your per-field server errors. Picking it deletes three dependencies my sub-researchers would otherwise have recommended.

---

## RECOMMENDED STACK

```bash
# Primitives + styling  (the two decisions everything else hangs off)
npm i @base-ui/react
npm i -D tailwindcss @tailwindcss/vite

# Routing — typed search params, because saved views ARE search-param state
npm i @tanstack/react-router
npm i -D @tanstack/router-plugin

# Data: table + virtualization
npm i @tanstack/react-table @tanstack/react-virtual

# Drag & drop (Kanban + list reorder) + the ordering key strategy
npm i @atlaskit/pragmatic-drag-and-drop \
      @atlaskit/pragmatic-drag-and-drop-hitbox \
      @atlaskit/pragmatic-drag-and-drop-auto-scroll \
      @atlaskit/pragmatic-drag-and-drop-react-drop-indicator
npm i fractional-indexing        # + rocicorp/fracdex on the Go side

# Forms + schema (one Zod schema serves forms AND URL filter state)
npm i react-hook-form zod @hookform/resolvers

# Keyboard, fuzzy match, toasts, animation, icons
npm i tinykeys @leeoniya/ufuzzy sonner @formkit/auto-animate lucide-react
```

One line each:

| Package | Why |
|---|---|
| `@base-ui/react` **1.7.0** | Only headless lib with Combobox/Autocomplete; ships Chips parts, a Command Palette example, and a `Form errors` prop that maps Go field errors directly. Most active repo in the category. |
| `tailwindcss` + `@tailwindcss/vite` **4.3.3** | Zero runtime JS, Oxide engine, first-party Vite 8 plugin. Density work is per-element tuning — utilities are where that belongs. `@theme` tokens double as your skeleton/animation variables. |
| `@tanstack/react-router` **1.170.32** | `validateSearch` + `stringifySearchWith` make the nested filter tree *typed, validated, URL-serialized state*. React Router has no typed search params — you'd hand-roll the interesting half. |
| `@tanstack/react-table` **9.2.4** | v9 went stable 2026-08-04: tree-shakable features (~5 kB floor), 86% less retained heap. Grouping/filtering/sorting/column-visibility all present, headless so the density is yours. |
| `@tanstack/react-virtual` **3.14.10** | Headless virtualizer that composes with Table v9 *and* with Base UI's Combobox (which documents it for 10k-item lists). One virtualization concept, two uses. |
| `@atlaskit/pragmatic-drag-and-drop` **3.1.0** | Apache-2.0, ~4.7 kB core, commit *today*. This is what Jira and Trello ship. dnd-kit's stable line hasn't released since Dec 2024. |
| `fractional-indexing` **4.0.0** | **CC0-1.0** (public domain — zero license friction for open-core). Byte-compatible with `rocicorp/fracdex` in Go, so client and server compute identical keys. |
| `react-hook-form` **7.87.0** | `setError(field, {type, message}, {shouldFocus})` is the cleanest Go-error→field mapping available. **8 open issues** on 44.8k stars, zero runtime deps, 13.7 kB. Base UI documents the integration officially. |
| `zod` **4.5.4** | Standard Schema, so one filter-tree schema validates the URL params, the filter editor, and the API payload. `zod/mini` is a real escape hatch (4.0 kB vs 13.1 kB for an object schema). |
| `tinykeys` **4.0.0** | 0.9 kB. Genuinely revived — real 4.0 in May 2026 with `$mod`, sequence timing, input/contenteditable safety. Sequences (`"g i"`) work; you own the scope stack. |
| `@leeoniya/ufuzzy` **1.0.19** | 4.1 kB, zero deps, correct ranking for "navigate to a known item," and `info()` returns highlight ranges. Fuse.js's Bitap ranks typo-tolerant garbage above the obvious answer. |
| `sonner` **2.0.8** | Stack-collapse + swipe physics for 9.2 kB. The one slot where opinionated-and-beautiful beats headless-and-mine. |
| `@formkit/auto-animate` **0.10.0** | 3.2 kB FLIP on any container, no render changes — exactly your board/list reorder need, and it doesn't care what the server does to ordering. |
| `lucide-react` **1.39.0** | ~1,700 glyphs, ISC, 335 B gzip per icon, releases near-daily. **Requires a 10-line Vite alias** (see below) — the dev-server barrel bug is real and won't be fixed. |

### Add later, not now

| Thing | Trigger to revisit |
|---|---|
| `motion` (13.2.0, MIT) | Only when you want a **shared-element** morph across an unmount/portal boundary (board card → detail panel). That's `layoutId` and genuinely hard to hand-roll. Import from `motion/react-m` + `LazyMotion`, never `motion/react`. ~20–60 kB. |
| `date-fns@4` + `@date-fns/tz` | Only when frontend date *arithmetic* becomes load-bearing (date picker with disabled ranges, drag-to-resize sprint bars). You may get it free later — Base UI optionally peers on it. |
| `@tanstack/react-form` | If RHF's imperative model ever grates. It's stable 1.x, and its `onSubmitAsync` `{fields: {...}}` return is arguably prettier — but 186 open issues vs RHF's 8. |
| A rich-text editor | Out of scope here, but it's the thing your shortcut layer must not fire inside. Design the registry for it now. |
| `unplugin-icons` | If icon count explodes and the Vite alias stops being enough. Technically superior (zero runtime, no dev-server barrel), but costs a plugin + `@svgr/core` + magic specifiers oxlint can't see. |
| PWA / offline | Not now. |

**Never:** AG Grid Enterprise, MUI X Pro/Premium, ReUI Filters, react-querybuilder, cmdk, react-dnd, react-beautiful-dnd, Formik, Glide Data Grid, `@phosphor-icons/react`. Reasons below.

---

## The three overrides

My sub-researchers independently recommended `cmdk`, `@ariakit/react`, and (as a fallback) Radix. All three get replaced by Base UI. Here's the evidence, because these are the calls most worth disagreeing with me on.

**1. Radix has no Combobox — I enumerated it.** `radix-ui@1.6.7` re-exports **54** primitives. `combobox`: NO. `autocomplete`: NO. `date-picker`: NO. You need comboboxes for the filter builder, the command palette, assignee/label pickers, and field selectors. That's not a gap you work around; it's the center of your app. Base UI has both, plus `Combobox.Chips` / `Chip` / `ChipRemove` — literally the Linear filter-chip primitive.

**2. Base UI ships a first-party Command Palette.** The Autocomplete docs list ten examples including **"Command Palette"** (Autocomplete inside Dialog, grouped Suggestions + Commands, keyboard nav), **"Fuzzy Matching"**, **"Async Search"**, and **"Virtualized"** (10,000 items via `@tanstack/react-virtual`). Compare cmdk: `1.1.1` published **2025-03-14**, last commit 2025-10-29, 23 unmerged PRs, and issue [#410 "Project dead?"](https://github.com/pacocoursey/cmdk/issues/410) (July 2026) with **zero maintainer reply**. cmdk also drags in 4 Radix packages — so adopting it means shipping *both* primitive libraries. 17 kB and a frozen maintainer, or 0 kB extra and a first-party example.

**3. Base UI's `Form` has an `errors` prop — requirement 8 is solved by the primitive layer.** From the docs: *"Validation errors returned externally, typically after submission by a server or a form action. This should be an object where keys correspond to the `name` attribute on `<Field.Root>`."* `<Field.Error />` renders it automatically. Your Go handler returns `{title: "too_long"}`, you `setErrors(...)`, it lands at the field. Base UI *also* publishes an official React Hook Form integration guide (`Controller` + forwarding `field`/`fieldState`, `match` prop to delegate error rendering, `inputRef` for focus-invalid-field). The two compose as designed.

Net effect: **–17 kB, –1 dependency, –4 transitive Radix packages, and no library-mixing.**

---

# Per-library findings

## 1. Component primitives

### Base UI — `USE` ⭐ primary path
- https://github.com/mui/base-ui · **`@base-ui/react@1.7.0`**, published **2026-08-04** · **MIT** · 10,796 stars · last commit **2026-09-02 (today)** · 426 open issues · 11.2M weekly downloads
- **React 19 compatibility: confirmed** — peer `react: "^17 || ^18 || ^19"`.
- Bundle: 439.5 kB min / 141.6 kB gzip for the *whole barrel* — irrelevant in practice; you import `@base-ui/react/dialog` etc. Per-component it's the **smallest** of the headless set (Dialog 3.8 kB vs Radix's 4.2 kB).
- **37 components**, including everything you need: Combobox, Autocomplete, Context Menu, Menu, Menubar, Toolbar, Dialog, Drawer, Popover, Select, Tooltip, Toast, Preview Card, Navigation Menu, Scroll Area, **Field / Fieldset / Form**, OTP Field, Number Field.
- Optional peers `date-fns@^4` + `@date-fns/tz@^1.2` are marked `optional: true` in `peerDependenciesMeta` — needed only for date components. **Not forced.**
- Exposes `data-open` / `data-closed` / `data-starting-style` / `data-ending-style`, plus `keepMounted`. This is what makes the zero-JS animation strategy work.
- Built substantially by the engineers who originally built Radix. Ships **monthly** with a full-time MUI team.

🚩 **PACKAGE NAME TRAP — this will bite you.** `@base-ui-components/react` is the *old* name, frozen at **`1.0.0-rc.0` from 2025-12-04**. Searching npm surfaces it first and it looks abandoned. The live package is **`@base-ui/react`**. Two of my three researchers hit this; one flagged Base UI as "unverified" because of it.

### Radix Primitives — `CONSIDER (fallback only)`
- https://github.com/radix-ui/primitives · `radix-ui@1.6.7`, **2026-07-24** · MIT · 19,232 stars · last commit **2026-07-31** · 348 open issues
- **React 19 compatibility: confirmed** — peer includes `^19.0`.
- Bundle: 243.6 kB min / **70.1 kB gzip** (full barrel).
- Not dead — releases are still shipping. But **acquired by WorkOS and visibly slower**, and the long-requested Combobox never landed. shadcn/ui switched its default *away* from Radix in July 2026.
- Verdict: fine if you were already on it. Nothing to recommend it for greenfield over Base UI.

### React Aria Components (Adobe) — `CONSIDER (best a11y, worst weight)`
- `react-aria-components@1.21.0`, published **2026-09-01** · **Apache-2.0** · very active
- **React 19 compatibility: confirmed in practice**, though flag the peer range: `^19.0.0-rc.1` rather than `^19.0.0`. It works; the range is just stale.
- Bundle: 951.7 kB min / **267.3 kB gzip** full barrel — ~4× Radix, ~2× Base UI. Tree-shakes per component, but the floor is higher everywhere.
- Genuinely the deepest accessibility and internationalization work in the ecosystem, and its collection/table components are excellent. But it's the most verbose API, and Adobe's opinions leak into your markup. For a solo dev chasing Linear's density, that's friction you'll pay daily.

### Ark UI (Zag.js) — `CONSIDER`
- `@ark-ui/react@5.39.1`, **2026-08-28** · MIT · 45+ components · active
- **React 19 compatibility: unclear** — peer is only `react: ">=18.0.0"`, no explicit 19 statement.
- Bundle: Zag core is ~55 kB gzip + Ark ~13 kB. Heaviest reasonable option; the state-machine architecture and multi-framework support are costs you don't benefit from.

### Headless UI — `AVOID (too few components)`
- `@headlessui/react@2.2.10`, **2026-04-07** · MIT · React 19 peer **confirmed**.
- ~10 components. No context menu, no menubar, no toolbar, no toast, no tooltip. You'd fill the gaps from a second library.

### Mantine — `AVOID (opinionated kit)`
- `@mantine/core@9.6.0`, **2026-08-31** · MIT · **React 19 confirmed and required** (peer `^19.2.0`).
- Genuinely good and very actively maintained. But it's a styled kit with its own CSS layer, and Linear's density means fighting it. **Exception:** `@mantine/hooks` is independently installable with zero deps — worth knowing, though its `useHotkeys` fails your requirements (see §6).

### Chakra / MUI / HeroUI — `AVOID (all three)`
Emotion or Panda runtimes, opinionated defaults, and a density ceiling. MUI additionally pulls `@mui/material` + `@emotion/react` + `@emotion/styled` before you render anything.

### shadcn/ui — `USE — but as a starting point, not a dependency`
- https://github.com/shadcn-ui/ui · CLI `shadcn@4.20.1` published **2026-09-02** · **MIT** · **122,811 stars** · last commit today.
- **Base UI is the default since July 2026.** `-b radix` opts back into Radix.
- This is the right way to consume it: `npx shadcn@latest add dialog` drops Base-UI-backed source into *your* repo under *your* license. You get a sane starting point for 30 components and then delete their padding and rewrite their type scale for density. It's a scaffold, not a vendor.

**→ Pick: Base UI, scaffolded with the shadcn CLI.** `npm i @base-ui/react`

---

## 2. Styling

**→ Pick: Tailwind CSS v4 + the first-party Vite plugin.** `npm i -D tailwindcss @tailwindcss/vite`

- `tailwindcss@4.3.3` / `@tailwindcss/vite@4.3.3`, both **2026-07-16** · MIT. v4.3 announced **2026-05-08**.
- **Vite 8 support is confirmed and settled.** Vite 8.0.0 shipped 2026-03-12; Tailwind merged Vite 8 support the same day and released it in **4.2.2 on 2026-03-18**. The plugin's peer range is `vite: ^5.2.0 || ^6 || ^7 || ^8`. Your Vite is 8.2.2 — fine.
- **Zero runtime JS.** Nothing ships to the client but CSS. That matters more than any of the JS picks above.
- CSS-first `@theme` emits your design tokens as real custom properties — which is exactly what your `Skeleton` primitive and your `@starting-style` transitions need to read. One token source, three consumers.
- Ecosystem alignment is a real solo-dev multiplier: shadcn/ui, Base UI's examples, and Atlassian's pragmatic-DnD examples are **all** Tailwind. Every reference implementation you'll consult is copy-pasteable.
- **Honest downside:** class soup in dense components. Mitigate by dropping to plain CSS or a CSS Module for the handful of genuinely structural things — the board's column grid, the virtualized table's sticky-header layout. Don't be dogmatic; Tailwind for the 95%, real CSS for the 5% where it's actually clearer.

Rejected, briefly: **vanilla-extract** (`1.21.2`, MIT, active) — zero-runtime and type-safe, but a build-graph step per style file and a much smaller ecosystem; the TS-authoring friction is a tax you pay forever. **Panda CSS** (`1.12.0`, MIT) — heavier codegen, config sprawl, no ecosystem alignment for you. **StyleX** (`0.19.0`, MIT, last release 2026-06-16) — Meta-internal-shaped, weakest Vite story of the three. **CSS Modules alone** — perfectly viable, but you'd hand-build a design system, which is the work Tailwind is doing for you. **Plain CSS + custom properties** — no constraint system, so density drifts.

---

## 3. Drag and drop

### @atlaskit/pragmatic-drag-and-drop — `USE` ⭐
- https://github.com/atlassian/pragmatic-drag-and-drop · **`3.1.0`**, published **2026-08-29** · **Apache-2.0** (verified in the repo's `LICENSE`: "Copyright 2024 Atlassian Pty Ltd, Licensed under the Apache License, Version 2.0") · **12,750 stars** · last commit **2026-09-02 (today)**
- **React 19 compatibility: confirmed** — the core is framework-agnostic (no React peer at all); `-react-drop-indicator@4.2.0` peers `^18.2.0 || ^19.0.0`.
- Bundle: **~4.7 kB core**, plus the optional packages you actually want:

| Package | Version | Date | License |
|---|---|---|---|
| `-hitbox` | 2.2.0 | 2026-08-29 | Apache-2.0 |
| `-auto-scroll` | 3.2.0 | 2026-08-29 | Apache-2.0 |
| `-react-drop-indicator` | 4.2.0 | 2026-08-29 | Apache-2.0 |
| `-flourish` | 3.2.0 | 2026-08-29 | Apache-2.0 |

- Official **board/kanban** and **list-reorder** examples exist, in React + Tailwind. `-hitbox` gives you closest-edge detection (which slot am I dropping into), `-auto-scroll` handles board-edge scrolling, `-drop-indicator` draws the insertion line, `-flourish` does the post-drop flash. That covers requirement 1 and requirement 9 with the same library.
- Framework-agnostic by design, so it never fights React's render cycle — which is precisely what you need for optimistic drag.

🚩 **The one real caveat: touch/mobile is weak.** It's built on the native HTML5 drag-and-drop API, which is mouse-event-based and which Chrome, Firefox, and Safari all refuse to initiate from a touchscreen. Atlassian's own [discussion #93](https://github.com/atlassian/pragmatic-drag-and-drop/discussions/93) has users reporting drops failing ~90% of the time on touch and an uncomfortably long press-and-hold. **For a desktop-first Linear clone behind auth this is acceptable** — Linear's own board is desktop-first — but if mobile board drag is ever a requirement, this is the wrong library and you'll need a pointer-event-based one.

### dnd-kit — `AVOID (stable line stalled; rewrite still 0.x)`
- https://github.com/clauderic/dnd-kit · **17,594 stars** · MIT · last commit **2026-07-13**
- **`@dnd-kit/core@6.3.1` — published 2024-12-05. That's 21 months.** `@dnd-kit/sortable@10.0.0` — 2024-12-04.
- The v2 rewrite, `@dnd-kit/react`, is at **`0.5.0` (2026-06-11)** — still pre-1.0 after nearly two years, React 19 peer confirmed.
- The **docs repo was archived read-only on 2026-02-21**. [Issue #1830](https://github.com/clauderic/dnd-kit/issues/1830) ("Active Maintenance Status and Suitability for Production Use?", Nov 2025) was closed without a public roadmap answer.
- Not abandoned, but you'd be choosing between a stable version frozen for 21 months and a 0.x with archived docs. For a *stated major quality target*, that's the wrong bet.

### react-beautiful-dnd — `AVOID — officially deprecated`
- `13.1.1`, **2022-08-30**. The npm package carries an explicit **deprecation flag**: *"react-beautiful-dnd is now deprecated."* Atlassian's stated replacement is pragmatic-drag-and-drop (they even ship `-react-beautiful-dnd-migration@3.4.0` as a bridge — though note that bridge peers `react ^18.2.0` only, so it's not a React 19 path).

### @hello-pangea/dnd — `CONSIDER (only if you need rbd's API)`
- The maintained rbd fork. `18.0.1`, **2025-02-09** · Apache-2.0 · 4,016 stars · last commit **2026-02-13**.
- **React 19 compatibility: confirmed** — peer `^18.0.0 || ^19.0.0`.
- Alive but slow (~7 months since a commit, ~19 since a release). Only worth it if you specifically want rbd's declarative API.

### react-dnd — `STALE — do not adopt` (confirmed)
`16.0.1`, **2022-04-19**. Last commit **2025-07-06** — 14 months. 474 open issues, 21,633 stars of pure history.

### react-sortablejs — `STALE — do not adopt`
`6.1.4`, **2022-05-31**. Peer caps at React 16/17-era. Imperative DOM mutation fights React.

### @formkit/drag-and-drop — `CONSIDER (list reorder only)`
`0.6.1`, **2026-06-15** · MIT. Framework-agnostic and pleasant for simple sortable lists, but it has no board/multi-container model and no hitbox math. If you're already taking pragmatic DnD for the board, this is redundant.

### react-movable — `AVOID (scope)`
`3.4.1`, **2025-02-26** · MIT. Vertical-list reorder only. No board.

### Motion's drag primitives — `AVOID (wrong tool)`
`drag` on `motion.div` gives you a draggable element, not a drop-target system: no hitbox detection, no auto-scroll, no cross-container reparenting, no accessible keyboard drag. You'd rebuild pragmatic DnD badly.

### Ordering strategy — fractional indexing

**→ `fractional-indexing@4.0.0`** (published **2026-06-25**, **CC0-1.0** — public domain, the least encumbered license in this entire report) · https://github.com/rocicorp/fractional-indexing · 573 stars · last commit 2026-08-26.

**→ Go side: [`rocicorp/fracdex`](https://github.com/rocicorp/fracdex)** — CC0-1.0, byte-for-byte compatible with the JS implementation. ⚠️ Only 47 stars and last pushed **2024-12-11**. It's ~300 lines of stable, spec-defined algorithm with no dependencies and a public-domain license, so **vendor it into your repo** rather than depending on it. Low risk *because* it's small and frozen — this is the one place where "stale" is fine.

Why this matters for your optimistic drag: `generateKeyBetween(a, b)` is a pure client-side function, so on drop you compute the new sort key locally, apply it optimistically, and `PATCH` it. No network round-trip mid-drag, no server-assigned sequence to wait for, and concurrent drags by two users converge instead of colliding. Also consider **`fractional-indexing-jittered`** (`1.0.0`, 2025-01-12, CC0-1.0) if you ever hit key-length growth from repeated same-position inserts.

**Store it as `text` in Postgres with a `(view_id, sort_key)` index and sort lexicographically** — not as a float. Floats run out of precision after ~50 midpoint inserts; strings don't.

---

## 4. Table / data grid + virtualization

### TanStack Table v9 — `USE` ⭐
- https://github.com/TanStack/table · **`@tanstack/react-table@9.2.4`**, published **2026-08-28** · MIT · **28,398 stars** · last commit 2026-08-31 · 60 open issues
- **v9 went stable 2026-08-04** after two years of work. **React 19 compatibility: confirmed** (peer `react: ">=18"`).
- Features present: sorting, filtering, **grouping**, aggregation, expansion, row selection, faceting, column resizing, column pinning, pagination, plus new cell selection and cell spanning. That's requirement 2 in full.
- The v9 architecture is exactly right for you: **tree-shakable feature registration** via `useTable({features})` — a minimal table starts around **5 kB** instead of shipping everything. Shared prototypes instead of per-row method objects give **up to 86% less retained JS heap** and **79% faster core row-model processing**. For "potentially thousands of rows," that's the difference between snappy and not.
- Migration note if you consult v8 material: `useReactTable` → `useTable({features, ...})`, row models moved into `tableFeatures()` slots, some pinning/sizing/sorting APIs renamed. `useLegacyTable` + `stockFeatures` exist as an incremental path. **Table markup is unchanged.**
- Headless, so the density is entirely yours — which is the whole point.
- For server-driven data + cursor pagination: set the `manual*` flags and let Go own filtering/sorting/pagination, using Table purely for column state, visibility, and rendering. **Caveat: grouping across a cursor-paginated window is the one genuinely hard part** — group headers need server-side aggregation, since the client can't group rows it hasn't fetched. Plan for a `GET /issues?groupBy=status` response shape that returns per-group counts and per-group cursors.

### TanStack Virtual — `USE`
- `@tanstack/react-virtual@3.14.10`, **2026-08-18** · MIT · 7,093 stars · active
- **React 19 compatibility: confirmed** — peer explicitly lists `^19.0.0`.
- Headless `useVirtualizer`, dynamic measurement, and it composes cleanly with Table v9's row model. Reported as the most responsive under rapid scroll on low-end machines — relevant for a modest home server's clients.
- **Decisive tiebreaker: Base UI's Combobox docs use `@tanstack/react-virtual`** for its 10,000-item virtualized example. Same dependency serves your table *and* your comboboxes. One concept, two uses, zero extra bytes.

### react-virtuoso — `CONSIDER`
`4.18.12`, **2026-08-17** · MIT · React 19 in peers. Richest API (dynamic heights, groups, sticky headers, infinite scroll out of the box) and would genuinely be less code for a plain list. But it owns your scroll container, which is worse for a table you're styling to Linear density — and it's a second virtualization model alongside the one Base UI already documents.

### react-window — `CONSIDER` *(correcting a widespread claim)*
`2.3.0`, published **2026-07-20** · MIT · React 19 peer `^18.0.0 || ^19.0.0`.
**Several 2026 comparison articles still say react-window is "no longer actively developed" and "fixed-size only." That is out of date** — bvaughn shipped a v2 rewrite, with releases through 2.2.7 (2026-02-13) and 2.3.0 in July. It's alive. It's just narrower than TanStack Virtual and doesn't compose with Table v9 as naturally.

### AG Grid — 🚩🚩 `AVOID (the features you need are the paid ones)`
`36.1.0`, both packages **2026-08-05**.
- `ag-grid-community` — MIT
- **`ag-grid-enterprise` — license field reads literally `"Commercial"`**

**Row grouping, pivoting, aggregation, and the tool panels are Enterprise-only.** Requirement 2 explicitly needs grouping. So the free tier doesn't cover you, and the paid tier is a per-developer commercial license inside an open-core product you intend others to self-host. Dead end on licensing grounds alone, before you get to the fact that its visual density is not Linear's.

### MUI X Data Grid — 🚩🚩 `AVOID (tiering + dependency weight)`
`@mui/x-data-grid@9.12.0`, **2026-08-21** — MIT, React 19 peer confirmed. But:
- **`@mui/x-data-grid-pro@9.12.0` license: `"SEE LICENSE IN LICENSE"`** — commercial, per-developer, annual. Row grouping and tree data are Pro. Same trap as AG Grid.
- Even the MIT tier peers on **`@mui/material` + `@mui/system` + `@emotion/react` + `@emotion/styled`**. You'd install Material UI and a CSS-in-JS runtime to render a table, in a project with zero deps today.

### Glide Data Grid — `AVOID (stale + React 19 broken)`
`6.0.3`, published **2024-02-03**. Peer deps cap at `18.x` — **React 19 is not in the range**. It also requires `lodash`, `marked`, and `react-responsive-carousel` as peers. Canvas-rendered, so it's fast, but it's a spreadsheet, not a Linear list, and it's two and a half years stale.

### RevoGrid — `AVOID`
Web-component-based; the React wrapper is thin and the styling model doesn't fit a custom design system.

**→ Pick: TanStack Table v9 + TanStack Virtual.** `npm i @tanstack/react-table @tanstack/react-virtual`

---

## 5. Command palette / global search

**→ Pick: Base UI `Autocomplete` inside `Dialog` — zero additional dependency.**

Base UI's Autocomplete page documents ten examples, including a **Command Palette** ("filter a list of command items that perform an action when clicked" — Dialog + Autocomplete, grouped into Suggestions and Commands, full keyboard nav, with an "Open command palette" trigger), plus **Async Search**, **Grouped**, **Fuzzy Matching**, **Auto Highlight**, **Limit Results**, and **Virtualized** (10k items). Sub-parts include `Root`, `Input`, `List`, `Item`, `Group`, `GroupLabel`, `Empty`, `Status`, `Portal`, `Popup`, `Collection`, `Chips`/`Chip`/`ChipRemove`, and a `filter` prop plus a `useFilter()` hook for external filtering via `filteredItems`.

`Status` and `Empty` matter more than they sound: they're where your server-search loading state and no-results state live, which is the part hand-rolled palettes always get wrong.

### cmdk — `AVOID (frozen; superseded by the primitive layer)`
- `1.1.1`, published **2025-03-14** · MIT · 12,941 stars · last commit 2025-10-29 · 74 open issues, **23 unmerged PRs**
- **React 19 compatibility: confirmed** — and worth stating clearly, because the old warnings are stale: 1.x **dropped `use-sync-external-store`**, which was the actual root cause of [#332](https://github.com/pacocoursey/cmdk/issues/332). It renders fine on 19.2.8 (verified by SSR smoke test).
- **17.0 kB gzip**, including 4 Radix packages.
- The filtering complaints are real and open: scroll jumps on filter ([#374](https://github.com/pacocoursey/cmdk/issues/374)), no async filtering ([#365](https://github.com/pacocoursey/cmdk/issues/365)), no diacritic folding ([#386](https://github.com/pacocoursey/cmdk/issues/386)), `TypeError` on null item values ([#404](https://github.com/pacocoursey/cmdk/issues/404)). `shouldFilter={false}` sidesteps all of them since your results come from the server — but at that point you're using ~30% of its API.
- [Issue #410, "Project dead?"](https://github.com/pacocoursey/cmdk/issues/410) (2026-07-10): **no maintainer response.**
- If you weren't taking Base UI, this would be the pick (vendor it; it's ~1.5k LOC of MIT code). Since you are, it's 17 kB and a second primitive library for a screen you already have.

### kbar — `AVOID (owns too much)`
`1.0.0`, published **2026-08-10** · MIT · 5,248 stars · **0 open issues**. A genuine surprise revival after three years at `0.1.0-beta.*`, with CI now matrixed across React 17/18/19 — **React 19 confirmed.** But **30.3 kB gzip** (it bundles fuse.js + `@tanstack/react-virtual` + `fast-equals` + a Radix portal), and its model is a flat action tree registered up front. It owns the registry, the positioner, and the animator — the wrong three things to surrender when Linear-grade density is the target, and it fights server-fetched async results.

### react-cmdk — `STALE — do not adopt`
`1.3.9`, **2023-04-18**. Last commit 2023-03-02. **React 19: broken** — peer hard-capped at `^18.x`, and it depends on `@headlessui/react ^1.6.4`. It also ships `html-webpack-plugin` as a *runtime* dependency, which is a packaging error.

### Ariakit — `CONSIDER (the strong alternative)`
`@ariakit/react@0.4.39`, published **2026-09-02 (today)** · MIT · 8,608 stars · **React 19 confirmed** (peer `^19.0.0`). Healthiest project in this slot and a genuinely excellent combobox. **43.0 kB gzip** for combobox + dialog + popover + items + groups, no built-in filtering or virtualization (~1–2 days of assembly). Still pre-1.0 after eight years.
⚠️ **Licensing nuance, don't panic but do respect it:** the *packages are MIT*. Some *website examples* are gated behind paid **Ariakit Plus**. A free MIT "Command Menu with Tabs" example exists; variants like "Combobox with Tabs (Plus)" do not. **Rule for a public open-core repo: never paste Plus example code in.** The dependency itself is unencumbered.

### Fuzzy matching → `@leeoniya/ufuzzy` — `USE`
| lib | version | last publish | license | gzip | deps |
|---|---|---|---|---|---|
| **@leeoniya/ufuzzy** | 1.0.19 | 2025-08-22 | MIT | **4.1 kB** | 0 |
| match-sorter | 8.3.0 | 2026-04-15 | MIT | 3.4 kB | **2** |
| fuse.js | 7.5.0 | 2026-07-13 | Apache-2.0 | 9.3 kB | 0 |
| fzf-for-js | 0.5.2 | **2023-04-25** | BSD-3 | 4.5 kB | 0 |

**React 19: N/A for all four** — these are pure functions with no React surface, which is also why "stale" matters far less here.

- **uFuzzy — the pick.** 4.1 kB, zero deps, purpose-built for "type a few chars, get tight ordered matches." Crucially, `info()` returns **highlight ranges**, which you want for the palette anyway. Last publish is ~12 months old because leeoniya treats it as feature-complete; with no React surface, there's nothing to rot. Ergonomic cost is real: `filter() → info() → sort()` over a **flat string array**, so ~15 lines of glue to keep a parallel array and map indices back to items.
- **fuse.js — AVOID on *semantics*, not health.** It's actively maintained and Apache-2.0 is fine. But Bitap approximate matching optimizes for typo tolerance, which for "navigate to a known item" ranks loose garbage above the obvious answer. Wrong algorithm for this UX.
- **match-sorter — CONSIDER.** Smallest and by far the nicest API (`matchSorter(items, query, {keys})`, no index mapping). But it pulls **`@babel/runtime` + `remove-accents`** as runtime deps, its ranking is tiered rather than genuinely fuzzy, and it gives you no highlight ranges.
- **fzf-for-js — STALE, confirmed.** Last publish **2023-04-25** (3.5 years). Default branch is still `dev`. Good algorithm, abandoned package.

⚠️ **Check Base UI's "Fuzzy Matching" example first.** It may cover your palette with `useFilter()` and no dependency at all. I could not verify whether that example uses a built-in matcher or composes an external one — the `useFilter` docs page 404s on the URL patterns I tried. **Unverified. Five minutes of reading saves 4 kB.**

`npm i @leeoniya/ufuzzy`

---

## 6. Keyboard shortcuts

**No library ships all four of your requirements.** Scored against your hard list:

| lib | version / publish | React 19 | gzip | sequences | scope **stack** | input-safe | enumerable registry |
|---|---|---|---|---|---|---|---|
| **tinykeys** | 4.0.0 / 2026-05-20 | N/A (no React dep) | **0.9 kB** | ✅ `"g i"` | ❌ | ✅ default | ❌ |
| react-hotkeys-hook | 5.3.3 / 2026-06-26 | confirmed | 2.7 kB | ✅ `g>i` | ⚠️ flat set | ✅ default | ❌ |
| @tanstack/react-hotkeys | 0.10.0 / 2026-04-25 | confirmed | 7.6 kB | ✅ | ❌ **not shipped** | ✅ smart | ✅ |
| hotkeys-js | 4.0.7 / 2026-08-28 | N/A (vanilla) | 3.6 kB | ⚠️ limited | ⚠️ one at a time | ⚠️ manual | ⚠️ partial |
| @mantine/hooks | 9.6.0 / 2026-08-31 | confirmed | — | ❌ | ❌ | ✅ | ❌ |
| react-hotkeys | 2.0.0 / **2019-07-12** | broken | — | — | — | — | — |

**→ Pick: a thin registry over `tinykeys`.** `npm i tinykeys`

### tinykeys — `USE (as a primitive)`
- https://github.com/jamiebuilds/tinykeys · **`4.0.0`**, published **2026-05-20** · MIT · 4,101 stars · **only 6 open issues** · last commit 2026-05-26
- **Answering your question directly: yes, it is maintained again.** After years dormant, a real 4.0 landed in May 2026 with `$mod` cross-platform modifiers, declaration-order binding priority, **console warnings for ambiguous sequences**, an AltGraph fix, and reworked repeat-event/IME-composition handling.
- **0.9 kB gzip**, zero deps.
- **Sequences: yes** — space-delimited, `"g i"` / `"g p"`, 1000 ms configurable window. Literally your Linear syntax.
- **Input safety: yes, by default** — ignores events originating in `input`, `textarea`, `select`, `[contenteditable]` unless they're `event.currentTarget`, plus an `ignore` predicate. Requirement satisfied for the rich-text editor.

### react-hotkeys-hook — `CONSIDER (defensible off-the-shelf choice)`
`5.3.3`, **2026-06-26** · MIT · 3,512 stars · last commit 2026-08-31 · **React 19 confirmed**. 2.7 kB, zero runtime deps — best size-to-feature ratio of any full-featured option. Real sequences (`'g>h>i'`, configurable `sequenceTimeoutMs`). Correct input safety by default (`enableOnFormTags` and `enableOnContentEditable` both default `false`).
🚩 **Two real problems on exactly the feature you'd be buying it for.** Scopes are a **flat set of active names** you toggle via `enableScope`/`disableScope` — *not* a stack with shadowing, so "the modal's Escape shadows the global Escape" isn't free. And [issue #1058, "Scoped hotkeys still trigger when scope is not active,"](https://github.com/JohannesKlauss/react-hotkeys-hook/issues/1058) has been **open since 2023-07-28**; the maintainer said it would change in v5, **v5 shipped 2025-04-09, and it's still open.** He also commented in 2024 that he doesn't have time for the project. Commits do continue.

### @tanstack/react-hotkeys — `AVOID for now (great design, docs lie about scopes)`
`0.10.0`, **2026-04-25** · MIT · 709 stars · repo created 2026-01-21 · **React 19 confirmed** (built against it from day one). 7.6 kB.
It has **exactly the registry you want**: `useHotkeyRegistrations()` returns live `{hotkeys, sequences}` with `HotkeyRegistrationView` entries carrying `meta: {name, description}` — and the JSDoc example is literally named `ShortcutPalette()`. `ignoreInputs` defaults to smart heuristics (Ctrl/Meta combos and Escape fire in inputs; bare keys don't), which is correct.
🚩 **But the docs and every third-party article claim scopes, and 0.10.0 does not ship them.** "scope" appears only in sourcemaps and one incidental comment — **zero type definitions**. `HotkeysProvider` carries only `defaultOptions`. The official scopes guide URL **404s**.
🚩 **No release in ~4 months, and the open bugs are correctness bugs in a keyboard-first app:** AZERTY digit keys broken (#149), `useHotkey`/`useHotkeys` disagreeing on `target` (#147), **`KeyStateTracker` latching a modifier forever when a keyup is swallowed** (macOS Cmd+Shift+4, #143), Space overriding native focused-element behavior (#142), global single-key hotkeys firing inside focused ARIA composite widgets (#138). All filed *after* the last release. Watch it; don't ship on it.

### hotkeys-js — `AVOID`
`4.0.7`, **2026-08-28** · MIT · 7,128 stars, **159 open issues**. Actively maintained but its scope model permits **one active scope at a time** (no stack), and being vanilla you write the React lifecycle glue anyway. tinykeys is 4× smaller and better-behaved.

### @mantine/hooks `useHotkeys` — `AVOID (fails hard requirements)`
`9.6.0`, **2026-08-31** · MIT · **zero deps** — so to answer directly: **no, it would not pull in Mantine UI.** But **no sequences and no scopes**, which fails two of your stated hard requirements. Moot.

### Ariakit — not a shortcut library. Focus and composite-widget nav within components; no global bindings, no sequences, no registry.

### react-hotkeys — `STALE — do not adopt` (confirmed)
`2.0.0`, **2019-07-12**. Last commit 2020-01-01. 108 open issues. Depends on `prop-types`. Untested for six years.

**The job you're taking on: ~150–200 lines, half a day to a day.** And it's the right trade, because **your scope stack and your help sheet are the same data structure**:
- `ShortcutRegistry` — array of scope frames, each holding `{keys, label, group, handler, when}` (~80 lines)
- `useShortcuts(scope, bindings)` — push a frame on mount, pop on unmount; resolve top-down, first match wins. **This is where you get true shadowing**, which react-hotkeys-hook won't give you (~40 lines)
- One window-level `createKeybindingsHandler`, rebuilt when the top frame changes (~30 lines)
- `useShortcutHelp()` — reads the registry, groups by `group`, renders the `?` sheet. Because everything registers through one path, **the cheatsheet cannot drift from reality** (~20 lines)

You end up with better semantics than any of these libraries, 0.9 kB of dependency, and zero exposure to a stalled maintainer on a core quality target.

---

## 7. Routing

**→ Pick: TanStack Router.** `npm i @tanstack/react-router && npm i -D @tanstack/router-plugin`

### TanStack Router — `USE`
- https://github.com/TanStack/router · **`1.170.32`**, published **2026-08-22** · MIT · 15,030 stars · last commit 2026-08-31 · **601 open issues** · 22.1M weekly
- **React 19 compatibility: confirmed** — peer `>=18.0.0 || >=19.0.0`.
- Bundle: 122.6 kB min / **38.4 kB gzip** — notably *smaller* than React Router v8.
- `@tanstack/router-plugin@1.168.35` (2026-08-22) peers **`vite: ">=8.0.0"`** — verified against your Vite 8.
- **This library's entire thesis is your saved-views requirement.** `validateSearch` takes a Standard Schema (so your Zod filter-tree schema drops straight in) and every `useSearch()` call site is typed off it with defaults applied. **Custom serialization is a documented first-class hook:** `parseSearchWith(fn)` / `stringifySearchWith(fn)`, with the docs explicitly covering **JSURL2** (compresses nested structures to `?filters=(author~tanner~min*_words~800)~`), zipson, and base64, under a stated round-trip-idempotency contract. That is precisely the seam a nested AND/OR condition tree needs.
- Honest caveats: **601 open issues** and a `1.170.x` minor tell you this ships fast and churns. Code-based routing works and preserves type safety via `getParentRoute()`, but **the docs open by recommending against it**. Use the Vite plugin and file-based routes — it's a client-side codegen step with no server implication.

### React Router v8 — `USE (the safe default, but you'd write the interesting half)`
- https://github.com/remix-run/react-router · **`8.3.1`**, published **2026-08-28** · MIT · 56,577 stars · 53.2M weekly. v8 shipped **2026-06-17** on a new annual major cadence.
- **React 19 compatibility: confirmed — and mandated.** Peer is literally `react: ">=19.2.7"`; **v8 dropped React 18.** Your React must be ≥ 19.2.7 (current stable is **19.2.8**, so fine — but pin accordingly).
- Bundle: 185.5 kB min / **58.5 kB gzip**.
- Breaking changes that matter: **`react-router-dom` is gone** (import from `react-router` and `react-router/dom`), **ESM-only** (fine on Vite 8), `future.v8_middleware` now default.
- **On the mode split: it only matters to tell you which two to ignore.** Declarative (`<BrowserRouter>`) and Data mode (`createBrowserRouter` + `RouterProvider`) run entirely in the browser with no Vite plugin and no server — the Node 22 / Vite 7 baselines are framework-mode-only concerns. Framework mode assumes server infrastructure; skip it. Data mode is the one worth having.
- **The disqualifier: no typed search params.** `useSearchParams` returns a `URLSearchParams` of strings. Every bit of encode/decode/validate/default-merge for the nested filter tree is yours to hand-roll, untyped, at every call site.

### Wouter — `AVOID`
`3.10.0`, **2026-05-21** · **Unlicense** · 7,872 stars · **2.5 kB gzip**. Genuinely tiny and alive. **React 19: unclear** — peer is `>=16.8.0` and the README never mentions React 19. But it offers nothing for search-param state, which is the whole problem. Also flag **Unlicense** — more permissive than MIT, but disliked in some corporate legal review, a real consideration for an open-core product others will vendor.

### History fallback behind the Go binary
Identical for all three, and it's a Go-side concern rather than router config: **serve `index.html` for any GET that doesn't resolve to a real file in the embedded asset FS.** Use `embed.FS` + `http.FileServerFS`, wrap it so a stat-miss returns `index.html` with a **200** (not a 302), and register the API under a prefix. Two things to get right:
1. **Don't let the fallback swallow `/api/` 404s** — those must return JSON 404, or every typo'd API call silently returns your HTML shell and you'll debug it for an hour.
2. Serve hashed assets from `/assets/` with long `Cache-Control: immutable`; give `index.html` `no-cache`.

---

## 8. Forms + validation

**→ Pick: React Hook Form + Zod 4, rendered through Base UI's `Field`/`Form`.**
`npm i react-hook-form zod @hookform/resolvers`

### React Hook Form — `USE`
- https://github.com/react-hook-form/react-hook-form · **`7.87.0`**, published **2026-08-30** · MIT · 44,844 stars · **8 open issues** · last commit 2026-09-02 · 58.7M weekly
- **8 open issues on a 44.8k-star repo pushed today is the best maintenance signal in this entire report.**
- **React 19 compatibility: confirmed** — peer `^16.8.0 || ^17 || ^18 || ^19`.
- **39.5 kB min / 13.7 kB gzip · zero runtime dependencies.**
- **On your key requirement, this is the cleanest option.** `setError(name, {type, message, types}, {shouldFocus})` is documented for exactly this. You loop the Go response: `setError("title", {type: "too_long", message: detail})`. Specifics that matter: nested paths work; `setError("root.serverError", {type: "400"})` handles form-level errors and **root errors don't persist after submission** (no stale-error cleanup to write); field errors on registered fields self-clear once the input passes its own rules; `isValid` is forced false; and `shouldFocus` gives you focus-the-bad-field for free. The docs call out server-side validation as the intended use.

### How this composes with Base UI (requirement 8, end to end)
You have **two** mechanisms and should use both deliberately:
- **Simple forms** (rename dialog, single-field edits): Base UI `<Form errors={serverErrors}>` alone. Set `{title: "too_long"}` from the Go response, `<Field.Error />` renders it at the field. No RHF needed.
- **Structured forms** (issue create/edit, design-doc metadata, workspace settings): RHF owns state, Base UI owns rendering. The official integration guide covers it: wrap Base UI fields in RHF's `Controller`, forward `name`/`field`/`fieldState` to the right parts, use the `match` prop to delegate error rendering, and **forward `ref` via `inputRef`** so RHF can focus invalid fields.

That second point is the easy thing to get wrong — if a wrapper component swallows the ref, `shouldFocus` silently no-ops and you lose the best part.

### TanStack Form — `CONSIDER`
`1.33.5`, **2026-08-11** · MIT · 6,677 stars · **186 open issues** · 2.9M weekly · **React 19 confirmed** (peer `^17 || ^18 || ^19`); **1.x is stable**. 70.8 kB min / **17.4 kB gzip**.
Server-error mapping is genuinely competitive and arguably more declarative — return a structured object from `onSubmitAsync`:
```ts
return { form: 'Invalid data', fields: {
  age: 'Must be 13 or older',
  'socials[0].url': 'The provided URL does not exist',
  'details.email': 'An email is required',
}}
```
Dot notation and array indices both work; `field.state.meta.errorMap` lets you read errors keyed by *when* they arrived (`onChange`/`onBlur`/`onServer`). Standard Schema is native since 1.33.0 (no more `zodValidator`).
⚠️ **Correction to a common assumption:** `onServerValidate` + `serverValidate` are the **Next.js/Start server-action** path, *not* what you'd use. For a SPA calling a Go REST API it's the `onSubmitAsync` return above. Don't go looking for `onServerValidate`.
Why not the pick: 186 open issues vs 8, 1/20th the adoption, and errors flow through the submit validator rather than being imperatively addressable at any time.

### Formik — `STALE — do not adopt` (confirmed)
`2.4.9`, **2025-11-10** · Apache-2.0 · 34,329 stars · **840 open issues**. Repo `pushed_at` equals the release timestamp — **~10 months with zero commits**. **React 19: unclear** (peer `>=16.8.0`, no statement). Also drags in **`lodash` *and* `lodash-es`**, `deepmerge`, `hoist-non-react-statics`, `react-fast-compare`. The star count is history, not health.

### Plain React — `CONSIDER (for trivial forms only)`
React 19 has `useActionState`, `useFormStatus`, and form actions built in, and uncontrolled inputs + `FormData` genuinely covers a rename dialog. But your requirement is per-field server error mapping across *many* structured forms. Hand-rolling error-state-keyed-by-field-path, dirty tracking, and focus management is the exact wheel RHF is 13.7 kB of. Use plain React for the trivial cases; don't make it the strategy.

### Schema layer

| | version | published | license | stars | gzip (full barrel) |
|---|---|---|---|---|---|
| **Zod** | **4.5.4** | 2026-08-29 | MIT | 43,767 | 81.2 kB → **tree-shakes** |
| Valibot | 1.4.2 | 2026-06-28 | MIT | 8,973 | **14.4 kB** |
| ArkType | 2.2.3 | 2026-07-07 | MIT | 7,853 | 44.8 kB |

**React 19: N/A for all three** (no React dependency).

- **Zod 4.5.4 — `USE`.** 274M weekly downloads, 52 open issues, pushed 2026-09-02. That 81.2 kB barrel figure is misleading: **`zod/mini` is real** (both the `zod/mini` subpath and `@zod/mini`). Same functionality, functional API (`z.nullable(z.optional(z.string()))`) specifically *because* method chaining can't tree-shake. Documented gzip: **2.12 kB vs 5.91 kB** (simple boolean), **4.0 kB vs 13.1 kB** (object schema). Start with plain `zod`; the subpath is there if size bites.
- **Valibot 1.4.2 — `CONSIDER`.** Smallest by far (~1.37 kB simple schemas). ⚠️ **The repo moved: it's now `open-circle/valibot`; `fabian-hiller/valibot` no longer resolves via the GitHub API.** New home is active. Fine library — glance at the governance change before betting on it.
- **ArkType 2.2.3 — `AVOID`.** Slowest cadence (last publish 2026-07-07, no post-release activity), worst issue ratio (**262 open** on 7.8k stars), 2M weekly vs Zod's 274M. Clever TS-syntax-as-schema, least mature.

### Standard Schema — **shipped and broadly adopted**
`@standard-schema/spec@1.1.0`, published **2025-12-15** · MIT · 3,608 stars · repo pushed 2026-08-28. **The old npm date is a feature, not staleness** — the spec is ~60 lines of types and it's *done*. Designed jointly by the Zod, Valibot, and ArkType authors. Zod 4, Valibot, ArkType, and TypeBox all conform. Consumed by **TanStack Form (native since 1.33), TanStack Router (`validateSearch`), and tRPC**.

**Why this is the quiet keystone of the whole stack:** one Zod filter-tree schema validates the URL search params in TanStack Router, validates the filter editor's output, and describes the payload your Go handler parses. Slots 4, 7, and 8 collapse into one artifact. That shared schema is worth more than any individual library pick here.

---

## 9. Filter / query builder UI

**→ Pick: build your own tree model on Base UI's Combobox. No new dependency.**

**Being direct, since you asked: yes, the off-the-shelf options are enterprise-SQL-builder-shaped, and the one that isn't is proprietary.**

### react-querybuilder — `AVOID (Redux dependency + wrong shape)`
- https://github.com/react-querybuilder/react-querybuilder · **`8.23.1`**, **2026-08-19** · MIT · 1,727 stars · 10 open issues · last commit 2026-09-02 · 444k weekly
- **React 19 compatibility: confirmed** — changelog records React 19 support as "verification only, no meaningful code changes."
- Bundle: 212.5 kB min / **59.5 kB gzip**
- **Its model genuinely fits you.** Arbitrary nesting (`maxLevels` defaults to `Infinity`), custom operators with an `arity` property, `RuleGroupTypeIC` for per-position combinators, and ~20 replaceable `controlElements` (`ruleGroup`, `rule`, `valueEditor`, `combinatorSelector`, `inlineCombinator`, `dragHandle`, …) plus `suppressStandardClassnames` to drop its CSS entirely.
- **The default UI is exactly the enterprise SQL builder you feared** — indented rows of field-select / operator-select / value-input with `+Rule / +Group / ✕` per row. Nothing like Linear's chips.
- 🚩 **The disqualifier: it has `@reduxjs/toolkit ^2.12.0` and `react-redux ^9.3.0` as real runtime dependencies.** In a project with zero deps beyond react/react-dom, you'd install Redux — a state library you didn't choose and can't tree-shake away — to render filter chips.
- And if you replaced every `controlElement` to get Linear's look, what you'd still be *using* is its condition-tree reducer and its query→SQL/JSONLogic exporters. **You don't need the exporters** — your Go API defines the wire format. So it's 59.5 kB plus Redux for a reducer.

### @react-awesome-query-builder — `STALE — do not adopt`
2,259 stars, **161 open issues**, repo last pushed 2026-03-05. **The `latest` dist-tag is `6.7.0-alpha.0` from 2025-05-23** — so `npm i` gets you an alpha. Last *stable* is 6.6.15 (2025-05-16), over 15 months old. **React 19: unclear** — the peer range includes `^19.0.0`, but nothing has shipped since May 2025 to verify against.
On your antd/MUI question: **no hard dependency** — those are separate opt-in packages. But `/ui` itself still carries **`react-redux ^8.1.3` (two majors behind), `redux ^4`, `lodash`, `prop-types`, `chroma-js`**. `prop-types` in 2026 is the tell.

### ReUI Filters — 🚩🚩🚩 `AVOID — proprietary paid license, legally unusable for open-core`
This one hurts, because **it is exactly the shape you want**: a flat pill row for a table toolbar *and* a nested condition builder, both reading/writing the same tree, `(A and B) or C` expressible, clean file layout, and it's already built on `@base-ui/react` + `@tanstack/react-virtual`.

**But the license is proprietary and specifically forbids your business model.** Per https://reui.io/legal/license, you may not "resell, redistribute, sublicense, or otherwise make the Licensed Materials available to anyone else," may not publish source code in **public repositories where the original source can be downloaded by the public**, and may not build a competing component library. Paid Pro/Ultimate tiers; even Personal requires purchase.

**For an open-core, self-hostable product with a public repo, the public-repo clause alone is fatal. Do not vendor this.** It is, however, a free and excellent *architecture* reference — read the docs, steal the *idea* (one tree model, two presentations), write your own code.

### SVAR React Filter — `CONSIDER (low confidence)`
`2.6.1`, published **2026-09-02** · **MIT** (verified — commercial vendor, genuinely MIT component) · 31.1 kB gzip · **React 19: unclear** (peer `>=18`, no explicit statement). Does nested AND/OR with JSON output. But it pulls an entire vendor design system (`@svar-ui/react-core`, `-menu`, `lib-dom`, `lib-state`, `filter-locales`), so restyling means fighting a component framework you otherwise have no use for.

### Why building it is the right call, not a cop-out

1. **Your backend already defines the data model.** You're not converting to SQL or JSONLogic — the exporters that justify these libraries' weight are dead weight for you. Your frontend type should be your Go API's shape, verbatim.
2. **The tree is the easy part.** `type Group = {id, combinator: 'and'|'or', not?: boolean, children: (Rule|Group)[]}` and `type Rule = {id, field, operator, value}` is ~100 lines with a Zod schema; recursive add/remove/update/move-by-id is another ~200 with tests. That's smaller than these libraries' *changelogs* — and the Zod schema then feeds TanStack Router's `validateSearch` and `stringifySearchWith` for free. **Slots 7, 8, and 9 become one decision.**
3. **No library gives you Linear's UX anyway.** The hard part isn't the tree — it's the per-field-type value editors and the keyboard-driven flow (type "assign" → pick Assignee → pick operator → multi-select people, never touching the mouse). You're writing that either way. The only question is whether you write it on top of 59.5 kB and Redux, or on top of a combobox you already have.
4. **Base UI hands you the chips.** `Combobox.Chips` / `Chip` / `ChipRemove` is the filter-pill primitive. Plus `multiple`, `filter` / `useFilter()`, `Group`/`GroupLabel`, async search, and virtualization for 10k-option value pickers. This is the single strongest argument in the report for Base UI over Radix.

**Effort, solo:** tree model + reducer + tests + URL codec, **2–4 days**. A polished Linear-like chip row with popover editors, keyboard nav, and 5–6 value-editor types, **3–5 days**. Realistically **1–2 weeks** including focus management, chip overflow, and empty/invalid states. Building on react-querybuilder and replacing every `controlElement` is **not meaningfully less work** — you'd spend that week fighting its render contracts instead of writing your own.

---

## 10. Skeleton loading

**→ Pick: no dependency. This is ~25 lines of TSX and ~15 of CSS.**

Your decision has already eliminated everything a skeleton library sells. They give you (a) a shimmer animation, (b) a theme context, (c) auto-sizing from text metrics. (a) is six lines of CSS, (b) is `@theme` custom properties you already have from Tailwind, and (c) is **actively wrong for you** — your container components know their own real dimensions, so explicit sizes from the same layout tokens the real component uses will always beat a library guessing from `line-height`.

### react-loading-skeleton — `STALE — do not adopt`
`3.5.0`, **2024-09-21** (~23 months) · MIT · 4,205 stars · last commit same day. **React 19: unclear** — peer `>=16.8.0` permits it by range, but zero commits since before React 19 shipped. **0.9 kB gzip.** You'd take a dep, a CSS import, and two years of no maintenance for ~900 bytes you'd write yourself.

### react-content-loader — `AVOID (wrong shape for your decision)`
`7.1.2`, **2026-01-22** · MIT · 14,003 stars. **React 19: confirmed** (peer `>=18.0.0` on a post-React-19 release). ~2.3 kB gzip.
🚩 Open issue **#339: animation stops after first render under `React.StrictMode`** (Aug 2025, still open) — and StrictMode is the Vite React default.
Architecturally it's the *inverse* of your decision: it wants a hand-authored SVG shape per skeleton. You decided skeletons are a modifier on the real component, which means reusing the real component's DOM and layout. SVG can't do that.

### React 19 Suspense / `use()` — `CONSIDER (orthogonal)`
`use()` + Suspense changes *who decides* something is loading, not *what loading looks like*. Suspense gives one `fallback` per boundary — which is exactly the "generic spinner or one-off hand-built skeleton" you rejected. **Your `loading` prop is strictly more expressive:** it keeps the skeleton co-located with the component that knows its own shape, and it lets you render a *partially* loaded row (real title, skeleton assignee), which a Suspense boundary fundamentally cannot express because it's binary. If you do adopt `use()` as a data mechanism, prefer **`<Activity>` (stable in React 19.2)** over Suspense fallbacks for keeping off-screen views warm.

**The two conventions that matter more than the primitive:**
1. **One announce point, not N.** Every `<Skeleton>` is `aria-hidden="true"`; the *container* carries `aria-busy={loading}` and the region label. Otherwise screen readers get a wall of nothing.
2. **Skeletons render the real layout.** `<IssueRow loading />` returns the same grid container with `<Skeleton>` in the cells — never a separate `<IssueRowSkeleton>` component. That's what stops them rotting, and it's the reason no library can help.

And respect `prefers-reduced-motion` — for an app whose selling point is keyboard and accessibility polish, a shimmer that ignores it is a bad look:
```css
@media (prefers-reduced-motion: reduce) {
  .lf-skeleton { animation: none; background: var(--lf-skeleton-base); }
}
```

---

## 11. Animation

**→ Pick: `@formkit/auto-animate` + native CSS. Skip Motion for now.**
`npm i @formkit/auto-animate`

| Need | Solution | Cost |
|---|---|---|
| List/board item reorder | `useAutoAnimate` on the container | 3.2 kB gzip |
| Dialog/popover enter–exit | `@starting-style` + `transition-behavior: allow-discrete` + Base UI's `data-*` state attrs | **0** |
| Page transitions | `document.startViewTransition()` | **0** |
| Drag feedback | CSS `transform`/`transition`, driven by pragmatic DnD | **0** |

**3.2 kB** versus **~20–60 kB** for Motion, hitting all four. Linear itself is overwhelmingly CSS transitions — the "well-animated" feeling comes from correct easing curves, 120–200 ms durations, and never animating layout-triggering properties. No library gives you that.

### @formkit/auto-animate — `USE`
`0.10.0`, **2026-07-10** · MIT · 13,913 stars · **3.2 kB gzip** total; the React adapter is **474 B**. **React 19: confirmed by construction** — no React peer at all; it's a `MutationObserver` + Web Animations API utility, and `useAutoAnimate` is a ~40-line hook returning a ref. Nothing for a React version to break.
Attach the ref to any parent; children added, removed, or **moved** get FLIP-animated with **zero changes to your render logic** — critical for a board where the server is the source of truth for ordering. Caveat: it animates DOM children of the ref'd element, so it doesn't cross portal boundaries and won't help dialogs (that's what `@starting-style` is for).

### Motion — `CONSIDER (add later; licensing is clean)`
- https://github.com/motiondivision/motion · **`motion@13.2.0`** and **`framer-motion@13.2.0`**, both published **2026-09-02** · 33,459 stars · last commit today · 108 open issues
- **On the rename: `framer-motion` is NOT deprecated.** It's now the React implementation package, and `motion` depends on it (`"framer-motion": "^13.2.0"`). `motion` is the umbrella with subpaths `./react`, `./react-m`, `./react-mini`, `./mini`, `./three`, `./vgpu`.
- **License: MIT**, verified against `LICENSE.md` (© Motion B.V.). No commercial-use clause, no feature reservation.
- **On the paid tier — this is NOT a licensing problem.** Motion+ (£299 one-time Personal / per-seat Business) gates 430+ example recipes, a premium component library, tutorials, a visual transition editor, private Discord, and early access. **No API is gated. The npm package is fully usable and feature-complete under MIT.** Clean for open-core — nothing you'd have to strip.
- **React 19: confirmed** (peer `^18.0.0 || ^19.0.0`).
- Bundle is the reason to defer: `framer-motion` full barrel **60.8 kB gzip**; Motion's own docs state the `motion` component is **34 kB** and "impossible for bundlers to tree shake it any smaller." The mini path (`m` + `LazyMotion`) is ~4.6 kB initial then +15 kB (`domAnimation`) or +25 kB (`domMax`).
- **The one tripwire to revisit:** shared-element transitions where an element morphs across an unmount boundary View Transitions can't reach (board card expanding into a portaled detail panel, interruption-safe). That's `layoutId`, and it is genuinely very hard to hand-roll. When you get there, import from **`motion/react-m` with `LazyMotion` + `domAnimation`**, never `motion/react`.

### React Spring — `AVOID (no advantage here)`
`@react-spring/web@10.1.2`, **2026-06-24** · MIT · 29,141 stars · last commit 2026-08-18. **React 19: confirmed.** Genuinely maintained. But it's a spring-physics *value* animator with no layout-animation (FLIP) primitive, no shared-element transitions, and no presence/exit orchestration out of the box. It solves the least of your four needs while costing more than auto-animate. If you were going to pay for a JS animation runtime, Motion is strictly the better buy.

### CSS View Transitions API — `USE (native, zero bytes)`
**90.2% global support** (caniuse, today): Chrome/Edge 111+, **Safari 18.0+**, **Firefox 144+**, iOS Safari 18.0+, Samsung Internet 23+. Comfortably over the line for an internal app behind auth. `document.startViewTransition(() => setRoute(next))` plus a `::view-transition-*` CSS block, feature-detected with a no-op fallback where the un-transitioned path is just an instant swap.

### React `<ViewTransition>` — `AVOID (not shipped)`
**Not in stable React.** React 19.2 (2025-10-01) shipped `<Activity>` as stable; `<ViewTransition>` and `addTransitionType` remain **canary/experimental**. With React pinned at 19.2 you can't use it without moving to `react@canary`. **Don't.** Use the browser API; migrating later is a small contained refactor.

### `@starting-style` + `allow-discrete` — `USE (native, zero bytes)`
**90.65% global**: Chrome/Edge 117+, **Safari 17.5+**, Firefox 129+. **This is the piece that kills the usual argument for Motion** — it gives you real enter *and* exit animations on `display`/`popover`/`[hidden]` in pure CSS, which is what historically forced people into `<AnimatePresence>`. Combined with **Base UI's `data-open` / `data-closed` / `data-starting-style` / `data-ending-style`** attributes, dialogs and popovers need **zero** animation JavaScript.

⚠️ **Note the coupling:** this recommendation depends on the primitives choice. Base UI exposes those state attributes and supports `keepMounted`. If you'd picked something that unmounts immediately with no exit state, dialog animation gets much harder and Motion's `<AnimatePresence>` becomes necessary rather than optional.

---

## 12. Toasts + dates

### Toasts → sonner — `USE`
- https://github.com/emilkowalski/sonner · **`2.0.8`**, published **2026-08-09** · MIT · 12,925 stars · last commit 2026-08-10 · 50.5M weekly
- **React 19: confirmed** — peer `^18.0.0 || ^19.0.0 || ^19.0.0-rc`, and it explicitly peers `@types/react: ^18.0.0 || ^19.0.0`.
- **33.3 kB min / 9.2 kB gzip · zero runtime deps.**
- One `<Toaster />` at the root, then `toast()` from anywhere — no context plumbing, which matters when you're firing from a keyboard-shortcut handler or a mutation callback rather than from render.
- The stacked/collapsed hover behavior and swipe-to-dismiss are the hard part and the exact Linear-adjacent feel you want. That's what the 9 kB buys.
- Minor wart: issue #656 (open, Aug 2025) — `ToasterProps` not exported from the ESM entry in some resolutions. Type-only, trivially worked around.

### react-hot-toast — `STALE — do not adopt` (your suspicion confirmed)
`2.6.0`, **2025-08-15** · MIT · 10,975 stars · **143 open issues** · last commit **2025-08-16** (~12.5 months). **React 19: broken/unresolved** — open issue **#424, "Maximum update depth exceeded ... under react 19"** (2026-02-14, **zero comments**, still open). The earlier React 19 prep issues were closed in Feb 2025, but the runtime infinite-update report against 19 is live and unanswered. Also carries a `goober` CSS-in-JS runtime you don't want alongside Tailwind.

### Base UI Toast — `CONSIDER (but I'd still take sonner)`
It's real and stable: `Toast.Provider` (`limit` default 3, `timeout` default 5000), `Portal`, `Viewport`, `Root` with swipe-to-dismiss, `Title`/`Description`/`Action`/`Close`, plus `useToastManager()` with `add`/`update`/`close`/`promise`. **React 19 confirmed.** Zero extra dependency.
**But it's unstyled and unanimated by design** — you'd rebuild the stack-collapse, height-morph, and swipe physics yourself, which is a multi-day job to reach Linear quality. Toasts are the one slot where opinionated-and-beautiful beats headless-and-mine. Reconsider if you find yourself wanting toast layouts sonner won't do.

### Dates → **no dependency.** A ~40-line `src/lib/date.ts` over `Intl`.

**Temporal API — `AVOID`.** **69.84% global** (caniuse, today): Chrome/Edge 144+, Firefox 139+, Opera 131+. 🚩 **Safari is Technology-Preview only, and Safari on iOS is unsupported through 26.6.** Also unsupported: Samsung Internet, Opera Mini. It's shipping — just not yet.

**`temporal-polyfill` (fullcalendar) — `AVOID`.** `1.0.4`, **2026-08-13** · MIT · well maintained, reached 1.0. But **19.4 kB gzip** for an API you don't need for "sprint dates + 3 days ago."
**`@js-temporal/polyfill` — `AVOID`.** `0.5.1`, **2025-03-31** (~17 months) · ISC · **44.1 kB gzip** (carries a `jsbi` BigInt shim). Strictly worse on every axis.

**date-fns v4 — `CONSIDER` (the right escape hatch, not the default).** `4.4.0`, **2026-05-29** · **MIT** (the GitHub API reports `NOASSERTION` for the repo; the published manifest is MIT) · 36,644 stars · last commit 2026-08-30 · 1,005 open issues. Tree-shakes genuinely well (`sideEffects: false`, proper `exports`, one function per module) — real usage lands at 2–5 kB gzip. Timezones via the separate `@date-fns/tz@1.5.0`. **Note: this is the same pairing Base UI optionally peers on**, so if you ever use Base UI's date components you get it at no incremental cost.

**day.js — `AVOID (architecture, not staleness — your suspicion is wrong).`** `1.11.23`, **2026-08-17** · MIT · 48,663 stars · last commit 2026-09-01 · **1,315 open issues**. **It has not stalled** — it's shipping this month. But `2.0.0` has been stuck on `alpha` for years, and structurally it's wrong: **no `exports` field, no ESM entry, and a mutating plugin model (`dayjs.extend`)** that defeats tree-shaking and creates global state. You'd need `relativeTime` + `utc` + `timezone` plugins to match date-fns, each a side-effecting global mutation.

**luxon — `AVOID (size)`.** `3.7.2`, **2025-09-05** · MIT · 16,449 stars · last commit 2026-08-09. **21.4 kB gzip, monolithic, no tree-shaking.** Best-in-class timezone ergonomics — a problem you don't have.

**`Intl.RelativeTimeFormat` + `Intl.DateTimeFormat` — `USE`.** Universally supported, zero bytes. **Yes, this is sufficient**, and the reasoning is worth stating because it's a layering argument, not a bundle-size one:

Relative timestamps are pure display. `Intl.RelativeTimeFormat` handles all pluralization and locale grammar; you write ~20 lines of bucketing.

**Sprint start/end dates are where a library looks necessary and isn't — because you have a Go backend.** Go's `time` package is excellent, and sprint boundaries are business logic that must agree between the API, any future webhooks, and the UI. **Compute cycle start/end in Go, serialize ISO-8601, and let the frontend only ever *format*.** That eliminates the entire class of DST and off-by-one bugs that date libraries exist to paper over — and it's the correct layering regardless of bundle size. For range display, `Intl.DateTimeFormat.prototype.formatRange` gives you "Sep 2 – 16" with correct locale collapsing, which date-fns doesn't do as well.

---

## 13. Icons

**→ Pick: `lucide-react` — with a required Vite alias.** `npm i lucide-react`

### lucide-react — `USE (with a mandatory config workaround)`
- https://github.com/lucide-icons/lucide · **`1.39.0`**, published **2026-09-01** · **ISC** (repo reports `NOASSERTION`; the published `lucide-react` manifest is ISC) · 24,293 stars · last commit 2026-09-01 · **97.8M weekly downloads**
- Note it's on **1.x** now, not the long `0.x` train. Releases are near-daily (1.37.0 Aug 29, 1.38.0 Aug 31, 1.39.0 Sep 1).
- **2,050 icon modules** in `dist/esm/icons/` including deprecated aliases — roughly **1,600–1,700 unique glyphs**. That coverage is the decisive factor: a Linear clone needs distinct glyphs for ~8 workflow states, ~5 priorities, cycles, projects, milestones, roadmaps, labels, sub-issues, blocking/blocked-by, git states, filter/sort/group operators, and a full command-palette vocabulary.
- **React 19: confirmed** — peer `^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0`.
- **Tree-shaking, verified concretely:** `sideEffects: false` and a `module` field, but **no `exports`, `types`, or `files` field**. Production Rollup/Rolldown tree-shakes the barrel correctly, *and* deep paths are legal. Single icon `dist/esm/icons/circle-check.mjs` = 526 B raw / **335 B gzip**.
- 🚩 **The Vite dev-server problem is real and will NOT be fixed.** Vite doesn't tree-shake in dev, so `import { Check } from "lucide-react"` makes the dev server transform and serve all ~2,050 icon modules — reported startup penalties from ~2.8 s to ~10 s, plus cold-HMR pain. **Issue [#2583](https://github.com/lucide-icons/lucide/issues/2583) was closed as "not planned."** [#4435](https://github.com/lucide-icons/lucide/issues/4435) (same root cause) is still open, last updated 2026-08-24. **Treat it as a permanent config tax, not a bug awaiting a release.**

**Do this on day one, before the icon count grows:**
```ts
// vite.config.ts
resolve: {
  alias: [
    { find: /^lucide-react$/, replacement: "lucide-react/dist/esm/lucide-react.mjs" },
    { find: /^lucide-react\/icons\/(.*)$/, replacement: "lucide-react/dist/esm/icons/$1.mjs" },
  ],
},
```
Then always `import Check from "lucide-react/icons/check"`. Because the package ships no `types` field, add a `lucide.d.ts` with `declare module "lucide-react/icons/*"`. **An oxlint `no-restricted-imports` rule banning the bare `lucide-react` specifier makes this self-enforcing** — which is how a solo project actually stays honest about it.

### @radix-ui/react-icons — `STALE — do not adopt`
`1.3.2`, **2024-11-14** (~22 months) · MIT · 2,667 stars. Last commit 2025-12-17, and that was "add context7.json"; the last substantive change was "update peer deps range for React 19" (2025-09-12). A **`2.0.0-rc.1776195498999` was published 2026-04-14 but never promoted to `latest`** — five months on `next` with no follow-up. That's an abandoned release, not an imminent one. **React 19: unclear** (range widened, nothing shipped or tested since). **Not folded into anything** — the unified `radix-ui@1.6.7` bundles ~55 *primitives* and does not include icons. Also only ~300 icons at a single 15×15 size: nowhere near enough.

### @phosphor-icons/react — 🚩 `AVOID — broken on Vite 8. Hard blocker for your stack.`
`2.1.10`, **2025-05-22** (~15 months) · MIT · 1,742 stars · last commit 2026-01-06. ~3,024 icon modules (6 weights × ~500 glyphs) and the nicest multi-weight system here. But:
- **Issue [#155](https://github.com/phosphor-icons/react/issues/155) (2026-06-09, still open): fails at runtime under Rolldown — the bundler Vite 8 uses.** `TypeError: Cannot destructure 'null' as it is null`, thrown from `dist/lib/IconBase.es.js`, which chains two rest-pattern destructurings in one `const`. **Every icon fails to render; the page goes blank.** Reproduced on Vite 8.0.16 with `@vitejs/plugin-react` 5.2.0 and 6.0.2.
- **Issue [#137](https://github.com/phosphor-icons/react/issues/137) (2025-06-18, still open): React 19 incompatibility** — the documented custom-icon composition pattern relies on `forwardRef`, which React 19 deprecates.
- **React 19: broken** (documented composition API) *and* **broken under Vite 8**, with no release in 15 months and no commits in 8. You are on both. Disqualified.

### @heroicons/react — `AVOID (insufficient coverage)`
`2.2.0`, **2024-11-18** (~22 months) · MIT · 23,775 stars, only 4 open issues. Repo pushed as recently as 2026-05-12 but only `0.0.0-insiders.*` builds have gone out — **no stable release in 22 months.** **React 19: confirmed-ish** (peer `>= 16 || ^19.0.0-rc`; they're pure stateless SVG function components with no refs or hooks, so genuinely nothing to break). Packaging is actually *better* than lucide's (real `exports` field). **But ~325 icons per style** — that's a marketing-site set. You'll run out in week two and end up mixing sets, which is worse than picking the big one up front.

### Iconify / unplugin-icons — `CONSIDER (technically best, wrong ergonomics for solo)`
`unplugin-icons@23.0.1`, **2026-01-14** · MIT · 4,935 stars. **Vite 8: OK** — Rolldown support landed via #411/#416, both closed 2025-10-01, *before* Vite 8's release; no open Vite-8 issues. It pins `unplugin: ^2.3.11` while `unplugin@3.3.0` is out — worth watching, not currently breaking. **React 19: confirmed by construction** (build-time transform emitting plain SVG components; no runtime React dependency). Requires an `@svgr/core >=7` peer.
Use **`@iconify-json/lucide@1.2.129`** (2026-09-02, ISC, 577 kB unpacked) as a devDependency. 🚩 **Do NOT install `@iconify/json`** — that's the all-sets meta-package at **~449 MB unpacked**, a genuinely painful `node_modules` and CI-cache hit for a home-server project. And `@iconify/react@6.0.2` is the *runtime* variant — not what you want.
The real appeal: **zero runtime, and the dev-server barrel problem simply doesn't exist** because icons resolve at transform time. Strictly better on both axes. Why I don't pick it: a Vite plugin + `@svgr/core` + an icon-set devDep + `unplugin-icons/types/react` in tsconfig, plus magic specifiers (`~icons/lucide/check`) that your editor's go-to-definition and oxlint won't understand — more moving parts than a 10-line alias, for an outcome that's ~335 B gzip per icon either way.

---

# Build it yourself

Seven things no library covers well. Roughly ordered by how much of your product identity lives in them.

### 1. Saved views (requirement 3) — nothing off the shelf, ~3–5 days
There is no library for this and there shouldn't be. It's a Postgres table plus a codec:
```
saved_views(id, workspace_id, team_id, name, owner_id, visibility,
            layout, filter_tree jsonb, group_by, sort, visible_columns jsonb,
            created_at, updated_at)
```
The leverage comes from **one Zod schema for the whole view spec.** It validates the URL (TanStack Router `validateSearch`), validates what you POST, and describes what Go parses. Then "share a view" is just "persist the current search params and hand out a link," and `?view=abc123` hydrating into full state is the same codec run backwards. Get the schema right before you write any UI — everything downstream is generated from it.

### 2. Filter builder UI (requirement 4) — ~1–2 weeks
Tree model + reducer + URL codec (2–4 days), then the Linear-style chip row on Base UI's `Combobox.Chips` with popover editors and 5–6 value-editor types (3–5 days), then the fiddly week: focus management, chip overflow, empty/invalid states, keyboard-only flow. See §9.

### 3. Shortcut registry + help sheet (requirement 6) — ~150–200 lines, half a day to a day
Scope-stack frames over tinykeys, with `useShortcutHelp()` reading the same registry so the `?` sheet cannot drift. See §6. This is the one where building beats every library on *semantics*, not just size.

### 4. The `Skeleton` primitive + the convention (requirement 7) — ~40 lines
See §10. The primitive is trivial; the discipline (`aria-hidden` on skeletons, `aria-busy` on containers, skeletons render the *real* layout) is what makes it work.

### 5. Optimistic drag + fractional-index reconciliation (requirement 1) — ~2–3 days
`fractional-indexing` gives you the key function; the *reconciliation* is yours. Compute the key locally on drop, apply optimistically, `PATCH`, and reconcile if the server returns a different key (because a concurrent drag landed first). Also handle: dragging into an empty column (`generateKeyBetween(null, null)`), dragging to either end (`(null, first)` / `(last, null)`), and key-length growth from repeated same-position inserts — `fractional-indexing-jittered` exists for that last one if it bites. Store keys as `text`, index on `(view_id, sort_key)`, sort lexicographically. **Never floats.**

### 6. Configurable columns mapped to arbitrary fields (requirement 1, later phase) — design now, build later
"Columns eventually map to arbitrary configurable fields, not just status" is a **data-model** requirement disguised as a UI one, and it's the one thing here that gets expensive if you defer the thinking. The board's group-by needs to be `{field_id, field_type}` from day one — even if the UI only offers Status at first — because retrofitting it later means migrating every saved view. Make `group_by` in the saved-views schema a field reference, not an enum.

### 7. Date helpers (§12) — ~40 lines over `Intl`
Relative-time bucketing plus a couple of `Intl.DateTimeFormat` wrappers. Compute sprint boundaries in Go.

---

## Notes, corrections, and what I couldn't verify

**Corrections to things circulating in 2026 write-ups:**
- **react-window is not dead.** Multiple current comparison articles say "no longer actively developed, fixed-size only." bvaughn shipped a v2 rewrite: `2.3.0` on 2026-07-20, React 19 peers, releases through 2026. It's narrower than TanStack Virtual, not stale.
- **day.js has not stalled** — last commit 2026-09-01. Reject it for architecture (no ESM/`exports`, mutating plugin model), not maintenance.
- **`framer-motion` is not deprecated.** It's the React implementation package that `motion` depends on; both are at 13.2.0.
- **kbar shipped a real 1.0** in August 2026 after three years in beta, with React 17/18/19 CI. Reject it for owning too much, not for being dead.
- **tinykeys is maintained again** — real 4.0 in May 2026.
- **`@tanstack/react-hotkeys` does not ship scopes** despite its docs and third-party articles saying so. The scopes guide URL 404s and "scope" appears in zero type definitions.
- **The Base UI npm package renamed.** `@base-ui-components/react` is frozen at `1.0.0-rc.0` (2025-12-04) and will mislead anyone searching npm. Live package: **`@base-ui/react@1.7.0`**.

**A new compatibility axis worth internalizing:** Vite 8 / Rolldown shipped 2026-03-12 and it **broke `@phosphor-icons/react` outright**. Any library whose last release predates March 2026 should be checked against Rolldown, not just against React 19. That's how Phosphor slipped through — its React 19 story was merely warning-level; its Rolldown story is a blank page.

**Unverified / open questions:**
- Whether **Base UI's "Fuzzy Matching" example** uses a built-in matcher via `useFilter()` or composes an external one. If built-in, you can drop `@leeoniya/ufuzzy` (–4 kB). The `useFilter` docs page 404s on the URL patterns I tried. **Check this first — five minutes.**
- React 19 support for **wouter**, **react-querybuilder**, and **SVAR Filter** is *implied by peer ranges* but never explicitly stated by their maintainers.
- **Grouping over cursor-paginated server data** in TanStack Table v9 — the announcement doesn't address manual/server-side mode, and this is the one genuinely hard part of requirement 2. Prototype it early.
- Whether **cmdk's** maintainer returns, and whether **TanStack Hotkeys'** scopes ever land (docs promise them; 0.10.0 doesn't have them).
- I did not runtime-test any of these in a browser beyond the SSR smoke tests my sub-researchers ran against React 19.2.8.

**Licensing summary — everything recommended is permissive:** MIT (`@base-ui/react`, tailwindcss, TanStack ×4, react-hook-form, zod, tinykeys, `@leeoniya/ufuzzy`, sonner, `@formkit/auto-animate`, shadcn/ui), Apache-2.0 (pragmatic-drag-and-drop ×4), ISC (lucide-react), **CC0-1.0** (fractional-indexing, fracdex).

**Loudly flagged as unusable:** `ag-grid-enterprise` (license field: `"Commercial"`; **row grouping is Enterprise-only**, so the free tier doesn't meet requirement 2) · `@mui/x-data-grid-pro`/`-premium` (commercial per-developer; grouping is Pro) · **ReUI Filters** (proprietary paid; **forbids publishing source in public repos and forbids competing OSS products** — fatal for open-core, despite being the best UI fit I found) · Ariakit **Plus** examples (library is MIT; don't paste Plus example code into a public repo) · Motion+ (paid, but **gates zero APIs** — the package is fully MIT and usable) · wouter's **Unlicense** (permissive, occasionally flagged in legal review).

**Estimated total: ~120–150 kB gzip** of runtime JS for all thirteen slots, plus zero-runtime CSS from Tailwind. Four of thirteen slots (skeletons, dates, filter builder, command palette) are correctly served by **zero** additional dependencies.

---

**Sources:** [Base UI](https://github.com/mui/base-ui) · [Base UI quick start](https://base-ui.com/react/overview/quick-start) · [Base UI Form](https://base-ui.com/react/components/form) · [Base UI Combobox](https://base-ui.com/react/components/combobox) · [Base UI Autocomplete](https://base-ui.com/react/components/autocomplete) · [Base UI Forms handbook](https://base-ui.com/react/handbook/forms) · [shadcn/ui — Base UI as default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default) · [Radix vs Base UI 2026](https://www.shadcndeck.com/blog/radix-vs-base-ui) · [Radix Primitives](https://github.com/radix-ui/primitives) · [Headless UI libraries 2026](https://www.greatfrontend.com/blog/top-headless-ui-libraries-for-react-in-2026) · [Tailwind blog](https://tailwindcss.com/blog) · [Tailwind Vite 8 support](https://github.com/tailwindlabs/tailwindcss/discussions/19624) · [pragmatic-drag-and-drop](https://github.com/atlassian/pragmatic-drag-and-drop) · [pragmatic DnD examples](https://atlassian.design/components/pragmatic-drag-and-drop/examples) · [pragmatic DnD touch discussion](https://github.com/atlassian/pragmatic-drag-and-drop/discussions/93) · [dnd-kit](https://github.com/clauderic/dnd-kit) · [dnd-kit #1830](https://github.com/clauderic/dnd-kit/issues/1830) · [fractional-indexing](https://github.com/rocicorp/fractional-indexing) · [fracdex (Go)](https://github.com/rocicorp/fracdex) · [Announcing TanStack Table v9](https://tanstack.com/blog/announcing-tanstack-table-v9) · [Table v9 migration](https://tanstack.com/table/latest/docs/framework/react/guide/migrating) · [TanStack Virtual](https://github.com/TanStack/virtual) · [Virtualization comparison 2026](https://www.pkgpulse.com/guides/tanstack-virtual-vs-react-window-vs-react-virtuoso-2026) · [React Router v8](https://remix.run/blog/react-router-v8) · [React Router modes](https://reactrouter.com/start/modes) · [TanStack Router search params](https://tanstack.com/router/v1/docs/framework/react/guide/search-params) · [TanStack Router custom serialization](https://tanstack.com/router/latest/docs/framework/react/guide/custom-search-param-serialization) · [RHF setError](https://react-hook-form.com/docs/useform/seterror) · [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation) · [Zod Mini](https://zod.dev/packages/mini) · [Standard Schema](https://github.com/standard-schema/standard-schema) · [react-querybuilder props](https://react-querybuilder.js.org/docs/components/querybuilder) · [ReUI license](https://reui.io/legal/license) · [cmdk](https://github.com/pacocoursey/cmdk) · [cmdk #410](https://github.com/pacocoursey/cmdk/issues/410) · [kbar](https://github.com/timc1/kbar) · [Ariakit](https://github.com/ariakit/ariakit) · [Ariakit Plus license](https://ariakit.com/plus/license) · [uFuzzy](https://github.com/leeoniya/uFuzzy) · [tinykeys](https://github.com/jamiebuilds/tinykeys) · [react-hotkeys-hook #1058](https://github.com/JohannesKlauss/react-hotkeys-hook/issues/1058) · [TanStack Hotkeys](https://github.com/TanStack/hotkeys) · [Motion](https://github.com/motiondivision/motion) · [Motion bundle size docs](https://motion.dev/docs/react-reduce-bundle-size) · [Motion+](https://motion.dev/plus) · [caniuse: view transitions](https://caniuse.com/view-transitions) · [caniuse: @starting-style](https://caniuse.com/mdn-css_at-rules_starting-style) · [caniuse: Temporal](https://caniuse.com/temporal) · [React 19.2 release](https://react.dev/blog/2025/10/01/react-19-2) · [sonner](https://github.com/emilkowalski/sonner) · [react-hot-toast #424](https://github.com/timolins/react-hot-toast/issues/424) · [lucide](https://github.com/lucide-icons/lucide) · [lucide #2583](https://github.com/lucide-icons/lucide/issues/2583) · [lucide Vite dev tree-shaking](https://christopher.engineering/en/blog/lucide-icons-with-vite-dev-server) · [phosphor-icons/react #155](https://github.com/phosphor-icons/react/issues/155) · [unplugin-icons](https://github.com/unplugin/unplugin-icons) · npm registry API, GitHub REST API, bundlephobiaagentId: a17c558f3b51cf9d5 (use SendMessage with to: 'a17c558f3b51cf9d5', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 163275
tool_uses: 48
duration_ms: 1216325</usage>