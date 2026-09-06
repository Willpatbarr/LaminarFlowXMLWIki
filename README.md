# LaminarFlowXMLWiki

The draw.io wiki for **LaminarFlow** — both ends of it, in one place.

Drop draw.io diagrams into folders. Open `wiki.html` in Chrome. They're a linked wiki.

No server, no build step, no dependencies. `wiki.html` reads the folders at load time and
generates the pages itself, HTMLer-style — always-dropdown left nav, one page per class,
one tab per diagram.

Same engine as [XMLWiki](https://github.com/Willpatbarr/XMLWiki), separate content. Fixes to
`wiki.html` / `build.js` are worth carrying across; the cards are not.

---

## What LaminarFlow is

| Repo | Stack | Where |
| --- | --- | --- |
| `LaminarFlow-Backend` | Go 1.27, stdlib `net/http` | `../LaminarFlow-Backend` |
| `LaminarFlow-Frontend` | React 19 + TypeScript + Vite | `../LaminarFlow-Frontend` |

Both ends live in the same wiki. The **first box of every card** is the location path, and
it starts with the repo name — `LaminarFlow-Backend/main.go`,
`LaminarFlow-Frontend/src/main.tsx` — so a card always says which end it belongs to.

Function pages are grouped one level deeper to match:

```
standaloneFunctions/
  backend/
    main_go.js
  frontend/
    Button_tsx.js
    main_tsx.js
```

The nav indents them under that folder. Classes work the same way once there are any —
see **Structure** below.

### What's carded right now

Everything E-LAM-0001 and E-LAM-0002 left behind — both repos as they stand on `main`
after epic 2. Test sources, generated files, configs and tooling scripts are not carded.

**Backend — `classes/`** (Go structs; one folder per type)

| Class | Source | Methods |
| --- | --- | --- |
| `Config` | `internal/config/config.go` | — |
| `PingBody`, `PingOutput` | `internal/api/ping.go` | — |
| `Service` | `internal/document/document.go` | `Save`, `RebuildIndex` |
| `indexedDoc` | `internal/document/document.go` | — |
| `handler` | `internal/frontend/frontend.go` | `ServeHTTP`, `serveFile` |
| `Migration`, `Record` | `internal/migrate/migrate.go` | — |

**Backend — `standaloneFunctions/backend/`** (package-level funcs; one page per source file)

| Page | Source | Cards |
| --- | --- | --- |
| `main_go` | `main.go` | `main`, `ensureSchema`, `frontendFS`, `healthcheck` |
| `cmd / migrate / main_go` | `cmd/migrate/main.go` | `main_migrate`, `usage` |
| `cmd / openapi / main_go` | `cmd/openapi/main.go` | `main_openapi` |
| `cmd / reindex / main_go` | `cmd/reindex/main.go` | `main_reindex` |
| `api_go` | `internal/api/api.go` | `writeJSON`, `notFound` |
| `health_go` | `internal/api/health.go` | `live`, `ready` |
| `openapi_go` | `internal/api/openapi.go` | `NewHumaAPI` |
| `ping_go` | `internal/api/ping.go` | `registerPing` |
| `routes_go` | `internal/api/routes.go` | `NewMux` |
| `config_go` | `internal/config/config.go` | `config_Load`, `getenv` |
| `db_go` | `internal/db/db.go` | `Connect`, `Check` |
| `document_go` | `internal/document/document.go` | `NewService`, `indexBody` |
| `text_go` | `internal/document/text.go` | `fieldText` |
| `frontend_go` | `internal/frontend/frontend.go` | `New` |
| `migrate_go` | `internal/migrate/migrate.go` | `migrate_Load`, `split` |
| `runner_go` | `internal/migrate/runner.go` | `withLock`, `appliedVersions`, `Up`, `Down`, `apply`, `Status`, `Pending`, `Baseline` |

**Frontend — `standaloneFunctions/frontend/`** (components, hooks, module entries)

| Page | Source | Cards |
| --- | --- | --- |
| `main_tsx` | `src/main.tsx` | `main_tsx` — mounts the router under StrictMode |
| `__root_tsx` | `src/routes/__root.tsx` | `RootLayout` |
| `index_tsx` | `src/routes/index.tsx` | `HomePage` |
| `TicketList_tsx` | `src/features/tickets/components/TicketList.tsx` | `TicketList` |
| `Button_tsx` | `src/components/ui/Button.tsx` | `Button` |
| `client_ts` | `src/api/client.ts` | `client_ts` — the typed `openapi-fetch` client |
| `ping_ts` | `src/api/ping.ts` | `getPing` |

Not carded, on purpose: `internal/dbtest` (test harness), `migrations/embed.go` and
`web/embed.go` (a `//go:embed` var each, no functions), `src/api/schema.d.ts` and
`src/routeTree.gen.ts` (generated), `scripts/*.mjs` (tooling), every `*_test.go` /
`*.test.tsx` / `e2e/`, and the config files.

A few names are not the source's, because the wiki needs them unique:

| Wiki name | Source | Why |
| --- | --- | --- |
| `main_migrate`, `main_openapi`, `main_reindex` | `func main()` in each `cmd/<bin>/main.go` | `main` is the root `main.go` |
| `config_Load`, `migrate_Load` | `config.Load`, `migrate.Load` | two `Load`s |
| `client_ts`, `main_tsx` | whole-module files | they declare no function |

---

## Structure

```
classes/
  HttpClient/
    HttpClient.js                 class diagram FIRST, then one per method
    CachingHttpClient/            a subclass — nests as deep as you like
      CachingHttpClient.js
standaloneFunctions/
  backend/
    main_go.js                    functions that belong to no class
    cmd/
      migrate/
        main_go.js                nested when a basename repeats in one end
  frontend/
    main_tsx.js                   each file is its own page
xml/                              GENERATED by build.js — one .drawio per card
```

| On disk | In the wiki |
| --- | --- |
| a folder under `classes/` | a page; the folder name **is** the class name |
| first diagram in its file | the class diagram — first tab, shown in bold |
| every later diagram in that file | a method of that class |
| a folder inside a class folder | a subclass, its own page, indented in the nav |
| a file under `standaloneFunctions/` | a page; each diagram is a standalone function |
| a folder under `standaloneFunctions/` | just grouping — indents its pages in the nav |

Order matters inside a class file: whatever comes first is the class. Everything after it
is a method.

The **folder** names the class, not the diagram. If the first diagram in
`classes/HttpClient/` is called something else, `#class#HttpClient` still works and the
Doctor tab flags the mismatch.

### File naming

Mirror the source file, with the extension as a suffix: `main.go` → `main_go.js`,
`Button.tsx` → `Button_tsx.js`. (XMLWiki uses `_kt` for the same reason.)

When two source files in the same end share a basename — Go's `cmd/<bin>/main.go` is the
usual case — nest the second one under the source directory that tells them apart:
`standaloneFunctions/backend/cmd/migrate/main_go.js`. The nav shows the folder trail, so
the page reads `backend / cmd / migrate / main_go`.

---

## Adding a diagram

Add a line to any file, save, refresh:

```js
send = `<mxGraphModel>…</mxGraphModel>`;
```

That is the whole workflow. Get the XML from draw.io via **Extras → Edit Diagram**, or
**File → Copy as XML** / Ctrl+C on a selection. Compressed or not, both work.

Single quotes work too, and some cards need them: `live` quotes a Go raw string literal,
which contains backticks, so `standaloneFunctions/backend/health_go.js` is single-quoted
throughout — as is every card in this wiki, by house rule. A backtick or `${` inside a template literal would end the string
early.

### Naming rules

The name becomes the heading and the link target, so it has to be a valid JS identifier —
`send`, `TokenStore`, `HTTP_Client`. No spaces.

- Class names must be unique across the whole wiki. Method names only need to be unique
  within their class — `HttpClient.send` and `CachingHttpClient.send` coexist fine.
- Standalone function names must be unique across `standaloneFunctions/` — including across
  `backend/` and `frontend/`. Go's `main` already holds the name, which is why the frontend
  entry point is carded as `main_tsx`.
- Six lowercase names can't be used bare, because the browser refuses to assign them:
  `top`, `closed`, `history`, `location`, `navigator`, `document`. Write
  `D.location = \`…\`` instead — the `D.` form always works, for any name.

`node build.js` reports all of these.

---

## Linking between diagrams

In draw.io: right-click a shape → **Edit Link** → type a ref. Not a URL, not a path.

| Ref | Goes to |
| --- | --- |
| `#class#HttpClient` | that class's diagram |
| `#func#HttpClient.send` | a method — **always** qualified by its class |
| `#func#main` | a standalone function |
| `#page#HttpClient` | that class's page |
| `#d#Anything` | a class or standalone function, whichever matches |

Aliases: `#c#`, `#cls#`, `#fn#`, `#f#`, `#function#`, `#method#`, `#m#`, `#p#`, `#any#`.
Case-insensitive on both halves.

**Methods must name their class.** A bare `#func#send` only ever finds a *standalone*
function, because method names repeat across classes constantly. Write one for a method
and the wiki tells you the qualified forms to use instead:

> "send" is a method, so it needs its class: `#func#CachingHttpClient.send` or
> `#func#HttpClient.send`

Refs carry no folder or file path, so moving files around never breaks them — including
moving a card between `backend/` and `frontend/`. Renaming a class does break its methods'
refs; the Doctor tab lists every one.

**Four places a ref works:**

1. A shape's **Link field** — invisible, whole shape clickable. The main way.
2. A shape's or edge's **visible label**, with two hashes: `##class#HttpClient`. Renders
   as a link with the prefix stripped. Good for "See also:" text and edge labels.
3. A real **`<a href>`** inside a label: `<a href="#func#HttpClient.send">text</a>`. This is
   what the templates below use, and what every current card uses.
4. **The address bar.** Paste `wiki.html#class#HttpClient` and it jumps there.

Every card has a **Copy ref** button giving the exact string, already qualified.

Cross-end links are fine and encouraged: `getPing` fetches `GET /api/v1/ping`, so its
fetch line links to `#func#registerPing`, the handler that declares that route.

---

## Adding a file or folder

A browser opened from `file://` cannot list a directory — there is no API for it. So a new
**file** has to be named once in `wiki-files.js`. Either add the line yourself:

```js
WIKI_FILES = [
  "standaloneFunctions/backend/main_go.js",
  "classes/Issue/Issue_go.js",   // <- new
];
```

…or rescan the folders:

```bash
node build.js
```

Adding a diagram to a file already in that list needs neither — just refresh.

`node build.js` also regenerates two derived files — `xml/` (see **Each card as its own
file** below) and `wiki-bundle.js` (see **Viewing it inside Obsidian**) — so run it after
changing a card's XML too if you want those copies to follow.

---

## Each card as its own file

The page shows every card's XML (the **XML** button), but a card wrapped in a JS string
literal is awkward to reuse anywhere else. So `build.js` also writes each diagram out as
a plain `.drawio` file, byte for byte the same `<mxGraphModel>` the page renders:

```
xml/
  classes/Service/document_go/
    Service.drawio                the class card
    Save.drawio                   one per method
    RebuildIndex.drawio
  standaloneFunctions/backend/main_go/
    main.drawio
    ensureSchema.drawio
    …
```

The folder mirrors the wiki file that owns the card, minus `.js`, so two cards with the
same name in different files never collide. Open a `.drawio` in draw.io directly (File →
Open, or drag it in), or paste its contents into **Extras → Edit Diagram**.

`xml/` is generated. Edit the `.js` card and rerun `node build.js` (or `node export-xml.js`
on its own); the `.drawio` follows. Editing a `.drawio` changes nothing in the wiki.

---

## Viewing it inside Obsidian

The vault's **Style HTML Viewer** plugin renders `wiki.html` fine, with one catch: it
resolves the `<script src>` tags it can see in the file, then shows the page in a
`srcdoc` iframe. Anything the page tries to fetch *after* that — which is how the card
files are normally loaded — has no base URL to resolve against, and every card comes back
"File not found".

So `build.js` also writes **`wiki-bundle.js`**: every card file's source, keyed by path,
as `WIKI_BUNDLE_SRC`. `wiki.html` includes it statically, and the loader falls back to
it whenever a fetch fails. In a browser the fetch succeeds and the bundle is never read,
so a saved card edit still shows on a plain refresh. In Obsidian the bundle is what
renders, so a card edit shows up there after the next `node build.js`.

`wiki-bundle.js` is generated. Do not edit it; edit the card and rebuild.

---

## Getting around

- **Left nav** — always a dropdown at any window size. Classes with subclasses indented,
  then standalone-function files, indented under `backend` / `frontend`. Has a filter box.
- **`/` or `⌘K`** — search everything; type `healthz` to find that handler
- **Doctor tab** on the index page — files that failed, missing class diagrams, duplicate
  names, folder/diagram name mismatches, and **every ref that points at nothing**, each
  with the reason. Check it after any rename.
- **Expand** for full-screen, `Esc` closes. **XML** shows the source.
- URLs are `#!/<folder>/<diagram>`; Back/Forward work.

Diagrams render on a white sheet using draw.io's own `viewer-static.min.js`, vendored
locally — every shape and style exactly as in the editor, no network access.

Each page load appends `?v=<timestamp>` to the files it fetches. Chrome caches `file://`
subresources, and without that a plain refresh can serve you yesterday's diagrams.

---

## Sharing it

The folder works as-is on any machine with a browser. To hand someone one file:

```bash
node build.js --inline
```

Writes `wiki.standalone.html` (~4 MB) with the renderer and every diagram baked in. Opens
offline, no folders needed.

`node build.js --check` exits non-zero if `wiki-files.js` is stale, for a pre-commit hook.
(It does not check `wiki-bundle.js` or `xml/`; a plain `node build.js` refreshes both.)

To hand someone one *diagram* rather than the wiki, send them its `.drawio` from `xml/`.

---

## Keeping it honest

The wiki is only worth opening if it matches the code. Two habits:

- Card what a PR adds while the PR is open, not later.
- Run `node build.js` after any file or folder change, then open the **Doctor** tab and
  clear whatever it lists.

Nothing enforces this. LaminarFlow branches by epic (`E-LAM-XXXX-B` / `-F`) with tickets
branching off the epic, so the natural moment is right before the ticket branch merges up.

---

## The `/XMLwiki` skill

`.claude/skills/` holds a Claude Code skill that writes and re-syncs these cards for you.
It loads when Claude Code's project directory is this repo.

| Command | What it does |
| --- | --- |
| `/XMLwiki create <targets>` | new cards for the named types / functions / files |
| `/XMLwiki update [targets]` | re-sync existing cards against the code; no targets = the current branch's delta |
| `/XMLwiki <targets>` | works out which of the two each target needs |

| File | What it is |
| --- | --- |
| `XMLwiki/SKILL.md` | the router |
| `XMLwiki/authoring.md` | the real reference — roots, box order, geometry, escaping, refs. Both operations read it first |
| `XMLwiki/validate.js` | `node .claude/skills/XMLwiki/validate.js . <file…>` — structural check to run before `build.js` |
| `../export-xml.js` (wiki root) | writes `xml/` — one `.drawio` per card. `build.js` calls it; not part of the skill |
| `XMLwiki-create/SKILL.md`, `XMLwiki-update/SKILL.md` | the two operations |

This is the LaminarFlow copy, adapted from the user-level `~/.claude/skills/XMLwiki` that
serves [XMLWiki](https://github.com/Willpatbarr/XMLWiki). Being project-scoped, it shadows
that one while you are in this repo. What changed: the roots point here and at the two
sibling source repos, the language guidance is Go and TypeScript rather than Kotlin, the
test-source rule covers `*_test.go` and `*.test.tsx`, placement knows about the
`backend/` / `frontend/` split, and the update flow diffs against the **epic** branch
because LaminarFlow tickets branch off epics rather than off `main`.

`validate.js` also has two fixes this wiki needs: it recognises Go's `func` — including
methods with receivers and anonymous literals — as a function card, so the mandatory
`Returns` / `->` checks actually run on backend cards instead of silently skipping them;
and its backtick check is quote-aware, so a Go raw string inside a single-quoted diagram is
not a false positive.

The skill never commits.

---

## Diagram Templates:

Class: `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" parent="1" style="rounded=0;html=1;align=left;verticalAlign=middle;spacingLeft=6;fontSize=14;whiteSpace=wrap;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font style=&quot;font-size: 12px;&quot;&gt;Location path from source root&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="30" width="620" x="850" y="980" as="geometry"/></mxCell><mxCell id="3" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=middle;spacingLeft=6;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;span&gt;&lt;a href=&quot;#class#OuterClassName&quot;&gt;&lt;font face=&quot;Andale Mono&quot;&gt;OuterClassName&lt;/font&gt;&lt;/a&gt;:: (only include this box if this is a nested or inner class. and yes include the two colons)&lt;/span&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="50" width="620" x="850" y="1010" as="geometry"/></mxCell><mxCell id="4" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font&gt;: &lt;a href=&quot;#class#BaseClassName&quot;&gt;BaseClassName&lt;/a&gt;(), &lt;a href=&quot;#class#InterfaceName&quot;&gt;InterfaceName&lt;/a&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;(only include this box if it extends or implements something)&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="50" width="620" x="850" y="1060" as="geometry"/></mxCell><mxCell id="5" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font face=&quot;Andale Mono&quot;&gt;@HiltViewModel&lt;/font&gt; Or other keywords/annotations like this if applicable (data, sealed, abstract, open, internal, object, interface)&lt;br&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="50" width="620" x="850" y="1110" as="geometry"/></mxCell><mxCell id="6" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font&gt;class&lt;b&gt; ClassName&lt;/b&gt;&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="30" width="620" x="850" y="1160" as="geometry"/></mxCell><mxCell id="7" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;Constructor Args&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;b&gt;&lt;font&gt;(&lt;/font&gt;&lt;/b&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;- constructorParam: Datatype&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;+ otherParam: &lt;a href=&quot;#class#OtherClassName&quot;&gt;OtherClassName&lt;/a&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;b&gt;&lt;font&gt;)&lt;/font&gt;&lt;/b&gt;&lt;/div&gt;&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;one param per line, type included, UML visibility. omit box if none&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="110" width="620" x="850" y="1190" as="geometry"/></mxCell><mxCell id="8" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;Attributes&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;+ publicAttribute: Datatype&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;- privateAttribute: &lt;a href=&quot;#class#OtherClassName&quot;&gt;OtherClassName&lt;/a&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;# protectedAttribute: Datatype&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;~ packageAttribute: Datatype&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;+ public&amp;nbsp; - private&amp;nbsp; # protected&amp;nbsp; ~ package. underline class-scoped members&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;one per line, link any type that has its own card&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="150" width="620" x="850" y="1300" as="geometry"/></mxCell><mxCell id="9" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;Methods&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;+ &lt;a href=&quot;#function#methodName&quot;&gt;methodName&lt;/a&gt;(param: Datatype): Datatype&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;+ &lt;a href=&quot;#function#otherMethod&quot;&gt;otherMethod&lt;/a&gt;(): Unit&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;- &lt;a href=&quot;#function#helperThing&quot;&gt;helperThing&lt;/a&gt;(): Unit&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;one signature per line, always link the name - the function cards hang&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;off these. group into beats with a blank line if the list is dagum long&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="140" width="620" x="850" y="1450" as="geometry"/></mxCell><mxCell id="10" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;Nested types&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;companion object&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;+ &lt;u&gt;CONSTANT_NAME: Datatype = value&lt;/u&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&lt;a href=&quot;#class#NestedClassName&quot;&gt;NestedClassName&lt;/a&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font face=&quot;Helvetica&quot; style=&quot;font-size: 12px;&quot;&gt;(only include this box if the class declares nested/inner types or a companion)&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="130" width="620" x="850" y="1590" as="geometry"/></mxCell></root></mxGraphModel>`

function: `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" parent="1" style="rounded=0;html=1;align=left;verticalAlign=middle;spacingLeft=6;fontSize=14;whiteSpace=wrap;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font style=&quot;font-size: 12px;&quot;&gt;Location path from source root&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="30" width="620" y="260" as="geometry"/></mxCell><mxCell id="3" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=middle;spacingLeft=6;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;span&gt;&lt;a href=&quot;#class#ClassName&quot;&gt;&lt;font face=&quot;Andale Mono&quot;&gt;ClassName&lt;/font&gt;&lt;/a&gt;:: (only include this box if the function is a method of a class. and yes include the two colons)&lt;/span&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="50" width="620" y="290" as="geometry"/></mxCell><mxCell id="4" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font face=&quot;Andale Mono&quot;&gt;@Composable&lt;/font&gt;&lt;b&gt; &lt;/b&gt;Or other keywords like this if applicable)&lt;br&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="30" width="620" y="340" as="geometry"/></mxCell><mxCell id="5" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font&gt;fun&lt;b&gt; functionName(&lt;/b&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;param: Datatype&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;b&gt;&lt;font&gt;)&lt;/font&gt;&lt;/b&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="60" width="620" y="370" as="geometry"/></mxCell><mxCell id="6" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;font style=&quot;font-size: 12px;&quot;&gt;Returns {return info datatype, void or unit if nothing is returned}&lt;/font&gt;" vertex="1"><mxGeometry height="30" width="620" y="430" as="geometry"/></mxCell><mxCell id="7" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;font&gt;-&amp;gt; return statement (-&amp;gt; Unit or -&amp;gt; void when nothing is returned)&lt;/font&gt;" vertex="1"><mxGeometry height="30" width="620" y="460" as="geometry"/></mxCell><mxCell id="8" parent="1" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=6;fontFamily=Andale Mono;fontSize=14;resizeHeight=1;autosize=0;fixedWidth=1;" value="&lt;div&gt;&lt;font&gt;{&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;one statement per line, real code, never wrap mid-call&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;~72 chars fit at this width - widen every box if they don&apos;t&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&lt;br&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;group the body into beats, one blank line between beats&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&lt;br&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;&lt;a href=&quot;#function#functionName&quot;&gt;otherFunction&lt;/a&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;&lt;a href=&quot;#class#ClassName&quot;&gt;otherClass&lt;/a&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&lt;br&gt;&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;// comments say why, not what - condense to 1-2 lines&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;&amp;nbsp; &amp;nbsp;use pseudo code here if it really dagum long&lt;/font&gt;&lt;/div&gt;&lt;div&gt;&lt;font&gt;}&lt;/font&gt;&lt;/div&gt;" vertex="1"><mxGeometry height="230" width="620" y="490" as="geometry"/></mxCell></root></mxGraphModel>`

### Adapting the templates to Go and TypeScript

The templates are Kotlin-flavoured (`fun`, `@Composable`, `companion object`). Keep every
box and its order; swap the language-specific words:

| Box | Go | TypeScript / React |
| --- | --- | --- |
| keywords | `package main`, `type … struct`, `interface` | `export default`, `type`, `interface`, `const` |
| signature | `func Name(a T) (T, error)` | `function Name(props: Props)` |
| returns | second return value is the error — say what it means | `JSX.Element`, `Promise<T>` |
| attributes | struct fields, `+` exported / `~` unexported (Go has no private) | class fields or the props type |
| methods | methods with a receiver, receiver named in the box | class methods, or hooks the component calls |

Go has no classes, so a struct with methods still earns a `classes/<Struct>/` folder: the
struct is the class diagram, each method a tab. A plain function goes in
`standaloneFunctions/`. React components are functions — they belong in
`standaloneFunctions/`, one file per source file, exactly like the Compose screens do in
XMLWiki.
