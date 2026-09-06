# XMLwiki authoring reference — LaminarFlow

Shared by `/XMLwiki-create` and `/XMLwiki-update`. Read this before writing any diagram.

LaminarFlow is two repos in two languages. Everything below is written for **Go** and
**TypeScript/React**, not the Kotlin the upstream XMLWiki assumes.

---

## 1. Resolve the two roots

**Wiki root** — this repo, `LaminarFlowXMLWIki`. Resolve it as the first of these that
contains `build.js`, `wiki.html`, `classes/` and `standaloneFunctions/`:

1. `$XMLWIKI_ROOT`
2. the current working directory
3. `~/Developer/LaminarFlow/LaminarFlowXMLWIki`

If none match, stop and ask where the wiki lives. Everything below is relative to the wiki
root. Referred to as `$WIKI`.

Do **not** fall back to `~/Developer/XMLWiki` — that is the other wiki, and writing
LaminarFlow cards into it is the one mistake that is annoying to undo.

**Source root** — the repo the diagrams describe. LaminarFlow has two, siblings of the
wiki:

| Repo | `$SRC` | Language |
| --- | --- | --- |
| backend | `../LaminarFlow-Backend` | Go |
| frontend | `../LaminarFlow-Frontend` | TypeScript + React |

Pick per target, from the file path or the language of the construct. A single run may
touch both; resolve `$SRC` per file rather than once for the run. If the target names no
repo and exists in neither, ask rather than guessing.

---

## 1a. Test sources are out of scope

**Never create a wiki entry for anything in a test source set.** Skip a source file when
any of these hold:

- **Go** — basename ends in `_test.go`.
- **TypeScript** — basename ends in `.test.ts`, `.test.tsx`, `.spec.ts` or `.spec.tsx`, or
  the path contains a `__tests__/`, `__mocks__/` or `e2e/` segment.
- either — the path contains a directory segment whose name is `test`, `tests`,
  `testdata`, `fixtures` or `mocks`, case-insensitive.

This covers test files, their helpers, **and** test infrastructure like page objects,
fixtures and shared harnesses. There is no page-object exception.

Report skipped files in one line — "skipped N test-source files" — rather than listing
every one. Do not ask whether to include them; the answer is no.

If the user explicitly names a test file as a target, say the rule, and create it only if
they confirm after that.

---

## 2. Get the templates — never write mxCell XML from memory

The two templates live at the bottom of `$WIKI/README.md` under `## Diagram Templates:`,
one per line:

- `Class: ` + a backticked `<mxGraphModel>…</mxGraphModel>`
- `function: ` + a backticked `<mxGraphModel>…</mxGraphModel>`

Read that section every run and fill in a **copy** of the template string. The README is
the single source of truth; if the user changes a template, the next run follows it.

The templates are worded for Kotlin (`fun`, `@Composable`, `companion object`). Keep every
box and its order; swap the language-specific words. `$WIKI/README.md` has a translation
table under **Adapting the templates to Go and TypeScript** — read it too.

For filled-in worked examples in the right languages, read:

- `$WIKI/classes/Service/document_go.js` — a Go struct with a `NewX` factory and two
  methods: the class card, then a method card with its `Service::` box
- `$WIKI/classes/Config/config_go.js` — a plain struct: fields only, no factory, no methods
- `$WIKI/standaloneFunctions/backend/health_go.js` — Go funcs returning a closure, with a
  raw-string body
- `$WIKI/standaloneFunctions/frontend/TicketList_tsx.js` — a React component card, including
  how a JSX tree gets escaped
- `$WIKI/standaloneFunctions/frontend/main_tsx.js` — a whole-module card for a file that
  declares no function

---

## 3. Where things go on disk

| Source construct | Wiki location |
| --- | --- |
| Go struct / interface, TS class | `classes/<Name>/<SourceFile>.js` |
| type declared **inside** another type | `classes/<Outer>/<Name>/<SourceFile>.js` |
| a method of a type (Go: any func with a receiver) | the **2nd..Nth diagram inside that type's file**, in source declaration order |
| top-level Go func with no receiver | a diagram in `standaloneFunctions/<end>/<SourceFile>.js` |
| React component, hook, or top-level TS function | a diagram in `standaloneFunctions/<end>/<SourceFile>.js` |

`<end>` is `backend` or `frontend`. **Function pages are grouped by repo** — this wiki
covers two ends and the nav has to say which one you are in. Class folders are not grouped
that way: class and standalone-function names are unique wiki-wide, so a class folder sits
directly under `classes/`, and its location box carries the repo name.

`<SourceFile>` is the source file's basename with every `.` turned into `_`:
`main.go` → `main_go.js`, `Button.tsx` → `Button_tsx.js`. One wiki file per source file.

**Two collisions the naming has to dodge:**

- *Same basename twice in one end* — Go's `cmd/<bin>/main.go` files. Nest the page under the
  source directory that tells them apart: `standaloneFunctions/backend/cmd/migrate/main_go.js`.
  The nav renders the trail (`backend / cmd / migrate / main_go`). The root `main.go` stays
  flat at `standaloneFunctions/backend/main_go.js`.
- *Same function name twice wiki-wide* — every `cmd` binary's `func main()`, or `config.Load`
  vs `migrate.Load`. Suffix or prefix with what disambiguates and say so in the card's box 3:
  `main_migrate`, `main_openapi`, `main_reindex`; `config_Load`, `migrate_Load`. A file that
  declares no function but earns a card (module-level code) is named after the file:
  `main_tsx`, `client_ts`.

Go has no classes. A struct with methods still earns a `classes/<Struct>/` folder: the
struct is the class diagram, each method a tab. A plain func goes in
`standaloneFunctions/`. React components are functions — they belong in
`standaloneFunctions/`, one file per source file.

Embedding and interface satisfaction are **not** expressed by nesting folders — they go in
the supertypes box with a `#class#` link. Only *declared-inside* types nest.

Rules that follow from the wiki engine:

- The **folder** names the class. The first diagram in the file must be named exactly like
  the folder, or the Doctor tab flags a mismatch.
- Class names must be unique wiki-wide. Standalone function names must be unique across
  `standaloneFunctions/` — **including across `backend/` and `frontend/`**. Go's `main`
  already holds that name, which is why the frontend entry point is carded as `main_tsx`.
  When both ends genuinely have the same name, suffix the less canonical one and say so in
  the report.
- Method names only need to be unique within their class.
- Diagram names must be valid JS identifiers — no spaces, no dots.
- `top`, `closed`, `history`, `location`, `navigator`, `document` cannot be used bare.
  Write `D.location = '…'` instead.

After adding or renaming any **file or folder**, `node build.js` must run (step 8).

---

## 4. Box order

Fill boxes in this order, top to bottom. Drop a box entirely when it does not apply —
never leave a box holding template hint text.

### Class card

1. **Location path** — always, and **prefixed with the repo name**:
   `LaminarFlow-Backend/main.go`, `LaminarFlow-Frontend/src/main.tsx`. This is how a reader
   tells the two ends apart; it is not optional and it is not repo-relative.
2. **`Outer::`** — only if declared inside another type. Linked, and keep both colons.
3. **Supertypes** — Go: embedded types and the interfaces the type satisfies, when the code
   makes that explicit. TS: `extends`/`implements`. Only if any apply. Link every type that
   has its own card.
4. **Annotations / keywords** — Go: `type … struct`, `type … interface`, `generic`. TS:
   `export default`, `abstract`, `readonly`. Only if any apply.
5. **`type Name struct`** / **`class Name`** — always. Name bold.
6. **Constructor args** — Go has no constructors; use the `NewX` factory's params if there
   is one, else omit the box. TS: the constructor signature. One param per line, typed, UML
   visibility, `(` and `)` on their own bold lines. **Delete the "Constructor Args" hint
   label** — the box carries no header.
7. **Attributes** — keep the `Attributes` header. Struct fields / class fields, one per
   line, typed, in source order. Underline package-scoped (Go) or `static` (TS) members.
   Omit the box if there are none.
8. **Methods** — keep the `Methods` header. One signature per line,
   `name(param: T): R`, **always link the name** — the method cards hang off these links.
   Omit if none.
9. **Nested types** — keep the `Nested types` header. Types declared inside this one
   (linked), and Go const blocks that act as the type's enum. Omit if the type declares
   none.

The type name and the constructor params are always **separate boxes** (5 and 6), and
supertypes sit directly under the outer-type box.

### Function card

1. **Location path** — always, repo-prefixed, same rule as above.
2. **`TypeName::`** — only if the function is a method (Go: has a receiver). Linked, both
   colons kept. Name the receiver's type, not the receiver variable.
3. **Annotations / keywords** — Go: `package main`, `go`-routine entry, `defer`-heavy.
   TS/React: `export default`, `async`, `React function component`, `hook`. Only if any
   apply. This is also where a card says something a reader needs up front — the
   `main_migrate` card uses it to say the function is really `main`, renamed for the wiki.
4. **`func name(params)`** / **`function name(params)`** — always. One param per line when
   there is more than one. For an anonymous func, write `func(` and say in box 3 where it
   is registered.
5. **Returns …** — **always present**, even for `void`. Write `Returns nothing` and say
   what happens instead, e.g. "the response goes out through w".
6. **`-> return statement`** — **always present**. Write `-> void` when nothing is
   returned.
7. **Body** — always. `{` and `}` on their own lines, real code, one statement per line,
   never wrapped mid-call. Group into beats with one blank line between beats. Link calls
   to anything that has a card. Comments say *why*, not *what*, condensed to 1–2 lines.
   Pseudo-code when the real body is enormous — a JSX tree is the usual case, and
   `TicketList_tsx.js` shows the house way to condense one.

Boxes 5 and 6 are never dropped. That is the rule people get wrong most often, and
`validate.js` checks it — including for Go's `func`, which the upstream validator misses.

Go's second return value is the error. Say what it means in box 5, not just `error`.

### UML visibility

| | `+` public | `-` private | `#` protected | `~` package |
| --- | --- | --- | --- | --- |
| **Go** | exported (capitalised) | — | — | unexported (lowercase) |
| **TS** | `public` / default | `private` / `#field` | `protected` | — |

Go has two levels, not four: capitalised is `+`, lowercase is `~`. Do not invent `-` for Go.

Mirror the declaration exactly: every field, every method, in source order. Do not invent
members and do not silently omit them.

---

## 5. Geometry

Every box is a full-width stacked row:

- **One width per card, identical on every box.** `620` is the house minimum and the
  template default. Widen the whole card when the content needs it — this wiki's Go cards
  are `700` and its TS cards are `760`, because Go and JSX lines run long. Never widen one
  box alone; `validate.js` fails a card whose boxes disagree.
- `x` identical across every box in the diagram (the templates use `x="850"` and no `x`
  respectively — keep whatever the template gives, applied uniformly).
- `y` must stack exactly: `y[0]` = the template's first `y`, then
  `y[n] = y[n-1] + height[n-1]`. When a box is dropped, close the gap — no holes, no
  overlaps.
- `height` ≈ `30` for a single-line box, else `20 × lines`. Approximation is fine
  (`resizeHeight=1` lets draw.io fit the real content) but the declared `y` values must
  agree with the declared heights.
- `id` values only need to be unique within the diagram; gaps are fine after dropping
  boxes.

At width 620 about 72 characters fit; at 760, about 88.

---

## 6. Refs

| Ref | Target |
| --- | --- |
| `#class#Server` | a class card |
| `#func#Server.Handle` | a **method** — always qualified by its type |
| `#func#registerPing` | a standalone function |
| `#page#Server` | a class page |

**Qualify every method ref.** A bare `#func#Handle` only ever resolves to a *standalone*
function, so an unqualified method ref lands in the Doctor tab as broken. The README
template writes `#function#methodName` as a placeholder — replace it with
`#func#TypeName.methodName`.

Put refs in a shape's **Link field** for whole-shape clicks, or as a real
`<a href="#func#…">` inside a label (what the templates and every current card do), or as a
visible label with two hashes (`##class#Server`).

**Cross-end refs are the point.** Refs carry no path, so a frontend card links to a backend
card with the same syntax as anything else. When a component fetches an endpoint, link the
fetch line to the handler's card. This wiki spans both ends precisely so that works.

---

## 7. Escaping — the part that silently corrupts diagrams

Three layers of escaping stack up. Getting a layer wrong produces a diagram that renders as
garbage or fails to load at all.

**Layer 1 — the JS string literal.** Write the diagram on **one line** as a single-quoted
literal:

```js
ComponentName = '<mxGraphModel>…</mxGraphModel>';
```

- Do **not** use backticks. TS template literals contain `${…}`, which ends a template
  literal early and corrupts the file.
- Single quotes are also what makes **Go raw strings** work: a backtick is meaningless
  inside a single-quoted literal, so `` w.Write([]byte(`{"status":"ok"}`)) `` transcribes
  as-is. `standaloneFunctions/backend/main_go.js` carries a comment saying why the file must
  stay single-quoted. Preserve that comment.
- Double quotes are impossible — the XML's own attributes use `"`.
- An apostrophe inside code becomes `\'`, or better `&#39;` in the value so the literal
  never sees one.
- **A literal backslash must be doubled.** A single `\` is eaten silently by the JS
  literal, with no error anywhere — `\d` renders as `d`, `\n` as a newline. Write `\\d`.
- A single-quoted literal cannot span lines, so the diagram is one long line. That is the
  house style.

**Layer 2 — the XML attribute.** Box content lives in `value="…"`, so the HTML inside it is
XML-escaped: `<div>` → `&lt;div&gt;`, `"` → `&quot;`, `&` → `&amp;`.

**Layer 3 — code text inside that HTML.** Anything that is a literal character in the
*code* needs both layers, i.e. double escaping:

| In the code | Write in `value="…"` |
| --- | --- |
| `<` (JSX tags, generics, `<=`) | `&amp;lt;` |
| `>` | `&amp;gt;` |
| `->` | `-&amp;gt;` |
| `=>` (arrow functions) | `=&amp;gt;` |
| `&` / `&&` | `&amp;amp;` |
| `"` | `&quot;` |
| indent (one level) | `&amp;nbsp; &amp;nbsp;` |
| blank line between beats | `&lt;div&gt;&lt;font&gt;&lt;br&gt;&lt;/font&gt;&lt;/div&gt;` |

**JSX is where this bites hardest.** Every tag in a component body is a literal `<`:
`<StrictMode>` is written `&amp;lt;StrictMode&amp;gt;`, and `<App />` inside a link becomes
`&amp;lt;&lt;a href="#func#App"&gt;App&lt;/a&gt; /&amp;gt;`. A single `&lt;` where
`&amp;lt;` was needed makes draw.io eat the rest of the line as a tag. Compare against
`main_tsx.js`, which has the linked-JSX case already solved.

Each content line is its own `<div><font>…</font></div>`. Small-print hint lines use
`<font face="Helvetica" style="font-size: 12px;">`; code lines use the box's
`fontFamily=Andale Mono`.

---

## 8. Always finish with the build

Before the build, run the structural validator on the files you touched, from `$WIKI`:

```bash
node .claude/skills/XMLwiki/validate.js . <file...>
```

It catches leftover template hint text, truncated JS literals, disagreeing or too-narrow
widths, `y` gaps/overlaps, missing `Returns`/`->` boxes, method cards missing their
`Class::` box, class folders whose first diagram is misnamed, and unqualified method refs.

This copy differs from the upstream one in two ways, both required here: it recognises Go's
`func` (including methods with receivers and anonymous literals) as a function card, so the
mandatory-box checks actually run on backend cards; and its backtick check is quote-aware,
so a Go raw string inside a single-quoted diagram is not a false positive.

Then, from the wiki root:

```bash
node build.js
```

It rewrites `wiki-files.js` (required for any new file or folder), regenerates `xml/` — one
`.drawio` per card, the raw `<mxGraphModel>`, via `export-xml.js` — and `wiki-bundle.js` —
every card's source, which is what renders when the page is viewed inside Obsidian — and
prints warnings:
duplicate class/function names, missing class diagrams, files sitting directly in
`classes/`, unassignable names. **Fix every warning your change caused**, then re-run.
Report any pre-existing warnings you did not introduce rather than silently fixing
unrelated files.

Finally, open the **Doctor** tab in `wiki.html` if anything was renamed or moved — it is
the only check that resolves every ref.

---

## 9. Fanning out to subagents

Scale like this:

- **≤ 3 source files** — do the whole thing inline. Dispatching costs more than it saves.
  A single ticket's delta is usually this size.
- **> 3 source files** — one subagent per **source file**. Never split a source file across
  agents: a class and all of its methods live in one wiki file, so two agents editing it
  would clobber each other. Run in parallel batches of at most 6.

Use the `Agent` tool with `subagent_type: general-purpose`. `model: haiku` is the default
for a mechanical re-sync; the user may ask for `opus` on a large create run (the epic-2 fill
used opus), and the validation below applies either way.

Each subagent prompt must carry:

1. the operation (`create` or `update`) and the exact target list for that one file
   (type name, method names, function names — no vagueness);
2. the absolute **source** file path and the absolute **wiki** file path to write, plus
   which end it is (`backend` / `frontend`) and therefore the language;
3. an instruction to read `$WIKI/README.md`'s `## Diagram Templates:` section and
   `$WIKI/.claude/skills/XMLwiki/authoring.md` first, and to copy the matching worked
   example from §2 — `classes/Service/document_go.js` and `standaloneFunctions/backend/health_go.js`
   for Go, `standaloneFunctions/frontend/TicketList_tsx.js` for TypeScript — as the style
   reference. Give every agent the same name map (wiki name → source symbol) for the whole
   run, so cross-links agree.

Do **not** paste the templates into the prompt. Having the agent read them keeps the prompt
small and keeps it current if the user edits a template.

Ask each agent to report back only: the wiki file it wrote, and one line per diagram
listing the diagram name and which boxes it included.

### Validating what comes back — not optional

A haiku agent will sometimes hallucinate a member or drop a mandatory box. Never relay an
agent's claim as done. For every file an agent touched:

1. `node .claude/skills/XMLwiki/validate.js . <file>` — must come back clean.
2. Re-read the real source declaration and diff it against the card by eye: type name,
   embedded types, every field, every method signature, return type. For method cards,
   check the signature and that the body's calls exist in the real body.
3. Confirm placement: folder name == type name, file name == source basename with `.`
   replaced by `_`, function pages under the right `backend/` or `frontend/` folder,
   nesting matches source nesting.
4. On any failure, fix it yourself. Re-dispatch a file at most once.

Then run `node build.js` (step 8) once, at the end, for the whole run.
