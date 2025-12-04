// Pathway from IOTA L1 testnet (init_oft_adapter) to Sui testnet

export default {
  testnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '0x6c8ce1132b6943655c672e6accfc9daa90fff06955f932625b1d4aa5640dff52',
      oappObjectId: '0x716dc7e81bd05f59742b3c83fcc56b76ee339673a027e1dad12a9c14f81b2f7b',
      upgradeCap: '0xe1a40f86ca63e84da76cf412328f67e8d881d71f7860c0f24aa4d7b3df5dd91d',
      oftInitTicketId: '0xa18199e182e7e50ef171b5e13e1ea04baf65a59b39217468bdc2699f6594ce2d',
    },
    coin: {
      coinPackage: '0xc998990be1a3aa976e6a02350f4f5c5576d07dc3bb31ddabb91ca3d3b467926f',
      coinType: '0xc998990be1a3aa976e6a02350f4f5c5576d07dc3bb31ddabb91ca3d3b467926f::mockcoin::MOCKCOIN',
      coinDecimals: 9,
      upgradeCap: '0x2fec9298b529511b1c591dd05b83da983d961860d78c93630d1fed96bd18fd16',
      treasuryCapId: '0x961a202d88e0e9f8e4ef920100ffb99801222e50e636d05fe61caea188f34f28',
      metadataId: '0xb8834bb57b25efb787398f9fa1ad9064896c699fde25ad462a2fb2c47e48e00d',
    },
    oftObjectId: '0x284c75f8a13ddbcadb202c2d3e17d08b0e55213f1cd97a01919b22833dac5dfc',
    oftComposerManagerId: '0xceb3fde61a041552f7d022ba8138a61fc3043a235029ecf266b5c3b8547b3b2e',
    remoteChain: {
      EID: 40378, // Sui testnet
      peerAddress: '0x2d0012a96534315f51af8782773ce8afc5df0bb46df28f034c58da6a02a18d94',
    },
    setConfig: {
      // The `DVNs` set must be the same on both of the current chain and remote chain. Otherwise, the tx will get `inflight`.
      DVNs: ['0x8a3a8ef1789a0863a5eef1a3c1eb777d188a74f34850589c57d2245837e424fd'],
      confirmations: 1,
    },
  },
  mainnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '',
      oappObjectId: '',
      upgradeCap: '',
      oftInitTicketId: '',
    },
    coin: {
      coinPackage: '',
      coinType: '',
      coinDecimals: 9,
      upgradeCap: '',
      treasuryCapId: '',
      metadataId: '',
    },
    oftObjectId: '',
    oftComposerManagerId: '',
    remoteChain: {
      EID: 30110,
      peerAddress: '',
    },
    setConfig: {
      // The `DVNs` set must be the same on both of the current chain and remote chain. Otherwise, the tx will get `inflight`.
      DVNs: [],
      confirmations: 25,
    },
  },
};
