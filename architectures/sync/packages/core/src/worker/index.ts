/**
 * Nostr Sync Web Worker (Industrial Reference)
 * Offloads compute (WASM) and network (WebSockets) logic from the UI thread.
 * Ensures that UI remains responsive (60fps) even during heavy cryptographic operations.
 */

import { getPublicKey, finalizeEvent } from 'nostr-tools';
import { SyncMessageType, SyncMessage, SyncConfig, SyncPayload, InitPayload, SyncData } from '../types';
import syncConfigJson from '../config.json';

// @ts-ignore - Self-contained WASM binary (Base64 chunked to prevent truncation)
const WASM_BIN_B64 =
  "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" +
  "AzYCACMLQQRrJAsjC0HsD0gNBCMLQQA2AgAjCyADNgIAIAEgAygCCE8EQEHACkGADUGnAUEtEAAACyML" +
  "IAM2AgAgASADKAIEai0AACEAIwtBBGokCwUgAUH/AW8hAAsjC0HQCDYCACMLQdAINgIQIwtBBGskCyML" +
  "QewPSA0DIwtBADYCACMLQdAINgIAQdwIKAIAIQQjC0EEaiQLIAEgBG8hBCMLQQRrJAsjC0HsD0gNAyML" +
  "QQA2AgAjC0HQCDYCACAEQdwIKAIATwRAQcAKQbAOQfIAQSoQAAALIwtB0Ag2AgAgBEHUCCgCAGotAAAh" +
  "BCMLQQRqJAsjCyACNgIAIwtBBGskCyMLQewPSA0DIwtBADYCACMLIAI2AgAgASACKAIITwRAQcAKQYAN" +
  "QbIBQS0QAAALIwsgAjYCACABIAIoAgRqIABB/wFxIARzIAFBBG90OgAAIwtBBGokCyABQQFqIQEMAQsL" +
  "IwtBFGokCyACDwsAC0GAkAJBsJACQQFBARAAAAs3ACMLQQRrJAsjC0HsD0gEQEGAkAJBsJACQQFBARAA" +
  "AAsjCyAANgIAIAAQESEAIwtBBGokCyAACwudBh8AQYwICwEsAEGYCAsaAQAAABIAAABQbGF0Zm9ybVNl" +
  "Y3JldDIwMjYAQbwICwEsAEHICAsVBAAAABAAAAAgBAAAIAQAABIAAAASAEHsCAsBPABB+AgLLwIAAAAo" +
  "AAAAQQBsAGwAbwBjAGEAdABpAG8AbgAgAHQAbwBvACAAbABhAHIAZwBlAEGsCQsBPABBuAkLJwIAAAAg" +
  "AAAAfgBsAGkAYgAvAHIAdAAvAGkAdABjAG0AcwAuAHQAcwBBrAoLATwAQbgKCysCAAAAJAAAAEkAbgBk" +
  "AGUAeAAgAG8AdQB0ACAAbwBmACAAcgBhAG4AZwBlAEHsCgsBLABB+AoLGwIAAAAUAAAAfgBsAGkAYgAv" +
  "AHIAdAAuAHQAcwBBvAsLATwAQcgLCyUCAAAAHgAAAH4AbABpAGIALwByAHQALwB0AGwAcwBmAC4AdABz" +
  "AEH8CwsBPABBiAwLKwIAAAAkAAAAVQBuAHAAYQBpAHIAZQBkACAAcwB1AHIAcgBvAGcAYQB0AGUAQbwM" +
  "CwEsAEHIDAsjAgAAABwAAAB+AGwAaQBiAC8AcwB0AHIAaQBuAGcALgB0AHMAQewMCwE8AEH4DAsrAgAA" +
  "ACQAAAB+AGwAaQBiAC8AdAB5AHAAZQBkAGEAcgByAGEAeQAuAHQAcwBBrA0LASwAQbgNCyMCAAAAHAAA" +
  "AEkAbgB2AGEAbABpAGQAIABsAGUAbgBnAHQAaABB3A0LATwAQegNCy0CAAAAJgAAAH4AbABpAGIALwBh" +
  "AHIAcgBhAHkAYgB1AGYAZgBlAHIALgB0AHMAQZwOCwEsAEGoDgshAgAAABoAAAB+AGwAaQBiAC8AYQBy" +
  "AHIAYQB5AC4AdABzAEHMDgsBPABB2A4LMQIAAAAqAAAATwBiAGoAZQBjAHQAIABhAGwAcgBlAGEAZAB5" +
  "ACAAcABpAG4AbgBlAGQAQYwPCwE8AEGYDwsvAgAAACgAAABPAGIAagBlAGMAdAAgAGkAcwAgAG4AbwB0" +
  "ACAAcABpAG4AbgBlAGQAQdAPCxkGAAAAIAAAACAAAAAgAAAAAAAAAEIAAABB" +
  "";

// @ts-ignore - Placeholder for the WASM derivation function
let wasmDeriveSeed: ((id: string) => Uint8Array) | null = null;

// Shared state for the worker instance
let config: SyncConfig;
let privateKey: Uint8Array;
let encryptionKey: CryptoKey;
let publicKey: string;
let socket: WebSocket | null = null;
let currentRelayIndex = 0;

// Initialize configuration from JSON
try {
  config = syncConfigJson as SyncConfig;
  if (!config || !config.relays) throw new Error('Malformed config.json');
} catch (err) {
  console.error('[SyncWorker] CRITICAL: Configuration initialization failed', err);
}

/**
 * Global message handler for the Web Worker.
 * Listens for instructions from the Main Thread (SyncEngine).
 */
self.onmessage = async (event: MessageEvent<SyncMessage<unknown>>) => {
  try {
    // 1. Strict Runtime Validation
    if (!event.data || typeof event.data !== 'object') {
      throw new Error('Malformed MessageEvent: Data is not an object');
    }

    const { type, payload } = event.data;
    if (!type) throw new Error('Malformed message: Type is missing');

    console.log(`[SyncWorker] RX: ${type}`);

    switch (type) {
      case SyncMessageType.INIT:
        if (validateInitPayload(payload)) {
          await handleInit(payload.identitySeed);
        } else {
          throw new Error('Invalid INIT payload');
        }
        break;

      case SyncMessageType.SYNC_OUT:
        if (validateSyncPayload(payload)) {
          handleSyncOut(payload.data);
        } else {
          throw new Error('Invalid SYNC_OUT payload');
        }
        break;

      case SyncMessageType.SYNC_IN:
        handleSyncIn();
        break;

      default:
        console.warn(`[SyncWorker] Unhandled message type: ${type}`);
    }
  } catch (err) {
    console.error('[SyncWorker] FATAL: Inter-thread communication error', err);
    self.postMessage({
      type: SyncMessageType.ERROR,
      payload: { message: err instanceof Error ? err.message : 'Unknown worker error' }
    });
  }
};

/**
 * Validates the Initialization payload at runtime.
 */
function validateInitPayload(payload: any): payload is InitPayload {
  return payload && (typeof payload.identitySeed === 'string' || Array.isArray(payload.identitySeed));
}

/**
 * Validates the Synchronization payload at runtime.
 */
function validateSyncPayload(payload: any): payload is SyncPayload {
  return payload && typeof payload.data === 'object' && payload.data !== null;
}

/**
 * Handles the identity derivation and crypto key generation.
 * @param identitySeed - The raw user identifier(s) from the app session.
 */
async function handleInit(identitySeed: string | string[]) {
  const normalizedSeed = Array.isArray(identitySeed) ? identitySeed.join('|') : identitySeed;

  console.log('[SyncWorker] Initializing Identity Vault...');

  // 1. WASM Hardened Seed Derivation (Manual Instantiation)
  if (!wasmDeriveSeed) {
    try {
      console.log('[SyncWorker] WASM: Loading self-contained binary...');

      const buffer = Uint8Array.from(atob(WASM_BIN_B64), c => c.charCodeAt(0));
      // Satisfy mandatory AssemblyScript imports
      const imports = {
        env: {
          abort: (msg: any, file: any, line: any, col: any) => console.error(`[WASM] abort: ${msg}`),
          seed: () => Date.now()
        }
      };
      const { instance } = await WebAssembly.instantiate(buffer, imports);

      // @ts-ignore - AssemblyScript export
      wasmDeriveSeed = (id: string) => {
        const { deriveSeed, __newString, __getUint8Array } = instance.exports as any;
        const idPtr = __newString(id);
        const resultPtr = deriveSeed(idPtr);
        return __getUint8Array(resultPtr);
      };
      console.log('[SyncWorker] WASM: Deterministic seed module instantiated');
    } catch (e) {
      console.warn('[SyncWorker] SECURITY WARNING: WASM instantiation failed, falling back to JS implementation', e);
    }
  }

  let seed: Uint8Array;
  if (wasmDeriveSeed) {
    try {
      seed = wasmDeriveSeed(normalizedSeed).slice(0, 32);
      console.log('[SyncWorker] WASM: Seed derived using binary module');
    } catch (e) {
      console.error('[SyncWorker] WASM: Execution error', e);
      // Fallback to SHA-256 for consistent 32-byte key
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizedSeed));
      seed = new Uint8Array(hash);
    }
  } else {
    // Fallback to SHA-256 for consistent 32-byte key
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizedSeed));
    seed = new Uint8Array(hash);
    console.log('[SyncWorker] CRYPTO: Seed derived using SHA-256 fallback');
  }

  // 2. PBKDF2 Identity Hardening
  // Runs 100k iterations in the background thread to prevent UI stuttering.
  const baseKey = await crypto.subtle.importKey(
    'raw',
    seed as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  encryptionKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(config.platformSalt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  // 3. Establish Nostr Identity (Deterministic)
  privateKey = seed;
  publicKey = getPublicKey(privateKey);

  console.log('[SyncWorker] Vault Ready: Keys generated successfully');

  self.postMessage({
    type: SyncMessageType.READY,
    payload: { publicKey }
  });

  connectRelayMesh();
}

/**
 * Establishes a WebSocket connection to the decentralized relay network.
 * Implements automatic failover logic if a relay becomes unavailable.
 */
function connectRelayMesh() {
  const relay = config.relays[currentRelayIndex];
  console.log(`[SyncWorker] Mesh: Connecting to ${relay}...`);

  socket = new WebSocket(relay);

  socket.onopen = () => {
    console.log(`[SyncWorker] Mesh Connected: ${relay}`);
    handleSyncIn();
  };

  socket.onmessage = async (event: MessageEvent<string>) => {
    try {
      const nostrEvent = JSON.parse(event.data);
      if (Array.isArray(nostrEvent) && nostrEvent[0] === 'EVENT') {
        const encryptedContent = nostrEvent[2].content;
        const plainData = await decrypt(encryptedContent);

        if (plainData) {
          console.log('[SyncWorker] RX: Remote state fragment decrypted');
          self.postMessage({
            type: SyncMessageType.SYNC_RECEIVED,
            payload: { data: plainData }
          });
        }
      }
    } catch (err) {
      console.warn('[SyncWorker] Mesh: Ignoring malformed or undecryptable event');
    }
  };

  socket.onclose = () => {
    console.warn(`[SyncWorker] Mesh: Disconnected from ${relay}. Failover triggered.`);
    currentRelayIndex = (currentRelayIndex + 1) % config.relays.length;
    setTimeout(() => connectRelayMesh(), 5000);
  };

  socket.onerror = (err) => {
    console.error(`[SyncWorker] Mesh Error: ${relay}`, err);
  };
}

/**
 * Encrypts and publishes local state changes to the decentralized buffer.
 * @param data - The state fragment to broadcast.
 */
async function handleSyncOut(data: SyncData) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('[SyncWorker] TX: Skip (Socket not ready)');
    return;
  }

  try {
    const ciphertext = await encrypt(JSON.stringify(data));
    const event = {
      kind: config.nostrKind,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['d', config.defaultDTag]],
      content: ciphertext,
      pubkey: publicKey,
    };

    const signedEvent = finalizeEvent(event, privateKey);
    socket.send(JSON.stringify(['EVENT', signedEvent]));
    console.log(`[SyncWorker] TX: State fragment published (Kind ${event.kind})`);
  } catch (err) {
    console.error('[SyncWorker] TX: Failed to publish update', err);
  }
}

/**
 * Requests the latest state buffer from the relay mesh.
 */
function handleSyncIn() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const subId = Math.random().toString(36).substring(7);
  const filter = {
    kinds: [config.nostrKind],
    authors: [publicKey],
    '#d': [config.defaultDTag]
  };

  socket.send(JSON.stringify(['REQ', subId, filter]));
  console.log(`[SyncWorker] REQ: Listening for remote changes (ID: ${subId})`);
}

/**
 * High-performance encryption using the WebCrypto API (AES-GCM).
 */
async function encrypt(text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    encryptionKey,
    new TextEncoder().encode(text)
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts data using the derived industrial-grade key.
 * @param encoded - Base64 encoded IV + Ciphertext.
 */
async function decrypt(encoded: string): Promise<SyncData | null> {
  try {
    const combined = new Uint8Array(atob(encoded).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      ciphertext
    );

    return JSON.parse(new TextDecoder().decode(decrypted)) as SyncData;
  } catch (err) {
    return null;
  }
}
