# Utilities for LayerZero MoveVM OFT V2

Implemented by IOTA Foundation.

## Introduction

Utility scripts for LayerZero MoveVM OFT V2 that facilitate cross-chain sending of fungible tokens between IOTA MoveVM and other EVM(s).

This document focus is on the MoveVM of the IOTA L1 `testnet` while the EVM-related instructions can be found at [here](https://github.com/iota-community/layerzero-oft-v2-utils/tree/movevm).

## OFTAdapter and OFT contracts

**Use-case 1**

To enable the `existing` fungible tokens for cross-chain sending, both OFTAdapter and OFT contracts are needed. Particularly:

- OFTAdapter contract: used to wrap the existing fungible tokens on source chain
- OFT contract: used to represent the equivalent fungible tokens on destination chain

**Use-case 2**

For `brand-new` fungible tokens to be launched, OFT standard can be leveraged to enable cross-chain sending without the need of OFTAdapter. Particularly:

- OFT contract: used to define the brand-new fungible tokens on source chain
- OFT contract: used to represent the equivalent fungible tokens on destination chain

[Reference](https://docs.layerzero.network/v2/concepts/applications/oft-standard#omnichain-token-standards)

### Deploy OFTAdapter and OFT contracts on IOTA MoveVM

On IOTA MoveVM, both OFTAdapter and OFT contracts use the same [Move module](https://github.com/LayerZero-Labs/LayerZero-v2/tree/main/packages/layerzero-v2/iota/contracts/oapps/oft/oft). To deploy it, run the following cmds

```bash
git clone https://github.com/LayerZero-Labs/LayerZero-v2.git

cd LayerZero-v2/packages/layerzero-v2/iota/contracts/oapps/oft/oft

iota client publish
```

**Notice**

After deployment, take note the following:

- PackageID
- oft_impl::OFTInitTicket
- oapp::OApp
- package::UpgradeCap

### Build/test OFT contract on IOTA MoveVM

To build/test [OFT Move contract](https://github.com/LayerZero-Labs/LayerZero-v2/tree/main/packages/layerzero-v2/iota/contracts/oapps/oft/oft) on IOTA MoveVM, run the following cmds

```bash
git clone https://github.com/LayerZero-Labs/LayerZero-v2.git

cd LayerZero-v2/packages/layerzero-v2/iota/contracts

yarn

yarn build

yarn test
```

### Deploy OFTAdapter and OFT contracts on EVM

See [instruction](https://github.com/iota-community/layerzero-oft-v2-utils/tree/movevm?tab=readme-ov-file#deploy-contracts)

## Config on MoveVM

Specified in the file `config.json`.

**Notice**

- Param `oftObjectId` is only available after running the `init` for the deployed OFT contract.
- Param `oftComposerManagerId` is specified by the objectType `OFTComposerManager` in file `@layerzerolabs\lz-iotal1-sdk-v2\deployments\iotal1-testnet\oft_common.json`.

Copy the `.env.example` to `.env` and edit accordingly the params.

## Install

`yarn`

## Scripts

See [reference](https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-oft-sdk-v2)

### Init OFTAdapter

**Prerequisite**

Complete the step `Deploy OFTAdapter and OFT contracts on IOTA MoveVM` mentioned above.

`yarn init-oft-adapter`

```bash
oft.initOftAdapterMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: AGQnzWHr4xdFkFwv98BH2D8P78HvWCzX1HK97qHMxMKE
```

### Register OFT

It's the same to register either OFT or OFTAdapter.

**Notice**

The param `oftComposerManagerId` in `config.json` is taken from `@layerzerolabs\lz-iotal1-sdk-v2\deployments\iotal1-testnet\oft_common.json` for testnet or from `@layerzerolabs\lz-iotal1-sdk-v2\deployments\iotal1-mainnet\oft_common.json` for mainnet.

`yarn register-oft`

```bash
oft.registerOAppMoveCall
oftComposerManagerId: 0x0f0b3c80ed9bfc559a4018fc37e3fefc690814fdfbb5125d7219768c7ca5a1f6
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 3kEDAW6M1ydEwebrR2GvQpRyBVwdVoyvNQmZFzCuw9Aj
```

### Set peer for OFT

It's the same to register either OFT or OFTAdapter.

`yarn set-peer-oft`

```bash
oapp.setPeerMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: BiBWawGk5ggUxfwhFcubZMpY46W44tWySHhoRSwSh3Ws
```

### Send OFT from MoveVM to EVM

Check the `.env` params. For example:

```
# Sepolia as EVM destination chain
EVM_EID_AS_DEST_CHAIN=40161
EVM_RECIPIENT_ADDRESS='0xE03934D55A6d0f2Dc20759A1317c9Dd8f9D683cA';
EVM_TOKEN_AMOUNT_WITHOUT_DECIMALS=5
```

To send the existing coins on IOTA L1 testnet to Sepolia as destination EVM chain, run the following cmd:

`yarn send-oft`

```bash
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
