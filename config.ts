// Pathway from IOTA L1 testnet (init_oft_adapter) to Sui testnet

export default {
  testnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '0xd8c65e370e22e7d5c0abc7ed58703f30b8cce39410faed79dffdc5d79ce56c04',
      oappObjectId: '0x1e58b8fdbb33a7d1ffe686856c24d5be89887388452398e9035b07a6bf20ed60',
      upgradeCap: '0xb3b427c605536615d04cbf9da68a0fd693bd40bbc414e6a2fa7a7be4972958ab',
      oftInitTicketId: '0x492cae9af0d98c085e15f3d00ee88ee7959f05cadac9053fee069bb12d9220fe',
    },
    coin: {
      coinPackage: '0xafefb0ff0b3e18b29e6162dd9cb944dfed6f61823095214df0ceaa159c66b6db',
      coinType: '0xafefb0ff0b3e18b29e6162dd9cb944dfed6f61823095214df0ceaa159c66b6db::mockcoin::MOCKCOIN',
      coinDecimals: 9,
      upgradeCap: '0xd2607eb149c62f02d6b1745528e4d14f4c391e0a945dcb725a7772f7fe05964a',
      treasuryCapId: '0x86dd0d9a3e3fd3dbf96bb9444a1b097151c5c297cb38d182e16f9407bacdd77c',
      metadataId: '0x19ac963749ab0be1b47601a3c8b15ef1f7331d75ebf87245f3cc05ae38c5f141',
    },
    oftObjectId: '0xd1409db010bfde996f66e1f79c11dabbccd63e34a5da9e8649d2350200eddbce',
    oftComposerManagerId: '0x90384f5f6034604f76ac99bbdd25bc3c9c646a6e13a27f14b530733a8e98db99',
    remoteChain: {
      EID: 40378, // Sui testnet
      peerAddress: '0xed7133e37b167b761b189b2e7a1dcf1a557c1ae5e9757c03ab89a455878e8f50',
    },
    setConfig: {
      // The `DVNs` set must be the same on both of the current chain and remote chain. Otherwise, the tx will get `inflight`.
      DVNs: ['0x1356fef0c7325536e289e53cc545219cbfbd1490ed762c8d8efb97efa6cfb856'],
      confirmations: 0,
    },
  },
  mainnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '0xed312b3f38559d4cb042f5314cbedef8d52b96c6ddb138560a01f71a6e69b82e',
      oappObjectId: '0x971f7b0a144a5850b789c257273f63f4b2a088ee70eb7b32300d33ad32b8378c',
      upgradeCap: '0xc38fc8d73820ee51a6c1f5a5aee41819bfd854e662a5f2f36b41ff68ae1cf4e1',
      oftInitTicketId: '0xdb2d18701eef0844f9f9ed8aa01ffc665624d77731f032e77fb635f1d2db3127',
    },
    coin: {
      coinPackage: '0x3fd84826fb981ecb842cfb1950e99568d2ff66d8e9182fca5ea4e8fb52d2f03f',
      coinType:
        '0x3fd84826fb981ecb842cfb1950e99568d2ff66d8e9182fca5ea4e8fb52d2f03f::mockcoin::MOCKCOIN',
      coinDecimals: 9,
      upgradeCap: '0x9a96a64e5db8c80685db1e516b439bd90f3caa66a6247d8865b3eb3a7fb64376',
      treasuryCapId: '0x416a56f0640dbbd842cb5cd8baaa0543d17f229624ec4b05848277df990c6ed8',
      metadataId: '0xb142b6484da26bbc8680c423baa144ec59959a0aceeaa735b57edcfac0b90950',
    },
    oftObjectId: '0x91a51f55bdc94627ac281db6bda9a8c16ac6ae38f5f6170449b60cc2b703284f',
    oftComposerManagerId: '0xfe5be5a2d5b11e635e3e4557bb125fb24a3dd09111eded06fd6058b2aee1d054',
    remoteChain: {
      EID: 30110,
      peerAddress: '0x50721AaD21A49b1024E985Bd99d4904326d9b951',
    },
    setConfig: {
      // The `DVNs` set must be the same on both of the current chain and remote chain. Otherwise, the tx will get `inflight`.
      DVNs: [
        '0xa560697328ccb5dc3f3f8e8a2c41e282827060da7a29971d933e9aa405c2ba7f', // LZ Labs
        '0x50e159c13f1222f7eea85c718f67b20146ef2485f844b23ffa15719adc97080a', // Nethermind
      ],
      confirmations: 25,
    },
  },
};
