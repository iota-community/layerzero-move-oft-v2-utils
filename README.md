# Utilities for LayerZero MoveVM OFT V2

Implemented by IOTA Foundation.

## Introduction

Utility scripts for LayerZero MoveVM OFT V2 that facilitate cross-chain sending of fungible tokens between IOTA L1 and other EVM(s).

This document focuses on the MoveVM of the IOTA L1 `testnet` based on this [reference](https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-oft-sdk-v2) while the EVM-related instructions can be found at [here](https://github.com/iota-community/layerzero-oft-v2-utils/tree/movevm).

For installation, run the cmd `yarn`.

Detailed instructions for different pathways:

- [Send existing coins on IOTA L1 testnet to Sepolia EVM](./Pathway_IOTAL1_EVM.md)
- Coming soon ...

General instructions are described in the following sections.

## Important config

The config info is referenced from:

- [EID](https://www.npmjs.com/package/@layerzerolabs/lz-definitions?activeTab=code)
- [Endpoint_V2](https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-sdk-v2?activeTab=code) -> file `endpoint_v2.json`
- [OFTComposerManager](https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-sdk-v2?activeTab=code) -> file `object-OFTComposerManager.json`

### IOTA L1 mainnet

- EID: 30423
- Endpoint_V2: 0xb8e0cd76cb8916c48c03320e43d46c3775edd6f17ce7fbfad6c751289dcb1735

### IOTA L1 testnet

- EID: 40423
- Endpoint_V2: 0xfca1ac6ffcae8ce9d937e94f30c930f9ce295b29496ed975d272efec511e2495

## OFTAdapter and OFT contracts

**Use-case 1**

To enable the `existing` fungible tokens for cross-chain sending, both OFTAdapter and OFT contracts are needed. Particularly:

- OFTAdapter contract: used to lock/unlock the existing fungible tokens on source chain
- OFT contract: used to mint/burn the equivalent fungible tokens on destination chain

**Use-case 2**

For `brand-new` fungible tokens to be launched, OFT standard can be leveraged to enable cross-chain sending without the need of OFTAdapter. Particularly:

- OFT contract: used to define the brand-new fungible tokens on source chain with mint/burn
- OFT contract: used to represent the equivalent fungible tokens on destination chain with burn/mint

[Reference](https://docs.layerzero.network/v2/concepts/applications/oft-standard#omnichain-token-standards)

### Deploy OFTAdapter and OFT contracts on IOTA MoveVM

On IOTA MoveVM, both OFTAdapter and OFT contracts use the same [Move module](https://github.com/LayerZero-Labs/LayerZero-v2/tree/main/packages/layerzero-v2/iota/contracts/oapps/oft/oft). The difference will come during the `init` process (see later section). To deploy it, run the following cmds

```bash
git clone https://github.com/LayerZero-Labs/LayerZero-v2.git

cd LayerZero-v2/packages/layerzero-v2/iota/contracts/oapps/oft/oft

iota client publish
```

**Notice**

After deployment, take note the following created stuff as config params in the file [config.json](./config.json):

- OFT packageID
- oft_impl::OFTInitTicket
- oapp::OApp
- package::UpgradeCap

**Run test**

To run unit-test, replace the above cmd `iota client publish` with `iota move test`.

### Build/test IOTA-related Move packages

To build/test [IOTA-related Move packages](https://github.com/LayerZero-Labs/LayerZero-v2/tree/main/packages/layerzero-v2/iota/contracts), run the following cmds

```bash
git clone https://github.com/LayerZero-Labs/LayerZero-v2.git

cd LayerZero-v2/packages/layerzero-v2/iota/contracts

yarn

yarn build

yarn test
```

### Deploy OFTAdapter and OFT contracts on EVM

See [instruction](https://github.com/iota-community/layerzero-oft-v2-utils/tree/movevm?tab=readme-ov-file#deploy-contracts)

## Utils script usage

### Config on MoveVM of IOTA L1

The current config (specified in the file [config.json](./config.json)) is on IOTA L1 testnet as source chain for sending existing coins to Sepolia EVM as destination chain:

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
