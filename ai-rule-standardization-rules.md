<!--
title: AI Agent Rule Standardization Rules
description: Craftsmanship standards for developing "Ultra-Lean Industrial" AI Agent Rules,
    ensuring consistent formatting,
    structural hierarchy, and pedagogical clarity.
category: Rule-Management
-->

# AI Agent Rule Standard Creation

This document defines the craftsmanship standards for creating new AI Agent Rules. Adhering to these protocols ensures
that all rules remain professional, machine-parseable, and human-readable.

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
- **Skill Directory**: Skills are housed in `.agent/skills/<skill-name>/`.
- **Core Skill Files**:
    - `SKILL.md`: The Single Source of Truth (SSOT). Contains active instructions following the **agentskills.io protocol**
      (YAML frontmatter + Markdown body).
    - `AGENTS.md`: The companion bridge. Provides "passive context" and refers tools back to the `SKILL.md`.
- **Independence Mandate**: Every Skill MUST be self-contained. It MUST manage its own environmental verification,
  dependencies, and execution logic independently.

- **Fine Naming**: Use strictly lowercase, kebab-case ending in `-rules.md`(e.g.,`git-submodule-rules.md`).

- **YAML Frontmatter**: Every file MUST start with the following metadata block:

    ```markdown
    <!--
    title: [Short, Impactful Title]
    description: [One-sentence summary of the rule's scope]
    category: [Existing or New Category]
    -->
    ```bash

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

- **Artifact Linting Mandate**: All Markdown artifacts (Plans, Tasks, Walkthroughs) MUST be verified with `markdownlint-cli`
  prior to user presentation. Any violations MUST be resolved.

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
    (`ai-agent-rules/docs/`) using a structured hierarchy. All session or conversation logs MUST follow the protocols
    defined in **[AI Agent Session Documentation Rules](./ai-agent-session-documentation-rules.md)**. For relative paths,
    artifact permanence, and link references, follow the **File References** standards defined in
    **[Markdown Generation Rules](./markdown-generation-rules.md)** and
    **[Markdown Generation Rules Additions](./markdown-generation-rules-additions.md)**.

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
