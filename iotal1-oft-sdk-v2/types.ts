// Constants
export const OFTMsgType = {
  SEND: 1,
  SEND_AND_CALL: 2,
} as const;

// Type Definitions
export interface SendParam {
  dstEid: number;
  to: Uint8Array;
  amountLd: bigint;
  minAmountLd: bigint;
  extraOptions: Uint8Array;
  composeMsg: Uint8Array;
  oftCmd: Uint8Array;
}

export interface OFTLimit {
  minAmountLd: bigint;
  maxAmountLd: bigint;
}

export interface OFTFeeDetail {
  feeAmountLd: bigint;
  description: string;
}

export interface OFTReceipt {
  amountSentLd: bigint;
  amountReceivedLd: bigint;
}

export interface OFTInfoV1 {
  oftPackage: string;
  oftObject: string;
}
