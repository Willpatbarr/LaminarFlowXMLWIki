---
name: XMLwiki
description: Entry point for the LaminarFlow XML wiki of draw.io class and function cards — the wiki is this repo, LaminarFlowXMLWIki, and it documents the sibling LaminarFlow-Backend (Go) and LaminarFlow-Frontend (React/TypeScript) repos. Dispatches to /XMLwiki-create for new entries and /XMLwiki-update for re-syncing existing ones against the codebase, and holds the shared authoring reference and structural validator. Use when the user mentions the XML wiki, XMLWiki, or wants LaminarFlow code diagrammed into or re-synced with it without naming the operation. Invoke as /XMLwiki create <targets>, /XMLwiki update <targets>, or /XMLwiki <targets>.
---

# XMLwiki — LaminarFlow

Front door for the LaminarFlow XML wiki. This skill only routes; the work is defined
elsewhere.

This is the **LaminarFlow** copy, scoped to this repo. It shadows the user-level
`~/.claude/skills/XMLwiki`, which points at `~/Developer/XMLWiki` and is Kotlin/Android
flavoured. Same commands, same house style, different roots and different languages. Fixes
to the engine (`wiki.html`, `build.js`) are worth carrying between the two; the cards and
these skills are not.

| Files in this folder | What it is |
| --- | --- |
| `authoring.md` | the shared reference — roots, templates, box order, geometry, escaping, refs, subagent protocol. **Both operations read it first.** |
| `validate.js` | `node validate.js <wikiRoot> [file…]` — structural check both operations must pass before `build.js` |

## Routing

| Input | Do this |
| --- | --- |
| `create <targets>` | follow `.claude/skills/XMLwiki-create/SKILL.md` |
| `update <targets>` | follow `.claude/skills/XMLwiki-update/SKILL.md` |
| no verb, targets given | resolve the targets, grep the wiki for them, then: any that already exist → **update**; any that do not → **create**. Say which you chose per target before writing. |
| no verb, no targets | **update** on the current branch's delta — the end-of-PR case |

Both operations finish with `node build.js` in the wiki root. Neither commits anything.
