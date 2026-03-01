# AI Agent Rules Index

This file is a comprehensive, flat index of all rule files in this repository.

> **Note**: For categorized views, usage examples, and architecture details, please see the [Main README](./README.md).

## Rule List

### Android Development

| File | Purpose |
| :--- | :--- |
| [`android-app-launch-rules.md`](./android-app-launch-rules.md) | Automated protocol for emulator setup and deployment, optimized for M2 machines, with architecture and device fallbacks. |

### Architecture & Dependency Management

| File | Purpose |
| :--- | :--- |
| [`strict-dependency-freezing-rules.md`](./strict-dependency-freezing-rules.md) | Industrial protocol for ensuring reproducible builds by pinning exact versions of all external dependencies in package-level configuration. |

### Architecture & Sync

| File | Purpose |
| :--- | :--- |
| [`zero-backend-sync-rules.md`](./zero-backend-sync-rules.md) | Architecture and implementation standards for background, invisible data synchronization using decentralized relays (Nostr), local-first storage (RxDB), and WASM hardening. |

### Build-Management

| File | Purpose |
| :--- | :--- |
| [`kmp-version-upgrade-rules.md`](./kmp-version-upgrade-rules.md) | A specific technical protocol for upgrading Kotlin, AGP, and related dependencies in a Kotlin Multiplatform project. |

### CI/CD & DevOps

| File | Purpose |
| :--- | :--- |
| [`Docker-rules.md`](./Docker-rules.md) | Guidelines for Docker containerization, best practices for Dockerfiles, and image optimization. |
| [`ci-cd-rules.md`](./ci-cd-rules.md) | Principles and practices for CI/CD, including protected branches, security, observability, advanced deployment strategies, and automated rollbacks. |
| [`github-actions-workflow-rules.md`](./github-actions-workflow-rules.md) | Rules for GitHub Actions workflows, covering trigger preferences, security, performance, and integrations. |
| [`render-deployment-rules.md`](./render-deployment-rules.md) | Deployment configurations for Render, including environment variables and custom domains. |

### Code Quality & Linting

| File | Purpose |
| :--- | :--- |
| [`shellcheck-fixer-rules.md`](./shellcheck-fixer-rules.md) | Specialized rules for repairing shell scripts to meet ShellCheck standards. |

### Core Agent Behavior

| File | Purpose |
| :--- | :--- |
| [`ai-agent-planning-rules.md`](./ai-agent-planning-rules.md) | Guidelines for agent planning, including the core directive to plan before acting and a protocol for iterative plan revisions. |
| [`ai-agent-session-documentation-rules.md`](./ai-agent-session-documentation-rules.md) | Protocol for documenting AI agent sessions or conversations as Markdown, including file attachment references, structured data, and traceability. |
| [`ai-tools-rules.md`](./ai-tools-rules.md) | Comprehensive rules for AI tool usage, including mandates for output visibility, explicit user confirmation for file writes, and integration with agent planning and security protocols. |
| [`github-cli-permission-rules.md`](./github-cli-permission-rules.md) | Explicit permission protocol for running `gh` commands, ensuring user control and transparency. |
| [`moltbridge-discovery-rules.md`](./moltbridge-discovery-rules.md) | Industrial standards for social graph broker discovery, trust threshold mandates, and cross-tool analysis traceability. |
| [`node-crypto-mcp-infrastructure-rules.md`](./node-crypto-mcp-infrastructure-rules.md) | Industrial standards for Ed25519 reliability, Uint8Array sanitization, and Zero-Network MCP Server architecture. |
| [`postman-mcp-server-rules.md`](./postman-mcp-server-rules.md) | Standards for configuring, using, and troubleshooting the Postman MCP Server in AI agent environments. |
| [`shell-execution-rules.md`](./shell-execution-rules.md) | Guidelines for shell command execution, ensuring transparency, user control, and adherence to security protocols. |

### Data Safety & Integrity

| File | Purpose |
| :--- | :--- |
| [`zero-data-loss-cloud-cleanup-rules.md`](./zero-data-loss-cloud-cleanup-rules.md) | Mandatory verification protocol before deleting cloud-synced local files to prevent data loss. |

### Data Transfer & Cloud Storage

| File | Purpose |
| :--- | :--- |
| [`rclone-download-rules.md`](./rclone-download-rules.md) | Protocol for efficient, reliable, and user-controlled rclone downloads with progress tracking, size-based ordering, and integrity verification. |

### Development Frameworks

| File | Purpose |
| :--- | :--- |
| [`flutter-app-development-rules.md`](./flutter-app-development-rules.md) | Rules for Flutter app development, including version pinning with `mise`, dependency management, and mandatory documentation. |

### Documentation & Standards

| File | Purpose |
| :--- | :--- |
| [`code-documentation-rules.md`](./code-documentation-rules.md) | Standards for deep-dive, pedagogical code documentation including adjacent markdown files and various folder patterns. |
| [`markdown-generation-rules.md`](./markdown-generation-rules.md) | Standards for creating machine-parseable, lint-compliant markdown documents. |

### Git & Repository Management

| File | Purpose |
| :--- | :--- |
| [`git-atomic-commit-construction-rules.md`](./git-atomic-commit-construction-rules.md) | Authoritative protocol for analyzing, grouping, and arranging changes into logical, independent atomic units before execution. |
| [`git-commit-message-rules.md`](./git-commit-message-rules.md) | Strict rules for generating git commit messages, enforcing Conventional Commits, contextual information in titles, and no redundancy between title and body. |
| [`git-gitignore-handling-rules.md`](./git-gitignore-handling-rules.md) | Protocols for generating, maintaining, and customizing .gitignore files using standard APIs. |
| [`git-history-refinement-rules.md`](./git-history-refinement-rules.md) | Protocols for refining existing commit history using backup branches, jq for JSON atomicity, and tree parity verification. |
| [`git-operation-rules.md`](./git-operation-rules.md) | Strict protocols for standard Git operations (commits & pushes), mandating explicit user requests and forbidding auto-actions. |
| [`git-rebase-standardization-rules.md`](./git-rebase-standardization-rules.md) | Industrial protocol for hierarchical branch rebasing, cross-branch deduplication, and literal commit fidelity. |
| [`git-repo-management-rules.md`](./git-repo-management-rules.md) | Comprehensive protocol for the repository lifecycle, including standardized creation, CLI-based cloning, submodule initialization, and auto-indexing. |
| [`git-submodule-history-repair-rules.md`](./git-submodule-history-repair-rules.md) | Protocols for repairing broken submodule pointers caused by history rewrites in submodule repositories. |
| [`git-submodule-rules.md`](./git-submodule-rules.md) | Protocols for managing submodules, preventing detached HEAD states, proper branch tracking, and descriptive parent commit messages. |
| [`git-text-normalization-rules.md`](./git-text-normalization-rules.md) | Rules to ensure Git treats text files correctly across encodings and platforms, preventing binary diffs and EOL churn. |
| [`github-pr-management-rules.md`](./github-pr-management-rules.md) | Sequential, CLI-first protocols for handling Pull Requests, emphasizing security for private repositories and explicit user handoff. |
| [`github-repo-metadata-management-rules.md`](./github-repo-metadata-management-rules.md) | Ultra-Lean Industrial protocols for Metadata-as-Code (MaC), using README.md as the absolute Single Source of Truth with visible markers for automation. |
| [`repo-discovery-rules.md`](./repo-discovery-rules.md) | Multi-platform repository discovery and smart cloning workflows. |

### GitHub Actions

| File | Purpose |
| :--- | :--- |
| [`GitHub-Action-Creation-rules.md`](./GitHub-Action-Creation-rules.md) | Strict guidelines for creating, structuring, and publishing GitHub Composite Actions to the Marketplace. enforce "Industrial" standards. |

### Languages & Stacks

| File | Purpose |
| :--- | :--- |
| [`typescript-rules.md`](./typescript-rules.md) | Industrial standards for TypeScript configuration, strictness, and strict dependency freezing. |

### Mobile Development

| File | Purpose |
| :--- | :--- |
| [`flutter-android-rules.md`](./flutter-android-rules.md) | Specific guidelines for Android configurations within Flutter projects. |

### Package Management

| File | Purpose |
| :--- | :--- |
| [`brew-rules.md`](./brew-rules.md) | Comprehensive SSOT for Homebrew operations, including installation preferences, keg-only handling, and exclusion-based upgrade workflows. |
| [`mise-plugin-backend-management-rules.md`](./mise-plugin-backend-management-rules.md) | Intelligent backend selection for mise plugin installations with fallback handling and user prompts. |

### Quality Assurance & Verification

| File | Purpose |
| :--- | :--- |
| [`manual-testing-rules.md`](./manual-testing-rules.md) | Authoritative protocol for designing, documenting, and executing manual verification plans. |

### Rule-Management

| File | Purpose |
| :--- | :--- |
| [`ai-rule-standardization-rules.md`](./ai-rule-standardization-rules.md) | Craftsmanship standards for developing "Ultra-Lean Industrial" AI Agent Rules, ensuring consistent formatting, structural hierarchy, and pedagogical clarity. |

### Shell-Scripting

| File | Purpose |
| :--- | :--- |
| [`bash-scripting-rules.md`](./bash-scripting-rules.md) | Industrial standards for bash script development, including dependency management patterns, alphabetical organization conventions, and idempotent function design. |

### Social Media & Branding

| File | Purpose |
| :--- | :--- |
| [`linkedin-contributor-call-rules.md`](./linkedin-contributor-call-rules.md) | Specialized protocol for drafting "Call for Contributors" posts to recruit developers for personal projects, focusing on mentorship, labour-rich stacks, and leadership. |
| [`linkedin-post-creation-rules.md`](./linkedin-post-creation-rules.md) | Protocol for crafting viral, professional, and accessible LinkedIn posts customized for Banee Ishaque K's persona, emphasizing plain-text optimization and human storytelling. |

### Tech Stack

| File | Purpose |
| :--- | :--- |
| [`nestjs-react-app-rules.md`](./nestjs-react-app-rules.md) | Guidelines for developing NestJS backends with React frontends. |
| [`nestjs-react-flutter-stack-rules.md`](./nestjs-react-flutter-stack-rules.md) | Full-stack guidelines for NestJS/React web apps with an accompanying Flutter mobile client. |

### Tooling & Workflows

| File | Purpose |
| :--- | :--- |
| [`rule-management-rules.md`](./rule-management-rules.md) | Documentation sync and update workflow, including metadata management for rule indexing. |
| [`script-management-rules.md`](./script-management-rules.md) | Script standards, folder usage, and safeguards for helper scripts. |
| [`warp-terminal-ai-rules.md`](./warp-terminal-ai-rules.md) | Backup and reference for Warp AI Agent specific configurations. |

### VCS-Integration

| File | Purpose |
| :--- | :--- |
| [`github-atom-feed-rules.md`](./github-atom-feed-rules.md) | Protocol for generating and providing GitHub repository Atom feed URLs for commits and releases |

