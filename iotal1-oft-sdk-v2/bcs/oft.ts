import { bcs } from "@iota/iota-sdk/bcs";

import { OFTFeeDetail, OFTInfoV1, OFTLimit, OFTReceipt } from "../types";

// OFTLimit struct BCS definition
export const OFTLimitBcs = bcs.struct("OFTLimit", {
  min_amount_ld: bcs.U64,
  max_amount_ld: bcs.U64,
});

// OFTFeeDetail struct BCS definition
export const OFTFeeDetailBcs = bcs.struct("OFTFeeDetail", {
  fee_amount_ld: bcs.U64,
  is_reward: bcs.Bool,
  description: bcs.String,
});

// OFTReceipt struct BCS definition
export const OFTReceiptBcs = bcs.struct("OFTReceipt", {
  amount_sent_ld: bcs.U64,
  amount_received_ld: bcs.U64,
});

// OFTInfoV1 struct BCS definition
export const OFTInfoV1Bcs = bcs.struct("OFTInfoV1", {
  oft_package: bcs.Address,
  oft_object: bcs.Address,
});

// Helper function to parse OFTLimit
export function parseOFTLimit(data: Uint8Array): OFTLimit {
  const parsed = OFTLimitBcs.parse(data);
  return {
    minAmountLd: BigInt(parsed.min_amount_ld),
    maxAmountLd: BigInt(parsed.max_amount_ld),
  };
}

// Helper function to parse OFTFeeDetail array
export function parseOFTFeeDetails(data: Uint8Array): OFTFeeDetail[] {
  // Parse as vector of OFTFeeDetail
  const vectorBcs = bcs.vector(OFTFeeDetailBcs);
  const parsed = vectorBcs.parse(data);

  return parsed.map(
    (detail: {
      fee_amount_ld: string | number | bigint;
      is_reward: boolean;
      description: string;
    }) => ({
      feeAmountLd: BigInt(detail.fee_amount_ld),
      isReward: detail.is_reward,
      description: detail.description,
    })
  );
}

// Helper function to parse OFTReceipt
export function parseOFTReceipt(data: Uint8Array): OFTReceipt {
  const parsed = OFTReceiptBcs.parse(data);
  return {
    amountSentLd: BigInt(parsed.amount_sent_ld),
    amountReceivedLd: BigInt(parsed.amount_received_ld),
  };
}

// Helper function to parse OFTInfoV1
export function parseOFTInfoV1(data: Uint8Array): OFTInfoV1 {
  const parsed = OFTInfoV1Bcs.parse(data);
  return {
    oftPackage: parsed.oft_package,
    oftObject: parsed.oft_object,
  };
}
