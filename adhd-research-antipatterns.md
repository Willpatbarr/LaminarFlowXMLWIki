All three parallel research streams have returned. Here is the report.

---

# ADHD-First Anti-Patterns: What Not To Do
**Laminar Flow — self-hostable Linear clone + structured design-doc tool**
Research date: 2026-09-02 · Evidence grades: **[STRONG]** research/standards · **[MODERATE]** credible practitioner consensus or documented product behavior · **[WEAK]** widely repeated, thinly sourced · **[CONTESTED]**

> **Budget note:** WebSearch was exhausted (200/200) before I began. Everything below is WebFetch against canonical URLs, the NCBI E-utilities API, the OpenAlex/Semantic Scholar APIs, GitHub raw source, and the HN Algolia API. Reddit was not attempted. Where I could not verify something, I say so rather than guess — there are 14 explicit non-verifications at the end.

---

## THE TWELVE THINGS NOT TO DO

Ranked by harm. Each is checkable against a running build.

1. **Don't greet a returning user with a count of everything they failed to do.** No "47 overdue," no wall of red, no badge summing missed work.
2. **Don't require cleanup before the tool is usable again.** No blocking "you have 12 stale tickets, triage them to continue" gate on any path to work.
3. **Don't lose in-flight work.** No unsaved-draft loss on navigation, modal dismissal, validation error, or 401.
4. **Don't put anything the user must act on in an auto-dismissing toast.** Toasts are for confirmations that don't matter if missed.
5. **Don't ship streaks, consecutive-day counters, or "don't break the chain" mechanics.** Verdict in §1.2 — this is a no, not a "design it carefully."
6. **Don't make "request changes" a verdict on the whole document.** Severity belongs on the anchored comment, not the review.
7. **Don't let a skeleton shimmer forever.** Any container whose skeleton animates past ~5s while the rest of the page is interactive is a WCAG 2.2.2 problem, not a style choice (§4.2 — this one bites the project's decided pattern directly).
8. **Don't gate first value behind configuration.** No required status-schema, Aspect-schema, or sprint setup before the user can create and see an issue.
9. **Don't default notifications or email to "all activity."** Default to participating-and-mentions; make volume an opt-in.
10. **Don't hide primary actions behind hover.** Hover may reveal *shortcuts*, never the only path to an action.
11. **Don't ship a disabled button without a visible reason.** Either say why, or enable it and explain on click.
12. **Don't adopt a therapeutic register.** No mascot, no pastel, no "You've got this!" in a developer tool. Warmth is fine; condescension reads as an insult to a power user.

---

## 1. The shame and guilt machinery

### 1.1 The overdue pile

**Why it harms — the honest version.** The mechanism is not exotic and does not need pop-neuroscience. Returning to a large overdue pile does three things: it converts a tool into an accusation, it presents an unbounded triage task as the price of entry, and it makes the *next* return worse because the pile grew. What has real evidential support is the last-mile claim, not a special ADHD fragility:

- **[STRONG]** Choice-impulsivity/delay-discounting differences in ADHD are real but **medium, not categorical** — three independent meta-analyses converge at d ≈ 0.43–0.47: Jackson & MacKillop 2016 (N=3,913, d=0.43, p<10⁻¹⁵, [PMID 27722208](https://pubmed.ncbi.nlm.nih.gov/27722208/)); Patros et al. 2016 (N=4,320, g=.47, [PMID 26602954](https://pubmed.ncbi.nlm.nih.gov/26602954/)); Marx, … & Sonuga-Barke 2021 (N=3,763, small-to-medium, [PMID 29806533](https://pubmed.ncbi.nlm.nih.gov/29806533/)). Distributions overlap heavily. Design for the shifted average; don't claim a different species.
- **[STRONG]** W3C COGA pattern **4.6.3 Avoid Too Much Content** captures the actual failure directly: *"I need less content without extra options and features as I cannot function at all when there is too much cognitive overload"* — [w3.org/TR/coga-usable](https://www.w3.org/TR/coga-usable/).
- **[MODERATE]** User accounts converge on guilt-as-abandonment-trigger. FreezerburnV, 2021-07-19, on why nothing stuck: *"a perpetual list of some number of tasks would be in an 'overdue' state"* — and on what fixed it: *"it's so guilt-free to just move stuff to farther down the line"* ([HN 27886368](https://news.ycombinator.com/item?id=27886368)).

**What real products do — mechanically.** Four distinct architectures, all verified from primary sources:

| Product | Mechanism | Verified detail |
|---|---|---|
| **Sunsama** | Silent nightly auto-rollover + timed decay | *"All tasks automatically roll over to the next day's task list if they are left incomplete at midnight"*; *"You need not worry about incomplete tasks from previous days"*. Untouched for **4 consecutive days** (configurable) → **Archive**, surfaced as "N tasks moved to archive" + a pink badge, not a red count. [help.sunsama.com](https://help.sunsama.com/docs/getting-started/basics/task-rollover-and-recurring-tasks-the-basics), [archive doc](https://help.sunsama.com/docs/usage-guides/archive) **[STRONG]** |
| **Structured** | Forced *sequential* triage — the "Replan" card stack | One unfinished task at a time, four exits each with a swipe direction and a tap target: **Reschedule** (swipe up), **Inbox** (swipe left), **Check off** (swipe right), **Delete** (swipe down). Triggered by long-pressing a date or by a configurable morning/evening prompt. Skippable. [structured.app/blog/replan](https://structured.app/blog/replan) **[STRONG]** |
| **Linear** | Structural forgiveness, zero ritual | *"Open issues generally roll over automatically… **There is no way to keep unfinished issues in a closed cycle**."* Plus **cooldown** periods between cycles (*"Issues cannot be assigned to a cooldown"*) and a capacity dial computed from *"the velocity of the previous three completed cycles."* No triage screen exists. [linear.app/docs/use-cycles](https://linear.app/docs/use-cycles) **[STRONG]** — note `/docs/cycles` 404s |
| **Todoist** | Inert pile + one bulk escape hatch | Discrete **Overdue** section, red styling, single **Reschedule** button — which *"appears at the top-right of the task list only when tasks are grouped by Date."* [todoist.com/help](https://todoist.com/help/todoist/features/schedule-a-date-and-time-for-your-todoist-tasks-q7VobO) **[STRONG]** |
| **Apple Reminders** | Overdue inclusion is **opt-in** | Smart lists require you to *"select the Include Past Due checkbox."* Global pref: *"Show all-day reminders as overdue… shown as overdue starting on the next day"* — off by default. [support.apple.com](https://support.apple.com/guide/reminders/create-custom-smart-lists-remnfec66479/mac) **[STRONG]** |
| **Habitica** | Absence is billed as **one day**, not N | `multiDaysCountAsOneDay = true` in [cron.js](https://raw.githubusercontent.com/HabitRPG/habitica/develop/website/server/libs/cron.js); misses only counted on days the Daily was actually due (`shouldDo(...)`). Rest in the Inn copy: *"You have currently paused damage. Your Dailies won't damage you and you won't make progress towards Quests."* **[STRONG via source]** |
| **Amazing Marvin** | ⚠️ The counter-example | **Procrastination Count**: *"an exclamation mark added to a task for each day you delayed it,"* computed from first-scheduled date, *"orange at first and after 3 days turn red,"* and *"The only way to get rid of the ugly marks is to complete the task."* Shipped by a product branded *"#1 For ADHD productivity."* [help.amazingmarvin.com](https://help.amazingmarvin.com/en/articles/1950154-procrastination-count) **[STRONG]** |

**Only two products in the entire survey ship copy that reframes rather than reports.** Things 3: *"You're not procrastinating – you might simply be staring at the ultimate goal you want to reach, rather than the next actionable step you need to take"* ([culturedcode.com](https://culturedcode.com/things/support/articles/8491676/)). Structured, on the Energy Monitor's purpose: countering *"the lie that we 'did nothing'"* ([structured.app/blog/neurodivergent-month](https://structured.app/blog/neurodivergent-month)).

**The humane alternative, implementable for Laminar Flow.** Combine Linear's structure with Structured's bounded ritual and Habitica's absence cap:

1. **No `overdue` as a rendered state.** Store the due date; derive "needs attention" only inside an explicit review surface. Nothing on a board or list card ever renders red for lateness.
2. **Rollover is automatic, silent, and lossless.** Unfinished issues move to the active sprint at sprint close. Preserve `originalDueDate` and `firstScheduledAt` separately from the current date — Marvin does this (*"By turning this strategy off, all items will go back to their original schedule dates"*) and it is the right call for reversibility. Never overwrite.
3. **Decay, don't accuse.** Untouched for N sprints (default 2) → auto-move to a **Someday** bucket with a neutral, countless notice ("Moved 9 issues to Someday"). Configurable N, disableable. This is Sunsama's Archive.
4. **One bounded, skippable re-entry ritual.** On first load after ≥7 days away, offer — never force — a *Catch Up* stack: one issue per card, four keyboard exits (`Enter` keep in sprint · `S` Someday · `D` done · `⌫` cancel), a visible "3 of 12" position, and a persistent **Skip all** that is not styled as a dismissal-with-consequences. Cap the stack at ~10 items per session and say so: "10 of 34 — we'll show more next time."
5. **Cap the felt cost of absence.** Two weeks away must not produce 14× anything. One "while you were gone" summary, one number for changes-by-others, zero numbers for your own inaction.
6. **Sprints end without a verdict.** No completion percentage, no burndown shortfall as the headline. Report what shipped; roll the rest silently. Linear's cooldown is the model: a scheduled window where nothing can be assigned and therefore nothing can be late.

### 1.2 Streaks — verdict: **do not ship them**

**Duolingo's own numbers show the mechanic works for retention** and that the effective lever is lowering the bar, not forgiving the miss **[STRONG]**:

- Decoupling streak extension from the daily XP goal — *"extend their streak by completing just a single lesson each day"* — produced **+3.3% Day-14 retention**, **+1%** DAU, and **+10.5%** more daily learners on a streak within 20 days ([blog.duolingo.com/improving-the-streak](https://blog.duolingo.com/improving-the-streak/)).
- Streak Freeze: *"allows you to hit pause on your streak for a day"*; allowing two equipped at once raised active learners **+0.38%**. They also cite *"a study from University of Pennsylvania and UCLA"* that *"offering people a little 'slack'… can actually be more motivating than having a rigid set of rules"* ([blog.duolingo.com/how-duolingo-streak-builds-habit](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)).

**But the goal-displacement failure is consistently self-reported [MODERATE]:**

- tremarley, 2024-02-14: *"I spent almost half of the time on Duolingo at the aim of keeping my streak rather than truly learning"* ([HN 39374326](https://news.ycombinator.com/item?id=39374326)).
- lolinder, 2025-05-26, on a ~6-year streak: *"maintaining a streak just for the sake of maintaining a streak"* ([HN 44100258](https://news.ycombinator.com/item?id=44100258)).
- nozzlegear, 2024-02-14: *"I only log in to keep that streak going… even though it's not doing much for me"* ([HN 39374745](https://news.ycombinator.com/item?id=39374745)).
- ralferoo, 2024-07-07, after losing a long streak while travelling: *"Every day will be a reminder that I lost that streak unfairly"* — and quit ([HN 40903998](https://news.ycombinator.com/item?id=40903998)).

**Regulators now name this class of mechanic.** The European Parliament's 12 Dec 2023 resolution on addictive design explicitly lists *"streaks"* alongside infinite scroll and recapture notifications, describes *"intermittent variable reward, leading to a dopamine surge, just like the dynamics of slot machines,"* and calls for a *"right not to be disturbed"* with such features **off by default** ([CELEX:52023IP0459](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52023IP0459)) **[STRONG as to text; non-binding own-initiative resolution]**. Harry Brignull's current taxonomy lists **Addictive Design** as a first-class deceptive pattern: *"The user interacts with the product excessively, because its design exploits psychological vulnerabilities"* ([deceptive.design/types](https://www.deceptive.design/types)) **[STRONG]**.

**Verdict.** A gracefully-failing streak *is* designable — Habitica proves it with three independent mechanisms (opt-in pause with a stated price, one-day absence cap, due-day-only miss detection). But every version imports a per-day obligation into a tool whose users open it irregularly by design, and the measured upside is a *retention* metric, which is precisely the objective Laminar Flow should not be optimizing. **Do not ship streaks.** If you want the same feeling without the liability, ship **retrospective, non-consecutive, non-breakable** views: "shipped 6 issues over the last 3 weeks," "you closed something in 9 of the last 14 days." No chain, no reset, no freeze to buy back, nothing that can be lost by absence.

Also do not ship: Marvin-style escalating delay markers, per-item "days late" counters, sprint completion percentages as a headline, or any leaderboard.

### 1.3 Rejection Sensitive Dysphoria — flag it honestly, then design for the mechanism

**The status, verified rigorously via NCBI E-utilities [STRONG]:**

- `"rejection sensitive dysphoria"` returns **14 PubMed hits**, several of which are false positives matching on "dysphoria" alone (e.g. a 1984 paper on hysteroid dysphoria, PMID 6715288). **The count of peer-reviewed papers studying RSD as a named construct is approximately zero.**
- The one peer-reviewed critical appraisal — van Asselt, *Tijdschr Psychiatr* 2026;68(3):127-130, [PMID 41944472](https://pubmed.ncbi.nlm.nih.gov/41944472/) — states that Dodson *"introduced the concept based on clinical experience"*, names four risks including *"limited empirical evidence"*, and concludes: *"A better alternative is to use the established spectrum of rejection sensitivity."*
- Author search `Dodson WW[au]` returns **3 papers, none about RSD**. His widely-circulated [ADDitude article](https://www.additudemag.com/rejection-sensitive-dysphoria-and-adhd/) asserts *"almost 100% of people with ADHD experience rejection sensitivity"* and that it is *"neurologic and genetic"* — **both uncited [WEAK]**.
- **Distinct and real:** *rejection sensitivity* is a validated dimensional construct with an instrument (Downey & Feldman 1996, [PMID 8667172](https://pubmed.ncbi.nlm.nih.gov/8667172/), 623 downstream papers) **[STRONG]**.
- **Also real:** emotional dysregulation / emotional impulsivity in ADHD is common and impairing (Faraone et al. 2019, [DOI 10.1111/jcpp.12899](https://doi.org/10.1111/jcpp.12899)) — though *"there is no consensus about how to define these constructs"* **[STRONG for existence, [CONTESTED] for criterion status]**.

**Design implication:** serve the mechanism, not the label. The mechanism — *an author cannot tell from a comment whether it means "typo" or "you failed"* — has strong support and needs no diagnostic claim. Do not put the phrase "rejection sensitive dysphoria" anywhere in the product or its docs.

### 1.4 The review-request flow — the single clearest design answer in this research

Every credible source converges on one structural move: **decouple the *type* of a concern from the *consequence* of a concern, and attach both to the anchored comment rather than to the document.**

**Google's engineering practices state the thesis outright [STRONG]** ([comments.html](https://google.github.io/eng-practices/review/reviewer/comments.html)):

> "Consider labeling the severity of your comments, differentiating required changes from guidelines or suggestions. … **Nit:** … **Optional (or Consider):** … **FYI:** … This makes review intent explicit… **without comment labels, authors may interpret all comments as mandatory, even if some comments are merely intended to be informational or optional.**"

Plus the senior principle ([standard.html](https://google.github.io/eng-practices/review/reviewer/standard.html)): *"reviewers should favor approving a CL once it is in a state where it definitely improves the overall code health… even if the CL isn't perfect. **That is the senior principle among all of the code review guidelines.**"* And on phrasing: *"always making comments about the **code** and never making comments about the **developer**."*

**Gerrit separates reservation from veto, and permissions the veto [STRONG]** ([config-labels.html](https://gerrit-review.googlesource.com/Documentation/config-labels.html)):

> **−1 "I would prefer this is not submitted as is"** — *"the reviewer is willing to live with it as-is if another reviewer accepts it… **Does not block submit.**"*
> **−2 "This shall not be submitted"** — *"**Any −2 blocks submit.**"*

−1 is available to everyone; −2 is a granted capability (typical core-developer grant is range −2..+2). **The right to have reservations is universal; the right to veto is granted.** Modern Gerrit goes further — blocking label functions are *deprecated* in favor of moving mergeability into explicit submit requirements, making the label pure sentiment.

**Reviewable is the closest analogue to a document-anchored product [STRONG]** ([docs.reviewable.io/discussions.html](https://docs.reviewable.io/discussions.html)). Per-*discussion* dispositions: **Discussing** (neutral — *"don't affect the resolution either way"*), **Blocking** (*"Opposed to resolution while waiting on another contributor"*), **Working** (*"you're responsible for moving the discussion forward, not others"*), **Satisfied**, **Informing**. Resolution is computed: *"resolved when at least one participant is Satisfied or Informing, and no participants are Blocking or Working."* And the detail worth stealing wholesale — **keyword shorthand**, where typing the word you were going to type anyway sets the disposition: *"Typo, Minor, or Nit → Discussing"*, *"Major, Bug, or Hold on → Blocking"*, *"FYI or Tip → Informing"*, *"??? → Pondering"*. **Nit is structurally incapable of blocking** — a far stronger guarantee than a text prefix.

**Conventional Comments gives you the exact grammar [STRONG as a spec]** ([conventionalcomments.org](https://conventionalcomments.org/)) — and note it explicitly targets *"Revising and editing"* and RFCs, not just code. Format: `<label> [decorations]: <subject>`. Labels: `praise`, `nitpick` (*"These should be non-blocking by nature"*), `suggestion`, `issue`, `todo`, `question`, `thought` (*"non-blocking by nature"*), `chore`, `note` (*"always non-blocking"*). Decorations `(blocking)` / `(non-blocking)` / `(if-minor)` — and the standard says why both directions exist: *"This is helpful for organizations that consider comments blocking by default"* / *"non-blocking by default."*

**GitHub is the counterexample [STRONG]** ([docs.github.com](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)). Three states; **Request changes** = *"Flags feedback that the author should address before merging"*; when branch protection is on, *"the pull request cannot be merged until **the same collaborator** submits another review approving the changes."* Severity lives on the review, not the comment; the block is personal and only its author (or an admin) can lift it; and the soft option is defined by negation — *"without explicitly approving or requesting changes."* **The entire industry papered over this with text prefixes.** That workaround is the strongest signal in this research.

**Developer voices confirm from both sides [MODERATE]:**

- The design brief, asked as a question — zorr, 2022-06-24: *"these have very different tones and I would like to be more consistent"* ([HN 31858604](https://news.ycombinator.com/item?id=31858604)).
- A user-invented two-level severity system made of prefixes — gkiely: *"For non-critical stylistic or refactoring I prefix with 'Consider'. … **This gives the developer the option to disregard the comment.**"* ([HN 31902055](https://news.ycombinator.com/item?id=31902055)).
- The missing feature, requested unprompted — siliconc0w, 2024-02-19: *"it's really good to get into the habit of stating the criticality of a comment. Like a 1-5 score of nitpick to strong objection. **Code review tools never have this** but it's a huge time/frustration saver."* ([HN 39431721](https://news.ycombinator.com/item?id=39431721)).
- Tooling named as the root cause — joshka, 2024-08-21: *"tooling problems (**no way to defer submitting just the big things and hold back on the nits**)"* ([HN 41314352](https://news.ycombinator.com/item?id=41314352)).
- Reframing the whole act — BeetleB, 2024-08-21: *"The developer is asking for feedback, and not permission."* ([HN 41314047](https://news.ycombinator.com/item?id=41314047)).
- Volume, not wording, is the crushing part — MaulingMonkey: *"'Here's 3 things you fucked up, fix it' is negative. 'Here's 3 minor nitpicks. Otherwise, LGTM, thanks for tackling this!' is overall positive. **Both could be describing the same code review.**"* ([HN 19703958](https://news.ycombinator.com/item?id=19703958)).
- The distinction that matters — watwut: *"The most important point would be to distinguish between bad code and 'I would have done that slightly differently'. **The two are not nearly the same.**"* ([HN 15476988](https://news.ycombinator.com/item?id=15476988)).
- And the crucial counterweight — Chelsea Troy argues **civility is not sufficiency**: a review can be perfectly polite and still bad because the reviewer didn't participate in solving the problem ([chelseatroy.com](https://chelseatroy.com/2019/12/18/reviewing-pull-requests/)) **[MODERATE]**.

**Concrete spec for Laminar Flow's review requests:**

1. **No document-level "Request changes."** Review outcome is *computed* from thread dispositions, Reviewable-style. The reviewer never presses a button that means "rejected."
2. **Two orthogonal fields per anchored comment:** a **kind** (`question` · `suggestion` · `issue` · `nit` · `praise` · `note`) and a **consequence** (`blocking` · `non-blocking`). `nit`, `note`, `praise`, `thought` are **hard-wired non-blocking** — the UI must not offer blocking for them.
3. **Default consequence = non-blocking, stated in the UI.** Conventional Comments exists in both directions precisely because implicit defaults diverge. Put the word "non-blocking" visibly on the composer, not in docs.
4. **Keyword shorthand, keyboard-first.** Typing `Nit:` / `Bug:` / `FYI:` / `Question:` as the first token sets both fields; show the accepted keyword highlighted and let manual selection override. This is what makes the taxonomy free to use — a dropdown gets defaulted, a first word gets typed.
5. **Separate "who owes the next move."** Reviewable's Blocking-vs-Working distinction removes the accusatory read: `Waiting on author` vs `Reviewer is working on this`.
6. **Require a rationale or a concrete alternative on any blocking comment.** Conventional Comments: *"It is strongly recommended to pair this [issue] comment with a suggestion."* This is also Troy's participation requirement, enforced structurally.
7. **Permission the veto.** Anyone may mark blocking; only document owners / a designated role may set a *release-gating* block. Gerrit's asymmetry, ported.
8. **Summarize by severity before showing the list.** "2 blocking · 9 non-blocking" with blocking expanded first, non-blocking collapsed. This is the direct fix for the volume problem and for Google's *"navigate high-level first."*
9. **Let one comment cover N occurrences** of the same pattern, so a repeated triviality produces one thread, not forty.
10. **Do not mandate praise.** Conventional Comments warns: *"Do not leave false praise (which can actually be damaging)."* Offer the `praise` label; never prompt for it. Some reviewers and authors explicitly prefer bluntness — eof: *"your tone doesn't matter as long as it's not mean"* ([HN 31897535](https://news.ycombinator.com/item?id=31897535)).

### 1.5 Empty and zero-progress states

Make emptiness read as *headroom*, not *failure*. Rules:

- **Distinguish four cases and never use the same copy for two of them:** never-had-any (onboarding opportunity), user-cleared-it (celebrate quietly, offer the next thing), filtered-to-nothing (offer to widen the filter — this is a *query* result, not a user failure), and error (say so, offer retry).
- **Zero is a legitimate value.** "No issues in this sprint" is a fact. "You haven't added any issues yet" is a nudge. "Nothing here — get started!" is a scold in a party hat.
- **Never show 0% or 0/12 as a headline.** A progress bar at zero is a picture of failure. Show counts of what exists, not ratios against a target.
- **A cleared board is the goal state, not an absence.** Copy should confirm the good outcome and then get out of the way.
- **[MODERATE]** — this is practitioner consensus. I attempted to verify against Polaris (301s away), Carbon (404), Material (JS-rendered), and Atlassian (404) and **retrieved none of them**. Graded honestly.

---

## 2. Attention hijacking and dark patterns

### 2.1 The mechanism catalogue — and the strongest single citation

**Monge Roffarello, Lukoff & De Russis, CHI 2023, "Defining and Identifying Attention Capture Deceptive Designs in Digital Interfaces"** ([DOI 10.1145/3544548.3580729](https://doi.org/10.1145/3544548.3580729)) — abstract verbatim **[STRONG]**:

> "Many tech companies exploit psychological vulnerabilities to design digital interfaces that maximize the frequency and duration of user visits. … Prior work has developed typologies of damaging design patterns (or dark patterns) that contribute to financial and privacy harms… **However, we are missing a collection of similar problematic patterns that lead to attentional harms.** To close this gap, we conducted a systematic literature review for what we call 'attention capture damaging patterns' (ACDPs). We analyzed 43 papers… **We propose a definition of ACDPs and identify eleven common types, from Time Fog to Infinite Scroll.**"

Note the terminology drift: the title says "Deceptive Designs," the abstract says "**damaging** patterns." **I could not retrieve the full list of all eleven types** — the preprint PDF exceeded the fetch size limit twice and ACM DL returns 403. Only *Time Fog* and *Infinite Scroll* are confirmed by name.

The EP resolution's enumeration is the fullest verified list of mechanisms **[STRONG as to text]**: *"'infinite scroll', 'pull-to-refresh' page reload, 'never ending auto-play' video features, personalised recommendations, 'recapture notifications'… 'playing by appointment'… 'time fog'… 'fake social notifications'… 'like-button', 'read-receipt functions', 'is typing' displays"* ([CELEX:52023IP0459](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52023IP0459)).

### 2.2 Are ADHD users differentially vulnerable? **Not established — this is inference.**

This is the most important honesty item in the report, because the claim is everywhere in ADHD design writing.

- **[STRONG]** Delay discounting is elevated (§1.1, three meta-analyses, d ≈ 0.43–0.47).
- **[STRONG for the model, but superseded]** Sonuga-Barke's delay-aversion / dual-pathway account ([PMID 11864715](https://pubmed.ncbi.nlm.nih.gov/11864715/), [PMID 14624804](https://pubmed.ncbi.nlm.nih.gov/14624804/)) presents ADHD as *"a motivational style characterised by attempts to escape or avoid delay."* **Sonuga-Barke himself moved past it** to a three-pathway account adding temporal processing ([PMID 20410727](https://pubmed.ncbi.nlm.nih.gov/20410727/)). Citing dual-pathway as current is a mild misrepresentation.
- **[CONTESTED] — and probably backwards in popular writing.** The claim "ADHD brains are more reward-sensitive / dopamine-seeking" is **not** what the imaging meta-analysis supports. Plichta & Scheres 2014 ([PMCID PMC3989497](https://pmc.ncbi.nlm.nih.gov/articles/PMC3989497/)) found ventral-striatal **hypo**-responsiveness during reward anticipation in ADHD, while trait impulsivity in healthy populations shows *"the **opposite relationship**"* — and concede *"the number of existing studies… is too small for a final answer."* Luman et al. 2005 ([PMID 15642646](https://pubmed.ncbi.nlm.nih.gov/15642646/)): *"children with AD/HD seem less sensitive to reinforcement compared to controls"* and *"**Results show a discrepancy between the theoretical models and the behavioural findings.**"* The defensible framing is *reinforcement must be immediate and salient*, not *reward hypersensitivity*.
- **[WEAK / untested]** The bridge claim — ADHD → steeper discounting → differential susceptibility to variable-ratio schedules in software — **has not been directly tested.** Five targeted PubMed searches for any experiment manipulating an engagement mechanic and measuring differential effect by ADHD status returned **zero results**. What exists is cross-sectional correlation: internet addiction (Wang et al. 2017, [PMCID PMC5517818](https://pmc.ncbi.nlm.nih.gov/articles/PMC5517818/), *"13 cross-sectional, only 2 cohort"*, authors' own note: *"Longitudinal studies… are needed"*); problematic social media use (Ding et al. 2025, N=35,223, r=0.361, [PMID 40768894](https://pubmed.ncbi.nlm.nih.gov/40768894/)); gaming disorder (Koncz et al. 2023, g=0.693, [PMID 37883910](https://pubmed.ncbi.nlm.nih.gov/37883910/), authors note *"this is an emerging field"* and carry gambling-adjacent COI disclosures). Direction of causation is unresolved.
- **Circularity warning:** the EP resolution's Recital F (*"linked to attention deficits, shorter attention spans, impulsiveness and ADHD symptoms"*) is a policy document paraphrasing this same correlational literature. **Do not cite it as independent scientific support.**

**Practical consequence:** the argument for not building attention traps into Laminar Flow does not need the ADHD-vulnerability claim at all. Build it on the delay-discounting finding (solid, modest) plus the fact that engagement optimization is simply the wrong objective for a tool people should open *less*.

### 2.3 Which traps arrive **accidentally** in dev tools — the most useful section

None of these have engagement-farming intent. All of them ship by default.

| Accidental trap | How it sneaks in | Fix |
|---|---|---|
| **Red badge counts** | The obvious one. Unread mentions, assigned issues, review requests. | §2.4 |
| **The overdue pile as artificial urgency** | Nobody designed it. It's an emergent property of storing due dates and rendering them red. Functionally identical to a fake-urgency dark pattern, minus the intent. | §1.1 |
| **Sprint end dates as manufactured deadlines** | A cadence device becomes a countdown. "3 days left · 8 incomplete" is scarcity framing. | Report cadence, not shortfall. No countdown. |
| **Notification bundling by *time* rather than *relevance*** | Digest emails batch by schedule, so a 6-item digest reads as 6 obligations. | Bundle by thread; collapse self-caused events. |
| **Infinite scroll in issue lists and search results** | Free with a virtualized list. Removes the natural stopping cue and destroys position memory. | Paginate or show a hard count and a visible end. |
| **Activity feeds as a variable-ratio reward** | A "recent activity" panel that sometimes contains something interesting is a slot machine with no coin slot. | Make it a dated log, not a refreshing stream. Never autoplay-refresh. |
| **`document.title` badge counts** | One line of code; makes the browser tab a permanent low-grade alarm. | Off by default. |
| **"Last active" / presence indicators** | Ambient social pressure in a team tool. Not needed by a solo dev at all. | Off by default; per-user opt-in. |
| **Live-updating counters and boards** | Realtime sync feels premium; it also means the screen changes while you read it — and it moves targets under the cursor. | §3.7 |
| **Streaks-as-retention** | Arrives as a "fun" ticket. | Don't. §1.2 |
| **Toast pile-ups** | `sonner` defaults to 3 visible toasts; optimistic writes generate one per mutation. Chatty success confirmations become a flickering column. | §4.3 |
| **Nagging empty states** | "You haven't created a sprint yet!" on every visit is Brignull's *Nagging*: *"the user tries to do something, but they are persistently interrupted by requests to do something else."* | Show once, dismissible, remember the dismissal. |

### 2.4 The red dot: verdict and middle ground

**It is genuinely both.** As a prospective-memory aid it is real and valuable — the whole point of an external tracker for someone with ADHD is offloading "there is a thing waiting for you," and COGA Objective 6 is literally *"Ensure Processes Do Not Rely on Memory."* As an attention hijack, the ICO names exactly this class: *"reward loops, continuous scrolling, notifications and auto-play features"* (§2.5).

**Honest evidence note:** the specific claim that unread badges cause compulsive checking is **[WEAK]** empirically. An OpenAlex sweep for research on notification badges and compulsive checking surfaced essentially nothing directly on point. What exists is self-report **[MODERATE]**:
- tristor, 2023-03-08: *"require there to be no number badges on any apps on your phone to eliminate FOMO anxiety"* ([HN 35071562](https://news.ycombinator.com/item?id=35071562))
- MarcelOlsz, 2022-12-16: *"The badge is the worst"* ([HN 34021544](https://news.ycombinator.com/item?id=34021544))
- taylodl, 2022-07-26: *"If I notice any of those notification methods causing me any kind of anxiety… I disable it"* ([HN 32239918](https://news.ycombinator.com/item?id=32239918))

**Middle-ground design:**

1. **Badge only things addressed to a person, never things that merely exist.** Direct mentions, assigned review requests, explicit assignment. Never: total open issues, backlog size, sprint remaining, unread activity.
2. **Dot, not count, past a small threshold.** Exact numbers to 3, then "3+". A precise large number is a to-do list rendered as an accusation; a dot is a fact.
3. **Never red for volume.** Reserve red exclusively for *failure* (build broken, save failed). Use a neutral accent for "something is waiting."
4. **Badges must be clearable without doing the work.** Marking as read is not cheating — it is the user exercising judgment. Marvin's mistake is a counter that *"only… complete the task"* can clear.
5. **Monotonic decay, never growth-in-place.** A badge that climbs while you watch is an attention trap. Compute on load; don't animate upward.
6. **No `document.title` or favicon badge by default.**
7. **One global off switch that genuinely works** (§7.4).

### 2.5 Regulation: does any of it name attention exploitation?

Short answer: **the practitioner taxonomy does, the enforcement instruments mostly don't, and the EU has now formally admitted the gap.**

- **FTC, "Bringing Dark Patterns to Light" (Sept 2022)** — **No. [STRONG, verified by exhaustive full-text search of the PDF.]** In the complete extracted text: **"engagement" zero occurrences · "addict/addictive" zero · "infinite scroll" zero.** "Attention" appears 6 times and never as the object of protection — only as a manipulation *mechanism* (Misdirection: *"Using style and design to focus users' attention on one thing in order to distract their attention from another"*). The closest item is **Auto-Play** under COERCED ACTION, and its harm is framed as *unexpected content exposure and disguised advertising*, not session extension. The report's taxonomy: *Endorsements, Scarcity, Urgency, Obstruction, Sneaking, Interface Interference, Coerced Action, Asymmetric Choice*. All ties are to money/data/deception statutes. [ftc.gov/reports/bringing-dark-patterns-light](https://www.ftc.gov/reports/bringing-dark-patterns-light)
- **DSA Art. 25(1)** — choice-architecture only. Verbatim: *"Providers of online platforms shall not design, organise or operate their online interfaces in a way that deceives or manipulates the recipients of their service or in a way that otherwise materially distorts or impairs the ability of the recipients of their service to make free and informed decisions."* Recital 67's examples are all decision-point distortions (prominence, repeated re-asking, cancellation friction). **No reference to session length, scroll, autoplay, notifications, or engagement optimization.** Attention reaches the DSA only obliquely via **Art. 34(1)(d)** systemic-risk assessment (*"serious negative consequences to the person's physical and mental well-being"*) — a duty on ~20 firms, not a prohibition. Art. 38 requires VLOPs offer one non-profiling recommender *option*, not default. **[STRONG]** [CELEX:32022R2065](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022R2065)
- **EU Digital Fairness Fitness Check, SWD(2024) 230 final (3 Oct 2024)** — **this is the gap admission, and the best citation available.** It coins the category: *"interface designs and functionalities that induce digital addiction (**addictive design or, alternatively, attention-capture dark patterns**)."* On the harm: *"can lead to **time loss, attention-capture, 'rabbit hole' effects**, various mental harms."* On the legal hole: *"Without clarity about the kinds of transactional decisions that the UCPD applies to, its ability to effectively address all types of problematic practices, such as **attention-capture dark patterns**, will be significantly undermined."* Its own honesty note is worth borrowing: *"Although scientific research enabling to make a direct connection between specific features and these harms is still evolving, significant risks have been identified."* Survey datum: 31% reported spending more time or money than intended due to *"autoplay of videos, receiving rewards for continuous use or being penalised for inactivity."* **[STRONG]**
- **EU Digital Fairness Act** — **not law.** Call for evidence + consultation ran 17 Jul → 24 Oct 2025 (4,325 submissions); indicative timetable **Q3-2026**; Dec 2025 summary says *"planning to present its proposal… by the end of 2026."* Scope explicitly includes *"addictive design features that lead consumers, particularly minors, to spend excessive time and money."* Consultation result: 70% want binding rules; 78% of those want such features **off by default for minors**. **⚠️ I could not verify whether a proposal was actually tabled between Jan and Sept 2026 — every reachable primary source ends Dec 2025. Do not describe it as law or as a tabled proposal.**
- **UK ICO Children's Code — correction to the brief.** The attention-extension language is **not** in the Nudge techniques standard (standard 13 is *entirely privacy-scoped*: *"Do not use nudge techniques to lead or encourage children to provide unnecessary personal data or turn off privacy protections"*). It is in **standard 5, "Detrimental use of data,"** under the heading *"Strategies used to extend user engagement"* **[STRONG]**: *"sometimes referred to as 'sticky' features can include mechanisms such as **reward loops, continuous scrolling, notifications and auto-play features**."* And the legal theory: *"designing in data-driven features which make it difficult for children to disengage with your service is likely to breach the Article 5(1)(a) fairness principle of the GDPR."* Required action: *"**avoid features which use personal data to automatically extend use** instead of requiring children to make an active choice."* **Two caveats that must not be dropped:** the hook is *personal-data processing* (*"not all such features rely on the use of personal data"*), and it is **children only**. [ICO standard 5](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/5-detrimental-use-of-data/)
- **WCAG 2.2.4 Interruptions (AAA)** is the one accessibility standard that names attention directly **[STRONG]**: *"Interruptions can be postponed or suppressed by the user, except interruptions involving an emergency."* Benefits, verbatim: *"**Individuals with attention deficit disorders can focus on content without distraction.**"* ([w3.org](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html))

**Bottom line for Laminar Flow:** nothing here regulates a self-hosted dev tool. But WCAG 2.2.4 and the ICO's "sticky features" list are the two best off-the-shelf checklists of what not to build, and the Fitness Check is the citation to use if you ever need to justify the decision in writing.

---

## 3. Cognitive-overload anti-patterns

### 3.1 Configuration burden as an executive-function tax

Be specific about what actually overwhelms. In order of cost:

1. **Decisions before first value.** The killer metric: *how many choices must a user make before they see one of their own issues on a board?* Target ≤ 1. Jira's failure is here, not in its feature count.
2. **Required fields per creation form.** Every mandatory field is a forced decision at the moment of lowest patience — you are interrupting a thought to tax it. Target: title only. Everything else inferable, defaulted, or set later.
3. **Nested navigation depth to reach a setting.** dbingham, 2023-10-04, on Jira: *"changing the options on a single select custom field… consistently took me upwards of 30 mins of clicking fruitlessly through the UX every time I had to do it, because it was so unintuitively buried"* ([HN 37764098](https://news.ycombinator.com/item?id=37764098)) **[MODERATE]**. Target ≤ 2 levels; searchable settings.
4. **Modal stacking** (§3.6).
5. **Settings surface area** — the count of screens, not options. Options can be progressively disclosed; screens must be navigated.

COGA is the standards backing: **4.6.2 Make Short Critical Paths** (*"I need to get to the feature I need using the minimum number of easy steps"*) and **4.6.4** (tell users what a task involves *before* they start) **[STRONG]**.

For Laminar Flow specifically: **configurable statuses** and **user-defined Aspect schemas** are the two highest-risk surfaces in the product. Both are power features worth having (§7.3) and both must be *reachable* rather than *encountered*. Ship working defaults; let schema definition be something a user discovers on day 30, not a wall on day 0.

### 3.2 Blank-page paralysis

Notion's core problem: maximum flexibility at the moment of minimum context. Verified voice — leros, 2022-11-25: *"Tools like Notion are too heavy and would tempt me into taking proper notes"* ([HN 33747519](https://news.ycombinator.com/item?id=33747519)) **[MODERATE]**. And the systems-overwhelm version — mtlmtlmtlmtl, 2023-08-04: *"they don't really help me because **I don't even have the executive function to get started using them in a structured way**"* ([HN 36997977](https://news.ycombinator.com/item?id=36997977)) **[MODERATE]**.

**Templates fix it until they become the decision.** The tipping point is when template *selection* costs more than starting would have. Rules:
- **One default template, pre-applied, editable.** A new design doc opens with Aspect fields already present and a visible structure — not a blinking cursor and not a gallery.
- **A gallery of ≤5, entered by choice.** "Start from a template" is a link, not a gate.
- **Never a required first choice.** The moment you show a modal that must be answered before typing, you've rebuilt the blank page with extra steps.
- **Structure as the default, freedom as the escape.** This is the one place where Laminar Flow's Aspect schemas are an advantage over Notion: a design-doc tool with opinionated fields *has* a default shape. Use it.

### 3.3 Feature maximalism — mechanism of harm

ClickUp is the named offender. Verified voices **[MODERATE]**:
- pxtail, 2020-03-30: *"Complexity, bloat and cognitive load is growing"* when makers try to be *"versatile enough to be able to use it for every possible case"* ([HN 22728759](https://news.ycombinator.com/item?id=22728759))
- versteegen, 2026-02-18: *"Clickup's web app is too damn slow and bloated with features and UI"* — so slow their startup built Emacs modes to hit the API instead ([HN 47061839](https://news.ycombinator.com/item?id=47061839))

**Mechanism:** the harm is not the feature count, it is (a) **surface density** — every feature demands pixels on shared screens, so the cost is paid by users who don't use it; (b) **decision cost per action** — more ways to do a thing means choosing before doing; (c) **performance** — latency is an attention tax, and slowness is the single most-cited reason people preferred Linear (§7.3); and (d) **learnability decay** — a UI that changes shape as features land breaks the spatial memory that WCAG 3.2.3 exists to protect.

### 3.4 Too many ways to do the same thing — and the jam study problem

**Do not cite Iyengar & Lepper uncritically.** The meta-analytic verdict, verbatim from Scheibehenne, Greifeneder & Todd 2010 ([DOI 10.1086/651235](https://doi.org/10.1086/651235), open access at [archive-ouverte.unige.ch](https://archive-ouverte.unige.ch/unige:76440)) **[STRONG]**:

> "found **a mean effect size of virtually zero** but considerable variance between studies"

— across *"63 conditions from 50 published and unpublished experiments (N = 5,036)"*, concluding *"no sufficient conditions could be identified."* Chernev, Böckenholt & Goodman 2015 ([DOI 10.1016/j.jcps.2014.08.002](https://doi.org/10.1016/j.jcps.2014.08.002)) is the moderator-based rebuttal — **but I could not retrieve either abstract in full** (publisher-elided on Semantic Scholar; Wikipedia's *Overchoice* and *Choice overload* articles cite both and report **no** effect sizes). So: **[CONTESTED]**, and the honest statement is *"choice overload is not a robust general effect; it appears under specific conditions that are still disputed."*

**So is it real in tool UIs?** The consumer-choice literature doesn't transfer, and I found no research on redundant paths in software UIs **[WEAK]**. But the *concrete* costs are real and don't need the jam study:
- **Muscle memory can't form** if the same action has three entry points that behave slightly differently.
- **Docs and support fragment.**
- **Keyboard-first design breaks.** For a keyboard-driven product, the actual requirement is: **exactly one canonical keyboard path per action**, plus discoverable aliases. Redundancy in *input method* (keyboard + mouse + command palette) is good; redundancy in *semantics* (three different "move to sprint" flows with different side effects) is the harm.

### 3.5 Modal stacking and dead ends

NN/g's harms, verbatim **[MODERATE]** ([nngroup.com](https://www.nngroup.com/articles/modal-nonmodal-dialog/)): *"Modal dialogs force users away from the tasks they were working on in the first place"*; *"When a dialog appears on top of the current window, it can cover important content and remove context."* Plus context-switch memory loss and the added goal of dismissal. Their bar: *"no one likes to be interrupted, but if you must, make sure it's worth the cost."* NN/g does **not** address stacking — that gap is mine to fill **[WEAK, practitioner judgment]**.

Rules: **never more than one modal deep.** Base UI *supports* nesting (it renders `var(--nested-dialogs)` and suppresses child backdrops) — the fact that it's easy is the trap. Every modal needs a visible close, `Esc`, and a non-destructive exit. **No modal may be the only route to a destination**, and no modal may lose typed input on dismissal (§3.6). Prefer inline editing, side panels, and full pages for anything with a form in it.

### 3.6 Losing work — catastrophic specifically for interrupted users

This is #3 on the not-to-do list because interruption is the baseline condition, not the exception. Standards backing:

- **COGA 4.5.9 "Avoid Data Loss and 'Timeouts'"** — *"I need time to complete my work. I do not want a session to timeout while I try to find…"* **[STRONG]**
- **WCAG 2.2.6 Timeouts (AAA)**: *"Users are warned of the duration of any user inactivity that could cause data loss, unless the data is preserved for more than 20 hours."* And crucially the preference order: *"**The best way to conform to this success criterion is to keep the user data for at least 20 hours**"* — enabling users to *"start and finish a task, taking breaks as needed."* Warning is the *fallback*, not the goal. **[STRONG]** ([w3.org](https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html))
- **GOV.UK "Complete multiple tasks"** exists for *"longer transactions involving multiple tasks that users may need to complete over a number of sessions"*, mandates showing the task list *"at the start of each returning session"*, and says *"Where possible, allow users to complete tasks in any order. This will help them plan their time and complete sections as and when they can."* **[STRONG]** ([design-system.service.gov.uk](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/))
- **Home Office anxiety poster** (verified verbatim from [source](https://raw.githubusercontent.com/UKHomeOffice/accessibility-posters/master/anxiety.html)): *"Don't rush users or set impractical time limits"* · *"Don't leave users uncertain about the consequences of their actions"* · *"Don't make support or help hard to access"* · *"Don't leave users questioning what answers they gave."*

**Concrete requirements:**
1. **TipTap documents autosave.** Debounce `onUpdate` (~500ms–2s), flush on `onBlur`, flush on `visibilitychange` and `beforeunload`. Keep a local (IndexedDB) copy so a failed network save is recoverable. TipTap's docs cover the events but **give no autosave/debounce guidance** — this is on you ([events docs](https://next.tiptap.dev/docs/editor/api/events)).
2. **Forms never reset on validation error.** Ever. Return the user's values with the error.
3. **Never navigate away from a dirty draft without an explicit choice** — and make "keep editing" the default action.
4. **Session expiry must not yank.** Their spec is right. With cookie sessions + optimistic writes: on 401, *keep the user on the page*, keep the payload in memory, surface a non-blocking inline re-auth (or silent refresh), then **replay the mutation**. TanStack Query gives you the rollback half (`onMutate` snapshot → `onError` restore via `getQueryData`/`setQueryData`) but explicitly nothing on retry-after-reauth or mutation persistence ([docs](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)) — you'll need a mutation queue. **A silently-rolled-back optimistic write is data loss that the user may not even notice.** That's worse than an error.
5. **Preserve for 20 hours minimum** (WCAG 2.2.6's preferred route), and prefer long-lived rolling sessions over short expiry-with-warning.
6. **Undo, not confirm.** For anything reversible, act immediately and offer undo — but not *only* in a toast (§4.3).

### 3.7 Silent state changes and things that move under the cursor

- **WCAG 3.2.5 Change on Request (AAA)**: *"Changes of context are initiated only by user request or a mechanism is available to turn off such changes."* Intent covers *"automatic updates, unrequested window launches, form auto-submission, and automatic redirects"* and names cognitive limitations. **[STRONG]**
- **WCAG 2.2.2** second clause has **no five-second grace for auto-updating content** — *"there's no five second exception for auto-updating."* A live-syncing board is auto-updating information presented in parallel with other content, so it needs a pause/stop/hide or frequency control. **[STRONG]**
- **WCAG 4.1.3 Status Messages (AA)**: status messages must be programmatically determinable *"without receiving focus."* **[STRONG]**

**Rules:** realtime updates must never reorder or reflow the list the user is pointing at. Buffer incoming changes and surface them as a **passive, user-triggered** affordance ("3 new issues — click to show") pinned out of the pointer's path. Never move a row under an open menu. Never let a background refetch scroll-jump. Provide a "pause live updates" control. Announce meaningful changes via a polite live region.

### 3.8 Inconsistent placement

- **3.2.3 Consistent Navigation (AA)**: *"Navigational mechanisms that are repeated on multiple web pages… occur in the same relative order each time they are repeated, unless a change is initiated by the user."* Intent explicitly credits users *"relying on spatial memory."*
- **3.2.4 Consistent Identification (AA)**: *"Components that have the same functionality within a set of web pages are identified consistently."*
- **3.2.6 Consistent Help (Level A — new in 2.2)**: help mechanisms repeated across pages *"occur in the same order relative to other page content, unless a change is initiated by the user."* Covers human contact details, human contact mechanism, self-help option, fully automated contact mechanism. Benefits users who would otherwise *"exhaust cognitive resources searching for it."*

**Precision point that matters:** *none of these require the same pixel position* — 3.2.3 requires consistent **relative order**, 3.2.4 requires consistent **labelling**. So WCAG under-serves the actual ADHD need, which is spatial constancy. **Exceed the standard:** the same control (assign, status, sprint, more-menu) should occupy the same position in the same region on every screen it appears, and identical actions should share label, icon, and keyboard shortcut everywhere. Since 3.2.6 is **Level A**, put help/keyboard-shortcuts access in one fixed place and never move it.

---

## 4. Accessibility anti-patterns that harm attention

### 4.1 Auto-playing motion

Carousels, marquees, background video: don't. **WCAG 2.2.2** covers *"any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content"* — needs pause/stop/hide. **COGA 4.6.1 Limit Interruptions** names the user need directly: *"I need tasks to not have distractions. I need to turn distractions off easily"*, and its guidance covers *"auto-playing media"* and *"content that moves, flashes, or changes unexpectedly."* **[STRONG]** For a dev tool this should be a non-issue — except for one thing you've already decided to build.

### 4.2 Shimmering skeletons — the project's committed pattern, evaluated

**The normative text, verbatim** ([w3.org 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)):

> "For any moving, blinking or scrolling information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with other content, there is a mechanism for the user to pause, stop, or hide it unless the movement, blinking, or scrolling is part of an activity where it is essential."

**Note 4 — the loading exemption, verbatim:**

> "An animation that occurs as part of a preload phase or similar situation can be considered essential if interaction cannot occur during that phase for all users and if not indicating progress could confuse users or cause them to think that content was frozen or broken."

**Here is the finding that matters for Laminar Flow.** The exemption has **two conjunctive conditions**, and the decided pattern — *every container component takes a `loading` prop and renders its own skeleton* — breaks the first one.

Note 4 exempts a preload animation only *"if interaction **cannot** occur during that phase **for all users**."* Per-container skeletons exist precisely so that the rest of the page *is* interactive while one container loads. A shimmering sprint panel next to a fully usable issue list is therefore:
- **moving information that started automatically** ✓
- **presented in parallel with other content** ✓ (that's the entire point of the pattern)
- **not covered by Note 4**, because interaction *can* occur during the phase ✓

So the only remaining question is duration. Under 5 seconds: fine, no SC applies. Over 5 seconds: **you are out of conformance with 2.2.2 (Level A)** unless you provide a pause/stop/hide. A page-blocking full-screen skeleton where nothing is interactive is a genuinely different case and *is* plausibly exempt. **[STRONG on the normative reading; the application is my analysis, so call it [MODERATE] as a conformance opinion.]**

Independently, NN/g on the UX **[MODERATE]** ([nngroup.com/articles/skeleton-screens](https://www.nngroup.com/articles/skeleton-screens/)): animated skeletons *"can potentially be distracting, annoying, or even create accessibility problems for some users."* Their thresholds: **<1s** no indicator at all; **2–10s** skeleton or spinner (skeletons for full-screen, spinners for a single module — note this argues *against* skeletons in small containers); **>10s** *"progress bars are strongly recommended… because they give users a sense of the state of the system and of how much longer they have to wait."* And never frame-only skeletons: *"they should not be used as a progress indicator."*

**Perpetual spinners** are the worse sibling: infinite animation conveying no information, and the default failure mode of any un-timed-out fetch.

**The better loading pattern — implementable:**

| Elapsed | Behavior |
|---|---|
| 0–300ms | **Nothing.** No skeleton. Prevents flash-of-skeleton on fast local queries — critical for a self-hosted app on a LAN. |
| 300ms–~4s | **Static skeleton, no shimmer.** Correct shape, correct dimensions (so nothing reflows on arrival), one flat tone. |
| >~5s | **Stop animating** (if you animate at all) and swap to a **determinate or labelled** state: "Still loading sprint…" with a **Retry** and a **Cancel**. This is your 2.2.2 "stop" mechanism and it doubles as honest feedback. |
| Error | Explicit error state with retry. **Never leave a skeleton up as a de facto error state** — the single most common real-world violation. |

Plus: **respect `prefers-reduced-motion`.** MDN's own example replaces a `scale` pulse with an opacity `dissolve` ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)) — apply the same logic: under `reduce`, drop the translating gradient sweep to static or opacity-only. Note MDN's framing: `reduce` means *remove non-essential motion*, not *remove all feedback*, and it is a **system-level** preference, not an in-app toggle (§7.4). **[STRONG]**

**Recommendation: ship static skeletons by default and skip shimmer entirely.** It buys you conformance, costs nothing, and NN/g doesn't claim shimmer helps enough to justify it. If you want shimmer, gate it behind `prefers-reduced-motion: no-preference` **and** a ≤5s cap.

### 4.3 Toasts — `sonner` config and the rule

**Verified from source** ([src/index.tsx](https://raw.githubusercontent.com/emilkowalski/sonner/main/src/index.tsx)) and [docs](https://sonner.emilkowal.ski/toaster) **[STRONG]**:

- `TOAST_LIFETIME = 4000` — **4 seconds by default.**
- Container renders `aria-live="polite"`, `aria-relevant="additions text"`, `aria-atomic="false"`. **Individual toasts get no role and no `aria-live`, and there is *no* differentiation for errors** — an error toast is announced politely and can be missed entirely.
- `duration: Infinity` **is** honored: `if ((toast.promise && toastType === 'loading') || toast.duration === Infinity || toast.type === 'loading') return;` skips the timer.
- Timer pauses on interaction *and* when the tab is hidden: `if (expanded || interacting || isDocumentHidden) { pauseTimer(); } else { startTimer(); }`. **This is genuinely good for interrupted users** — tab away mid-action and the toast waits.
- `visibleToasts` default **3**; `closeButton` default **false**; `dismissible` default **true**; `position` default `bottom-right`; `hotkey` default **⌥/alt + T**.

**Adrian Roselli's assessment is the canonical critique [STRONG]** ([adrianroselli.com](https://adrianroselli.com/2020/01/defining-toast-messages.html)): auto-dismiss implicates **WCAG 2.2.1**; `role="alert"`/`aria-live="assertive"` interrupts mid-announcement and leaves users *"feeling stranded"*; live regions handle rich/interactive content badly — *"A screen reader will announce the raw text within, without any of the structure."* His opening rule: **"The first thing you have to do is accept toasts will be missed by users."** His preferred alternatives: a persistent messages holder (a notification centre) or static in-page messages.

**Correct configuration for Laminar Flow:**

```tsx
<Toaster
  closeButton                 // default false — always enable
  visibleToasts={3}
  position="bottom-right"
  gap={14}
  toastOptions={{ duration: 6000 }}   // 4000 is too short to read + act
/>
```
- **`closeButton` on, always.** A dismissible-by-swipe-only toast is not keyboard-operable.
- **`duration: Infinity` for every error and every toast containing an action** (including Undo). An undo affordance that expires in 4 seconds is a trap for exactly the user who looked away.
- **Document the ⌥+T hotkey** in your keyboard-shortcuts panel. It's the only accessible route to a toast's buttons and nobody knows it exists.
- **Errors need a second channel.** Sonner announces politely with no role differentiation, so an error toast alone is not sufficient notification. Render errors inline at the point of failure as well.

**The rule for what may and may not be a toast:**

| ✅ May be a toast | ❌ May never be a toast |
|---|---|
| Confirmation of a completed, visible action ("Issue moved to Sprint 4") | Anything the user must act on |
| Undo for a reversible action — **with `duration: Infinity`** | Any error, ever, as the *only* channel |
| Passive background success (autosave succeeded) | Validation errors (belong inline, at the field) |
| Non-critical async completion ("Export ready") | Anything about money, permissions, or data loss |
| | Anything the user would want to find again later |
| | Anything containing information not available elsewhere in the UI |

**One-line test:** *if the user missing this toast entirely would cause a problem, it must not be a toast.* Because they will miss it.

### 4.4 Hover-only affordances

**Precise scope finding [STRONG]:** **WCAG 1.4.13 does not cover this.** It governs *additional content* triggered by hover/focus (Dismissible / Hoverable / Persistent). A **control that only exists on hover** is not "additional content" — it's the control itself, and it falls outside the SC. This remains an **unaddressed gap in WCAG** ([w3.org](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)).

So it's on you: **hover may reveal shortcuts, never the only path.** Every row action available on hover must also be reachable from a persistent (or keyboard-focusable) menu. Row action bars that appear on hover are Linear-idiomatic and fine — provided `Tab` reaches them and a context menu duplicates them. Anything hover-only is invisible to touch, keyboard, and anyone who doesn't happen to sweep the pointer over it.

### 4.5 Timeouts

**WCAG 2.2.1 Timing Adjustable (Level A)** — all five exceptions verbatim: **Turn off** (before encountering it) · **Adjust** (over a range *"at least ten times the length of the default"*) · **Extend** (*"warned before time expires and given at least 20 seconds to extend… with a simple action"*, at least ten times) · **Real-time Exception** · **Essential Exception** · **20 Hour Exception** (*"The time limit is longer than 20 hours"*). Intent notes people *"with cognitive or language limitations need more time to read and to understand."* Notably it **does not** address session timeouts or data preservation — that's 2.2.6's job (§3.6). **[STRONG]**

**Cleanest conformance for this app: make sessions longer than 20 hours** (rolling refresh), which triggers the 20 Hour Exception outright and removes the whole problem class. Then handle the residual 401 as in §3.6.4: never redirect mid-action, never discard the payload, re-auth in place, replay the mutation.

### 4.6 Low contrast, placeholders-as-labels, ghost buttons

- **Placeholder-as-label is a memory tax.** NN/g **[STRONG]** ([nngroup.com](https://www.nngroup.com/articles/form-design-placeholders/)): *"Disappearing placeholder text strains users' short-term memory"*; users can't verify entries before submitting; error recovery requires *deleting content to see the instructions again*; tab-users don't pause to read it; *"Users may mistake a placeholder for data that was automatically filled in"* and skip the field. Their rule: *"The label and hint are placed outside the form field and are always visible to the user."* **This is the single worst form pattern for an interrupted user** — the instruction vanishes at the exact moment attention returns.
- **Low-contrast "elegant" UI** is a self-inflicted 1.4.3 failure. Note the Home Office autism poster asks for **4.5:1 minimum** while simultaneously saying *"don't use bright contrasting colours"* — see §7.2 for why that tension matters here.
- **Ghost buttons**: if it's the primary action, make it look like one. Ambiguous affordance = a decision where there shouldn't be one.

### 4.7 Disabled buttons without explanation

**[MODERATE]** ([axesslab.com](https://axesslab.com/disabled-buttons-suck/)): they fool users into clicking; contrast is typically poor (*"White text on light grey background, come on!"*); clicking yields no explanation; assistive tech skips them; and teams lean on them *instead of* writing real error messages. Their recommendation: *"Keep the button enabled. Let the user click the button. Then show the message why it can't proceed."*

For Laminar Flow: prefer **enabled + explain on activation**. If you must disable, put the reason adjacent and always-visible (not in a tooltip — see §4.4), and never rely on color alone to signal the state.

### 4.8 Notification volume as a default

**WCAG 2.2.4 (AAA)** is the standard: *"Interruptions can be postponed or suppressed by the user, except interruptions involving an emergency"*, benefiting *"individuals with attention deficit disorders."* **COGA 4.6.1**: *"I need to turn distractions off easily."* **[STRONG]**

GitHub is the model to copy **[STRONG]** ([docs.github.com](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications)): watch levels **All Activity** / **Participating and @mentions** / **Ignore** / **Custom** (pick specific event types), independent **On GitHub** vs **Email** channels, and per-type settings.

**Defaults for Laminar Flow:** in-app only; **participating and mentions**; email **off** until explicitly enabled; never notify a user of their own actions; one digest option, not a per-event firehose; a global **snooze/quiet hours**; and — since this is self-hosted and the operator configures SMTP — **shipping with email disabled is the correct default**, not a limitation.

---

## 5. The abandonment failure mode

**The core insight is correct and it is the most important thing in this report.** For ADHD users a productivity tool does not fail via a usability error. It fails via abandonment, and the abandonment happens *at the moment of return*.

### 5.1 Real accounts

All verbatim, attributed, linked **[MODERATE]** — self-report, but strikingly consistent:

- **The whole cycle in one sentence** — hombreinabikin, 2026-01-21: *"I've tried Todoist, Notion, Pomodoro, habit trackers, morning routines, 'don't break the chain,' Beeminder, public Twitter commitments. **All abandoned within weeks.**"* ([HN 46701895](https://news.ycombinator.com/item?id=46701895))
- **The mechanism, precisely stated** — mtlmtlmtlmtl, 2026-01-14: *"I have a bad day, fail to follow it, and the ADHD propensity to see myself as a failure takes over, **leading me to discard the system because I think I'm just not capable of following it.**"* And the design lesson he draws: *"Start with something dead simple, that you can do even on your shittiest days."* ([HN 46613820](https://news.ycombinator.com/item?id=46613820))
- **Overdue state as the culprit** — FreezerburnV, 2021-07-19: *"nothing has really stuck… a perpetual list of some number of tasks would be in an 'overdue' state"* → what worked: *"it's so guilt-free to just move stuff to farther down the line"* ([HN 27886368](https://news.ycombinator.com/item?id=27886368))
- **Guilt as the residue** — UniverseHacker, 2024-02-21: *"I had a huge amount of guilt and shame that comes from having tried every productivity, organization, and concentration technique to no avail."* ([HN 39459418](https://news.ycombinator.com/item?id=39459418))
- **Effort was not the missing ingredient** — brailsafe, 2023-09-26: *"I've spent thousands on productivity and organization courses, and put a lot of effort into them, only to find myself **unable to follow the system**."* ([HN 37654216](https://news.ycombinator.com/item?id=37654216))
- **Setup itself is the barrier** — hirvi74, 2026-01-16: *"I can absolutely seem myself downloading such an application, attempting to set it up, and **either stopping halfway through or never opening the app again**."* ([HN 46649618](https://news.ycombinator.com/item?id=46649618))
- **The design principle, from a user** — steve_adams_86, 2023-07-14: *"ADHD is all about the pit of success and elimination of problematic systems or temptations… **Make it hard to fail.**"* ([HN 36729512](https://news.ycombinator.com/item?id=36729512))

### 5.2 What makes returning feel bad — every mechanism

Enumerated, because each one is separately fixable:

1. **Quantified failure on arrival.** A count of overdue/stale/incomplete items. The number *is* the injury.
2. **Red as the dominant color of the first screen.**
3. **Cleanup as a toll gate.** Triage required before normal use.
4. **Absence-scaled punishment.** 14 days away → 14× the mess. (Habitica's `multiDaysCountAsOneDay` is the antidote.)
5. **Lost context.** Filters reset, scroll lost, drafts gone, "where was I" unanswerable.
6. **Broken continuity of state.** The board no longer reflects reality, and reconciling it is *your* job now.
7. **Data-integrity guilt.** Unfinished sprints hanging open, stale tickets, a half-written doc with an unresolved review request. The tool's own bookkeeping becomes an accusation.
8. **Stale-notification avalanche.** 200 unreads, mostly irrelevant, all requiring dismissal.
9. **Undifferentiated change.** No way to tell what happened while you were gone from what was always there.
10. **Broken habit signals.** Streak gone, progress bar reset, "last active 18 days ago."
11. **Re-authentication friction.** Logged out, 2FA, then dropped on a dashboard instead of where you were.
12. **Version shock.** Self-hosted upgrade moved the UI; spatial memory invalidated (§3.8, §6).
13. **Anticipatory dread.** The learned expectation of 1–12, which is what actually prevents the return. This is the one that ends the relationship, and it's produced by the *previous* return, not this one.

### 5.3 Is there literature on re-onboarding? **Essentially no — and that's a finding.**

I searched OpenAlex for returning/lapsed-user re-onboarding and reengagement research and got **nothing relevant** (top hits were a transfusion-administration paper and a book about ecological games). Onboarding literature is overwhelmingly about first use. **[STRONG confidence that the gap exists; the searches were clean.]**

The closest thing to a standard that treats returning users as a distinct design case is **GOV.UK's "Complete multiple tasks"** pattern, which requires showing the task list *"at the start of each returning session"* and permits any task order **[STRONG]**. That's it. Building a real re-entry experience is genuinely differentiating, not just table stakes.

Adjacent and worth reading, though I could not retrieve full text: Spiel et al., CHI 2022 (§7.1) and Monge Roffarello/Lukoff's follow-on *"The Digital Attention Heuristics: Supporting the User's Attention by Design"* (TOCHI 2025) — listed on [kailukoff.com](https://www.kailukoff.com/) but **not indexed in OpenAlex and not retrievable**.

---

## THE "DESIGNED TO BE RETURNED TO" SPEC

Concrete feature list. This is the deliverable.

**A. State preservation (do this first — it's cheap and it's most of the win)**
1. Persist per-user, per-view: active view, filters, sort, grouping, collapsed sections, scroll position, and column widths. Restore exactly on return, no matter how long.
2. Persist last-viewed issue and last-edited document; offer "Resume where you left off" as a single keyboard-reachable action.
3. Persist unsent drafts — comments, review replies, issue descriptions, doc edits — locally *and* server-side, indefinitely, and surface them in one place ("3 unfinished drafts") without a badge or an age.
4. Sessions longer than 20 hours, rolling. Re-auth in place; return to the exact prior location, never a dashboard.

**B. No punishment for gaps**
5. No `overdue` rendered state anywhere. No red for lateness. No "days late" counters, ever.
6. Unfinished work rolls over silently and losslessly; `originalDueDate`/`firstScheduledAt` preserved separately so rollover is reversible.
7. Absence cost is capped and constant: two weeks away produces the same re-entry surface as two days.
8. No streaks, no last-active, no activity heatmap, no completion percentage as a headline.
9. Sprints close without a verdict: what shipped, no shortfall math.

**C. "What changed while I was gone"**
10. A **Since you were last here** panel, shown once per return after ≥N days (default 3), dismissible and re-openable from a fixed location.
11. Contents, in this order: **(a)** things addressed to you (mentions, review requests, assignments) — the only section that may carry a count; **(b)** changes by others to things you own; **(c)** sprint/cycle boundaries crossed; **(d)** what the system did automatically on your behalf ("9 issues rolled to Sprint 12," "4 moved to Someday"). **Nothing in this panel counts the user's own inaction.**
12. Every automatic action is listed with a one-click **undo**.
13. Time-bounded and honest: "Since Aug 18." Never "you have 47 items."

**D. Gentle re-entry**
14. The default landing view after an absence is **narrow and achievable** — items addressed to you and in-progress work only. Not the full board. Not the backlog.
15. The optional **Catch Up** stack (§1.1.4): one item per card, four keyboard exits, visible position, capped at ~10, persistent Skip-all, no consequence for skipping.
16. Re-entry never blocks. Every catch-up surface is dismissible and the app is fully usable with it untouched.
17. Notification backlog is collapsed by thread, self-caused events removed, and **"mark all read" is one keystroke and carries no penalty.**

**E. No cleanup precondition**
18. No modal, banner, or gate that requires triage, sprint closure, or schema completion before working.
19. Stale items decay to **Someday** automatically rather than accumulating as debt (§1.1.3). Configurable and disableable, never mandatory.
20. Open sprints past their end date auto-close on next load, silently, with an undo in the Since-you-were-last-here panel. **An indefinitely-open overdue sprint is a data-integrity guilt generator.**

**F. No data-integrity guilt**
21. Never surface counts of stale tickets, unresolved review requests, empty Aspect fields, or incomplete docs as problems.
22. Unresolved review requests age without escalating: no color change, no reminder emails, no "waiting 14 days" badge.
23. Aspect schemas may be partially filled forever. A doc with 2 of 9 fields is a valid doc, not an error.
24. **No "health," "hygiene," or "score" metric of any kind.** These are shame machines with a dashboard.

**G. Re-entry after upgrade (self-hosted specific)**
25. Post-upgrade, show a compact "what moved" note only if UI positions actually changed. Never a feature tour.
26. Never reset user preferences, saved views, or keybindings on upgrade.

---

## MICROCOPY: BEFORE / AFTER

| ❌ Bad copy | Why it harms | ✅ Humane rewrite |
|---|---|---|
| "You have 47 overdue tasks" | Quantified failure as a greeting; the number is the injury | "Sprint 12 · 47 open" *(or omit entirely)* |
| "12 tasks overdue by 14 days" | Absence-scaled punishment; multiplies guilt by time away | "12 issues rolled over from Sprint 11" |
| "⚠️ 3 days left · 8 incomplete" | Artificial urgency + shortfall framing | "Sprint 12 ends Friday" |
| "You're behind schedule" | Judgment the tool is not entitled to make | "6 of 14 issues shipped so far" |
| "0% complete" | A picture of failure; zero as a headline | "Nothing shipped yet" *(or show counts, not ratios)* |
| "Sprint 11 failed to complete" | "Failed" about a container of the user's work | "Sprint 11 closed · 6 shipped · 8 rolled over" |
| "Procrastination count: !!!!" | Escalating, un-clearable shame marker (Marvin, real) | *Delete. No replacement.* |
| "🔥 14 day streak — don't break it!" | Loss framing; converts a tool into a daily obligation | *Delete.* Or retrospective: "Closed something on 9 of the last 14 days" |
| "You lost your streak" | Punishes absence with a bereavement notice | *Delete.* |
| "Welcome back! You've missed 9 days" | Attendance-taking; the exact abandonment trigger | "Welcome back. Here's what changed since Aug 18." |
| "You haven't been here in a while" | Passive-aggressive; implies obligation | "Since you were last here" |
| "Nothing here yet — get started!" | Cheerful scolding; puts the absence on the user | "No issues in this sprint." |
| "You haven't created any documents" | Frames a neutral state as a personal omission | "No documents yet. **New document** ⌘N" |
| "No results" | Dead end; offers nothing | "No issues match these filters. **Clear filters**" |
| "Your backlog is empty" | Ambiguous between good and bad | "Backlog is clear." |
| "All caught up! 🎉" | Over-celebrates a routine state; reads as condescending in a dev tool | "Nothing waiting on you." |
| "Changes requested" | Verdict on the whole document | "2 blocking · 9 suggestions" |
| "Your document was rejected" | "Rejected" about a person's work | "Nick left 2 blocking comments on §3" |
| "Fix the following errors before resubmitting" | "Fix"/"errors"/"resubmit" = failed inspection | "2 comments need a reply before this can be approved" |
| "Reviewer is waiting on you (14 days)" | Adds an aging social debt to the pressure | "Waiting on you" *(no elapsed time)* |
| "This review is overdue" | Applies lateness to interpersonal feedback | "Nick asked for a review on Aug 18" |
| "Required" *(unexplained asterisk)* | A decision demanded with no reason given | "Needed to move this to In Progress" |
| "Invalid input" | Names the input bad, tells you nothing | "Sprint dates can't overlap — Sprint 11 ends Aug 29" |
| "Something went wrong" | No cause, no action, no reassurance about the work | "Couldn't save — your changes are stored locally. **Retry**" |
| "Session expired. Please log in again." *(+ redirect)* | Discards context and often the work | "Signed out. **Sign in** to save your changes — nothing is lost." |
| "Unsaved changes will be lost. Continue?" | Makes destruction the affirmative answer | "Keep editing" *(default)* / "Discard draft" |
| "Are you sure?" | Decision with no information | "Delete 'Auth redesign'? This can't be undone." |
| *Disabled button, no explanation* | Invisible blocker; user must guess | "**Start sprint** — needs at least one issue" |
| "Please complete your workspace setup to continue" | Cleanup as a toll gate | *Delete the gate.* Working defaults; setup discoverable in Settings. |
| "Tidy up your backlog to improve workspace health" | Manufactured debt with a scoreboard | *Delete. No health metric.* |
| "You have 200 unread notifications" | Punishes absence with a chore | "Mentions and review requests (3) · [Mark all read]" |
| "Loading..." *(forever)* | Perpetual animation carrying no information | "Still loading sprint… **Retry** · **Cancel**" |
| "Great job! You're crushing it! 💪" | Infantilizing in a developer tool; unearned praise reads as noise | "Sprint 12 closed. 14 shipped." |
| "Oopsie! Something broke 🙈" | Cute about a failure that may have cost work | "Save failed. Your draft is safe locally. **Retry**" |
| "Don't worry, we all forget things sometimes!" | Therapeutic register; presumes the user feels bad | *Delete.* Say nothing. |

**Two rules that generate the right-hand column:** (1) State facts about the work, never judgments about the person — the "code not the developer" rule from Google, generalized. (2) Never count the user's inaction; count only what exists and what is addressed to them.

---

## 6. The self-hosting angle

Setup and maintenance are executive-function taxes levied *before* any value is delivered — and hirvi74's *"stopping halfway through or never opening the app again"* ([HN 46649618](https://news.ycombinator.com/item?id=46649618)) is that tax defeating a product at install time.

**Verified voices [MODERATE]** — the burden is real but contested in magnitude:
- DaiPlusPlus, 2021-11-25: *"the substantial maintenance burden that comes with self-hosting"* ([HN 29344766](https://news.ycombinator.com/item?id=29344766))
- est, 2022-11-30: *"Ever tried to host and then years later upgrade an indie wordpress site? It's painful for semi-technical people."* ([HN 33796250](https://news.ycombinator.com/item?id=33796250))
- Counterpoint — marginalia_nu, 2022-11-29: *"I spend probably like 60 minutes a month on maintenance, and I operate a dang search engine on my server"* ([HN 33789274](https://news.ycombinator.com/item?id=33789274)); nirvdrum, 2025-09-18: *"The complexity and maintenance burden of self-hosting is way overblown"* ([HN 45293944](https://news.ycombinator.com/item?id=45293944)) **[CONTESTED]**

**Where self-hosted software goes wrong:** a required config file before first boot; a `docker-compose.yml` with 5+ services (app, db, cache, queue, worker, reverse proxy) where any one can fail independently; mandatory secret generation with no default; a required reverse proxy and TLS before the first page loads; manual migration steps in release notes; breaking changes in minor versions; backup that requires knowing which volumes matter; and **upgrades that fail halfway and leave a broken install with no rollback** — the last of which converts a 10-minute chore into an unbounded debugging session, which is exactly the shape of task that doesn't get done.

**"ADHD-friendly self-hosting" means:**
1. **One container. One command. Zero config.** `docker run -p 8080:8080 -v laminar:/data laminarflow` must produce a working app with a usable default account. Their single-container target is the right call.
2. **SQLite by default**, Postgres opt-in. One file is one backup and one thing to break.
3. **No config file required.** Everything via env vars with working defaults. Generate secrets on first boot and persist them.
4. **One-command backup and restore** — `laminar backup > file` / `laminar restore < file` — and print the exact command in the UI's admin screen so it doesn't have to be looked up.
5. **Migrations run automatically, transactionally, with automatic pre-upgrade snapshot and one-command rollback.** Never a manual step in release notes.
6. **Upgrades never break config or lose preferences.** Deprecate for two minor versions; warn in-app before removal.
7. **Honest health, no nagging.** One admin page that says "healthy," with an explicit "update available" that is never a badge and never modal.
8. **Works on plain HTTP on a LAN.** Do not require a domain, TLS, or a reverse proxy to get started.
9. **Optional everything.** No SMTP required (§4.8), no OAuth provider required, no external services.

**Positive examples [MODERATE]:** the single-binary/single-container tier — Miniflux, Gitea/Forgejo, Vaultwarden, Syncthing, Plausible (heavier but well-packaged), Grist, and Caddy for zero-config TLS when a domain *is* available. The common property is that the happy path is one artifact and one command, and the database is a file.

---

## 7. Where "ADHD-friendly" gets done wrong

### 7.1 Infantilizing design

**Get the register right: this is a developer tool.** Rounded pastels, mascots, mandatory encouragement, and celebratory confetti read as condescension to a user who is a professional and probably a power user. The strongest citation here is **Spiel et al., CHI 2022, "ADHD and Technology Research – Investigated by Neurodivergent Readers"** ([DOI 10.1145/3491102.3517592](https://doi.org/10.1145/3491102.3517592), 137 citations) **[STRONG]**, whose critique is that ADHD technology is built to *"mitigate"* experiences *"deemed disruptive against neurotypical standards, rather than supporting neurodivergent autonomy"*, that *"little HCI research invites this population to co-construct technologies"*, and that the field resists questioning its deficit frame. Their recommendation: move *beyond behavior control toward genuine user agency*. **(Full text was 403/oversized; this is abstract-level. [MODERATE] on the detail, [STRONG] on the thesis.)**

**The line:** warmth is *removing* accusation. Condescension is *adding* reassurance. "Nothing waiting on you" is warm. "Great job, you're crushing it! 💪" is condescending. Warmth belongs in what you *don't* say — no red, no counts of failure, no lateness, no scores. It does not belong in adjectives.

Praise is the sharpest test, and the evidence cuts against enthusiasm: Conventional Comments — a spec that *wants* praise — still warns *"Do not leave false praise (which can actually be damaging)."* **Never generate encouragement; only make room for it.**

### 7.2 Conflating ADHD with autism — the Home Office poster problem, verified

**Confirmed: the UK Home Office poster set contains no ADHD poster.** The seven posters are **Anxiety, Autistic spectrum, Deaf or hard of hearing, Dyslexia, Low vision, Physical/motor disabilities, Screenreaders** ([UKHomeOffice/posters](https://github.com/UKHomeOffice/posters), [HTML versions](https://ukhomeoffice.github.io/accessibility-posters/)) **[STRONG]**. Yet the set is routinely cited as ADHD guidance.

The **autism** poster verbatim ([source](https://raw.githubusercontent.com/UKHomeOffice/accessibility-posters/master/autism.html)) **[STRONG]**: *use simple colours* / **don't** *"use bright contrasting colours"*; *write in plain English* / **don't** *"use figures of speech and idioms"*; *use simple sentences and bullets* / **don't** *"create a wall of text"*; *make buttons descriptive* / **don't** *"make buttons vague and unpredictable"*; *build simple and consistent layouts* / **don't** *"build complex and cluttered layouts"*.

**The brief's suspicion is correct, and partially so.** *Don't use bright contrasting colours* is plausibly **backwards for ADHD**, where the need is usually strong, unambiguous salience so the important thing is findable without a search — and it also sits in tension with the same poster's own 4.5:1 contrast requirement. **[MODERATE]** — this is reasoned inference; I found **no** research directly comparing color-salience preferences between ADHD and autistic users, and I'm not going to invent one. The other four autism bullets (plain English, no wall of text, descriptive buttons, consistent layouts) transfer to ADHD fine.

**The genuinely useful finding: the *anxiety* poster is the better ADHD fit, and it's the one nobody cites.** Verbatim ([source](https://raw.githubusercontent.com/UKHomeOffice/accessibility-posters/master/anxiety.html)) **[STRONG]**: *"Don't rush users or set impractical time limits"* · *"Don't leave users confused about next steps or timeframes"* · *"Don't leave users uncertain about the consequences of their actions"* · *"Don't make support or help hard to access"* · *"Don't leave users questioning what answers they gave."* Every one of those maps onto §3.6, §4.5, and the re-entry spec.

**Use COGA instead of either poster.** [Making Content Usable](https://www.w3.org/TR/coga-usable/) is the actual standards-track source, and its Objective 5 *"Help Users Focus"* — patterns 4.6.1 Limit Interruptions, 4.6.2 Make Short Critical Paths, 4.6.3 Avoid Too Much Content, 4.6.4 Prepare for a Task — plus Objective 6 *"Ensure Processes Do Not Rely on Memory"* is closer to an ADHD checklist than anything in the poster set. **[STRONG]**

### 7.3 Over-simplification — ADHD users are frequently power users

Removing power features to reduce overwhelm produces a tool nobody can work in, which is its own abandonment path. The evidence that speed and depth are *wanted* **[MODERATE]**:

- JaakkoP, 2022-04-10: *"All I was looking for after the slugfest of Jira was fast performance and keyboard shortcuts"* ([HN 30974181](https://news.ycombinator.com/item?id=30974181))
- codetheweb, 2020-12-27: *"Linear supports keyboard shortcuts for literally everything, is blazing fast"* ([HN 25554626](https://news.ycombinator.com/item?id=25554626))
- The resolution of the tension — OrlandoHakim, 2022-04-11: *"For engineers it is fast and fluid and simple with outstanding keyboard shortcuts. **For managers it is strongly opinionated with an agile methodology that requires no setup and just works.**"* ([HN 30995246](https://news.ycombinator.com/item?id=30995246))

**The resolution is layering, not removal.** Ship opinionated defaults so nothing must be configured; keep every power feature, reachable by keyboard and command palette rather than by permanent chrome. Progressive disclosure is COGA 4.6.3's actual recommendation (*"Hide secondary features until requested"*), not amputation. And keep the tool **fast** — latency is an attention tax, and it's the most-cited reason people love Linear and abandon ClickUp.

Concretely for Laminar Flow: configurable statuses, Aspect schemas, and saved views are exactly right to keep. Just don't put any of them on the path to first value (§3.1).

### 7.4 Accessibility theater

A "reduce motion" toggle that doesn't reduce motion is worse than none — it converts a real need into a betrayal.

- **Honor the system preference, don't invent an app toggle.** `prefers-reduced-motion` is *"a device-wide accessibility setting, not something users toggle within individual applications"* ([MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)) **[STRONG]**. An in-app override is fine as an *addition*; it must not be the only mechanism.
- **Reduce means non-essential motion, not all feedback.** MDN's own pattern swaps a `scale` pulse for an opacity `dissolve`. Apply to skeletons (§4.2), toast entry animations, board drag transitions, and any parallax or auto-scroll.
- **Test it.** Set the OS preference, walk every screen, confirm shimmer, toast slide-ins, spinners, and drag animations actually change. Put it in the audit checklist below.
- Same rule for every other accessibility affordance: a keyboard-shortcuts dialog that omits half the bindings, a high-contrast theme that only changes the background, an aria-label that describes the wrong thing. **Half-implemented accessibility is a distinct harm, not partial credit.**

### 7.5 ADHD users are not homogeneous

**[STRONG]** — CDC names three presentations: **Predominantly Inattentive** (*"hard for the individual to organize or finish a task"*), **Predominantly Hyperactive-Impulsive**, and **Combined**, and notes *"symptoms can change over time, the presentation may change over time as well"*, plus frequent overlap with *"sleep disorders, anxiety, depression, and certain types of learning disabilities"* ([cdc.gov](https://www.cdc.gov/adhd/signs-symptoms/index.html)).

Design consequences:
- **Don't build one "ADHD mode."** A single toggle assumes a single user.
- **Day-to-day fluctuation is the norm, not the tail case.** mtlmtlmtlmtl's rule is the design brief: *"Start with something dead simple, that you can do even on your shittiest days."* The floor matters more than the ceiling — the tool must work on a bad day with zero setup, and reward a good day with depth.
- **Medicated/unmedicated, inattentive/hyperactive, and comorbid anxiety pull in different directions** (e.g. more salience vs. less stimulation). Prefer *user-controllable density, motion, and notification volume* over a curated mode — which is also COGA Objective 8, *"Support Adaptation and Personalization."*
- **Don't ask users to self-identify.** No "do you have ADHD?" onboarding question. Ship the humane behavior as the default for everyone; it's better for everyone.

---

## ANTI-PATTERN AUDIT CHECKLIST

Run against every screen. Any **No** in §A–C is a bug, not a preference.

**A. Shame and guilt**
1. Does this screen display a count of things the user did not do? → must be **No**
2. Is anything red because it is *late* (rather than *broken*)? → **No**
3. Does any element show elapsed lateness ("14 days overdue", "!!!")? → **No**
4. Is there a percentage, ratio, score, or "health" metric of the user's output? → **No**
5. Is there a streak, chain, or consecutive-day counter? → **No**
6. Does any copy judge the person rather than state a fact about the work? → **No**
7. Would this screen look worse after a two-week absence than after a two-day one? → **No**
8. Does any empty state imply the user failed to do something? → **No**

**B. Work preservation**
9. Can a user lose typed input by navigating, dismissing a modal, or hitting a validation error? → **No**
10. Does a 401 mid-action discard the payload or redirect away from the page? → **No**
11. Is every optimistic write either confirmed or *visibly* rolled back with the data recoverable? → **Yes**
12. Do document edits survive a hard browser kill? → **Yes**
13. Are view state, filters, and scroll position restored on return? → **Yes**

**C. Re-entry**
14. Is the app fully usable after an absence without triaging anything first? → **Yes**
15. Is there any modal, banner, or gate that blocks work pending cleanup? → **No**
16. Is "what changed while I was gone" answerable in one place, in under 10 seconds? → **Yes**
17. Is every automatic system action (rollover, auto-close, decay) undoable and disclosed? → **Yes**
18. Is "mark all read" one keystroke with no consequence? → **Yes**

**D. Attention**
19. Does anything animate for more than 5 seconds while the rest of the page is interactive? → **No** *(WCAG 2.2.2 — includes skeletons)*
20. Does any skeleton or spinner persist with no timeout, retry, or error state? → **No**
21. Does any badge count things that merely *exist* rather than things addressed to the user? → **No**
22. Is any badge red for volume rather than failure? → **No**
23. Does any list scroll infinitely with no end and no count? → **No**
24. Does live sync reorder or reflow content the user is pointing at or reading? → **No**
25. Can the user pause live updates? → **Yes** *(WCAG 2.2.2, auto-updating clause — no 5s grace)*
26. Can every interruption be postponed or suppressed? → **Yes** *(WCAG 2.2.4)*
27. Is `document.title`/favicon badging off by default? → **Yes**

**E. Toasts and feedback**
28. Is any error delivered *only* as a toast? → **No**
29. Does any toast containing an action (incl. Undo) auto-dismiss? → **No** *(set `duration: Infinity`)*
30. Is `closeButton` enabled on the Toaster? → **Yes**
31. Would a user missing this toast entirely cause a problem? → **No** *(if Yes, it must not be a toast)*
32. Are validation errors shown inline at the field, not in a toast? → **Yes**
33. Is the ⌥+T toast hotkey documented in the shortcuts panel? → **Yes**

**F. Cognitive load**
34. How many decisions before the user's own issue appears on a board? → **≤ 1**
35. How many required fields to create an issue? → **1** (title)
36. Is more than one modal ever open at once? → **No**
37. Is any modal the only route to a destination? → **No**
38. Is every hover-revealed action also keyboard- and menu-reachable? → **Yes** *(1.4.13 does not cover this — it's on you)*
39. Is any label rendered only as a placeholder? → **No**
40. Does every disabled control have a visible, adjacent reason? → **Yes**
41. Does this control sit in the same position and carry the same label/shortcut as on every other screen? → **Yes** *(3.2.3, 3.2.4)*
42. Is help/keyboard-shortcuts access in a fixed, consistent location? → **Yes** *(3.2.6, Level A)*
43. Is there exactly one canonical keyboard path per action? → **Yes**

**G. Review flow**
44. Can a reviewer register a concern without blocking the document? → **Yes**
45. Is severity attached to the comment rather than the review? → **Yes**
46. Is the default consequence non-blocking, and is that word visible in the composer? → **Yes**
47. Are `nit`/`note`/`praise` structurally incapable of blocking? → **Yes**
48. Does a blocking comment require a rationale or concrete alternative? → **Yes**
49. Is the review summarized by severity before the full list is shown? → **Yes**
50. Is praise optional and never prompted? → **Yes**

**H. Register, motion, and defaults**
51. Any mascot, pastel palette, confetti, or generated encouragement? → **No**
52. Does the OS `prefers-reduced-motion` setting demonstrably change this screen's animations? → **Yes** *(test it, don't assume it)*
53. Are notifications defaulted to participating-and-mentions, with email off? → **Yes**
54. Does the app notify the user about their own actions? → **No**
55. Is every power feature still present, reachable by keyboard/command palette? → **Yes**

**I. Self-hosting**
56. Does `docker run` with no config produce a working app? → **Yes**
57. Is backup and restore each a single documented command, shown in-app? → **Yes**
58. Do migrations run automatically, transactionally, with snapshot and rollback? → **Yes**
59. Does upgrading preserve preferences, saved views, and keybindings? → **Yes**
60. Does the app work on plain HTTP on a LAN with no domain or TLS? → **Yes**

---

## WHAT I COULD NOT VERIFY

Reported so the evidence base isn't inflated.

1. **WebSearch was never available** — 200/200 consumed before I started. Everything is WebFetch/API-based, so discovery was limited to URLs I could name or infer.
2. **The full eleven ACDP types** (Monge Roffarello/Lukoff/De Russis, CHI 2023). Preprint PDF exceeded the fetch size limit at two URLs; ACM DL returns 403. Only *Time Fog* and *Infinite Scroll* are confirmed.
3. **Whether the EU Digital Fairness Act was tabled in 2026.** All reachable primary sources end Dec 2025 and say "planning to present… by the end of 2026." **Do not describe it as law or as a tabled proposal.**
4. **Chernev et al. 2015 and Scheibehenne et al. 2010 moderator details** — abstracts publisher-elided; I have Scheibehenne's *"mean effect size of virtually zero"* verbatim from the open-access record but not Chernev's counter-findings.
5. **Whether Finch's pet suffers on missed days.** You flagged this as mattering and I could not answer it. `help.finchcare.com` 403s on every route, `/faq` 301-loops, `/blog` 404s, archive.org is tool-blocked. The only evidence is a single App Store user review (*"You also don't get penalized/made to feel bad"*) — **[WEAK]**, not a documented mechanic.
6. **Duolingo Streak Repair, Streak Society, and streak-repair pricing.** `support.duolingo.com` 301s into a JS shell. The often-repeated "$2.99–$9.99" figure comes from a 2018 HN comment ([16824400](https://news.ycombinator.com/item?id=16824400)) and is uncorroborated and probably stale. **Don't print a dollar figure.**
7. **Whether Habitica's Rest in the Inn preserves Daily streaks.** Two reads of `cron.js` disagreed on the presence of `task.streak = 0`, and the wiki returns HTTP 402. Unresolved.
8. **Things 3's actual overdue behavior.** Docs say Today shows to-dos whose date *"matches today's date"* — which would exclude past dates — but never address passed deadlines or overdue styling. **[CONTESTED]**; omit or flag.
9. **Todoist's Smart Schedule and the Reschedule sheet's options**; also **Apple Reminders' built-in Today list** overdue behavior. Both help centers are unnavigable without search.
10. **Apple Fitness rings/awards, Oura, and Whoop streak mechanics.** Not verified; deliberately excluded rather than guessed.
11. **Empty-state design-system guidance.** Polaris (301), Carbon (404 ×2), Material (JS-rendered), Atlassian (404), Smashing (404) — **none retrieved.** §1.5 is graded [MODERATE] practitioner consensus accordingly.
12. **Spiel et al. CHI 2022 full text** (403 on ACM PDF; author site DNS-fails). Abstract-level only.
13. **The TOCHI 2025 "Digital Attention Heuristics" paper** — listed on the author's site, not indexed in OpenAlex, no retrievable content.
14. **Empirical research on notification badges and compulsive checking** — an OpenAlex sweep returned essentially nothing on point. The red-badge harm claim rests on self-report **[WEAK–MODERATE]**, and §2.4 says so.
15. **Linear's own writing** on the philosophy behind cycle rollover (`linear.app/blog`, `/method` not fetched). Docs only.
16. **DSM-5-TR text** (no free canonical URL). The "RSD is not a DSM diagnosis" claim is supported firmly but *indirectly* — via van Asselt 2026 and Faraone 2019. Phrase as "not a diagnosis in DSM-5-TR and has no validated measure," not with a page cite.

**One meta-caution on the user voices:** HN skews senior, technical, and pro-directness. A visible minority explicitly prefers blunt review (eof: *"your tone doesn't matter as long as it's not mean"*) and dismisses self-hosting burden. Treat all quoted voices as **[MODERATE]** illustration of a mechanism, never as prevalence data.agentId: acb6c1c107db938d0 (use SendMessage with to: 'acb6c1c107db938d0', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 205474
tool_uses: 100
duration_ms: 1456365</usage>