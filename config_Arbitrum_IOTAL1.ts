// Pathway from Arbitrum EVM (OFTAdapter) to IOTA L1 mainnet

export default {
  testnet: {
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
      EID: 40161,
      peerAddress: '',
    },
    setConfig: {
      // The `DVNs` (on the current chain) set must be the same on both of the current chain and remote chain. Otherwise, the tx will get `inflight`.
      DVNs: [],
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
      // The `DVNs` (on the current chain) set must be the same on both of the current chain and remote chain. Otherwise, the tx will get `inflight`.
      DVNs: [
        '0xa560697328ccb5dc3f3f8e8a2c41e282827060da7a29971d933e9aa405c2ba7f', // LZ Labs
        '0x50e159c13f1222f7eea85c718f67b20146ef2485f844b23ffa15719adc97080a', // Nethermind
      ],
      confirmations: 25,
    },
  },
};
