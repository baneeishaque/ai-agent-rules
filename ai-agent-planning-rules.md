<!--
title: Agent Planning
description: Guidelines for agent planning,
    including the core directive to plan before acting and a protocol for
    iterative plan revisions.
category: Core Agent Behavior
-->

# Agent Planning Rule: Core Principles and Best Practices

This document outlines the mandatory planning protocol for all AI agents. The primary directive is to ensure all
actions are preceded by a transparent, user-approved plan. This rule is foundational to establishing a clear,
trustworthy, and effective interaction model.

---

## 1. The Core Planning Directive

All agents must present a clear, step-by-step plan before any implementation. The plan must be explicit,
actionable, and tailored to the user’s request. **Only after the plan is approved or clarified should
implementation begin.**

This directive is not merely a formality; it is a critical safeguard. By externalizing the planning process, the
agent minimizes the risk of misunderstanding, prevents "hallucination," and ensures complete alignment with the
user's intent from the outset.

---

## 2. Components of an Effective Plan

An effective plan is built on four key pillars:

- **Clarity:** The plan must be written in plain, unambiguous language. Avoid technical jargon or internal thought

    process descriptions. Each step should be a simple statement of intent, easily understood by a non-technical
    user.

- **Step-by-Step Breakdown:** The plan must break down the request into a logical sequence of discrete, manageable

    steps. This demonstrates a structured approach and allows the user to follow the agent's thought process.

- **Actionability:** Every step in the plan must represent a concrete, executable action. For example, instead of

    "Gather information," an actionable step would be "Search the web for Q4 2024 financial reports from Google."

- **Tailored to the Request:** The plan should directly address the specifics of the user's query. It should not be

    a generic template but a custom-designed workflow that reflects the unique nuances of the task.

---

## 3. The Agent Planning Workflow

A well-structured interaction with an agent should follow this five-step workflow:

1. **Deconstruct the Request:** The agent's first internal action is to analyze the user's prompt. It should

   identify the core task, the specific constraints, the desired output format, and any potential ambiguities or
   missing information.

1. **Formulate the Plan:** Based on the deconstruction, the agent constructs a detailed plan. This plan should be

   a bulleted or numbered list that outlines the exact steps to be taken, including any necessary data retrieval,
   analysis, or content generation.

1. **Present for Approval**: The agent presents the formulated plan to the user. This is a crucial checkpoint.
   The agent should explicitly ask for confirmation or for any necessary adjustments before proceeding.
   - **Browser Approval**: For manual testing plans, all browser-based tool requests are considered pre-approved
       unless explicitly denied by the user.

1. **Execute the Plan:** Upon receiving user approval, the agent proceeds to implement the plan, step by step. Each

   action is performed as outlined, ensuring the process remains transparent and predictable.

1. **Report Progress & Completion:** The agent should provide a final summary of the work done, confirming that all

   steps in the plan were executed. For long or complex tasks, providing interim progress updates may also be
   beneficial.

---

## 4. Handling Edge Cases and Best Practices

- **Ambiguous Requests:** If the user's request is unclear or incomplete, the agent must include a clarification

    step in its plan. The plan should state, "First, I will ask for clarification on `the ambiguous part` to ensure I
    proceed correctly."

- **Multi-Turn Conversations:** For continuous dialogues, a new, explicit plan is required for each distinct task or

    significant shift in the user's request. Simple, short follow-up questions do not require a new plan.

- **Exemptions to the Rule:** A plan is not required for trivial, single-step requests that have a straightforward,

    factual answer. For example, a request like "What is the capital of France?" should be answered directly without
    a planning step. This demonstrates the agent's ability to discern between simple queries and complex tasks.

---

## 5. Iterative Planning and Plan Versioning

The initial plan is a blueprint, not an unbreakable contract. For complex,

- **Categorical Alignment**: Group changes by their architectural layer (e.g., UI, Logic, Docs) unless they are

    functionally coupled.

- **Git Hygiene & Rebase Integration**: For tasks involving multiple branches or history refinement, the plan MUST

    include:

- **Hierarchical Mermaid Mapping**: Visualizing branch dependencies (referencing [Git Rebase Standardization

    Rules](./git-rebase-standardization-rules.md)).

- **CAM Table**: Mapping specific actions per commit to ensure logic isolation.

- **Workflow-First Priority**: If changes involve CI/CD workflows (GitHub Actions, scripts), the agent **MUST** fix,

    test, and verify the workflow functionality *before* arranging or executing commits. Functional stability of the
    CI pipeline takes precedence over documentation or stylistic refinements.

### 1.1 Long-Running & Dynamic Tasks

For long-running or dynamic tasks, the agent may encounter new information or unforeseen obstacles that necessitate
a change in direction. In these cases, the agent MUST NOT deviate from the original plan without explicit approval.

---

## 5. Industrial Planning Mandates

- **Environment State Check**: Every plan involving runtime verification MUST include a prerequisite step to
    confirm the application is running and accessible (e.g., "Verify App is live at `http://localhost:3000`").
- **Maximum Literal Detail**: Plans must be exhaustive and literal.

- **Files:** Explicitly list every file (absolute paths) to be created, modified, or deleted.

- **Exact Commands:** CLI commands must be written exactly as they will be executed, including full

    arguments and piped operations.

- **Literal Payloads:** For operations like `git commit --amend -m "..."`, the plan must include the

    **literal message string** within the execution step, not just a reference to it.

- **Verifications:** Explicitly state the exact command or visual check used to verify each step.

- **Guardrails**: Restate the literal logic for handling conflicts, empty commits, and safety checks in every

    iteration.

- **Pre-Plan Context Gathering:** Information gathering (reading files, `git diff`,`ls`) must happen **BEFORE**

    the plan is finalized. A plan based on assumptions is a failed plan.

---

## 6. Temporal Hygiene & Change History

To ensure absolute traceability and industrial reliability, all planning and verification artifacts MUST
incorporate temporal data.

- **Execution Timestamps**: Every item in `task.md` and `walkthrough.md` MUST include a completion or event
    timestamp in the format `[YYYY-MM-DD HH:mm]`.
- **Change History Table**: Every versioned implementation plan (v2+) MUST include a "Change History" table
    immediately following the goal statement. This table MUST track:

    | Timestamp | Summary of Changes | Rationale |
    | :--- | :--- | :--- |
    | `[YYYY-DD-MM HH:mm]` | Concise description of the delta. | Why the change was necessary. |

---

## 7. Plan Versioning & SSOT Integrity (History Mandate)

(Updated to include Change History mandate)

**Iterative Planning** is the process of updating a plan based on new findings or changes in a task's requirements.
This practice ensures flexibility while maintaining the core principles of transparency and user alignment.

- **Plan Versioning**: All plans must be explicitly versioned (e.g., `implementation_plan_v1.md`,
    `implementation_plan_v2.md`).
- **History Mandate**: New versions MUST NOT overwrite old versions. Each new version MUST include the Change History
    table documenting all previous revisions.
- **SSOT (Single Source of Truth)**: Each version MUST be self-contained, restating all valid context and guardrails.
    Do not refer to previous versions for "missing details."

- **Propose a Plan Revision:** When a change is required, the agent must immediately pause execution and present

    a revised plan to the user.

- **Provide a Rationale:** The agent must clearly explain **why** the change is necessary.

- **Seek Approval:** The agent must explicitly ask for user approval for the revised plan before proceeding. This

    final check ensures the new direction aligns with the user's updated expectations.

---

## 8. Task Artifact Synchronization

Follow the status markers and include timestamps:

- **Initial Creation**: Create `task.md` at the start of planning with all top-level items.
- **Incremental Updates**: Update `task.md` after completing each significant milestone.
- **Status Markers**: Use `[ ]` for pending, `[/]` for in-progress, and `[x]` for completed items `[YYYY-MM-DD HH:mm]`.
- **Compliance Mandate**: Every generated artifact (task, implementation plan, walkthrough) MUST strictly comply
    with **[Markdown Generation Rules](./markdown-generation-rules.md)** and
    **[Markdown Generation Rules Additions](./markdown-generation-rules-additions.md)**.

---

## 9. User Question Integration Mandate

To ensure maximum transparency and technical accuracy, the agent MUST explicitly address any technical or
process-related questions raised by the user during the planning phase.

- **Mandated Documentation**: All user questions and their corresponding agent answers MUST be documented in a
    dedicated **"User Questions & Answers"** section at the top of the revised implementation plan.
- **Traceability**: This ensures that critical clarifications and course corrections are captured in the
    Single Source of Truth (SSOT), making them available for future reference and audits.
- **Clarity**: Answers should be technically precise, referring to specific rules or protocols where applicable.
