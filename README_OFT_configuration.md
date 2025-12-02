# OFT Configuration on MoveVM

The config info is referenced from:

- [EID](https://www.npmjs.com/package/@layerzerolabs/lz-definitions?activeTab=code)
- [Endpoint_V2](https://www.npmjs.com/package/@layerzerolabs/lz-iotal1-sdk-v2?activeTab=code) -> file `endpoint_v2.json`

## IOTA L1 mainnet

- EID: 30423
- Endpoint_V2: 0xb8e0cd76cb8916c48c03320e43d46c3775edd6f17ce7fbfad6c751289dcb1735

## IOTA L1 testnet

- EID: 40423
- Endpoint_V2: 0xfca1ac6ffcae8ce9d937e94f30c930f9ce295b29496ed975d272efec511e2495

## Preset configs for different pathways

- [Pathway from IOTA L1 testnet to Sepolia EVM](./config_IOTAL1_EVM.ts)
- [Pathway from Sepolia EVM to IOTA L1 testnet](./config_EVM_IOTAL1.ts)

## Config params

2 types of config files:
- `.ts`
- `.env`

Copy one of the `config_xyz.ts` to `config.ts` and edit accordingly as follows:

- `sharedDecimals`: usually `6` decimals and must not be greater than the local decimals of the existing coins
- `oft`: obtained after having deployed the OFT Move module as described above
- `coin`: config params related to the existing coin
- `oftObjectId`: obtained after running the `init` step as described below
- `oftComposerManagerId`: see [here](./README_OFT_deployment.md#get-the-oftcomposermanagerid)
- `remoteChain`:
  - `EID`: EID of the remote chain
  - `peerAddress`: OFTAdapter or OFT Solidty contract address or Move package ID on the remote chain.
- `setConfig`: only optional
  - `DVNs`
  - `confirmations`

Copy the `.env.example` to `.env` and edit accordingly the params. Example:

```
# testnet or mainnet
NETWORK='testnet'

# MNEMONIC of the account having deployed the OFT Move module
MNEMONIC='put here your own mnemonic'

# Sepolia as EVM destination chain
REMOTE_RECIPIENT_ADDRESS='0xE03934D55A6d0f2Dc20759A1317c9Dd8f9D683cA';
TOKEN_AMOUNT_WITHOUT_DECIMALS=5
```
