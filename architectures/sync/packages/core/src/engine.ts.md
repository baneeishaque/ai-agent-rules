# Sync Engine Explainer (`engine.ts`)

[View Source File](./engine.ts)

The `SyncEngine` is the **Main Thread Bridge**. It serves as the primary API for your React components to interact with the background sync worker. It manages the lifecycle of the background worker and provides a simple, reactive API for the UI.

## Deep Technical Breakdown

- **Singleton Pattern (`static`)**:
  - **Why?**: Synchronization must be a single, persistent process. Having multiple workers would lead to race conditions, redundant relay connections, and wasted memory. Static members ensure one instance of the Web Worker exists across the entire application lifecycle.

- **Worker Initialization (`new Worker`)**:
  - **`init(identitySeed, onUpdate)`**: Loads `./worker/index.ts` using the browser's native `Worker` API.
  - **`new URL('./worker/index.ts', import.meta.url)`**: This is the modern industrial way to load workers. It ensures the bundler (Vite/Webpack) correctly resolves and bundles the worker code, even with TypeScript.
  - **Background Isolation**: By moving logic to a `Worker`, we ensure that heavy tasks (Nostr event signing, AES encryption) never block the UI thread, maintaining **60 FPS stability**.

- **Message Handling (`onmessage`)**:
  - **`MessageEvent<SyncMessage<any>>`**: The `event` object contains the data sent from the worker. It listens for:
    - `READY`: Logs that the "Blind Vault" (Identity) is established.
    - `SYNC_RECEIVED`: Fires the `onUpdate` callback with remote data whenever another device pushes an update.
  - **Reactivity**: When `SYNC_RECEIVED` is fired, the engine executes the `onUpdateCallback`. This is where you would update your local React state or store.

- **Initialization Signal (`INIT`)**:
  - **`identifier (Email, Composite ID, etc.)`**: Immediately sends the `INIT` message with the `identitySeed`.
  - **`normalizedSeed`**: We support compound identifiers (e.g., `userId + platformSalt`). This increases the difficulty of identity spoofing.
  - **`postMessage`**: This is the primary API for sending data to the worker. It uses the "Structured Clone Algorithm," which is faster than JSON stringification for complex objects.

- **pushUpdate(data)**:
  - **Purpose**: Sends local state changes to the worker to be encrypted and broadcasted. This is the "outbound" pipe. Whenever the local user changes a setting, the application calls this.
  - **Non-Blocking**: The call returns instantly. All the heavy lifting (signing and network mesh broadcasting) happens in the background.

## Usage Scenario (React)

```typescript
useEffect(() => {
  // Discover user email as identifier
  const id = session.user.email; 
  SyncEngine.init(id, (newData) => {
    setAppState(newData); // Reactively update UI
  });
}, []);
```

In this scenario, the user doesn't see a "Syncing..." spinner; it happens instantly and silently.

## Pedagogical Note for New Developers

If you are new to Web Workers, remember: **Workers cannot access the DOM**. They cannot use `window`, `document`, or `localStorage`. They communicate strictly via `postMessage`. This isolation is what keeps the app fast.
