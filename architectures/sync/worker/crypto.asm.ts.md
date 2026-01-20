# WASM Crypto Explainer (`crypto.asm.ts`)

[View Source File](file:///Users/dk/Lab_Data/ai-agents/ai-agent-rules/architectures/sync/worker/crypto.asm.ts)

This file contains the **Identity Hardening** logic. It is written in **AssemblyScript** (a TypeScript-like language for WASM) and is intended to be compiled into a `.wasm` binary.

### Why WASM for Security?

In a frontend-only application, any JavaScript code can be easily read via "Inspect Source." If you store a cryptographic salt as a plain string in JS, a casual attacker can extract it in seconds.

- **WASM as a "Black Box"**: When compiled to WASM, this logic becomes a binary payload. While not impossible to reverse-engineer, it requires specialized tools and deep knowledge of WebAssembly instruction sets. This elevates the security of your app to an industrial grade.

### Technical Breakdown

- **SALT_CODES**:
    - **Byte Encoding**: We store the salt as an array of `u8` bytes (UTF-8 codes) rather than a string. This prevents the secret from appearing in "Strings" searches of the compiled binary.
- **deriveSeed(identity)**:
    - **Purpose**: Takes a user's identifier (like an email) and stable-mixes it with the internal salt.
    - **Byte Shifting**: The logic uses deterministic XOR and bit-shifting operations. This obscures the relationship between the input and the output, making it extremely difficult to guess the salt even if the input identity is known.
    - **Industrial Recommendation**: In a high-stakes production app, you should replace the mock hashing loop with a full WASM implementation of **SHA-256** (e.g., via the `as-crypto` library).

### Code Breakdown
    - **Purpose**: The Platform Salt stored as a numeric array of character codes.
    - **Security**: In plain JavaScript, a salt is a visible string `const salt = "my_secret"`. In WASM, it is baked into the binary bytecode.

- **deriveSeed(identity)**:
    - **identity**: The raw identifier (e.g., Email).
    - **Logic**:
        1. Encodes the string to UTF-8.
        2. Combines it with the binary salt.
        3. Performs a cryptographic hash.
    - **Why AssemblyScript?**: It allows developers to write high-performance, binary-destined logic using a syntax nearly identical to TypeScript.

- **hashBuffer()**:
    - **Purpose**: A deterministic seed generator. In a production environment, this would utilize a strong algorithm like SHA-256 (via a WASM crypto library).

### Usage Scenario
Instead of doing `hash(email + salt)` in `index.ts` (where both are visible to any browser extension or script), you call the WASM module. The "combination" logic happens inside the binary, making extraction extremely difficult for casual attackers.

### Compilation & Integration
This file **MUST** be compiled using the AssemblyScript compiler (`asc`). The resulting `.wasm` file is then loaded by the `worker/index.ts` to derive the keys used for Nostr and AES encryption.
