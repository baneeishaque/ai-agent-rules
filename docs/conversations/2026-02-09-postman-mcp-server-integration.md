# Postman MCP Server Integration Session (2026-02-09)

## Context

The user requested guidance on setting up the Postman MCP Server in Antigravity using a provided API key.

## Key Discussed Points

- **Setup Method**: The "Local server" (stdio) method was chosen as the most robust approach for Antigravity.
- **Credential Handling**: Integration of the `POSTMAN_API_KEY` into `mcp_config.json`.
- **Standardization**: Formalizing the setup and usage into a new repository rule (`postman-mcp-server-rules.md`).

## Decisions Made

- Create `postman-mcp-server-rules.md` in `ai-agent-rules/`.
- Use `npx` with `@postman/postman-mcp-server` for the stdio server.
- Establish a "Plan-First" requirement for Postman tool usage.

## Outcome

- [postman-mcp-server-rules.md](../../postman-mcp-server-rules.md) established as the standard for Postman MCP integration.
