# Sync Worker Explainer (`worker/index.ts`)

[View Source File](file:///Users/dk/Lab_Data/ai-agents/ai-agent-rules/architectures/sync/worker/index.ts)

The `SyncWorker` is the heart of the background process. It handles the "Heavy Compute" (Key Derivation/Encryption) and the "Network Mesh" (WebSockets).

### Core Responsibilities

- **Background Execution**: By running in a Web Worker, all WebSocket traffic and encryption happen on a separate OS thread. This prevents the UI from stuttering, even during high-traffic sync events.

### API & Logic Breakdown
- **self.onmessage (MessageEvent)**:
    - **Purpose**: A native Web Worker listener. The `event.data` contains the `SyncMessage` sent from the main thread.
    - **Asynchronous**: This allows the worker to process tasks without blocking the main event loop.
- **self.postMessage**:
    - **Purpose**: Sends signals or data back to the main thread (e.g., `READY` or `SYNC_RECEIVED`).
- **WebSocket**:
    - **socket = new WebSocket(relay)**: Opens a persistent, bi-directional pipe to the Nostr relay mesh.
    - **onopen**: Fired when the pipe is ready. We trigger `handleSyncIn` to start listening for updates.
    - **onmessage (MessageEvent)**: Fired when the relay pushes new data. 
        - **event.data**: The raw Nostr protocol message (e.g., `["EVENT", "sub_id", { ... }]`).
    - **onerror**: Essential failover hook. If a relay drops, the industrial standard is to cycle to the next relay in the `config.json` mesh.

- **handleInit(identitySeed)**:
    - **Compound Identifiers**: The logic accepts `string | string[]`. This allows identity to be a simple email or a compound like `platform_id + account_id`, increasing security and flexibility.

- **handleSyncOut (Event Object)**:
    - **event**: This object follows the **Nostr NIP-01/NIP-78** standard.
        - `kind: 30078`: Arbitrary App Data.
        - `tags: [['d', scope]]`: Scopes the data (e.g., to your app).
        - `content`: Plaintext is never stored; only **ciphertext** is broadcasted.

- **encrypt / decrypt**:
    - **E2EE**: These are wrappers for **AES-GCM**. They ensure the data is secured on the device before it ever touches a network cable.

- **handleSyncIn (Placeholder)**:
    - **Why empty?**: Nostr libraries (like `nostr-tools`) handle subscriptions differently based on version. In a real PoC, you would use a filters object here to subscribe to your `publicKey`.

### Usage Scenario
While a user is scrolling a list (60 FPS), a remote update arrives from the relay. The worker receives the WebSocket event, decrypts the JSON, and sends a final payload to the main thread. The main thread simply updates the state. No frame is dropped because the heavy lifting was backgrounded.

### Technical Breakdown

- **WebSocket Mesh & Failover (`connectRelayMesh`)**:
    - **Industrial Mandate**: You MUST NOT rely on a single relay. If a relay goes down, the client should automatically cycle to the next one in `config.json`.
    - **Reconnection Loop**: The `onclose` handler uses a `setTimeout` to retry connection. This ensures the app is resilient to network drops or server restarts.
- **Nostr Protocol Handling (`onmessage`)**:
    - **NIP-01 Standard**: Nostr communication uses a simple JSON array protocol (`["EVENT", sub_id, event_object]`). This worker parses these arrays to extract the encrypted application state.
- **E2EE (End-to-End Encryption)**:
    - **Blind Vault**: The `content` of the Nostr event is encrypted using AES-256 before being sent. This means the relay (the "Vault") can see that data exists but has **zero access** to the plain text.
- **Key Derivation (`handleInit`)**:
    - **WASM Integration**: The worker calls the `crypto.asm` module to derive the `privateKey`. This combines the user's identity with the platform salt within a binary "Black Box."
- **Message Events (`self.onmessage`)**:
    - **`MessageEvent<SyncMessage<any>>`**: This is the incoming pipe from the main thread. It uses standard browser events to receive instructions (INIT, SYNC_OUT).

### Pedagogical Note: Error Handling
Notice the deep try-catch blocks and checks for `socket.readyState`. In a background worker, silent failures are common; explicit logging to `console.error` and state verification are mandatory for industrial stability.
