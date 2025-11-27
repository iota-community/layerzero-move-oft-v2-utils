# OFT setup on MoveVM

Pathway is from IOTA L1 testnet to Sepolia EVM.

The setup includes:

- init as OFTAdapter or as OFT
- register OFT
- set remote peer

## Init

### Init as OFTAdapter on IOTA L1 as source chain

Needed input params in [config.json](./config.json):

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

Set the `oftObjectId` (from the tx hash on block explorer) in the file `config.json` for next step.

### Init as OFT on IOTA L1 as dest chain

Needed input params in [config.json](./config.json):

- coinType
- oftInitTicketId
- oappObjectId
- treasuryCapId
- metadataId
- sharedDecimals

Cmd:

`yarn init-oft`

Log example:

```bash
oft.initOftMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 3zS2TaFWLQkNsFNjqi1sW2EvvqdLsX1xZLfQeZ6u4JYF
```

**Notice**

After the `init` completion, the `oftInitTicketId` object will be destroyed to prevent further `init`. This means that, one `oftInitTicketId` can be used only once to `init`.

Set the `oftObjectId` (from the tx hash on block explorer) in the file `config.json` for next step.

## Register OFT

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
oftComposerManagerId: 0xceb3fde61a041552f7d022ba8138a61fc3043a235029ecf266b5c3b8547b3b2e
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: GevPJDmYuZPbPr6ZYziQWW4UmrD5cTUhNHFgy29Zaxma
```

## Set peer for OFT

It's the same to set peer for either OFT or OFTAdapter.

Needed input params in `.env`:

- REMOTE_EID: EID of the remote chain
- REMOTE_PEER_ADDRESS: OFTAdapter or OFT address on the remote chain

Cmd:

`yarn set-peer-oft`

Log example:

```bash
oapp.setPeerMoveCall
REMOTE_EID: 40161 , REMOTE_PEER_ADDRESS: 0x0003d9Ce49871F984268f7eCaFb8026aa7be4Ee3
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: BAYrzgbpQ9K7SSbpCm56hoBNfxAkzLQNknv4wnAb8T3U
```
