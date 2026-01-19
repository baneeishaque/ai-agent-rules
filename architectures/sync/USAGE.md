# Sync Architecture Integration Guide (PoC)

This guide explains how to integrate the Zero-Backend Sync pattern into a standard frontend application (React/CRA/Vite).

## 1. Prerequisites
Install required dependencies for the reference implementation:
```bash
npm install rxdb nostr-tools @craco/craco --save
```

## 2. Directory Setup
Copy files from `ai-agent-rules/architectures/sync/` to your project:
```bash
cp -r ai-agent-rules/architectures/sync/ src/services/sync/
```

## 3. Configuration
Define your relays and shared salt in `src/services/sync/config.json`. This ensures you can rotate keys without rebuilding logic.

## 4. AssemblyScript Compilation
The `worker/crypto.asm.ts` file is written in **AssemblyScript**. 
- It MUST be compiled to a `.wasm` binary using `asc`.
- In a CRA project, use a `craco.config.js` to inject the `wasm-loader`:
```javascript
module.exports = {
  webpack: {
    configure: (config) => {
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });
      return config;
    },
  },
};
```

## 5. React Integration Pattern
Initialize the engine once at the app root:

```typescript
import { SyncEngine } from './services/sync/engine';
import { db } from './services/storage';

function App() {
  useEffect(() => {
    // 1. Context Discovery: In this case, User Email is the identifier
    const userEmail = "user@example.com"; 

    // 2. Initialize Engine (Identifies context automatically)
    SyncEngine.init(userEmail, (remoteData) => {
      // 3. Reactively update RxDB local store
      db.preferences.upsert(remoteData);
    });
  }, []);
}
```

## 6. Storage Selection Logic
- Use `storage.ts` if you need **Reactive/Relational** data (RxDB).
- If your app is low-complexity, simplify the worker to write directly to a JSON file or `IndexedDB`.
