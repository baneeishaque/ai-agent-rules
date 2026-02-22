<!--
title: Moltbridge Discovery Rules
description: Industrial standards for social graph broker discovery, trust threshold mandates, and
    cross-tool analysis traceability.
category: Core Agent Behavior
-->

# Moltbridge Discovery Rules

This document defines the industrial standards for utilizing the Moltbridge social graph for agent and human discovery.
It ensures that discovery processes are verifiable, trust-aware, and historically traceable across multiple analysis
sessions.

***

## 1. Discovery Protocol Standards

To ensure reliability in social graph navigation, agents MUST follow the standardized discovery protocol.

### 1.1 Tool Usage & Parameters

The `moltbridge_discover_broker` tool is the primary mechanism for finding candidates to reach a target.

- **Mandate**: Every discovery request MUST specify a `target` identifier.
- **Max Hops**: Default to `4` unless the target is known to be in a distant cluster, in which case a maximum of `6` is
    allowed.
- **Max Results**: Limit to `3` candidates for standard networking to prevent information overload.

### 1.2 Trust Threshold Mandates

Broker candidates MUST be evaluated against a trust threshold.

- **Minimum Trust**: For industrial introductions, candidates with a trust score below `0.5` MUST be flagged as
    "High Risk."
- **Verification**: Agents SHOULD cross-reference broker IDs with established credibility scores if available.

***

## 2. Infrastructure & Neo4j Safety

Discovery operations rely on the underlying Neo4j AuraDB infrastructure.

- **In-Process Invocation**: Following [Node Crypto & MCP Infrastructure Rules](./node-crypto-mcp-infrastructure-rules.md),
    all Moltbridge tools MUST invoke backend services directly to bypass the network stack.
- **Query Guardrails**: Agents are prohibited from executing raw Neo4j queries that do not have indexed start points.
    Discovery MUST rely on the formalized `BrokerService` methods.

***

## 3. Tool-Chain Traceability (ACER Rebuild)

To maintain context across complex auditing sessions, this section documents the tool-chain sequence used for the
`acers-web-vite-react-ts` project.

### 3.1 Sequential Analysis Path

The following tools were orchestrated sequentially to validate the project's health:

1. **typescript-analyser**: Verified industrial type safety and ESM compatibility.
2. **sonarqube**: Audited code quality, security hotspots (0 findings), and long-term maintainability.
3. **xray**: Mapped architectural dependencies and performed impact analysis on core hooks (`useBrokerHooks.ts`).
4. **semgrep**: Conducted local SAST and supply chain security verification.
5. **atlassian-mcp-server**: Identified the project `SCRUM` for work item tracking.
6. **moltbridge**: Initiated social graph discovery for external proposal networking (Target: Linus Torvalds).

***

## 4. Related Conversations & Traceability

- **[2026-02-16] Moltbridge Support Architecture**: Established the formal rule set and discovery workflow for the
    ACER project orchestration.

(Reference: `docs/conversations/2026-02-16-moltbridge-architecture-creation.md`)
