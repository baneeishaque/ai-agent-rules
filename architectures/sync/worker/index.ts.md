# worker/index.ts Explainer

This is the **Background Logic Thread**. It offloads all compute-heavy (Crypto) and latency-heavy (Network) operations to ensure the UI remains at 60 FPS.

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
