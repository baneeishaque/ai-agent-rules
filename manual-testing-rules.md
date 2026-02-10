<!--
title: Manual Testing Protocol
description: Authoritative protocol for designing, documenting, and executing manual verification plans.
category: Quality Assurance & Verification
-->

# Manual Testing Protocol

This document defines the mandatory protocol for AI agents to follow when proposing and executing manual testing plans.
This ensures high-confidence verification where automated testing is insufficient or impractical (e.g., visual UI
persistence, complex multi-tab interactions).

***

## 1. Scope & Principles of Manual Verification

Manual verification is required for visual, stateful, or cross-session features that cannot be easily captured by
unit or integration tests.

- **Deterministic**: Given the same steps, they should produce the same outcome.
- **Traceable**: Every test step must be documented with its expected results.
- **Evidence-Based**: Key transitions and final states MUST be captured via screenshots or recordings.

***

## 2. Test Plan Structure & Fidelity

Every manual testing plan MUST be derived from a direct inspection of the live application environment. Using
placeholder names (e.g., "Project ID" if it doesn't exist) is FORBIDDEN.

- **Environment State Check**: Planning prerequisites MUST include a verification of the application's runtime
    status (e.g., "Confirm app is running at <http://localhost:3000>").
- **Exact Terminology**: Use labels exactly as they appear in the UI (e.g., "Trade Date", "Clearer Name").
- **Login-First Philosophy**: All testing flows must start with a login step followed by navigation, unless
    specifically instructed otherwise.
- **Comprehensive Scenarios**: Plans MUST cover all user-configurable states, including:
    - Column Organization (Ordering, Visibility, Resizing).
    - Advanced UI States (Pinning, Grouping, Pagination).
    - External Filter Intersections (Date Ranges, Multi-select dropdowns).
- **Reset Protocol**: Reset verification MUST confirm that ALL isolated scopes (e.g., 'Open' and 'Close' tab states)
    are cleared from both the underlying persistent storage AND the UI. This requires switching to every isolated
    view (e.g., every tab) to confirm they have individually returned to their baseline/default state.
- **Execution Matrix**:
    - **Step-by-Step Instructions**: Precise clicks, inputs, and navigations.
    - **Expected Result**: Criteria for success at each step.
    - **Observation Checkpoint**: Specific elements to verify.

***

## 3. Self-Containment & Accessibility Requirement

Manual Testing Plans MUST be executable by a **non-technical person** without prior knowledge of the codebase.

- **Start Instructions**: The plan MUST explicitly state how to start the application (e.g., `npm start`) and
    where to run the command.
- **Readiness Verification**: The plan MUST include a step to verify the application is successfully running
    (e.g., "Wait for 'Compiled successfully' message", "Visit URL and confirm Login screen appears").
- **Path Safety**: NEVER hardcode absolute system paths (e.g., `/Users/name/...`). Use relative paths or
    generic placeholders (e.g., `cd [project-root]`, `cd ./acers-web`) to ensure portability and security.
- **Copy-Paste Usability**: ALL actionable strings (URLs, credentials, commands, file paths) MUST be wrapped in
    triple-backtick code blocks to facilitate easy copying without selecting surrounding text.
- **Code-Backed Verification**: Every interface step (buttons, inputs) MUST be verified against the actual source code
    (`onClick` handlers, component logic) to ensure critical triggers (e.g., "Apply" buttons) are not missed.
- **Dynamic Key Handling**: When verifying `localStorage` or generated IDs, the plan MUST use dynamic lookup scripts
    (e.g., `Object.keys(...).find(...)`) instead of hardcoded keys (e.g., `user_123_meta`) to handle variable UUIDs.
- **Zero Assumptions**: Do not assume the server is already running or the user knows the URL.

## Test Results Documentation

When bugs are discovered during manual testing, the test plan MUST maintain both verification steps AND results:

- **Verification Steps**: Clear, actionable steps that anyone can follow (e.g., "Click X", "Set Y to Z")
- **Expected Results**: What SHOULD happen if the feature works correctly
- **Actual Results**: What CURRENTLY happens, marked with ✅ (working) or ❌ (broken)
- **Known Bugs Reference**: Link to a separate `KNOWN_BUGS.md` file in the same directory for detailed bug analysis

**Format Example:**

```markdown
6. **Verify Restoration**:
    - **Expected**: Page remains on 'Close Out Trades' with 'This Year' filter active
    - **Actual**: 
        - ✅ Page remains on 'Close Out Trades'
        - ❌ Filter shows 'Today' (expected 'This Year' - **persistence broken**)
```

This ensures the test plan serves dual purposes:

1. **Testing Guide**: Anyone can execute the steps
2. **Bug Report**: Actual vs Expected clearly shows what's broken

**CRITICAL**: All file links MUST use relative paths (e.g., `./KNOWN_BUGS.md`), never absolute paths
(e.g., `file:///Users/...`). This ensures portability and follows standard markdown conventions per
`markdown-generation-rules.md`.

***

## 4. Deep Verification Protocol

Verification MUST NOT rely solely on UI side effects. The agent MUST verify the underlying persistent state.

- **Storage Verification**: For persistence tasks, the agent MUST explicitly verify that `localStorage` or
    `sessionStorage` contains the expected key-value pairs after an action.
- **State Synchronization**: Confirm that the UI correctly reflects the loaded persistent state after a refresh.
- **JS Execution Authority**: The agent is explicitly authorized to execute arbitrary JavaScript in the browser
    console (e.g., state injection, storage clearing) to facilitate rigorous testing and state manipulation,
    **unless specifically instructed otherwise**.

***

## 4. Test Plan Location (Co-Location Mandate)

To ensure long-term maintainability and context preservation, Manual Testing Plans MUST NOT remain solely in
ephemeral artifacts (e.g., `brain/implementation_plan.md`).

- **Adjacent Storage**: The final, approved Manual Testing Plan must be saved as a markdown file (e.g., `manual_test.md`)
    in a `__tests__` directory adjacent to the core component or feature code.
    - Example: `src/Features/Profile/__tests__/profile-manual-verification.md`
- **Reference**: The `walkthrough.md` must link to this permanent file location.

***

## 5. Iterative Review Cycle

Before executing a manual test, the agent MUST:

1. Present the **Manual Testing Plan** to the user.
2. Wait for **iterative feedback** and approval (Approval Token: "Proceed").
3. Execute only the approved steps.

***

## 5. Documentation of Results

Upon completion, results must be documented in the `walkthrough.md` with:

- **Timestamped Execution Logs**: When each phase was tested `[YYYY-MM-DD HH:mm]`.
- **Visual Proof**: Absolute paths to screenshots/recordings categorized by feature area.
- **Success/Failure Matrix**: Clear indication of compliance with Acceptance Criteria.
- **Under-the-Hood Confirmation**: Proof of state verification (e.g., console log of storage).

***

## 6. Temporal Hygiene

All plans, task updates, and walkthroughs MUST include execution timestamps and change history as defined in the
[Agent Planning Rules](./ai-agent-planning-rules.md).
