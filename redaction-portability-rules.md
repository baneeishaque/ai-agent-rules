---
name: Redaction & Portability Rules
description: Public-vs-organization-private repository scope tiers, asymmetric inter-repo
    linking rules, three sensitivity tiers (identity / topology / public), canonical
    placeholder vocabulary, and prohibited behaviors that keep every produced artifact
    safe to publish and portable across machines.
category: Security-Standards
---

# Redaction & Portability Rules

> ## ⛔ BLOCKING — Run This 3-Question Test Before Writing ANY of the Following
>
> - A markdown link with `../` that escapes the current file's enclosing repo (`[label](../../../../<other-repo>/...)`)
> - A literal organization name, internal codename, internal product name, or internal hostname in prose
> - A cross-repo "(see related skill in `<other-repo>`)" parenthetical
>
> **Test (all three MUST be YES):**
>
> 1. Are BOTH link endpoints in the SAME Git repository — OR in a parent + `.gitmodules`-registered-submodule pair (per §1.2)?
> 2. Would the link still resolve if a stranger cloned ONLY the host repo into a fresh empty directory? (Multi-root VS Code workspaces, sibling folders on the author's disk, and "I have both repos checked out" do NOT count — see §1.0 Independence Axiom.)
> 3. Does the link text + surrounding prose reveal NOTHING about an org-private repo's existence, name, codename, or internal toolchain that a public reader wouldn't already know?
>
> Any NO → the link/mention is FORBIDDEN. The repair is in §1.3 (asymmetric linking) — name-only references for outbound, generic-prose-only for public→private direction.
>
> *Anti-pattern (real audit finding):* a public-scope skill linked `../../../<corp>_ai_agents/.agents/skills/...` because both folders happened to be open in the author's multi-root VS Code workspace. This violated all three tests simultaneously: (1) different repos, (2) layout-dependent, (3) leaked the existence + name of an org-private skill library into the public artifact. The skill was repaired by deleting the cross-repo links entirely; the org-private side now references the public skill by name only.

This rules file is the **rules-side SSOT** mirror of the `redaction-portability` skill
(in the public `ai-agents` repo). The skill is the executable / operational form; this
file is the normative rule form referenced from
[`ai-rule-standardization-rules.md`](ai-rule-standardization-rules.md) and from every other
rule that produces a publishable artifact. The skill is referenced by name only — never by
relative path — because the public `ai-agents` repo and this submodule are independent
Git repositories per §1.0.

When the two SSOTs diverge, the **skill is authoritative** — update it first, then mirror
the change here. The two MUST be kept in lock-step because:

- Agents reading rules files (via `ai-agent-rules/`) discover the rule.
- Agents reading skill files (via `.agents/skills/`) discover the executable protocol.

***

## 1. Repository Scope Tiers (Cardinal)

### 1.0 The Independence Axiom (read this first)

The two repos in scope (`ai-agents` — public; `<corp>_ai_agents` — org-private) are
**independent Git repositories**. They are NOT a monorepo and NOT siblings in any
guaranteed filesystem layout. Each has:

- a **separate clone URL** (different `git remote`);
- a **separate publication lifecycle** (public repo pushes to a public host; the
  org-private repo pushes to an internal host the public consumer cannot reach);
- a **separate existence** (a developer may legitimately clone either one
  *standalone*, without the other);
- a **separate, arbitrary filesystem location** chosen at clone time by each developer
  — they may live on different drives, on different machines, under unrelated parent
  folders, or only one of them may be present at all. The two independent repos have
  **no defined relative position** to each other.

The last point has a sharp consequence: a relative path written from one independent
repo into another is not "wrong with too many or too few `../` segments" — it is
**categorically meaningless**, because the thing it would have to refer to (a stable
relative position between the two repos) **does not exist**. No amount of fiddling
with the depth makes such a path correct. Any committed file that contains one is
broken on every clone except the original author's.

**Submodule sub-case (a deterministic intra-distribution carve-out).** A parent repo
MAY embed another repo as a Git submodule registered in the parent's `.gitmodules`
(e.g., the `ai-agents` parent registers `ai-agent-rules` at `<parent>/ai-agent-rules/`).
The registered mount path is deterministic because `.gitmodules` is itself a tracked,
versioned file in the parent — every commit of the parent pins both the submodule's
clone URL and its mount path. Together the parent + its registered submodules form a
single **Distribution Unit**: the project's documented clone recipe is
`git clone --recurse-submodules <parent-url>`, and a developer following that recipe
obtains the full unit at the deterministic layout.

Consequently:

- **Parent ↔ registered-submodule relative paths are ALLOWED** (in either direction)
  when they traverse the `.gitmodules`-pinned mount point. They are intra-distribution
  paths, not inter-repo escapes. Example (legal): a parent skill at
  `.agents/skills/<skill>/SKILL.md` linking to
  `../../../ai-agent-rules/<rule>.md`.
- **Standalone-Clone Test is evaluated against the Distribution Unit**, not the
  enclosing worktree alone. The reference clone is
  `git clone --recurse-submodules <parent-url>`, which is the project's documented
  recipe. Links that resolve in that recipe pass the test.
- **Standalone-clone of the submodule by itself remains supported** (the submodule
  has its own clone URL), but in that mode the submodule is consumed *outside* its
  distribution unit. A developer who deliberately clones only the submodule accepts
  that links pointing into the parent will not resolve — same way a developer who
  clones only one repo of any multi-repo project accepts the limits of partial
  consumption. The submodule's own README SHOULD note its primary consumption is via
  the parent.

What remains **categorically forbidden** even after this carve-out:

- Links between two **independent repos that are NOT in a parent/submodule
  relationship** registered in either's `.gitmodules` — e.g.,
  `ai-agents` ↔ `<corp>_ai_agents` (sibling distributions, no `.gitmodules`
  registration linking them). These have NO defined relative position; §1.0's
  categorical-meaninglessness argument applies in full.
- Links from a parent into an **unregistered** sibling folder that just happens to
  live next to it on the author's disk (the "multi-root VS Code workspace" trap).
  Without `.gitmodules` registration there is no Distribution Unit, no deterministic
  mount, no project-recipe clone — just the author's local accident.
- All Tier-leak prohibitions (link text leaking org names, etc.) apply unchanged
  regardless of repo topology.

The agent's audit therefore distinguishes two cases for any `../` that escapes the
enclosing worktree's root: (a) does it land inside a sibling registered in the
nearest enclosing `.gitmodules`? → ALLOWED (intra-distribution); (b) anywhere else?
→ FORBIDDEN (inter-distribution escape).

From this single axiom every other rule in §1 follows. The operational test the agent
MUST apply to every committed artifact is:

> **Standalone-Clone Test (Distribution-Unit form).** *"If I run the project's
> documented clone recipe — typically `git clone --recurse-submodules <parent-url>`
> for a parent+submodules unit, or `git clone <url>` for a standalone repo — into a
> fresh empty directory on a machine that has never heard of any UNREGISTERED
> sibling repo, does every relative link in this file still resolve, and does every
> prose reference still make sense?"*
>
> If the answer is **no** for either half, the file violates portability and MUST be
> repaired before commit. "Portability" in this rule set is defined as **passing the
> standalone-clone test**, nothing more, nothing less.

Multi-root VS Code workspaces, sibling-folder conventions, parent-of-child checkouts,
and "well, on my machine both repos happen to be under `<workspace-root>/`" are all
**inadmissible defences**. They are the author's local accident, not a property of
the published artifact.

### 1.1 Scope Tier Matrix

Every workspace folder is in exactly **one** of three publication-scope tiers, and the
tier governs what string content is allowed in committed artifacts of THAT folder:

| Scope tier      | Examples                                       | Allowed string content                                                                                |
| :-------------- | :--------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Public**      | `ai-agents` (general skill library, GitHub public) | Tier C only (universal open-source identifiers). Tier A + B MUST be redacted to placeholders.        |
| **Org-private** | `<corp>_ai_agents` (e.g., `acme_ai_agents`)    | Tier A still redacted; Tier B literals scoped to that organization ARE PERMITTED (e.g., `<toolbase>`). |
| **Personal**    | `personal/sandbox` branch, `~/scratch/`        | Anything the author chooses; never published.                                                          |

### 1.2 The Two Cardinal Rules

1. **Public-scope artifacts MUST be self-contained.** They may not import, link to, or
   functionally depend on any org-private or personal-scope artifact. A public consumer
   who clones only the public repo MUST be able to use every skill / rule without ever
   discovering that an org-private sibling exists. Concretely forbidden in any
   public-scope file:

   - A relative link whose target escapes the public repo
     (e.g. `../../../../<corp>_ai_agents/...`) — broken in the public consumer's clone,
     and the link text leaks the name + existence of the private artifact.
   - The literal name of any organization (`<corp>`, e.g. "Acme Corp") in prose, unless
     it is the genuine subject of a Tier C open-source attribution (e.g. "the BSD
     license" is fine; "on an Acme workstation" is not — write "on a corporate
     workstation" instead).
   - Reliance on a multi-root VS Code workspace layout to "make" a cross-repo relative
     link resolve — it resolves only for the original author; standalone public clones
     silently break.

2. **Org-private-scope artifacts MAY reference public-scope artifacts — by name, not by
   relative path.** Per §1.0 the two repos are independent. A relative link
   `../../../../<public-repo>/...` resolves only inside one specific multi-root
   workspace layout and is broken for any developer who clones the org-private repo
   standalone. Reference public-scope skills and rules by canonical inline-code name
   only — e.g., write
   ``the general `system-wide-tool-management` skill (in the public `ai-agents` repo)``
   rather than a relative-path link. Org-private files MAY use literal Tier B values
   universally true within that organization (the shared tool root such as `<toolbase>`,
   the corporate proxy host, the internal VCS URL). The single preservation: use the
   `<placeholder>` form **once** beside the literal as a teaching aid (see
   §3.1 of the skill).

### 1.3 Asymmetric Linking Summary

```text
<public-repo>      ──X──────────────────────▶ <org-private-repo>    (FORBIDDEN: unregistered sibling + leaked name)
<public-repo>      ───▶ <public-repo>                                 (ALLOWED, relative path, intra-repo)
<org-private-repo> ───▶ <org-private-repo>                            (ALLOWED, relative path, intra-repo)
<org-private-repo> ───▶ `<public-skill-name>` (no link, by name only)  (ALLOWED, name-only reference)
<org-private-repo> ──X──────────────────────▶ <public-repo> (via relative path) (FORBIDDEN: unregistered sibling, layout-dependent)
<parent-repo>      ───▶ <registered-submodule>/<file> (via `.gitmodules` mount)  (ALLOWED, intra-distribution-unit)
<registered-submodule> ───▶ <parent-repo>/<file> (via `../` to mount root)        (ALLOWED, intra-distribution-unit)
<parent-repo>      ──X──▶ <unregistered-sibling-folder>/<file>                    (FORBIDDEN: no `.gitmodules` entry → local accident)
```

> The last three rows are the submodule carve-out from §1.0. A submodule **registered**
> in the parent's `.gitmodules` has a deterministic mount path that ships with every
> parent commit; the project's clone recipe is `git clone --recurse-submodules
> <parent-url>`, and links across the registered mount resolve under that recipe.
> Anything not in `.gitmodules` (an unregistered sibling folder that just happens to
> sit next to the parent on the author's disk) gets no such guarantee and is treated
> as an inter-repo escape.

**Unifying principle (restatement of §1.0):** no relative-path link may escape its
enclosing Distribution Unit. The Distribution Unit is the enclosing repo PLUS every
submodule registered in its `.gitmodules` (recursively). Within the unit, relative
paths are first-class; across units they fail the Standalone-Clone Test.

### 1.4 Pre-Commit Checklist (mandatory before staging a cross-repo reference)

The agent MUST run this checklist whenever a committed artifact mentions another
repository (whether by link or by prose):

1. **Identify enclosing Distribution Unit.** Resolve the file's path to its Git repo
   root (`git rev-parse --show-toplevel`), then expand to include every submodule
   registered in that repo's `.gitmodules` (recursively). The enclosing unit is the
   set of paths reachable inside this expanded tree.
2. **Identify reference target.** What other repo does the artifact mention? Is it
   inside the same Distribution Unit (intra-unit, ALLOWED by relative path) or
   outside it (inter-unit — independent sibling, FORBIDDEN by relative path)?
3. **Apply the asymmetric linking matrix (§1.3).** Reject any link whose target
   escapes the enclosing Distribution Unit. A `../` chain that lands inside a
   registered submodule is fine; anywhere else is illegal regardless of how it
   currently resolves on the author's disk.
4. **Apply the Standalone-Clone Test (§1.0)** in your head: imagine the file after
   the project's documented clone recipe (`git clone --recurse-submodules <url>` for
   a unit, `git clone <url>` for a standalone). Do all links resolve? Does all prose
   make sense without any unregistered sibling repo present? If no on either count:
   repair.
5. **For public→org-private references**: rewrite to generic prose
   (*"your organization's internal skill library, if one exists"*) — never name the
   private repo. **For org-private→public references**: reference by canonical
   inline-code name only — never relative path.

### 1.5 Worked Example (correct pattern)

The canonical cross-repo cite pattern, expressed with placeholders so this rules file
remains itself a public-scope artifact that passes the Standalone-Clone Test:

- Let `<public-skill>` be a public-scope skill that ships a default workflow but
  acknowledges that some organizations may have an internal fallback (e.g., a
  toolbase-bundled compiler when the public skill's PATH probe fails).
- Let `<org-skill>` be an org-private-scope skill that provides that fallback (e.g.,
  by prepending an internal tool root to `$env:Path` before invoking the public skill).

| Side | What is written | Why it passes |
| :--- | :--- | :--- |
| `<public-skill>/SKILL.md` referring outward to a possible org-private fallback | *"If your organization ships a `<tool>`-bundled equivalent that is not on `$env:Path`, prepend its `bin\` directory to `$env:Path` BEFORE running this script (typically via an organization-specific composer skill)."* | Generic prose. Does NOT name the organization, does NOT link `../../../<corp>_ai_agents/...`. Passes Standalone-Clone Test: a public consumer reading this file gets actionable guidance without learning that any private sibling exists. |
| `<org-skill>/SKILL.md` referring inward to its public consumer | ``\| `<public-skill>` (in the public `ai-agents` repo) \| **Downstream consumer** — needs `<toolbase>\…\bin\<tool>.exe` … \|`` | Reference by **canonical name only**, inside an inline-code span, with the host repo named in parens. NO relative-path link (`../../../../ai-agents/...` would be forbidden by §1.3). Passes Standalone-Clone Test: a developer who clones only `<corp>_ai_agents` sees a name they can web-search; nothing is broken. |

**Inadmissible alternatives** (each path below is wrapped in inline code so this rules
file does not itself contain a forbidden link).

**The categorical point:** two **independent** Git repositories (NOT registered as
parent/submodule of each other in either's `.gitmodules`) have **no defined relative
position to each other**. A developer may clone them anywhere: in the same parent
folder, on different drives, on different machines, only one of them at all. Therefore
ANY relative path written from one independent repo into another is not "wrong by N
levels" — it is **categorically meaningless**, because the thing it would have to
refer to (a stable relative position) does not exist. The number of `../` segments is
irrelevant; **zero counts of `../` that escape the enclosing Distribution Unit are
admissible**. (Paths that escape the worktree but land inside a registered submodule
are NOT escapes — they are intra-unit, per §1.0's Distribution-Unit carve-out.)

| Inadmissible | Why it fails (and why fiddling the depth doesn't fix it) |
| :--- | :--- |
| Public skill containing `[<org-skill> fallback](../../../<corp>_ai_agents/.agents/skills/<org-skill>/SKILL.md)` | A `SKILL.md` sits at `.agents/skills/<skill-name>/SKILL.md` — depth 3. Three `../` reach the repo root; the next path segment `<corp>_ai_agents` escapes it. But "fixing" the depth (two `../`, four `../`, anything) cannot help: the org-private repo has **no defined position relative to the public repo at all** — the two are independent clones. Independently of the escape, the link text leaks the literal `<corp>_ai_agents` (Tier B org leak). Forbidden by both Cardinal Rule 1 bullets. |
| Org-private skill containing `[<public-skill>](../../../ai-agents/.agents/skills/<public-skill>/SKILL.md)` | Same categorical reason in the reverse direction: the public repo has no defined position relative to the org-private repo. The path implicitly assumes a particular sibling-folder checkout layout under a shared parent — which §1.0 rejects as a local accident. Forbidden by Cardinal Rule 2. |
| Either side prose saying *"in the sibling repo at `<workspace-root>/…`"* | Same root cause: assumes a shared parent. The repos may be on different drives, different machines, or only one of them present. Forbidden by §1.0. |

**Operational test (one rule, no arithmetic):** the moment a relative path's `../`
chain crosses the enclosing **Distribution Unit's** outermost root (i.e., escapes
into a folder that is neither the enclosing repo nor any of its registered
submodules), the link is illegal — regardless of where it points after that,
regardless of whether the target exists on the author's disk. The link is
**categorically unfixable**; replace it with a name-only reference (per §1.2
Cardinal Rule 2) or delete the cross-reference entirely. Conversely, a `../` chain
that stays inside the Distribution Unit (including landing inside a registered
submodule) is legal.

### 1.6 Detection Heuristic

Before adding any inter-skill / inter-rule link in a public-scope file, resolve the
link's target relative path against the public repo root. If the target escapes the
public repo, the link is illegal regardless of the redaction of its display text. The
correct treatment is one of:

- Rewrite the prose to delegate generically (e.g. *"consult your organization's internal
  skill library, if one exists"*) without naming or linking.
- Move the cross-reference to the org-private side (which IS allowed to link inward).

### 1.7 Submodule→Parent URL References

When a submodule artifact must reference the parent repo in a way that survives
standalone submodule clone, a relative path (Option A) won't resolve. Choose
between three options:

| Option | Standalone clone | Stable |
|---|---|---|
| **A — Relative path** (`../../<parent>/<path>`) | ❌ Broken | ✅ |
| **B — SHA-pinned URL** (`https://github.com/<OWNER>/<REPO>/blob/<SHA>/<path>`) | ✅ Resolves | ✅ Pinned |
| **C — Branch-pinned URL** (`/blob/main/...`) | ✅ Resolves | ❌ Content shifts |

**Recommendation:** Option A for pedagogical references; Option B for
operational references where standalone resolution matters. **Never use
Option C.** See the `redaction-portability` skill §0.2 for treatment
details and the branch-pinned detection command.

### 1.8 Commit Messages — Standalone-Clone Test Applies

Submodule commit messages are committed artifacts subject to the same
standalone-clone test as any file. Three allowed reference patterns for
parent-repo content, in order of preference:

1. **SHA-pinned GitHub URL** — immutable, resolves everywhere.
2. **Full repo-name + descriptive path** — navigable search hint when
   URL is impractical.
3. **Generic prose** — conceptual reference without load-bearing
   location.

**Forbidden:** parent-repo jargon, relative paths, branch-pinned URLs.
Message must be self-contained for a reader who clones only the
submodule.

See the `redaction-portability` skill §0.3 for full treatment with
examples. Do NOT redefine the three-pattern framework here — refer to
the skill.

***

## 2. The Three String Sensitivity Tiers

These are orthogonal to §1: §1 says "which repo may hold which value", this section says
"which class does the value belong to". The intersection of the two axes determines the
final treatment. See the skill's §1 for the full reference; the short form:

| Tier | Class                                  | Treatment in public-scope file              | Treatment in org-private file |
| :--- | :------------------------------------- | :------------------------------------------ | :---------------------------- |
| A    | Identity & credentials                 | ALWAYS redact (`<author>`, `<author-email>`, `<redacted-secret>`) | ALWAYS redact |
| B    | Machine / organization topology        | REDACT to `<placeholder>` form              | LITERAL allowed (with one teaching-aid placeholder per §1 rule 2) |
| C    | Public / universal open-source identifiers | KEEP verbatim                          | KEEP verbatim |

***

## 3. Canonical Placeholder Vocabulary (Short Form)

Use `<lower-case-hyphenated-noun>` only — angle-bracketed, lower-case, hyphen-separated.
See §2 of the `redaction-portability` skill (in the public `ai-agents` repo) for the full
catalog — referenced by name only per §1.2 Cardinal Rule 2. The frequently-used ones:

- Paths: `<workspace-root>`, `<user-home>`, `<toolbase>`, `<tools-root>`, `<jdk-install>`, `<m2-repo>`
- Identity: `<author>`, `<user>`, `<author-email>`, `<reviewer>`
- Network / org: `<corp>`, `<corp-domain>`, `<corp-proxy-host>`, `<internal-vcs>`, `<internal-artifact-repo>`, `<ticket-system>`, `<TICKET-ID>`, `<customer>`, `<product-codename>`

NEVER invent ad-hoc placeholder forms — extend the skill's §2 vocabulary first.

***

## 4. Prohibited Behaviors (Public-Scope Files)

A public-scope file MUST NOT:

1. Contain any Tier A value (identity / credentials) — ever, even in commit messages.
2. Contain any Tier B literal value that names a specific organization's filesystem,
   network, or product topology — use placeholders.
3. Contain a relative link whose target escapes the public repo.
4. Contain the literal name of any organization in prose (use `<corp>`).
5. Contain a fake-but-real-looking substitute for redacted content (e.g.
   `myveryreal.com`) — use the canonical `<placeholder>` form.
6. Rely on a sibling-folder workspace layout to make a cross-repo link "work".
7. Leave half-redacted strings (`<corp-proxy-host>.<corp>.com` — the suffix leaks).
8. Over-redact public open-source identifiers (Apache, Eclipse, Maven Central, etc.).

***

## 5. Verification

After authoring or modifying any public-scope file, run this verification on the public
repo root (do NOT recurse into the org-private sibling):

```powershell
Get-ChildItem <public-repo-root> -Recurse -Filter *.md -ErrorAction SilentlyContinue |
    Select-String -Pattern '<corp-literal-1>|<corp-literal-2>|<toolbase-literal>' -CaseSensitive:$false |
    Select-Object Path, LineNumber, Line | Format-Table -Wrap
```

```bash
grep -rn -iE '<corp-literal-1>|<corp-literal-2>|<toolbase-literal>' \
    --include='*.md' --exclude-dir='.git' <public-repo-root>
```

Replace `<corp-literal-*>` and `<toolbase-literal>` with the specific strings your
organization uses (e.g., the organization's name, its shared tool root path). The
verification command itself, when published, MUST use placeholders — not the real
values.

A zero-result run is the gate for committing a public-scope change.

***

## 6. Related Rules & Skills

- The `redaction-portability` skill (in the public `ai-agents` repo) — the executable
  form of this rule; the authoritative SSOT. Referenced by name only per §1.2
  Cardinal Rule 2 (no relative path may escape the enclosing repo).
- [`ai-rule-standardization-rules.md`](ai-rule-standardization-rules.md) — every new
  rule MUST be redacted per §1–§4 before commit.
- [`markdown-generation-rules.md`](markdown-generation-rules.md) — `fileLinkification`
  section; the public-scope link rule in §1.1 of this file extends those rules with
  the cross-repo-link prohibition.
- [`git-atomic-commit-construction-rules.md`](git-atomic-commit-construction-rules.md) —
  commit messages are public-scope artifacts and MUST be redacted.

***

## 7. Versioning

| Version | Date | Change |
|---|---|---|
| v2 | 2026-05-10 | Parity with skill v2 (three-tier model, placeholder vocabulary, etc.) |
| v2.1 | 2026-06-09 | Added §1.7 submodule→parent URL reference options, branch-pinned detection, SHA-pinned recommendation |

This rule file is maintained in lock-step with the `redaction-portability` skill
(in the public `ai-agents` repo). When the skill advances, increment this file in
the same commit that updates the skill (per [`git-atomic-commit-construction-rules.md`](git-atomic-commit-construction-rules.md)
§6 Configuration Coupling).
