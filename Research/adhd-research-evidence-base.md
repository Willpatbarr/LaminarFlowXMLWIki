I have enough to deliver. The GOV.UK and Microsoft items I verified myself; Apple HIG and Material Design 3 are JS-rendered and resisted extraction, which I'll flag honestly.

---

# ADHD-First Interface Design: Cognitive Science and Standards Foundation

## BOTTOM LINE

The evidence supports four things solidly: the ADHD working-memory deficit is in **manipulation, not storage** (Kofler et al. 2020: central-executive *d* = 1.63–2.03, phonological short-term memory *d* = 0.28, essentially intact), so "show fewer things" is the wrong fix and "never make the user hold-and-transform" is the right one; **timing deficits are real and meta-analytic** across 55 studies; **prospective-memory failure in adults is predominantly a planning failure, not a recall failure** (Fuermaier et al. 2013 — large impairment in task planning, negligible-to-small in plan recall and self-initiation), which means a task-decomposition affordance beats another reminder; and **emotional dysregulation has a larger effect size in adult ADHD (Hedges' *g* = 1.17) than working memory does** — yet virtually all "ADHD design" advice is about attention and memory and says nothing about frustration recovery. The single biggest way designers get this wrong is **treating ADHD as a homogeneous profile with a single design answer**: Sonuga-Barke et al. (2010) found timing, inhibition, and delay deficits co-occur *no more than chance*, with substantial subgroups impaired in only one domain, and the two studies that actually tested layout preferences with ADHD users found no layout that all participants chose. The second biggest error is conflating ADHD with autism and reaching for the UK Home Office autism poster — which recommends *simple colours* and *avoiding contrast*, exactly backwards for a population whose prospective-memory deficit is eliminated by salient, centrally-placed, reward-linked cues (Costanzo et al. 2021). The correct conclusion is not "calm and minimal" but **dense, stable, salient, reversible, and user-adjustable** — and there is a real modality asymmetry that explains the confusion: extra *auditory* stimulation measurably helps ADHD task performance (*g* = 0.249, meta-analytic) while extra *visual* load measurably hurts it. Finally, be honest that **no validated instrument exists for evaluating whether an interface is ADHD-friendly**; this is a qualitative-and-telemetry problem, and anyone claiming a score is selling something.

---

## 1. The Cognitive Mechanisms

### 1.1 Executive dysfunction — and why "just make it simpler" is inadequate

Barkley's model (**Barkley 1997**, *Psychological Bulletin* 121(1):65–94, PMID 9000892) reframes ADHD as a disorder of behavioural inhibition → executive function → self-regulation rather than of attention per se. [MODERATE — influential and coherent, but **not consensus**: Willcutt et al. (2005, *Biological Psychiatry*, 83 studies) found significant EF group differences in only 109 of 168 comparisons (65%), with medium effect sizes and large ADHD/control distributional overlap. EF deficit is neither necessary nor sufficient for ADHD.]

Note for provenance: **Barkley retired fully at the end of 2021** (last post: Clinical Professor of Psychiatry, VCU School of Medicine; CHADD exit interview, *Attention*, Feb 2022; russellbarkley.org states "now fully retired"). His 2025–26 output is trade books and magazine articles. **He has never published UI design guidance** — any design rule attributed to Barkley is someone else's inference. [STRONG]

**Why "simplify" is the wrong response.** Executive dysfunction is a *coordination* deficit, not a *capacity* deficit. Simplifying a screen reduces how much is visible; it does not reduce how much sequencing, prioritising, holding, and switching the user must do. In fact it usually *increases* it, because the removed information now has to be navigated to and remembered. The design target is the **number of self-directed executive operations required per unit of work**, not the number of pixels. Reducing steps, keeping state visible, and eliminating decisions all reduce executive load; reducing information density often doesn't.

**The heterogeneity finding that invalidates the whole "ADHD design tips" genre:**

> **Sonuga-Barke, E., Bitsakou, P. & Thompson, M. (2010).** Beyond the dual pathway model: evidence for the dissociation of timing, inhibitory, and delay-related impairments in ADHD. *JAACAP* 49(4):345–355. [doi:10.1016/j.jaac.2009.12.018](https://doi.org/10.1016/j.jaac.2009.12.018)

Nine tasks across three domains, *n* = 71 ADHD probands + 71 siblings + 50 controls. Timing, inhibitory control, and delay-related deficits were **independent components**. Critically: *"the co-occurrence of inhibitory, temporal processing and delay-related deficits was no greater than expected by chance with substantial groups of patients showing only one problem."* [STRONG]

**Implication:** there is no ADHD design profile. Two users with the same diagnosis can have non-overlapping deficits. The only architecture that serves both is **user-adjustable defaults**, which is also what the two ADHD layout-preference studies independently concluded (§3.1).

### 1.2 Working memory — the most misapplied mechanism in this field

**Baseline capacity (all humans):** Cowan's synthesis puts central working-memory storage at **3–5 meaningful chunks** in young adults, not Miller's seven. Miller's figure conflated storage with processing and permitted rehearsal/grouping strategies that inflate the apparent limit. Capacity constrains the number of *chunks*, not the amount of information. [STRONG — **Cowan, N. (2010).** The Magical Mystery Four: How Is Working Memory Capacity Limited, and Why? *Current Directions in Psychological Science* 19(1):51–57. [PMC2864034](https://pmc.ncbi.nlm.nih.gov/articles/PMC2864034/)]

**ADHD vs. neurotypical — the decomposition matters enormously:**

> **Kofler, M.J., Singh, L.J., Soto, E.F., Chan, E.S.M., Miller, C.E., Harmon, S.L. & Spiegel, J.A. (2020).** Working memory and short-term memory deficits in ADHD: A bifactor modeling approach. *Neuropsychology* 34(6):686–698.

| Component | Effect size | % impaired | Covaries with ADHD symptoms? |
|---|---|---|---|
| **Central executive** (manipulation, updating, reordering) | *d* = 1.63–2.03 | 75–81% | **Yes**, parent and teacher report |
| Visuospatial short-term memory (storage) | *d* = 0.60 | 38% | **No** — authors call it "epiphenomenal" |
| Phonological short-term memory (storage) | *d* = 0.28 | — | **No evidence of impairment** |

Corroborating meta-analyses: **Alderson, R.M., Kasper, L.J., Hudec, K.L. & Patros, C.H. (2013).** ADHD and working memory in adults: a meta-analytic review. *Neuropsychology* 27(3):287–302 — 38 studies, **moderate-magnitude** effects in both phonological and visuospatial domains, persisting into adulthood, with heavy moderation by *central-executive task demands*. [STRONG]

*Caveat on the large Kofler figures:* they come from latent/composite bifactor estimates in children. Single-task omnibus estimates are much smaller (*d* ≈ 0.55–0.74, Kasper et al. 2012; *d* ≈ 0.55–0.63, Willcutt et al. 2005). The *pattern* (executive ≫ storage) is the robust finding; the absolute magnitude is method-dependent.

**Interface implication — and this is the crux of the whole report.** The failure mode is not "too many items on screen." It is **"the user must hold X while doing Y to produce Z."** Storage is close to normal; manipulation is severely impaired. So:

- **Must stay on screen:** anything that would otherwise have to be *held during an operation* — the ticket you're triaging while reading the linked doc, the acceptance criteria while writing the implementation note, the parent epic while re-scoping a child, the current filter while interpreting results, the diff region while writing the review comment.
- **Can be recalled or navigated to:** stable facts with a single canonical home that don't participate in the current operation (project settings, workspace members, historical status changes).
- **The real win is eliminating the transform, not the item.** Don't show a start date and a duration and make the user compute the end date. Don't show "3 of 8 done" and make them infer what's left. Don't require reordering by drag when a "move to position" command exists. Every arithmetic, comparison, or reordering operation you perform *for* the user is worth more than any amount of decluttering.

Two independent confirmations from ADHD developers specifically:
- *"It can take me almost an hour to get the entire structure and everything like loaded into my mind, and then somebody will come by me like, 'Hey, did you see the football game?'"* — I1
- *"I have to bounce around and re-remember where everything is every couple of seconds."* — P05, on interfaces that don't match his layout expectations

(Sources: Liebel et al. ICSE 2024; Halpin et al. ECTEL 2025 — full citations in §1.11.)

### 1.3 Task initiation / activation energy

**What the mechanism is.** Not laziness and not (primarily) motivation. Two verified components:

1. **Planning is the bottleneck, not remembering.** **Fuermaier, A.B. et al. (2013).** Complex prospective memory in adults with ADHD. *PLoS ONE* 8(3):e58338. [doi:10.1371/journal.pone.0058338](https://doi.org/10.1371/journal.pone.0058338) — *n* = 45 unmedicated ADHD adults vs 45 matched controls, decomposed into task planning / plan recall / self-initiation / execution. Result: **"A large-scale impairment could be observed in task planning abilities… Only negligible to small effects were found for plan recall, self-initiation and execution."** Inhibition significantly predicted planning performance. [STRONG]

2. **Prospective-memory failure mediates procrastination.** **Altgassen, M., Scheres, A. & Edel, M.A. (2019).** Prospective memory (partially) mediates the link between ADHD symptoms and procrastination. *ADHD Atten Def Hyp Disord* 11:59–71. [MODERATE — *n* = 29 + 24]

**What reduces it.** [MODERATE — the mechanism is well-evidenced; the *interface* translation is inference]
- **Pre-decomposition.** If planning is the impaired step, the tool doing the decomposition is the intervention. A ticket that arrives already broken into checkable substeps has had its activation barrier removed. This is precisely the value of a structured document schema over a blank prose field.
- **A single unambiguous next physical action**, not a goal. "Write the migration" is a goal; "open `schema.sql` and add the `aspect_id` column" is an action.
- **Implementation intentions** (Gollwitzer's if-then plans) are the best-evidenced behavioural technique for initiation generally. [MODERATE for ADHD specifically — widely recommended, thinly tested in ADHD samples. The "eight times more likely" figure circulating online is **[WEAK]** — I could not trace it to a primary ADHD study.]
- **Body doubling / pair programming** was raised spontaneously by multiple ADHD developers as their most effective initiation strategy: *"if they get distracted, there's someone there to pull them back in"* (I19). There is now an HCI study on it (Ara et al. 2025, arXiv:2509.12153, *n* = 12) but the evidence base is preliminary. [WEAK→MODERATE]

**One finding with a direct, counterintuitive design consequence — "time paralysis":**

> *"the idea of like time paralysis, when, like you have a meeting in an hour so like you won't start anything, because, you know, you won't be able to get into the… that mindset."* — I10, Liebel et al.

A prominent "next meeting in 47 minutes" countdown can **prevent** work from starting. This is a real argument against the ambient-countdown pattern that ADHD productivity tools reach for reflexively. [WEAK as generalised evidence — single qualitative report — but mechanistically coherent and worth designing around.]

### 1.4 Time blindness / temporal discounting

> **Marx, I., Cortese, S., Koelch, M.G. & Hacker, T. (2022).** Meta-analysis: Altered Perceptual Timing Abilities in Attention-Deficit/Hyperactivity Disorder. *JAACAP* 61(7):866–880. [doi:10.1016/j.jaac.2021.12.004](https://doi.org/10.1016/j.jaac.2021.12.004)

55 studies from 2,266 records, random-effects models:

| Paradigm | Studies | Participants | Effect |
|---|---|---|---|
| Time discrimination | 25 | 1,633 | Medium — worst in the sub-second range |
| Time reproduction | 26 | 2,364 | Medium increase in absolute error |
| Time estimation | 8 | 1,024 | Small-to-medium increase in absolute error |
| Time production | 7 | 380 | Small increase in absolute error |

Findings indicate an **accelerated internal clock**, plus a motivational component: *faster counting at long intervals due to increased delay aversion*. [STRONG]

"Time blindness" is a metaphor, not a construct — but the underlying temporal-processing deficit is one of the better-replicated findings in ADHD cognition. [STRONG for the mechanism; **[WEAK]** for the term itself, which appears in no research literature]

**Interface implications:**

- **Never make elapsed or remaining time something the user computes.** "Updated 3 days ago" is usable; "Updated 2026-08-30T14:22Z" is not. Relative timestamps are not a stylistic preference here — they are the arithmetic the impaired system can't do.
- **But give absolute time on hover/expand**, because relative time destroys the ability to correlate across items ("was this before or after the deploy?").
- **Sprint views should show elapsed *and* remaining proportionally and visually**, not as dates. "Day 6 of 10" plus a filled bar. A start date and an end date require a subtraction and a comparison to today — two executive operations.
- **Estimates: expect systematic error, and don't punish it.** Two of nineteen ADHD developers reported time estimation as their single hardest activity (*"I have no sense of time"* — I6; *"I just don't really have a good sense of, like, how long something will take"* — I12), and one had delegated it entirely (*"[I do] not do that part of the job [time estimation] by myself"* — I6). Design consequence: offer **relative sizing (S/M/L, or "smaller than X")** rather than hour estimates, and **show the user their own historical estimate-vs-actual ratio** so the calibration is externalised rather than intuited. Never surface estimate accuracy as a team-visible metric.
- **"Last updated" stamps are load-bearing.** They are the only cue that lets a user reconstruct a timeline they cannot feel. Put them on tickets, documents, document *sections*, and review threads.
- **Overdue states desensitise.** The most consequential quote in the dev-tool literature: *"Had a task for this for like 3 months in my to do list [..] 72 days overdue, and I wouldn't do anything about it"* (I5). A red "overdue" badge that persists indefinitely stops carrying information after roughly the first day. **Design fix:** make overdue *actionable* rather than decorative — an overdue item should offer reschedule / drop / split inline, and the system should prompt a re-decision rather than escalating colour. Escalating visual severity on an unchanged item is a pure anti-pattern.

### 1.5 Prospective memory failure

Distinguish **event-based** (do X when Y happens) from **time-based** (do X at 3pm). Both are impaired, and the mechanism is now fairly specific:

> **Costanzo, F., Fucà, E., Menghini, D., Circelli, A.R., Carlesimo, G.A., Costa, A. & Vicari, S. (2021).** Event-Based Prospective Memory Deficit in Children with ADHD. *IJERPH* 18(11):5849.

Three findings with unusually direct interface translations:

1. **Cue count matters.** The largest deficit appeared in the 4-target condition (high WM load); no group difference in the focal 1-target condition. [MODERATE]
2. **Cue position matters.** The "unfocal" condition placed targets **in the screen corners rather than the centre** and significantly impaired ADHD performance, while the focal centre condition did not. [MODERATE — one study, but this is a rare case of a lab manipulation mapping one-to-one onto a UI decision]
3. **Reward abolished the deficit.** In the reward condition (50 points vs 1), *"the accuracy in the RE condition did not differ from BC"* and the group difference vanished entirely (*p* = 1.0). [MODERATE]

**Interface implications:**

- **Ambient display beats notification, but only if the cue is *few, central, and salient*.** The research does not support "put a badge in the corner." A peripheral corner badge is close to the exact experimental condition that *failed*. A count in the sidebar is nearly invisible to this population.
- **The cue must live in the visual field of the current task.** A review request should appear anchored to the document region under the cursor, not as a number in a nav rail.
- **Cap concurrent cues aggressively.** Four competing indicators already degraded performance in the lab. One "what needs you" surface, not five badge locations.
- **Reward/salience is a legitimate lever** — but see §1.7 for the sharp limits on what that licenses.
- **Corroborating field evidence:** ADHD developers reported missing transient UI entirely — *"you've missed the little pop up window at the top that does everything"* (P07). **Toasts are the worst possible prospective-memory mechanism**: peripheral, transient, and low-salience simultaneously. Anything that needs acting on must persist.

W3C has a formal hook for this: COGA *Making Content Usable* Objective 7, pattern **"Provide Reminders"** — with the user-need statement *"I need to control when reminders are sent, the frequency and type of reminders so that I do not become distracted by too many reminders."*

### 1.6 Hyperfocus and task-switching cost

**Be careful here — the evidence is weaker than the popular discourse.**

> **Ashinoff, B.K. & Abu-Akel, A. (2021).** Hyperfocus: the forgotten frontier of attention. *Psychological Research* 85(1):1–19. [doi:10.1007/s00426-019-01245-8](https://doi.org/10.1007/s00426-019-01245-8)

The authoritative review. Its conclusions, verbatim from the paper:
- *"there is no clear general or operational definition of hyperfocus in the literature, which usually assumes that the reader inherently knows what it is."*
- References are *"typically anecdotal and can differ from paper to paper"* and *"rarely provide an operational definition that can be tested."*
- Proposed testable definition, four criteria: **(1)** induced by task engagement; **(2)** an intense state of sustained or selective attention; **(3)** diminished perception of non-task-relevant stimuli; **(4)** task performance improves.
- They argue **flow and hyperfocus are synonymous** — which, if true, means hyperfocus is not ADHD-specific at all.
- On whether people with ADHD hyperfocus more: **the evidence is mixed.** [MODERATE at best]

Two 2025 items that appear in search results as "reviews" are **conference abstracts in *European Psychiatry* supplements** (Oroian et al., 68(S1):S306, *n* = 50; Terra & Etchebest, 68(S1):S930–931, 10 studies). Neither is a peer-reviewed full paper. Treat the "68% report frequent hyperfocus" figure as **[WEAK]**.

**Interruption cost — where the evidence is genuinely good:**

> **Mark, G., Gudith, D. & Klocke, U. (2008).** The cost of interrupted work: more speed and stress. *CHI '08*. [doi:10.1145/1357054.1357072](https://doi.org/10.1145/1357054.1357072) · [PDF](https://ics.uci.edu/~gmark/chi08-mark.pdf)

The actual result is the opposite of the folklore. Interrupted tasks were completed **faster**, with no quality difference — people compensate by working faster. The cost is affective. Measured on 20-point NASA-TLX-derived scales (baseline / same-context interruption / different-context interruption):

| Measure | Baseline | Same context | Different context | p |
|---|---|---|---|---|
| Stress | 6.92 | 9.46 | 9.13 | < .01 |
| Frustration | 4.73 | 6.63 | 6.48 | < .01 |
| Time pressure | 11.02 | ~12 | 12.17 | < .05 |
| Effort | 9.50 | 11.04 | 11.52 | < .01 |

Also: openness to experience and personal need for structure significantly predicted disruption cost — i.e. **individual differences in interruption tolerance are real and measurable**, which again argues for user control rather than a fixed policy. [STRONG]

> **⚠️ MYTH: "it takes 23 minutes 15 seconds to refocus after an interruption."** This number appears in **no published paper**. It surfaces only in interviews with Gloria Mark and in press quoting her. A careful trace ([blog.oberien.de, 5 Nov 2023](https://blog.oberien.de/2023/11/05/23-minutes-15-seconds.html)) found 9 of 23 blog posts misattributing it to papers where it does not appear; the 2008 paper *"never mentions the number 23"* and contains no recovery-time analysis. Related published figures are 11–16 minutes and less rigorous. **Do not use this number.** [MYTH — well-documented]

**Attention residue:** **Leroy, S. (2009).** Why is it so hard to do my work? The challenge of attention residue when switching between work tasks. *Organizational Behavior and Human Decision Processes* 109(2):168–181. The construct is real and the paper is well-cited. Key nuance usually dropped: what enables clean switching is **psychological disengagement**, and *time pressure while finishing* the prior task helps produce it. [MODERATE — real study, general population, not ADHD-specific; the "30–40% worse performance" figure circulating online I could not verify against the paper.]

**Interruption *timing* — the best-evidenced actionable finding in this whole section:**

> **Bailey, B.P. & Iqbal, S.T. (2008).** Understanding changes in mental workload during execution of goal-directed tasks and its application for interruption management. *ACM TOCHI* 14(4), Article 21. [doi:10.1145/1314683.1314689](https://doi.org/10.1145/1314683.1314689)

Using continuous pupillometry aligned to task models: workload exhibits **transient decreases at subtask boundaries**, and the decrease is larger at boundaries completing larger chunks. A follow-up experiment (*n* = 12) interrupted users at better / worse / random moments:

> **"Users resumed primary tasks 69% faster, experienced 18% less annoyance, and attributed 63% more respect to the interrupting system relative to being interrupted at worse moments."**

[STRONG for the mechanism; small *n* on the follow-up, general population]

**Interface implications:**
- **The cost of interrupting is real but affective, not temporal.** Frame the design goal as protecting *frustration budget*, not clock time. This matters because "you'll lose 23 minutes" is a false premise that leads to over-blocking.
- **Defer non-urgent notifications to subtask boundaries**, which in a Linear-like tool are legible: ticket saved, status changed, document section committed, review submitted, command palette closed, view switched. This is implementable without ML — you know when a task boundary occurs because the user just completed a discrete action.
- **Never interrupt mid-composition.** No toasts, no badge changes, no layout shifts while a TipTap editor has focus. Queue and flush at blur or save.
- **Make disengagement cheap, since that's what Leroy identifies as the enabler.** A "park this" action that captures current state (which ticket, which scroll position, which draft, a one-line note on what you were about to do) and restores it exactly is the single highest-value feature for interruption recovery. This is also the honest answer to "the cost of interrupting hyperfocus": you cannot prevent interruption, so make **resumption** free.

### 1.7 Delay aversion and reward sensitivity — where to be careful

**The pop-neuroscience version ("ADHD is a dopamine deficiency") is not supported.**

> **MacDonald, H.J., Kleppe, R., Szigetvari, P.D. & Haavik, J. (2024).** The dopamine hypothesis for ADHD: An evaluation of evidence accumulated from human studies and animal models. *Frontiers in Psychiatry* 15:1492126. [PMC11604610](https://pmc.ncbi.nlm.nih.gov/articles/PMC11604610/)

Verdict: *"there is evidence for the involvement of dopamine but limited evidence for a hypo-dopaminergic state per se as a key component of ADHD."* Specifically: neuroimaging is contradictory (decreased, increased, and unchanged all reported); **core dopamine genes do not rank among major ADHD risk genes in GWAS**; and humans with documented dopamine deficiency from rare metabolic disease present with motor symptoms, not ADHD symptoms. [STRONG]

Supporting: the striatal dopamine-transporter meta-analysis (Fusar-Poli et al., *Am J Psychiatry* 2012) found 14% higher DAT density in ADHD — but meta-regression showed this was **driven by prior psychostimulant exposure**; medication-naïve patients had *lower* density. The finding may be an adaptation to treatment, not pathophysiology. [STRONG]

**What *is* reasonably established:**

- **Delay aversion is a genuine, dissociable mechanism** — Sonuga-Barke's dual/triple-pathway work (§1.1). Delay cues in the environment carry motivational significance. [STRONG]
- **The credible dopamine story is specific and much narrower: the dopamine transfer deficit.** **Tripp, G. & Wickens, J.R. (2008).** Research review: dopamine transfer deficit: a neurobiological theory of altered reinforcement mechanisms in ADHD. *JCPP* 49(7):691–704 — proposes **diminished *anticipatory* dopamine cell firing to cues that predict reward**. The deficit isn't in dopamine levels, it's in the transfer of the response back to the predictive cue. [MODERATE — a well-specified, testable theory, not established fact]
- **Reinforcement sensitivity is altered but findings are inconsistent**, and nobody knows which subgroup shows it — **Luman, M., Tripp, G. & Scheres, A. (2010).** *Neurosci Biobehav Rev* 34(5):744–754, explicitly notes *"a lack in studies that try to understand what subgroup of children with ADHD shows alterations in reinforcement sensitivity."* [MODERATE]
- **Computational modelling** finds **lower drift rate** and **lower choice sensitivity** in ADHD, but **not an altered learning rate** — Ziegler, S., Pedersen, M.L., Mowinckel, A.M. & Biele, G. (2016). *Neurosci Biobehav Rev* 71:633–656. [MODERATE]

**Interface implications:**
- **Immediacy is what matters, not magnitude.** If the mechanism is a failure to transfer reward response to *predictive cues*, then delayed or aggregated feedback simply doesn't land. Feedback must be at the moment of action, tied to the action. Optimistic UI updates aren't just a latency nicety here — they're the reward mechanism.
- **Make progress continuously visible at the granularity of the work being done.** Not "sprint 40% complete" at the end of the day; the checkbox filling as you check it.
- **Do not build a points economy.** See §3.6.
- **Say "reward sensitivity," not "dopamine."** If your design docs invoke dopamine, you've imported a claim the literature doesn't support, and you'll make decisions based on it.

### 1.8 Rejection Sensitive Dysphoria — contested; the underlying construct is not

**Status, honestly.** RSD is **not in DSM-5-TR**, was popularised by psychiatrist **William Dodson** from the 1990s through lectures and blog posts rather than peer-reviewed work, and has **no validated measure**. A rigorous audit ([Gilly Kahn, PhD, *Psychology Today*, Apr 2026](https://www.psychologytoday.com/us/blog/if-i-be-waspish/202604/rejection-sensitivity-dysphoria-the-actual-research)) found **only five qualitative studies**, *n* = 4–43, and concluded *"we are still in the beginning stages of truly understanding RSD on an empirical level"* with the necessary next step being *"developing a valid and reliable measure."* The scientifically established adjacent construct is **rejection sensitivity** (a well-studied trait), which is not ADHD-specific. **[WEAK as a distinct ADHD-specific construct.]**

The best available study: **Rowney-Smith, A., Sutton, B., Quadt, L. & Eccles, J.A. (2026).** The lived experience of rejection sensitivity in ADHD — A qualitative exploration. *PLoS ONE* 21(1):e0314669. *n* = 5, two focus groups. Findings with direct design relevance:
- **"the *expectation* of rejection elicited more dysphoria than the rejection *itself*."**
- Triggers included **unanswered messages** (obsessive checking) and **receiving grades on work**.
- Consequences: pre-emptive withdrawal, **delaying or not submitting work**, **intentionally submitting substandard work**, avoiding applications.

**But here is the construct you should actually design against, because its evidence is far stronger:**

> **Beheshti, A., Chavanon, M.L. & Christiansen, H. (2020).** Emotion dysregulation in adults with attention deficit hyperactivity disorder: a meta-analysis. *BMC Psychiatry* 20:120. [doi:10.1186/s12888-020-2442-7](https://doi.org/10.1186/s12888-020-2442-7) — 13 studies, *N* = 2,535: general emotion dysregulation **Hedges' *g* = 1.17**, with emotional lability and negative emotional responses most definitive. [STRONG]

> **Soler-Gutiérrez, A.-M., Pérez-González, J.-C. & Mayas, J. (2023).** Evidence of emotion dysregulation as a core symptom of adult ADHD: A systematic review. *PLOS ONE* 18(1):e0280131 — 22 studies, ED affects **34–70% of affected adults**, *d'* = 0.31–2.27, associated with maladaptive suppression over reappraisal. Honest caveat from the authors: ED also occurs in other disorders (notably BPD), so it cannot be established as *uniquely* core to ADHD. [STRONG for presence and magnitude]

**That *g* = 1.17 is larger than the working-memory effect.** Emotional dysregulation is arguably the most impactful ADHD mechanism for a review-and-feedback tool, and it is almost entirely absent from ADHD design advice.

**Interface implications for error messages, review flows, and overdue states** [MODERATE — mechanism is [STRONG], the design translation is reasoned]:

- **Locate fault in the system, not the person.** This is not politeness; it corrects a documented, measurable bias. In the IDE study, ADHD students systematically blamed themselves for tool failures — the authors named it **"IDE infallibility"**: *"The coding environment was easy enough, myself is the problem"* (P07); *"I think I was more inclined to think it was probably me"* (P03); *"And now I look like an idiot"* (P04). One participant gave the IDE a *high* Likert score for layout while describing struggling with it. **The tool must state its own state and its own faults explicitly**, because this population will not attribute failure to it.
- **Make severity unambiguous.** Warning-vs-error ambiguity was a specific reported failure: *"I think it's a bit confusing when it has that light bulb next to it… I think it was slightly confusing if that's an error or a warning"* (P01). Use distinct shape and text, not just colour, and never make the user infer how bad something is.
- **Review requests should be anchored, scoped, and framed as bounded.** Given that the *expectation* of judgement is worse than the judgement, an open-ended "please review this document" is worse than "3 comments on the Data Model section." Show the count and the scope up front. Region-anchored comments (which Laminar Flow already plans) are structurally better than global comments for exactly this reason: they bound the perceived scope of criticism.
- **Never show unresolved-comment counts as a persistent global badge.** That is the "unanswered message" trigger, permanently installed.
- **Reviewer-side asymmetry:** a review whose state is "submitted, awaiting response" with no timestamp is the delayed-reply trigger. Show explicitly whether the ball is in your court.
- **Avoid public compliance metrics.** Overdue counts, estimate-accuracy scores, and velocity comparisons attach a judgement signal to precisely the functions that are impaired. Given the documented consequence is *not submitting work at all*, this is a real product risk, not a sensitivity concern.

### 1.9 Object permanence — the pop usage is wrong, the phenomenon isn't

**Flag it clearly.** Object permanence is a Piagetian sensorimotor milestone (birth–~2 years): understanding that objects continue to exist when unobserved. **It is not an ADHD symptom and appears in no ADHD diagnostic literature.** People with ADHD know the thing exists; they fail to maintain an *active representation* of it in awareness. The mechanism is working memory plus absence of an external cue. [MYTH as terminology — see e.g. [Inflow's explainer](https://www.getinflow.io/post/object-permanence-constancy-adhd-symptom) (Jul 2022), which correctly pushes back, though it's a commercial blog and its proposed replacement term "object constancy" is also borrowed from a different psychodynamic tradition. There is no good accepted term; "out of sight, out of mind" is the honest description.]

**The phenomenon, from peer-reviewed work with ADHD software engineers:**

> *"[..] If I can't see it, I'm not going to remember it."* — I3, Liebel et al., ICSE 2024

**Interface implications — this is where the strongest, most actionable rules live:**

- **Collapsed sections must show what's inside, not just that something is inside.** A chevron labelled "Details" is invisible. `▸ Acceptance Criteria (4)` is not. Persist expansion state per user per document — never collapse-by-default on return.
- **Archived and "done" items must remain discoverable through the paths the user actually travels**, not only through a separate archive view. Include them in global search by default with a visual "archived" treatment, rather than excluding them and requiring a filter change. A user who cannot remember the item exists will never think to change the filter.
- **Avoid modal drill-downs that hide the thing you're working from.** In a ticket-plus-document tool, opening a linked document must not hide the ticket. Side-by-side or split beats stack. One ADHD developer described using split-screen specifically as a memory prosthesis: *"I split the my code into the other bit so I could process it"* (P06).
- **Saved views are memory prosthetics, and they must be visible.** A saved view listed in a persistent sidebar is an externalised intention. A saved view reachable only from a dropdown is a forgotten one.
- **Anything the user creates as a reminder must be visible without an action.** Externalising was the most-cited strategy among ADHD developers (11 of 19), and its whole value is passive visibility: *"Even now I've got a small sheet of paper behind me, or in front of me"* (I3). A note that requires a click to see has lost its function.
- **Corollary — this is the strongest argument in the report against progressive disclosure.** See §3.2.

### 1.10 Emotional dysregulation and frustration tolerance

Covered quantitatively in §1.8 (*g* = 1.17; 34–70% prevalence). The distinctive design-relevant property is **rate of escalation**, documented directly in a coding context:

> *"It was notable that participants' frustrations would often grow rapidly and make it harder for them to focus, especially when not meeting their own standards."* — Halpin et al., ECTEL 2025

> *"it's not an error with my coding anymore and I'm trying to find the solution online but not being able to quickly locate the correct information… and it becomes very frustrating quite quickly."* — P07

Also documented: overwhelm caused **avoidance of the tools needed to succeed** — *"I get overwhelmed by a lot of information quite easily and I feel like the extensions, to me, feel very overwhelming and over stimulating. So I don't go to them so it never crossed my mind that the problem was with the extension"* (P01). The user's avoidance of an overwhelming surface **caused** the failure they then blamed themselves for.

**Interface implications** [MODERATE]:
- **Dead ends are the primary harm.** An error with no next action, a search with no results and no suggestion, a permission wall with no request path. Every terminal state needs an exit.
- **Undo over confirmation, always.** A confirmation dialog demands attention at the exact moment attention is unavailable and gets dismissed by muscle memory; undo is forgiving without demanding anything. Prefer a global undo stack with a visible, keyboard-reachable "undo last action" plus a recoverable trash with a generous window. This is also how you satisfy WCAG 3.3.4 and 3.3.6 (§2.2) — and W3C's own COGA pattern is literally *"Let Users Go Back."*
- **Destructive actions must be recoverable, not guarded.** In a keyboard-first app the risk profile is a destructive shortcut fired from muscle memory; guarding it with a modal both slows the common case and fails the rare one.
- **No escalating punitive visuals.** Reddening an overdue item over time adds affective load without adding information (§1.4).
- **Autosave everything, always, and say so.** Losing work is the highest-cost failure available, and it lands on a population already primed to read it as personal failure.

### 1.11 Sleep, arousal, and time-of-day variability — and the honest answer on adaptive interfaces

**The circadian finding is solid:**

> **Luu, B. & Fabiano, N. (2025).** ADHD as a circadian rhythm disorder: evidence and implications for chronotherapy. *Frontiers in Psychiatry* 16:1697900. [doi:10.3389/fpsyt.2025.1697900](https://doi.org/10.3389/fpsyt.2025.1697900)

- Sleep disturbance in up to **80% of adults** and 82% of children with ADHD
- Delayed sleep-wake timing in up to **78%**
- **Evening chronotype in approximately three-quarters** of adults with childhood-onset ADHD
- **DLMO delayed ~45 min in children, ~90 min in adults**; ~90 min phase delay across multiple biological markers

The authors are careful: circadian dysfunction is *"a clinically significant and highly prevalent phenotype in a substantial subgroup,"* explicitly **not universal**. [STRONG]

**Does anything support adapting the interface to fluctuating capacity? No — and I want to be blunt about this.**

- The circadian review **contains no data on time-of-day variation in cognitive performance or symptoms in ADHD.** I checked directly.
- The nearest real finding is old and indirect: Swanson et al. (1998, *Psychopharmacology Bulletin*) documented significant time-of-day effects on both teacher ratings and math performance **in the placebo condition** of a lab classroom study. [MODERATE, children, medication study]
- Ecological momentary assessment work on ADHD exists but studies *measurement* effects, not performance windows (e.g. Kennedy, Molina & Pedersen 2024, *JCCAP* — self-rated symptoms *decreased* across 17 days of monitoring, i.e. the act of measuring changed the thing).
- Self-report from ADHD developers is consistent and unanimous but qualitative: *"[I have a] fairly narrow window [..] where I am able to execute at a consistent level"* (I1); *"Over like a long enough time period [..] output is the same, or higher or whatever [..] but mine is very spiky"* (I10); *"I'm fairly nocturnal person. So for me, working like from 9 to 5 is not always the most conductive"* (I10). [WEAK as evidence, unanimous as testimony]

**Verdict: there is no evidence base for an interface that detects and adapts to fluctuating capacity, and building one would be speculative.** Worse, an interface that decides you're impaired and simplifies itself would violate the spatial-stability requirement (§1.2, §3.3) and remove the user's control — the two things the evidence *does* support.

**What the evidence does license:**
- **Make capacity-appropriate work findable, and let the user declare their state rather than inferring it.** A saved view for "low-effort, small, unblocked" that the user chooses to open is supported. A system that silently reorders their board because it's 4pm is not.
- **Do not assume a 9-to-5 rhythm anywhere in the product.** No "good morning" framing, no daily-digest-at-9am default, no sprint ceremonies pinned to business hours, no "you haven't logged in today" nags. Evening chronotype in ~75% of the target population makes this a real defect, not a nicety.
- **Nothing should expire or degrade on a schedule the user didn't set.** Drafts, sessions, review windows, "recently viewed."

### Primary dev-tool sources used throughout §1

Because these are unusually on-point for Laminar Flow and I verified them from full text rather than abstracts:

1. **Liebel, G., Langlois, N. & Gama, K. (2024).** Challenges, Strengths, and Strategies of Software Engineers with ADHD: A Case Study. *ICSE 2024*. [doi:10.1145/3639475.3640107](https://doi.org/10.1145/3639475.3640107) · preprint [arXiv:2312.05029](https://arxiv.org/abs/2312.05029). 19 semi-structured interviews with ADHD software engineers + 4 interviews with experienced SE managers; thematic analysis reviewed with a psychology researcher. Findings organised as Tasks/Deadlines/Estimation, Attention to Work, Relation to Others, Health; plus strengths and strategies. [STRONG for a qualitative study — peer-reviewed at a top-tier venue, with published transcripts]

2. **Halpin, L., Benachour, P., Hall, T., Houghton, A.-M. & Winter, E. (2025).** Accessible Design in Integrated Development Environments: A Think Aloud Study Exploring the Experiences of Students with ADHD. *ECTEL 2025*. [arXiv:2506.10598](https://arxiv.org/abs/2506.10598). 9 CS undergraduates with ADHD (self-diagnosis accepted), retrospective think-aloud on a VS Code debug-and-write task, 37,965-word corpus, two-coder negotiated agreement. Themes: self-confidence, interaction, learning. [MODERATE — small *n*, students, self-diagnosis permitted; but rigorous method and the only think-aloud study of ADHD developers in an IDE]

3. **Kasatskii, V., Sergeyuk, A., Serova, A., Titov, S. & Bryksin, T. (2023).** The Effect of Perceptual Load on Performance within IDE in People with ADHD Symptoms. *HCII 2023*, LNCS 14019:122–141. [arXiv:2302.06376](https://arxiv.org/abs/2302.06376). Discussed in §3.1. [MODERATE — *n* = 36, self-reported symptoms via BDEFS-SF not clinical diagnosis, but a genuine controlled experiment in the exact medium]

4. **Spiel, K., Hornecker, E., Williams, R.M. & Good, J. (2022).** ADHD and Technology Research – Investigated by Neurodivergent Readers. *CHI '22*. [doi:10.1145/3491102.3517592](https://doi.org/10.1145/3491102.3517592). Critical literature review from an insider perspective. Findings: technologies overwhelmingly aim to *mitigate* ADHD experiences framed as disruptive to neurotypical standards; **only 12% of studies in the corpus involve people with ADHD as stakeholders in design**; participant resistance to deficit framing is visible within researchers' own accounts. [STRONG — and the most important framing document for this project]

---

## 2. Formal Standards and Official Guidance

### 2.1 W3C COGA — the only standards-grade cognitive source, and it's non-normative

**Making Content Usable for People with Cognitive and Learning Disabilities**
**W3C Working Group Note, 29 April 2021** — https://www.w3.org/TR/coga-usable/

This is the **current version**; there is no second edition. It is **informative, not normative** — nothing in it is required for WCAG conformance. It is also **the only W3C document that names ADHD explicitly**, defining "AD(H)D" and including an ADHD persona ("Yuki, a yoga teacher"). [STRONG institutionally; individual patterns inside it are typically **[MODERATE]**, since they derive from personas, user needs, and expert consensus rather than controlled experiments.]

**Eight objectives.** The four that bear on attention, memory, and executive function:

**Objective 5 — Help Users Focus.** User need, verbatim: *"I need to avoid distraction. If I lose focus and forget what I am doing, I need reminders of what I was doing, so that I can complete my task."* Patterns: Limit Interruptions · Make Short Critical Paths · Avoid Too Much Content · Provide Information So a User Can Complete and Prepare for a Task.

**Objective 6 — Ensure Processes Do Not Rely on Memory.** Patterns: login not relying on memory · simple single-step login · login alternative with fewer words · let users avoid voice menus · **Do Not Rely on Users' Calculations or Memorizing Information**. *(That last pattern is the formal-standards expression of the §1.2 finding — the impairment is in manipulation, and W3C's own guidance says don't require calculation.)*

**Objective 4 — Help Users Avoid Mistakes and Know How to Correct Them.** 12 patterns; the ones that matter here: **Ensure Controls and Content Don't Move Unexpectedly** · **Let Users Go Back** · Make it Easy to Undo Form Errors · **Avoid Data Loss and Timeouts** · Provide Feedback.

**Objective 7 — Provide Help and Support.** Includes **Provide Reminders**, with the user need: *"I need to control when reminders are sent, the frequency and type of reminders so that I do not become distracted by too many reminders."*

**Objective 8 — Support Adaptation and Personalization.** Let Users Control When Content Moves or Changes · Enable APIs and Extensions · Support Simplification · Support a Personalized and Familiar Interface. User need: *"I need a familiar interface so I don't need to figure out and remember new interfaces."*

**Objectives 1 and 2** also matter: Use a Familiar Hierarchy and Design · Use a Consistent Visual Design · Clearly Identify Controls and Their Use · Make it Easy to Find the Most Important Tasks · Provide Search.

**Testability.** The document says its "use"/"avoid" examples can serve as testable cases, but acknowledges that making genuinely testable statements is an ongoing effort handled in supplementary resources. **In practice these patterns are not testable in the WCAG sense** — which is exactly why they aren't WCAG success criteria (§2.3).

**Current status of the wider COGA corpus** — three of these are effectively abandoned, which matters if you're citing them:

| Document | Status | Date |
|---|---|---|
| Making Content Usable | W3C Working Group Note (informative) | 29 Apr 2021 |
| [Cognitive Accessibility Research Modules](https://www.w3.org/TR/2026/DNOTE-coga-research-modules-20260205/) (formerly "Issue Papers") | W3C Group Note Draft — **active** | 5 Feb 2026 |
| [Cognitive Accessibility Roadmap and Gap Analysis](https://w3c.github.io/coga/gap-analysis/) | Working Draft — **stalled** | 11 Dec 2018 |
| [Cognitive Accessibility User Research](https://www.w3.org/TR/coga-user-research/) | FPWD — **11 years stale** | 15 Jan 2015 |

**Task force is genuinely active.** Facilitators: **Julie Rawe** (Understood.org) and **Lisa Seeman-Horwitz** (W3C Invited Expert); staff contact **Ruoxi Ran**; **38 participants**. (Note: Rachael Bradley Montgomery stepped down as co-facilitator in March 2021 — any resource listing her as COGA chair is five years stale.) Mailing-list traffic Mar–Aug 2026: 39/29/13/14/23/26 messages. GitHub: 1,860 commits, 47 open issues. [STRONG]

From the **[30 March 2026 minutes](https://www.w3.org/2026/03/30-coga-minutes.html)**: the task force is actively reviewing content for the WCAG 3 Editor's Draft with a tracked "Missing from WCAG 3" feedback category, and the dominant agenda item was **renaming** *Making Content Usable* (candidates: "Cognitive Accessibility Protocols," "Digital Cognitive Accessibility"). So: active, feeding WCAG 3, but **the document is being renamed rather than substantively revised.** No delivery dates.

**Two COGA sub-documents worth knowing about, both incomplete:**

- **[Distractions research module](https://w3c.github.io/coga/research-modules/distractions.html)** — the most directly ADHD-relevant thing COGA has produced, and it is **explicitly marked out of date**: *"This draft is out of date, there may be new research and new technologies that are relevant to this topic."* Does not mention ADHD by name. Recommendations that survive: *"Overlays should not be used where possible"*; closing mechanisms must be *"clear, easy to find, single click and effective"* and removable without scrolling; notifications must be *"easy to dismiss, cancel or opt out of."* [MODERATE, stale]
- **[Flat Design research module](https://w3c.github.io/coga/research-modules/flat-design.html)** — argues flat design creates cognitive barriers by removing affordances: *"it is more difficult to locate desired items to interact with"*, *"flat design makes it harder to differentiate things"*, *"flat design hides calls to action."* Its "Proposed solutions" section reads **"This section is to be developed."** Diagnoses the problem, offers nothing. [WEAK — an incomplete draft, though the diagnosis is echoed by the ADHD IDE findings on ambiguous interactive elements]

### 2.2 WCAG 2.2 — which criteria actually help

**W3C Recommendation, 5 October 2023; current published edition 12 December 2024** — https://www.w3.org/TR/WCAG22/ (Note the two W3C pages disagree in emphasis: the WAI "What's New" page cites only 2023.) 4.1.1 Parsing is obsolete and removed.

**Get this right, because it's widely mis-stated:**

| SC | Name | Level |
|---|---|---|
| 2.4.11 | **Focus Not Obscured (Minimum)** | AA |
| 2.4.12 | Focus Not Obscured (Enhanced) | AAA |
| 2.4.13 | **Focus Appearance** | AAA |

**2.4.11 is "Focus Not Obscured," not "Focus Appearance." Focus Appearance was neither dropped nor renamed — it survived as 2.4.13 at AAA** (it was proposed at AA during development). Its requirements: focus indicator at least a 2 CSS-pixel-thick perimeter of the component, with ≥3:1 contrast between focused and unfocused states of the same pixels. [STRONG — verified against the Recommendation]

**Highest value for a keyboard-driven ADHD productivity app:**

**3.3.7 Redundant Entry (Level A)** — https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html
Information previously entered in the same process must be auto-populated or selectable. **The Intent is almost purely a working-memory argument:** *"Information that is required to be remembered for input can pose a significant barrier to users with cognitive or memory difficulties"*; *"Users with learning, and cognitive disabilities are highly susceptible to mental fatigue"*; *"Requiring people to recall information previously entered can cause them to give up or re-enter the same information incorrectly."* **The single most ADHD-relevant criterion in WCAG 2.2**, and generalise past its letter: no multi-step flow should make the user re-derive anything the app already knows.

**2.4.11 Focus Not Obscured (Minimum) (AA)** — the Intent leads with sighted keyboard users, but the **Benefits** section is as close as WCAG 2.2 gets to naming ADHD: *"People with attention limitations, short term memory limitations, or limitations in executive processes benefit by being able to discover where the focus is located."* For a keyboard-first app a lost focus ring is a lost task. Audit sticky headers, docked toolbars, floating command bars, and toasts. Going to 2.4.12 + 2.4.13 (both AAA) is worth more here than most AA criteria.

**2.2.2 Pause, Stop, Hide (Level A)** — the **only criterion in WCAG 2.2 that names the population outright**: *"Certain groups, particularly those with attention deficit disorders, find blinking content distracting, making it difficult for them to concentrate on other parts of the web page."* Applies to anything auto-starting, lasting >5s, presented in parallel with other content; **and separately to auto-updating content, which needs pause/stop/hide *or frequency control***. Live offenders in a Linear clone: collaborator presence cursors, activity feeds, sync spinners, unread badges, ticking relative-time labels. **The frequency-control clause is the actionable one** — ship a "pause live updates" control.

**3.3.4 → 3.3.6 Error Prevention (AA → AAA)** — satisfy via **Reversible**, Checked, or Confirmed. The Intent names reading and motor disabilities but **not attention**; nonetheless this is the most consequential item here, because in a keyboard-driven app the dominant risk is a destructive shortcut fired by muscle memory. **Prefer Reversible (undo) over Confirmed (are-you-sure).** Build a global undo stack for 3.3.4 and you get 3.3.6 free. [Design reasoning is mine; the SC text is [STRONG]]

**2.2.6 Timeouts (AAA)** — implement despite the level. Intent: *"a user with a cognitive impairment may become overwhelmed with lengthy instructions and data input… may need to take a break. Users should be able to leave a process without losing their current place… If users cannot take a break and check their work, many will often be unable to complete a task correctly."* Benefits names *"focus-and-attention-related disabilities."* The preferred conformance route — **persist data ≥20 hours** — is just correct product design.

**3.2.6 Consistent Help (Level A)** — Intent: *"Users that experience cognitive fatigue or cognitive shut down will be able to reserve their energy for the task."* One always-reachable help affordance in a fixed position (a `?` in the command palette). Note the test is *serial order*, not visual position.

**3.3.8 / 3.3.9 Accessible Authentication (AA / AAA)** — no cognitive function test at any auth step without an alternative or assisting mechanism. Intent: *"Remembering a site-specific password is a cognitive function test"*, and it explicitly names *"the need to transcribe a one-time verification code"* as a barrier. Self-hosted apps routinely ship exactly that. Support passkeys/WebAuthn, never block paste, use correct `autocomplete` tokens including `one-time-code`. 3.3.9 additionally forbids object-recognition and personal-content exceptions — passkeys satisfy it for free.

**Adopt as defaults; rationale is adjacent rather than exact:**

- **1.4.8 Visual Presentation (AAA)** — the only criterion giving **hard numbers** for the "losing your place" failure: *"People with some cognitive disabilities find it difficult to track text where the lines are close together"*; *"They have trouble keeping their place and following the flow of text."* Requires ≤80 characters per line, never justified, line spacing ≥1.5 within paragraphs, paragraph spacing ≥1.5× line spacing. For the TipTap document editor: `max-w-prose` or `max-w-[80ch]`, `leading-relaxed`, never `text-justify`. Best cost-to-benefit item in this section.
- **1.4.12 Text Spacing (AA)** — a *robustness* requirement, not a styling mandate: content must survive user overrides to line-height 1.5×, paragraph spacing 2×, letter-spacing 0.12×, word-spacing 0.16× without loss. **For a Tailwind app this is a real risk:** `h-*` on text containers, `truncate`, and tight `leading-*` all invite failure. Prefer `min-h-*` over `h-*` on anything containing text.
- **3.2.3 Consistent Navigation / 3.2.4 Consistent Identification (AA)** — 3.2.3's Intent: *"helps users become comfortable that they will be able to predict where they can find things on each page. This helps users with cognitive limitations…"* For a keyboard app the substance is **shortcut stability**: never silently context-remap a shortcut. One action = one name = one icon = one shortcut, everywhere.
- **2.3.3 Animation from Interactions (AAA)** — this is your `prefers-reduced-motion` compliance hook, but its target population is **vestibular, not cognitive** (*"vestibular (inner ear) disorder reactions include distraction, dizziness, headaches and nausea"*). Honour it; don't tell yourself it's for ADHD users.

**Effectively boilerplate in this context — verify once, don't invest:**
- **1.4.2 Audio Control (A)** — no autoplay audio in a productivity app. Only becomes relevant if you add notification sounds, which must then be mutable independently of system volume.
- **2.2.1 Timing Adjustable (A)** — only bites if you have session timeouts or auto-advancing content. **Watch the toast trap:** an auto-dismissing toast carrying actionable information *is* a time limit — and per §1.5 it's also a prospective-memory failure. Two independent reasons not to ship it.

**Not on the original list but new in 2.2 and applicable:** **2.5.7 Dragging Movements (AA)** requires a single-pointer alternative to dragging — directly relevant to the pragmatic-drag-and-drop Kanban board. **2.5.8 Target Size (Minimum) (AA)**.

### 2.3 Why cognitive requirements were excluded from WCAG 2.x — and whether WCAG 3 fixes it

**The testability constraint, from W3C's own documents** [STRONG — complete chain of primary sources]:

> *"All WCAG 2 success criteria are written as testable criteria for objectively determining if content satisfies them."*
> — [Understanding Conformance](https://www.w3.org/WAI/test-evaluate/conformance/)

And WCAG 2.2 concedes the resulting gap in its own Introduction:

> *"Note that even content that conforms at the highest level (AAA) will not be accessible to individuals with all types, degrees, or combinations of disability, particularly in the cognitive, language, and learning areas."*

COGA's own diagnosis, from the Gap Analysis:

> *"The advice given in the research and available guidance is often vague and is not testable. So, even if developers read the research they would not know exactly what to do or when they have reached an acceptable level of accessibility."*

And on why cognitive access breaks WCAG's core assumption: *"when making a website usable for people with cognitive disabilities, the content itself may need to be changed (e.g. simplified), or support adaptability."*

**WCAG 3.0 — status, honestly.**
**W3C Working Draft, 3 March 2026** — https://www.w3.org/TR/wcag-3.0/

- Structure: **Guidelines** (outcome statements) → **Requirements**, classified **Core** or **Supplemental** (these were previously called "Outcomes"; "Foundational" was renamed "Core" in the March 2026 update) → **Assertions** (organisational/process commitments with documentation) → **Methods**.
- Maturity ladder: Placeholder → Exploratory → **Developing** → Refining → Mature. **Everything in the current draft is at "Developing."**
- **The conformance model is undefined.** The draft says only that "several levels of conformance are available" and does not name them. **Bronze/Silver/Gold is gone and has no replacement** — if you've read that WCAG 3 uses Bronze/Silver/Gold, that is **[MYTH]** as of March 2026.
- **Timeline, in W3C's own words** ([WCAG 3 Intro](https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/), updated 3 March 2026): *"WCAG 3 is not expected to be a completed W3C standard for a few more years"* and *"WCAG 3 will not supersede WCAG 2 and WCAG 2 will not be deprecated for at least several years after WCAG 3 is finalized."* The TR itself: *"it still has several years of work."* **No target Recommendation date has ever been published.** So "WCAG 3 is years away" is not scepticism — it's the W3C position. **WCAG 2.2 is your operative standard for the entire realistic lifetime of this project.**

**Does WCAG 3 serve cognitive accessibility better? Yes, and explicitly by design** — from [Requirements for WCAG 3.0](https://www.w3.org/TR/wcag-3.0-requirements/) (W3C Group Note Draft, 3 March 2026):

> WCAG 3 will have *"a structure, tests, and/or approach that allows for requirements that are not available in WCAG 2, such as (but not limited to) **additional needs of people with cognitive and learning disabilities**."*

> *"There are needs of people with disabilities, **especially cognitive and low vision disabilities, that are better captured by a different type of measurement**."*

Design Principle #2 calls for *"particular attention to the needs of low vision and cognitive accessibility."* **The Assertions mechanism and the escape from boolean testing exist substantially to admit COGA guidance.** [STRONG]

**The practical payoff — mine §2.9 as a design checklist, never as a conformance target.** New guidelines with no testable WCAG 2.2 equivalent include: **2.9.4 Retain information** ("Going back supported," "Progress saved") · **2.9.5 Complete tasks** ("Process instructions available") · **2.9.6 Unnecessary steps** · **2.9.3 Avoid deception** ("Preselections visible") · **2.2.3 Clear language** ("No nested clauses," "No unnecessary words") · **2.4.2 Physical or cognitive effort when using keyboard** — that last one directly on point for a keyboard-driven app. W3C's own caveat: *"Editor's notes indicate the requirements within this list where the Working Group has not found enough research to fully validate the guidance."*

### 2.4 CSS user-preference media queries

Spec container: **CSS Media Queries Level 5, W3C Working Draft, 19 February 2026** — https://www.w3.org/TR/mediaqueries-5/ · all five live in §12 "User Preference Media Features." None is in a finished Recommendation-track spec; they shipped anyway.

Browser support (MDN browser-compat-data, `main`, fetched 2026-09-02):

| Feature | Chrome | Edge | Firefox | Safari | iOS |
|---|---|---|---|---|---|
| `prefers-reduced-motion` | 74 | 74 | 63 | 10.1 | 10.1 |
| `prefers-contrast` | 96 | 96 | 101 | 14.1 | 14.1 |
| `forced-colors` | 89 | 79 | 89 | 16 | 16 |
| `prefers-reduced-transparency` | 118 | 118 | 113 *(flag)* | **No** | **No** |
| `prefers-reduced-data` | 85 *(flag)* | 85 *(flag)* | **No** | **No** | **No** |

- **`prefers-reduced-motion`** — values `no-preference | reduce`. **Baseline: widely available since January 2020.** [STRONG] The one you can rely on.
- **`prefers-reduced-transparency`** — Chromium-only in practice; Safari never shipped it, which is where the OS setting is most used. Progressive enhancement only.
- **`prefers-contrast`** — `no-preference | more | less | custom`; safely usable. `custom` aligns with `forced-colors: active` — gate on the latter, which has real support.
- **`prefers-reduced-data`** — **dead end.** MDN: *"This feature is not supported by any user agent and its specifics are subject to change."* Blocked on privacy (CSSWG #10076). Irrelevant here anyway.

**"Reduced motion" does not mean "no motion" — and this matters for the animation conflict (§3.3).** [STRONG, multiple independent primary sources]

The originating WebKit implementer, James Craig, ["Responsive Design for Motion," WebKit blog, 15 May 2017](https://webkit.org/blog/7551/responsive-design-for-motion/): *"Even if your site uses motion in a purely decorative sense, only remove the animations you know to be vestibular triggers."* His enumerated triggers: **scaling/zooming, 3D dolly-zoom with blur, spinning/vortex/spiral, parallax and multi-speed vertical movement, 2.5D plane-shifting, and peripheral horizontal motion.** Opacity/fade and colour transitions are **not** on the list.

Chris Coyier, ["No Motion Isn't Always prefers-reduced-motion," CSS-Tricks, 8 Feb 2022](https://css-tricks.com/nuking-motion-with-prefers-reduced-motion/), argues against the widely-copied nuke snippet (`animation-duration: 0.01ms !important`) on two grounds: it overshoots the stated preference, and it only works if *all* motion is CSS-driven — JS-driven animation can *speed up* when durations are zeroed. He also quotes the cognitive counter-argument: *"Animation can be a great tool to help combat some forms of cognitive disability by using it to break down complicated concepts, or communicate the relationship between seemingly disparate objects."*

CSSWG issue [#5594](https://github.com/w3c/csswg-drafts/issues/5594) (opened by Craig, Oct 2020, **closed "Accepted by Editor Discretion"**) proposed replacing "minimizes the amount of movement" with *"removes or replaces the types of motion-based animation that trigger discomfort for those with vestibular motion sensitivity."*

⚠️ **W3C's own technique contradicts this.** [Technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39) states its objective as *"to allow users to prevent animations… from being displayed"* — the removal framing. **Follow C39 literally and you get the behaviour its own implementer warns against.** [STRONG]

**Is there a "reduced distraction" or "reduced stimulation" query? No. Nothing proposed, drafted, or shipped.** [STRONG — CSSWG issue tracker queried directly]

The closest items: [#8651 `prefers-reduced-strobing`](https://github.com/w3c/csswg-drafts/issues/8651) (open, unresolved since March 2023 — a **photosensitive-epilepsy** feature, not an attention feature) and [#8546 a reader-view media query](https://github.com/w3c/csswg-drafts/issues/8546) (open, no traction). **No COGA-driven media query proposal exists.**

**WAI-Adapt / Personalization Semantics is a dead end.** [STRONG] The [hub page](https://www.w3.org/WAI/adapt/) is stamped "last updated 5 January 2023." Only the **Symbols Module** reached Candidate Recommendation Snapshot (5 Jan 2023), and it defines exactly **one attribute** — `adapt-symbol`, taking Blissymbolics concept numbers for AAC symbol substitution. Nothing to do with ADHD. Its exit criterion (two implementations) has not been met in ~3.7 years. The **Content Module** — where `data-simplification` lived — is still a Working Draft. **Zero browser support. Do not architect against it. You will have to invent your own preference mechanism.**

**Tailwind CSS v4** ships `motion-safe:`, `motion-reduce:`, `contrast-more:`, `contrast-less:`, `forced-colors:`, `not-forced-colors:`, `inverted-colors:`, `dark:`. **No variant for `prefers-reduced-transparency` or `prefers-reduced-data`** — roll your own with `@custom-variant`:

```css
@custom-variant reduce-transparency {
  @media (prefers-reduced-transparency: reduce) { @slot; }
}
```

### 2.5 UK Home Office "dos and don'ts" posters — there is no official ADHD poster

**Definitively verified via the GitHub API against the canonical repo README** — https://github.com/UKHomeOffice/posters

**The official set covers exactly seven access needs:** Anxiety · Autism (autistic spectrum) · D/deafness and hard of hearing · Dyslexia · Motor disabilities · Visually impaired (low vision) · Visually impaired (screen reader users).

**There is no ADHD poster, and no attention poster.** [STRONG — confirmed independently twice] Provenance: developed by Home Office Digital (lead: Karwai Pun), announced [2 September 2016 on the GOV.UK accessibility blog](https://accessibility.blog.gov.uk/2016/09/02/dos-and-donts-on-designing-for-accessibility/). HTML versions: https://ukhomeoffice.github.io/accessibility-posters/

Any "ADHD dos and don'ts poster" in Home Office visual style is a **derivative work**. The repo README explicitly invites adaptation under CC BY-NC-SA 4.0, requiring removal of the Home Office name and logo — and links examples (domestic-violence trauma, aphasia). So derivatives are sanctioned, but **they carry no official standing**. What actually happens in practice is worse than a labelled derivative: the **autism and anxiety posters get silently repurposed as ADHD guidance** in resource lists.

**Verbatim official text, so the divergence can be assessed properly:**

**Designing for users on the autistic spectrum**
| Do | Don't |
|---|---|
| Use simple colours | Don't use bright contrasting colours |
| Write in plain English | Don't use figures of speech and idioms |
| Use simple sentences and bullets | Don't create a wall of text |
| Make buttons descriptive | Don't make buttons vague and unpredictable |
| Build simple and consistent layouts | Don't build complex and cluttered layouts |

**Designing for users with anxiety**
| Do | Don't |
|---|---|
| Give users enough time to complete an action | Don't rush users or set impractical time limits |
| Explain what will happen after completing a service | Don't leave users confused about next steps or timeframes |
| Make important information clear | Don't leave users uncertain about the consequences of their actions |
| Give users the support they need to complete a service | Don't make support or help hard to access |
| Let users check their answers before they submit them | Don't leave users questioning what answers they gave |

**Designing for users with dyslexia** (abridged to the relevant rows)
| Do | Don't |
|---|---|
| Use images and diagrams to support text | Don't use large blocks of heavy text |
| Align text to the left and keep a consistent layout | Don't underline words, use italics or write in capitals |
| Consider producing materials in other formats | **Don't force users to remember things from previous pages — give reminders and prompts** |
| Keep content short and simple, make clear prompts | Don't rely on accurate spelling — use autocorrect or provide suggestions |
| Let users change the contrast between background and text | Don't put too much information in one place |

**Where ADHD guidance diverges from the autism poster** (my analysis, not sourced — but grounded in §1.5 and §3.4):

| Autism poster says | For ADHD |
|---|---|
| **Use simple colours / don't use bright contrasting colours** | **Directly counterproductive.** Colour is a salience mechanism, and prospective-memory performance in ADHD depends on cue salience and centrality (Costanzo 2021). Status colour, priority colour, and assignee colour are the cheap scanning affordances that make density work. **This is the sharpest divergence in the whole set.** |
| Build **simple** and consistent layouts | **Consistent: yes, emphatically** (§1.2, §3.3). **Simple, if it means "fewer things visible": no** (§3.1). Split the recommendation. |
| Use simple sentences and bullets / don't create a wall of text | **Converges.** ADHD developers reported skipping dense text entirely: *"when I do my research I kind of skip over a lot of stuff that may be helpful to me"* (P01). |
| Make buttons descriptive / don't make them vague | **Converges strongly**, and doubles as an argument against ambiguous flat affordances (§2.1). |
| Write in plain English / no idioms | **Orthogonal.** The autism rationale (literal interpretation) doesn't apply; the brevity benefit does. |

**The non-obvious finding: the anxiety and dyslexia posters are collectively much closer to ADHD needs than the autism poster is.** "Don't rush users or set impractical time limits," "don't leave users confused about next steps," "don't force users to remember things from previous pages — give reminders and prompts," "don't put too much information in one place," and "let users change the contrast" are all defensible for ADHD. **Designers reach for the autism poster and get the one set of recommendations that partly points the wrong way.**

### 2.6 Microsoft, Apple, Material — thin, and one I couldn't verify

**Microsoft Inclusive Design** — https://inclusive.microsoft.design/ · © Microsoft 2025, so maintained. There **is** a section titled **"Cognition and neurodiversity"**, containing **two videos**: *"How do you achieve focus?"* (described as *"A call to create systems that empathize with users and adjust the way they communicate"*) and *"Inclusive Design for Cognition"* (*"A call to create products that adapt to the many different ways we approach and achieve our goals"*). **No ADHD-specific content, and no downloadable cognition toolkit surfaced.** The consistent theme — *adapt* to the user rather than prescribe — is at least the right instinct and aligns with §1.1. [WEAK as actionable guidance; the framing is worth borrowing, the substance isn't there.]

**Apple HIG and Material Design 3 — I could not verify these.** Both sites are client-rendered single-page applications; the accessibility pages return only a title to a text fetcher, and Apple's DocC JSON endpoints did not resolve under any guessed path. **I am not going to characterise their cognitive guidance without having read it.** My prior expectation — based on the structure of both design systems — is that it is contrast/touch-target/screen-reader boilerplate with little on attention or memory, but **treat that as unverified.** Apple's `Reduce Motion` and `Reduce Transparency` platform settings are real and map to the CSS queries in §2.4; that much is documented elsewhere. If this matters, check `developer.apple.com/design/human-interface-guidelines/accessibility` and `m3.material.io/foundations/accessible-design` in a real browser.

### 2.7 One more standards document worth knowing

**WCAG-EM 2.0 (Website Accessibility Conformance Evaluation Methodology), W3C Group Note, 23 July 2026** — https://www.w3.org/TR/WCAG-EM/ (2.0 extends 1.0's website/page scope to apps and other digital products.) **It does not address cognitive accessibility.** It's a scoping/sampling/reporting procedure for WCAG conformance and adds no cognitive criteria. Its one relevant note: involving people with disabilities *"may help identify additional accessibility barriers that are not easily discovered by expert evaluation alone."* [STRONG as a conformance procedure; irrelevant as an ADHD measure.]

W3C **does** have procedural guidance on usability testing with people with cognitive disabilities ([draft](https://w3c.github.io/wai-coga/coga-draft/guide/overview/testing)) — easy-to-understand consent sent in advance, allow a support person, and notably *"ask the user to do an action that demonstrates usability, not just ask questions"*, plus watch for mood deterioration. Protocol advice, not a metric. [STRONG as protocol]

---

## 3. Conflicts, and How to Resolve Them

*This is the section with the most original synthesis, so I'll be explicit about what's evidence and what's my inference.*

### 3.1 Density vs. whitespace — density wins, with one precise qualification

**The orthodoxy** ("lots of whitespace, few elements per screen reduces cognitive load") is **[WEAK] as applied here.** The general claim that visual complexity increases processing demand is [MODERATE] and real. But the specific "whitespace improves comprehension" literature that circulates in design writing is largely practitioner assertion, and — critically — **it is about reading prose, not about operating a tool.** Reading and operating have opposite information-visibility requirements.

**There is one directly relevant controlled experiment, and it's better than I expected:**

> **Kasatskii, V., Sergeyuk, A., Serova, A., Titov, S. & Bryksin, T. (2023).** The Effect of Perceptual Load on Performance within IDE in People with ADHD Symptoms. *HCII 2023*, LNCS 14019:122–141.

*n* = 36 Python developers, ADHD symptoms measured with the **Barkley Deficits in Executive Functioning Scale (BDEFS-SF)**, within-subjects design, custom JetBrains plugin logging efficiency metrics. **Crucially, "perceptual load" was operationalised as the number of interactable panels: 2 (Low PLM, essentially Zen mode) vs 7 (High PLM).**

Results — **Low load won on speed**, for everyone:
- Coding (mentally active): time-to-first-character and overall speed both significantly better in Low PLM, **p = .005** for both
- Debugging (monotonous): total solution time **p = .035**, time-to-first-bug **p = .042**, both better in Low PLM

But the subgroup pattern is where the interesting result is:
- Self-organisation, self-restraint, and self-regulation-of-emotions difficulties → **more active** in Low PLM (p = .036, .022, .01)
- Time-management difficulties → speed benefit from **Low** PLM (p = .048)
- **Self-regulation-of-emotions difficulties, measured by time → benefit from *High* PLM (p = .03)**

The authors call their own findings *"somewhat controversial"* and attribute the split to executive-function clusters. Limitations they state: self-report symptoms, not diagnoses; small *n*; simplified tasks. [MODERATE]

**Background theory that explains why this isn't a slam dunk.** Lavie's perceptual load theory predicts the *opposite*: when perceptual load is high, capacity is exhausted and **distractors are not processed**, which should make focusing easier. The paper cites prior work finding that people with more severe ADHD symptoms *distracted less* under high task perceptual load, and neuroimaging work where patients with attention-related lesions stopped being distracted after even a small increase in load. So "more on screen" has a real theoretical case. This study found the empirical answer went the other way for *speed* in an IDE.

**The resolution — and this is the key distinction the whole debate is missing.** "Density" in the Linear sense and "perceptual load" in the Kasatskii sense are **different variables**:

| | What it is | Evidence | Verdict |
|---|---|---|---|
| **Information density** | More *task-relevant data per screen* — rows in a table, fields on a ticket, items in a list | Supports it, via the working-memory mechanism: visible ≠ held (§1.2), and hidden ≈ nonexistent (§1.9) | **Increase it** |
| **Perceptual/UI load** | More *interactive chrome* — panels, toolbars, badge locations, popovers, competing controls | Kasatskii: 7 panels worse than 2 on every significant metric | **Decrease it** |

**These are independently adjustable, and Linear's actual design does exactly this** — very high information density (compact rows, inline metadata, no card padding) with very low UI load (almost no persistent chrome, one command palette instead of toolbars, minimal panels). **The reason ADHD developers love Linear is not that it's dense; it's that it's dense *and* chrome-free.** That's the honest answer, and it's testable.

**Recommendation for Laminar Flow:**
1. **Keep the density.** Compact rows, inline metadata, information-rich tables. Every field visible on a row is a field that doesn't have to be held or navigated to. This is the working-memory mechanism, and it's the better-evidenced one.
2. **Attack UI load hard.** Target ≤2 persistent panels. One command palette instead of toolbars. One notification surface, not five badge locations (§1.5). Resist the temptation to add a right-hand properties panel *and* a left nav *and* a filter bar *and* a detail drawer.
3. **Use salience, not space, to create hierarchy.** Whitespace buys separation at the cost of visibility. Weight, colour, and alignment buy separation for free. This is also exactly where ADHD guidance diverges from the autism poster's "use simple colours" (§2.5).
4. **Make density a user setting with a compact default.** Comfortable/compact/dense row height. Two independent studies found no single layout that all ADHD participants preferred (Kasatskii's subgroup split; Zhu et al. 2025 below), and the ADHD IDE study found **divergent preferences within the same ADHD group** — *"some finding the amount on the screen overwhelming, while some felt the IDE was not displaying enough information."* [MODERATE]
5. **Prose is the exception.** In the TipTap document editor, apply WCAG 1.4.8's numbers: ≤80ch measure, generous leading, never justified (§2.2). Density serves scanning; it harms reading.

### 3.2 Progressive disclosure vs. object permanence — resolve it by separating *visibility* from *interactivity*

**The evidence base for progressive disclosure is weaker than its reputation.** Carroll & Rosson (1997) noted that no empirical evidence existed for its effectiveness; it remains largely case-study and practitioner experience. Documented failure modes are precisely the ADHD failure modes: **broken discoverability** (users don't realise more levels exist because expansion affordances are too discreet), **click fatigue**, and **expert workflow disruption** — *"power users often rely on scanning lots of controls quickly."* [WEAK for the technique; MODERATE for the documented failure modes]

Against it: the object-permanence mechanism (§1.9) is a working-memory consequence, and it's confirmed in the target population by peer-reviewed report (*"If I can't see it, I'm not going to remember it"*).

**The resolution: progressive disclosure fails for ADHD when it hides *existence*. It's fine when it defers *detail*.** These are separable, and the distinction is implementable:

**Acceptable — defer detail, preserve existence:**
- A collapsed section whose header states what's inside **and how much**: `▸ Acceptance Criteria (4)`. The user knows it exists, knows it's non-empty, knows roughly its size.
- Truncation with an explicit remainder: "3 of 12 comments — show all."
- A summary row that expands to a detail row in place (no navigation, no context loss).
- Advanced settings behind a labelled group in a settings page the user went to deliberately.

**Unacceptable — hides existence:**
- A bare chevron or "…" or "Details" with no content signal.
- Empty-state hiding: a section that vanishes entirely when empty, so the user never learns the feature exists.
- Collapse-by-default that resets on every visit. **Persist expansion state per user per document.** A user who expanded something expressed an intention; discarding it re-imposes the memory cost every session.
- Hover-only reveals. Nothing important should require hover to know it exists — and this is also a touch/keyboard failure.
- Menu-only commands. If the only path to an action is a nested menu, it doesn't exist for this user. **This is the strongest argument for the command palette**: it makes every command *findable by describing it* rather than *by remembering where it is* — which converts a recall task into a recognition task, and recognition is the intact capacity (§1.2). Ship a discoverable command palette and you can afford to hide much more chrome.
- Excluding archived items from default search (§1.9).

**Concrete rule I'd adopt: every collapsible region must communicate its type, its non-emptiness, and its magnitude in the collapsed state.** If it can't, don't collapse it.

### 3.3 Animation — the line is functional vs. decorative, and it maps to *transform* vs. *opacity*

**Both claims are true, and they aren't actually in conflict once you decompose "motion."**

For motion: TPGi/Vispero's practitioner review of the cognitive-disability impact of animation reports that **decorative animations impair recall and constitute extraneous cognitive load** [MODERATE — practitioner synthesis]. WCAG 2.2.2's Intent names *"those with attention deficit disorders"* directly (§2.2). And the ADHD developer studies found transient, moving UI was *missed entirely* (§1.5).

Against: motion aids continuity and spatial understanding. Coyier's cited counter-argument (§2.4): *"Animation can be a great tool to help combat some forms of cognitive disability by using it to break down complicated concepts, or communicate the relationship between seemingly disparate objects."* Val Head's research summary credits animation with reducing **change blindness** — which is exactly the "I lost my place" failure that WCAG 1.4.8's Intent describes. And the ADHD IDE study found layout instability was itself a memory cost: *"I have to bounce around and re-remember where everything is every couple of seconds."*

**The resolution — three tiers, and one of them is not negotiable:**

**Tier 1 — Keep, always, even under `prefers-reduced-motion`.** Motion that answers *"where did that thing go?"* Its function is to preserve spatial continuity, which directly serves the re-orientation cost. But implement it as **short, small, and non-transform-heavy**: 120–200ms, cross-fade plus minimal displacement rather than a long travel. Under reduced-motion, keep the fade and drop the displacement. Examples: a ticket moving between Kanban columns; a row leaving a filtered list; a panel opening.

**Tier 2 — Remove or make instant.** Decorative motion with no informational content: entrance animations, staggered list reveals, hover scale-ups, skeleton shimmer, parallax, easing flourishes on page transitions, spinners that spin for their own sake. These are pure extraneous load. **Don't ship them at all**, reduced-motion or not — the population that finds them costly is much larger than the population that has set the OS flag.

**Tier 3 — Ban outright regardless of preference.** Anything auto-starting, looping, in the periphery, or competing with reading. Ticking timers, pulsing badges, animated presence indicators, live-updating counts in the user's peripheral vision. This is WCAG 2.2.2 territory and it's the one place the standard names ADHD.

**And implement `prefers-reduced-motion` correctly** (§2.4): kill **transforms** — `scale`, long `translate`, parallax, rotation, peripheral horizontal movement. **Keep** opacity and colour transitions. **Never use the global nuke snippet** (`animation-duration: 0.01ms !important`) — the implementer who shipped the feature explicitly advises against it, and it breaks JS-driven animation by speeding it up. Tailwind's `motion-reduce:` and `motion-safe:` variants are the right mechanism.

**One more rule the evidence supports strongly and that isn't about animation at all: no layout shift, ever.** COGA Objective 4's first pattern is literally *"Ensure Controls and Content Don't Move Unexpectedly."* Reserve space for async content. Never let a loading toast, an inline validation message, or a lazily-arriving avatar reflow the page. For an ADHD user, an element that moves after they've located it costs them the whole locate operation again.

### 3.4 Autism-friendly vs. ADHD-friendly — real divergence, and it's modality-specific

The Home Office autism poster (§2.5) gives the divergence concretely. But the deepest divergence is about **stimulation**, and here I found a genuinely clean empirical answer that resolves a lot of confusion.

**Auditory extra-task stimulation *helps* ADHD and *hurts* neurotypicals.** [STRONG — meta-analytic]

> **Nigg, J.T., Bruton, A., Kozlowski, M.B., Johnstone, J.M. & Karalunas, S.L. (2024).** Systematic Review and Meta-Analysis: Do White Noise or Pink Noise Help With Task Performance in Youth With ADHD or With Elevated Attention Problems? *JAACAP*. [doi:10.1016/j.jaac.2023.12.014](https://doi.org/10.1016/j.jaac.2023.12.014) — *k* = 13, *N* = 335: **small but statistically significant benefit, *g* = 0.249** (95% CI 0.135–0.36).

Mechanism: the **Moderate Brain Arousal model** and stochastic resonance — **Söderlund, G., Sikström, S. & Smart, A. (2007).** Listen to the noise: noise is beneficial for cognitive performance in ADHD. *JCPP* 48(8). Found noise **improved** performance in the ADHD group and **deteriorated** it in controls. Replicated neurophysiologically: **Baijot, S. et al. (2016).** *Behavioral and Brain Functions* 12 — *"Noise exposure reduced omission rate in children with ADHD, who were no longer different from TDC."* And with music: **Madjar, N., Gazoli, R., Manor, I. & Shoval, G. (2020).** *Psychiatry Research* 291:113207 — reading comprehension *"significantly improved under the music conditions in ADHD group and deteriorated among TD."*

**Visual extra-task load *hurts* ADHD and does nothing to neurotypicals.** [MODERATE]

> **Berger, I. & Cassuto, H. (2014).** The effect of environmental distractors incorporation into a CPT on sustained attention and ADHD diagnosis among adolescents. *J Neuroscience Methods* 222. *n* = 133 ADHD, 43 non-ADHD: ADHD adolescents produced significantly more omission errors with pure visual distractors and with visual+auditory combined. **"Distracting stimuli had no effect on CPT performance of non-ADHD adolescents."** Plus Kasatskii et al. (§3.1) in the IDE.

**This asymmetry is the resolution to a lot of muddle.** "ADHD brains need stimulation" is *true* — in the auditory channel, with a small effect. It is *false* in the visual channel. So:

**Recommendations:**
1. **Never make the UI visually busier to "stimulate."** The visual evidence points the other way, and the auditory finding does not transfer.
2. **Don't steal the auditory channel.** No notification sounds by default; no autoplay audio ever. Your user is very likely wearing headphones playing something that is *measurably helping them*, and any sound you emit competes with a working intervention. (This is also WCAG 1.4.2 — see §2.2 — and it's the one place where that "boilerplate" criterion has real teeth here.)
3. **Where autism and ADHD genuinely diverge, and my recommendation for each:**

| Dimension | Autism-friendly | ADHD-friendly | Recommendation |
|---|---|---|---|
| **Colour / contrast** | Muted, simple, low contrast | **Salient, colour-coded, high contrast** (§1.5 cue salience) | **Follow ADHD; mitigate via `prefers-contrast` and a low-saturation theme option.** Salience is load-bearing for prospective memory; make it adjustable rather than absent. |
| **Predictability** | Critical | **Critical** | **Converges — take it seriously.** Spatial stability, shortcut stability, no layout shift. Highest-agreement item across both. |
| **Novelty / engagement** | Aversive | Motivationally useful (novelty is a reported ADHD strength: *"I like the novelty [..] always exploring"* — I1) | **Do not build novelty into the interface.** Put novelty in the *work*, not the chrome. A UI that changes to stay interesting violates the predictability requirement both groups share. This is the one place where "ADHD likes novelty" leads designers badly astray. |
| **Literal language** | Critical | Beneficial for brevity | **Converges.** Plain, short, unambiguous. |
| **Sensory stimulation** | Reduce, especially unexpected | Auditory: increase. Visual: reduce. | **Reduce visual for both; leave the auditory channel alone for both.** |
| **Ambiguity** | Intolerable | Costly (drives the self-blame loop, §1.8) | **Converges strongly.** Explicit state, explicit severity, explicit next action. |

**The practical upshot: autism-friendly and ADHD-friendly agree on far more than designers assume — predictability, plain language, unambiguous affordances, explicit state — and disagree meaningfully on exactly one axis: salience and colour.** That axis is solvable with a theme setting. Conflating the two conditions is a real error, but the fix is one preference, not two products.

### 3.5 Notifications — needed for prospective memory, harmful as interruption

**Both halves are well-evidenced.** Prospective memory genuinely fails (§1.5) and external cues genuinely help; interruption genuinely costs stress, frustration, and effort (§1.6, Mark et al. 2008).

**But the conflict largely dissolves once you separate three things people call "notification":**

| | Purpose | Correct form |
|---|---|---|
| **Ambient state** | "There are 3 things that need you" | Persistent, in-app, in the visual field of the work, low-frequency-of-change. **Not** a badge in a corner (§1.5 — the "unfocal" condition failed). |
| **Deferred cue** | "Remember to review this doc" | Queued and flushed at a subtask boundary. Bailey & Iqbal: **69% faster resumption, 18% less annoyance** when timed to boundaries vs. worst moments. |
| **Genuine interrupt** | "The build broke on main" | Immediate, but rare, and must be explicitly configurable. If everything is an interrupt, nothing is. |

**Recommendations:**
1. **Default to ambient, escalate to interrupt only on explicit user configuration.** COGA's own user need: *"I need to control when reminders are sent, the frequency and type of reminders so that I do not become distracted by too many reminders."*
2. **Queue non-urgent notifications and flush at task boundaries** — ticket saved, status changed, editor blurred, view switched, command palette closed. You already know when these happen; no ML required. This is the highest-leverage, most-evidenced notification decision available.
3. **Nothing appears while an editor has focus.** Ever.
4. **Kill toasts for anything actionable.** They are simultaneously peripheral, transient, and low-salience — the exact triple that failed in Costanzo et al., and independently reported as missed by ADHD developers (*"you've missed the little pop up window at the top that does everything"*). Anything requiring action must persist until dismissed or acted on. Toasts are acceptable only for confirmation of an action the user just took, where the information is redundant.
5. **One notification surface, not five.** Cap concurrent cue locations — four competing cues already degraded performance in the lab.
6. **Individual differences in interruption tolerance are measurable** (Mark et al. found openness and need-for-structure predicted disruption cost). Another argument for a user setting rather than a policy.
7. **Make resumption free, since you can't prevent interruption.** The "park this / resume this" state-capture feature from §1.6 is worth more than any notification-suppression scheme.

### 3.6 Gamification — my recommendation is don't, and I'll be specific about why

**The reward-sensitivity argument is real** (§1.5: reward eliminated the ADHD prospective-memory deficit, *p* = 1.0; §1.7: altered reinforcement sensitivity is established even if its mechanism isn't). So the premise isn't wrong.

**But the evidence for gamification in this context is absent, and the adjacent evidence is discouraging:**

1. **There is essentially no peer-reviewed literature on gamification for ADHD.** A targeted Europe PMC query for gamification + ADHD returned **zero hits**. Not thin — absent. [STRONG negative]
2. **The nearest well-tested relative failed decisively.** **Rapport, M.D., Orban, S.A., Kofler, M.J. & Friedman, L.M. (2013).** Do programs designed to train working memory, other executive functions, and attention benefit children with ADHD? A meta-analytic review. *Clinical Psychology Review* 33(8):1237–1252. 25 studies: training short-term memory improved short-term memory (*d* = 0.63) and **nothing else**. Training attention did not improve attention; training mixed EF did not improve the targeted EF (both CIs include zero). Far transfer to academics and blinded behaviour ratings: nonsignificant. Cognitive tests: *d* = 0.14. And **unblinded raters reported significantly larger benefits than blinded raters or objective tests — i.e. Hawthorne effects.** Conclusion: *"claims regarding the academic, behavioral, and cognitive benefits associated with extant cognitive training programs are unsupported in ADHD."* [STRONG]

   That last finding is the warning. The mechanism by which gamification appears to work is the same mechanism by which brain training appeared to work: **unblinded self-report improves while objective performance doesn't.** Your users will tell you the streak helps. That is not evidence that it does.
3. **The specific failure mode is documented in the RSD literature and it's severe.** If reward is the mechanism, *loss of reward* is punishment. Participants in Rowney-Smith et al. reported **delaying or not submitting work, and intentionally submitting substandard work**, in response to anticipated negative evaluation. **A broken streak on a work tool is an anticipated negative evaluation with a number attached.** For a population with emotion dysregulation at *g* = 1.17, that's a genuine product risk — the plausible outcome isn't reduced engagement, it's abandonment.
4. **Points economies distort prioritisation** in exactly the population that already struggles with it: they reward the countable (many small tickets) over the valuable (one hard one).

**Recommendation: build immediate, intrinsic, non-scored feedback. Do not build extrinsic scoring.**

| Do | Don't |
|---|---|
| Instant visual confirmation at the moment of action (optimistic UI as a reward mechanism) | Points, XP, levels, badges |
| Progress visible at the granularity of the work — the checkbox filling, the bar advancing | Streaks, or anything that can be *broken* |
| Satisfying completion moments — a ticket cleanly leaving the board | Leaderboards or any cross-user comparison |
| Make the *work* legible as progress: "4 of 7 acceptance criteria met" | Velocity scores or estimate-accuracy scores surfaced to anyone |
| Let users see their own history privately | Nudges, guilt notifications, "you haven't…" |

The distinction is: **feedback tells you what happened; scoring tells you what you're worth.** Reward sensitivity licenses the first. Nothing licenses the second.

---

## 4. Measurement — no validated instrument exists

**Say this plainly: there is no validated instrument or method for evaluating whether an interface is ADHD-friendly.** Not a weak one, not a proprietary one — none. No ADHD-specific questionnaire, no ADHD heuristic set, no ADHD cognitive-walkthrough variant, no validated objective protocol.

This was tested with independent bibliographic queries across Crossref and Europe PMC:

| Query | ADHD-relevant hits |
|---|---|
| NASA-TLX + ADHD + workload | 0 |
| NASA-TLX / NASA Task Load Index + ADHD (Europe PMC) | 2 — neither an instrument validation |
| ADHD + heuristic evaluation + usability + interface | 0 |
| Usability heuristics for attention-deficit users | 0 |
| System Usability Scale + ADHD participants | 0 |
| ADHD + design guidelines + web interface | 0 (all clinical/treatment) |

The tell: a **2026 HCII paper is still surveying candidate metrics** — Wąsik, A. (2026). *Measuring Cognitive Fit, Not Just Usability: Review of Metrics for Enhancing Cognitive Accessibility…* LNCS, HCII 2026, pp. 171–187. [doi:10.1007/978-3-032-29656-6_11](https://doi.org/10.1007/978-3-032-29656-6_11). Fields with a validated instrument don't publish reviews of candidate metrics. And W3C says the same about itself (COGA Gap Analysis: guidance *"is often vague and is not testable"*).

### What exists, and how far it gets you

**NASA-TLX** — Hart & Staveland (1988), *Human Mental Workload*, Advances in Psychology 52:139–183 ([doi](https://doi.org/10.1016/S0166-4115(08)62386-9)), ~10,500 citations. Six 21-point subscales: **Mental Demand, Physical Demand, Temporal Demand, Performance, Effort, Frustration.** [STRONG in general.] Notably, **Mark et al. (2008) used a modified TLX to get the interruption-cost numbers in §1.6** — so it does work in this domain.

Two structural problems nobody has addressed for ADHD: **Physical Demand** is near-meaningless for GUI work and dilutes the composite; and **Frustration is confounded** — if emotional dysregulation is intrinsic to ADHD (*g* = 1.17), an elevated Frustration score in an ADHD sample may reflect trait rather than interface, and there are **no ADHD norms to calibrate against.** [WEAK as repurposed.]

*Raw TLX (RTLX) debate, unresolved:* Hart's own 20-year retrospective treats RTLX as equivalent with less burden. Hertzum (2021, *Theoretical Issues in Ergonomics Science*, [doi](https://doi.org/10.1080/1463922X.2021.2000667)) argues RTLX is justified only when dimension importance is known to be roughly equal — while separately arguing the original pairwise weighting produces extreme weights that don't validly reflect stated preferences. So the weighting is arguably broken *and* dropping it is arguably unjustified. Said et al. (2020, *JMIR* 22(9):e19472) established RTLX criterion validity on 1,160 questionnaires — but explicitly caveat that it was a simulated environment and real workload "might differ."

**Other instruments:**

| Instrument | Origin | Verdict |
|---|---|---|
| **SEQ** (Single Ease Question) | Sauro & Dumas (2009), CHI. 7-point, per task. | [STRONG] generally — validated against completion rates, time, errors. Cheap, localises problems. Needs *n* ≥ 10–12. **No ADHD validation.** |
| **Leppink cognitive load scale** | Leppink et al. (2013), *Behavior Research Methods*, [doi](https://doi.org/10.3758/s13428-013-0334-1), ~850 citations; independently replicated. Intrinsic / extraneous / germane. | **Theoretically the best fit** — extraneous load *is* "load the interface added." [STRONG in-domain.] But items reference "instructions," "concepts," "formulas"; reword for UI and you've left the validation behind. Germane load is itself contested within CLT. |
| **Paas scale** | Paas (1992), *J. Educational Psychology* 84(4):429. Single 9-point mental-effort item. | [STRONG] in learning research, but unidimensional — can't separate interface fault from task fault. |
| **SMEQ / RSME** | Zijlstra (1993). 0–150 vertical, 9 anchors. | [MODERATE–STRONG] generally; rarely used. No ADHD validation. |
| **SUS** | Brooke (1996). 10 items, 0–100, mean 68 across ~500 studies. | **Largely the wrong instrument.** [STRONG] as a global benchmark, **[MYTH]** as a cognitive-load or accessibility measure. Correlates with task performance at only *r* ≈ .24 (~6% of variance), is explicitly non-diagnostic, is post-test so it can't localise problems. Zero ADHD studies found. Use for tracking, never for concluding. |

**Cognitive Walkthrough for the Web** is real — Blackmon, M.H., Polson, P.G., Kitajima, M. & Lewis, C. (2002), *CHI '02*, [doi:10.1145/503376.503459](https://doi.org/10.1145/503376.503459). Uses Latent Semantic Analysis to compute similarity between link labels and user goals, predicting navigation failures. [STRONG as a method.] **No ADHD or neurodiversity variant exists — nobody has proposed one.** Worth noting: CWW's actual mechanism — the cost of taking a wrong path because a label is semantically distant from the goal — is arguably *the most ADHD-relevant inspection method that exists*, because wrong-path exploration is where re-orientation and working-memory costs land. That's a genuine research opening. Calibration note: in one health-IS comparison, heuristic evaluation surfaced 104 unique problems vs cognitive walkthrough's 24 — CW is narrow by design.

**Objective measures — and the direction of evidence is discouraging:**

- **The one direct test found nothing.** Kimball, R. & Prabhu, R. (2026). Looking around: comparing eye-tracking metrics among designers with and without ADHD during convergent and divergent thinking tasks. *Design Science* 12:e14, [doi:10.1017/dsj.2026.10059](https://doi.org/10.1017/dsj.2026.10059). *n* = 24 (10 ADHD / 14 non-ADHD), Tobii Pro Glasses 3 @ 50 Hz; saccade frequency, mean fixation duration, pupil diameter (max, range, SD). **No significant differences on any metric between groups.** Task type drove all the variance; ADHD status drove none. [STRONG as a null result]
- **Pupillometry** is a solid general workload index — Bailey & Iqbal used it successfully to find subtask-boundary workload dips (§1.6). ADHD clinical literature reports greater pupil variability and reduced fixation stability, but as group tendencies in clinical paradigms, not as a UI protocol with thresholds.
- **EEG** adds little: in at least one direct comparison pupil diameter outperformed EEG for workload classification, and combining them did not improve accuracy.
- **Intra-individual reaction-time variability** is among the more robust ADHD group markers in cognitive psychology, but nobody has operationalised it into a UI evaluation protocol.

**Verdict: don't promise that instrumentation will reveal ADHD-specific interface effects. The one study that looked, didn't find them.**

### What to actually do — a defensible stack for a solo developer

Since nothing is validated, be explicit about that and combine cheap signals:

1. **Leppink extraneous-load subscale**, per task — the only instrument that isolates "load the interface added." Reword for UI; label it as unvalidated.
2. **SEQ**, per task — one question, cheap, well-validated generally, localises problems to specific tasks.
3. **Task-completion and error telemetry** — completion rate, time on task, backtrack/undo rate, abandonment rate. In a self-hosted tool you own this data. **Abandonment mid-task is your single best proxy** for the failure modes in §1.3 and §1.10.
4. **WCAG 2.2 conformance as the floor**, evaluated with WCAG-EM 2.0, plus COGA's objectives as an aspirational layer.
5. **Qualitative sessions with 8–12 ADHD participants, think-aloud.** This is the de facto standard in ASSETS/CHI and it's what you should actually spend your time on. Follow W3C's protocol advice (§2.7) — notably *"ask the user to do an action that demonstrates usability, not just ask questions."* Note from the IDE study that ADHD participants **rated the tool positively on Likert scales while describing serious struggles in think-aloud** — so weight observed behaviour over self-report, always.
6. **Report SUS only as a trend line**, if at all.

And take the Spiel et al. (CHI 2022) critique seriously: **only 12% of ADHD technology studies involve ADHD people as design stakeholders.** For a solo developer building for solo developers, recruiting 8–10 ADHD developers as ongoing design partners is both cheap and the single strongest methodological move available — and it substitutes for the instrument that doesn't exist.

---

## 5. Who to Trust

### Genuinely credible

**W3C COGA Task Force** — https://www.w3.org/WAI/about/groups/task-forces/coga/ — **the only standards-grade source in this space.** Facilitators **Julie Rawe** (Understood.org) and **Lisa Seeman-Horwitz**; staff contact Ruoxi Ran; 38 participants; active mailing list and GitHub; feeding WCAG 3 as of March 2026. Two caveats: *Making Content Usable* is a **Note — supplemental and non-normative**, and its patterns derive from personas and expert consensus rather than experiments, so individual patterns are often [MODERATE] even though the document carries [STRONG] institutional weight. **Lisa Seeman-Horwitz** is the single most citable practitioner-standards figure in cognitive accessibility. **Rachael Bradley Montgomery** is real and co-edited *Making Content Usable* but left COGA facilitation in March 2021 (she remains an AG WG chair).

**Russell Barkley** — genuinely elite (Google Scholar ~130,000 citations, h-index 154). Key paper: Barkley (1997), *Psychological Bulletin* 121(1):65–94. Drove the DESR construct and the 2023 renaming of "sluggish cognitive tempo" to **cognitive disengagement syndrome**. **But: fully retired since end-2021, and he has never published UI design guidance.** Also note substantial disclosed commercial interests (Guilford royalties, paid CE courses, historical pharma honoraria) — he is not a neutral clearinghouse. And his EF-deficit theory is contested, not consensus (Willcutt 2005, §1.1). His weakest claim is the widely-repeated "treatment could add 9–13 years of life expectancy" — Barkley & Fischer (2019), *J. Attention Disorders*, *n* = 131, life expectancy **estimated from a risk-factor calculator with no observed mortality**; the "add years by treating" inversion is an extrapolation the study can't support. **[WEAK]** Use O'Nions et al., *British Journal of Psychiatry*, 23 Jan 2025 instead (real mortality data, ~7–9 years).

**Peer-reviewed ADHD/HCI researchers actually doing this work:**
- **Katta Spiel** (TU Wien), **Rua M. Williams** (Purdue), **Eva Hornecker**, **Judith Good** — CHI 2022 critical review; the strongest critical-methodological voices in the field.
- **Grischa Liebel, Noah Langlois, Kiev Gama** — ICSE 2024; the only substantial study of ADHD *software engineers*. **Most directly relevant to this project of anyone on this list.**
- **Luke Halpin, Phillip Benachour, Tracy Hall, Ann-Marie Houghton, Emily Winter** (Lancaster) — ECTEL 2025 IDE think-aloud.
- **Vseslav Kasatskii, Agnia Sergeyuk, Anastasiia Serova, Sergey Titov, Timofey Bryksin** (JetBrains Research) — HCII 2023 perceptual load. Data published at github.com/JetBrains-Research/adhd-study.
- **Tobias Sonne** (Aarhus) — the most substantial single ADHD-HCI publication record (OzCHI 2016 design framework, CHI 2016, TEI 2016, IDC 2016, *Sleep Medicine* 2017). Children-focused.
- **Thomas Mildner, Jasmin Niess, Rainer Malaka**, **Evropi Stefanidi**, **Paweł Woźniak** — CHI 2025 dark patterns and ADHD.
- **Hanlin Zhu, Ruiqi Chen, Yuhang Zhao** — ASSETS 2025 FocusView.
- **Clinical/cognitive:** Michael Kofler (working memory), Edmund Sonuga-Barke (heterogeneity, delay aversion), Samuele Cortese and Ivo Marx (timing meta-analysis), Joel Nigg (noise meta-analysis), Göran Söderlund (MBA model), Gail Tripp and Jeff Wickens (reinforcement), Anselm Fuermaier and Oliver Tucha (prospective memory), Stephen Faraone and Philip Shaw (emotion dysregulation).

**WebAIM** — https://webaim.org/articles/cognitive/ (Utah State University). Explicitly covers ADHD. But **last updated 21 August 2020, no bibliography, no academic citations.** [MODERATE — credible institution, unsourced practitioner guidance, six years stale.]

**Stanford Neurodiversity Project** — real and active, now the **Stanford Center for Neurodiversity and Human Potential**, led by **Lawrence K. Fung, MD, PhD**. Does clinical services, employment programs (Corporate Membership, Empower to Employment), education, and strengths-based/neuroimaging research; more autism-centric than ADHD-centric. **Produces no design or UI guidance whatsoever.** [STRONG institutionally, **irrelevant for design**. If a blog claims Stanford publishes neurodivergent UI guidelines, that is fabricated.]

**Corrections to two names commonly cited in this context:** **Kirsten Ellis** (Monash) is a real, active accessibility researcher — but her work is intellectual disability, Deaf/HoH, sign language, and ethical usability testing with children, **not ADHD**. **Jennifer A. Rode** is real and substantial (feminist HCI, "Nothing About Us Without Us") but has **no ADHD or neurodiversity-specific publications**. Right researchers, wrong topic. **John Rochford** (UMass Chan, W3C COGA participant) is a credible advocate but not a substantial publishing researcher — essentially one HCI-journal item traceable.

### Looks authoritative, isn't

1. **"Web Standards Commission" — wsc.us.org — the worst offender found.** Name engineered to be mistaken for W3C. Self-describes as "an independent private advisory organization" and states outright **"WSC is NOT a government agency."** Address is a private mailbox (1319 F St NW Ste 301 **PMB** 174, Washington DC). Its cognitive-accessibility article (wsc.us.org/article/8) has **no author byline** (credited to a "Cognitive Accessibility Research Group"), **no date**, and asserts "15,000 users" and "45% higher task completion rates" with **zero citations, links, or methodology.** Fabricated authority. If anything traces here, cut it. **[avoid]**

2. **The Neurodiversity Design System (neurodiversity.design)** — **real, but it is one person's website, and the name is doing work the content hasn't earned.** Run solely by **Will Soward** (Lead Learning Experience & Media Designer, Tait Communications; self-identifies as dyslexic and ADHD). The about page says verbatim it is *"a developing body of work by me, Will Soward."* No institutional backing, funding, named contributors, peer review, or endorsement by any standards body. **Scope is much narrower than the name implies** — explicitly scoped to **Learning Management Systems**, framed on UDL; 8 principle areas (Numbers, Font, Typography, Colour, Buttons/Links/Inputs, Interface, Communications, Animations) and 9 learner personas. Sourcing is thin and not claim-level: the typography page gives specific numbers (body 1rem–1.25rem, line spacing 150–170%, +35% letter-spacing on small text) and its **entire bibliography is two items** — an NN/g serif-vs-sans article and the British Dyslexia Association style guide (itself unsourced practitioner consensus); the individual numeric recommendations carry **no citation at all**. No GitHub repo, so no commit history. **No last-updated signal anywhere** — sitemap.xml (28 URLs) has zero `<lastmod>` tags, no changelog, no version, and its own listed `/colophon/` page **returns HTTP 500**. Its visibility comes from designer word-of-mouth (Brad Frost, Prototypr, Smashing, Stéphanie Walter's list), not validation. **[WEAK] — useful as a source of hypotheses to test; not a citable basis for a decision.**

3. **Smashing Magazine — Vitaly Friedman, "Designing For Neurodiversity" (2 June 2025)** — the most consequential one, because Smashing *looks* authoritative to designers. Its complete source list: TetraLogical, Neurodiversity Design System, Stéphanie Walter's list, the GOV.UK posters, and **fourteen LinkedIn posts by Friedman himself. Zero peer-reviewed citations. Does not cite W3C COGA at all.** Self-citation to LinkedIn dressed as a design reference. **[WEAK]**

4. **uxdesign.cc (a Medium publication)** — hosts two of the four canonical "ADHD UX" reading-list items (Eva Katharina Wolf, "Software accessibility for users with ADHD"; "Building for ADHD will make your product better for everyone"). Medium-hosted, no peer review, no editorial standard. **[WEAK]**

5. **heynova.io — "Designing for people with ADHD" (Oct 2023)** — agency marketing blog. It *does* cite ~13 sources, but audit them: Mashable, WebMD, Psychology Today, The Guardian, PsychCentral, NYT. Those support the *prevalence framing*, not the *design claims*. **However**, most of its recommendations map cleanly onto real WCAG criteria. So: often-right advice, wrong provenance. **Cite WCAG, not Belyea. [WEAK provenance]**

6. **Nielsen Norman Group** — I checked their accessibility topic index directly: **no ADHD, neurodiversity, cognitive-disability, or cognitive-load articles.** Their genuinely useful contribution here is *measurement*, not ADHD — ["Beyond NPS: SUS, NASA-TLX, and the Single Ease Question"](https://www.nngroup.com/articles/measuring-perceived-usability/) correctly characterises all three and gives the SUS=68 benchmark. **[MODERATE on measurement, effectively absent on ADHD.]** Note that NN/g's authority is often borrowed to lend weight to ADHD claims it has never made.

7. **TetraLogical** — real London consultancy including **Léonie Watson** (a genuine W3C figure). But **their blog has no neurodiversity/ADHD/cognitive content**, despite being listed as a neurodiversity resource by Smashing. Real credibility, wrong subject.

8. **Stéphanie Walter's resource list** — honest, well-maintained, and it *does* link W3C COGA. But it's a **curated practitioner bibliography, not evidence** — and its four ADHD-specific recommendations are two Medium posts, one agency blog, and a YouTube talk. **[MODERATE as a map of the discourse, WEAK as evidence.]**

9. **The borrowed-authority pattern.** "Barkley says…" and "Stanford research shows…" are the two most common ways unsourced ADHD design claims enter the literature looking respectable. **Both entities are real and credible in their own domains; neither has ever published UI design guidance.**

10. **A DOI is not peer review.** Even Crossref surfaces SSRN/OSF preprints and "ResearchHub" entries that are LLM-generated stubs about ADHD trade books, with real DOIs (e.g. `10.55277/researchhub.*`).

11. **Deque and TPGi** — I could not verify their cognitive-accessibility content in this session (search pages 404'd). TPGi's ["The impact of motion animation on cognitive disability"](https://www.tpgi.com/the-impact-of-motion-animation-on-cognitive-disability/) exists and is cited in §3.3 via secondary summary — the page itself returned 403. **Treat as unverified rather than dismissed.**

---

## 6. What People Get Wrong

### Myths — commonly claimed, contradicted by evidence

**[MYTH] "It takes 23 minutes 15 seconds to refocus after an interruption."** Appears in **no published paper**. Traced to interviews with Gloria Mark and press quoting her; 9 of 23 blog posts misattribute it to papers where it doesn't appear. Mark et al. (2008) never mentions the number and contains no recovery-time analysis. Related published figures are 11–16 minutes. ([Full trace](https://blog.oberien.de/2023/11/05/23-minutes-15-seconds.html))

**[MYTH] "Interruptions make you slower."** Mark et al. (2008) found interrupted tasks were completed **faster** with no quality difference. The cost is stress, frustration, time pressure, and effort — all significant. Getting this backwards leads to over-blocking when the right intervention is cheap resumption.

**[MYTH] "ADHD is a dopamine deficiency."** MacDonald et al. (2024): *"limited evidence for a hypo-dopaminergic state per se."* Neuroimaging is contradictory; core dopamine genes don't rank among major ADHD GWAS risk genes; people with actual dopamine deficiency present with motor symptoms, not ADHD. The apparent DAT elevation is confounded by prior stimulant exposure. The credible version is much narrower (dopamine transfer deficit, §1.7) and doesn't license "give them dopamine hits."

**[MYTH] "Object permanence" is an ADHD symptom.** It's a Piagetian infant milestone and appears in no ADHD diagnostic literature. The phenomenon is real; the term is borrowed and wrong. (Design implication unaffected — see §1.9.)

**[MYTH] "Miller's 7±2 is the working-memory limit, so show 5–9 items."** Cowan: 3–5 chunks, and Miller's figure conflated storage with processing. **But this whole framing is wrong for ADHD anyway** — the ADHD deficit is in manipulation, not storage (Kofler 2020: phonological STM *d* = 0.28, essentially intact). "Show fewer items" targets the wrong system. See §1.2.

**[MYTH] "There is an ADHD-friendly font, or an ADHD-optimal layout."** On fonts: **Kuster et al. (2018)**, *Annals of Dyslexia* — *n* = 170 and *n* = 147, "Dyslexie" font produced **no faster or more accurate reading**, and the majority **preferred Arial**. **Wery & Diliberto (2017)**, *Annals of Dyslexia* — OpenDyslexic showed **no improvement in reading rate or accuracy**, and **no participant preferred it**. **Marinus et al. (2016)**, *Dyslexia* — found a 7% benefit, but attributable to the font's **larger spacing settings, not its letterforms.** So the mechanism is spacing (which is WCAG 1.4.12 and 1.4.8, §2.2), not typeface. On layouts: **Zhu et al. (ASSETS 2025)** — *"All participants changed their preferred layout for different videos, and no single layout was consistently selected by all participants for any video type."* Plus Kasatskii's subgroup split and the divergent density preferences within Halpin's ADHD cohort. **Heterogeneity is the finding.**

**[MYTH] "ADHD users are uniquely vulnerable to dark patterns."** Mildner et al. (CHI 2025, *n* = 135): low recognition overall with **no significant group difference**, and ADHD participants avoided *some* dark patterns more often.

**[MYTH] "Instrumentation (eye tracking, EEG) will reveal ADHD-specific interface effects."** The one direct test in a design task — Kimball & Prabhu (2026), *Design Science* — found **no significant differences on any metric** between ADHD and non-ADHD groups. Task type drove all variance.

**[MYTH] "WCAG 3 uses Bronze/Silver/Gold."** Dropped. As of the 3 March 2026 Working Draft the conformance model is **undefined** and unnamed.

**[MYTH] "SC 2.4.11 is Focus Appearance."** 2.4.11 is **Focus Not Obscured (Minimum)**, AA. Focus Appearance is **2.4.13**, AAA.

**[MYTH] "`prefers-reduced-motion` means remove all motion,"** and the global nuke snippet as best practice. The implementer who shipped the feature explicitly advises against it; it overshoots the stated preference and can *speed up* JS-driven animation.

**[MYTH] "Brain training / cognitive training helps ADHD."** Rapport et al. (2013) meta-analysis, 25 studies: no significant improvement in attention or targeted executive functions, negligible far transfer (*d* = 0.14 on cognitive tests), and unblinded raters reported significantly larger benefits than objective measures — i.e. **Hawthorne effects.** Relevant here because it's the same measurement trap gamification will fall into.

**[MYTH, strong-but-unconfirmed] The "8-second attention span."** The most load-bearing unsourced number in this space. It traces to a 2015 Microsoft Canada consumer report attributing it to "Statistic Brain," a site with no published methodology; the goldfish comparison has no traceable primary source, and Wikipedia's *Attention span* article doesn't carry the claim at all. *(Flagged as not fully verified — the primary debunk sources were unreachable. But any ADHD design doc citing this number should be considered unreliable throughout.)*

### Weak claims that circulate as fact

**[WEAK] "ADHD needs a calm, minimal, low-stimulation interface."** Half-right in the wrong direction. Extra *visual* load does hurt (Berger & Cassuto 2014; Kasatskii 2023) — but that's about *UI chrome*, not information density, and reducing information density works against the working-memory and object-permanence mechanisms. Extra *auditory* stimulation measurably **helps** (*g* = 0.249, meta-analytic). "Calm-looking" is a visual-aesthetic goal that the evidence doesn't support; **"chrome-free but information-dense"** is what it actually supports.

**[WEAK] "Progressive disclosure reduces overwhelm."** Carroll & Rosson (1997) noted no empirical evidence for its effectiveness, and that hasn't materially changed. Documented failure modes — broken discoverability, click fatigue, expert-workflow disruption — are precisely the ADHD failure modes.

**[WEAK] "ADHD brains crave novelty, so make the interface engaging."** Novelty-seeking is real and appears as a reported strength. But applying it to the *interface* violates the spatial-stability requirement that the evidence does support. Put novelty in the work, not the chrome.

**[WEAK] "Rejection Sensitive Dysphoria" as a distinct ADHD-specific clinical entity.** Not in DSM-5-TR, popularised through lectures rather than peer review, **no validated measure**, and only five qualitative studies (*n* = 4–43). The design implications hold — but derive them from **emotional dysregulation** (*g* = 1.17, meta-analytic) and from **rejection sensitivity** (a well-studied general trait), not from RSD.

**[WEAK] "Hyperfocus is an ADHD superpower / an ADHD-specific phenomenon."** No consensus operational definition; the authoritative review calls the evidence that ADHD individuals hyperfocus more **"mixed"** and argues hyperfocus and flow are synonymous — which would make it not ADHD-specific at all. The widely-cited "68% report frequent hyperfocus" comes from a conference abstract (*n* = 50).

**[WEAK] "Implementation intentions make you 8× more likely to follow through" (in ADHD).** The technique is well-evidenced generally; that specific multiplier is untraceable to any ADHD study.

**[WEAK] "Attention residue costs 30–40% performance."** Leroy's construct is real and the paper is solid, but that specific figure I could not verify against the paper.

**[WEAK] Barkley's "treating ADHD adds 9–13 years of life."** *n* = 131, life expectancy *estimated from a calculator*, no observed mortality. "ADHD is associated with reduced life expectancy" is [STRONG] (O'Nions et al. 2025, ~7–9 years, real mortality data); the specific figure and the causal inversion are not.

**[WEAK] "The UK Home Office has an ADHD accessibility poster."** It does not. Seven conditions, no ADHD, no attention. Verified against the canonical repo. And the autism poster — the one most often silently repurposed — contains the single recommendation most likely to point ADHD design the wrong way ("use simple colours / don't use bright contrasting colours").

---

## Coverage gaps and caveats

**What I could not verify:**
1. **Apple HIG and Material Design 3 cognitive-accessibility content.** Both are client-rendered SPAs; the pages return only a title to a text fetcher and Apple's DocC JSON endpoints didn't resolve. I declined to characterise guidance I hadn't read. My expectation is that both are contrast/touch-target boilerplate, but that is **unverified**. Check in a browser if it matters.
2. **The verbatim current §12.1 text of `prefers-reduced-motion`** in Media Queries 5 — both the TR and editor's draft truncate before §12 in a text fetcher. CSSWG #5594 is closed-accepted toward the vestibular framing and MDN's prose is consistent with that, but don't quote the spec directly without re-checking.
3. **Whether the 12 Dec 2024 WCAG 2.2 republication was editorial or substantive.** The header date is verified; the changelog isn't.
4. **TPGi's motion/cognitive-disability article** (403) and several ACM DL and Taylor & Francis pages (403) — cited via secondary summary where used, and flagged.
5. **The 8-second attention span origin** — my account of the Microsoft-Canada/Statistic Brain provenance is strong but the primary debunk sources were unreachable.

**Methodological note:** the session's WebSearch budget (200 calls) was exhausted partway through. The second half of this research ran on direct WebFetch plus the **Europe PMC REST API**, **Crossref**, **DBLP**, and the **GitHub API** — which is why the citations here are unusually precise (full text was extracted from PDFs locally rather than relying on search snippets). Two independent research streams reached the same conclusions on the Home Office poster set and on COGA leadership, which is reassuring. One caution: an intermediate summarisation pass on the Halpin et al. PDF produced plausible-sounding participant quotes that **do not appear in the paper**; every quotation in this report was verified against extracted full text, and I'd advise the same discipline on anything downstream.agentId: a4ec5ea9cddd85d45 (use SendMessage with to: 'a4ec5ea9cddd85d45', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 303769
tool_uses: 125
duration_ms: 1842100</usage>