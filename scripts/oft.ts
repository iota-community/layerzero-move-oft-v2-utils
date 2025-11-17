import { OFT } from '@layerzerolabs/lz-iotal1-oft-sdk-v2';
import { SDK, validateTransaction } from '@layerzerolabs/lz-iotal1-sdk-v2';
import { Stage } from '@layerzerolabs/lz-definitions';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { dryRunTx, executeTx } from './utils';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8'));

async function main() {
  const { NETWORK, MNEMONIC } = process.env;
  const configData = NETWORK === 'mainnet' ? config.mainnet : config.testnet;
  const {
    sharedDecimals,
    oft: { oftPackageId, oappObjectId, oftInitTicketId },
    coin: { coinType, treasuryCapId, metadataId },
    oftObjectId,
    oftComposerManagerId,
  } = configData;

  const signer = Ed25519Keypair.deriveKeypair(MNEMONIC as string);
  const senderAddr = signer.toIotaAddress();

  const iotaClient = new IotaClient({
    url: NETWORK === 'mainnet' ? 'https://api.mainnet.iota.cafe' : 'https://api.testnet.iota.cafe',
  });

  // Initialize LayerZero protocol SDK
  const protocolSDK = new SDK({
    client: iotaClient,
    stage: NETWORK === 'mainnet' ? Stage.MAINNET : Stage.TESTNET,
  });

  // Create OFT instance with package ID
  const oft = new OFT(protocolSDK, oftPackageId);

  const tx = new Transaction();

  if (process.env.INIT_OFT === 'true') {
    console.log('oft.initOftMoveCall');

    // Initialize OFT with treasury capability (for minting/burning)
    const [adminCap, migrationCap] = oft.initOftMoveCall(
      tx,
      coinType, // e.g., "0x123::my_coin::MY_COIN"
      oftInitTicketId, // OFT creation ticket
      oappObjectId, // Associated OApp object
      treasuryCapId, // Treasury cap for minting/burning
      metadataId, // Coin metadata
      sharedDecimals, // Shared decimals for cross-chain compatibility
    );

    // Transfer capabilities to your address
    tx.transferObjects([adminCap, migrationCap], tx.pure.address(senderAddr));
  } else if (process.env.INIT_OFT_ADAPTER === 'true') {
    console.log('oft.initOftAdapterMoveCall');

    // Initialize OFT Adapter (wraps existing tokens without minting/burning)
    const [adminCap, migrationCap] = oft.initOftAdapterMoveCall(
      tx,
      coinType, // e.g., "0x123::my_coin::MY_COIN"
      oftInitTicketId, // OFT creation ticket
      oappObjectId, // Associated OApp object
      metadataId, // Coin metadata
      sharedDecimals, // Shared decimals for cross-chain compatibility
    );

    // Transfer capabilities to your address
    tx.transferObjects([adminCap, migrationCap], tx.pure.address(senderAddr));
  } else if (process.env.REGISTER_OFT === 'true') {
    console.log('oft.registerOAppMoveCall');
    console.log('oftComposerManagerId:', oftComposerManagerId);

    // Register the OFT as an OApp with the LayerZero endpoint
    await oft.registerOAppMoveCall(
      tx,
      coinType, // Coin type
      oftObjectId, // Created OFT object ID
      oappObjectId, // Associated OApp object ID
      oftComposerManagerId, // OFT Composer Manager for handling compose messages
      undefined,
    );
  }

  // await dryRunTx(iotaClient, senderAddr, tx);
  await executeTx(iotaClient, signer, tx);
}

main().catch(console.error);
