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
`LaminarFlow-Frontend/src/App.tsx` — so a card always says which end it belongs to.

Function pages are grouped one level deeper to match:

```
standaloneFunctions/
  backend/
    main_go.js
  frontend/
    App_tsx.js
    main_tsx.js
```

The nav indents them under that folder. Classes work the same way once there are any —
see **Structure** below.

### What's carded right now

LaminarFlow is early. Four cards cover all of it:

| Card | Source |
| --- | --- |
| `main` | `LaminarFlow-Backend/main.go` — reads `PORT`, builds the mux, serves |
| `healthzHandler` | the anonymous `GET /healthz` handler literal in the same file |
| `App` | `LaminarFlow-Frontend/src/App.tsx` — still the untouched Vite starter scaffold |
| `main_tsx` | `LaminarFlow-Frontend/src/main.tsx` — mounts the React tree under StrictMode |

`classes/` is empty on purpose: neither end declares a type yet. The first Go struct or TS
class gets the first folder in there.

`App` is boilerplate, and its card says so. When the real app shell replaces it, redraw the
card rather than patching around it.

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
  frontend/
    App_tsx.js                    each file is its own page
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
`App.tsx` → `App_tsx.js`. (XMLWiki uses `_kt` for the same reason.)

---

## Adding a diagram

Add a line to any file, save, refresh:

```js
send = `<mxGraphModel>…</mxGraphModel>`;
```

That is the whole workflow. Get the XML from draw.io via **Extras → Edit Diagram**, or
**File → Copy as XML** / Ctrl+C on a selection. Compressed or not, both work.

Single quotes work too, and some cards need them: `healthzHandler` quotes a Go raw string
literal, which contains backticks, so `standaloneFunctions/backend/main_go.js` is
single-quoted throughout. A backtick or `${` inside a template literal would end the string
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

Cross-end links are fine and encouraged: when the frontend starts calling `GET /healthz`,
the fetch line in that card should link to `#func#healthzHandler`.

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

---

## Keeping it honest

The wiki is only worth opening if it matches the code. Two habits:

- Card what a PR adds while the PR is open, not later.
- Run `node build.js` after any file or folder change, then open the **Doctor** tab and
  clear whatever it lists.

Nothing enforces this. LaminarFlow branches by epic (`E-LAM-XXXX-B` / `-F`) with tickets
branching off the epic, so the natural moment is right before the ticket branch merges up.

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
| attributes | struct fields, `+` exported / `- ` unexported | class fields or the props type |
| methods | methods with a receiver, receiver named in the box | class methods, or hooks the component calls |

Go has no classes, so a struct with methods still earns a `classes/<Struct>/` folder: the
struct is the class diagram, each method a tab. A plain function goes in
`standaloneFunctions/`. React components are functions — they belong in
`standaloneFunctions/`, one file per source file, exactly like the Compose screens do in
XMLWiki.
