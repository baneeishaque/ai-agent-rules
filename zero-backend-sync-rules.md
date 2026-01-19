<!--
title: Zero-Backend Auto-Sync Rules
description: Architecture and implementation standards for background, invisible data synchronization using decentralized relays (Nostr), local-first storage (RxDB), and WASM hardening.
category: Architecture & Sync
-->

# Zero-Backend Auto-Sync Rules

This rule defines the standard protocol for cross-device data synchronization in environments where a traditional backend is unavailable or involvement is prohibited. It ensures 100% backgrounded, invisible, and secure sync by bridging devices via a decentralized "Central Buffer."

***

### 1. Context Discovery & Confirmation (Mandatory)

Before implementation, the assistant MUST perform the following discovery steps and obtain explicit user confirmation for each. This ensures the chosen technology stack fits the specific context:

1.  **Platform Environment**: Detect the build tool (e.g., Vite, Webpack, CRA) and framework (e.g., React, Vue).
    - **Industry Standard Example**: For CRA, we use **CRACO** to inject Webpack's `wasm-loader`. For Vite, we use appropriate WASM plugins.
2.  **Unique Identifier (Identity)**: Identify the stable identifier already available in the app session.
    - **Note**: The identifier may be simple (e.g., Email) or compound (e.g., `user_id + platform_salt`). The assistant MUST propose the identifier and the user MUST confirm.
3.  **Storage Context**: Evaluate data complexity and choose the best-fit storage layer based on discussion:
    - **Relational/Reactive** (Preferred for complex apps): RxDB with IndexedDB.
    - **NoSQL**: PouchDB / Simple IndexedDB.
    - **File-based**: JSON, YAML, or CSV (Chosen according to context and discussion).

***

### 2. Core Architecture (Industrial SSOT)

Implementations MUST follow the industrial folder structure to ensure maintainability and Single Source of Truth ([Reference Architecture Implementation](./architectures/sync/)).

#### 2.1 Standard Directory Structure
- `types.ts`: Enums for all inter-process message types and data interfaces ([Explainer](./architectures/sync/types.ts.md)).
- `config.json`: Decoupled configuration for relays, salt, and constants. **Hardcoding relays in logic is PROHIBITED.** ([Explainer](./architectures/sync/config.json.md)).
- `engine.ts`: Main thread bridge and lifecycle manager ([Explainer](./architectures/sync/engine.ts.md)).
- `worker/index.ts`: Background thread logic (Web Worker) ([Explainer](./architectures/sync/worker/index.ts.md)).
- `worker/crypto.asm.ts`: AssemblyScript (WASM) logic for identity hardening ([Explainer](./architectures/sync/worker/crypto.asm.ts.md)).
- `storage.ts`: Data access layer (RxDB/NoSQL/File) ([Explainer](./architectures/sync/storage.ts.md)).

#### 2.2 Performance & UI Stability (60 FPS Goal)
- **Background-Only**: All cryptographic hashing (PBKDF2), encryption (AES-GCM), and **Network Operations** MUST reside in a background process (e.g., Web Worker).
- **Prohibited**: The main UI thread MUST NOT execute heavy logic that causes frame drops.

#### 2.3 Real-time Reactivity
- **Protocol**: Use **WebSockets** for the relay bridge.
- **Speed**: Target sub-second synchronization (< 500ms) between online devices. Nostr relays handle millions of events daily and are as fast as real-time chat.

***

### 3. Identity & Security (Blind Vault)

#### 3.1 Key Derivation Logic
- **Silent Derivation**: Identity MUST be derived silently from existing app state without explicit logins or prompts. 
- **Keys**: Generate a **Nostr Private Key** and a **Symmetric AES-256 Key** using **PBKDF2** (>= 100,000 iterations).
- **Hardening (WASM)**: The Salt MUST NOT be stored as a plain string in JS. Use **AssemblyScript (WASM)** to bake the salt into a binary module.
    - **Why WASM?**: Frontend secrets have two options:
        - **Option A (Plain JS)**: Very easy to find (View Source).
        - **Option B (WASM Binary)**: Requires specialist reverse-engineering tools. It is the most "future-proof" and standardized way to hide logic in a frontend-only app.
    - **Cracking**: A WASM binary is like a compiled EXE; it is extremely difficult to "read" without converting it back to assembly code.

#### 3.2 End-to-End Encryption (E2EE)
- **Mandatory**: All data MUST be encrypted before transport. The relay stores only ciphertext, remaining "blind" to user data.

***

### 4. Technical Guardrails & Trade-offs

- **Redundancy**: Connect to at least 3 high-uptime relays (e.g., `wss://nos.lol`, `wss://relay.damus.io`, `wss://relay.nostr.band`).
- **Failover**: The client MUST automatically failover between relays if a connection drops.
- **Schema Management**: Use strict schemas (e.g., RxDB JSON Schema) to prevent data corruption during cross-device merges.
- **No Plaintext Fallback**: If encryption fails, the sync MUST fail securely rather than transmitting plaintext.

***

### 5. Prohibited Behaviors

- **DO NOT** use `localStorage` for primary sync data.
- **DO NOT** use "magic strings" for worker messages; use Enums.
- **DO NOT** prompt the user for "Enable Sync" if a unique identifier is available.
- **DO NOT** hardcode environment-specific parameters (Relay URLs, Salts) in logic files.
- **DO NOT** block the UI durante key derivation or relay sync.

***

### 6. Related Conversations & Traceability

- **Architectural Discussion**: [Zero-Backend Preferences Sync Implementation](./conversations/2026-01-15-zero-backend-preferences-sync.md)
- **Goal Document**: [Industrial Sync Plan (v15)](./architectures/sync/docs/implementation-plans/v15-industrial-plan.md)
- **Reference Implementation**: [Sync Architecture Template Package](./architectures/sync/)
