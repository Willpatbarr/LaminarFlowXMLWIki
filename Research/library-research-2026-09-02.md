# Laminar Flow — Pre-Existing Library Research

**Date:** 2026-09-02 · Seven parallel research passes, all versions/licenses/dates verified against live npm, GitHub API, proxy.golang.org, vendor pricing pages, and (where noted) by compiling and running code.

Domains: Go backend infra · client sync engine · editor + HTML sandbox · React UI layer · search · API contract/codegen · testing/CI/deploy.

Full per-domain reports follow the summary.

---

## The seven findings that change a decision

### 1. "React Query gets wiped on refresh" is false — and it was the load-bearing reason for the IndexedDB plan

`persistQueryClient` + `@tanstack/query-async-storage-persister` + `idb-keyval` dehydrates the cache **to IndexedDB**, persists **mutations as well as queries**, has `maxAge`/`buster` expiry, and pauses offline mutations then *"retries them in the same order when the device reconnects."* Survives refresh and browser restart.

**Total: ~18 kB gzip.** That satisfies the stated requirement (read recently-loaded tickets while briefly offline) at 13% of the bundle cost of the alternative. A real local database is still defensible — but choose it for *live relational queries*, not for persistence.

### 2. SSE beats WebSockets for the change-notification path

WebSockets were chosen over *polling* — right rejection, incomplete option set. Traffic on that channel is strictly server→client (writes already go over REST). SSE gives:

- **Automatic browser reconnection** — no backoff code to write.
- **`Last-Event-ID` resume** — the browser re-sends the last event ID on reconnect; server replays `WHERE seq > $1`. This is the exact "revisit later" item (laptop sleep, WiFi drop), solved by the protocol.
- A plain `http.Handler` with `Flush()`. **Zero dependencies.**

Caveat: 6 connections/origin on HTTP/1.1 → serve HTTP/2 (automatic over TLS) and/or hold the stream in one leader tab.

Design the monotonic `BIGSERIAL` sequence column **now** even if the transport comes later — it's the piece that makes reconnect/resume easy. And publish events from the centralized Go write path (in-process hub), not CDC. `LISTEN/NOTIFY` only earns its keep at 2+ replicas; logical replication risks WAL-retention disk-fill on a home server; Debezium is a JVM + Kafka to move events inside one container.

### 3. Go stdlib now covers more than expected — the backend needs ~5 deps

- **`net/http.CrossOriginProtection`** (Go 1.25+, present in your 1.27) = CSRF in one line via `Sec-Fetch-Site`. Retires gorilla/csrf and nosurf entirely.
- **Go 1.22+ `ServeMux`** does method routing, `{wildcards}`, real precedence, and 405+`Allow`. chi is still worth it — for **route groups with per-group middleware** (you have three auth regimes) and its **zero-dependency** middleware stack.
- **`os.Root`** (1.24+) makes a hand-rolled file store safe by kernel-level path resolution — the previously-hard part of not using a storage library.
- `log/slog`, `os.LookupEnv`, `signal.NotifyContext` + `Shutdown`, `time.Ticker` — no libraries needed.

⚠️ **`http.Server.Shutdown` does not close hijacked connections.** Your WebSockets won't drain. Most commonly missed bug in Go WS servers — you need your own connection registry (which the subscription tracking already requires).

### 4. TipTap open-sourced 10 Pro extensions — but Comments is still gated, and unusable for self-hosting

June 2025: `drag-handle`, `emoji`, `details`, `file-handler`, `invisible-characters`, `mathematics`, `node-range`, `table-of-contents`, `unique-id` all went MIT (verified installable at 3.31.0). **Most comparison articles are stale on this.**

🚩 Still paid: `extension-comment` / `@tiptap-pro/extension-comments` are **not public npm packages** and require authenticating to Tiptap's **private registry**. Start plan **$59/mo**, no free tier. For a self-hostable product this is an architectural blocker, not a cost — self-hosters cannot `npm install` it.

**The DIY version is better for you anyway:** a ProseMirror mark carrying `requestId`, stored inside the document blob. Persistence is already built (your `Save` writes it), position mapping through edits is free from the framework, and deleting the text self-orphans the request. ~50 lines.

Two config flags are load-bearing:
- **`excludes: ''`** — without it the default same-type exclusivity makes two overlapping review requests silently clobber each other.
- **`inclusive: false`** — the default `true` means typing right after a reviewed region *extends* the anchor, corrupting your staleness signal.

Staleness = SHA-256 the marked text on approval, re-hash on every save inside the existing transaction. `prosemirror-changeset` is already inside `@tiptap/pm` if you want finer granularity later.

### 5. Two sandbox specifics in the HTML plan don't work as stated (verified by live browser probes)

- 🚨 **`srcdoc` inherits the parent's CSP and you can never loosen it.** Tested: parent under `img-src 'none'` → `srcdoc` frame's `<img>` blocked; identical markup over `src=` loaded fine. `w3c/webappsec-csp#700` closed **wontfix**. → **Serve document HTML from a real endpoint** so it gets its own headers.
- 🚨 **"Plain hyperlinks still work with scripts disabled" is not reliably true.** Tested in Chromium 148: a plain `<a href>` inside `sandbox=""` **did not navigate at all**. `sandbox="allow-same-origin"` did.

**The configuration that satisfies all three constraints:** `sandbox="allow-same-origin"` *without* `allow-scripts`. That single combination gives the **parent** DOM access to the frame — enabling auto-height via `ResizeObserver` and parent-side link interception — while the frame still cannot execute a line of code. Verified: `contentDocument` accessible, `ResizeObserver` fired real content height, parent `preventDefault()` suppressed a real click.

Never `allow-scripts allow-same-origin`: tested payload had the child **remove its own sandbox attribute from the parent's DOM**.

CSP for the render endpoint: `sandbox allow-same-origin; default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'`. `img-src`/`font-src` with no host source are your **anti-CSS-exfiltration** controls; `form-action` and `base-uri` are **not** covered by `default-src`.

**Strip all form controls** — `<input>`, `<select>`, `<option>`, `<label for>`. Gareth Heyes' Black Hat USA 2026 work demonstrates a **real-time keylogger with no JavaScript** using `:has()` + `:checked` for state and `url()` for exfiltration. You've deferred interactivity anyway, so it costs nothing.

🚩 **iframe-resizer is GPL-3.0** (commercial from $16–$486) — and it couldn't work regardless, since it needs `allow-scripts`. The DIY resizer is ~25 lines.

### 6. Radix has no Combobox — and comboboxes are the center of this app

`radix-ui@1.6.7` re-exports 54 primitives. `combobox`: **NO**. You need them for the filter builder, command palette, assignee/label pickers, and field selectors.

**Base UI** (`@base-ui/react@1.7.0`, MIT, built substantially by the original Radix engineers, ships monthly) has Combobox + Autocomplete + **`Combobox.Chips`/`Chip`/`ChipRemove`** — literally the Linear filter-chip primitive — plus a **first-party Command Palette example** and a `Form` **`errors` prop** keyed by field name that renders server validation errors automatically. That one choice deletes cmdk, Ariakit, and a hand-rolled error mapper.

🚩 **Package-name trap:** `@base-ui-components/react` is the *old* name, frozen at `1.0.0-rc.0`. npm search surfaces it first and it looks abandoned. The live package is `@base-ui/react`.

**cmdk looks dead:** `1.1.1` published 2025-03-14, 23 unmerged PRs, issue #410 *"Project dead?"* (July 2026) with **zero maintainer reply** — and it drags in 4 Radix packages, so adopting it means shipping both primitive libraries.

**dnd-kit's stable line hasn't released since Dec 2024** → use `@atlaskit/pragmatic-drag-and-drop` (Apache-2.0, ~4.7 kB core, commits today). It's what Jira and Trello ship. Pair with `fractional-indexing` (**CC0-1.0**, public domain) which is byte-compatible with `rocicorp/fracdex` in Go — client and server compute identical sort keys, which is what optimistic drag needs.

### 7. The `search_index` table is not yet a search index — and `FieldText` will poison it

Current state: no `tsvector`, no GIN index, no `aspect_type` column anywhere, no typed value columns, and the only index is a `document_id`-leading PK that **cannot** answer "all documents where field X = Y."

**The design decision is right and worth keeping** — derived, rebuildable, one centralized write path, one shared extraction function. That's the hard part to retrofit. The *table shape* needs to change.

🐛 **A concrete bug, reproduced:** `document.FieldText` walks arbitrary JSON concatenating every string. Run against a realistic TipTap document it emits:

```
2 Design Goals text heading See  text https://evil.example.com/tracker _blank link the RFC text  for details. text paragraph doc
```

So the index contains `text`, `heading`, `paragraph`, `doc`, `link`, `_blank`, heading levels as bare numbers, and raw hrefs. **Searching `"doc"` would match every document in the instance.** Fix is a schema-aware walker (~40 lines): on `type:"text"` emit `text` and never descend into `marks`; on `mention` emit `attrs.label` not `attrs.id`; on `image` emit `attrs.alt`; separator after block nodes.

Second gap: `FieldText` collapses `float64`→string and `bool`→`"true"`, which makes `field > 5` / date-before / `ref = <uuid>` impossible. Needs a typed sibling `FieldValue` returning `{text, num, bool, ts, ref}`, called from the same two places.

Third: **`RebuildIndex` loads every document into RAM** and issues **one INSERT per field per document** — 5k docs × 20 fields = 100,000 sequential round-trips in one transaction, on a Pi with `PGDATA` on a USB HDD. Use `pgx.CopyFrom` + keyset pagination.

---

## Recommended stacks

### Go backend — 5 new modules

| Module | Version | License | Why |
|---|---|---|---|
| `go-chi/chi/v5` | v5.3.2 | MIT | Route groups + full middleware stack, **zero transitive deps** |
| `coder/websocket` | v1.8.15 | ISC | Context-native, **zero deps**; gorilla/websocket is stalled (last commit 2025-02, issue #1016 *"This project is dead again"*) |
| `go-playground/validator/v10` | v10.30.3 | MIT | Per-field errors with rule + constraint via `RegisterTagNameFunc` |
| `alexedwards/argon2id` | v1.0.0 | MIT | OWASP argon2id (m=19MiB, t=2, p=1), PHC encoding done right |
| `pressly/goose/v3` | v3.28.0 | MIT | `embed.FS` migrations, replaces the shell script. `jackc/tern/v2` equally defensible (same author as pgx) |

Plus **`sqlc` as a build-time tool** — zero runtime deps, generated code imports only pgx. But note: **sqlc cannot build your filters** (issue #3414 open since 2020, "static queries only"). Write the nested AND/OR compiler yourself, ~300 lines. **Injection safety comes from a field whitelist, not a builder library** — and that whitelist gets reused by filter compilation, payload validation, and cursor-field validation. `squirrel` (last release Mar 2023, README says *"Squirrel is complete"*) and `goqu` (Nov 2023) are both frozen.

Defer: `riverqueue/river` (**MPL-2.0** — the only copyleft in the set; file-level, linking is fine), `x/time/rate`, `apache/casbin` (note: **donated to ASF**, `casbin/casbin` now redirects; v3 is a breaking major and every tutorial is v2).

### Client sync — start at Option B

**Option B (~18 kB):** `@tanstack/react-query` + `query-persist-client-core` + `query-async-storage-persister` + `idb-keyval`. Register `setMutationDefaults()` so paused mutations survive a reload; call `resumePausedMutations()` from the persister's `onSuccess`; raise `gcTime` so GC doesn't evict before persistence.

**Upgrade when hand-syncing list/board/detail caches starts hurting (~135 kB):** `@tanstack/react-db` + `query-db-collection` + `offline-transactions`. The last one is the piece not to miss — outbox pattern, FIFO retry with exponential backoff + jitter, multi-tab leader election, idempotency keys. Take the idempotency key seriously server-side or retries double-apply writes.

⚠️ TanStack DB's official browser persistence is **wa-sqlite + OPFS**, not IndexedDB (~300–400 kB WASM). Still satisfies the real requirement (durable disk storage), and `schemaVersion` bumps discard-and-refetch, which is a free migration strategy when the server is authoritative. Persistence docs are thin — budget time reading source.

**If you go hand-rolled: Dexie 4.4.5** is the only real choice for a relational-ish schema with reactive reads (compound indexes, transactions, versioned migrations, `liveQuery` with genuine cross-tab BroadcastChannel reactivity). **Dexie core is still Apache-2.0** — Dexie Cloud is fully separate and optional; that worry is unfounded. Perf caveat: `liveQuery` re-runs the whole query function on any write to an observed table.

**Conflict resolution:** an integer `version` column, `UPDATE ... WHERE id=$1 AND version=$2`, 0 rows → 409 with the server row. ~20 lines. Electric, Zero, and PowerSync all converge on the same "server decides, client rolls back" design at 1% of the operational cost. Also send **only changed fields (PATCH)** — whole-object PUTs make two clients editing *different* fields silently revert each other, which is the case you'll actually hit.

### Editor

```
@tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/markdown @tiptap/extension-mention
```

**Measured** (real Vite 8 prod builds, gzip): react+react-dom today 66.6 kB → +138.6 kB for react+starter-kit → +33.8 kB for markdown+mention. **Total +172.5 kB.** Lexical equivalent measured **95.5 kB** — genuinely ~45% lighter, and `@lexical/mark` is a better out-of-box annotation primitive (`ids: string[]`, overlapping marks first-class). Lexical loses on being **0.x for four+ years** with breaking minors and a roadmap that declines to commit to 1.0, plus thinner docs. **Decide this before requirement 5 — the review system couples deeply to whichever you pick.**

✅ **Markdown input rules ship free** — verified `addInputRules` in heading, bold, italic, code, strike, blockquote, code-block, horizontal-rule, and `@tiptap/extension-list`. Typing `## `, `- `, `> `, `**bold**` all work with zero config.

⚠️ **Markdown *paste* is NOT free** — grepped `@tiptap/markdown` dist for `handlePaste|clipboardTextParser|transformPasted`: **zero hits**. Same gap in Lexical (`@lexical/markdown` dist: 0 occurrences of `PASTE`). ~30 lines: a ProseMirror plugin with `clipboardTextParser` + `clipboardTextSerializer`, gated on `plainText` so Shift+paste bypasses conversion.

**Storage: ProseMirror JSON only. Not Markdown. Not both.** Markdown has nowhere to put a review `requestId`, a mention's stable entity ID, or image dimensions without inventing syntax that must round-trip losslessly forever. Storing both breaks the invariant your own `0002_search_index.sql` comment already states. Markdown becomes a projection at the API boundary. And PM JSON is **better** for an AI agent than Markdown — plain JSON, closed documented schema, unambiguous.

Go side: **`yuin/goldmark` v1.8.5** (MIT, stdlib-only deps, **adds exactly 1 module** — verified) only if you accept `content_format=markdown` on write. A ~45-line `ast.Walk` emitting valid ProseMirror JSON was written and run successfully. `blackfriday` is frozen (v2.1.0, 2020).

**Uploads: add nothing client-side.** TipTap already owns paste/drop. 🚩 Uppy is MIT (that worry was unfounded) but **~200 kB gzip**. 🚩 FilePond's `image-edit` plugin is a hollow shell requiring **Pintura at €169–€749/yr per seat**, with OEM licensing required if customers integrate it for resale. `react-dropzone` is *not* stale (six releases in five weeks) but fights ProseMirror over drop events — use it only for a standalone attachments panel.

**Go images: `golang.org/x/image/draw` + stdlib `image/jpeg`/`image/png`.** Both libvips bindings are disqualified by CGO (`govips` needs libvips 8.14+ and a C compiler; `bimg` unmaintained since 2022) — that means no static binary, no distroless-static, real arm64 cross-compile pain, 100 MB+ of `.so` tree, and libvips CVE patching as your job. `disintegration/imaging` is abandoned (v1.6.2, 2019). Use `image.DecodeConfig` for dimensions and **check them before decoding** — a hostile 20,000×20,000 PNG eats all your RAM.

**Go storage: hand-roll ~30 lines over `os.Root`.** Measured binary sizes for "write a file to a local directory": hand-rolled **2.3 MB / 58 packages / 0 modules** vs `gocloud.dev/blob/fileblob` **16 MB / 383 packages / 143 modules** — including 99 protobuf packages and the full OpenTelemetry SDK. Tree-shaking means zero AWS/GCP *packages* compile, but gocloud.dev is one module containing every driver, so your `go.sum` inherits all 143 regardless. `stow` is dead; `thanos-io/objstore` has **zero tagged releases**. When S3 day comes, `aws-sdk-go-v2/service/s3` has the cleanest graph at 18 modules.

### React UI

```bash
npm i @base-ui/react
npm i -D tailwindcss @tailwindcss/vite
npm i @tanstack/react-router && npm i -D @tanstack/router-plugin
npm i @tanstack/react-table @tanstack/react-virtual
npm i @atlaskit/pragmatic-drag-and-drop @atlaskit/pragmatic-drag-and-drop-hitbox \
      @atlaskit/pragmatic-drag-and-drop-auto-scroll @atlaskit/pragmatic-drag-and-drop-react-drop-indicator
npm i fractional-indexing
npm i react-hook-form zod @hookform/resolvers
npm i tinykeys @leeoniya/ufuzzy sonner @formkit/auto-animate lucide-react
```

- **TanStack Router** over React Router: `validateSearch` + `stringifySearchWith` make the nested filter tree *typed, validated, URL-serialized state*. Saved views **are** search-param state. React Router has no typed search params.
- **TanStack Table v9** went stable 2026-08-04 — tree-shakable features (~5 kB floor), 86% less retained heap.
- **`react-hook-form`**: `setError(field, {type, message}, {shouldFocus})` is the cleanest Go-error→field mapping. **8 open issues on 44.8k stars**, zero runtime deps. Base UI publishes an official integration guide.
- **One Zod schema** validates the URL params, the filter editor, and the API payload (Standard Schema).
- **`@leeoniya/ufuzzy`** (4.1 kB) over Fuse.js — Fuse's Bitap ranks typo-tolerant garbage above the obvious answer, which is wrong for jump-to-known-item.
- **`tinykeys`** genuinely revived — real 4.0 in May 2026 with `$mod`, sequence timing (`"g i"`), input/contenteditable safety. You own the scope stack — design the registry now so shortcuts don't fire inside the editor.
- **`lucide-react` requires a 10-line Vite alias** — the dev-server barrel bug is real and won't be fixed.
- Later: `motion` only for shared-element morphs across an unmount boundary (`layoutId`) — import from `motion/react-m` + `LazyMotion`, never `motion/react`.
- **Never:** AG Grid Enterprise, MUI X Pro/Premium, react-querybuilder (looks like an enterprise SQL builder, not Linear chips), cmdk, react-dnd, react-beautiful-dnd, Formik, Glide Data Grid.

### Search — all Postgres

**`tsvector` + GIN for relevance, `pg_trgm` GiST for typo-tolerant titles.** Both work in **stock `postgres:17`** — verified: the official Dockerfile doesn't install `postgresql-contrib`, but `pg_trgm.so`, `unaccent.so`, and `fuzzystrmatch.so` ship *inside* the `postgresql-NN` package. No custom image.

Two gotchas that will bite:
- **`to_tsvector(text)` one-arg is STABLE, not IMMUTABLE** (reads `default_text_search_config`). A generated column **must** use the two-arg form with a literal config. This is the #1 reason FTS generated columns fail.
- **`unaccent()` is also STABLE** — needs an IMMUTABLE SQL wrapper before it can appear in a generated column or index expression.

Jump-to-known-item specifics:
- `similarity()`/`%` compares **whole strings** — useless when the query is "auth" and the title is "Refactor the authentication middleware".
- **`word_similarity()`/`<%`** returns best similarity against any continuous extent — that's the primitive you want.
- **GIN (`gin_trgm_ops`) is *not* efficient for the distance operators** (`<->`, `<<->`); **GiST is**. Since jump-to means `ORDER BY title <<-> $q LIMIT 10`, you want **GiST on title, GIN on the tsvector**.

Query with `websearch_to_tsquery` (never raises syntax errors on raw input; free phrases/or/negation). For as-you-type it gives no prefix support — append `:*` to the final lexeme yourself (~15 lines). Rank with `ts_rank_cd(..., 32)` and blend: `GREATEST(ts_rank_cd(tsv, q, 32), word_similarity(title, $q))`.

**Honest ranking caveat:** `ts_rank` has **no IDF and no TF saturation** — it scores each document in isolation and never learns that "service" appears in 90% of your Aspect docs. Genuinely worse than BM25, and not a tuning problem. But for "jump to a known ticket," `setweight` title-boosting to `'A'` plus `word_similarity` ordering lands the right item top-3 essentially always. IDF matters for corpus-relevance retrieval, which you deprioritized.

**Upgrade path if ranking disappoints: `timescale/pg_textsearch`** — real BM25, **PostgreSQL License** (cleanest in the category), plain C not Rust/pgrx, **prebuilt amd64+arm64 binaries for PG17/18**, 3-line Dockerfile on `postgres:18`, no new service. Limitations it admits: no phrase queries, write-heavy path not fully optimized.

🚨 **Not** ParadeDB `pg_search` (**AGPL-3.0**, deliberate per their own blog; Enterprise waives copyleft *and* the free tier is feature-capped at **cluster size 1, no HA, no read replicas**; also needs `shared_preload_libraries` on PG≤16 and requires pgvector first as of 0.25.0). 🚨 **Not** `vchord_bm25` (**AGPL-3.0 OR Elastic License v2** — no permissive escape; 377 stars; repo moved to a **personal account created 2026-05-14**; last release Dec 2025, last commit Apr 2026; its own Dockerfile/CI deleted; its mandatory `pg_tokenizer.rs` companion loads **200 MB per connection** for the default model and is 11 months stale).

**Client-side hybrid — do it. `MiniSearch` 7.2.0** (MIT, 5.7 kB, zero deps, `loadJSONAsync()` batched non-blocking). Cache titles-only for the navigable subset in IndexedDB, load the serialized index on boot, keystroke → `{prefix: true, fuzzy: 0.2}` with zero network, debounce 150 ms → server for bodies/Aspect fields/structured queries. Reject the pure-client version: bodies blow past quota and leak every workspace doc to any authenticated tab. `lunr` is **six years stale** (2.3.9, Aug 2020) — that guess was right. `Orama` is fine (Apache-2.0, active) but 4× the bundle for capabilities you don't need. `uFuzzy` at 3.9 kB over a plain array is a legitimate 30-minute v1 stopgap.

**The link graph is a join table.** `document_link(source_document_id, source_field_id, target_document_id)` + an index on `target_document_id`. Derived from the blobs exactly like `search_index`, so fold it into the same `RebuildIndex` transaction. No graph library; no recursive CTE needed for backlinks.

**pgvector: recommend against, now and probably ever.** Three independent reasons — (1) semantic similarity is *actively wrong* for "navigate to a known item"; (2) embeddings need a model, and since you won't host one, every write becomes **a blocking outbound HTTPS call**: a Tailscale-only instance with no egress cannot index, `cmd/reindex` costs money and hours, and **the index stops being freely rebuildable** — which is the best decision in your current design; (3) it needs a custom image.

**Embedded alternatives, if you ever want them:** `bleve` v2.6.1 is alive and well (11,197★, releases two weeks ago, funded by Couchbase — the "is it dead" worry is unfounded) and **CGO-free** for the default scorch backend; only vector search needs FAISS behind `-tags vectors`. Measured index size at 20k docs / 17.5 MB text: **84.1 MB default, 39.8 MB with store+term-vectors off**. **`bluge` is not bleve's successor** — it's dormant since 2022-07 (that parenthetical had it backwards); the `pushed_at` you'll see belongs to a stray unmerged branch. `tantivy-go` is 41 stars, CGO, musl-only static libs, needs per-target C cross-compilers.

**Notable:** `modernc.org/sqlite` v1.58.0 ships FTS5 + trigram tokenizer + prefix indexes + **weighted BM25** with `CGO_ENABLED=0`, cross-compiling clean to linux/arm64 — verified by compiling and running, not by reading docs. So search is an argument **for** SQLite in your open "SQLite or Postgres?" question, not a neutral factor. FTS5 trigram accelerates indexed `LIKE '%substring%'` natively (needs ≥3 chars, and don't set `remove_diacritics` or you lose LIKE acceleration).

### API contract — Go-first, spec-generated

```
1. AUTHOR      Go structs + huma.Register() in internal/api/  (types + validation + OpenAPI = one declaration)
2. GENERATE    go run ./cmd/openapi > api/openapi.json        (~15-line cmd)
3. COMMIT      api/openapi.json; CI runs the generator + `git diff --exit-code` → fails if you forgot
4. CROSS       frontend `pnpm run api:pull` curls the raw file from the backend repo; commit it
5. GENERATE TS openapi-typescript openapi.json -o src/api/schema.d.ts   (one .d.ts, ZERO runtime code)
6. CONSUME     openapi-fetch (~6 kB) + ~40 hand-written TanStack Query wrappers. Do NOT generate hooks.
7. GUARD       oasdiff breaking old vs new spec on every PR
```

Backend: `danielgtaylor/huma/v2` v2.39.1 (MIT) + `humago` adapter (stdlib ServeMux, no extra dep). Frontend: `openapi-typescript` 7.13.0 + `openapi-fetch` 0.17.0 — **two runtime deps total.**

**Why Huma specifically — three verified facts:**
- **Recursive schemas: YES.** The default registry "supports recursive schemas" and emits `$ref`s to named schemas rather than inlining. This is what makes your `FilterGroup { logic, conditions[], groups[] }` work end-to-end.
- **RFC 9457 natively.** From source (`error.go`): `ErrorModel` is `{type, title, status, detail, instance, errors[]}`; `ContentType()` rewrites to `application/problem+json`; **`ErrorDetail` is `{message, location, value}` where `location` is a path like `body.friends[1].active`**. Your field-level validation requirement is already solved.
- **JSON Schema 2020-12 validation runs before your handler**, generated from struct tags.

Security schemes: Huma **documents but does not enforce** — `Operation.Security` is a 1:1 with the OpenAPI Security Requirement Object, so cookie-OR-apikey is expressible verbatim while enforcement stays in your own middleware, which is what you designed.

**openapi-typescript's recursive story is the cleanest of any generator** — it doesn't dereference `$ref`s; it emits one type per component schema and turns every `$ref` into a *type reference*. TypeScript supports recursive interfaces natively, so `FilterGroup` needs no special handling.

**Fallback: `ogen`** v1.24.0 (Apache-2.0) — **recursive support explicitly designed for** (*"if ogen encounters recursive types that can't be expressed in go, pointers are used as fallback"*), validation baked into generated code. Keep `openapi.json` as the artifact and swap only steps 1–2. That's the whole point of making the spec the contract.

Corrections to note: **`deepmap/oapi-codegen` moved to its own `oapi-codegen` org** in May 2024 (import path `github.com/oapi-codegen/oapi-codegen/v2`), and **3.1 support only landed in v2.8.0** (July 2026) — but its recursive behavior is *unverified*; write a 20-line spike before committing. There is no "drdhaval/openapi-ts" — the org is `openapi-ts`, docs at openapi-ts.dev. `swaggo/swag` v2 has been **stuck in RC since Jan 2026** and its spec comes from comments, which is exactly the drift you're eliminating. `Fuego` has had **no tagged release since Feb 2025**. `Twirp` is **2+ years stale**. ⚠️ `@hey-api/openapi-ts` renamed to `hey-api/hey-api` and its Platform is in beta with **pricing not yet announced** — core stays MIT, but prefer the tool with no company attached.

**Connect RPC** is genuinely Apache-2.0 and technically excellent (`buf breaking` is the best breaking-change detector in the whole report), but **AVOID**: `POST /laminar.v1.TicketService/ListTickets` with protobuf-JSON semantics is not an API an agent or `curl` user will guess, and protobuf package versioning collides with your `/v1` requirement. You'd need Vanguard for REST-ish URLs — a second mapping to maintain.

### Testing / CI

Go: `peterldowns/pgtestdb` v0.1.1 + `google/go-cmp` v0.7.0. That's it. Plus stdlib `testing`, `httptest`, **`testing/synctest`** (stable since 1.25), `go test -fuzz`, and a `-update` golden flag. Tools: `gotestsum`, `golangci-lint` v2.13.2, `govulncheck`.

**Deliberately not adding** testify, testcontainers-go, any mocking library, any snapshot library, or clockwork.

pgtestdb model: migrations run **once** into a template DB keyed by a migrations hash, then `CREATE DATABASE ... TEMPLATE` per test — **~500 ms once, ~10 ms per clone**, concurrency-safe via advisory locks so `t.Parallel()` works, and on failure it **leaves the DB alive and logs a connection string**. Use `pgtestdb.Custom(...)` → `Config.URL()` → `pgxpool.New`. Two caveats: `Config` takes discrete fields not a URL (~8 lines to map from `TEST_DATABASE_URL` via `pgx.ParseConfig`), and there's **no bundled migrator for plain numbered `.sql` files** — but the `Migrator` interface is exactly two methods, so a `//go:embed migrations/*.sql` migrator that SHA-256s the concatenated contents and Execs in filename order is ~30 lines. That also means tests exercise your real migration files.

`testcontainers-go` is very much alive (v0.44.0, pushed today) with documented Colima/Podman paths, but it solves "I have no Postgres" and you already have a tuned one — skip until you add Redis/S3. `embedded-postgres` gives **native Apple Silicon binaries only from Postgres 18.3.0+**, so on your Mac against `postgres:17` you'd be on Rosetta or testing a different major version than you deploy. `go-txdb` wraps each test in one transaction and rolls back — fatal since `Save` is delete-then-insert and `RebuildIndex` wants its own transaction.

Frontend: `vitest` **4.1.11 (not 5.x — still RC)** + `@vitest/browser` + `@vitest/browser-playwright` + `@testing-library/react` 16.3.3 (⚠️ `@testing-library/dom` is a **separate peer dep** since RTL 16) + `user-event` + `jest-dom` + `msw` 2.15.0 (**HTTP *and* WebSocket mocking**) + `@playwright/test` 1.62.1 + `@axe-core/playwright` + `happy-dom` as the fast lane for non-IndexedDB tests.

Use **Vitest browser mode** for the optimistic-write/rollback tests — real browser IndexedDB, drag-and-drop, and WebSocket semantics, all of which jsdom fakes badly. It reuses the Playwright Chromium you already installed, so near-zero marginal cost.

Order: (1) fix the silent skip, (2) pgtestdb, (3) **GitHub Actions for the backend — you currently have zero CI, the single biggest gap**, (4) Vitest+RTL, (5) Playwright scaffolding thin with `webServer` booting the Go binary, (6) browser mode for IndexedDB, (7) MSW for 401-mid-flight / 422-field-errors / network failure, (8) multi-arch Dockerfile + buildx on **native arm64 runners (no QEMU)**, (9) `just` replacing COMMANDS.md, (10) govulncheck + Dependabot + `go mod tidy` check.

**Fix the silent skip by inverting the default.** The current `scripts/test.sh` guard is thoughtful but lives *outside* the test binary, so `go test ./...`, IDE gutter-run buttons, and any direct CI invocation still pass vacuously (and GoLand won't source `.env`). Absence of config should mean **fail**; skipping should require an explicit visible flag — Go already ships `-short`. ~15 lines in `internal/document/main_test.go`, no deps. Note `flag.Parse()` must run before `testing.Short()` is readable.

---

## License landmines found

🚨 **AGPL / no-permissive-option:** ParadeDB `pg_search`; `vchord_bm25` (AGPL **or** ELv2); Elasticsearch (AGPL was **added** in Aug 2024 alongside SSPL and ELv2 — it did **not** replace them, and `x-pack/` stays ELv2-only, so there is **no permissive option**); Triplit's **client** package.

⚠️ **Source-available / BSL / FSL:** PowerSync's service (FSL-1.1, auto-converts to Apache-2.0 after 2 years); Convex (FSL-1.1); **Meilisearch is no longer purely MIT** — `MIT AND BUSL-1.1`, EE modules added Aug 2025 (only sharding is actually gated, but the BUSL code ships in the same binary and scanners will flag it).

🚨 **GPL:** Typesense (GPL-3.0 — arm's-length HTTP is fine, don't link or vendor); `iframe-resizer` (GPL-3.0 + $16–$486 tiers); TinyMCE and CKEditor 5 (GPL-or-commercial, and comments/track-changes are paid premium on top); BlockNote's **XL packages carry a literal npm license field of `GPL-3.0 OR PROPRIETARY`** with commercial escape at **$195/mo**.

💰 **Paid tiers on things you'd reach for:** TipTap Comments (private registry, $59/mo min, no free tier); **RxDB's IndexedDB *and* OPFS storage adapters are premium from $99/mo** — the free tier's browser storage is a *Dexie wrapper*, so you'd pay an abstraction tax to use Dexie; Pintura €169–€749/yr *per seat* incl. testers/designers/backend devs, with **OEM licensing required if customers integrate it for resale**; Chromatic; GoReleaser Pro; AG Grid Enterprise; MUI X Pro/Premium; Hey API Platform (pricing TBA).

✅ **Cleared of suspicion:** Dexie core (Apache-2.0, nothing moved behind Dexie Cloud); Zero (Apache-2.0 with a public no-relicense commitment); Uppy (MIT, Companion self-hostable, Transloadit optional); Orama (Apache-2.0, active); `react-dropzone` (most active it's ever been); `fractional-indexing` (**CC0-1.0**, public domain); DOMPurify (`MPL-2.0 OR Apache-2.0` — a permissive *choice*); Quickwit (relicensed **AGPL → Apache-2.0** in Jan 2025, the opposite direction). GitHub reports `NOASSERTION` for goose, golang-migrate, squirrel, and klauspost/compress — LICENSE files read directly: first three MIT, last BSD-3.

## Dead or stalled — do not adopt

**Archived:** ZincSearch (**archived 2026-08-18**, last release Jan 2024, README redirects to OpenObserve); ZomboDB (**archived**, PG≤15 so it can't even run on your `postgres:17`, maintainer: *"no plans to offer pg16 or pg17 support unless someone sponsors me"*); `apache/incubator-annotator`; `hypothesis/dom-anchor-text-quote` fork; `robertknight/anchor-quote`; `nfnt/resize`.

**Dormant:** `bluge` (master last commit **2022-07-04**); Triplit (**acqui-hired by Supabase Oct 2025**, no commits in a year, cloud closed to new users); `gorilla/websocket` (last commit 2025-02, 81 open issues, issue #1016 *"This project is dead again"*); `cmdk` (issue #410 *"Project dead?"*, no maintainer reply); `squirrel` (*"Squirrel is complete"*) and `goqu`; `reconnecting-websocket` (2020) and `sockette` (2019); `lunr` (2020); `fzf-for-js` (2023); `react-beautiful-dnd`; `dnd-kit` stable (no release since Dec 2024); `Remirror`; `disintegration/imaging` (2019); `robfig/cron` (2019); `kelseyhightower/envconfig` (2019); `julienschmidt/httprouter` (2019); `sajari/fuzzy` (2021); `schollz/closestmatch` (2019); `Twirp` (2024); `stow`; `Legend-State` v3 (**beta 2+ years**, `latest` on npm still resolves to Aug 2024).

⚠️ **Renamed / moved — easy to trip on:** `@base-ui-components/react` → **`@base-ui/react`**; `@udecode/plate` → **`platejs`**; `deepmap/oapi-codegen` → **`oapi-codegen/oapi-codegen/v2`**; `casbin/casbin` → **`apache/casbin`** (v3 breaking, tutorials are v2); `nhooyr/websocket` → **`coder/websocket`**; `volatiletech/authboss` → `aarondl/authboss`; `hey-api/openapi-ts` → `hey-api/hey-api`; `tensorchord/VectorChord-bm25` → a personal account; ElectricSQL → **electric.ax**, and it's **read-path-only sync now**, not the CRDT local-first framework it was pre-2024. The `ProseMirror/prosemirror` **meta-repo is archived** — that's just the umbrella/docs repo; the individual `prosemirror-*` packages shipped last week. Don't misread it as abandonment.

---

## What no library covers — you're writing these

| Piece | Size |
|---|---|
| Nested AND/OR filter → parameterized SQL, + the field whitelist registry (reused by validation and cursor checks) | ~300 lines |
| Review-request mark, multi-block instance gathering by `requestId`, approval-hash staleness in `Save`, orphan detection, the entire reviewer UI | largest single piece |
| Schema-aware search extractor to replace generic `FieldText`, + typed `FieldValue` sibling | ~100 lines |
| SSE/WS client registry, subscription tracking, `change_events` sequence + replay | ~150 lines |
| Session create/validate/revoke; the always-allow `Can()` gate | ~100 lines |
| Cursor encode/decode (⚠️ tuple **must** include a unique tiebreaker or you silently skip and duplicate rows on ties; the decoded cursor is untrusted input) | ~40 lines |
| Markdown paste plugin | ~30 lines |
| iframe resizer + parent-side link interceptor + `/render` endpoint with the CSP header and element deny-list | ~120 lines |
| AspectType CRUD, ordered field definitions, N editor instances, focus order | — |
| Uploads backend: content-addressed storage, `blob_refs` + orphan GC **with a grace window**, MIME allowlist (**SVG is the trap** — an image *and* a script context), pixel-budget rejection before decode, EXIF stripping, optimistic insert/rollback | — |
| `CopyFrom` rewrite of `Save` and `RebuildIndex` | mechanical |

⚠️ **Two things to verify before shipping the sandbox:** the browser probes above are **Chromium 148 only** — re-run the srcdoc-CSP-inheritance and sandbox-link-navigation tests in Firefox and Safari. The "plain links don't navigate under `sandbox=\"\"`" result contradicts the HTML spec's sandboxed-navigation flag and may be a Chromium quirk.

---

# Full per-domain reports

The complete reports (each with per-library version/date/license/star tables, verdicts, and sources) are preserved separately:

- Go backend infrastructure — inline above in full
- Client sync engine — inline above in full
- Editor + HTML sandbox — inline above in full
- React UI layer — `library-research-ui.md`
- Search — inline above in full
- API contract + codegen — `library-research-api.md`
- Testing / CI / deploy — `library-research-testing.md`
