<!--
title: AI Agent Rule Standardization Rules
description: Craftsmanship standards for developing "Ultra-Lean Industrial" AI Agent Rules, ensuring consistent formatting, structural hierarchy, and pedagogical clarity.
category: Rule-Management
-->

# AI Agent Rule Standard Creation

This document defines the craftsmanship standards for creating new AI Agent Rules. Adhering to these protocols ensures that all rules remain professional, machine-parseable, and human-readable.

***

### 1. Preparation & Context Assembly (Crucial)

Before drafting a rule file, the agent MUST:
1. **Assemble Conversation Points**: Review the entire conversation history to capture specific user preferences, edge cases discussed, and implied constraints (e.g., "plain text only", "no icons").
2. **Identify Edge Cases**: Explicitly document "what not to do" based on user feedback (e.g., "Articles don't support tags").
3. **Synthesize Limitations**: If a platform or tool has limitations (e.g., LinkedIn Article tags), the rule MUST address them.

***

### 2. File Naming & Meta-Data

All rule files must be stored in the `AI-Agent-Rules` directory.

- **Fine Naming**: Use strictly lowercase, kebab-case ending in `-rules.md` (e.g., `git-submodule-rules.md`).
- **YAML Frontmatter**: Every file MUST start with the following metadata block:
    ```markdown
    <!--
    title: [Short, Impactful Title]
    description: [One-sentence summary of the rule's scope]
    category: [Existing or New Category]
    -->
    ```

***

### 2. Structural Hierarchy

Rule files must follow a predictable, industrialized structure to maximize readability:

1. **H1 Title**: Matches the YAML title but is more formal (e.g., `# Git Submodule Management Rules`).
2. **Scope Statement**: A brief paragraph defining *why* the rule exists and who the stakeholders are.
3. **Section Dividers**: Use `***` (horizontal rules) between major H3 sections.
4. **Numbered Sections**: Use H3 headers with sequential numbering (e.g., `### 1. Preparation & Context Assembly`).
5. **Sub-sections**: Use H4 for specific technical details (e.g., `#### 1.1 Command Syntax`).
6. **Related Conversations**: Use an H3 section at the bottom for traceability (e.g., `### 6. Related Conversations & Traceability`), linking to permanent session logs in the `docs/conversations/` directory.

***

### 3. Content Philosophy (Ultra-Lean Industrial)

The content must balance conciseness with technical depth:

- **Zero Noise**: Avoid introductory fluff, "happy to help" phrases, or redundant explanations.
- **Pedagogical Snippets**: Use code blocks to demonstrate correct command usage or file formats.
- **Architectural Samples (PoC)**: Rules defining complex patterns MUST link to high-fidelity reference implementations (templates) in the `/architectures/` directory. These MUST include a `package.json` for dependency transparency.
    - **Industrial Portability**: All implementations MUST be linked as examples so that when a rule or standard changes, the reference implementations can be updated in sync.
- **Industrial Folder Structure**: For feature-level or architecture rules, the rule MUST follow a standardized directory structure:
    - `/types.ts`: Centralized Enums and Interfaces (SSOT).
    - `/config.json`: Environmental/Externalized configuration to avoid hardcoded logic.
    - `/engine.ts` or `/index.ts`: Main logic or entry point.
    - `/docs/`: Implementation plans and technical goal documents.
    - `/*.md`: Every code file MUST have an adjacent Markdown file explaining the code line-by-line with usage scenarios. These explainers MUST be pedagogical and deep, assuming the reader may be new to specific APIs (e.g., Worker, WebSocket).
- **Technology Independence & Depth**: Rules MUST be technology-independent in their core principles but MUST provide maximum-detail, industry-standard examples (e.g., Nostr, WASM, RxDB) that can be reused according to the specific context.
- **Context Discovery Protocol**: Rules MUST mandate that the assistant:
    1. **Identifies Context**: Detect build tools (Vite/CRA), frameworks (React/Vue), and identifiers (Email/PubKey).
    2. **Confirms Context**: Explicitly ask the user to confirm the detected environment before proceeding.
- **SSOT (Single Source of Truth)**: Rules MUST mandate centralized Enums for any inter-process (Worker) or inter-component communication to prevent "magic string" typos.
- **Decoupled Configuration**: Parameters likely to change (Relays, Endpoints, feature toggles) MUST be isolated in machine-readable config files (JSON preferred).
- **Storage Logic Hierarchy**: Rules MUST provide a selection logic for storage (Relational -> NoSQL -> File -> Text) based on problem context. Priority MUST be documented (e.g., 1st, 2nd, 3rd) with clear rationale for each.
- **Performance Abstraction**: Mandate backgrounding (Workers/Threads) for all heavy logic (Crypto/Network) to ensure 60 FPS UI stability.
- **Coding Standards (SSOT & Safety)**:
    - **Comment Style**: Comments MUST be placed *before* the code line or in block format. Avoid trailing comments after semicolons.
    - **Deep Type Safety**: Implementations MUST avoid `any` and use deep typing for all data structures (e.g., MessageEvent data).
    - **Real Usage Samples**: Rules for frameworks (React/Vue) MUST include a real integration sample showing component/hook orchestration.
- **Prohibited Behaviors**: Explicitly list actions the agent is forbidden from taking (e.g., "DO NOT hardcode keys", "DO NOT block UI"). These MUST be clear, non-ambiguous, and explained as the SSOT for what to avoid.
- **Traceability Portability**: Permanent session logs MUST be stored in `ai-agent-rules/conversations/` to ensure the rule set remains a self-contained, portable unit.
- **Mandatory Protocols**: Use clear, imperative language (e.g., "The agent MUST...", "The agent is BLOCKED from...").

***

### 4. Verification & Commit

Before finalizing a new rule:
1. **Cross-Reference**: Check for existing rules to avoid duplication.
2. **Lint Check**: Ensure all content complies with **[Markdown Generation Rules](./markdown-generation-rules.md)**.
3. **Sync Trigger**: Remind the user to trigger the `agent-rules.md` update workflow.
4. **Commit Message**: Use Conventional Commits (e.g., `feat: establish standard creation rules for AI agents`).
