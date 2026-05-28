# AI Agent Rules

Establish trust, transparency, and consistency in AI-assisted development

> A comprehensive framework of standardized rules for AI development workflows

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Baneeishaque/AI-Agent-Rules)
[![Markdown](https://img.shields.io/badge/Format-Markdown-lightgrey?logo=markdown)](https://daringfireball.net/projects/markdown/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Baneeishaque/AI-Agent-Rules/pulls)

***

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Rule Categories](#rule-categories)
- [Architecture](#architecture)
- [Detailed Rule Reference](#detailed-rule-reference)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)
- [Contributing](#contributing)
- [Development Setup](#development-setup)
- [License](#license)

***

## Overview

**AI Agent Rules** is a collection of standardized protocols designed to govern AI agent behavior.
This framework ensures:

- **Transparency**: Every AI action is visible and auditable
- **User Control**: Users maintain ultimate authority over all operations
- **Consistency**: Standardized patterns across all development activities
- **Security**: Principle of least privilege and explicit permission protocols

The repository provides a modular, extensible rule system for AI coding assistants and toolsets.

***

## Key Features

| Feature | Description |
| :--- | :--- |
| 🎯 **Modular Architecture** | Each rule domain is maintained in a separate markdown file for easy management |
| 📖 **Self-Documenting** | Rules are written in clear, unambiguous language with examples |
| 🔗 **Cross-Referenced** | Rules reference each other to form a cohesive framework |
| 🛡️ **Security-First** | Emphasis on permissions, secrets management, and safe operations |
| 🔄 **CI/CD Ready** | Rules designed to integrate with GitHub Actions and deployment pipelines |
| 📱 **Multi-Platform** | Covers Flutter, NestJS, React, Docker, and more |

***

## Quick Start

### Clone the Repository

```bash
# Using GitHub CLI (recommended)
gh repo clone Baneeishaque/AI-Agent-Rules

# Using Git
git clone https://github.com/Baneeishaque/AI-Agent-Rules.git
```

### Browse Rules

1. Start with [`agent-rules.md`](./agent-rules.md) - the central index of all rules
2. Explore specific domain rules based on your needs
3. Reference rules in your AI tool configuration or workflow documentation

### Integrate with Your AI Tool

Reference specific rule files in your AI assistant's context or system prompt:

```markdown
Follow the guidelines in:
- ai-agent-planning-rules.md for planning protocols
- ai-tools-rules.md for tool execution guidelines
- shell-execution-rules.md for command-line operations
```

***

## Rule Categories

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

### Security-Standards

| File | Purpose |
| :--- | :--- |
| [`redaction-portability-rules.md`](./redaction-portability-rules.md) | Public-vs-organization-private repository scope tiers, asymmetric inter-repo linking rules, three sensitivity tiers (identity / topology / public), canonical placeholder vocabulary, and prohibited behaviors that keep every produced artifact safe to publish and portable across machines. |

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
| [`scripting-language-selection-rules.md`](./scripting-language-selection-rules.md) | Decision framework for picking the right scripting / programming language for a given automation, tool, or one-off task — Python as the default, PowerShell as the cross-platform shell-glue, a systems-language tier (C / Go / Rust / Zig) for CPU-bound work, and a special-occasion tier (Java / C# / Node.js / PHP) reserved for ecosystem-driven cases. |
| [`warp-terminal-ai-rules.md`](./warp-terminal-ai-rules.md) | Backup and reference for Warp AI Agent specific configurations. |

### VCS-Integration

| File | Purpose |
| :--- | :--- |
| [`github-atom-feed-rules.md`](./github-atom-feed-rules.md) | Protocol for generating and providing GitHub repository Atom feed URLs for commits and releases |


***

## Architecture

```bash
AI-Agent-Rules/
├── 📄 agent-rules.md                    # Central index (start here!)
│
├── 📖 Documentation & Standards
│   ├── code-documentation-rules.md     # Deep-dive & Pedagogical standards
│   └── markdown-generation-rules.md    # Lint-compliant formatting
│
├── 🧠 Core Agent Rules
│   ├── ai-agent-planning-rules.md               # Planning & workflow protocols
│   ├── ai-tools-rules.md               # Tool execution guidelines
│   └── shell-execution-rules.md        # Command-line safety
│
├── 🔐 Security & Permissions
│   └── github-cli-permission-rules.md  # Permission protocols
│
├── 📱 Development Frameworks
│   ├── flutter-app-development-rules.md            # Flutter best practices
│   ├── flutter-android-rules.md    # Flutter Android specific
│   ├── nestjs-react-app-rules.md       # NestJS + React
│   └── nestjs-react-flutter-stack-rules.md
│
├── ⚙️ CI/CD & DevOps
│   ├── ci-cd-rules.md                  # Pipeline principles
│   ├── github-actions-workflow-rules.md         # Workflow configuration
│   └── render-deployment-rules.md
│
├── 🗃️ Repository Management
│   ├── Git-Repository-rules.md         # Repo creation standards
│   ├── Git-Repo-Cloning-rules.md       # Cloning protocols
│   ├── Git-Repository-Indexing-rules.md
│   └── repo-discovery-rules.md
│
├── 📦 Package & Script Management
│   ├── Brew-Install-rules.md           # Homebrew installation
│   ├── Brew-Upgrade-rules.md           # Package upgrades
│   └── script-management-rules.md      # Script organization
│
├── 🔧 Tooling
│   ├── android-app-launch-rules.md     # Emulator management
│   ├── rule-management-rules.md        # Documentation sync
│   └── warp-terminal-ai-rules.md                   # Terminal configurations
│
└── 📂 Configuration
    ├── .gitignore                      # Git ignore patterns
    └── .vscode/                        # VS Code settings
        ├── settings.json               # Editor configuration
        └── extensions.json             # Recommended extensions
```

***

## Detailed Rule Reference

### Core Planning Protocol (ai-agent-planning-rules.md)

The foundational rule that all agents must follow:

```markdown
1. Deconstruct the Request → Analyze user intent
2. Formulate the Plan    → Create step-by-step approach
3. Present for Approval  → Seek user confirmation
4. Execute the Plan      → Implement approved steps
5. Report Progress       → Summarize completion
```

**Key Principles:**

- ✅ Always plan before acting
- ✅ Plans must be explicit and actionable
- ✅ Support iterative plan revisions
- ✅ Handle ambiguous requests with clarification

### Tool Execution Protocol (ai-tools-rules.md)

```markdown
Core Principles:
- Transparency      → Full visibility of all tool actions
- User Control      → User maintains ultimate authority
- Full Output       → Never truncate stdout/stderr
- Least Privilege   → Minimum necessary permissions
```

**Mandatory User Confirmation Required For:**

- File write operations
- GitHub CLI commands
- Any destructive operations

### Shell Execution Guidelines (shell-execution-rules.md)

```bash
# Always explain critical commands before execution
# Display full output (stdout + stderr)
# Prefer non-interactive commands when possible
# Use background processes (&) for long-running tasks
```

### Flutter Development (flutter-app-development-rules.md)

**Environment Setup:**

```bash
# Use Mise for version management
mise install              # Install SDK versions from mise.toml
mise use flutter@3.x.x    # Pin Flutter version
```

**Code Quality:**

```bash
flutter analyze           # Lint with zero warnings
dart format .             # Format all code
flutter test --coverage   # Run tests with coverage
```

**Project Structure:**

```bash
lib/
├── src/
│   ├── features/         # Feature modules
│   │   ├── feature_name/
│   │   │   ├── domain/   # Business logic
│   │   │   ├── presentation/  # UI
│   │   │   └── data/     # Data sources
│   ├── common/           # Shared utilities
│   ├── core/             # App configuration
│   └── main.dart
```

### CI/CD Best Practices (ci-cd-rules.md)

**GitHub Actions Optimization:**

```yaml
- uses: actions/checkout@v3
  with:
    fetch-depth: 1        # Shallow clone for speed
    sparse-checkout: true # Only needed directories
```

**Security:**

- Use OIDC for cloud authentication
- Never hardcode secrets
- Protected branches required
- Automated secret rotation

**Deployment Orchestration:**

```bash
Supabase → GitHub Actions → Render
   ↓            ↓              ↓
  Router     Executor      Runtime
```

***

## Usage Examples

### Example 1: Planning a Feature Implementation

```markdown
Agent: I will implement the user authentication feature. Here is my plan:

1. Create the authentication model in `lib/src/features/auth/domain/`
2. Implement the auth repository with Firebase integration
3. Build the login screen widget
4. Add unit tests for auth logic
5. Run `flutter analyze` and `flutter test`

Do you approve this plan?
```

### Example 2: Safe Shell Execution

```markdown
Agent: I need to run the following command to install dependencies:

Command: npm install
Purpose: Install project dependencies from package.json
Location: ~/projects/my-app/

Do you want me to proceed?
```

### Example 3: GitHub CLI with Permission

```markdown
Agent: I need to clone the repository. Here is the command:

gh repo clone Baneeishaque/AI-Agent-Rules ~/sample/path/AI-Agent-Rules

This will clone the repository to your local machine.
Do you approve this command? Yes/No
```

### Example 4: Brew Upgrade with Exclusions

```bash
# User: "upgrade except google-chrome@canary"

# Agent runs dry-run, filters results, presents:
brew upgrade --greedy --verbose gh node ollama discord@ptb postman
```

***

## Integration Guide

### With Warp Terminal

1. Open Warp Terminal settings
2. Navigate to AI Agent configuration
3. Reference rule files from this repository
4. Rules sync automatically across devices

### With VS Code

Recommended extensions are pre-configured in `.vscode/extensions.json`. Key extensions include:

```json
{
  "recommendations": [
    "eamodio.gitlens",
    "mhutchie.git-graph",
    "github.vscode-pull-request-github",
    "semanticdiff.semanticdiff"
  ],
  "onlyVscodeSupported": [
    "github.copilot",
    "github.copilot-chat"
  ]
}
```

> **Note**: See `.vscode/extensions.json` for the complete list of recommended extensions organized by platform support.

### With Custom AI Assistants

Include rule files in your system prompt or context:

```python
# Example: Loading rules into context
with open('ai-agent-planning-rules.md', 'r') as f:
    agent_rules = f.read()
    
system_prompt = f"""
You are an AI assistant. Follow these rules:
{agent_rules}
"""
```

### With GitHub Actions

Reference CI/CD rules in your workflow:

```yaml
name: CI Pipeline
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 1  # As per ci-cd-rules.md
```

***

## Contributing

We welcome contributions! Please follow these guidelines:

### Adding New Rules

1. **Create a new rule file**: `<Domain>-rules.md`

   ```markdown
   # Domain Name Rules
   
   Brief description of the rule domain.
   
   ---
   
   ### 1. First Principle
   
   Explanation and examples...
   ```

2. **Update the index**: Add entry to `agent-rules.md`

   ```markdown
   | Rule Domain | [Domain-rules.md](./Domain-rules.md) | Description |
   ```

3. **Commit with conventional message**:

   ```bash
   git commit -m "feat: Add Domain-rules.md for X functionality"
   ```

### Modifying Existing Rules

1. Edit the relevant `*-rules.md` file
2. Ensure cross-references remain valid
3. Update `agent-rules.md` description if needed
4. Use conventional commits:

   ```bash
   git commit -m "docs: Update flutter-app-development-rules.md with state management section"
   ```

### Style Guidelines

- Use clear, unambiguous language
- Include practical examples
- Add emoji icons for visual organization 💡 🛡️ 📜 🔗
- Keep rules actionable and specific
- Reference other rule files when appropriate

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/new-rule-domain`
3. Make your changes
4. Run spell check (VS Code cSpell is configured)
5. Submit a pull request with a clear description

### Repository Topics

Please tag your PR/Repository with relevant topics. See [GITHUB_TOPICS.md](./GITHUB_TOPICS.md) for the complete list and
guidelines.

***

## Development Setup

### Prerequisites

- Git 2.x+
- VS Code (recommended) or any markdown editor
- GitHub CLI (`gh`) for repository operations

### Setup Steps

```bash
# 1. Clone the repository
gh repo clone Baneeishaque/AI-Agent-Rules

# 2. Navigate to directory
cd AI-Agent-Rules

# 3. Open in VS Code
code .

# 4. Install recommended extensions (prompted automatically)
```

### VS Code Configuration

The repository includes pre-configured settings:

- **Spell checking**: Custom dictionary for technical terms
- **Markdown preview**: Native support
- **Git integration**: GitLens, Git Graph, and more
- **GitHub integration**: PR and issue management

### File Organization

| Path | Purpose |
| ------ | --------- |
| `*.md` | Rule documentation files |
| `.vscode/settings.json` | Editor configuration |
| `.vscode/extensions.json` | Recommended extensions |
| `.gitignore` | Git ignore patterns |

***

## Rule Statistics

| Metric | Count |
| -------- | ------- |
| Total Rule Files | 24 |
| Fully Documented Rules | 17 |
| Placeholder/Empty Rules | 4 |
| Core Agent Rules | 4 |
| Development Framework Rules | 4 |
| CI/CD & DevOps Rules | 4 |
| Repository Management Rules | 4 |
| Other Domain Rules | 8 |

> **Note**: Some rule files are placeholders awaiting documentation. Check the rule categories table for current status.

***

## Related Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Flutter Documentation](https://flutter.dev/docs)
- [Mise Version Manager](https://mise.jdx.dev/)
- [Warp Terminal](https://www.warp.dev/)

***

## License

This project is open source. License information will be added soon.

***

<div align="center">

Made with ❤️ for the AI-assisted development community

Establish trust through transparency, consistency, and user control

[⬆ Back to Top](#ai-agent-rules)

</div>
