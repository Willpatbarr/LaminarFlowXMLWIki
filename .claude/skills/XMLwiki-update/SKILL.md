---
name: XMLwiki-update
description: Bring existing LaminarFlow XMLwiki entries back in sync with the real codebase — regenerate changed class and function cards, move entries when the source moved, delete entries whose code is gone, and add diagrams for new methods. Covers both LaminarFlow-Backend (Go) and LaminarFlow-Frontend (React/TypeScript). Defaults to the current branch's PR delta, fans out to cheap subagents for large scopes and validates their output, then runs node build.js. Use at the end of a PR, or when the user says the wiki is stale or wants targets re-synced. Invoke as /XMLwiki-update [classes, functions, files, paths, or nothing for the branch delta].
---

# XMLwiki-update — LaminarFlow

Reconcile the wiki with the code. The wiki is the copy that drifts; the source is the truth.

**First, read `.claude/skills/XMLwiki/authoring.md`.** It holds the roots, the templates,
the box order, the geometry, the escaping and the subagent protocol.

Two rules that shape everything here:

- **Minimal diffs.** Regenerate only the boxes whose facts changed. Boxes that are still
  correct stay byte-identical, so the user's own hand edits and prose survive.
- **Never touch entries outside the resolved scope.** The wiki is deliberately incomplete;
  drift elsewhere is not this run's problem.

---

## 1. Resolve the roots

Wiki root (`$WIKI`) and source root (`$SRC`) per authoring.md §1. There are **two** source
repos and they branch independently — `E-LAM-XXXX-B` on the backend, `E-LAM-XXXX-F` on the
frontend, with ticket branches off each epic. Resolve and diff them separately.

## 2. Resolve the scope

**No input — the default, and the end-of-PR case.** Take the current branch's full delta in
each `$SRC` that has one. Ask the user which end they mean only if neither repo is on a
non-default branch.

```bash
git -C "$SRC" rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
git -C "$SRC" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null
```

Use `origin/HEAD` for the default branch, falling back to `origin/main`, `origin/master`,
then `origin/develop` — whichever exists. **LaminarFlow tickets branch off an epic branch,
not off `main`**, so when the current branch is a ticket branch (`LAM-<n>-B` / `-F`) and its
epic (`E-LAM-<n>-B` / `-F`) exists, diff against the **epic**; that is the real PR base.
Say which base you picked.

```bash
BASE=$(git -C "$SRC" merge-base HEAD "$DEFAULT")
git -C "$SRC" diff --name-status "$BASE"...HEAD
git -C "$SRC" status --porcelain
```

Committed **and** uncommitted, because the PR is not open yet. Keep the status letters —
`R` (renamed) and `D` (deleted) drive the move and delete cases below.

**With input** — type names, `Type.method`, function names, file paths, directories or
globs. Resolve them the same way `XMLwiki-create` §2 does.

**Drop test sources first**, per authoring.md §1a — `*_test.go`, `*.test.tsx`, `*.spec.ts`,
`__tests__/`, `testdata/` and friends. Report the count, not the list.

Then turn the remaining file list into wiki entries: for each changed source file, find
every wiki diagram whose card claims that source path (grep `$WIKI` for the location-path
text, which is repo-prefixed), plus every wiki entry named after a type or function
declared in it.

**Report the split before writing anything:**

- **in the wiki and in the code** → sync (§3)
- **in the wiki, gone from the code** → delete (§4)
- **in the code, not in the wiki** → *not this operation's job.* List them and ask whether
  to run `/XMLwiki-create` on them. Do not silently create.

If the scope covers more than ~8 targets, confirm before proceeding.

## 3. Sync what exists in both

For each entry, read the real declaration in `$SRC` and compare box by box.

| What changed in source | What to do in the wiki |
| --- | --- |
| file moved or package changed | rewrite the location-path box, keeping the repo prefix; move the wiki file if the source basename changed (folder name still follows the type name) |
| code moved between the two repos | move the wiki file to the other `standaloneFunctions/<end>/` folder and rewrite the location box's repo prefix. Refs carry no path, so nothing else breaks |
| type renamed | rename the folder **and** the first diagram to match, then grep `$WIKI` and fix every `#class#Old`, `#func#Old.method` and `Old::` ref |
| type now declared inside another | move the folder to `classes/<Outer>/<Name>/` and add the `Outer::` box |
| no longer nested | move the folder back up to `classes/<Name>/` and drop the `Outer::` box |
| embedded types, interfaces or keywords changed | rewrite that box; drop the box if it no longer applies |
| constructor / `NewX` params changed | rewrite the constructor box; drop it if there are none now |
| struct fields or class fields changed | rewrite the Attributes box, keeping source order |
| method signature changed | rewrite the `func …` box on its card **and** its line in the class card's Methods box |
| method body changed | rewrite the body box; keep the beat grouping and the `why` comments unless they are now wrong |
| return type changed | rewrite both the `Returns` box and the `->` box. Never drop them — `void` still gets both |
| new method in source | add a function card in source declaration order in the same wiki file, plus its linked line in the Methods box |
| method deleted | delete its diagram and its line in the Methods box |
| top-level function became a method | move the diagram from `standaloneFunctions/<end>/<file>.js` into the type's file and add its `Type::` box |
| method became a top-level function | the reverse — move it out, drop the `Type::` box, remove its Methods line |
| an anonymous func literal got a real name | rename the diagram to the real name, drop the "the name is the wiki's, not the code's" note in box 3, and fix every ref |

After any move or rename, `y` values still have to stack (authoring.md §5) and every dropped
box's space has to close up.

**The scaffold case.** `standaloneFunctions/frontend/App_tsx.js` currently documents the
unmodified Vite starter, and its box 3 says so in caps. The first time real LaminarFlow UI
replaces that component, **redraw the card from scratch** rather than diffing box by box,
and delete the scaffold warning. Same for any other card whose box 3 carries that kind of
notice.

## 4. Delete what the code no longer has

Only after confirming the declaration is really gone — grep the right `$SRC` for the name,
and check the diff's `D`/`R` letters. A file that merely moved is a §3 move, not a delete.
So is a file that moved between the two repos.

- **method or standalone function gone** → delete its diagram, and its line in the class
  card's Methods box.
- **type gone** → delete `classes/<Name>/` and its files. If it holds nested type folders
  whose types still exist in source, relocate those first — never delete a live entry as
  collateral.
- **wiki file left with no diagrams** → delete the file. **Folder left empty** → delete the
  folder, unless it is `classes/` or a `standaloneFunctions/<end>/` folder, which stay as
  the structure.
- **refs elsewhere now point at nothing** → grep `$WIKI` for `#class#<Name>` and
  `#func#<Name>`, list every hit in the report, and ask before editing cards outside the
  scope. The Doctor tab will show them either way.

## 5. Large scopes: subagents

Past 3 source files, one haiku subagent per source file, batches of 6, per authoring.md §9.
LaminarFlow is currently far below that line — inline is the normal case. Give each agent
the operation, the exact target list, the source path, the wiki path, and which end it is.

Validate every returned file — validator clean, card re-checked against the real
declaration, placement confirmed. Do not relay an agent's report as fact.

Do the deletes and moves (§4 and the move rows of §3) **yourself**, inline. Never hand a
subagent a deletion or a folder move.

## 6. Validate, then build

From `$WIKI`:

```bash
node .claude/skills/XMLwiki/validate.js . <every file you touched>
```

Fix every finding. Then:

```bash
node build.js
```

Required after any file or folder add, move, rename or delete — `wiki-files.js` has to be
rewritten or the wiki loads the old list. Fix every warning your change caused and re-run.

## 7. Report

- synced: entry, and which boxes changed
- moved / renamed: from → to, plus how many refs were rewritten
- deleted: entry, and the evidence it is gone from source
- in code but not in the wiki: the list, with the offer to run `/XMLwiki-create`
- refs now dangling, in or out of scope
- which diff base you used per repo, and whether it was the epic branch or the default
- `build.js` output, warnings split into yours-fixed and pre-existing

Do not commit anything.
