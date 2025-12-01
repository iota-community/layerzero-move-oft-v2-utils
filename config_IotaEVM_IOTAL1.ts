// Pathway from EVM to IOTA L1

export default {
  testnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '0xa947ff8022f37c32b06a67d674154f170422e0c95cf44e1a55f3c2a45fa355f2',
      oappObjectId: '0x6dacaa721986a759bee4f35771f7a9a38c97d81d44bf892bfeeef7052201c0b7',
      upgradeCap: '0x365b804c84ef30204488163792e6baf48ca482405ca7cd23c5b44375be5a13c3',
      oftInitTicketId: '0x1a3dd800b30ac613cb5d5fe165d95b138413252f8ab9d46c08e29b65ea45d634',
    },
    coin: {
      coinPackage: '0x751c3bfefb3f9d1e4e15696b0646fd3445efc77e05f088dcac24a8860e72f7d4',
      coinType:
        '0x751c3bfefb3f9d1e4e15696b0646fd3445efc77e05f088dcac24a8860e72f7d4::mockcoin::MOCKCOIN',
      coinDecimals: 9,
      upgradeCap: '0xea481f13548191c37765cef699ba9f5058c21055e15c135d045da68b68e1f68e',
      treasuryCapId: '0xf2e72741fd7b89699960e7da65fd0c9caf213ab04fddd4972e04b313199e12b4',
      metadataId: '0x6cf5db11ccd7b57ff341a8f2dadd52a7057441fed38609a938c835f826d76ae5',
    },
    oftObjectId: '0xf02e2f4d4a65e1d3d0c5489a90fefc33eb3cb7ae53c7f72d60c985b62b9d8891',
    oftComposerManagerId: '0xceb3fde61a041552f7d022ba8138a61fc3043a235029ecf266b5c3b8547b3b2e',
    remoteChain: {
      EID: 40161,
      peerAddress: '0x0003d9Ce49871F984268f7eCaFb8026aa7be4Ee3',
    },
  },
  mainnet: {
    sharedDecimals: 6,
    oft: {
      oftPackageId: '0xb1f576849d9a6086982a13fedf1dd785da4b1314d430696e2f1240e5ed9d9be5',
      oappObjectId: '0xa004043524f7266d0e514fae07198f0236d95c719d00b9df7947dcff0050f883',
      upgradeCap: '0x836c02b07b7956c87bf0f250184d4b0d6c57aa876e9fb0bed5adb7b7d222580d',
      oftInitTicketId: '0x4b8993454319da0791c905c1dbf80fc28962bab31e088b54793ed3297dfa867c',
    },
    coin: {
      coinPackage: '0xe98f9281c6fce1ddcaab31b5e54261ed677281a061ac7a689247292a80852822',
      coinType:
        '0xe98f9281c6fce1ddcaab31b5e54261ed677281a061ac7a689247292a80852822::mockcoin::MOCKCOIN',
      coinDecimals: 9,
      upgradeCap: '0x1b57aebcd45fae42d5afc83dcb0d7bb71f84ffad507b49eeaef26a5c9cda7596',
      treasuryCapId: '0xd0da3c9ad936150ded7ccd756be55a736b5c2bf13612a9a8a40db4d9b7a8780b',
      metadataId: '0x279de916500aa4dda0116721883f3c4bbac097da71729bbd7776e36a8f87c9da',
    },
    oftObjectId: '0x2f1549e6ba4ebead1683f8157b7878aaefc992808f12d63a6f01867ab07ebe90',
    oftComposerManagerId: '0xfe5be5a2d5b11e635e3e4557bb125fb24a3dd09111eded06fd6058b2aee1d054',
    remoteChain: {
      EID: 30284,
      peerAddress: '0x02AE4418F0FbcbE383b4eD103cf6B88B24542f4C',
    },
  },
};
