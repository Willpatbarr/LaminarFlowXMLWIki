# <span style="color:#2AB8C9">LAM-41 — Split the Backend CI So Day-to-Day Pushes Don't Build the Frontend</span>

## Notes

Move the `image` job out of `ci.yml` into a new `release.yml` that runs on tags,
on manual dispatch with a `frontend_ref` input, and on pull requests that touch
the Dockerfile. `ci.yml` keeps the `check` job and nothing else. ADR-2 stands —
one image, one embedded bundle, one named build context.

[LAM-41](https://linear.app/willieworkspace/issue/LAM-41/split-the-backend-ci-so-day-to-day-pushes-dont-build-the-frontend)
lists five things to do:

| Ticket step | Where |
| --- | --- |
| 1. Split into two workflows | Steps 2 and 3 |
| 2. Trigger `release.yml` on tags and `workflow_dispatch` | 2.1 and 2.3 |
| 3. Replace `FRONTEND_REF` with a dispatch input | 2.3 and 2.5 |
| 4. Also build when the Dockerfile changes | 2.2 — as `pull_request`, see below |
| 5. Update `COMMANDS.md` / `docs/deploy.md` | Step 4 |

**Precondition — `LAM-41-B` is cut from the wrong commit.** The branch sits on
`main` (`032f8d5`), but `E-LAM-0002-B` is one merge ahead: LAM-6 landed there as
`78d10b1` and already edited `ci.yml`. Step 1 fast-forwards `LAM-41-B` onto the
epic. Every line number below is the epic's `ci.yml`, which is 173 lines.

Deviations and omissions, flagged rather than fixed:

- **Ticket step 4 asks for a `push` trigger; `release.yml` filters
  `pull_request` instead.** GitHub ANDs the tag filter and the path filter
  inside one `push:` block, so a `v1.0` tag carrying no Dockerfile change would
  match `tags` and fail `paths` — the release trigger would never fire. An `on:`
  block takes each event once, so `push:` cannot hold both shapes. Every
  Dockerfile change so far has reached `main` through a PR, so filtering
  `pull_request` on the same paths catches the same breakage a merge earlier.
- **Neither `COMMANDS.md` nor `docs/deploy.md` described the trigger behaviour**,
  so ticket step 5's conditional is empty. Step 4 adds the sections instead —
  `release.yml` is the only way to build the image on a machine that is not the
  developer's, and nothing said so.
- **The PR-triggered run still builds both architectures.** A Dockerfile PR pays
  the full amd64 + arm64 build. Trimming the PR run to amd64 would make the
  review-time check weaker than the release build, which is the gap this ticket
  exists to close.
- **No frontend change.** LAM-41 touches workflow files in
  `LaminarFlow-Backend` only. `LAM-41-F` exists but stays empty.

---

## Outline

<small>

- Step 1 — Recut `LAM-41-B` from the epic branch
- Step 2 — Write `release.yml`
- Step 3 — Trim `ci.yml` to the check job
- Step 4 — Document the release trigger
- Step 5 — Push and verify

</small>

---

## Step 1 — Recut `LAM-41-B` from the epic branch

### <span style="color:#A16BD9">1.1 · RUN — Switch the `gh` Account</span>
LaminarFlow pushes as `Willpatbarr`, not the work account

```bash
gh auth switch --user Willpatbarr
```

### <span style="color:#A16BD9">1.2 · RUN — Fast-Forward `LAM-41-B` onto `E-LAM-0002-B`</span>
`--ff-only` fails loudly rather than merging, and `LAM-41-B` carries no commits yet

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend
git fetch origin
git checkout LAM-41-B
git merge --ff-only origin/E-LAM-0002-B
```

- without this, `ci.yml` is LAM-6's predecessor: `FRONTEND_REF: E-LAM-0001-F`,
  one line longer, and every line number in Steps 2 and 3 is off by one

---

## Step 2 — Write `release.yml`

<span style="color:#2E93DB">NEW GUIDED</span>

**EXPLAIN**

**Example** — `.github/workflows/ci.yml:50-173`
the `image` job `release.yml` takes over, unchanged from `:74` down

`LaminarFlow-Backend/.github/workflows/release.yml (new)`

### <span style="color:#2E93DB">2.1 — Name the Workflow and Trigger on Tags</span>
```yaml
name: Release image

on:
  push:
    tags:
      - 'v*'
```

- **New here:**
  - `on.push.tags` — the run happens for tag pushes matching the glob and for no
    branch push at all, which is the whole point of the split
  - `'v*'` — matches `v1`, `v0.2.0`; a tag name, never a branch name

### <span style="color:#2E93DB">2.2 — Add the Dockerfile Path Trigger</span>
```yaml
  # A Dockerfile change reaches main through a PR, so a build that no longer
  # works fails at review time rather than on a release evening.
  pull_request:
    paths:
      - Dockerfile
      - .dockerignore
      - scripts/build-image.sh
      - .github/workflows/release.yml
```

- **New here:**
  - `paths` — the run happens only when the pull request touches one of the
    listed files; everything else in the repo is ignored by this workflow
  - `.github/workflows/release.yml` in the list — the PR that adds
    `release.yml` therefore builds the image once, which is the only way to
    exercise the new workflow before it merges

### <span style="color:#2E93DB">2.3 — Add the `frontend_ref` Dispatch Input</span>
```yaml
  workflow_dispatch:
    inputs:
      frontend_ref:
        description: Frontend ref to build the bundle from
        default: main
        required: false
```

- **New here:**
  - `workflow_dispatch` — the manual "Run workflow" trigger; `inputs` are the
    fields GitHub prompts for before starting the run
  - `default: main` — filled in for dispatch runs only, so tag and pull request
    runs need the fallback 2.5 writes

### <span style="color:#2E93DB">2.4 — Open the `image` Job</span>
```yaml
jobs:
  # Builds the shipped image for both architectures - the only check that
  # exercises the Dockerfile, the named build context, and the version
  # arguments together.
  image:
    runs-on: ubuntu-latest

    steps:
```

- the `env:` block that held `FRONTEND_REF` does not come across; 2.5 replaces it

### <span style="color:#2E93DB">2.5 — Check Out Both Repos</span>
```yaml
      - uses: actions/checkout@v7
        with:
          path: backend

      # Both repos are public, so the default token is enough - no PAT needed.
      - uses: actions/checkout@v7
        with:
          repository: Willpatbarr/LaminarFlow-Frontend
          ref: ${{ github.event.inputs.frontend_ref || 'main' }}
          path: frontend
```

- **New here:**
  - `github.event.inputs.frontend_ref` — null on a tag or pull request run, so
    `|| 'main'` is the ref those runs build against
  - `path: backend` / `path: frontend` — two checkouts into sibling directories,
    which is what lets the build read the frontend as a named context

### <span style="color:#2E93DB">2.6 — Copy the Remaining Steps from `ci.yml`</span>

Copy `.github/workflows/ci.yml:74-173` verbatim, opening at
`- uses: docker/setup-buildx-action@v3` and closing on the smoke test's last
`echo` line. That range is buildx setup, the version resolution, the two image
builds, and the container smoke test.

- indentation already matches — the `image` job sits at the same depth in both
  files, so the copied range needs no reflowing
- nothing in that range reads `FRONTEND_REF`; the two checkouts 2.5 replaced
  were its only readers

---

## Step 3 — Trim `ci.yml` to the check job

### <span style="color:#D98C3B">3.1 · EDIT — Delete the `image` Job</span>
`.github/workflows/ci.yml:49-173`
`ci.yml` now ends at the check job's last step

```diff
       - name: Run checks
         run: ./scripts/test.sh
         ...
-
-  # Builds the shipped image for both architectures. This is the only check that
-  # exercises the Dockerfile, the named build context, and the version arguments
-  # together - so a Dockerfile that no longer builds fails here rather than on a
-  # deploy evening.
-  image:
```

- the deletion runs to `:173`, the end of the file — `:74-173` is what 2.6
  copied, and `:50-73` is the job header 2.4 and 2.5 rewrote
- `ci.yml:3-5` keeps its bare `push:` / `pull_request:` block: `scripts/test.sh`
  is cheap and frontend-free, so a path filter there would only let `check` be
  skipped
- **Why:**
  - **B** — ticket step 1: `ci.yml` keeps `check` on every push and PR
  - **C** — `on:` filters are workflow-wide, so the only way to stop the image
    build running on a Go-only commit is to move it out of this file

---

## Step 4 — Document the release trigger

### <span style="color:#3DAF62">4.1 · ADD — Add a `Building in CI` Section to `deploy.md`</span>
`docs/deploy.md:44`
after the local build guidance, before `## Moving the image to a host without a registry`

```markdown
### Building in CI

`.github/workflows/release.yml` builds the image on a `v*` tag, on a pull
request touching the Dockerfile or `scripts/build-image.sh`, and on demand from
the Actions tab. A manual run takes a `frontend_ref` input — the frontend branch
or tag the bundle is built from, defaulting to `main`. `ci.yml` runs the Go
checks and never builds an image.
```

- **Why:**
  - **B** — ticket step 5; `docs/deploy.md` is the only document that describes
    how the shipped artifact is produced

### <span style="color:#3DAF62">4.2 · ADD — Add the Dispatch Command to `COMMANDS.md`</span>
`COMMANDS.md:95`
after `## Build the container image`, before `## Run the deployed stack`

```markdown
## Build the image in CI, against a chosen frontend ref

Runs `release.yml` on GitHub. Omitting `-f` builds against the frontend's `main`.

    gh workflow run release.yml -f frontend_ref=main
    gh workflow run release.yml -f frontend_ref=v0.2.0
```

---

## Step 5 — Push and verify

### <span style="color:#A16BD9">5.1 · RUN — Parse Both Workflow Files</span>
a YAML error in `release.yml` would otherwise surface only after a push

```bash
cd ~/Developer/LaminarFlow/LaminarFlow-Backend
python3 - <<'PY'
import yaml
for f in ("ci.yml", "release.yml"):
    d = yaml.safe_load(open(f".github/workflows/{f}"))
    print(f, "jobs:", list(d["jobs"]), "triggers:", list(d[True]))
PY
```

- expected: `ci.yml` has one job and two triggers, `release.yml` has one job and
  three — `push`, `pull_request`, `workflow_dispatch`
- `d[True]` — YAML 1.1 reads an unquoted `on` as the boolean `True`, so the
  trigger block is not under the string key `"on"`

### <span style="color:#A16BD9">5.2 · RUN — Push and Open the PR</span>
the PR base is the epic branch, not `main`

```bash
git add -A && git commit -m "LAM-41 - split the image build into release.yml"
git push -u origin LAM-41-B
gh pr create --base E-LAM-0002-B --fill
```

### <span style="color:#A16BD9">5.3 · RUN — Watch Both Workflows</span>
the PR touches `release.yml`, which 2.2 put in the path list, so both run once here

```bash
gh run list --branch LAM-41-B --limit 5
gh run watch
```

- `CI` should now list `check` alone, and `Release image` should appear as a
  second run — appearing at all is the proof the path filter in 2.2 matches

### <span style="color:#A16BD9">5.4 · RUN — Dispatch a Release Build After the Merge</span>
`workflow_dispatch` is only offered once `release.yml` reaches the default branch

```bash
gh workflow run release.yml -f frontend_ref=main
gh run watch
```

- run before the merge, `gh workflow run` fails with a 422 saying the workflow
  has no `workflow_dispatch` trigger — expected, not a mistake in Step 2

### <span style="color:#A16BD9">5.5 · RUN — Switch the `gh` Account Back</span>
LaminarFlow is the only thing that pushes as `Willpatbarr`

```bash
gh auth switch --user willbarr_church
```
