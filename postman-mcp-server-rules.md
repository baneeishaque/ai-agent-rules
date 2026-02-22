<!--
title: Postman MCP Server Rules
description: Standards for configuring, using, and troubleshooting the Postman MCP Server in AI agent environments.
category: Core Agent Behavior
-->

# Postman MCP Server Rules

This document defines the standards for integrating and utilizing the Postman MCP Server.
These protocols ensure consistent setup, secure credential handling, and reliable tool interaction
for Postman-related workflows.

***

## 1. Core Principles 💡

- **Transparency**: Every Postman API request and response must be visible in the agent's output for debugging and auditing.
- **Sensitive Data Security**: API keys MUST NOT be hardcoded. They should be managed via `mcp_config.json`
    environment variables or secure terminal prompts.
- **Plan-First Interaction**: All Postman operations (e.g., running collections, fetching environments)
    must be part of an explicit, user-approved plan.

***

## 2. Setup Workflow 📜

### 2.1 Local Server (stdio)

For most local development environments (e.g., Antigravity, Cursor), use the `stdio` transport.

**Configuration Template (`mcp_config.json`):**

```json
{
  "mcpServers": {
    "postman_mcp_server_stdio": {
      "command": "npx",
      "args": ["-y", "@postman/postman-mcp-server"],
      "env": {
        "POSTMAN_API_KEY": "PMAK-XXX"
      }
    }
  }
}
```

### 2.2 Remote Server

For cloud-based or shared environments, use the remote MCP endpoint.

**Configuration Template:**

```json
{
  "mcpServers": {
    "postman-api": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.postman.com/mcp",
        "--header",
        "Authorization: Bearer PMAK-XXX"
      ]
    }
  }
}
```

***

## 3. Tool Usage Guidelines 🛠️

The Postman MCP Server provides a suite of tools for API interaction. The agent MUST follow these guidelines:

- **Context Awareness**: Use `get_postman_environments` to find relevant variables before running requests.
- **Validation**: Before running a collection, verify the `collectionId` and `environmentId` match the user's intent.
- **Output Handling**: Large responses from `run_postman_request` should be displayed
    clearly, but avoid excessive noise if the user only needs specific data points.

***

## 4. Error Handling & Troubleshooting ⚠️

- **Authentication Errors**: If a tool returns a `401 Unauthorized`, the agent MUST check
    the `POSTMAN_API_KEY` validity and expiration.
- **Timeout Handling**: For long-running collection runs, the agent should inform
    the user if the operation exceeds standard timeouts.
- **Missing Resources**: If a collection or environment ID is not found, the agent MUST
    use `get_postman_collections` or `get_postman_environments` to list available
    resources and ask for clarification.

***

## 5. Related Conversations & Traceability 🔗

- [Postman MCP Server Integration Session (2026-02-09)](./docs/conversations/2026-02-09-postman-mcp-server-integration.md)
