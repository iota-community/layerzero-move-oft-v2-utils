// Import OFT from npm lib
// import { OFT } from '@layerzerolabs/lz-iotal1-oft-sdk-v2';

// Or import OFT from the available source code extracted from here:
// https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-oft-sdk-v2
import { OFT, SendParam } from '../iotal1-oft-sdk-v2';

import { SDK, validateTransaction } from '@layerzerolabs/lz-iotal1-sdk-v2';
import { Stage } from '@layerzerolabs/lz-definitions';
import { Transaction } from '@iota/iota-sdk/transactions';
import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { addressToBytes32, executeTx, formatAmount } from './utils';

import { Options } from '@layerzerolabs/lz-v2-utilities';
import { hexAddrToAptosBytesAddr, basexToBytes32 } from '@layerzerolabs/devtools-move';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8'));

async function quoteOFT(oft: OFT, sendParam: SendParam, sharedDecimals: number) {
  const oftQuote = await oft.quoteOft(sendParam);
  console.log('oftQuote:', oftQuote);

  if (oftQuote.feeDetails.length > 0) {
    console.log('Fee Details:');
    oftQuote.feeDetails.forEach((fee, idx) => {
      console.log(
        `${idx + 1}. ${fee.description}: ${formatAmount(fee.feeAmountLd, sharedDecimals)} tokens`,
      );
    });
  } else {
    console.log('No OFT fees');
  }
}

async function main() {
  const {
    NETWORK,
    MNEMONIC,
    EVM_EID_AS_DEST_CHAIN,
    EVM_RECIPIENT_ADDRESS,
    EVM_TOKEN_AMOUNT_WITHOUT_DECIMALS,
  } = process.env;
  const configData = NETWORK === 'mainnet' ? config.mainnet : config.testnet;
  const {
    sharedDecimals,
    oft: { oftPackageId, oappObjectId, oftInitTicketId },
    coin: { coinType, treasuryCapId, metadataId, coinDecimals },
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

  // The `tx` will be built with multiple Move calls depending on the operations if-else below
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

    let peerAddress = '0xE03934D55A6d0f2Dc20759A1317c9Dd8f9D683cA';
    peerAddress = basexToBytes32(peerAddress);
    const peerAddressBytes = hexAddrToAptosBytesAddr(peerAddress);

    // Set peer OFT on destination chain
    await oapp.setPeerMoveCall(
      tx,
      40161, // remoteEid, // Remote chain endpoint ID (e.g., 30102 for Ethereum)
      peerAddressBytes, // hexAddrToMoveVMBytesAddr('0xE03934D55A6d0f2Dc20759A1317c9Dd8f9D683cA'), // remotePeerBytes, // Remote OFT address as 32-byte array
    );
  } else if (process.env.SEND_OFT === 'true') {
    console.log('oft.quoteSend and oft.sendMoveCall');

    const extraOptions = Options.newOptions().addExecutorLzReceiveOption(200_000, 0).toBytes();

    // Converted amount in local decimals
    // specified by `coinDecimals` of the original coin on source chain
    const amountLd = BigInt(EVM_TOKEN_AMOUNT_WITHOUT_DECIMALS) * BigInt(10 ** coinDecimals);
    const minAmountLd = (amountLd * 99n) / 100n; // 1% slippage protection

    // Prepare send parameters
    const sendParam = {
      dstEid: EVM_EID_AS_DEST_CHAIN, // Sepolia
      to: addressToBytes32(EVM_RECIPIENT_ADDRESS), // Recipient address on Sepolia
      amountLd, // Amount in local decimals
      minAmountLd, // BigInt('5000000'), // Minimum amount (slippage protection)
      extraOptions, // new Uint8Array(0), // LayerZero execution options
      composeMsg: new Uint8Array(0), // Optional compose message
      oftCmd: new Uint8Array(0), // Optional OFT command (unused in default OFT)
    };

    await quoteOFT(oft, sendParam, sharedDecimals);

    // Quote the transfer fees
    const messagingFee = await oft.quoteSend(
      senderAddr,
      sendParam,
      false, // payInZro: false = pay in native token
    );

    console.log('messagingFee:', messagingFee);

    // Split coins from sender's wallet
    const coin = await oft.splitCoinMoveCall(tx, senderAddr, sendParam.amountLd);

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
    tx.transferObjects([coin], senderAddr);
  }

  // Can dryRun or executeTx provided by the `utils`
  // await dryRunTx(iotaClient, senderAddr, tx);
  await executeTx(iotaClient, signer, tx);

  // Or just use the method `validateTransaction` provided by LZ
  // const result = await validateTransaction(iotaClient, signer, tx);
  // console.log('result:', result);
}

main().catch(console.error);
