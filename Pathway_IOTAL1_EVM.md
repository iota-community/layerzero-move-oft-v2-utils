# Pathway from IOTA L1 to EVM

This document describes detailed steps to setup/init to send existing coins on the MoveVM of IOTA L1 testnet to Sepolia EVM.

## Preparation step

### Deploy OFT

Deploy OFT Move module on IOTA L1 testnet to lock/unlock the existing coins.

See [here](./README.md#deploy-oftadapter-and-oft-contracts-on-iota-movevm)

### Configuration

Edit the configuration on IOTA L1 testnet as source chain in the file [config.json](./config.json):

- `sharedDecimals`: usually `6` decimals and must not be greater than the local decimals of the existing coins
- `oft`: obtained after having deployed the OFT Move module as described above
- `coin`: config params related to the existing coin
- `oftObjectId`: obtained after running the `init` step as described below
- `oftComposerManagerId`: [OFTComposerManager](https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-sdk-v2?activeTab=code) -> file `object-OFTComposerManager.json`

Copy the `.env.example` to `.env` and edit accordingly the params. Example:

```
# testnet or mainnet
NETWORK='testnet'

# MNEMONIC of the account having deployed the OFT Move module
MNEMONIC='put here your own mnemonic'

# Sepolia as EVM destination chain
REMOTE_EID=40161
REMOTE_RECIPIENT_ADDRESS='0xE03934D55A6d0f2Dc20759A1317c9Dd8f9D683cA';
TOKEN_AMOUNT_WITHOUT_DECIMALS=5
```

[EID reference](https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=sepolia)

## Main steps

### Init OFTAdapter

Needed input params in [config.json](./config.json):

- oftPackageId
- coinType
- oftInitTicketId
- oappObjectId
- metadataId
- sharedDecimals

Cmd:

`yarn init-oft-adapter`

Log example:

```bash
oft.initOftAdapterMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: AGQnzWHr4xdFkFwv98BH2D8P78HvWCzX1HK97qHMxMKE
```

**Notice**

After the `init` completion, the `oftInitTicketId` object will be destroyed to prevent further `init`. This means that, one `oftInitTicketId` can be used only once to `init`.

Take note the `oftObjectId` for the next step.

### Register OFT

It's the same to register either OFT or OFTAdapter.

Needed input params in [config.json](./config.json):

- oftPackageId
- coinType
- oftObjectId
- oappObjectId
- oftComposerManagerId

Cmd:

`yarn register-oft`

Log example:

```bash
oft.registerOAppMoveCall
oftComposerManagerId: 0x0f0b3c80ed9bfc559a4018fc37e3fefc690814fdfbb5125d7219768c7ca5a1f6
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 3kEDAW6M1ydEwebrR2GvQpRyBVwdVoyvNQmZFzCuw9Aj
```

### Set peer for OFT

It's the same to set peer for either OFT or OFTAdapter.

Needed input params in `.env`:

- REMOTE_RECIPIENT_ADDRESS
- REMOTE_RECIPIENT_ADDRESS

Cmd:

`yarn set-peer-oft`

Log example:

```bash
oapp.setPeerMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: BiBWawGk5ggUxfwhFcubZMpY46W44tWySHhoRSwSh3Ws
```

### Send OFT from MoveVM to EVM

This is to send existing coins on IOTA L1 testnet to Sepolia

Needed input params in `.env`:

- REMOTE_EID
- REMOTE_RECIPIENT_ADDRESS
- TOKEN_AMOUNT_WITHOUT_DECIMALS

Cmd:

`yarn send-oft`

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
