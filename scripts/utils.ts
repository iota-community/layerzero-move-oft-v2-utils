import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction } from '@iota/iota-sdk/transactions';
import { toHex } from '@iota/iota-sdk/utils';

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
