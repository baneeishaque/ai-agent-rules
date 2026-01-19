<!--
title: Zero-Backend Auto-Sync Rules
description: Architecture and implementation standards for background, invisible data synchronization using decentralized relays (Nostr), local-first storage (RxDB), and WASM hardening.
category: Architecture & Sync
-->

# Zero-Backend Auto-Sync Rules

This rule defines the standard protocol for cross-device data synchronization in environments without a backend server. It ensures 100% backgrounded, invisible, and secure sync by bridging devices via a decentralized "Central Buffer."

***

### 1. Context Discovery & Confirmation (Mandatory)

Before implementation, the assistant MUST perform the following discovery steps and obtain user confirmation for each:

1.  **Platform Environment**: Detect the build tool (e.g., Vite, Webpack, CRA) and framework (e.g., React, Vue, Flutter).
2.  **Unique Identifier (Identity)**: Identify the stable identifier available in the session (e.g., User Email, PubKey). 
    - **Note**: Identifiers may be compound (e.g., `user_id + platform_id`).
3.  **Storage Context**: Evaluate the data complexity and choose the appropriate storage layer:
    - **Relational/Reactive** (Preferred): RxDB with IndexedDB.
    - **NoSQL**: PouchDB / Simple IndexedDB.
    - **File-based**: JSON/YAML (for simple flat settings).

***

### 2. Core Architecture (Industrial SSOT)

Implementations MUST follow the industrial folder structure to ensure maintainability and Single Source of Truth ([Reference Architecture Implementation](./architectures/sync/)):

#### 2.1 Standard Directory Structure
- `types.ts`: Enums for all inter-process message types and data interfaces.
- `config.json`: Decoupled configuration for relays, salt, and constants. **Hardcoding relays in code is PROHIBITED.**
- `engine.ts`: Main thread bridge and lifecycle manager.
- `worker/index.ts`: Background thread logic (Web Worker or system equivalent).
- `worker/crypto.asm.ts`: AssemblyScript (WASM) logic for identity hardening.

#### 2.2 Performance Standard (Zero UI Hangs)
- **Background-Only**: All cryptographic hashing (PBKDF2), encryption (AES-GCM), and network operations (WebSockets) MUST reside in a background process (e.g., Web Worker).
- The main UI thread MUST remain 100% free for rendering (60 FPS Goal).

***

### 3. Identity & Security (Blind Vault)

#### 3.1 Key Derivation Logic
- Derive the **Nostr Private Key** and a **Symmetric AES-256 Key** using **PBKDF2** (>= 100,000 iterations).
- **Salt Hardening**: Use **AssemblyScript (WASM)** to bake the Platform Salt into a binary module, preventing casual string-scraping from JS bundles.

#### 3.2 End-to-End Encryption (E2EE)
- **MANDATORY**: All data MUST be encrypted using AES-GCM *before* transmission.
- **Relay Blindness**: The relay mesh (e.g., Nostr Kind 30078) stores only the **ciphertext**. It is a "Blind Vault" with no access to plain data.

***

### 4. Technical Guardrails

- **Relay Mesh Redundancy**: Connect to at least 3 high-uptime relays (e.g., `wss://nos.lol`, `wss://relay.damus.io`, `wss://relay.nostr.band`).
- **Relay Fallback**: The client MUST automatically failover between relays if a connection drops.
- **Schema Management**: Use strict schemas (e.g., RxDB JSON Schema) to prevent data corruption during cross-device merges.
- **WASM MIME Type**: Ensure `.wasm` files are served with `application/wasm` headers.

***

### 5. Prohibited Behaviors

- **DO NOT** use `localStorage` for primary sync (no indexing/relational capacity).
- **DO NOT** use plain strings for inter-thread message passing; Enums are mandatory.
- **DO NOT** prompt the user for "Enable Sync" or "Login" if a unique identifier is available.
- **DO NOT** block the UI thread durante key derivation or relay sync.
- **DO NOT** hardcode environment-specific parameters (URLs, Salts) in logic files.

***

### 6. Related Conversations & Traceability

- **Architectural Discussion**: [Zero-Backend Preferences Sync Implementation](./conversations/2026-01-15-zero-backend-preferences-sync.md)
- **Goal Document**: [Industrial Sync Plan (v15)](./architectures/sync/docs/implementation-plans/v15-industrial-plan.md)
- **Reference Implementation**: [Sync Architecture Template](./architectures/sync/)
