All three research passes are complete. Here's the consolidated report.

---

# Mainstream Dev/PM Tools Through an ADHD Lens — Audit for Laminar Flow

**Research date:** 2026-09-02. **Method:** Linear's own docs (via authenticated docs search), product/marketing pages, changelogs, HN Algolia API, W3C COGA, CHI/CSCW literature.

**Read the limitations first — they change how much weight to put on parts of this:**
- **Reddit was entirely inaccessible.** WebFetch fails on `reddit.com` and `old.reddit.com`; WebSearch refuses the domain. **Zero data from r/ADHD_Programmers, r/ADHD, r/productivity.** That was the richest requested source and it is missing. User-voice findings are HN-heavy and skew senior/Mac/self-hoster.
- **WebSearch budget hit its session cap (200/200)** partway through, cutting off blog and Mastodon/Bluesky discovery.
- **`dev.to`'s `adhd` tag is ~40 posts of near-duplicate AI content-farm output.** Not usable as authentic commentary.
- Everything below distinguishes **[user-reported]**, **[documented]**, and **[analysis]** (mine).

**One correction to circulating information:** Multiple SEO blogs (e.g. `workmanagementhub.com`) describe a Linear **"Cycle Autopilot"** feature released March 2026 that rolls P0/P1 forward, flags P2/P3, and backlogs P4. **This does not exist.** It appears in neither [linear.app/docs/use-cycles](https://linear.app/docs/use-cycles) nor [linear.app/changelog](https://linear.app/changelog). Treat those sites as AI-generated slop.

---

## LINEAR SCORECARD

| Linear design choice | ADHD verdict | Conf. | Do differently in Laminar Flow |
|---|---|---|---|
| **Command palette (⌘K) as universal action surface** | **Helps, strongly.** It is the recognition/recall synthesis — fuzzy-searchable action list (recognition), keyboard-only execution, zero persistent chrome. NN/g names CLIs as the textbook recall-failure case; a palette removes exactly that cost. | High | Keep, and make it the *primary* surface, not a power-user shortcut. Every action reachable from it, including review actions ("mark region reviewed and advance"). |
| **Keyboard shortcuts everywhere** | **Helps — and the "ADHD users can't retain shortcuts" hypothesis was NOT supported by anything I could find.** The actual finding is the opposite: Linear is held up as the *model* for shortcut discoverability. | Med-High | Ship inline shortcut hints on hover/menus by default, non-dismissible. This is the thing people want copied. |
| **Shortcuts documented per-feature, not in one giant list** | **Helps.** Linear's docs have *no* keyboard-shortcuts reference article; each feature doc has a "Keyboard" subsection. Shortcuts are taught in the context where you'd use them. | Med | Copy this. Contextual teaching beats a cheatsheet nobody opens. |
| **High information density / minimal chrome** | **Genuinely contested — and I found no ADHD-user commentary on Linear's density at all.** W3C COGA's "Avoid Too Much Content" says [documented] "Provide users with five or less main choices on each screen," and warns busy pages "cause cognitive overload, anxiety and loss of focus." But COGA cites dementia/TBI/aphasia, not ADHD, and targets general web content, not expert tools used daily. | **Low** | Don't resolve this by picking a side. Ship density as the default, plus a real **compact/comfortable/spacious** toggle and a per-view "show fewer properties" preset. Linear's `Display options` already lets you hide properties — surface that as a first-class density control instead of burying it. |
| **Speed / optimistic UI / local-first (IndexedDB primary store)** | **Helps.** Best-grounded item on this table, but the rigorous version is narrower than "latency is an accessibility issue." Nielsen: [documented] "the limit for the user's flow of thought to stay uninterrupted" is 1.0s; 0.1s for direct-manipulation feel. Linear ships ~ms local mutations vs ~300ms for CRUD. **No ADHD-specific latency research exists that I could find.** [analysis] The defensible claim: *unpredictable* latency forces you to re-check whether input registered — that re-checking is the attention tax, not the wait itself. | Med-High | Adopt a written budget: sub-16ms input-to-paint for edit/select; **optimize p99 jitter, not the mean.** On React 19 + TanStack this mostly means keeping TipTap transactions off expensive re-render paths. |
| **Cycles with automatic rollover** | **Helps — this is the graceful-return pattern done right.** [documented] "There is no way to keep unfinished issues in a closed cycle." Open issues roll forward automatically; no ceremony, no date math, no guilt prompt. Cooldowns are structural permission to not ship. | High | Keep verbatim. **Add:** rollover must be silent and produce **no "carried over ×3" badge.** A rollover counter converts a forgiveness mechanic into a shame mechanic. |
| **Cycle capacity dial + burn-up graph** | **Mixed.** Capacity-from-last-3-cycles velocity is real feedback for time blindness. But the cycle graph's "target line" is a percent-complete artifact — the exact thing Basecamp's Hill Charts were built to replace. | Med | Ship capacity. **Replace or supplement the burn-up with a hill chart** (detailed below). Percent-done is the wrong progress representation for uncertain work. |
| **Triage as a separate quality gate** | **Helps.** [documented] Triage issues are "excluded from all views" by default, and it has single-keystroke dispositions (`1` accept, `2` duplicate, `3` decline, `H` snooze) plus snooze-until-activity. This is a bounded, finishable queue. | High | Copy the single-keystroke disposition set and the snooze-or-on-activity semantics exactly. Bounded queues are finishable; infinite backlogs are not. |
| **Auto-close + auto-archive** | **Helps.** Archiving is [documented] *automatic only — not available as a manual action.* Stale work decays without you deciding to delete it, which removes a decision that ADHD users reliably don't make. | High | Copy, including "no manual archive." Notify the creator so unarchiving is possible. |
| **"My Issues" with **Focus** grouping** | **Closest thing in the category to "what do I do next" — and still not close enough.** [documented] Focus orders assigned issues by urgent → SLA-bound → blockers → cycle work → other active → triage → backlog. It answers "what's most important." It does **not** answer "what can I actually start in the next 40 minutes." | Med-High | Build the Focus ordering, then go further: surface a **small curated choice set (2–3 candidate next actions)**, not one mandated item and not the full list. See §5, contradiction 7. |
| **Inbox: you cannot filter what arrives** | **Hurts.** [documented] "You cannot choose which notifications go to your Inbox. All notifications will arrive there." Notification types are also bundled — you can't take status changes without completions, cancellations, urgent-priority changes, and blocking-relation changes. | High | Per-event-type in-app inbox filtering, unbundled. This is a straightforward win over Linear. |
| **No focus mode, no reduced-motion, no density setting, no quiet hours (desktop), no shortcut remapping** | **Hurts.** [documented] [Account preferences](https://linear.app/docs/account-preferences) has font size, theme (70+), pointer cursor, underlined links, first-day-of-week — and none of the above. Notification *scheduling* exists on mobile only. | High | Ship a **decomposed** focus mode (VS Code's model: individual toggles, incl. a `silentNotifications` equivalent), reduced-motion, density, and quiet hours on all platforms. |
| **Estimates are abstract points only (Fib/exp/linear/T-shirt)** | **Hurts — no wall-clock anything.** [documented] Linear has **no time tracking at all.** Due dates exist; SLAs exist (Business+). There is no hours estimate, no actual-vs-estimated feedback, no visual time. | High | See Gaps §1. This is your single biggest opportunity. |
| **SLA fire icon: gray → yellow → orange → red** | **Interesting — Linear *does* have one visual-time mechanic, and hides it.** It's gated to Business/Enterprise and framed as a customer commitment. | Med | Generalize the mechanic, ungate it, and reframe: a decaying visual indicator for *any* dated or started work. |
| **Settings philosophy: "settings are not a design failure"** | **In direct tension with Linear's own Method** — which says [documented] "Your tools should not make you the designer and maintainer of them" and "Flexible software lets everyone invent their own workflows, which eventually creates chaos." | High | **This tension is your central design risk** — see §4 and the Aspect-schema warning. |
| **Linear Diffs / Guided reviews (May 2026)** | **Helps on ordering; does nothing for resumption.** Guides [documented] "surface the core parts of an implementation first while grouping supporting or lower-signal changes separately." But Linear's docs describe **no per-file viewed state, no revision-indexed read state**, no per-commit review, and draft reviews don't even sync from GitHub. | High | **Resumption is your wedge.** Linear and Graphite both solved the review *inbox*; nobody except Reviewable solved *within-review* resumption. See §3.2. |

---

## COMPARATIVE TABLE

| Tool | Best ADHD-relevant idea | Worst ADHD-relevant flaw | Link |
|---|---|---|---|
| **Linear** | Automatic cycle rollover — unfinished work moves forward with zero ceremony or guilt | Inbox is unfilterable; no focus mode; no wall-clock time of any kind | [linear.app](https://linear.app) |
| **Jira** | Genuinely nothing attention-serving; the SLA-style aging is the closest | **12+ config concepts, 4 layers of scheme indirection** (work types → work type schemes → workflow schemes → screen schemes → field config schemes). Configuration is a project before use. | [support.atlassian.com/…/configure-issues](https://support.atlassian.com/jira-cloud-administration/docs/configure-issues/) |
| **GitHub Issues/Projects** | Radical minimalism; zero setup; 3 layouts (table/board/roadmap) | No per-issue workflow states, no sprints, no estimates. Up to 50 custom fields = Jira's problem re-invented per-project with no guardrails. | [docs.github.com/…/about-projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects) |
| **Shortcut** | Explicit **WIP limits per workflow state** — "story limits in each workflow state" | Story/Epic/Iteration/Objective = 4 hierarchy concepts before you file anything | [shortcut.com](https://www.shortcut.com/) |
| **Plane** | Direct self-hostable peer; Docker Compose + K8s + Helm; single-command "Prime CLI"; AGPL-3.0, 58.8k stars | Work Items + Cycles + Modules + Views + Pages + Initiatives + Epics — **more concepts than Linear**, in a tool positioned as the simpler one | [plane.so](https://plane.so) · [github.com/makeplane/plane](https://github.com/makeplane/plane) |
| **Huly** | Time-blocking built into the PM tool (rare in this category); bidirectional GitHub sync | Self-describes as replacing "Linear, Jira, Slack, and Notion" — maximum surface, incl. a virtual office with A/V | [huly.io](https://huly.io) |
| **Vikunja** | Genuinely small scope; no-signup public demo | Docs lead with Docker/reverse-proxy/LDAP/OpenID/hardening. Setup is the first thing you meet. | [vikunja.io/docs](https://vikunja.io/docs/) |
| **Focalboard** | — | **Standalone repo is unmaintained** ("If you're interested in becoming a maintainer please let us know"). Only `mattermost-plugin-boards` continues. Don't benchmark against it. | [github.com/mattermost-community/focalboard](https://github.com/mattermost-community/focalboard) |
| **Basecamp** | **Hill Charts** — progress as uncertainty, not percent. Plus a communication doctrine: "Urgency is overrated, ASAP is poison." | No keyboard-first navigation, no density, no dev workflow. Wrong tool for this audience. | [basecamp.com/hill-charts](https://basecamp.com/hill-charts) · [basecamp.com/guides/how-we-communicate](https://basecamp.com/guides/how-we-communicate) |
| **Shape Up** (method) | **Appetite** — fix time, vary scope. Plus the **circuit breaker**: unshipped projects are cancelled by default, never auto-extended. | Six-week cycles and "scope hammering" assume a stable team; hostile to solo devs with variable capacity | [basecamp.com/shapeup](https://basecamp.com/shapeup/1.5-chapter-06) |
| **Asana** | My Tasks as a genuine personal home | Task/subtask/section/project/portfolio/goal nesting; notification volume | [asana.com](https://asana.com) |
| **ClickUp** | Feature maximalism as a study in what not to do | **10 categories, 80+ features, 15+ view layouts** advertised on one page. Custom fields + custom statuses + custom roles + custom task types. | [clickup.com/features](https://www.clickup.com/features) |
| **Trello** | Small enough that a **hard WIP limit is enforceable by convention** — the single most-praised ADHD pattern I found | No hierarchy, no dependencies, no keyboard-first; doesn't scale past personal use | [trello.com](https://trello.com) |
| **Notion** | Flexibility genuinely useful — same people who praise it name the problem | Blank-page paralysis; 6 view types × dozens of property types × unlimited nesting = the tool becomes the work | [notion.com/help/create-a-database](https://www.notion.com/help/create-a-database) |
| **Craft** | Tasks embedded directly in documents — planning and thinking stay together (directly relevant to your doc+tracker fusion) | Consolidation-as-simplicity is a claim, not a mechanic; nothing structural about it | [craft.do](https://www.craft.do/) |
| **Bear** | Outline folding to "focus on a section and hide the others" | Tag-based only; no capacity, no time, no structure | [bear.app](https://bear.app/) |
| **Things 3** | **Refuses to be customizable** — and this, specifically, is why ADHD users cite it. Fixed 5-bucket structure: Inbox → Today → Upcoming → Anytime → Someday. Areas (ongoing) vs Projects (finishable) is a hard distinction. | Single-user, no collaboration, Apple-only | [culturedcode.com/things/guide](https://culturedcode.com/things/guide/) |
| **OmniFocus** | Perspectives as a filter-to-what's-relevant mechanic (this is what its ADHD fans actually praise) | Perspectives + custom perspectives + defer dates + Forecast + Review mode + tags + folders + Focus = ~8 concepts. **The maintenance becomes the chore.** | [omnigroup.com/omnifocus](https://www.omnigroup.com/omnifocus/) |
| **Apple Reminders** | Zero-config; ubiquitous capture | "Doesn't scale for work related stuff" [user-reported] | — |
| **TickTick** | **Pomodoro timer + habit tracker + Eisenhower matrix, in the task app.** No developer tool in this category has any of these. | Consumer framing; no dev workflow, no docs, no review | [ticktick.com](https://www.ticktick.com/) |
| **Reviewable** | The reference implementation of "where was I" — read state keyed to **(reviewer, file, revision)** | Code-only; heavy; not self-hostable | [docs.reviewable.io/reviews.html](https://docs.reviewable.io/reviews.html) |

---

## §1 — LINEAR: THE DEEP TEARDOWN

### The keyboard/palette discoverability question, resolved

The framing in the brief — that shortcuts might be "a discoverability trap for people with working-memory limits who can't retain shortcuts" — **did not survive contact with the evidence.** I found no ADHD user saying they can't retain shortcuts. I found the opposite twice:

- [user-reported] c_t_montgomery (engineer at The Browser Company): speed "alongside the keyboard shortcuts, make it pretty hard to give up." Same comment: Linear's Projects feature "helps my ADHD brain understand what the most important thing" is across projects. — [HN 33211448](https://news.ycombinator.com/item?id=33211448)
- [user-reported] stared, complaining about Helix's learning curve: "I would really appreciate visible-by-default hints, alike in Linear.app." He explains why — then "learning shortcuts becomes organic, rather one need to keep tutorial open, or have a cheatsheet." — [HN 45786514](https://news.ycombinator.com/item?id=45786514)

**Resolution:** the cost is in *hiding* affordances, not in *having* shortcuts. Linear is already the cited exemplar because it shows shortcut hints inline in menus and the command palette rather than relegating them to a `?` overlay. Notably, Linear's docs have **no keyboard-shortcuts reference article** — each feature doc carries its own "Keyboard" subsection. Shortcuts are taught where they're used.

**For Laminar Flow:** inline hints on by default and not dismissible; document shortcuts per-feature, never as one wall; make the palette exhaustive so recall is never *required*.

### Cycles: the graceful-return pattern, done right

[documented, [linear.app/docs/use-cycles](https://linear.app/docs/use-cycles)]
- Repeating schedule, 1–8 weeks, fixed start weekday — stated rationale is to "avoid the busywork associated with optimizing cycle timing."
- Optional cooldowns where issues *cannot* be assigned.
- **Rollover:** open issues roll forward automatically. Items moved to backlog/triage/canceled, or completed during cooldown, don't carry. **"There is no way to keep unfinished issues in a closed cycle."**
- Optional auto-add of any Started/Completed issue lacking a cycle.
- Capacity dial from trailing-3-cycle velocity (member count for new teams).
- Cycle Success counts completed at 100%, started at 25%.

This is the best thing in Linear for ADHD, and the reason is that **it removes a decision at the exact moment you'd avoid making it.** No end-of-sprint triage ritual, no "what do we do with the leftovers" meeting.

The one flaw: the cycle graph's blue dotted "target" line is a straight-line percent-complete expectation. That's the representation Hill Charts exist to replace.

### My Issues / Focus — how close to "what do I do next"?

[documented] Focus grouping orders assigned issues: urgent → SLA-bound → blockers → cycle work → other active → triage → backlog → completed; within each, by priority with started first.

This answers **"what is most important."** It does not answer **"what can I start right now."** Nothing in the ordering knows how long anything takes, how much of the day is left, or whether you have the activation energy for the top item. [user-reported] The tools ADHD users describe as solving this are calendar-based: jabroni_salad on Skedpal — with tasks occupying real time on a calendar, "they are real objects instead of just a virtual infinity list," and "'what am I going to do next' decision paralysis is taken care of." — [HN 35471670](https://news.ycombinator.com/item?id=35471670)

### What Linear conspicuously lacks

1. **No time of any kind.** No time tracking. Estimates are abstract points only. No actual-vs-estimate feedback loop — the one mechanism that could calibrate time blindness over months of use.
2. **No visual time.** No countdown, no timer, no "this cycle is 60% elapsed but 30% complete" juxtaposition. The SLA fire icon is the only decaying-visual mechanic and it's paywalled and mis-framed.
3. **No focus/single-task mode.** No way to say "show me one issue and nothing else."
4. **No task-breakdown assistance in the free/basic product.** Sub-issues exist; the docs' advice is prose: "breaking up issues into smaller ones is the best approach." AI breakdown exists via Linear Agent — Business/Enterprise, consumes credits.
5. **No inbox filtering.** [documented] "You cannot choose which notifications go to your Inbox."
6. **No reduced motion, no density control, no desktop quiet hours, no shortcut remapping.**
7. **No initiation support.** Everything assumes you have already decided to work. Nothing addresses task initiation — which the CSCW literature identifies as the primary failure mode (below).
8. **No review resumption.** Diffs solved reading *order*, not *resumption*.
9. **No progress representation for uncertain work.** Points, percent, burn-up. No uncertainty axis.

---

## §2 — THE REST OF THE CATEGORY

### Jira — what *specifically* overwhelms

Be precise, because the popular answer is wrong. [documented, [Atlassian](https://support.atlassian.com/jira-cloud-administration/docs/configure-issues/)] Jira's issue configuration alone requires understanding: work types, work type schemes, workflows, workflow schemes, screens, screen schemes, work-type screen schemes, fields, field configurations, field configuration schemes, priorities, resolutions, statuses. That's **~13 concepts with four layers of scheme indirection** — a scheme is a mapping from work types to a thing, and you configure the mapping separately from the thing.

**But that is not what ADHD users actually complain about.** [user-reported] I found **no** complaints about field count or custom-field sprawl. The complaints were three different things:

1. **Ceremony at the moment of context switch.** jnovek: "JIRA is nearly the opposite of the exploratory experience of programming." — [HN 34867932](https://news.ycombinator.com/item?id=34867932)
2. **The tool is invisible precisely when needed.** This is the single most striking artifact in the entire research pass. riehwvfbk, who frames ADHD as primarily a working-memory impairment: "in that state I don't remember that such as thing as JIRA exists" — **he keeps a phone alarm that reminds him Jira exists.** — [HN 39464239](https://news.ycombinator.com/item?id=39464239)
3. **Loss of agency over what to work on.** Multiple commenters attribute disengagement (and in one case failed jobs) to not being able to pick which ticket to do.

[analysis] Config surface is an *admin* tax; ritual, invisibility, and agency are the *user* taxes. Since Laminar Flow's user is both, you pay both — but the user-side ones are the ones that will make someone abandon it.

### GitHub Issues/Projects — what's lost

[documented] Projects gives 3 layouts, up to 50 custom fields (date/number/single-select/text/iteration), and insights charts. What's missing: per-issue workflow states, sprint semantics, effort estimation. The docs' own framing is "flexible" rather than prescriptive.

[analysis] The loss is that **status lives on the project, not the issue** — so an issue's state depends on which board you're looking at. And the 50-custom-fields escape hatch means every team re-invents Jira's field problem from scratch, per project, with no schemes to at least make it consistent. Minimal-by-default plus unlimited-config is not the same as opinionated.

### Basecamp's Hill Charts — in full

This is the most directly transferable idea in the category for time blindness and "I don't know how close I am."

**The two phases.** [documented, [Shape Up ch.13](https://basecamp.com/shapeup/3.4-chapter-13)] "The uphill phase is full of uncertainty, unknowns, and problem solving. The downhill phase is marked by certainty, confidence, seeing everything, and knowing what to do." Standing at the summit is the moment "there aren't any more unsolved problems."

**Why uncertainty beats percent-complete.** Because "To-do lists actually grow as the team makes progress." Early completion of visible tasks tells you nothing when the unknowns haven't surfaced yet. A dot near the summit doesn't say 50% — it says *the hard unknowns are solved.*

**Human, not computed.** [documented, [basecamp.com/hill-charts](https://basecamp.com/hill-charts)] "the status is human generated, not computer generated. This reflects a real person's feeling of the work at this moment." You drag the dot. Nothing infers your position from ticket counts.

**"Figuring out" vs "doing."** Shape Up is explicit that thinking isn't progress: "Coming up with an approach in your head is just the first step uphill." Real uphill movement means having built and validated something.

**Stuck work surfaces without anyone admitting to being stuck.** Snapshots are timestamped, so you see not just position but motion. "A dot that doesn't move is effectively a raised hand." This creates a low-shame channel for signalling a blocker.

**Bonus mechanic:** when an item won't move on the chart, that's diagnostic — the work is badly bounded and should be split.

**[analysis] Why this maps onto ADHD so cleanly:** time blindness isn't just poor duration estimation, it's poor *position* estimation — "am I nearly there?" is genuinely unanswerable. Percent-complete answers it falsely, which is worse than not answering, because the false answer collapses at 90% and produces the demoralization spiral. Uncertainty-first is honest. And the human-dragged dot is a **self-report channel**, which the CSCW literature (below) identifies as exactly what's missing — tools measure completion instead of asking how it feels.

**Related, and worth stealing separately:** Shape Up's **appetite** inverts estimation — fix time, vary scope. "Anybody can suggest expensive and complicated solutions. It takes work and design insight to get to a simple idea that fits in a small time box." And the **circuit breaker**: work that doesn't ship in a cycle is *cancelled by default*, not extended. [analysis] Note this is in direct tension with Linear's auto-rollover. Rollover is kinder; the circuit breaker is more honest about accumulating debt. You could offer both as a per-project policy.

**Basecamp's communication doctrine** is also relevant: [documented, [how-we-communicate](https://basecamp.com/guides/how-we-communicate)] "Real-time sometimes, asynchronous most of the time"; "Never expect or require someone to get back to you immediately unless it's a true emergency. The expectation of immediate response is toxic"; "Urgency is overrated, ASAP is poison." (I could not verify a documented "no notifications by default" setting or a "Work Can Wait" feature page — the philosophy is cultural doctrine in their guides, not a product default I could confirm. Don't cite it as a product feature.)

### Things 3 — the specific reason ADHD users love it

The reason is narrow and it is **not** aesthetics or gestures. It is that **it refuses to be customizable.**

[user-reported] theshrike79, switching from Obsidian: Obsidian for todos was "a never ending swamp of plugins and optimising data views and reports." He switched to Things 3 and is "couldn't be happier." Why: "It has very little customisation and options." It "just lets me write down my TODO-lists." — [HN 45101109](https://news.ycombinator.com/item?id=45101109)

[documented, [Things guide](https://culturedcode.com/things/guide/)] The structure is fixed and small: **Inbox** ("immediately getting them off your mind"), **Today** ("to-dos that you want to start before the day ends. They're your priorities"), **Upcoming** (timeline by start date), **Anytime**, **Someday**. Plus **Areas** ("for grouping all of your projects and to-dos that support an ongoing ambition" — i.e. never finishes) vs **Projects** (finishes). Headings subdivide big projects.

[analysis] Two design moves are doing the work. First, **Today is defined by intent-to-start, not by due date** — which sidesteps the guilt engine of overdue items entirely. Second, **Areas vs Projects** is a hard structural distinction between things that end and things that don't, so ongoing maintenance work never pollutes a completion metric. Both are cheap to copy.

**Honesty flag:** the premise that Things 3 is "widely praised by ADHD users" is probably true, but on the sources I could reach it rests on essentially one strong comment. The Reddit block cost me most of this.

### OmniFocus — and why the expected finding was wrong

The brief predicted "powerful and overwhelming." That framing **did not appear** in what I found. Instead: OmniFocus is praised *specifically for filtering*, and the overwhelm complaints attach to GTD-the-method, not the app.

[user-reported] daft_pink praises "a todo list manager that only shows me the most important or relevant tasks" — while listing, among things that *haven't* helped, "GTD and long todo lists." — [HN 39480754](https://news.ycombinator.com/item?id=39480754)

[user-reported] FreezerburnV cycled Remember the Milk → OmniFocus → Workflowy → Apple Reminders; "nothing has really stuck." The decisive insight: **maintaining the system became its own chore**, with a permanent overdue backlog. — [HN 27886368](https://news.ycombinator.com/item?id=27886368)

[analysis] The real OmniFocus problem is **~8 concepts** (perspectives, custom perspectives, defer dates, Forecast, Review mode, tags, folders, Focus) and a weekly Review ritual that is itself a task you'll skip. Perspectives are the good idea; the review ceremony is the failure.

### Notion — the core tension, from one person

The most honest version of this comes from a single commenter holding both positions:

[user-reported] ughitsaaron calls Notion one of the most genuinely useful apps he's used, then immediately: "something like Notion could be overwhelming and therefore totally useless." — [HN 37000474](https://news.ycombinator.com/item?id=37000474)

And the sharpest diagnosis in the whole corpus, from a forensic pathologist with ADHD who lost hundreds of ideas across Roam, Notion, and Obsidian:

[user-reported] SlaWisni73: "the problem wasn't me - it was the design philosophy." He names the mismatch as hierarchy/linear/enforced-structure vs associative/network. — [HN 45859662](https://news.ycombinator.com/item?id=45859662) *(disclosure: he's pitching his own tool in that comment — still first-person testimony, but promotional context)*

---

## §3 — DEVELOPER-TOOL ATTENTION QUESTIONS

### 3.1 IDE and editor design

**VS Code's Zen Mode is the model, because it's decomposed.** [documented, [userinterface docs](https://code.visualstudio.com/docs/getstarted/userinterface)] Not one switch but a set: `zenMode.hideActivityBar`, `hideStatusBar`, `hideLineNumbers`, `showTabs` (single/multiple/none), `centerLayout`, `fullScreen`, `restore` (persists across restart), and critically **`zenMode.silentNotifications` (default true)**. Plus a global **Do Not Disturb** in the status bar.

**JetBrains ships a task-matched ladder** rather than one mode: [documented] Distraction-Free Mode (hides "tool windows, toolbars, editor tabs – everything except for the editor") → Full Screen → Zen Mode (both, `⌃\``), plus **Reader Mode** for read-only files, whose stated intent is "clear blank space to let your mind focus." The framing — *pick a mode for whether you're reading, writing, or presenting* — is more useful than a binary focus toggle. — [jetbrains.com/help/idea/ide-viewing-modes](https://www.jetbrains.com/help/idea/ide-viewing-modes.html)

**Sticky scroll is the highest-value-per-pixel mechanic in this whole report.** [documented, [VS Code 1.70](https://code.visualstudio.com/updates/v1_70)] It pins "which class/interface/namespace/function/method/constructor the top of the editor is in, helping you know the location within a document." It shipped *because breadcrumbs were insufficient* — the community framing is that "breadcrumbs are crumby for recognizing the current scope." Costs one line of vertical space, requires zero interaction, permanently answers "where am I."

**Peek over jump-away.** [documented] VS Code's own rationale: "We think there's nothing worse than a big context switch when all you want is to quickly check something." Peek Definition (`⌥F12`) embeds the target inline, editable in place, Esc dismisses.

**Tab overload has two real mitigations.** [documented] (a) **Preview mode** — single-click *reuses* the tab, shown in italics; stated purpose "prevents cluttering the tab bar during file browsing." (b) **A hard cap**: `workbench.editor.limit.enabled` + `.value`, which came from a request whose stated motivation was verbatim "To keep my workspace focused, I like my editor to automatically close files over a set threshold." — [vscode#9872](https://github.com/microsoft/vscode/issues/9872)

**Minimaps: genuinely contested, don't pick a side.** *Against:* too small to identify destinations; ~10% of horizontal editor width; worse in vertical splits; postage-stamp code isn't visually distinctive; keyboard nav subsumes it. *For:* spatial memory is real — people report recognizing "the shape of the code"; it's a better scrollbar (length + position at once, unlike auto-hiding OS scrollbars); and it's an **overview ruler** surfacing linter warnings, recent edits, and search hits as colored ticks. VS Code later added **minimap section headers** (renders region markers as legible text), targeting the main complaint. The honest conclusion from the sources: usage divides by cognitive style, not correctness. — [HN 36757542](https://news.ycombinator.com/item?id=36757542) · [stefanjudis.com](https://www.stefanjudis.com/blog/vs-code-minimap-section-headers/)

**Zed's latency philosophy.** [documented] Goal: "a code editor so responsive it almost disappeared." 60–120Hz leaves **8.33ms per frame**; they optimized to **under 4ms**, and hold 120FPS for 1s after last input to stop display downclocking. — [zed.dev/blog/120fps](https://zed.dev/blog/120fps) · [zed.dev/blog/videogame). **Zed makes no cognitive or flow claims** — that inference is the reader's. Their genuinely attention-aware stance is elsewhere: "subtle mode" for AI prediction exists because the UI "can feel distracting—or even 'too in-your-face,'" and in it "not a single AI edit prediction will appear without you requesting it." — [zed.dev/blog/out-of-your-face-ai](https://zed.dev/blog/out-of-your-face-ai)

**ADHD-specific IDE commentary is nearly absent.** No VS Code / Zed / JetBrains design document mentions ADHD. The best find is oblique but excellent: [user-reported] w10-1 on Eclipse's **Mylyn**, noting extra cognitive load "affects everyone but manifests distinctly in people with executive function issues," and advocating task-based filtering that reduces load through selective visibility. — [HN 36726884](https://news.ycombinator.com/item?id=36726884)

**Mylyn deserves attention** because it's the only mainstream implementation of the idea: [documented, [Wikipedia](https://en.wikipedia.org/wiki/Mylyn)] Mylyn monitors your activity per task, builds a **task context**, and then *hides irrelevant files and code members* — activating a task restores its context. This is "focus mode driven by inferred degree-of-interest" rather than by a manual toggle. It's largely dormant now, and nobody in this category has revived the idea.

**What Laminar Flow should do:**
- Sticky scroll for the TipTap document: pin the H1 › H2 › H3 chain *and* the enclosing Aspect block.
- Breadcrumbs as a **navigator** — clickable, sibling dropdown per level, keyboard-focusable.
- **Peek, don't jump** for cross-references between docs/tickets/Aspects; Esc to dismiss; always Go Back.
- Decompose focus mode into toggles, and include a silent-notifications equivalent. *A focus mode that still pops toasts is not a focus mode.*
- Preview-tab semantics plus an optional hard tab cap with LRU eviction.
- If you build a minimap: **default it off**, and make its payload **marks** (unresolved review requests, unread comments, changed regions, search hits) plus legible section headers — not a shrunken screenshot of prose.
- [analysis] Ship a **Reader Mode** for design docs (JetBrains' idea applied to prose): wider line-height, narrow measure, code collapsed to a summary line, editing chrome gone. Reviewers reading a 4,000-word doc are in a different mode than authors writing it.
- [analysis] Consider a **Mylyn-style task context**: activating a ticket dims/collapses unrelated Aspects and documents. Nobody in this category does this.

### 3.2 Code review and "where was I" — your wedge

**GitHub's exact limit.** [documented] Marking a file **Viewed** collapses it, and the header progress bar shows how many you've viewed. But: "If the file changes after you view the file, it will be unmarked as viewed." So the model is `viewed = (user, file) → bool`, invalidated on change. Three consequences: (1) it records *that* something changed, not *which version you approved*, so you can't be shown a delta — you re-read the file; (2) file granularity only, so a 900-line file is one bit; (3) there's no "mark all unviewed" — people run console JS to do it. GitHub's Dec 2025 rework added commit-by-commit review, and its community feedback thread is full of lost-your-place complaints (sticky header gone, so you scroll "all the way up" to see branch names). — [github.blog changelog](https://github.blog/changelog/2025-12-11-review-commit-by-commit-improved-filtering-and-more-in-the-pull-request-files-changed-public-preview/) · [community#163932](https://github.com/orgs/community/discussions/163932)

**Reviewable is the reference implementation.** [documented, [docs.reviewable.io](https://docs.reviewable.io/reviews.html) and [files.html](https://docs.reviewable.io/files.html)] State is keyed to **(reviewer, file, revision)** — "which helps you easily remember where you left off in the review and focus on subsequent changes." Mechanics worth copying wholesale:
- **Per-file chip** with rich semantics, not a boolean: *your review requested / open for anyone / already reviewed / pending your publication / others requested / fully reviewed.*
- **Revision cells + draggable diff bounds** — a row of revision cells per file; click or drag to set left/right bounds. This makes "what changed since I last looked" an *adjustable query*.
- **Avatar-as-diff-selector** — click a reviewer's avatar and get the diff between their last-reviewed revision (per file) and latest. Avatar opacity fades with recency. **Reviewer state becomes a navigable coordinate, not just bookkeeping.** This is the killer mechanic.
- **Mark-reviewed-and-advance at the *bottom* of each diff**, keyboard-bindable. Stated rationale is pure attention-flow: "moving the mouse up there to click it after you're done reading down through the diffs breaks your visual flow." — [reviewable.io/blog](https://www.reviewable.io/blog/mark-reviewed-and-advance-button/)
- **Action-typed counters**: red = needs *you*; grey = waiting on others; grey-striped = deferred; **green donut = all checks pass.**
- **File matrix** — files × revisions grid with delta stats and reviewer avatars; obsolete files auto-grouped into a ↺ Reverted section.
- **Rebase survival** — old revisions preserved and marked obsolete with strikethrough, still diffable; commits pinned under `refs/reviewable`. "You can rebase freely without corrupting the review history."
- **Computed completion**: mergeable AND all files reviewed at latest revision by non-authors AND all discussions resolved. Overridable, with a "completion condition playground."
- Server-side auto-saved drafts (resume from any device).

**Gerrit** keys reviewed state to (user, file, **revision**) too, exposes a **patchset selector on both sides of the diff header**, and has an **Attention Set** — an explicit, mutable, searchable (`attention:<User>`) "whose turn is it" flag you can click to remove yourself from. — [gerrit-review docs](https://gerrit-review.googlesource.com/Documentation/user-review-ui.html)

**Phabricator/Differential is your closest precedent, because it solved anchors on mutable content.** [documented] **Ghost comments:** when a revision updates, Differential forwards inline comments to their new locations, rendered with a "pale, ghostly appearance" plus a button linking back to original context. Stated principle: "We err on the side of caution by bringing comments forward aggressively" — because an algorithm can't know whether a change addressed the concern. And they name their own failure mode: "Ported comments sometimes appear in unexpected locations," with an opt-out in Diff Preferences. — [secure.phabricator.com](https://secure.phabricator.com/book/phabricator/article/differential_inlines/)

**CodeRabbit's Change Stack** is the cheap version of a revision matrix: groups a PR into a small number of ordered "change cohorts" reflecting natural reading order; `J`/`K`/`Z` keyboard nav; **snapshot history per PR** plus **out-of-date warnings** when the PR moved past the snapshot you read. Stated problem: reviewers must "reconstruct" the author's understanding "file by alphabetical file." — [coderabbit.ai/blog](https://www.coderabbit.ai/blog/introducing-atlas-the-first-ai-native-code-review-interface)

**Graphite** solves the *inbox* (configurable PR Inbox sections; orange bar when a PR you're reviewing changed upstack), not within-review resumption. — [graphite.com/blog/github-pr-filters](https://graphite.com/blog/github-pr-filters)

**What Laminar Flow should do — this is the highest-leverage section in the report:**
1. **Key review state on `(reviewer, region, document_version)`, not `(reviewer, region) → bool`.** This one schema decision determines whether resumption is possible at all. Retrofitting it later is a migration from hell. **Do this now.**
2. **Default view on reopening a review request = "changes since I last read this region."** With versioned read-state you can compute it. That's Reviewable's avatar-click, generalized.
3. **Copy Phabricator's ghost comments wholesale** — port anchors aggressively, render ported anchors visually degraded, always keep a "view original context" link, let users disable porting. TipTap prose mutates far more than code, so exact anchors *will* break constantly. ProseMirror step-mapping gives you the rebasing primitive; the design work is the ghost styling and the escape hatch.
4. **Two-tier granularity:** region-level (the anchored unit) *and* section-level (heading-scoped) read state. Region-only is too fine to summarize; section-only repeats GitHub's mistake at a different scale.
5. **Mark-reviewed-and-advance at the bottom of each region, `J`/`K`-bound**, auto-scrolling to the next unreviewed region.
6. **Typed counters, not just a bar** — red/grey/striped/green in the document header, mirrored as gutter marks (the legitimate use for a minimap-as-overview-ruler).
7. **Computed completion**, with the rule visible and editable — valuable in a self-hosted tool where teams want their own.
8. **Snapshot the version each reviewer read; warn on staleness.** Achievable in v1 even without draggable bounds.
9. **Server-side auto-saved draft comments, published as a batch.** Reviewable, Gerrit, and Phabricator all do this and all explain why: coherence and notification volume. It's also the best "resume after three days on a different machine" feature.
10. **An Attention Set equivalent** — explicit, mutable, filterable "whose turn," not only inferred from unresolved threads. Inference is often wrong at solo/tiny-team scale.
11. [analysis] **Let the author declare the review reading order across Aspects.** Linear and CodeRabbit use AI to *infer* narrative order for code they didn't write. Your author already wrote a structure — just let them say "read Data Model before API." Neither competitor can do this.
12. **Do not build a review inbox before within-review resumption.** Graphite and Linear both did the inbox. Resumption is unclaimed.

### 3.3 Documentation readability

**Diátaxis is the most important find for Aspect schemas.** [documented, [diataxis.fr](https://diataxis.fr/)] Two axes — *action vs cognition*, *acquisition vs application* — generate four types: **Tutorial** (learning, user at study), **How-to** (task, user at work), **Reference** ("what a user needs... while they are working" — lists, tables, deliberately "boring, unmemorable"), **Explanation** (concepts, why, what-if).

Why mixing harms readers: a document trying to educate and direct practice simultaneously "becomes ineffective at both." The named failure is **reference going "expansive"** — explanation creeping in via examples and asides, cluttering the reference *and* leaving the explanation underdeveloped. Consequence: readers whose docs don't meet their need "will find something else that does, if they can."

[analysis] **Aspect schemas are doing Diátaxis's job at a different altitude.** Problem/Context and Decision/Rationale are *explanation*; Interface/Schema is *reference*; Migration Steps is *how-to*. Diátaxis gives you the citable argument that enforcing the separation **is a readability feature, not bureaucracy** — a reader in reference mode should never wade through explanation to find a field name.

Diátaxis's **process** advice is also a product affordance waiting to happen: don't replan the tree; pick a piece, ask "what single next action produces an immediate improvement here?", do it, publish. Stated benefit: it "helps reduce the stress of one of the most paralysing and troublesome aspects of the documentation-writer's work: working out what to do." Docs are "never finished" but "can always be complete."

**The ADHD-specific reading finding — and a caveat.** A CHI 2026 paper reports that ADHD participants said "overly dense or lengthy blocks of text led to **avoidance of reading**, and text split into chunks helped them sustain attention." — [doi 10.1145/3772363.3799383](https://dl.acm.org/doi/full/10.1145/3772363.3799383). **ACM returned 403 on both the full text and the DOI; that quote is from a search snippet, not a read of the paper. Verify it before relying on it.** It's the most on-point citation here and it's the one I couldn't fetch.

**ADHD ≠ dyslexia, and this changes the design.** [documented] Dyslexia is letter/word decoding; ADHD is attention and working memory, with failure modes named as "visual crowding, line-tracking loss, mind-wandering mid-sentence, working-memory strain." **So spacing and noise reduction matter more than letter-shape disambiguation.** — [accessibilitychecker.org](https://www.accessibilitychecker.org/blog/the-best-fonts-for-adhd/)

**Concrete numbers.** 50–75 characters per line, ~66 optimal (from Bringhurst's 45–75). Dyson & Haselgrove: ~55 CPL supports effective reading at normal *and* fast speeds. Over ~80 CPL, readers "lose their place when returning to the next line, significantly reducing comprehension" — [analysis] every lost return sweep is a re-entry cost, which is precisely what compounds with ADHD attention. Line height 1.5 baseline, 1.6–1.7 above 75 CPL. WCAG 2.2 SC 1.4.8 caps at 80 CPL. BDA: 60–70 CPL, ≥150% spacing. 16px+ on screens. Left-align, never justify. Fonts with actual backing: **Lexend** ("purpose-built to reduce visual crowding") and **Atkinson Hyperlegible** (maximizes character distinction to reduce re-reading) — both freely licensed. — [uxpin.com](https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/)

**Who does it well.** **Stripe's** current answer to "different readers need different densities" is **multiple renderings of one source** — the payments quickstart opens with "Read this page in your terminal: install the Stripe CLI... and run `stripe docs`," links a `.md` variant, and embeds machine-directed guidance. Plus classic progressive disclosure. — [docs.stripe.com](https://docs.stripe.com/payments/quickstart). **The Rust Book** (mdBook): persistent sidebar ToC; chapter numbering visible in the URL (`ch01-01-installation.html`) so position is legible from the address bar; **prev/next links at both top and bottom** of every page so you never scroll to navigate; keyboard nav (`←`/`→`, `S` or `/` search, `?` help); four themes incl. two dark and two low-contrast; "what this chapter covers" bullets at each chapter open (an at-a-glance box by another name). — [doc.rust-lang.org/book](https://doc.rust-lang.org/book/). *Tailwind and MDN: not verified — I ran out of search budget.*

**What Laminar Flow should do:**
- **Type Aspect blocks Diátaxis-style and render each type differently.** Reference-shaped → dense tables, **collapsed by default**, optimized for lookup. Explanation-shaped → prose at 60–70 CPL, 1.5 line-height, **expanded by default**. How-to-shaped → numbered steps.
- **Lint the "expansive reference" anti-pattern** — warn when a reference-typed Aspect's prose-to-structured ratio drifts. This is implementable, and Diátaxis names it for you.
- **Auto-generate a tl;dr / at-a-glance block from the Aspect schema itself.** Because Aspects are structured, you can render "Decision: X. Status: Y. Blocking: Z. Open questions: 3." with nobody writing a summary. **This is your single biggest structural advantage over Notion/Confluence**, and the avoidance finding is the justification.
- **Hard-cap prose measure at ~65–70 CPL** (`max-width: ~34rem` @16px), 1.5 line-height, left-aligned. Do not let design docs run full-width on a 32" monitor.
- **Font/reading-mode toggle** with Atkinson Hyperlegible and Lexend, adjustable line-height and letter-spacing. Cheap, and it's the one accommodation with ADHD/dyslexia research behind it.
- **Chunk aggressively; every chunk gets a descriptive subheading.** The failure mode is the doc never getting read at all, not slower reading.
- **Sticky ToC with scroll-spy AND sticky-scroll heading chain.** Different jobs — the ToC says "what's here and how much is left," sticky scroll says "where am I now." Ship both.
- **Persisted per-user collapse state**, defaults driven by Aspect type rather than by the author remembering `<details>`.
- **Estimated read time per document *and per Aspect*** (~238wpm non-fiction). Per-Aspect estimates let someone with 6 minutes pick a section instead of bouncing off the doc. [analysis] I found **no** research linking read-time estimates to reduced abandonment — treat as plausible, not proven.
- **Serve a plain-markdown rendering of every document.** Nearly free from TipTap, and it serves agents/MCP, terminal-preferring users, and readers who want zero chrome at once.
- **Make Diátaxis's process a product affordance:** surface "what single next action improves this doc?" by flagging empty, stale, or unreviewed Aspects.

### 3.4 Terminal/CLI vs GUI — mostly analysis, and the answer isn't what you'd guess

**Read this skeptically.** ADHD-specific CLI-vs-GUI commentary is genuinely thin, and three of four substantive sources I tried were 403/unparseable.

**What is documented:** recognition-vs-recall is solid HCI, and CLIs are the canonical bad case. NN/g: "The difference between recognition and recall is the number of cues that help memory retrieval; recall involves fewer cues than recognition," and they list explicitly among recall-forcing patterns that "command-line interfaces demand recalling syntax and argument order." — [nngroup.com](https://www.nngroup.com/articles/recognition-and-recall/). UI-Patterns is blunter: recognition is context-triggered and "we're quite good at it"; recall works without context and "at this, we're terribly bad" — and notes GUIs displaced command lines *specifically because* of this. — [ui-patterns.com](https://ui-patterns.com/patterns/Recognition-over-recall)

The one ADHD-developer recommendation I found points **toward GUI** — Mike Cavaliere's ADHD programmer tips reportedly advise "use GUI-based tools instead of the command line whenever possible." **403 on fetch; second-hand from a snippet.** — [medium.com/@mikecavaliere](https://medium.com/@mikecavaliere/10-productivity-tips-for-programmers-with-adhd-8b56e089cf15)

**[analysis] The real trade, and the synthesis.** CLI's genuine attention advantages are no peripheral motion, no notification surface, no competing affordances — and, more importantly than the clutter argument, **shell history is a durable, greppable, replayable record of what you just did.** `history | grep` is a working-memory prosthesis; reverse-i-search is recognition smuggled into a CLI. CLI's cost is that you must already know the name of the thing, with no cues, plus no spatial persistence. GUI is recognition-based and spatially persistent (supporting the same spatial-memory strategy minimap defenders describe), but every affordance competes for attention and badges/toasts/unread counts are attention hijacks.

The strongest position isn't "pick one" — it's that **command palettes already are the synthesis**: fuzzy recognition of the action list, keyboard-only execution, no persistent chrome. Linear's product is largely built on this. Same move as Stripe shipping terminal-readable docs *alongside* web docs: one source, multiple densities, reader picks.

**What Laminar Flow should do:**
- Command palette as the **primary** action surface, exhaustive, including review actions.
- **A visible, greppable action history** — "what did I do in this document/review in the last hour," answerable without remembering. This is the CLI's real cognitive prosthesis, and it directly serves "where was I."
- Ship a real CLI (`lf issue list`, `lf review next`) plus markdown document rendering — your self-hosted solo-dev audience will want it.
- **Don't lean on "CLI is better for ADHD" as a design premise.** The sourced HCI literature points the other way, and the one ADHD-developer recommendation I found (unverified) also points to GUI. Build the GUI well; offer the CLI as a mode.
- **Attack GUI's actual cost: notification and badge discipline.** Copy `zenMode.silentNotifications`; batch notifications; opt-in unread counts per surface; **never animate a badge.** Zed's "not a single AI edit prediction will appear without you requesting it" is the right posture for any proactive element.

---

## §4 — SELF-HOSTED / SOLO-DEV SETUP BURDEN

**Setup burden is an executive-function tax, and the ADHD literature says something sharper than that.** The CSCW 2026 paper below names a **"Tool-as-Avoidance Problem": elaborate planning and customization features can become procrastination mechanisms.** That is not a general usability concern — it's the specific failure mode that Obsidian, Notion, and OmniFocus users described to me in first person. **And Laminar Flow's headline differentiator is user-defined Aspect schemas plus configurable statuses plus saved views — i.e. three configuration surfaces.** This is your central design risk and you should design against it deliberately.

Linear's own Method already says it, against Linear's own settings blog post: [documented] **"Say no to busy work. Your tools should not make you the designer and maintainer of them"** and "Flexible software lets everyone invent their own workflows, which eventually creates chaos as teams scale." — [linear.app/method/introduction](https://linear.app/method/introduction). Meanwhile [Settings are not a design failure](https://linear.app/blog/settings-are-not-a-design-failure) argues the opposite, and its 378-comment HN thread splits along exactly the same line. The reconciliation Linear implies but doesn't state: **settings for matters of taste (theme, font size), opinions for matters of workflow.**

**Documented defaults:**

| Tool | Default statuses | Default views | Notifications | Setup |
|---|---|---|---|---|
| **Linear** | Backlog → Todo → In Progress → Done → Canceled (+ reserved Duplicate). Categories are fixed order; statuses reorder within category. First Backlog status is default for new issues. | Inbox, My Issues (4 tabs incl. Focus grouping), and per team: **All Issues, Active, Backlog**. Cycles/Triage appear only when enabled. | Inbox always on and **unfilterable**; email digests batched by urgency by default. | Hosted; workspace in minutes. Cycles, Triage, Estimates, Projects, Initiatives all **off by default** — progressive opt-in. This is the positive example. |
| **Plane** | Not documented on the pages I could reach | Board / spreadsheet / list / Gantt; "real-time dashboards that auto-populate without manual setup" | Not documented | Docker Compose / K8s / Helm; Prime CLI "single-command"; Django + Node + Postgres + Redis. AGPL-3.0. |
| **Huly** | Not documented | Team Planner, Inbox, chat, docs, virtual office | Not documented | Open source; page gives no deployment detail |
| **Vikunja** | Not documented | Not documented | Not documented | Docs **lead** with Docker, reverse proxy, LDAP, OpenID, hardening. Setup is the first thing you meet. Public no-signup demo is the mitigation. |
| **Jira** | Configurable via ~13 concepts and 4 scheme layers | Configurable | Notification schemes | The cautionary tale |

**Linear is the positive example, and the specific mechanism is progressive feature activation.** Cycles, Triage, Estimates, SLAs, Initiatives are all off until you turn them on. You get a working tracker with 5 statuses and 3 views on day one, and the concept count grows only when you ask for it. Plane's problem is the opposite: it ships Work Items *and* Cycles *and* Modules *and* Views *and* Pages *and* Initiatives *and* Epics, which is more concepts than Linear in a tool positioning itself as simpler.

**Recommended zero-config defaults for Laminar Flow:**

- **Statuses:** exactly five — Backlog, Todo, In Progress, Done, Canceled. Fixed category order (backlog / unstarted / started / completed / canceled) with reordering *within* category, exactly as Linear does. Reserve Duplicate as system-managed.
- **Views:** Inbox, **Now** (see below), My Issues, Active, Backlog. Five. No view-builder in the onboarding path.
- **Notifications:** in-app inbox on; **desktop/email off by default**; digests batched. Per-event-type filtering available from day one (Linear's gap). Quiet hours on **every** platform. No animated badges ever.
- **Features off by default:** sprints, estimates, saved views, custom Aspect schemas, review requests. Each with a one-line "turn this on when…" explanation — Linear treats its settings page as product education, which is the right instinct.
- **Ship 2–3 pre-built Aspect schemas** (e.g. a Diátaxis-shaped design-doc template) so nobody meets a blank schema editor. **The schema builder should be reachable but not on the happy path.** Blank-page paralysis is the documented core ADHD tension in this category, and a schema builder is a blank page with extra steps.
- **[analysis] Put a hard budget on configuration surface and treat exceeding it as a bug.** Given the tool-as-avoidance finding, "we added a setting" should require justification, not "we removed one."

---

## §5 — REAL USER VOICES

### Recurring praise
1. **Speed and keyboard shortcuts** (Linear) — cited as the reason it's "hard to give up."
2. **Frictionless capture, from anywhere** — the one thing Todoist fans consistently name.
3. **Aggressive filtering to only-what's-relevant** — the actual reason OmniFocus fans like it.
4. **Hard WIP limits.** colanderman: "Only ever one thing in the 'Doing' column." — the only way he manages likely-undiagnosed ADHD "and also avoid total burnout." — [HN 36277178](https://news.ycombinator.com/item?id=36277178)
5. **Constraining daily templates** — Obsidian's *only* consistent praise, always tied to a rigid template rather than the graph.
6. **Tools that decide for you** (Things 3).

### Recurring complaints
1. **The tool becomes the procrastination object.** deafpolygon on Obsidian: "absolute worst thing ever for my ADHD. Hours spent tinkering" — he was near shipping plugins before realizing nothing was getting done. — [HN 38277342](https://news.ycombinator.com/item?id=38277342)
2. **System maintenance becomes its own chore**, with a permanent overdue backlog (FreezerburnV).
3. **Ceremony at context-switch boundaries** (Jira ticket writing).
4. **The tool is invisible when most needed** (riehwvfbk's alarm).
5. **Loss of agency over what to work on.**
6. **Latency and losing work** to giving up on a load.

### Where recurring complaints CONTRADICT design orthodoxy

**1. Flexibility is the defect, not the feature.** Orthodoxy: give a flexible canvas. Reported: flexible tools become infinite-yield procrastination. The tool with fewest options (Things 3) is the one that stuck — *explicitly because* of that. [analysis] Configurability is not a neutral affordance for this population; it's a dopamine-yielding side quest competing with the work. **Budget it; don't market it.**

**2. They want MORE imposed structure, not less.** Reported: theshrike79 chose the app that decides for him; stared's win is a fixed daily template; colanderman's is a WIP limit of one. **Honest counter-evidence:** one commenter found Taiga "a little overly opinionated" for forcing story points. [analysis] The wanted constraint is on **volume and choice** (how many things you see, how many you can be doing) — *not* on **vocabulary** (mandatory estimates, required fields). **Prescribe the shape of attention; don't prescribe metadata.** This is a precise design rule and it's actionable.

**3. Keyboard shortcuts should stay permanently visible.** Orthodoxy: shortcuts are a progressive-disclosure reward. Reported: stared wants "visible-by-default hints, alike in Linear.app." **Explicit honesty flag: I found nobody saying they can't retain shortcuts.** The supported claim is weaker and still useful — hidden affordances have a real acquisition cost, and permanent visibility is preferred. The contradiction is with **hiding** them, not with having them.

**4. A tool you must remember to open cannot work.** Orthodoxy: the user opens the app; notifications are noise to minimize; respect focus. Reported: riehwvfbk's phone alarm reminding him Jira exists. [analysis] **This inverts the entire pull-based model of issue trackers.** A tracker that is calm and unobtrusive is, for this user, functionally nonexistent. Interruption isn't a UX failure here — it's load-bearing. Probably the most actionable contradiction in the set, and it sits in direct tension with everything else in this report about notification discipline. The resolution is that **one scheduled, predictable, non-badge re-entry prompt** is different in kind from a stream of event notifications.

**5. Complete capture + complete display = guilt engine.** Orthodoxy: never lose a task; show overdue counts; badge the backlog. Reported: FreezerburnV's permanent-overdue state; stared restarting daily notes to avoid "TODO debt"; daft_pink listing "long todo lists" among what didn't help. **But** Todoist fans say capture-everything is exactly what worked. [analysis] Not a conflict — the split is **capture vs display.** Frictionless total capture, then **aggressively lossy display**, with backlog decay that carries no penalty and no visible debt counter. **Overdue badges and rollover counters are actively harmful.** (This is why Linear's silent auto-archive is right and why a "carried over ×3" badge would ruin auto-rollover.)

**6. Tasks should be objects in space or time, not rows in a list.** Reported: jabroni_salad's "real objects instead of just a virtual infinity list"; another wanting to physically *see* work rather than have it "stashed away in a jira"; deafpolygon abandoning outliners for a freeform spatial canvas. [analysis] **A list has no felt scale** — twelve rows and eighty rows look nearly identical, and neither conveys "this will not fit in a day." Spatial and temporal containers make capacity legible, which is what time blindness actually needs.

**7. Removing task choice removes engagement.** Reported: two commenters attribute disengagement to not choosing their own tickets. **Direct tension:** jabroni_salad praises calendar scheduling *because* it eliminates "what next," and c_t_montgomery praises Linear's Projects for naming the one most important thing. [analysis] Reconcilable via a **small curated choice set** — narrow to 2–3 legitimate next actions rather than either an infinite list or a single mandate. **Least well-evidenced of my inferences; treat as hypothesis.**

### The academic grounding — the strongest single source in this report

**"Not Just Me and My To-Do List": Understanding Challenges of Task Management for Adults with ADHD and the Need for AI-Augmented Social Scaffolds** — CSCW 2026. 22 semi-structured interviews plus a speed-dating study with 20 more participants across 13 design concepts. — [arxiv.org/html/2603.17258v1](https://arxiv.org/html/2603.17258v1)

Findings that bear directly on your product:
- Task management for ADHD adults is **relational and emotionally scaffolded**, not an individual cognitive problem.
- Core challenges: **task initiation paralysis despite understanding importance**; time-perception disorders producing unrealistic plans; emotional dysregulation; reliance on crisis-driven deadline pressure.
- Named criticisms of existing tools: tools like Todoist and Trello assume "consistent self-regulation and linear time"; adults with ADHD report **significantly lower perceived effectiveness of standard tools despite similar usage**; platforms **prioritize completion over initiation**; **notification overload creates anxiety, especially when designs feel surveillance-like**; and the **"Tool-as-Avoidance Problem."**
- Design directions: relational accountability over solo optimization; **"time as flexible rhythm, not fixed grid"** — support dual "ideal" and "baseline" plans, and **preserve progress streaks across missed days**; mood-adaptive interfaces; non-judgmental progress indicators.

Corroborated first-person by a dev.to author on solo ADHD side-project building, whose two most useful observations are that AI assistance backfired ("The cognitive load of 'what did this change and is it right?' was overwhelming"), and that **rigid deadlines triggered demand avoidance rather than motivation** — "Solo ADHD building is hard mode," and what actually worked was a human collaborator providing weekly structure *without* hard deadlines. — [dev.to/datawranglerai](https://dev.to/datawranglerai/building-a-side-project-with-adhd-chatgpt-gaslighting-radhd-bans-and-why-i-needed-a-friend-28p6)

[analysis] **The demand-avoidance finding is a direct warning about sprints.** Cycles with hard end dates are exactly the mechanism this author says made work impossible. Linear's silent auto-rollover is what defuses it — which means **the rollover is not a convenience feature, it is the thing that makes cycles usable at all** for this population. Do not make it configurable-off by default.

### Accessibility standards — and the gap in them

W3C's WCAG 2 supplemental guidance has an objective **"Help Users Focus"** ([o5-user-focus](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o5-user-focus/)) with four patterns: Limit Interruptions, Make Short Critical Paths, Avoid Too Much Content, Provide Information So a User Can Prepare for a Task. And **"Ensure Processes Do Not Rely on Memory"** ([o6-memory](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o6-memory/)) — whose five patterns are **all about login and voice menus.**

Two honest observations. First, the density-relevant pattern ([o5p03](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o5p03-manageable-quantity/)) says "Provide users with five or less main choices on each screen" and warns busy pages "cause cognitive overload, anxiety and loss of focus" — but it cites cognitive/learning disabilities, mild cognitive impairment, dementia, TBI, and aphasia, **not ADHD**, and it targets general web content, not expert tools used daily. Don't over-cite it against Linear's density. Second, **W3C's memory objective contains no pattern for resuming an interrupted task and nothing on recognition-vs-recall for shortcuts.** The standards don't cover the two things that matter most here.

---

## GAPS IN THE CATEGORY — the differentiation opportunities

These are attention/executive-function needs that **no tool in this category serves well.** Ranked by leverage.

**1. Time is entirely absent from developer PM tools.** Linear has no time tracking, abstract-point estimates only, and no visual time. Jira's time tracking exists and is universally ignored. **Nobody closes the estimate→actual loop**, which is the only mechanism that could calibrate time blindness over months of use. Meanwhile *consumer* task apps ship Pomodoro timers, habit tracking, and Eisenhower matrices as table stakes (TickTick). **The gap: a developer tool with an honest, low-ceremony relationship to wall-clock time.** Concretely: an optional per-issue duration guess, passive elapsed-time capture from status transitions, and a private "your S-sized issues actually take 2.3× your guess" feedback surface. Private and non-judgmental — surveillance-framing is explicitly named as harmful in the CSCW work.

**2. Progress is always represented as percent-complete, never as uncertainty.** Linear: points, burn-up, target line. Jira: burndown. GitHub: nothing. **Only Basecamp has an uncertainty representation, and Basecamp is not a developer tool.** Hill charts in a Linear-shaped product is an unoccupied position, and it's cheap: one draggable dot per project/ticket, timestamped snapshots, a stalled dot rendered as a raised hand. Human-generated, not computed.

**3. Nothing addresses task initiation.** Every tool in this category assumes you have already decided to work; they compete on how efficiently you record and organize. The CSCW research names initiation paralysis as *the* primary failure mode and says platforms "prioritize completion over initiation" with "limited support" for the actual problem. **There is no product in this category with an initiation affordance.** Lowest-hanging version: a "start smallest" action that picks the smallest actionable sub-issue, plus a first-step field that the issue template makes you fill in at creation time — so future-you meets a concrete next action instead of a title.

**4. Within-review resumption is unsolved everywhere except Reviewable.** GitHub has a boolean. Graphite and Linear solved the inbox. Gerrit has revision-keyed state but a dated UI. **Nobody has region-anchored, revision-indexed read state for prose documents at all.** This is squarely in Laminar Flow's spec and it is genuinely unclaimed.

**5. Capacity is never legible before you overcommit.** Linear's capacity dial is the best in the category and it's team-level, retrospective, and points-based. Nothing shows a solo dev "this cycle contains 3 weeks of work and has 8 days left" *at planning time.* Shape Up's appetite (fix time, vary scope) is the right conceptual frame and no tracker implements it. [analysis] A cycle-planning view where adding a ticket visibly consumes a finite bar — with the bar in *days*, not points — would be new.

**6. Backlog decay is either absent or punitive.** Linear's silent auto-archive is the best implementation in the category. Everything else either keeps items forever (guilt engine) or requires manual deletion (a decision nobody makes). Nobody has **graceful, unpenalized decay with easy resurrection** as an explicit, visible product philosophy — and nobody has "no overdue counter, ever" as a stated design commitment. Making this explicit is cheap positioning with real substance behind it.

**7. Notification control is coarse everywhere.** Linear literally cannot filter its own inbox, and bundles notification types. Basecamp has the right *doctrine* but no dev workflow. **Per-event-type control with quiet hours on every platform** is a small, obvious, unclaimed win.

**8. No tool has a single-focus mode.** IDEs have Zen Mode; JetBrains has three graded modes; Mylyn had inferred task context. **No issue tracker or PM tool in this category has any focus mode at all.** "Show me one issue and nothing else" doesn't exist. And Mylyn's idea — *activating a task dims everything unrelated to it* — has been dormant for a decade with no successor.

**9. Nothing preserves streaks across missed days.** The CSCW paper's recommendation is explicit: "preserve progress streaks across missed days" and support dual ideal/baseline plans. Every tool in this category (and every habit tracker) does the opposite — a missed day breaks the streak, which produces the shame spiral the same paper identifies as the disengagement mechanism.

**10. No tool has a body-doubling or co-regulation affordance.** The CSCW paper's strongest finding is that ADHD task management is *relational* — body-doubling and borrowed structure are the coping strategies that actually work. Huly's virtual office is the accidental nearest thing and it's framed as a Zoom replacement. [analysis] This is real but I'd rank it last for you: it needs other people, and your target user is a solo dev. Basecamp's Automatic Check-ins ("What are you working on this week?" every Monday 9am) is the async, single-player-viable version and is nearly free to build — and it doubles as the answer to gap #4 in §5's contradictions (the tool that must remind you it exists).

---

## SCREENSHOT TARGETS

All verified publicly viewable without login unless noted.

| URL | What to capture / look at |
|---|---|
[linear.app/homepage](https://linear.app/homepage) | Hero product shot — baseline density, sidebar treatment, issue-row property layout |
| [linear.app/features](https://linear.app/features) | 8 feature sections, each with product imagery. Best single page for Linear's information density across views. Confirmed public. |
| [linear.app/diffs](https://linear.app/diffs) | Guided-review UI, Guide tab vs diff tab, the Reviews sidebar section, "sorted by proximity to shipping" |
| [linear.app/changelog/2026-03-12-ui-refresh](https://linear.app/changelog/2026-03-12-ui-refresh) | Before/after of the density refresh — dimmer sidebar, redrawn icons, "calmer, more consistent interface" |
| [linear.app/docs/my-issues](https://linear.app/docs/my-issues) | Screenshot of My Issues with **Focus grouping** — the closest thing to "what next" in the category |
| [linear.app/docs/use-cycles](https://linear.app/docs/use-cycles) | The **capacity dial** and cycle-list layout |
| [linear.app/docs/cycle-graph](https://linear.app/docs/cycle-graph) | The burn-up with the dotted target line — the percent-complete artifact to contrast against a hill chart |
| [linear.app/docs/triage](https://linear.app/docs/triage) | Triage queue with single-keystroke disposition affordances |
| [linear.app/docs/display-options](https://linear.app/docs/display-options) | The Display-properties panel — this is Linear's *de facto* density control; capture the full property list |
| [linear.app/docs/sla](https://linear.app/docs/sla) | The gray→yellow→orange→red **fire icon** — the only visual-time mechanic in Linear |
| [linear.app/method/introduction](https://linear.app/method/introduction) | Text page; capture the "Say no to busy work" and "Purpose-built" sections |
| **[basecamp.com/hill-charts](https://basecamp.com/hill-charts)** | **Highest priority non-Linear capture.** The hill with dots, the uphill/downhill labels, the snapshot history. |
| [basecamp.com/shapeup/3.4-chapter-13](https://basecamp.com/shapeup/3.4-chapter-13) | Hill-chart diagrams incl. the dot-motion-over-time sequence |
| **[docs.reviewable.io/files.html](https://docs.reviewable.io/files.html)** | **Highest priority for the review feature.** Per-file review chip states, **revision cells**, draggable diff bounds, and the **file matrix** (files × revisions). Note `reviewable.io/pricing.html` returns 403 — use the docs subdomain. |
| [reviewable.io/blog/mark-reviewed-and-advance-button](https://www.reviewable.io/blog/mark-reviewed-and-advance-button/) | The bottom-of-diff mark-and-advance button in situ |
| [gerrit-review.googlesource.com/Documentation/user-review-ui.html](https://gerrit-review.googlesource.com/Documentation/user-review-ui.html) | Patchset selector on both diff sides; reviewed checkboxes; **Attention Set** chevron |
| [secure.phabricator.com/book/phabricator/article/differential_inlines/](https://secure.phabricator.com/book/phabricator/article/differential_inlines/) | **Ghost comments** — the "pale, ghostly" ported-anchor rendering. Directly models your region-anchor problem. |
| [coderabbit.ai/blog/introducing-atlas-the-first-ai-native-code-review-interface](https://www.coderabbit.ai/blog/introducing-atlas-the-first-ai-native-code-review-interface) | Change Stack three-panel layout: cohort/layer nav, diff, context |
| [graphite.com/blog/github-pr-filters](https://graphite.com/blog/github-pr-filters) | PR Inbox with configurable sections |
| [culturedcode.com/things/guide/](https://culturedcode.com/things/guide/) | The fixed 5-bucket sidebar (Inbox/Today/Upcoming/Anytime/Someday) and Areas-vs-Projects distinction |
| [clickup.com/features](https://www.clickup.com/features) | Capture the whole page as the feature-maximalism exhibit — 10 categories, 80+ features, 15+ views |
| [plane.so](https://plane.so) | Product shots; the four-product structure (Work/Wiki/AI/Desk) |
| [code.visualstudio.com/docs/getstarted/userinterface](https://code.visualstudio.com/docs/getstarted/userinterface) | Zen Mode and Centered Layout illustrations; the settings list |
| [code.visualstudio.com/updates/v1_70](https://code.visualstudio.com/updates/v1_70) | **Sticky-scroll animation/GIF** — the mechanic to copy for the document editor |
| [jetbrains.com/help/idea/ide-viewing-modes.html](https://www.jetbrains.com/help/idea/ide-viewing-modes.html) | The three-tier mode ladder plus **Reader Mode** rendering |
| [diataxis.fr](https://diataxis.fr/) | The 2×2 quadrant diagram — use it directly when designing Aspect types |
| [docs.stripe.com/payments/quickstart](https://docs.stripe.com/payments/quickstart) | Sticky side-by-side code panel with language tabs; and the "read this in your terminal" affordance at the top |
| [doc.rust-lang.org/book/](https://doc.rust-lang.org/book/) | Persistent sidebar ToC, dual top/bottom prev-next links, theme picker |
| [w3.org/WAI/WCAG2/supplemental/objectives/o5-user-focus/](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o5-user-focus/) | Text only — the four Help-Users-Focus patterns, for the design rationale doc |

**Do not attempt:** `news.ycombinator.com` (429s under load — use `hn.algolia.com/api/v1/items/<id>` for text and only screenshot individual comments sparingly); `reviewable.io/pricing.html` (403); `dl.acm.org` (403); `height.app` (connection reset twice); anything on `reddit.com` (blocked at both fetch and search).

---

## The three things I'd act on first

1. **Key review state on `(reviewer, region, document_version)` in the schema, today.** It's the one decision that can't be retrofitted, it's the thing nobody in the category has done for prose, and it's already in your spec.
2. **Ship hill charts instead of (or alongside) a burn-up.** Cheapest genuinely differentiating feature in this report, with a fully documented design to copy and a clean argument for why percent-complete is the wrong primitive.
3. **Write down a configuration budget before building the Aspect schema editor.** The strongest, most consistent signal across academic research and first-person testimony is that configurability is the failure mode for this audience — and configurability is your headline differentiator. Ship pre-built schemas on the happy path and keep the builder one click off it.agentId: ae5174e8a5f018534 (use SendMessage with to: 'ae5174e8a5f018534', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 239877
tool_uses: 129
duration_ms: 1215724</usage>