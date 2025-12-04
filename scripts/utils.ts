import { arrayify } from '@layerzerolabs/lz-utilities';

export const hexAddrToMoveVMBytesAddr = (address: string | null | undefined): Uint8Array => {
  const bytes = address ? Buffer.from(address.replace('0x', ''), 'hex') : new Uint8Array(0);
  const bytes32 = new Uint8Array(32);
  bytes32.set(bytes, 32 - bytes.length);
  return bytes32;
};

export function addressToBytes32(address: string): Uint8Array {
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  return arrayify('0x' + cleanAddress.padStart(64, '0'));
}

export function formatAmount(amount: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  return `${whole}.${fraction.toString().padStart(decimals, '0')}`;
}
