# Session Log: Anti Gravity Version Research & Skill Creation

**Date**: 2026-03-07
**Participants**: USER & Antigravity (AI)
**Context**: Investigation of Anti Gravity's VS Code base version and strategic decision support for switching to official releases.

## 1. Initial Objectives
- Identify the VS Code OSS version used in "Anti Gravity".
- Compare this version against official stable and insiders releases.
- Analyze "missing commits" and features between the versions.
- Create an automated "Version Checker" skill for future auditing.

## 2. Research Metadata (Sourced from `agy --version` & `mdls`)
- **Anti Gravity Release**: `1.20.3`
- **VS Code OSS Base**: `1.107.0` (November 2025 release cycle)
- **Electron**: `39.2.3`
- **Node.js**: `22.20.0`
- **Commit Hash**: `98d96766f768...` (Google-proprietary)

## 3. Upstream Comparison (Baseline March 2026)
| Target Version | Base Version | status |
| :--- | :--- | :--- |
| **Stable** | 1.110.0 | +3 Major Updates |
| **Insiders** | 1.111.0 | +4 Major Updates |

## 4. Key Findings & Detailed Missing Commits
### Part 1: Feature Deltas (v1.107.0 → v1.111.0)
- **1.108**: Introduction of Experimental Agent Skills (GA in 1.109); Terminal IntelliSense rework; Breakpoint tree view.
- **1.109**: **Agent Skills (Generally Available)**; VS Code Hub (Multi-AI simultaneous support); **MCP Apps** (Interactive visualizations/charts); Parallel subagent execution.
- **1.110**: **Agentic Browser Integration** (Headless driving for agent verification/web-dev); Industrial Agent Plugins (installable from Extensions view); Session Memory persistence.
- **1.111**: Recursive `.instructions.md` search; MCP file downloads; Agent-scoped chat hooks; `/troubleshoot` slash command.

### Part 2: The "Switching Cost"—AGY vs. VS Code
- **Stay on AGY if**: You prioritize Google model performance (Gemini 3 Ultra/Pro/Flash), proprietary code execution layers, and container-native agent autonomy.
- **Switch to VS Code if**: You need native Agent Skills GA (1.109), integrated Agentic Browser (1.110), or official MCP visual visualizations.

## 5. Open Source Landscape Analysis
- **ishandutta2007/open-antigravity**: Replicating agy's agent-first concept. Status: Early/Experimental.
- **Void**: Hard fork of VS Code; Integrated local LLMs; Privacy-centered. Status: Mature/Stable.
- **Cline (Formerly Claude Dev)**: Extension-level agentic capabilities (CLI + Browser). Status: Major Industry Standard.

## 6. Action: Skill Creation
- Created `.agent/skills/antigravity-version-checker/`
- Implemented `SKILL.md` (SSOT) and `AGENTS.md` (Bridge).
- Integrated exhaustive research data for self-contained future auditing.

## 7. Standard Compliance
- Adhered to `ai-rule-standardization-rules.md` (Skill-First Architecture).
- Adhered to `ai-agent-session-documentation-rules.md` (Permanence & Traceability).
- Adhered to `ai-agent-planning-rules.md` (v4 iterative planning).
