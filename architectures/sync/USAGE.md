# Zero-Backend Sync: Industrial Integration Guide

This guide provides a high-fidelity walkthrough for integrating the background sync engine into a production React application.

## 1. Context Discovery & Setup

Confirm your environment before implementation:
- **Build Tool**: CRA (requires CRACO) or Vite (requires `vite-plugin-wasm`).
- **Identifier**: Determine the stable identifier (e.g., `user.email` or a `compound_id`) from your app's session state.
- **WASM Support**: Ensure your host serves `.wasm` files with `application/wasm` headers.

## 2. Installation & Core Stack

Install the industrial synchronization dependencies:
```bash
npm install rxdb nostr-tools rxjs
# Mandatory for CRA users to support WASM and Workers
npm install @craco/craco --save-dev
```

## 3. Configuration (`src/services/sync/config.json`)

Externalize all environmental parameters. This allows for **Secret Rotation** and mesh updates without logic changes.

```json
{
  "relays": ["wss://nos.lol", "wss://relay.damus.io"],
  "platformSalt": "INDUSTRIAL_SALT_VALUE_2026",
  "nostrKind": 30078,
  "defaultDTag": "my-app-v1"
}
```

## 4. AssemblyScript & WASM Hardening

To protect your identity salt, the `worker/crypto.asm.ts` must be compiled to a binary "Black Box."

### Steps for CRA/CRACO:
1. Create `craco.config.js` in the project root:
```javascript
module.exports = {
  webpack: {
    configure: (config) => {
      config.experiments = { asyncWebAssembly: true, syncWebAssembly: true };
      return config;
    }
  }
};
```
2. Compile the ASM file: 
```bash
npx asc src/services/sync/worker/crypto.asm.ts -o src/services/sync/worker/crypto.wasm
```

## 5. Simplified Fallback Strategy

For low-complexity applications (e.g., simple notes), you may replace **RxDB** with a direct **IndexedDB** or **File-based** store. 
- **Requirement**: The `60 FPS` mandate still applies; sync logic MUST remain in a Web Worker to prevent UI blocking.
- **Relay Fallback**: The worker must still implement the mesh failover loop provided in the `worker/index.ts` template.

## 6. UI Integration (Pedagogical Sample)

Integrate the engine into your root component. This ensures "Zero User Intervention"—the sync starts silently when the user is identified.

```typescript
import { SyncEngine } from './services/sync/engine';

function App() {
  useEffect(() => {
    // 1. Silent Discovery
    const userId = session.user.email; 

    // 2. Singleton Initialization
    SyncEngine.init(userId, (newData) => {
      // 3. Reactive UI Update
      dispatch(syncActions.updateState(newData));
    });
  }, []);

  return <div>Industrial Zero-Backend Sync Active</div>;
}
```

## 7. Verification Protocol
- **Blind Vault Test**: Verify via Network tab that Nostr events contain only ciphertext.
- **Relay Failover**: Manually block one relay in the dev tools and verify the worker cycles to the next relay automatically.
- **60 FPS Check**: Perform heavy navigation while a sync is in progress; ensure no frame drops.
