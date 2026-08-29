---
name: XMLwiki-create
description: Create new LaminarFlow XMLwiki entries — draw.io class cards and function cards — for Go types and funcs in LaminarFlow-Backend and React/TypeScript components and functions in LaminarFlow-Frontend, using the diagram templates in this repo's README. Makes the classes/<Class>/ folders and standaloneFunctions/<end>/ diagram files, then runs node build.js. Use when the user wants something added to the XML wiki, wants a class or function diagrammed into the wiki, or is documenting what a PR added. Invoke as /XMLwiki-create <classes, functions, files, or paths>.
---

# XMLwiki-create — LaminarFlow

Add new entries to the LaminarFlow XML wiki for the types and functions named in the input.

**First, read `.claude/skills/XMLwiki/authoring.md`.** It holds the roots, the templates,
the box order, the geometry, the escaping and the subagent protocol. Everything below
assumes it.

Transcription, not invention. Every box comes from the real declaration in the real source
file — read it. Never write a card from a filename, a memory, or a guess.

---

## 1. Resolve the roots

Wiki root (`$WIKI`) and source root (`$SRC`) per authoring.md §1. Remember there are **two**
source repos; resolve `$SRC` per target, not once for the run.

## 2. Resolve the input to concrete types and functions

The input **must** come down to one or more types or functions. Accepted forms:

| Input | Becomes |
| --- | --- |
| `Server` | that Go struct / TS class |
| `Server.Handle` | that one method |
| `healthzHandler` | that standalone function |
| a file path | every type and top-level function declared in it |
| a directory or glob | same, for every source file under it |
| `backend` / `frontend` | everything currently undocumented in that repo |
| "what my PR touched" / no input | every type and top-level function declared in the branch's changed files (see XMLwiki-update §2 for the diff commands) |

Locate each one with Grep in the right `$SRC` and confirm the declaration exists. Then:

- **Test sources** — drop them before anything else, per authoring.md §1a: `*_test.go`,
  `*.test.tsx`, `*.spec.ts`, `__tests__/`, `testdata/`, and friends. Report the count, not
  the list.
- **Nothing resolvable** — stop. Say what you looked for and which repo you looked in, and
  ask for concrete names, files, or paths. Do not invent a target.
- **Resolvable but not a type or function** (a config file, a `go.mod`, a CSS file, an SVG,
  a `tsconfig`) — say so and skip it. The wiki only holds class cards and function cards.
- **More than ~8 targets** — list them and confirm the scope before generating.

Print the resolved target list before you start writing, grouped by end.

## 3. Check the wiki first

For each target, look for an existing entry: is there a `classes/<Name>/` folder, or a
diagram with that name anywhere under `classes/` or `standaloneFunctions/`?
Grep `$WIKI` — do not trust `wiki-files.js` alone, it goes stale.

- Already present → **do not create a second card.** Bring it up to date instead, using the
  rules in `XMLwiki-update` §3, and say in the report that it was updated rather than
  created.
- Name collides with a *different* type or standalone function already in the wiki → stop
  and raise it. Class names and standalone function names must be unique wiki-wide,
  including **across the two ends**, and a collision makes one of them permanently
  unreachable. `main` (Go) vs `main_tsx` (React) is the precedent for how to resolve one.

## 4. Generate

Placement, box order, geometry, refs and escaping per authoring.md §3–§7. Location boxes
are repo-prefixed; function pages go under `standaloneFunctions/backend/` or
`standaloneFunctions/frontend/`.

Per type target, in one wiki file:

1. the class card, named exactly like its folder, first in the file;
2. then one function card per method, in **source declaration order**, each with its
   `TypeName::` box;
3. every method also gets a linked line in the class card's Methods box, using
   `#func#TypeName.methodName`.

Per standalone-function target: one function card in
`standaloneFunctions/<end>/<SourceFile>.js`, appended in source order if the file already
exists.

Create folders and files as needed. LaminarFlow is small enough that inline is the normal
case; fan out to subagents only past 3 source files (authoring.md §9) and validate
everything they return.

## 5. Validate, then build

From `$WIKI`:

```bash
node .claude/skills/XMLwiki/validate.js . <every file you wrote>
```

Fix every finding. Then:

```bash
node build.js
```

`build.js` is required here — new files and folders do not appear in the wiki until
`wiki-files.js` is rewritten. Fix every warning your change caused and re-run. Report
pre-existing warnings in unrelated files without touching them.

## 6. Report

- created: each class card and function card, with its wiki path
- updated instead of created: targets that already existed
- skipped: what and why (not a type or function, unresolvable, name collision, test source)
- `build.js` output: diagram counts, and any warnings — yours fixed, others listed
- refs pointing at types that are not in the wiki yet — expected and fine, the wiki is
  deliberately partial, but list them so the user knows the Doctor tab will show them
- if this run wrote the wiki's **first class card**, say so — authoring.md §2 points future
  runs at the worked examples, and a class example is currently missing

Do not commit anything.
