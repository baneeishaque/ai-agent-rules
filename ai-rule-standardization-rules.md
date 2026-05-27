---
name: AI Agent Rule Standardization Rules
description: Craftsmanship standards for developing "Ultra-Lean Industrial" AI Agent Rules,
    ensuring consistent formatting,
    structural hierarchy, and pedagogical clarity.
category: Rule-Management
---

# AI Agent Rule Standard Creation

This document defines the craftsmanship standards for creating new AI Agent Rules. Adhering to these protocols ensures
that all rules remain professional, machine-parseable, and human-readable.

> ## ⛔ BLOCKING — Cross-Repository Reference Test
>
> Before creating ANY rule / skill / doc that references content in a **different Git repository** (sibling folder in a multi-root workspace, separately-cloned tool repo, org-private companion repo, etc.), confirm ALL THREE:
>
> 1. Both endpoints in the same repo, OR a parent + `.gitmodules`-registered-submodule pair.
> 2. Survives the **Standalone-Clone Test**: clone the host repo only, into an empty directory, with no knowledge of the other repo's existence — does every link resolve and every prose reference still make sense?
> 3. Leaks zero org-private repo names / internal codenames / internal hostnames into a public-scope artifact.
>
> Multi-root VS Code workspaces and "the other repo is right there on my disk" are NOT valid layout proofs — they are local accidents per the Independence Axiom in [`redaction-portability-rules.md` §1.0](./redaction-portability-rules.md#10-the-independence-axiom-read-this-first). Full enforcement: §1.3 of the same rules file.

***

## 1. Preparation & Context Assembly (Crucial)

Before drafting a rule file, the agent MUST:

1. **Assemble Conversation Points**: Review the entire conversation history to capture specific user preferences, edge

   cases discussed, and implied constraints (e.g., "plain text only", "no icons").

1. **Identify Edge Cases**: Explicitly document "what not to do" based on user feedback (e.g., "Articles don't support

   tags").

1. **Synthesize Limitations**: If a platform or tool has limitations (e.g., LinkedIn Article tags), the rule MUST

   address them.

***

## 2. File Naming & Meta-Data

All rule files must be stored in the `AI-Agent-Rules` directory. However, for specific workflows,
tasks, or capabilities, the system mandates a **Skill-First** architecture.

- **Skill-First Architecture**: Any new, complex work process or agent-specific workflow
  MUST be created as an **Agent Skill** instead of a flat rule file.
- **Skill Directory**: Skills are housed in `.agent/skills/<skill-name>/` (legacy/single-agent) or
  `.agents/skills/<skill-name>/` (plural/standardized). Skill names MUST use lowercase letters, numbers, and hyphens (no underscores).
- **Core Skill Files**:
    - `SKILL.md`: The SSOT containing active instructions following the **agentskills.io protocol**
      (YAML frontmatter + Markdown body).
    - `AGENTS.md`: The companion bridge providing "passive context" and referring tools back to the `SKILL.md`.
- **Independence Mandate**: Every Skill MUST be self-contained. It MUST manage its own environmental verification,
  dependencies, and execution logic independently.
- **Layered Composition Mandate (Base → Composer)**: When a workflow contains a generic primitive (e.g., glob assembly,
  metadata extraction, path normalization) reused by multiple domain-specific tasks, it MUST be split into:
    1. A **base skill** that owns ONLY the generic primitive, accepts inputs via stdin / file / arguments, and
       produces a deterministic output. The base skill MUST be domain-agnostic.
    2. One or more **composer skills** that own the domain-specific discovery (e.g., parsing `.gitmodules`, walking
       `node_modules`) and pipe their output into the base skill via its public CLI contract.
  Composer scripts MUST resolve the base script through a relative path (`$(dirname "$0")/../../<base>/scripts/...`)
  so the pipeline works regardless of the caller's `cwd`. Inlining base logic into a composer is **FORBIDDEN** —
  duplication breaks the SSOT contract and silently diverges bug fixes. Each composer's `SKILL.md` MUST link to its
  base skill in a "Composition Rationale" section, and the base skill MUST list known composers in a "Composition by
  Higher-Level Skills" section so the dependency graph is bidirectionally discoverable.
- **Path Portability**: All links within a Skill MUST be relative and depth-correct (e.g., `../../../` for
  skills residing 3 levels deep) to ensure zero-dependency portability across filesystems.
- **Cross-Repository / Submodule Isolation (SSOT)**: When a rule or skill file lives inside a repository that is
  also consumed as a Git submodule of another repository (e.g., `ai-agent-rules` embedded in `ai-agents`), the
  asymmetric link rule defined in
  **[markdown-generation-rules.md §4.2.8](./markdown-generation-rules.md#428-cross-repository--submodule-isolation-links)**
  applies: inbound (parent → submodule) relative links are allowed; outbound (submodule → parent or sibling)
  relative links are FORBIDDEN and MUST be replaced by SHA-pinned hosted-VCS permalinks. Rule files MUST NOT
  inline this protocol — they MUST defer to §4.2.8 as SSOT.

- **File Naming**: Use strictly lowercase, kebab-case ending in `-rules.md` (e.g., `git-submodule-rules.md`).
- **Skill Naming**: Skill names in YAML frontmatter MUST use lowercase letters, numbers, and hyphens (no underscores or spaces).

- **YAML Frontmatter**: Every file MUST start with the following metadata block:

    ```markdown
    ---
    name: [Short, Impactful Title]
    description: [One-sentence summary of the rule's scope]
    category: [Existing or New Category]
    ---
    ```

- **Frontmatter Position Mandate**: The YAML frontmatter block (`---` ... `---`) MUST be the very FIRST content
  in the file — line 1 column 1, with NO blank lines, BOM, HTML comments (`<!-- ... -->`), or any other content
  preceding it. The agentskills.io lint validator parses frontmatter strictly: any preceding character (including
  an HTML comment block that some legacy projects use as an alternative metadata carrier) makes the validator
  treat the YAML as absent, producing `Skill must provide a name` even when a syntactically valid `name:` exists
  below. If a project tradition uses an HTML-comment metadata block, the YAML frontmatter MUST still come first;
  the HTML comment MAY follow it as a secondary, lint-ignored carrier.

- **Namespaced Skill IDs vs Lint-Conformant Names**: Some workspaces use namespaced Skill IDs containing slashes
  or underscores (e.g., `dgs_ice/damos_validation_completeness_audit`) for human discoverability. Those forms are
  FORBIDDEN in the `name:` field because the lint validator enforces `^[a-z0-9-]+$`. Resolution:
  the `name:` field MUST be the hyphenated, single-segment form (e.g., `damos-validation-completeness-audit`);
  the namespaced form MAY appear ONLY in the body (e.g., `> **Skill ID:** \`dgs_ice/damos_validation_completeness_audit\``)
  where it is not lint-validated.

***

## 3. Structural Hierarchy

Rule files must follow a predictable, industrialized structure to maximize readability:

1. **H1 Title**: Matches the YAML title but is more formal (e.g., `# Git Submodule Management Rules`).

1. **Scope Statement**: A brief paragraph defining *why* the rule exists and who the stakeholders are.

1. **Section Dividers**: Use `***` (horizontal rules) between major H2 sections.

1. **Numbered Sections**: Use H2 headers with sequential numbering (e.g., `## 1. Preparation & Context Assembly`).

1. **Sub-sections**: Use H3 for specific technical details (e.g., `### 1.1 Command Syntax`).

1. **Related Conversations**: Use an H2 section at the bottom for traceability (e.g., `## 6. Related Conversations &

   Traceability`), linking to permanent session logs in the`docs/conversations/` directory.

***

## 4. Content Philosophy (Ultra-Lean Industrial)

The content must balance conciseness with technical depth:

- **Zero Noise**: Avoid introductory fluff, "happy to help" phrases, or redundant explanations.
- **Fidelity Mandate (Zero Omission)**: The agent MUST NEVER summarize or omit technical specifics, operational
  logic, or workflows provided by the user. "Conciseness" applies only to noise reduction, not to the factual depth
  of user-defined constraints.
- **Preservation Mandate (Additive Refinement)**: The current information in a document is considered correct and MUST
  NOT be removed unless explicitly requested or proven duplicate. New information MUST be blended into existing content
  to create an enhanced, "greater-than-before" version. If content is removed, the rationale and original content
  (if unique) must be preserved in a "Design Appendix" or session log.
- **Script SSOT Mandate (Audit Before Creation)**: The agent MUST audit existing skill directories for prior automation
  scripts before creating new ones. If a script already exists for a similar purpose, it MUST be refined or consolidated
  rather than duplicated. All scripts MUST reside in a `scripts/` subdirectory within the skill folder.
- **No-Embedded-Script Mandate**: Script source code MUST NOT be embedded inside `SKILL.md`, `AGENTS.md`, README, or any
  other markdown document — neither inline nor inside fenced code blocks. Markdown documents MUST link to the separate
  script file under `scripts/` using a **relative** path (e.g., `[scripts/foo.ps1](scripts/foo.ps1)`) and MAY include a
  short fenced **invocation example** (one-liner). Embedding full script bodies is FORBIDDEN because it (a) loses
  syntax highlighting, debugging, and standalone execution, (b) duplicates the SSOT, and (c) silently diverges from the
  executable file when one side is edited.
- **Self-Verification Mandate (Lint Before Present)**: After generating or editing ANY markdown artifact, the agent
  MUST re-read the artifact and verify it for formatting issues — stray tool-output tags (`</content>`, `<parameter ...>`),
  duplicated lines, broken/multi-line links, missing fenced-block closers, embedded absolute paths — and fix them
  BEFORE presenting the result to the user. Presenting an artifact that the agent has not re-read is FORBIDDEN.
- **Script Delivery Mandate (Ship It)**: Automation scripts developed during a skill session are **first-class
  deliverables** of the skill — NOT disposable work products. If a workflow was automated by a script during the
  session, that script MUST be committed inside the skill's `scripts/` directory as part of the skill's canonical
  form. "The script helped during the session" is sufficient justification to ship it permanently.
- **Script Preservation Mandate (Never Silent Drop)**: Existing scripts in a skill's `scripts/` directory MUST NOT
  be deleted, emptied, or replaced without an explicit user instruction to do so. During skill refactors (e.g.,
  extracting a base layer), the original script MUST be migrated or superseded explicitly — not silently removed.
  If a script is superseded by a higher-layer composer, the SKILL.md MUST document the migration rationale and the
  new invocation path so no operational knowledge is lost.
- **Script Language Mandate (PowerShell-First)**: When creating a new automation script, the default language is
  PowerShell (`.ps1`), cross-compatible with **Windows PowerShell 5.1+** and **PowerShell Core 7+**. Other languages
  (Bash, Python, Node) require an explicit user override or a documented technical justification (e.g., a runtime that
  is unavailable in PowerShell). All script craftsmanship details — documentation headers (`.SYNOPSIS`,
  `.DESCRIPTION`, `.PARAMETER`, `.EXAMPLE`, `.NOTES`), execution priority (`pwsh-preview` → `pwsh` fallback),
  `Common-Utils.ps1` dot-sourcing, and the `Write-Message` empty-string safeguard — are defined in the SSOT at
  [Script Management Rules](./script-management-rules.md) and MUST be obeyed. **Bash Extension Mandate**: When a Bash script is authored (under user override or documented justification), the file MUST use the `.bash` extension — never `.sh` — per the [Bash Scripting Rules](./bash-scripting-rules.md) §Naming and the [GitHub Actions Workflow Rules](./github-actions-workflow-rules.md) standalone-script mandate.
- **Portable Script Path Mandate**: Any script that depends on a sibling artifact (the shared `Common-Utils.ps1`, a
  base-skill script under the Layered Composition Mandate, a config file, etc.) MUST resolve that artifact through a
  path anchored on the script's **own** location — NOT the caller's working directory. In PowerShell, use
  `Split-Path -Parent $MyInvocation.MyCommand.Path` and `Join-Path` with relative `..\` segments, then `Resolve-Path`
  for diagnostic clarity. Hard-coded absolute paths and `$PWD`-relative paths are FORBIDDEN.
- **Recursive Submodule Mandate**: Any documented `git submodule add`, `git submodule update --init`, or
  `git clone` instruction MUST use the recursive form (`--recursive` for `submodule update`, `--recurse-submodules`
  for `clone`). Submodules frequently embed their own submodules, and a non-recursive instruction silently leaves
  nested pointers uninitialized — a class of bug that surfaces only at runtime. See the
  [Git Submodule Addition](https://github.com/Baneeishaque/ai-agents/blob/de777420fe2931e8ef43ea7a0aa9b27f7e6bf296/.agents/skills/git-submodule-addition/SKILL.md) skill §3.3 for the canonical commands.
- **Pedagogical Snippets**: Use code blocks to demonstrate correct command usage or file formats.

- **Architectural Samples (PoC)**: Rules defining complex patterns MUST link to high-fidelity reference implementations

    (templates) in the `/architectures/`directory. These MUST include a`package.json` for dependency transparency.

- **Industrial Portability**: All implementations MUST be linked as examples so that when a rule or standard changes,

    the reference implementations can be updated in sync.

- **Industrial Folder Structure**: For feature-level or architecture rules, the rule MUST follow a standardized

    directory structure:

- `/types.ts`: Centralized Enums and Interfaces (SSOT).

- `/config.json`: Environmental/Externalized configuration to avoid hardcoded logic.

- `/engine.ts`or`/index.ts`: Main logic or entry point.

- `/docs/`: Implementation plans and technical goal documents.

- `/*.md`: Every code file MUST have an adjacent Markdown file explaining the code line-by-line with usage scenarios.

    These explainers MUST be pedagogical and deep, following the strict standards defined in **[Code Documentation
    Rules](./code-documentation-rules.md)**.

- **Relative Links**: Documentation and explainers MUST use **Relative Links** (not absolute paths) to ensure the
    rule set remains portable and functional in any local filesystem.

- **Environmental & Dependency Mandate**: Every `SKILL.md` MUST include a dedicated section for "Environmental Setup"
  or "Environment & Dependencies". This section MUST instruct the agent to autonomously verify required tools
  (e.g., `rclone`, `diff`) and provide installation logic for standard package managers (`brew`, `apt`, `yum`).

- **Artifact Linting Mandate**: All Markdown artifacts (Plans, Tasks, Walkthroughs, Skills, Rules) MUST be verified
  with the **`markdownlint-cli2`** binary prior to user presentation. Any violations MUST be resolved.
    - **Direct Execution (NO NPX)**: The agent MUST invoke the standalone binary directly (e.g.,
      `markdownlint-cli2 <path>` and `markdownlint-cli2 --fix <path>`). Using `npx markdownlint-cli2` is
      **FORBIDDEN** — it adds startup overhead, masks installation drift, and bypasses the project's pinned tool.
    - **SSOT**: This mandate mirrors and is governed by
      **[Markdown Generation Rules §5 (Validation Rules)](./markdown-generation-rules.md#5-validation-rules-markdownlint-cli2)**;
      that section is the single source of truth for invocation, install path, and custom-rule resolution.

- **Status Traceability Mandate**: Plans used for rule-building or multi-phase tasks MUST mark completed steps with
  `[DONE] [TIMESTAMP]` in the 'Proposed Changes' section to maintain execution context.

- **Multi-Project SSOT**: When providing multiple samples (e.g., CRA and Vite), the core logic MUST be extracted into

    a **Shared Library** folder. Samples MUST reference this shared core (e.g., via symbolic links or relative imports)
    to maintain a Single Source of Truth and avoid code duplication.

- **Core Logic Links**: Rules defining complex logic MUST link to their respective architectural SSOT providers (e.g.,

    [Sync Logic](./zero-backend-sync-rules.md)).

- **Technology Independence & Depth**: Rules MUST be technology-independent in their core principles but MUST provide

    maximum-detail, industry-standard examples (e.g., Nostr, WASM, RxDB) that can be reused or generated as new
    implementations according to the situation.

- **Inter-Document SSOT**: To maintain a Single Source of Truth across the rule
    set, documentation MUST NOT duplicate content that exists in another
    definitive rule file. Instead, it MUST use **Relative Section Links** to
    refer the agent to the authoritative source (e.g., refer to the
    `git-commit-message-rules.md` for formatting standards).
- **Selection & Trade-offs**: Rules MUST clearly explain the options, trade-offs, and alternatives available for an
    architectural pattern. The assistant MUST iterate with the USER to present all options (sorted by priority) and
    discuss the best fit for the context before concluding with a final recommendation for approval.

- **Context Discovery Protocol**: Rules MUST mandate that the assistant:
     1. **Identifies Context**: Detect build tools (Vite/CRA), frameworks (React/Vue), and identifiers (Email/PubKey).
     1. **Confirms Context**: Explicitly ask the user to confirm the detected environment before proceeding.

- **SSOT (Single Source of Truth)**: Rules MUST mandate centralized Enums for any inter-process (Worker) or

    inter-component communication to prevent "magic string" typos.

- **Decoupled Configuration**: Parameters likely to change (Relays, Endpoints, feature toggles) MUST be isolated in

    machine-readable config files (JSON preferred).

- **Storage Logic Hierarchy**: Rules MUST provide a selection logic for storage (Relational -> NoSQL -> File -> Text)

    based on problem context. Priority MUST be documented (e.g., 1st, 2nd, 3rd) with clear rationale for each.

- **Git Hygiene & Rebase (Industrial Standard)**: Rules involving Git operations MUST mandate:

- **Hierarchical Rebase Mapping**: Using Mermaid diagrams for branch dependencies.

- **Commit Action Mapping (CAM)**: Standardized KEEP/REWORD/DROP/SQUASH tables.

- **Literal Exhaustive Plans**: Mandating exact CLI commands and message payloads (SSOT) to prevent execution-time

    ambiguity.

- **Performance Abstraction**: Mandate backgrounding (Workers/Threads) for all heavy logic (Crypto/Network) to ensure

    60 FPS UI stability.

- **Performance Abstraction**: Mandate backgrounding (Workers/Threads) for all heavy logic (Crypto/Network) to ensure

    60 FPS UI stability.

- **Coding Standards (SSOT & Safety)**:

- **Comment Style**: Comments MUST be placed *before* the code line or in block format. Avoid trailing comments after

    semicolons.

- **Deep Type Safety**: Implementations MUST avoid `any` and use deep typing for all data structures (e.g.,

    MessageEvent data).

- **Runtime & Type Safety**: The agent MUST prioritize both compile-time (TS) and runtime (Schema/Validation) safety.

- **Defensive Programming**: All network and I/O logic MUST implement defensive programming (e.g., try-catch, JSON

    validation, socket state checks) to prevent silent failures.

- **Real Usage Samples**: Rules for frameworks (React/Vue) MUST include a real integration sample showing

    component/hook orchestration.

- **Prohibited Behaviors**: Explicitly list actions the agent is forbidden from taking (e.g., "DO NOT hardcode keys",

    "DO NOT block UI"). These MUST be clear, non-ambiguous, and explained as the SSOT for what to avoid.

- **Traceability Portability**: Permanent records MUST be stored in the repository's permanent documentation directory
    (`ai-agent-rules/docs/`) using a structured hierarchy.
    - **Protocols**: All session or conversation logs MUST follow the protocols defined in
      **[AI Agent Session Documentation Rules](./ai-agent-session-documentation-rules.md)**.
    - **Relative Pathing**: For relative paths, artifact permanence, and link references, follow the
      **File References** standards defined in **[Markdown Generation Rules](./markdown-generation-rules.md)**.

- **Redaction & Portability Mandate (SSOT)**: Every rule file, skill file (`SKILL.md`, `AGENTS.md`), session log,
  case study, and committed artifact authored under these standards MUST be passed through the
  **[Redaction & Portability Skill](https://github.com/Baneeishaque/ai-agents/blob/de777420fe2931e8ef43ea7a0aa9b27f7e6bf296/.agents/skills/redaction-portability/SKILL.md)**
  (rules-side mirror: **[Redaction & Portability Rules](./redaction-portability-rules.md)**)
  before commit. The skill is the authoritative SSOT; the rules-side mirror is the normative form referenced
  by all other rules. The skill is the SSOT for: (a) the three-tier sensitivity model (Tier A identity/credentials,
  Tier B machine/org topology, Tier C public/universal), (b) the canonical placeholder vocabulary
  (`<workspace-root>`, `<user-home>`, `<toolbase>`, `<author>`, `<user>`, `<corp-proxy-host>`, `<corp-domain>`,
  `<internal-vcs>`, `<ticket-system>`, `<customer>`, `<product-codename>`, etc.), (c) absolute-path relativization,
  (d) author / username / email redaction, (e) internal-domain / proxy / ticket / customer redaction, (f) filename
  hygiene, and (g) the verification-scan + encoding sanity-check audit steps. Rule files MUST NOT inline their
  own redaction vocabulary or replacement tokens — they MUST defer to the Redaction skill. Ad-hoc placeholder
  invention, half-redacted strings (e.g., `<corp-proxy-host>.<real-corp>.com`), and over-redaction of public
  open-source identifiers (`Apache Commons`, `Eclipse`, `Maven Central`) are FORBIDDEN per Redaction §10.

- **Repository Scope Tier Mandate (SSOT, additive to Redaction)**: Every authored file lives in exactly one
  publication-scope tier — **public** (e.g., the public `ai-agents` repo), **org-private** (e.g., a
  `<corp>_ai_agents` sibling repo), or **personal** (e.g., a sandbox branch).
  The tier is determined by the **enclosing Git repository**, not by the file's content or by any local
  workspace layout. The cardinal premise — stated as the **Independence Axiom** in
  [`redaction-portability-rules.md`](./redaction-portability-rules.md) §1.0 — is that the public and
  org-private repos are **independent Git repositories** with separate clone URLs, separate publication
  lifecycles, and separate existences; a developer may legitimately clone either one **standalone**.
  Portability in this rule set is defined as **passing the Standalone-Clone Test**: "if I clone ONLY
  the repo this file lives in, into a fresh empty directory, on a machine that has never heard of the
  other repo — does every relative link still resolve and does every prose reference still make sense?"
  Multi-root VS Code workspaces and sibling-folder conventions are local accidents, not portable
  properties, and are **inadmissible defences**. The scope tier governs what is allowed:
  - **Public-scope files MUST be self-contained.** They MUST NOT (a) link via relative path into an
    org-private or personal sibling repo (the link is broken in any standalone public clone and leaks the
    private repo's existence + name), (b) name a specific organization in prose (use `<corp>` or generic
    "your organization" phrasing instead), or (c) rely on a multi-root VS Code workspace to make a
    cross-repo link "resolve" — it resolves only for the original author. The correct way to delegate to
    an org-private capability is generic prose: *"consult your organization's internal skill library, if
    one exists."*
  - **Org-private-scope files MAY reference public-scope files — by name, not by relative
    path.** Per the Independence Axiom, a relative link
    `../../../../<public-repo>/...` only resolves inside one specific multi-root workspace
    layout and is broken for any developer who clones the org-private repo standalone.
    Reference public-scope skills and rules by canonical inline-code name only (e.g.,
    ``the general `system-wide-tool-management` skill in the public `ai-agents` repo``).
    Org-private files MAY use literal Tier B values universally true within that
    organization (`<toolbase>`, the corporate proxy host, the internal VCS URL). Use the
    canonical `<placeholder>` once beside the first literal occurrence as a teaching aid
    for future public-scope ports.
  - **Unifying principle:** no relative-path link may escape its enclosing repository,
    regardless of direction.

  Before staging any cross-repo reference, the agent MUST run the **Pre-Commit Checklist** in
  [`redaction-portability-rules.md`](./redaction-portability-rules.md) §1.4, and SHOULD consult the
  **Worked Example** in §1.5 (a public skill ↔ org-private skill pair) for the canonical correct +
  inadmissible patterns. See
  [`redaction-portability-rules.md`](./redaction-portability-rules.md) §1 for the full matrix and
  detection heuristic.

- **Mandatory Protocols**: Use clear, imperative language (e.g., "The agent MUST...", "The agent is BLOCKED from...").

- **Deep Command Explanation Mandate**: Any shell command or CLI snippet provided in a Rule or Skill MUST include
  a deep, flag-by-flag pedagogical breakdown. This ensures the agent (and user) understands the exact logic and
  rationale behind every argument, preventing "magic command" execution.

***

## 5. Verification & Commit

Before finalizing a new rule:

1. **Cross-Reference**: Check for existing rules to avoid duplication.

1. **Lint Check**: Ensure all content complies with **[Markdown Generation Rules](./markdown-generation-rules.md)** and
    **[Markdown Generation Rules Additions](./markdown-generation-rules-additions.md)**.

1. **Sync Trigger**: Remind the user to trigger the `agent-rules.md` update workflow.

1. **Commit Message**: Use Conventional Commits (e.g., `feat: establish standard creation rules for AI agents`).

### 6. Auto-Generated Indices (CI/CD Managed)

The `agent-rules.md`and`README.md` files are strictly derivative artifacts managed by CI/CD.

- **NEVER** edit or commit these files directly.

- **SOURCE OF TRUTH**: All structural changes (diagrams, layout) MUST be made in the `templates/*.template` files.

- **AUTOMATION**: Updates are automatically triggered by pushes to rule files or templates via the `update-rules.yml`

    workflow.

- **PROHIBITED ACTION**: Manually replacing placeholders (e.g., `<!-- RULES_INDEX -->`) in templates or output files.
