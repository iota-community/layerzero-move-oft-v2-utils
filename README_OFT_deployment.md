# OFT deployment on MoveVM

**Use-case 1**

To enable the `existing` fungible tokens for cross-chain sending, both OFTAdapter and OFT contracts are needed. Particularly:

- OFTAdapter contract: used to lock/unlock the existing fungible tokens on source chain
- OFT contract: used to mint/burn the equivalent fungible tokens on destination chain

**Use-case 2**

For `brand-new` fungible tokens to be launched, OFT standard can be leveraged to enable cross-chain sending without the need of OFTAdapter. Particularly:

- OFT contract: used to define the brand-new fungible tokens on source chain with mint/burn
- OFT contract: used to represent the equivalent fungible tokens on destination chain with burn/mint

[Reference](https://docs.layerzero.network/v2/concepts/applications/oft-standard#omnichain-token-standards)

## Deploy OFTAdapter or OFT package on IOTA MoveVM

On IOTA MoveVM, both OFTAdapter and OFT contracts use the same [Move module](https://github.com/LayerZero-Labs/LayerZero-v2/tree/main/packages/layerzero-v2/sui/contracts/oapps/oft/oft). The difference will come during the `init` process (see later section). 

No config params needed, to deploy, run the following cmds

```bash
git clone https://github.com/LayerZero-Labs/LayerZero-v2.git

cd LayerZero-v2/packages/layerzero-v2/sui/contracts/oapps/oft/oft

sui client publish
```

**Notice**

After deployment, take note the following created stuff as config params in the file [config.ts](./config.ts):

- OFT packageID
- oft_impl::OFTInitTicket
- oapp::OApp
- package::UpgradeCap
- oftComposerManagerId: `see below`

### Get the oftComposerManagerId

- Find the OFT packageID on the [explorer](https://iotascan.com) and then in the tab `Contracts` (where to see Move code), navigate to the module `Oft ptb builder` to find out the `oft_common` packageID based on the `oft_composer_manager`.
- For example `use 7799eaad07b597b7c19cadb29fce3d2cc223f77be1dbf143717ca7e2ee2266e2::oft_composer_manager;`, the `oft_common` packageID is `7799eaad07b597b7c19cadb29fce3d2cc223f77be1dbf143717ca7e2ee2266e2`.
- From the `oft_common` packageID on the explorer, find out its deployment tx from which it's possible to find the `oft_composer_manager::OFTComposerManager` objectID.

**Run test**

To run unit-test, replace the above cmd `sui client publish` with `sui move test`.

## Build/test all IOTA-related Move packages

To build/test [IOTA-related Move packages](https://github.com/LayerZero-Labs/LayerZero-v2/tree/main/packages/layerzero-v2/sui/contracts), run the following cmds

```bash
git clone https://github.com/LayerZero-Labs/LayerZero-v2.git

cd LayerZero-v2/packages/layerzero-v2/sui/contracts

yarn

yarn build

yarn test
```
