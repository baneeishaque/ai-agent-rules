# config.json Explainer

This file contains the **Externalized Configuration** for the sync engine.

### Code Breakdown

- **relays**:
    - **Purpose**: A list of Nostr relay URLs.
    - **Why Decoupled?**: You can add/remove relays or switch mesh providers without recompiling the application logic. 
    - **Example**: `wss://nos.lol`, `wss://relay.damus.io`.

- **platformSalt**:
    - **Purpose**: A secret string used during key derivation.
    - **Security Note**: This value is baked into the WASM binary (`crypto.asm.ts`) to prevent casual crawlers from finding it in your JS bundle.

- **nostrKind**:
    - **Purpose**: Defines the Nostr Event Kind used for sync (Default: `30078`).
    - **NIP-78**: This kind is specifically designed for arbitrary application data storage on the Nostr protocol.

- **defaultDTag**:
    - **Purpose**: A scope identifier for your app's data.
    - **Benefit**: Allows multiple apps to use the same relay/pubkey without colliding (e.g., `app_preferences`, `user_profile`).

### Usage Scenario
To update your relay mesh, simply edit this JSON. The `engine.ts` and `worker/index.ts` automatically ingest these changes.
