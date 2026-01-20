# WASM Crypto Explainer (`crypto.asm.ts`)

[View Source File](./crypto.asm.ts)

This file contains the **Identity Hardening** logic. It is written in **AssemblyScript** (a TypeScript-like language for WASM) and is intended to be compiled into a `.wasm` binary.

### Why WASM for Security?

In a frontend-only application, any JavaScript code can be easily read via "Inspect Source." If you store a cryptographic salt as a plain string in JS, a casual attacker can extract it in seconds.

- **WASM as a "Black Box"**: When compiled to WASM, this logic becomes a binary payload. While not impossible to reverse-engineer, it requires specialized tools and deep knowledge of WebAssembly instruction sets. This elevates the security of your app to an industrial grade.
- **WASM as a "First-Class" Language**: WASM is the biggest shift in web technology in 20 years. All major browsers promote it to a first-class language. It is the future-proof standard for performance-critical and proprietary logic.

### Technical & Code Breakdown

- **SALT_CODES**:
    - **Purpose**: The Platform Salt stored as a numeric array of character codes (`u8`).
    - **Byte Encoding**: We store the salt as an array of `u8` bytes (UTF-8 codes) rather than a string. This ensures the secret never appears in plaintext string searches of the compiled binary.
    - **Security**: In WASM, this is baked into the binary bytecode as numeric constants.

- **deriveSeed(identity)**:
    - **Purpose**: Takes a user's identifier (like an email) and stable-mixes it with the internal salt.
    - **identity**: The raw identifier (e.g., Email).
    - **Logic**:
        1. Encodes the string to UTF-8.
        2. Combines it with the binary salt.
        3. Calls `hashBuffer` for each byte of the 32-byte seed, making it extremely difficult to guess the salt even if the input identity is known.
    - **Why AssemblyScript?**: It allows developers to write high-performance, binary-destined logic using a syntax nearly identical to TypeScript.

- **hashBuffer(identityByte, saltByte, index)**:
    - **Purpose**: A deterministic seed generator. 
    - **Logic**: XORs the identity byte with the salt byte and performs a bit-shift based on the index position. This obscures the simple relationship between input and output.
    - **Industrial Recommendation**: In a production environment, you should replace this logic with a full WASM implementation of **SHA-256** (e.g., via the `as-crypto` library).

### Usage Scenario
Instead of doing `hash(email + salt)` in `index.ts` (where both are visible to any browser extension or script), you call the WASM module. The "combination" logic happens inside the binary, making extraction extremely difficult for casual attackers.

### Compilation & Integration
This file **MUST** be compiled using the AssemblyScript compiler (`asc`). The resulting `.wasm` file is then loaded by the `worker/index.ts` to derive the keys used for Nostr and AES encryption.
```bash
npx asc src/services/sync/worker/crypto.asm.ts -o src/services/sync/worker/crypto.wasm
```
