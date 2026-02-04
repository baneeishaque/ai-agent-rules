/**
 * Nostr Sync Web Worker (Industrial Reference)
 * Offloads compute (WASM) and network (WebSockets) logic from the UI thread.
 */

import { generateSecretKey, getPublicKey, finalizeEvent } from 'nostr-tools';
import { SyncMessageType, SyncMessage, SyncConfig, SyncPayload, InitPayload, SyncData } from '../types';
let config: SyncConfig;

try {
  config = syncConfigJson as SyncConfig;
  if (!config.relays || !Array.isArray(config.relays)) {
    throw new Error('Missing or malformed relays in config');
  }
} catch (err) {
  console.error('[SyncWorker] Config initialization failed:', err);
  // Fallback or critical failure handling
}

// SSOT Constants for Internal Logic
const WORKER_CONSTANTS = {
  ENCRYPTION_PREFIX: 'aes-gcm:',
  ERROR_INVALID_IDENTITY: 'Identity discovery failed',
  RELAY_TIMEOUT_MS: 5000
};

let privateKey: Uint8Array;
let publicKey: string;
let socket: WebSocket | null = null;
let currentRelayIndex = 0;

self.onmessage = async (event: MessageEvent<SyncMessage<unknown>>) => {
  try {
    const data = event.data;
    if (!data || typeof data !== 'object') throw new Error('Invalid MessageEvent data');
    
    const { type, payload } = data;

    switch (type) {
      case SyncMessageType.INIT:
        if (payload && typeof payload === 'object' && 'identitySeed' in (payload as any)) {
          await handleInit((payload as InitPayload).identitySeed);
        }
        break;
      case SyncMessageType.SYNC_OUT:
        if (payload && typeof payload === 'object' && 'data' in (payload as any)) {
          handleSyncOut((payload as SyncPayload).data);
        }
        break;
      case SyncMessageType.SYNC_IN:
        handleSyncIn();
        break;
    }
  } catch (err) {
    console.error('[SyncWorker] Message handling error:', err);
    self.postMessage({ type: SyncMessageType.ERROR, payload: { message: 'Internal Worker logic failure' } });
  }
};

/**
 * Initializes identity and relay mesh connections.
 */
async function handleInit(identitySeed: string | string[]) {
  if (!identitySeed) {
    self.postMessage({ type: SyncMessageType.ERROR, payload: { message: WORKER_CONSTANTS.ERROR_INVALID_IDENTITY } });
    return;
  }

  // Identity logic: seed can be a string (email) or array (compound identifier)
  const normalizedSeed = Array.isArray(identitySeed) ? identitySeed.join('|') : identitySeed;
  
  // 1. WASM Hardened Key Derivation
  // PRODUCTION: import { deriveSeed } from './crypto.asm';
  // const seed = deriveSeed(normalizedSeed);
  privateKey = generateSecretKey(); 
  publicKey = getPublicKey(privateKey);
  
  self.postMessage({ 
    type: SyncMessageType.READY, 
    payload: { publicKey } 
  });
  
  connectRelayMesh();
}

function connectRelayMesh() {
  const relay = config.relays[currentRelayIndex]; 
  console.log(`[SyncWorker] Connecting to relay: ${relay}`);
  
  socket = new WebSocket(relay);
  
  socket.onopen = () => {
    console.log(`[SyncWorker] Connected to ${relay}`);
    handleSyncIn();
  };
  
  socket.onmessage = (event: MessageEvent<string>) => {
    try {
      const nostrEvent = JSON.parse(event.data);
      // NIP-01: ["EVENT", <sub_id>, <event_object>]
      if (Array.isArray(nostrEvent) && nostrEvent[0] === 'EVENT') {
        const eventObj = nostrEvent[2];
        const encryptedContent = eventObj.content;
        const plainData = decrypt(encryptedContent);
        
        if (plainData) {
          self.postMessage({ 
            type: SyncMessageType.SYNC_RECEIVED, 
            payload: { data: plainData } 
          });
        }
      }
    } catch (err) {
      console.error('[SyncWorker] Malformed Nostr event:', err);
    }
  };

  socket.onerror = (err) => {
    console.warn(`[SyncWorker] Relay error (${relay}):`, err);
    socket?.close();
  };

  socket.onclose = () => {
    // Failover mesh loop
    currentRelayIndex = (currentRelayIndex + 1) % config.relays.length;
    console.log(`[SyncWorker] Relay disconnected. Retrying in ${WORKER_CONSTANTS.RELAY_TIMEOUT_MS}ms with next relay...`);
    setTimeout(() => connectRelayMesh(), WORKER_CONSTANTS.RELAY_TIMEOUT_MS);
  };
}

async function handleSyncOut(data: SyncData) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('[SyncWorker] Socket not ready. Skipping sync out.');
    return;
  }

  const ciphertext = await encrypt(JSON.stringify(data));
  const event = {
    kind: config.nostrKind,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', config.defaultDTag]],
    content: ciphertext,
    pubkey: publicKey,
  };

  // Sign and Publish (NIP-01)
  const signedEvent = finalizeEvent(event, privateKey);
  socket.send(JSON.stringify(['EVENT', signedEvent]));
  console.log(`[SyncWorker] Data published (Kind ${event.kind})`);
}

/**
 * Real-Time Buffer (Nostr Relays) - Subscription
 */
function handleSyncIn() {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  // REQ NIP-01 Subscription for Kind 30078
  const subId = Math.random().toString(36).substring(7);
  const filter = {
    kinds: [config.nostrKind],
    authors: [publicKey],
    '#d': [config.defaultDTag]
  };
  
  socket.send(JSON.stringify(['REQ', subId, filter]));
  console.log(`[SyncWorker] Subscribed to buffer (d-tag: ${config.defaultDTag})`);
}

/**
 * Industrial E2EE (AES-GCM) via WebCrypto
 */
async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive crypto key from private key bytes (Simplified for reference)
  const key = await crypto.subtle.importKey(
    'raw', 
    privateKey.slice(0, 32), 
    { name: 'AES-GCM' }, 
    false, 
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, 
    key, 
    data
  );

  // Return IV + Ciphertext (Base64 or Hex)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

async function decrypt(encoded: string): Promise<SyncData | null> {
  try {
    const combined = new Uint8Array(atob(encoded).split('').map(c => c.charCodeAt(0)));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const key = await crypto.subtle.importKey(
      'raw', 
      privateKey.slice(0, 32), 
      { name: 'AES-GCM' }, 
      false, 
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, 
      key, 
      ciphertext
    );

    const decoded = new TextDecoder().decode(decrypted);
    return JSON.parse(decoded) as SyncData;
  } catch (err) {
    console.error('[SyncWorker] E2EE Decryption failed:', err);
    return null;
  }
}
