---
title: Git Atomic Commit Construction
description: Authoritative protocol for analyzing, grouping, and arranging
    changes into logical, independent atomic units before execution.
category: Git & Repository Management
---


# Git Atomic Commit Construction Rules

This document defines the mandatory protocol for creating "Arranged Commits"—
logical, independent, and atomic units of change. This approach ensures
high-quality history and minimizes regression risks.

**Prerequisite**: All actions must first adhere to the context and pre-check
protocols defined in [git-operation-rules.md](./git-operation-rules.md).

***

## 0. Section 0: Environment & Working Directory Management

Before performing any phase, the agent MUST establish reliable working directory handling.

- **Working Directory Targeting (CRITICAL)**: When executing git commands across 
  one or more repositories, use `git -C <path> <command>` exclusively for reliability.
  
  ```bash
  # Recommended pattern for absolute paths
  git -C /workspaces/repo-name status
  git -C /workspaces/repo-name diff HEAD
  ```

- **Why `git -C` is mandatory**: Shell-level `cd` commands do not persist working 
  directory state across stateless or multi-invocation execution environments 
  (including tool chains, CI systems, and agent frameworks). Using `git -C` ensures 
  every git command executes in the correct repository context regardless of how 
  invocations are orchestrated.

- **Multi-Repository Workflows**: When analyzing or committing changes across 
  multiple repositories in sequence, always use `git -C` with explicit absolute 
  paths to prevent cross-repository contamination:
  
  ```bash
  git -C /repo1 status --porcelain
  git -C /repo2 status --porcelain
  git -C /repo1 add file.txt  # Executes only in /repo1
  ```

- **Audit Trail Clarity**: Using `git -C /absolute/path` makes command intent 
  explicit in logs and transcripts, eliminating ambiguity about which repository 
  is being operated on.

***

## 1. Phase 1: Repository State & Branch Verification

Before any staging or commit operations, the agent MUST verify the repository's health and branch state.

- **Active Branch Mandate**: The agent MUST NOT commit to a "detached HEAD" state (common in submodules). 
- **Branch Checkout**: If in a detached state, the agent MUST explicitly check out the appropriate branch (usually the default branch, e.g., `main`) before proceeding.
- **Upstream Synchronization**: The agent MUST ensure the local branch is synchronized with its upstream (e.g., via `git pull`) to avoid conflicts during the push phase.
- **Build Tool Permissions**: The agent MUST ensure that necessary build tools (e.g., `gradlew`) have appropriate execute permissions before starting the commit process.

***

## 2. Phase 2: Deep Change Analysis

Before staging any files, the agent MUST perform a dependency analysis of all
modifications.

- **Complete Scope (Critical)**: The analysis MUST cover ALL three change
  categories — **staged**, **unstaged**, AND **untracked** — as a single
  unified inventory from the very first step. Untracked files are first-class
  members of the change scope, not a secondary check. Failing to include
  untracked files in the initial analysis leads to incomplete commit plans and
  files discovered only after execution.
- **Shared Identifiers**: Group changes that modify the same functions,
  classes, or constants across different files.
- **Cross-File References**: If file A depends on a change in file B (e.g., an
  import or a link), they MUST be part of the same atomic commit.
- **Untracked File Discovery**: The agent MUST include untracked files
  reported by `git status` in the initial change inventory. They MUST appear
  in the same file table and grouping analysis as staged and unstaged changes.
- **Implicit Tracking**: Any untracked file not excluded by `.gitignore` is a
  candidate for version control to ensure project completeness.
- **Mandatory Confirmation**: The agent MUST NOT stage or commit untracked
  files without explicit user confirmation, especially in repositories with
  minimal or default `.gitignore` files, to avoid accidentally committing
  private credentials, large binaries, or environment-specific files.
- **Categorical Alignment**: Group changes by their architectural layer (e.g.,
  UI, Logic, Docs) unless they are functionally coupled.
- **Workflow-First Priority**: If changes involve CI/CD workflows (GitHub
  Actions, scripts), the agent **MUST** fix, test, and verify the workflow
  functionality *before* arranging or executing commits. Functional stability
  of the CI pipeline takes precedence over documentation or stylistic
  refinements.

***

## 3. Phase 3: Logical Grouping (Arrangement)

The agent must "arrange" the detected changes into a proposed sequence of
commits.

- **Independence**: Each commit should be able to stand alone. If the
  repository were checked out at that commit, it should still build/function
  (or at least be logically coherent).

### 2.5 Core Mandates & Process Discipline

To ensure absolute precision and user control, the agent MUST adhere to these foundational mandates:

- **Renaming & Reference Integrity (CRITICAL)**: When a file or symbol is
  renamed or moved, the agent MUST stage both the old file (deletion/move source)
  and the new file (addition/move target) together. ALL internal and external
  references to that name (links, CI workflows, imports, configuration pointers)
  MUST be updated within the SAME atomic commit.
- **Relocation Integrity (CRITICAL)**: When moving files between directories
  or repositories, the agent MUST update all internal relative paths within the
  moved files AND update all external references in the codebase within the
  SAME atomic commit.
- **Automated Commit Prohibition (GLOBAL)**: The agent MUST NOT automatically
  commit changes after performing any task (fixing errors, refactoring, moving
  files) unless explicitly instructed by the user for that specific action.
- **Staging Discipline & Git Status Analysis**: The agent MUST run `git status`
  before every staging action and analyze the output (including user-staged
  files). Only planned files/hunks for the CURRENT atomic unit should be staged.
- **Serial Execution & Command Isolation**: Commits must be executed one by one.
  Chaining commands (e.g., `&&`) is FORBIDDEN unless explicitly said by the user.
- **Single-Linter Isolation**: Changes related to different linters (e.g.,
  Harper vs. Pylint) MUST NOT be clubbed. Rationale: They serve different
  technical purposes and should be committed separately to ensure maximum
  atomicity and ease of review.
- **Script Execution Prohibition**: The agent MUST NOT run any scripts during
  commit preparation unless explicitly authorized.

- **Atomic Principle**: Never commit half of a logical change. If a file
  contains two unrelated changes, use **Hunk-Based Staging**.
- **Buildable State Priority**: While atomicity is the goal, maintaining a
  buildable repository takes precedence. If a core infrastructure change
  (e.g., a signature change in a shared helper) breaks all consumers, the
  refactor and the resulting fixes in consumer files MUST be consolidated
  into a single commit. This prevents "broken" points in history.
- **The Commit Preview (Mandatory Verbose Display)**:
    - Present the proposed "Arranged Commits" to the user for approval using a
    structured format that provides **maximum details**.
    - For files with mixed concerns requiring hunk-based staging, the preview
    **MUST** include the specific **git hunks (diff blocks)** and a file
    preview for each logical unit.
    - Format:

    ````markdown
    ## Arranged Commits Preview

    ### Commit 1: [type](scope): [title]
    - **Files**: [file1.md], [file2.md]
    - **Message**:
      ```bash
      [type](scope): [title]

      [Body line 1]
      [Body line 2]
      ...
      ```
    - **Hunks/Preview**:
      ```diff
      [Show actual hunks for this commit]
      ```

    ### Commit 2: [type](scope): [title]
    - **Files**: [file3.md]
    - **Message**:
      ```bash
      [type](scope): [title]

      [Body line 1]
      ...
      ```
    ---
    Please say "start" to begin the sequential execution of these atomic
    commits.
    ````

- **Commit Authorization**: The agent **MUST NOT** proceed with any commit
  execution until the user explicitly says **"start"**. Other triggers like
  "commit" or "go" are insufficient; strict authorization ensures the user
  has reviewed the verbose preview.

***

## 4. Phase 4: Interactive Hunk-Based Staging

When a file contains mixed concerns, the agent MUST use interactive staging
tools.

- **Command**: `git add -p <file>`
- **Philosophy (Chunk Committing)**: Also known as "hunk-based staging". This
  is the mandatory method for ensuring no "unrelated noise" or "piggybacked"
  style fixes leak into functional commits. Every modified line must be
  evaluated: "Does this line belong to the *current* atomic goal?"
- **Hunk-by-Hunk Execution**: During interactive staging, the agent MUST
  evaluate and respond to each hunk individually (`y`, `n`, `s`, etc.). Do
  not batch responses. This ensures each decision is deliberate and minimizes
  the risk of staging unrelated changes.
- **Granular Hygiene**: If a grammatical fix is discovered while implementing
  a feature, it MUST be staged and committed separately (either before or
  after) unless it is part of the same logical chunk. Continuous use of
  `git add -p` ensures high-quality, noise-free history.
- **Verification**: Run `git diff --cached` after staging each chunk to
  guarantee strictly atomic contents.

***

## 5. Phase 5: Formatting and Structural Partitioning

To prevent stylistic or structural changes from obscuring functional history,
the agent MUST explicitly partition these modifications into distinct
non-functional commits.

### 4.1 Formatting & Stylistic Consolidation

- **Target**: Purely aesthetic changes such as indentation fixes, white-space
  adjustment, or Markdown header-level corrections.
- **Rule**: If multiple files require these adjustments, they MUST be clubbed
  into a single, dedicated "formatting-only" commit (Commit type: `style`).

***

### 4.2 Structural Refactor Isolation

- **Target**: Functional-preserving reorganizations such as alphabetical
  reordering of methods, variables, or constants.
- **Rule**: These changes MUST be isolated into dedicated commits (Commit type:
  `refactor`). Unlike formatting, large structural reorders should typically
  be committed on a per-file or per-logical-group basis to ensure the "move"
  history is clear.
- **Zero Mixture**: Never mix formatting (Phase 4.1) with structural refactors
  (Phase 4.2) or functional logic (Phase 2) in the same commit. Use
  `git add -p` or Intermediate State Synthesis to ensure absolute
  partitioning.

***

## 6. Phase 6: Configuration Coupling

Tool configurations and metadata must be atomically linked to the documentation
or code they support.

- **Functional Pairing**: Updates to `.vscode/settings.json` (e.g., cSpell
  words), `.lintrc`, or other configuration files MUST be staged and
  committed alongside the functional changes that necessitate them.
- **IDE Project Files**: Shared IDE configuration files (e.g., `.idea/` core
  XMLs or `.vscode/` shared settings) that establish the project structure,
  SDKs, or common tooling MUST be tracked and committed to ensure environment
  parity. Workspace-specific or personal settings (e.g., `workspace.xml`) MUST
  remain ignored.
- **Example**: If adding a new rule file introduces new technical terms, the
  cSpell update for those terms MUST be part of the same atomic unit as the
  rule file addition.

***

## 7. Phase 7: Submodule Synchronization Protocol

When managing submodules, the main repository's history must remain descriptive
and clear.

- **Synchronized Commits**: Every functional update in a submodule requiring a
  pointer update in the main repo MUST be coupled with its relevant main-repo
  configuration changes (e.g., CI scripts or IDE settings).
- **Orchestration**: Delegate metadata extraction to the
  `git_submodule_commit_details` skill to ensure zero-omission fidelity.
- **Commit Message Generation**: All submodule sync commits MUST follow the
  strict formatting, chronological ordering, and metadata requirements defined in
  [git-commit-message-rules.md#5-submodule-sync-commits-parent-repository](./git-commit-message-rules.md#5-submodule-sync-commits-parent-repository).
- **Submodule History Integrity**: Before updating a submodule pointer in the
  parent repository, the changes *within* the submodule MUST be committed
  according to these exact atomic construction rules. A "dirty" or
  uncommitted submodule state is prohibited during a parent-repo sync.

*** 

### 7.1 Ordering & Priority (CRITICAL)

- **Submodule-First Discipline**: When a submodule has pending commits (either
  staged, unstaged, or untracked), the agent MUST handle ALL submodule commits
  BEFORE proceeding to any parent-repository work. Submodule work takes
  absolute priority.
- **Parent Sync Trigger**: ONLY after the submodule's working tree is clean and
  all submodule commits are finalized does the agent check the parent repository
  for a stale submodule pointer. If the parent's recorded SHA differs from the
  submodule's HEAD, the parent sync commit becomes the **next atomic unit**.

*** 

### 7.2 Parent-Side Change Grouping

- **Related Parent Changes CAN be Grouped**: If the parent repository contains
  unstaged changes that are **directly related to the submodule update** (e.g.,
  adding skill implementation code for a newly committed rule, updating CI
  workflows that reference the submodule, or documentation that describes the
  submodule's new behavior), these changes MAY be combined with the submodule
  SHA sync commit into a single atomic unit.
  - The combined commit MUST clearly document BOTH the submodule pointer advance
    AND the parent-side functional changes in the commit body.
  - The commit message MUST explain the coupling rationale: e.g., "Skill
    implementation for the newly mandated rule" or "CI update to support
    submodule's new behavior."
- **Unrelated Parent Changes MUST be Separate**: If the parent repository has
  changes unrelated to the submodule update (e.g., fixing a typo in an unrelated
  README, updating a different skill), these MUST be staged and committed
  **after** the submodule sync commit completes, as a separate atomic unit.

*** 

### 7.3 Automatic Parent Sync Offer (MANDATORY)

Immediately after successfully committing ANY change to a submodule repository,
the agent MUST:

1. **Check parent state** — If the submodule is nested inside a parent Git repo,
   run `git -C <parent-path> status` to verify the submodule entry shows
   `modified: <submodule-name> (new commits)`.
2. **Present arranged commit preview** — Show the parent sync commit using the
   full arranged commits format (§4) BEFORE the user has a chance to say
   anything else.
   - If parent-side related changes exist, group them with the SHA update as
     described in §7.2.
3. **Prompt explicitly**: "The parent repository needs a submodule SHA update.
   Execute sync?" (or equivalent directive).
4. **On "yes"** — Execute the parent sync commit **immediately** without
   re-preview.
5. **On "no" or ambiguous** — Do NOT commit. Await explicit user directive.
6. **Do not proceed** to unrelated tasks until the parent sync matter is
   resolved (either committed or explicitly deferred by user).

***

## 8. Phase 8: Handling Generated Files vs. User Customization

When a file (e.g., `.gitignore`) contains both standard API-generated content
(e.g., from gitignore.io) and user-defined custom rules, these MUST be split
into separate commits.

- **Commit A (The Foundation)**: Commit **only** the standard, API-generated
  portion first.
- **Methodology**: Back up the full file, overwrite with the exact API content
  (or equivalent standard sections), and commit.
- **Rationale**: Establishes a clean, reproducible baseline.
- **Commit B (The Customization)**: Commit the user-defined sections (patches/
  custom rules) in a subsequent commit.
- **Rationale**: Clearly distinguishes between "standard boilerplate" and
  "project-specific logic".
- **Handling Modifications**: If the user has altered the API-generated
  portion, these alterations must also be separated from the raw API import
  if possible, or documented clearly as user-patches on top of the base.

***

## 9. Phase 9: Commit Message Quality Standards

- **Specificity Over Genericity**: Avoid generic titles like `os-specific`.
  Instead, list the specific components: `add linux, macos, and windows
  gitignore rules`.
- **Anti-Repetition**: The commit body MUST NOT merely rephrase the title.
- **Bad**: Title: `add vscode gitignore rules`. Body: `Add VisualStudioCode
  exclusion rules`.
- **Good**: Title: `add vscode gitignore rules`. Body: `Sourced from
  gitignore.io to exclude editor artifacts`.
- **Context Enrichment**: Ensure it explains the 'Why' behind the changes,
  especially for architectural or security-related decisions.
- **Reflecting Atomic Logic**: The commit body MUST explicitly state the
  rationale for grouping these specific changes together. If multiple files
  are involved, explain their functional coupling (e.g., "Updates both the
  API endpoint and the matching UI handler to ensure type safety for the new
  status field").
- **Constraint Documentation**: Mention any specific constraints or external
  dependencies that influenced the atomic grouping (e.g., "Includes the
  shared utility class to satisfy the compile-time dependency in the main
  logic").
- **Contextual Accuracy**: Ensure terms usage is precise (e.g., "Supabase
  project-specific" instead of generic "project-specific").
- **Body/Diff Congruence**: The commit message body **MUST** be a complete and
  accurate human-readable summary of all changes presented in the `Hunks/
  Preview` section of the commit plan. It is the AI's primary responsibility
  to make it easy for the user to confirm that the textual description
  perfectly matches the code modifications. Any discrepancy identified by the
  user requires an immediate and corrected preview.

***

## 10. Phase 10: Execution & Verification

- **Step-by-Step**: Execute commits one-by-one according to the approved
  arrangement.
- **History Refinement**: If existing commits need to be split or refined
  (e.g., to fix non-atomic changes), follow the **[Git History Refinement
  Rules](./git-history-refinement-rules.md)**.
- **Unstaged Changes During Rebase**: If rebase fails due to unstaged changes,
  use the stash workflow (see git-operation-rules.md Section 3).
- **Pull Before Push**: Always `git pull` (or `git pull --rebase` upon explicit
  approval) before pushing to incorporate latest remote changes.
- **Recovery**: If a mistake is made during staging, use `git reset <file>` to
  unstage, or `git checkout -p` to selectively discard. **WARNING**: Never
  use `git reset --hard` for synchronization; always prefer `git pull`.
- **Opaque Content Analysis**: For files flagged as binary or large assets
  (LFS), the agent MUST verify the internal consistency of the commit by
  inspecting the file contents (e.g., via `cat -v` or hex dump) to ensure the
  commit message accurately reflects the data being stored.

***

## 11. Phase 11: Logic-Documentation Alignment (Compass)

Imagine a compass where each cardinal direction is a logical area of the
codebase.

- **North**: Architectural/Schema changes.
- **East**: Logic/Feature implementation.
- **West**: Testing/Verification.
- **South**: Documentation/Refinement.

A high-quality commit history moves clearly through these directions without
"spinning" (mixing logic and documentation in one commit).

***

### 10.1 External Tool Asset Granularity (e.g., Postman)

When versioning assets for external tools (Postman, Insomnia, DBeaver), maximize
granularity by separating concerns:

- **Environments**: Changes to endpoints, variables, or credentials.
- **Collections**: Logical groupings of requests, tests, or scripts.
- **Data Tables**: CSV/JSON templates used for bulk-run or validation testing.

Never group these into a single generic `test(tooling)` commit if they serve
distinct purposes.

***

## 12. Phase 12: Source Logic & Generated Files

When working with repositories that use code generation, templates, or CI/CD
automation, the agent MUST distinguish between source logic and generated
output.

### 11.1 Update the Source, Not the Output

- **Rule**: Never manually edit generated files. Always update the source logic
  (templates, scripts, CI/CD workflows) that produces them.
- **Examples**:
    - `README.md` generated from `templates/README.md.template` -> Edit the
    template, not `README.md`
    - `agent-rules.md` generated by `scripts/sync_rules.py` -> Edit the script
    or source metadata, not `agent-rules.md`
    - Build artifacts, compiled code, or auto-formatted files -> Edit source
    code or configuration

***

### 11.2 Identify Synchronization Mechanisms

Before making changes, the agent MUST:

1. **Detect Generation**: Check for comments like `<!-- AUTO-GENERATED -->`,
  build scripts, or CI/CD workflows that regenerate files.
2. **Locate Source**: Identify the template, script, or configuration that
  produces the generated file.
3. **Document Sync**: Note in commit messages if manual synchronization is
  required (e.g., "Run `npm run build` to regenerate").

***

### 11.3 CI/CD Managed File Exclusion

Files managed by CI/CD automation MUST be excluded from manual edits during
history refinement or atomic commit construction.

- **Exclusion List**: Maintain an explicit list of CI/CD managed files (e.g.,
  `README.md`, `agent-rules.md`).
- **Grep Exclusions**: When verifying link updates, use `--exclude` flags for
  these files:

  ```bash
  grep -r "old-name.md" . --exclude-dir=.git --exclude=README.md \
    --exclude=agent-rules.md
  ```

- **Commit Verification**: Before committing, run `git diff --cached` and verify
  no CI/CD managed files are staged unless the commit explicitly targets the
  source logic that generates them.

***

## 13. Phase 13: User-Requested Coupling & Deviations

The agent must strictly follow the atomic protocols defined above. However, if
the user explicitly requests to couple unrelated changes or deviate from the
rules, the following protocol applies:

- **Warn First**: If a request violates the Independence (Phase 2) or
    Configuration Coupling (Phase 5) rules, the agent MUST explicitly warn the
    user: "This coupling technically violates Rule [X] because [reason]."
- **Explicit Override**: The agent accepts the coupling ONLY if the user
    re-confirms or explicitly approves the deviation after the warning.
- **Documentation**: The deviation rationale MUST be documented in the commit
    message body (e.g., "Coupled with IDE updates per user request for atomic
    convenience").

***

## 13. Phase 13: Intermediate State Synthesis

When a file contains interleaved changes or massive structural reorders (e.g.,
50+ lines moved) mixed with functional fixes, hunk-based staging
(`git add -p`) may become unreliable or impossible to isolate.

- **The Synthesis Strategy**: The agent SHOULD NOT rely solely on interactive
  staging for high-complexity overlaps. Instead, it MUST:
  1. **De-construct**: Manually edit the file (or use selective undo/revert)
    to match the current atomic goal BEFORE staging.
  2. **Stage & Commit**: Stage the "synthesized" intermediate version that
    contains ONLY the intended logical unit.
  3. **Iterate**: Repeat for the remaining changes until the working
    directory is clean.
- **Rationale**: Guarantees that even high-entropy working states can be
  refactored into a pristine, industrial-grade commit history.

***

## 14. Related Conversations & Traceability

- **API Refactoring & Postman Granularity**:
  [2026-02-11 Atomic Commit Refinement](./docs/conversations/2026-02-11-atomic-commit-refinement.md)
- **Rule Standardization**: [2026-02-11 Rule Refinement Session]

***

## 15. Phase 15: Guardrail Against "Predictive Planning"

The agent must never "commit" in a plan to what will be changed in the future.
Commit construction is a Real-Time Analysis task. The implementation plan serves
only as a roadmap for the **Protocol** of commitment, not the **Content** of the
commits themselves. Logic for commit construction must be synthesized from
Real-Time Analysis, never mocked in a plan.
