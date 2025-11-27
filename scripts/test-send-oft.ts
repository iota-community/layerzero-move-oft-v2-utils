// Import OFT from npm lib
import { OFT } from '@layerzerolabs/lz-iotal1-oft-sdk-v2';

// Or import OFT from the available source code extracted from here:
// https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-oft-sdk-v2
// import { OFT } from '../iotal1-oft-sdk-v2';

import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction } from '@iota/iota-sdk/transactions';

import { Stage } from '@layerzerolabs/lz-definitions';
import { SDK, validateTransaction } from '@layerzerolabs/lz-iotal1-sdk-v2';
import { arrayify } from '@layerzerolabs/lz-utilities';
import { Options } from '@layerzerolabs/lz-v2-utilities';

import { addressToBytes32, formatAmount } from './utils';

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../config.json'), 'utf-8'));

// OFT deployment info
// const OFT_INFO = {
//   sharedDecimals: 6,
//   oft: {
//     oftPackageId: '0x366030d29a42c911123beef822fb542d4e6477188b462652ed22764ea97932b7',
//     oappObjectId: '0xea7a4ce60fd24aacdda2fb44b801dcc81a0b913063a145652f9606c3530c6156',
//     upgradeCap: '0xb8a30e10f3ad86bcbcaa87e48c89f041e0b5bfdcd5be2829b6e478aae36ead39',
//     oftInitTicketId: '0x42a88d07f640b9ec43934ac0e819a5321b540d70b7f6ca9e15f72d5b57035a9b',
//   },
//   oftObjectId: '0xc36df91c6eccc8a3a026ead7656abb7a36ab4210b2575a7dc27199eeec1f3de4',
//   oftComposerManagerId: '0x0f0b3c80ed9bfc559a4018fc37e3fefc690814fdfbb5125d7219768c7ca5a1f6',
// };

// const COIN_TYPE = '0x9f1eab668daaf3201e9c9546613d3e1d374b8b20a46fa680b813ce7011928fcb::tusd::TUSD';

// // Transfer parameters
// const DESTINATION_EID = 40161; // Ethereum Sepolia testnet
// const AMOUNT_TO_SEND = 1000000n; // Amount in local decimals (1 TUSD with 6 decimals)
// const RECIPIENT_ADDRESS = ''; // Recipient address on destination chain (leave empty to use sender)
// const GAS_LIMIT = 200000; // Gas limit for lzReceive on destination chain
// const NATIVE_DROP_AMOUNT = 0; // Native gas airdrop amount (in wei)

// // IOTA Testnet configuration
// const IOTA_TESTNET_URL = 'https://api.testnet.iota.cafe';
// const STAGE = Stage.TESTNET;

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('IOTA OFT Quote and Send Test Script (Testnet)');
  console.log('='.repeat(60));
  console.log();

  // Validation
  if (MNEMONIC.length === 0) {
    console.error('❌ Error: Please fill in the MNEMONIC in the script');
    process.exit(1);
  }

  try {
    // ==========================================
    // 1. SETUP
    // ==========================================
    console.log('📋 Step 1: Setting up connection and wallet...');
    console.log();

    // Initialize IOTA client
    const iotaClient = new IotaClient({ url: IOTA_TESTNET_URL });
    console.log(`✅ Connected to IOTA Testnet`);

    // Initialize wallet from mnemonic
    const keypair = Ed25519Keypair.deriveKeypair(MNEMONIC, DERIVATION_PATH);
    const senderAddress = keypair.getPublicKey().toIotaAddress();
    console.log(`✅ Wallet address: ${senderAddress}`);
    console.log();

    // Check balance
    const balance = await iotaClient.getBalance({ owner: senderAddress });
    console.log(`💰 IOTA Balance: ${formatAmount(BigInt(balance.totalBalance), 9)} IOTA`);

    // Check OFT token balance
    try {
      const oftBalance = await iotaClient.getBalance({
        owner: senderAddress,
        coinType: COIN_TYPE,
      });
      console.log(
        `💰 OFT Balance: ${formatAmount(BigInt(oftBalance.totalBalance), OFT_INFO.sharedDecimals)} tokens`,
      );
    } catch (error) {
      console.log('⚠️  Could not fetch OFT token balance');
    }
    console.log();

    // Initialize LayerZero SDK
    const sdk = new SDK({
      client: iotaClient,
      stage: STAGE,
    });
    console.log('✅ LayerZero SDK initialized');
    console.log();

    // Initialize OFT instance
    const oft = new OFT(
      sdk,
      OFT_INFO.oft.oftPackageId,
      OFT_INFO.oftObjectId,
      COIN_TYPE,
      OFT_INFO.oft.oappObjectId,
    );
    console.log('✅ OFT instance created');
    console.log();

    // ==========================================
    // 2. PREPARE SEND PARAMETERS
    // ==========================================
    console.log('📋 Step 2: Preparing transfer parameters...');
    console.log();

    // Determine recipient address
    const recipientAddress = RECIPIENT_ADDRESS.length > 0 ? RECIPIENT_ADDRESS : senderAddress;
    const recipientBytes = addressToBytes32(recipientAddress);

    // Set minimum amount (90% of send amount for 10% slippage tolerance)
    const minAmountLd = (AMOUNT_TO_SEND * 9n) / 10n;

    // Build LayerZero execution options
    const options = Options.newOptions()
      .addExecutorLzReceiveOption(GAS_LIMIT, NATIVE_DROP_AMOUNT)
      .toBytes();

    // Create send parameters
    const sendParam = {
      dstEid: DESTINATION_EID,
      to: recipientBytes,
      amountLd: AMOUNT_TO_SEND,
      minAmountLd: minAmountLd,
      extraOptions: options,
      composeMsg: new Uint8Array(0),
      oftCmd: new Uint8Array(0),
    };

    console.log(`  Destination EID: ${DESTINATION_EID}`);
    console.log(`  Recipient: ${recipientAddress}`);
    console.log(`  Amount: ${formatAmount(AMOUNT_TO_SEND, OFT_INFO.sharedDecimals)} tokens`);
    console.log(
      `  Min Amount: ${formatAmount(minAmountLd, OFT_INFO.sharedDecimals)} tokens (10% slippage)`,
    );
    console.log(`  Gas Limit: ${GAS_LIMIT}`);
    console.log(`  Native Drop: ${NATIVE_DROP_AMOUNT}`);
    console.log();

    // ==========================================
    // 3. QUOTE OFT DETAILS
    // ==========================================
    console.log('📋 Step 3: Getting OFT quote (limits and fees)...');
    console.log();

    const oftQuote = await oft.quoteOft(sendParam);

    console.log('📊 OFT Quote Results:');
    console.log(
      `  Min Amount LD: ${formatAmount(oftQuote.limit.minAmountLd, OFT_INFO.sharedDecimals)} tokens`,
    );
    console.log(
      `  Max Amount LD: ${formatAmount(oftQuote.limit.maxAmountLd, OFT_INFO.sharedDecimals)} tokens`,
    );
    console.log(
      `  Amount Sent: ${formatAmount(oftQuote.receipt.amountSentLd, OFT_INFO.sharedDecimals)} tokens`,
    );
    console.log(
      `  Amount Received: ${formatAmount(oftQuote.receipt.amountReceivedLd, OFT_INFO.sharedDecimals)} tokens`,
    );

    if (oftQuote.feeDetails.length > 0) {
      console.log('  Fee Details:');
      oftQuote.feeDetails.forEach((fee, idx) => {
        console.log(
          `    ${idx + 1}. ${fee.description}: ${formatAmount(fee.feeAmountLd, OFT_INFO.sharedDecimals)} tokens`,
        );
      });
    } else {
      console.log('  No OFT fees');
    }
    console.log();

    // ==========================================
    // 4. QUOTE MESSAGING FEE
    // ==========================================
    console.log('📋 Step 4: Getting LayerZero messaging fee quote...');
    console.log();

    const { nativeFee, zroFee } = await oft.quoteSend(
      senderAddress,
      sendParam,
      false, // payInZro: false = pay in native token (IOTA)
    );

    console.log('💸 Messaging Fee:');
    console.log(`  Native Fee (IOTA): ${formatAmount(nativeFee, 9)} IOTA`);
    console.log(`  ZRO Fee: ${zroFee} ZRO`);
    console.log();

    // Check if user has enough balance
    const requiredBalance = nativeFee;
    if (BigInt(balance.totalBalance) < requiredBalance) {
      console.error(`❌ Insufficient IOTA balance!`);
      console.error(`   Required: ${formatAmount(requiredBalance, 9)} IOTA`);
      console.error(`   Available: ${formatAmount(BigInt(balance.totalBalance), 9)} IOTA`);
      process.exit(1);
    }

    // ==========================================
    // 5. SEND OFT
    // ==========================================
    console.log('📋 Step 5: Sending OFT tokens...');
    console.log();

    const sendTx = new Transaction();

    // Split the exact amount of coins needed from sender's wallet
    const coin = await oft.splitCoinMoveCall(sendTx, senderAddress, AMOUNT_TO_SEND);

    // Execute the OFT send
    await oft.sendMoveCall(
      sendTx,
      senderAddress,
      sendParam,
      coin,
      nativeFee,
      zroFee,
      senderAddress, // refund address for unused fees
    );

    // Transfer any remaining coins back to sender
    sendTx.transferObjects([coin], senderAddress);

    console.log('⏳ Submitting transaction...');

    // Execute the transaction
    const result = await validateTransaction(iotaClient, keypair, sendTx);

    console.log();
    console.log('✅ Transaction successful!');
    console.log(`   Digest: ${result.digest}`);
    console.log();

    // Display transaction URL
    const explorerUrl = `https://explorer.iota.org/iota-testnet/txblock/${result.digest}`;
    console.log(`🔍 View transaction: ${explorerUrl}`);
    console.log();

    // ==========================================
    // 6. SUMMARY
    // ==========================================
    console.log('='.repeat(60));
    console.log('📊 TRANSACTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`From: ${senderAddress}`);
    console.log(`To: ${recipientAddress}`);
    console.log(`Amount Sent: ${formatAmount(AMOUNT_TO_SEND, OFT_INFO.sharedDecimals)} tokens`);
    console.log(`Destination: EID ${DESTINATION_EID}`);
    console.log(`Messaging Fee: ${formatAmount(nativeFee, 9)} IOTA`);
    console.log(`Transaction: ${result.digest}`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error();
    console.error('❌ Error occurred:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    console.log();
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error();
    console.error('❌ Script failed:');
    console.error(error);
    process.exit(1);
  });
