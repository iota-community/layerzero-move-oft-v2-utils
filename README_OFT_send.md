# Send OFT

Needed input params in `.env`:

- REMOTE_RECIPIENT_ADDRESS
- TOKEN_AMOUNT_WITHOUT_DECIMALS

Cmd:

`yarn send-oft`

**Notice**

Same cmd as above to send existing coins or to send back the received OFT.

## Send existing coins on IOTA L1 testnet to Sepolia

Log example:

```
oft.quoteSend and oft.sendMoveCall
oftQuote: {
  limit: { minAmountLd: 0n, maxAmountLd: 18446744073709551615n },
  feeDetails: [],
  receipt: { amountSentLd: 5000000000n, amountReceivedLd: 5000000000n }
}
No OFT fees
messagingFee: { nativeFee: 282390432n, zroFee: 0n }
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: AdHWc3TZqN1QQVD63Bn5UBerzZV1uLMGVcydPBNKijpm
```

## Send existing coins on IOTA L1 testnet to Sui

Log example:

```
oft.quoteSend and oft.sendMoveCall
oftQuote: {
  limit: { minAmountLd: 0n, maxAmountLd: 18446744073709551615n },
  feeDetails: [],
  receipt: { amountSentLd: 1234000000n, amountReceivedLd: 1234000000n }
}
No OFT fees
messagingFee: { nativeFee: 8808194642n, zroFee: 0n }
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: H3cfWVC3TEEbeGKy8ogvQJouTTs6qJEmkaBKtxaazWnw
```

## Send back OFT from IOTA L1 MoveVM to EVM

### For the mainnet pathway from IOTA EVM to IOTA L1, this is to send back the received OFT on IOTA L1 mainnet to IOTA EVM.

Log example:

```
oft.quoteSend and oft.sendMoveCall
oftQuote: {
  limit: { minAmountLd: 0n, maxAmountLd: 18446744073709551615n },
  feeDetails: [],
  receipt: { amountSentLd: 300000000n, amountReceivedLd: 300000000n }
}
No OFT fees
messagingFee: { nativeFee: 209016263n, zroFee: 0n }
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: CRY6W9sdo6AUfefhUdEmCZEfHDxbbPbex7ab8dM88fck
```

### For the mainnet pathway from Arbitrum EVM to IOTA L1, this is to send back the received OFT on IOTA L1 mainnet to Arbitrum.

Log example:

```
oft.quoteSend and oft.sendMoveCall
oftQuote: {
  limit: { minAmountLd: 0n, maxAmountLd: 18446744073709551615n },
  feeDetails: [],
  receipt: { amountSentLd: 30300000000n, amountReceivedLd: 30300000000n }
}
No OFT fees
messagingFee: { nativeFee: 704377150n, zroFee: 0n }
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 9QhCbuF9i4M863nERyFCd1cHqVggZfgTEetTY5Tny9WW
```

### For the mainnet pathway from Sui to IOTA L1, this is to send back the received OFT on IOTA L1 mainnet to Sui.

Log example:

```
oftQuote: {
  limit: { minAmountLd: 0n, maxAmountLd: 18446744073709551615n },
  feeDetails: [],
  receipt: { amountSentLd: 200000000n, amountReceivedLd: 200000000n }
}
No OFT fees
messagingFee: { nativeFee: 3402819282n, zroFee: 0n }
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 77364jpdNA63vuHEFX3VqS1GY4hYiqKYV3QLva4n3rkn
```