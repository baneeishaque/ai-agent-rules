# Conversation: Bash Execution Standards Establishment

- **ID**: `ef36ddb6-39b9-4543-9569-052aa28e801b`
- **Date**: 2026-02-09
- **Participants**: USER, Antigravity (AI Agent)

## Summary

The conversation established the industrial standards for bash script execution within the project. Key decisions include:
1. **Subshell Execution (`bash script.sh`)**: Mandated for internal utilities to ensure robustness, isolation, and avoidance of permission/shebang issues.
2. **Library Sourcing (`source`)**: Reserved strictly for loading functions and constants.
3. **Prohibition of `eval`**: Strictly forbidden for script execution due to security risks and poor maintainability.

## Context

The user requested clarification on the "industry standard" for calling an internal package update script (`updatePackageIndex.bash`). The agent analyzed the existing codebase and established these rules to ensure consistency and defensive programming.

## Rationale

- `bash script.sh` is deterministic and process-isolated.
- `eval` is dangerous as it allows for shell injection and is harder to expand correctly.
- Separation of concerns: library vs. action-performing script.
