# engine.ts Explainer

This is the **Main Thread Bridge**. It serves as the primary API for your React components to interact with the background sync worker.

### Code Breakdown

- **SyncEngine Class**:
    - **Static Pattern**: Used to ensure a singleton instance of the Web Worker across the entire application lifecycle.

- **init(identitySeed, onUpdate)**:
    - **Worker Initialization**: Loads `worker/index.ts` using the browser's native `Worker` API.
    - **Message Handling**: Listens for messages from the worker.
        - `READY`: Logs that the "Blind Vault" (Identity) is established.
        - `SYNC_RECEIVED`: Fires the `onUpdate` callback with remote data whenever another device pushes an update.
    - **Initial Signal**: Immediately sends the `INIT` message with the `identitySeed`.

- **pushUpdate(data)**:
    - **Purpose**: Sends local state changes to the worker to be encrypted and broadcasted.
    - **Non-Blocking**: This call returns instantly; the heavy encryption and network work happen in the background.

### Usage Scenario (React)
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
