// Pathway from IOTA L1 testnet (init_oft_adapter) to Sepolia EVM

export default {
  testnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '0x366030d29a42c911123beef822fb542d4e6477188b462652ed22764ea97932b7',
      oappObjectId: '0xea7a4ce60fd24aacdda2fb44b801dcc81a0b913063a145652f9606c3530c6156',
      upgradeCap: '0xb8a30e10f3ad86bcbcaa87e48c89f041e0b5bfdcd5be2829b6e478aae36ead39',
      oftInitTicketId: '0x42a88d07f640b9ec43934ac0e819a5321b540d70b7f6ca9e15f72d5b57035a9b',
    },
    coin: {
      coinPackage: '0x9f1eab668daaf3201e9c9546613d3e1d374b8b20a46fa680b813ce7011928fcb',
      coinType: '0x9f1eab668daaf3201e9c9546613d3e1d374b8b20a46fa680b813ce7011928fcb::tusd::TUSD',
      coinDecimals: 9,
      upgradeCap: '0xd7ac77f2e32bda1db1398a652fd584371c3d323be55de06984bb2dd27ea19482',
      treasuryCapId: '0x19500a29ac990f6feab84e43ca4a53557e28ae1f79652899fd920d1df6c262f6',
      metadataId: '0x00ea19e289208709a68f855126758b2b96c672996d560bc3250f5f9fce439883',
    },
    oftObjectId: '0xc36df91c6eccc8a3a026ead7656abb7a36ab4210b2575a7dc27199eeec1f3de4',
    oftComposerManagerId: '0x0f0b3c80ed9bfc559a4018fc37e3fefc690814fdfbb5125d7219768c7ca5a1f6',
    remoteChain: {
      EID: 40161,
      peerAddress: '0xE03934D55A6d0f2Dc20759A1317c9Dd8f9D683cA',
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
      EID: 0,
      peerAddress: '',
    },
  },
};
