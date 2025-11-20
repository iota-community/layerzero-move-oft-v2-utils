// Import OFT from npm lib
// import { OFT } from '@layerzerolabs/lz-iotal1-oft-sdk-v2';

// Or import OFT from the available source code extracted from here:
// https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-oft-sdk-v2
import { OFT } from '../iotal1-oft-sdk-v2';

import { SDK, validateTransaction } from '@layerzerolabs/lz-iotal1-sdk-v2';
import { Stage } from '@layerzerolabs/lz-definitions';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { dryRunTx, executeTx, hexAddrToMoveVMBytesAddr } from './utils';

///
import { EndpointId, getNetworkForChainId } from '@layerzerolabs/lz-definitions';
import { Options } from '@layerzerolabs/lz-v2-utilities';
import * as readline from 'readline';
import {
  hexAddrToAptosBytesAddr,
  sendAllTxs,
  basexToBytes32,
  TaskContext,
} from '@layerzerolabs/devtools-move';
///

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
      oftObjectId, // Created OFT object ID after the step `init` above
      oappObjectId, // Associated OApp object ID
      oftComposerManagerId, // OFT Composer Manager for handling compose messages
      undefined,
    );
  } else if (process.env.SET_PEER_OFT === 'true') {
    console.log('oapp.setPeerMoveCall');

    // Get OApp instance from OFT
    const oapp = protocolSDK.getOApp(oftPackageId);

    // Set peer OFT on destination chain
    await oapp.setPeerMoveCall(
      tx,
      40161, // remoteEid, // Remote chain endpoint ID (e.g., 30102 for Ethereum)
      hexAddrToMoveVMBytesAddr('0xE03934D55A6d0f2Dc20759A1317c9Dd8f9D683cA'), // remotePeerBytes, // Remote OFT address as 32-byte array
    );
  } else if (process.env.QUOTE_SEND_OFT === 'true') {
    console.log('oft.quoteSend and oft.sendMoveCall');

    // Pad EVM address to 64 chars and convert Solana address to Aptos address
    let toAddress = '0x6B4253377AfEe889d5a396B9Ed18F4C93251e26b';
    toAddress = basexToBytes32(toAddress);
    const toAddressBytes = hexAddrToAptosBytesAddr(toAddress);
    const options = Options.newOptions().addExecutorLzReceiveOption(BigInt(200_000));

    // Prepare send parameters
    const sendParam = {
      dstEid: 40161, // Sepolia
      to: toAddressBytes, // Recipient address on Sepolia
      amountLd: 1000000000n, // Amount in local decimals
      minAmountLd: 990000000n, // Minimum amount (slippage protection)
      extraOptions: options.toBytes(), // new Uint8Array(0), // LayerZero execution options
      composeMsg: new Uint8Array(0), // Optional compose message
      oftCmd: new Uint8Array(0), // Optional OFT command (unused in default OFT)
    };

    // Quote the transfer fees
    const messagingFee = await oft.quoteSend(
      senderAddr,
      sendParam,
      false, // payInZro: false = pay in native token
    );

    // console.log('sendParam:', sendParam);
    console.log('messagingFee:', messagingFee);

    // Execute the transfer
    const tx = new Transaction();

    // Split coins from sender's wallet
    const coin = await oft.splitCoinMoveCall(tx, senderAddr, sendParam.amountLd);

    console.log('coin:', coin);

    // Send the tokens
    await oft.sendMoveCall(
      tx,
      senderAddr,
      sendParam,
      coin,
      messagingFee.nativeFee,
      messagingFee.zroFee,
      senderAddr, // refund address
    );

    // Transfer any remaining coins back to sender
    // tx.transferObjects([coin], senderAddr);
  }

  // Can dryRun or executeTx provided by the `utils`
  // await dryRunTx(iotaClient, senderAddr, tx);
  // await executeTx(iotaClient, signer, tx);

  // Or just use the method `validateTransaction` provided by LZ
  const result = await validateTransaction(iotaClient, signer, tx);
  console.log('result:', result);
}

main().catch(console.error);
