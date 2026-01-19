# crypto.asm.ts Explainer

This is the **AssemblyScript (WASM)** source for identity hardening. It creates a "Black Box" for your identity secrets.

### Code Breakdown

- **SALT_CODES**:
    - **Purpose**: The Platform Salt stored as a numeric array of character codes.
    - **Security**: In plain JavaScript, a salt is a visible string `const salt = "my_secret"`. In WASM, it is baked into the binary bytecode.

- **deriveSeed(identitySegment)**:
    - **identitySegment**: The raw identifier (e.g., Email).
    - **Logic**:
        1. Encodes the string to UTF-8.
        2. Combines it with the binary salt.
        3. Performs a cryptographic hash.
    - **Why AssemblyScript?**: It allows developers to write high-performance, binary-destined logic using a syntax nearly identical to TypeScript.

- **hashBuffer()**:
    - **Purpose**: A deterministic seed generator. In a production environment, this would utilize a strong algorithm like SHA-256 (via a WASM crypto library).

### Usage Scenario
Instead of doing `hash(email + salt)` in `index.ts` (where both are visible to any browser extension or script), you call the WASM module. The "combination" logic happens inside the binary, making extraction extremely difficult for casual attackers.
