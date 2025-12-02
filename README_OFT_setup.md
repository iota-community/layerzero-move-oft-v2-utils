# OFT setup on MoveVM

Pathway is from IOTA L1 testnet to Sepolia EVM.

The setup includes:

- init as OFTAdapter or as OFT
- register OFT
- set remote peer
- set config for DVN

## Init

### Init as OFTAdapter on IOTA L1 as source chain

**For existing coins**

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

**For newly-deployed coins**

Go in the folder `mockcoin` to deploy a new coin if needed.

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

```bash
oft.initOftMoveCall
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: DJgejLkMmBxcRa4eBtE2HV3FH6BygsQATN4C8jU6NqPc
```

**Notice**

After the `init` completion, the `oftInitTicketId` object will be destroyed to prevent further `init`. This means that, one `oftInitTicketId` can be used only once to `init`.

From the `init` tx hash on block explorer, find the `oftObjectId` to set it in the file `config.ts` for next step.

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
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 25zDfKR18UASxkeW3n9sPzb58F22KzUVYnVgmwUBN3AR
```

Log example on IOTA L1 mainnet as dest chain:

```bash
oft.registerOAppMoveCall
oftComposerManagerId: 0xfe5be5a2d5b11e635e3e4557bb125fb24a3dd09111eded06fd6058b2aee1d054
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 1c3K1vh9YcagqmRsXHfUfPifa1HSrZM63NnoJdkzXCm
```

## Set peer for OFT

It's the same to set peer for either OFT or OFTAdapter.

Needed input params in [config.ts](./config.ts):

- remoteChain
  - EID: EID of the remote chain
  - peerAddress: OFTAdapter or OFT address on the remote chain
    - !! need to perform [deployment and setup](https://github.com/iota-community/layerzero-oft-v2-utils/tree/movevm) on the dest chain !!

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

```
oapp.setPeerMoveCall
remoteChain: {
  EID: 30110,
  peerAddress: '0x50721AaD21A49b1024E985Bd99d4904326d9b951'
}
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: 2rG6QXCDcwg8uFW3YzUP9fBJZL7zoYG7aFjEbc4mxqqu
```

Log example on IOTA L1 mainnet as dest chain:

```

## Set config for DVN (only optional, just skip it)

It's the same to set config for either OFT or OFTAdapter.

[Reference source](https://docs.layerzero.network/v2/developers/sui/configuration/dvn-executor-config#dvn-configuration).

Needed input params in [config.ts](./config.ts):

- setConfig
  - `DVNs`
  - `confirmations`

and from `.env`:

- REMOTE_RECIPIENT_ADDRESS
- TOKEN_AMOUNT_WITHOUT_DECIMALS

Cmd:

`yarn set-config`

Log example on IOTA L1 mainnet as dest chain:

```
oapp.setConfigMoveCall
ulnLib: 0x042e3bb837e5528e495124542495b9df5016acd011d89838ae529db5a814499e
objUlnLib: 0x8b8083bc0e96840f20d5d0488381ef1788dd5f8a668eb5c63faccad04092a7aa
senderAddr: 0xd3906909a7bfc50ea9f4c0772a75bc99cd0da938c90ec05a556de1b5407bd639
inspectTx result: { status: 'success' }
executeTx - Tx hash: GD1whAwCgZ9EokKCw9MdfAtbNYW7xJMd8Kxt8X1rnKhw
```