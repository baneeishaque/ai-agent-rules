# Zero-Backend Sync: Industrial Integration Guide

This guide provides a high-fidelity walkthrough for integrating the background sync engine into a production React application.

## 1. Environment Setup

Confirm your environment before implementation:
- **Build Tool**: CRA (requires CRACO) or Vite (requires `vite-plugin-wasm`).
- **Identifier**: Determine the stable identifier (e.g., `user.email` or a `compound_id`) from your app's session state.
- **WASM Support**: Ensure your host serves `.wasm` files with `application/wasm` headers.

### Install Dependencies
```bash
npm install rxdb nostr-tools rxjs
npm install @craco/craco assemblyscript --save-dev
```

## 2. Industrial Folder Restructuring (SSOT)

Copy the reference architecture `lib` into your project. Maintaining a shared logic folder is mandatory for multi-project parity:
```bash
mkdir -p src/services/sync/lib
cp ai-agent-rules/architectures/sync/lib/*.ts src/services/sync/lib/
cp ai-agent-rules/architectures/sync/lib/config.json src/services/sync/lib/
cp -r ai-agent-rules/architectures/sync/lib/worker src/services/sync/lib/
```

## 3. Webpack Modification (CRACO)
# Mandatory for CRA users to support WASM and Workers

Building `.wasm` in CRA requires a `craco.config.js` in your root. This allows you to inject Webpack's `wasm-loader` without ejecting:

```javascript
module.exports = {
  webpack: {
    configure: (config) => {
      // Enable WASM and Worker Support
      config.experiments = { 
        ...config.experiments,
        asyncWebAssembly: true,
        syncWebAssembly: true 
      };
      
      // Handle .wasm files via Webpack's wasm-loader
      config.module.rules.push({
        test: /\.wasm$/,
        type: "webassembly/async",
      });

      return config;
    }
  }
};
```
**Important**: Update your `package.json` scripts to use `craco start`, `craco build`, etc.

## 4. AssemblyScript & WASM Hardening
To protect your identity salt, the `worker/crypto.asm.ts` must be compiled to a binary "Black Box."

1. **Configuration**: Externalize all environmental parameters in `lib/config.json`. This allows for **Secret Rotation** and mesh updates without logic changes.
```json
{
  "relays": ["wss://nos.lol", "wss://relay.damus.io"],
  "platformSalt": "INDUSTRIAL_SALT_VALUE_2026",
  "nostrKind": 30078,
  "defaultDTag": "my-app-v1"
}
```

2. **Compile the ASM file**: 
```bash
npx asc src/services/sync/lib/worker/crypto.asm.ts -o src/services/sync/lib/worker/crypto.wasm
```

## 5. Simplified Fallback Strategy

For low-complexity applications (e.g., simple notes), you may replace **RxDB** with a direct **IndexedDB** or **File-based** store. 
- **Requirement**: The `60 FPS` mandate still applies; sync logic MUST remain in a Web Worker to prevent UI blocking.
- **Relay Fallback**: The worker must still implement the mesh failover loop provided in the `worker/index.ts` template.
- **Limitation**: File/Text fallbacks have **no indexing/relational capacity**.

## 6. UI Integration (Pedagogical Sample)

Integrate the engine into your root component. Inside your app entry point (e.g., `App.tsx`), implement silent discovery. This ensures "Zero User Intervention"—the sync starts silently when the user is identified:

```typescript
import { SyncEngine } from './services/sync/lib/engine';

function App() {
  useEffect(() => {
    // 1. Silent Context Discovery: Detect User Identifier
    // We use the session email. Support for Compound IDs (Email + Salt) is built-in.
    const userIdentifier = auth.session.user.email; 

    // 2. Initialize the Sync Engine (Background Thread)
    // No need for manual state dispatch; RxDB handles reactivity.
    SyncEngine.init(userIdentifier, (remoteData) => {
      // 3. Reactive Storage Upsert
      // When remote data arrives, RxDB merges it and triggers UI reactivity.
      // RxDB upsert triggers watchAllChanges() in your components automatically
      storageHandler.upsert(remoteData.key, remoteData.value);
    });
  }, []);

  return <SyncManager />;
}
```

## 7. Storage Layer (RxDB)

Initialize your RxDB collection using the schema in `storage.ts`.
- **Primary Key**: The `id` field (max length 100) is the primary key. 
- **Value**: Supports complex nested JSON or Arrays with **runtime safety**.
- **Timestamp**: Uses numeric Epoch for cross-device conflict resolution.

## 8. Verification Protocol

1.  **Real-time Check**: Open two browsers. Change a setting in one. Verify the update appears in the second in **< 500ms**.
2.  **Persistence Check**: Close both browsers. Re-open. Verify state is recovered from the Nostr Mesh.
3.  **Security Check**: Inspect Network traffic. Verify all content is **encrypted** (ciphertext) and the **Salt** is absent from the JS bundle (**Hardened in WASM**).
4.  **Blind Vault Test**: Verify via Network tab that Nostr events (Kind 30078) contain only ciphertext.
5.  **WASM MIME Type**: Verify that your host serves `.wasm` files with the `application/wasm` header.
6.  **Relay Failover**: Manually block one relay in the dev tools (Network -> Request blocking) and verify the worker cycles to the next relay automatically.
7.  **60 FPS Check**: Perform heavy navigation while a sync is in progress; ensure no frame drops.
8.  **UTF-8 Check**: Verify that the salt is encoded as `u8` bytes in the WASM binary (prevents string scraping).
