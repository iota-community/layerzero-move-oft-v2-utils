import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction } from '@iota/iota-sdk/transactions';
import { toHex } from '@iota/iota-sdk/utils';
import { arrayify } from '@layerzerolabs/lz-utilities';

export const inspectTx = async (client: IotaClient, senderAddr: string, txb: Transaction) => {
  console.log('senderAddr:', senderAddr);

  txb.setSenderIfNotSet(senderAddr);

  const res = await client.devInspectTransactionBlock({
    transactionBlock: txb,
    sender: senderAddr,
  });
  console.log('inspectTx result:', res.effects.status);
};

export const dryRunTx = async (client: IotaClient, senderAddr: string, txb: Transaction) => {
  await inspectTx(client, senderAddr, txb);

  // Build a transaction block so that it can be signed or simulated
  const txBytes = await txb.build({ client });

  const { effects } = await client.dryRunTransactionBlock({
    transactionBlock: txBytes,
  });
  const {
    status: { status, error },
  } = effects;

  if (status !== 'success') {
    throw new Error(String(error));
  }

  console.log('dryRunTx status:', status);
};

export const executeTx = async (client: IotaClient, signer: Ed25519Keypair, txb: Transaction) => {
  const senderAddr = signer.getPublicKey().toIotaAddress();
  await inspectTx(client, senderAddr, txb);

  const { digest } = await client.signAndExecuteTransaction({
    signer,
    transaction: txb,
  });

  await client.waitForTransaction({
    digest,
  });

  console.log('executeTx - Tx hash:', digest);
};

export const buildTx = async (client: IotaClient, senderAddr: string, txb: Transaction) => {
  await inspectTx(client, senderAddr, txb);

  // Build a transaction block so that it can be signed or simulated
  const txBytes = await txb.build({ client });

  // Convert txb to hex string which can then be used as input to the multisig interface
  const txBytesHexStr = toHex(txBytes);

  console.log('Build txb result:', txBytesHexStr);
};

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
