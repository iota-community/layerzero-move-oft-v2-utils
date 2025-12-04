// Pathway from IOTA L1 testnet (init_oft_adapter) to Sui testnet

export default {
  testnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '0x2d0012a96534315f51af8782773ce8afc5df0bb46df28f034c58da6a02a18d94',
      oappObjectId: '0xa16bcce4bc7daac4891a8f423ae2e009d2a35b41b0f5e85ebccf8ead2fd9005a',
      upgradeCap: '0x127fdf8742e5f429b20154ee33c709d659f847ec9a228bfae012e3a5d2294667',
      oftInitTicketId: '0xa8a96e4eadc504fbe027e839730b900714c471cbc0f680ab291e2f65f85a084e',
    },
    coin: {
      coinPackage: '0xdb4c36d643718262fd5c9936abd6ba73e10190ae091d3713eba2bed58aada7ec',
      coinType: '0xdb4c36d643718262fd5c9936abd6ba73e10190ae091d3713eba2bed58aada7ec::mockcoin::MOCKCOIN',
      coinDecimals: 9,
      upgradeCap: '0xa7cd2c2038e6aec360dc990bcd77560009bb8268c1673b3ce0b21f89ca4b85d9',
      treasuryCapId: '0x0668785914ab9119f4ab615bf8391114c21b1722226f72bd29394b4bef97d5ef',
      metadataId: '0xd1e7d18bc73440de6fc05a33eb62fdfe5d0d2abe642c4b01798af367f7092eaf',
    },
    oftObjectId: '0x69038c8196c9f9cb4812031ff60f87185323d5e4c91893df5c031705ec0f059a',
    oftComposerManagerId: '0x90384f5f6034604f76ac99bbdd25bc3c9c646a6e13a27f14b530733a8e98db99',
    remoteChain: {
      EID: 40423, // IOTA L1 testnet
      peerAddress: '0x6c8ce1132b6943655c672e6accfc9daa90fff06955f932625b1d4aa5640dff52',
    },
    setConfig: {
      // The `DVNs` set must be the same on both of the current chain and remote chain. Otherwise, the tx will get `inflight`.
      DVNs: ['0x1356fef0c7325536e289e53cc545219cbfbd1490ed762c8d8efb97efa6cfb856'],
      confirmations: 1,
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
