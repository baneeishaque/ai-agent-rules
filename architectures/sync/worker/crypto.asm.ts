/**
 * AssemblyScript (WASM) Identity Hardening (Reference)
 */

const SALT_CODES: u8[] = [80, 108, 97, 116, 102, 111, 114, 109, 83, 101, 99, 114, 101, 116, 50, 48, 50, 54]; 

export function deriveSeed(identitySegment: string): Uint8Array {
  const segmentBuffer = String.UTF8.encode(identitySegment);
  const combined = new Uint8Array(segmentBuffer.byteLength + SALT_CODES.length);

  for (let i = 0; i < segmentBuffer.byteLength; i++) {
    combined[i] = load<u8>(changetype<usize>(segmentBuffer) + i);
  }
  for (let i = 0; i < SALT_CODES.length; i++) {
    combined[segmentBuffer.byteLength + i] = SALT_CODES[i];
  }

  return hashBuffer(combined);
}

function hashBuffer(input: Uint8Array): Uint8Array {
  const hash = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    hash[i] = input[i % input.length] ^ i;
  }
  return hash;
}
