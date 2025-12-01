# OFT setup on MoveVM

Pathway is from IOTA L1 testnet to Sepolia EVM.

The setup includes:

- init as OFTAdapter or as OFT
- register OFT
- set remote peer

## Init

### Init as OFTAdapter on IOTA L1 as source chain

Needed input params in [config.ts](./config.ts):

- coinType
- oftInitTicketId
- oappObjectId
- metadataId
- sharedDecimals

Cmd:

`yarn init-oft-adapter`

Log example on IOTA L1 testnet as source chain:

```bash
oft.initOftAdapterMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: AGQnzWHr4xdFkFwv98BH2D8P78HvWCzX1HK97qHMxMKE
```

**Notice**

After the `init` completion, the `oftInitTicketId` object will be destroyed to prevent further `init`. This means that, one `oftInitTicketId` can be used only once to `init`.

Set the `oftObjectId` (from the tx hash on block explorer) in the file `config.ts` for next step.

### Init as OFT on IOTA L1 as dest chain

Needed input params in [config.ts](./config.ts):

- coinType
- oftInitTicketId
- oappObjectId
- treasuryCapId
- metadataId
- sharedDecimals

Cmd:

`yarn init-oft`

Log example on IOTA L1 testnet as dest chain:

```bash
oft.initOftMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 3zS2TaFWLQkNsFNjqi1sW2EvvqdLsX1xZLfQeZ6u4JYF
```

Log example on IOTA L1 mainnet as dest chain:

```bash
oft.initOftMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: AEJRDdrkfppKUWAPnYug8oUaHJoJAHMPM5ussi9skfSz
```

**Notice**

After the `init` completion, the `oftInitTicketId` object will be destroyed to prevent further `init`. This means that, one `oftInitTicketId` can be used only once to `init`.

Set the `oftObjectId` (from the tx hash on block explorer) in the file `config.ts` for next step.

## Register OFT

It's the same to register either OFT or OFTAdapter.

Needed input params in [config.ts](./config.ts):

- oftPackageId
- coinType
- oftObjectId
- oappObjectId
- [oftComposerManagerId](./README_OFT_deployment.md#get-the-oftcomposermanagerid)

Cmd:

`yarn register-oft`

Log example on IOTA L1 testnet as dest chain:

```bash
oft.registerOAppMoveCall
oftComposerManagerId: 0xceb3fde61a041552f7d022ba8138a61fc3043a235029ecf266b5c3b8547b3b2e
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: GevPJDmYuZPbPr6ZYziQWW4UmrD5cTUhNHFgy29Zaxma
```

Log example on IOTA L1 mainnet as dest chain:

```bash
oft.registerOAppMoveCall
oftComposerManagerId: 0xfe5be5a2d5b11e635e3e4557bb125fb24a3dd09111eded06fd6058b2aee1d054
(node:497636) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 25zDfKR18UASxkeW3n9sPzb58F22KzUVYnVgmwUBN3AR
```

## Set peer for OFT

It's the same to set peer for either OFT or OFTAdapter.

Needed input params in [config.ts](./config.ts):

- remoteChain
  - EID: EID of the remote chain
  - peerAddress: OFTAdapter or OFT address on the remote chain

Cmd:

`yarn set-peer-oft`

Log example on IOTA L1 testnet as dest chain:

```bash
oapp.setPeerMoveCall
REMOTE_EID: 40161 , REMOTE_PEER_ADDRESS: 0x0003d9Ce49871F984268f7eCaFb8026aa7be4Ee3
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: BAYrzgbpQ9K7SSbpCm56hoBNfxAkzLQNknv4wnAb8T3U
```

Log example on IOTA L1 mainnet as dest chain:

```bash
oapp.setPeerMoveCall
remoteChain: {
  EID: 30284,
  peerAddress: '0x02AE4418F0FbcbE383b4eD103cf6B88B24542f4C'
}
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: gVV9HyKnwqFDC97AqTcabwZv4REiZLXaHyLnhWRQG3r
```
