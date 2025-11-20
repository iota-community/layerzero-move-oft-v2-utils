import { bcs } from "@iota/iota-sdk/bcs";
import { IotaClient } from "@iota/iota-sdk/client";
import {
  Transaction,
  TransactionArgument,
  TransactionResult,
} from "@iota/iota-sdk/transactions";

import {
  SDK,
  asAddress,
  asArgWithTx,
  asArgWithTxAsync,
  asBool,
  asBytes,
  asBytes32,
  asObject,
  asU32,
  asU64,
  asU8,
  executeSimulate,
  isTransactionArgument,
} from "@layerzerolabs/lz-iotal1-sdk-v2";
import type {
  IPTBValidator,
  MessagingFee,
  ObjectOptions,
} from "@layerzerolabs/lz-iotal1-sdk-v2";

import {
  parseOFTFeeDetails,
  parseOFTInfoV1,
  parseOFTLimit,
  parseOFTReceipt,
} from "../bcs/oft";
import {
  OFTFeeDetail,
  OFTInfoV1,
  OFTLimit,
  OFTReceipt,
  SendParam,
} from "../types";

const MODULE_NAME = "oft";
const OFT_SENDER_MODULE_NAME = "oft_sender";
const OFT_IMPL_MODULE_NAME = "oft_impl";
const OFT_PTB_BUILDER_MODULE_NAME = "oft_ptb_builder";

// ==========================================
// ERROR CODES
// ==========================================
// Standard error codes that may be returned by OFT operations

export const OFTErrorCode = {
  // OFT related errors
  EComposeMsgNotAllowed: 1,
  EComposeMsgRequired: 2,
  EInsufficientBalance: 3,
  EInvalidAdminCap: 4,
  EInvalidComposeQueue: 5,
  EInvalidLocalDecimals: 6,
  EInvalidMigrationCap: 7,
  EInvalidSendContext: 8,
  ESlippageExceeded: 9,
  EWrongPackageVersion: 10,
} as const;

/**
 * OFT (Omnichain Fungible Token) Class
 *
 * The OFT class provides a comprehensive interface for interacting with LayerZero's
 * Omnichain Fungible Token standard on the Iota blockchain. OFTs enable seamless
 * cross-chain token transfers while maintaining fungibility across multiple networks.
 *
 * @example
 * ```typescript
 * // Initialize OFT instance
 * const oft = new OFT(protocolSDK, oftCallCapId);
 *
 * // Send tokens cross-chain
 * const tx = new Transaction();
 * const coin = await oft.splitCoinMoveCall(tx, sender, amount);
 * await oft.sendMoveCall(tx, sender, sendParam, coin, nativeFee, zroFee, refundAddress);
 * tx.transferObjects([coin], sender);
 * ...
 *
 * // Quote transfer fees
 * const fees = await oft.quoteSend(sender, sendParam, payInZro);
 * ```
 */
export class OFT {
  /** Iota client for blockchain interactions */
  public readonly client: IotaClient;
  /** The OFTCallCap ID */
  public readonly oftCallCapId: string;
  /** The package ID of the OFT */
  private oftPackageId?: string;
  /** LayerZero protocol object references (endpoint, messaging channels, etc.) */
  private readonly objects: ObjectOptions;
  /** The unique object ID of this OFT instance on Iota */
  private oftObjectId?: string;
  /** Admin capability object ID for privileged operations (retrieved dynamically when needed) */
  private adminCapId?: string;
  /** The Iota coin type this OFT represents (e.g., "0x123::mycoin::MYCOIN") */
  private coinType?: string;
  /** The unique object ID of the associated OApp instance on Iota */
  private oappObjectId?: string;
  /** Reference to the LayerZero protocol SDK for cross-chain operations */
  private readonly protocolSDK: SDK;
  /** The OFTInfoV1 structure */
  private oftInfo?: OFTInfoV1;

  /**
   * Creates a new OFT instance for interacting with an Omnichain Fungible Token
   *
   * @param protocolSDK - The LayerZero protocol SDK instance providing core cross-chain functionality
   * @param oftCallCapId - The OFT call capability ID used for OFT operations and accessing OFT information
   * @param oftObjectId - Optional OFT object ID on Iota blockchain for direct OFT instance access
   * @param coinType - Optional Iota coin type string (e.g., "0x123::mycoin::MYCOIN") that this OFT represents
   * @param oappObjectId - Optional associated OApp object ID for cross-chain messaging operations
   * @param adminCapId - Optional admin capability object ID for privileged operations
   */
  constructor(
    protocolSDK: SDK,
    oftCallCapId: string,
    oftObjectId?: string,
    coinType?: string,
    oappObjectId?: string, // the associated oapp object id
    adminCapId?: string
  ) {
    this.protocolSDK = protocolSDK;
    this.oftCallCapId = oftCallCapId;
    this.client = protocolSDK.client;
    this.objects = protocolSDK.objects;
    this.oftObjectId = oftObjectId;
    this.oappObjectId = oappObjectId;
    this.adminCapId = adminCapId;
    this.coinType = coinType;
  }

  /**
   * Updates the associated OApp object ID
   * @param oappObjectId - The new OApp object ID
   */
  setOappObjectId(oappObjectId: string): void {
    this.oappObjectId = oappObjectId;
  }

  // ==========================================
  // INITIALIZATION FUNCTIONS
  // ==========================================
  // These functions are used to initialize OFT instances from OFTCreationTicket

  /**
   * Initialize an OFT instance with a treasury capability
   * Creates a new OFT that mints its own tokens
   * @param tx - The transaction to add the move call to
   * @param coinType - The Iota coin type string (e.g., "0x123::mycoin::MYCOIN")
   * @param ticket - The OFTCreationTicket object ID or TransactionArgument
   * @param oapp - The OApp object ID or TransactionArgument
   * @param treasury - The TreasuryCap object ID or TransactionArgument for the coin type
   * @param metadata - The CoinMetadata object ID or TransactionArgument for the coin type
   * @param sharedDecimals - Number of decimals to use for cross-chain operations
   * @returns TransactionResult array containing [AdminCap, MigrationCap] - MigrationCap must be transferred or stored
   */
  initOftMoveCall(
    tx: Transaction,
    coinType: string,
    ticket: string | TransactionArgument,
    oapp: string | TransactionArgument,
    treasury: string | TransactionArgument,
    metadata: string | TransactionArgument,
    sharedDecimals: number | TransactionArgument
  ): TransactionResult {
    return tx.moveCall({
      target: `${this.oftCallCapId}::${OFT_IMPL_MODULE_NAME}::init_oft`,
      typeArguments: [coinType],
      arguments: [
        asObject(tx, ticket),
        asObject(tx, oapp),
        asObject(tx, treasury),
        asObject(tx, metadata),
        asU8(tx, sharedDecimals),
      ],
    });
  }

  /**
   * Initialize an OFT adapter instance
   * Creates an OFT adapter that wraps an existing coin type
   * @param tx - The transaction to add the move call to
   * @param coinType - The Iota coin type string (e.g., "0x123::mycoin::MYCOIN")
   * @param ticket - The OFTCreationTicket object ID or TransactionArgument
   * @param oapp - The OApp object ID or TransactionArgument
   * @param metadata - The CoinMetadata object ID or TransactionArgument for the coin type
   * @param sharedDecimals - Number of decimals to use for cross-chain operations
   * @returns TransactionResult array containing [AdminCap, MigrationCap] - MigrationCap must be transferred or stored
   */
  initOftAdapterMoveCall(
    tx: Transaction,
    coinType: string,
    ticket: string | TransactionArgument,
    oapp: string | TransactionArgument,
    metadata: string | TransactionArgument,
    sharedDecimals: number | TransactionArgument
  ): TransactionResult {
    return tx.moveCall({
      target: `${this.oftCallCapId}::${OFT_IMPL_MODULE_NAME}::init_oft_adapter`,
      typeArguments: [coinType],
      arguments: [
        asObject(tx, ticket),
        asObject(tx, oapp),
        asObject(tx, metadata),
        asU8(tx, sharedDecimals),
      ],
    });
  }

  // ==========================================
  // ADMIN FUNCTIONS
  // ==========================================
  // These functions require admin privileges and are used for OFT configuration
  // and management. The admin capability is automatically retrieved from the OFT instance.

  /**
   * Get LayerZero receive information for OFT registration
   *
   * This function prepares the necessary metadata for registering an OFT
   * with the LayerZero endpoint, enabling it to receive cross-chain messages.
   *
   * @param tx - The transaction to add the move call to
   * @param composerManager - The composer manager object ID for routing compose transfers
   * @returns TransactionResult containing serialized execution metadata for endpoint registration
   */
  async lzReceiveInfoMoveCall(
    tx: Transaction,
    composerManager: string | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target(
        "lz_receive_info",
        OFT_PTB_BUILDER_MODULE_NAME
      ),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(this.objects.endpointV2),
        asObject(tx, composerManager),
        tx.object.clock(),
      ],
    });
  }

  /**
   * Register OFT as an OApp with LayerZero endpoint
   * @param tx - The transaction to add the move call to
   * @param coinType - The Iota coin type string (e.g., "0x123::mycoin::MYCOIN")
   * @param oftObjectId - The OFT object ID
   * @param oappObjectId - The OApp object ID
   * @param composerManager - The composer manager object ID or TransactionArgument
   * @param lzReceiveInfo - Optional LayerZero receive info as Uint8Array or TransactionArgument
   */
  async registerOAppMoveCall(
    tx: Transaction,
    coinType: string,
    oftObjectId: string,
    oappObjectId: string,
    composerManager: string | TransactionArgument,
    lzReceiveInfo?: Uint8Array | TransactionArgument
  ): Promise<void> {
    const adminCapId = await executeSimulate(
      this.client,
      (tx) => {
        tx.moveCall({
          target: `${this.oftCallCapId}::${MODULE_NAME}::admin_cap`,
          typeArguments: [coinType],
          arguments: [tx.object(oftObjectId)],
        });
      },
      (result) => bcs.Address.parse(result[0].value)
    );

    if (lzReceiveInfo === undefined) {
      lzReceiveInfo = tx.moveCall({
        target: `${this.oftCallCapId}::${OFT_PTB_BUILDER_MODULE_NAME}::lz_receive_info`,
        typeArguments: [coinType],
        arguments: [
          tx.object(oftObjectId),
          tx.object(this.objects.endpointV2),
          asObject(tx, composerManager),
          tx.object.clock(),
        ],
      });
    }

    tx.moveCall({
      target: `${this.oftCallCapId}::${MODULE_NAME}::register_oapp`,
      typeArguments: [coinType],
      arguments: [
        tx.object(oftObjectId),
        tx.object(oappObjectId),
        tx.object(adminCapId),
        tx.object(this.objects.endpointV2),
        asBytes(tx, lzReceiveInfo),
      ],
    });
  }

  /**
   * Set pause state for OFT operations
   * @param tx - The transaction to add the move call to
   * @param pause - Whether to pause or unpause operations
   */
  async setPauseMoveCall(
    tx: Transaction,
    pause: boolean | TransactionArgument
  ): Promise<void> {
    tx.moveCall({
      target: await this.#target("set_pause"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#adminCapId()),
        asBool(tx, pause),
      ],
    });
  }

  // ==========================================
  // FEE MANAGEMENT ADMIN FUNCTIONS
  // ==========================================
  // Configure fee collection and distribution for OFT transfers

  /**
   * Set fee deposit address for OFT fees
   * @param tx - The transaction to add the move call to
   * @param feeDepositAddress - The new fee deposit address
   */
  async setFeeDepositAddressMoveCall(
    tx: Transaction,
    feeDepositAddress: string | TransactionArgument
  ): Promise<void> {
    tx.moveCall({
      target: await this.#target("set_fee_deposit_address"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#adminCapId()),
        asAddress(tx, feeDepositAddress),
      ],
    });
  }

  /**
   * Set default fee basis points for OFT transfers
   * @param tx - The transaction to add the move call to
   * @param feeBps - Default fee rate in basis points (0-10,000, where 10,000 = 100%)
   */
  async setDefaultFeeBpsMoveCall(
    tx: Transaction,
    feeBps: bigint | number | string | TransactionArgument
  ): Promise<void> {
    tx.moveCall({
      target: await this.#target("set_default_fee_bps"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#adminCapId()),
        asU64(tx, feeBps),
      ],
    });
  }

  /**
   * Set fee basis points for a specific destination chain
   * @param tx - The transaction to add the move call to
   * @param dstEid - Destination endpoint ID
   * @param feeBps - Fee rate in basis points (0-10,000, where 10,000 = 100%)
   */
  async setFeeBpsMoveCall(
    tx: Transaction,
    dstEid: number | TransactionArgument,
    feeBps: bigint | number | string | TransactionArgument
  ): Promise<void> {
    tx.moveCall({
      target: await this.#target("set_fee_bps"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#adminCapId()),
        asU32(tx, dstEid),
        asU64(tx, feeBps),
      ],
    });
  }

  /**
   * Removes the fee rate for a specific destination chain
   * @param tx - The transaction to add the move call to
   * @param dstEid - Destination endpoint ID
   */
  async unsetFeeBpsMoveCall(
    tx: Transaction,
    dstEid: number | TransactionArgument
  ): Promise<void> {
    tx.moveCall({
      target: await this.#target("unset_fee_bps"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#adminCapId()),
        asU32(tx, dstEid),
      ],
    });
  }

  // ==========================================
  // MIGRATION ADMIN FUNCTIONS
  // ==========================================
  // Handle OFT migration to new contracts

  /**
   * Migrate OFT instance to a new contract
   * @param tx - The transaction to add the move call to
   * @param migrationCap - Migration capability object ID or transaction argument
   * @returns TransactionResult containing the migration ticket
   */
  async migrateMoveCall(
    tx: Transaction,
    migrationCap: string | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("migrate"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        asObject(tx, migrationCap),
      ],
    });
  }

  // ==========================================
  // RATE LIMITER ADMIN FUNCTIONS
  // ==========================================
  // Configure transfer rate limits for security and compliance

  /**
   * Set rate limit for OFT transfers
   * @param tx - The transaction to add the move call to
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   * @param rateLimit - Rate limit amount
   * @param windowSeconds - Time window in seconds
   */
  async setRateLimitMoveCall(
    tx: Transaction,
    eid: number | TransactionArgument,
    inbound: boolean | TransactionArgument,
    rateLimit: bigint | number | string | TransactionArgument,
    windowSeconds: bigint | number | string | TransactionArgument
  ): Promise<void> {
    tx.moveCall({
      target: await this.#target("set_rate_limit"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#adminCapId()),
        asU32(tx, eid),
        asBool(tx, inbound),
        asU64(tx, rateLimit),
        asU64(tx, windowSeconds),
        tx.object.clock(),
      ],
    });
  }

  /**
   * Remove rate limit for OFT transfers
   * @param tx - The transaction to add the move call to
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   */
  async unsetRateLimitMoveCall(
    tx: Transaction,
    eid: number | TransactionArgument,
    inbound: boolean | TransactionArgument
  ): Promise<void> {
    tx.moveCall({
      target: await this.#target("unset_rate_limit"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#adminCapId()),
        asU32(tx, eid),
        asBool(tx, inbound),
      ],
    });
  }

  // ==========================================
  // CORE FUNCTIONS
  // ==========================================
  // Primary OFT operations for token transfers and coin management

  /**
   * Splits specified amount of coins from user's wallet
   * @param tx - The transaction to add the move call to
   * @param owner - Address of the user whose coins to split
   * @param amount - Amount of coins to split (in smallest units)
   * @param limit - Maximum total number of coins to collect across all pages (default: 200)
   * @param pageSize - Maximum number of coins to fetch per page (default: 50)
   * @returns Promise resolving to split coin as TransactionResult
   * @throws Error if insufficient coins balance or no coins found
   */
  async splitCoinMoveCall(
    tx: Transaction,
    owner: string,
    amount: bigint,
    limit = 200,
    pageSize = 50
  ): Promise<TransactionResult> {
    return this.protocolSDK
      .getUtils()
      .splitCoinMoveCall(
        tx,
        await this.#coinType(),
        owner,
        amount,
        limit,
        pageSize
      );
  }

  /**
   * Send OFT tokens to destination chain
   * @param tx - The transaction to add the move call to
   * @param sender - Sender address for ZRO token operations
   * @param sendParam - Send parameters including destination and amounts
   * @param coinProvided - Coin object ID or transaction result to send
   * @param nativeFee - Native token fee amount
   * @param zroFee - ZRO token fee amount
   * @param refundAddress - Address for fee refunds
   * @param validators - Optional PTB validators for transaction validation
   * @param maxSimulationTimes - Optional maximum number of simulation attempts
   * @returns Promise<void> - Completes when the send operation is processed
   */
  async sendMoveCall(
    tx: Transaction,
    sender: string,
    sendParam: SendParam | TransactionArgument,
    coinProvided: string | TransactionArgument,
    nativeFee: bigint | TransactionArgument,
    zroFee: bigint | TransactionArgument,
    refundAddress: string | TransactionArgument,
    validators?: IPTBValidator[],
    maxSimulationTimes?: number
  ): Promise<void> {
    const sendParamArg = isTransactionArgument(sendParam)
      ? sendParam
      : await this.#buildSendParam(tx, sendParam);
    const txSender = await this.txSenderMoveCall(tx);
    const addressArg = isTransactionArgument(refundAddress)
      ? refundAddress
      : tx.pure.option("address", refundAddress);

    // The oft::send returns a tuple (Call<EndpointSendParam, MessagingReceipt>, OFTReceipt)
    const transactionResult = tx.moveCall({
      target: await this.#target("send"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#oappObjectId()),
        txSender,
        sendParamArg,
        asObject(tx, coinProvided),
        asArgWithTx(
          tx,
          nativeFee,
          (tx, val) => tx.splitCoins(tx.gas, [asU64(tx, val)])[0]
        ),
        await asArgWithTxAsync(tx, zroFee, async (tx, val) =>
          this.protocolSDK.getZro().splitOptionZroTokenMoveCall(tx, sender, val)
        ),
        addressArg,
        tx.object.clock(),
      ],
    });

    console.log('transactionResult:', transactionResult);

    const endpointCall = transactionResult[0];
    const oftSendContext = transactionResult[1];

    await this.protocolSDK
      .getEndpoint()
      .populateSendTransaction(
        tx,
        endpointCall as unknown as TransactionResult,
        sender,
        validators,
        maxSimulationTimes
      );

    const confirmSendResult = tx.moveCall({
      target: await this.#target("confirm_send"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#oappObjectId()),
        txSender,
        endpointCall,
        oftSendContext,
      ],
    });
    // destroy the empty coins
    const nativeCoin = confirmSendResult[2];
    const zroCoin = confirmSendResult[3];
    tx.moveCall({
      target: "0x1::option::destroy_none",
      arguments: [nativeCoin],
      typeArguments: [`0x2::coin::Coin<0x2::iota::IOTA>`],
    });
    tx.moveCall({
      target: "0x1::option::destroy_none",
      arguments: [zroCoin],
      typeArguments: [`0x2::coin::Coin<${this.protocolSDK.getZro().zroType}>`],
    });
  }

  /**
   * Process inbound cross-chain token transfers
   * @param tx - The transaction to add the move call to
   * @param call - LayerZero receive call containing the verified cross-chain message
   * @returns TransactionResult containing the processed transfer
   */
  async lzReceiveMoveCall(
    tx: Transaction,
    call: string | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("lz_receive"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#oappObjectId()),
        asObject(tx, call),
        tx.object.clock(),
      ],
    });
  }

  /**
   * Process inbound cross-chain token transfers with compose functionality
   * @param tx - The transaction to add the move call to
   * @param composeQueue - The composer's message queue for sequencing operations
   * @param composerManager - Manager managing token deposits for composers
   * @param call - LayerZero receive call containing the verified cross-chain message
   * @returns TransactionResult containing the processed transfer
   */
  async lzReceiveWithComposeMoveCall(
    tx: Transaction,
    composeQueue: string | TransactionArgument,
    composerManager: string | TransactionArgument,
    call: string | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("lz_receive_with_compose"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#oappObjectId()),
        asObject(tx, composeQueue),
        asObject(tx, composerManager),
        asObject(tx, call),
        tx.object.clock(),
      ],
    });
  }

  /**
   * Confirms and extracts results from a quote operation
   * @param tx - The transaction to add the move call to
   * @param call - Completed Call object from quote_send() execution
   * @returns TransactionResult containing the messaging fee
   */
  async confirmQuoteSendMoveCall(
    tx: Transaction,
    call: string | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("confirm_quote_send"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#oappObjectId()),
        asObject(tx, call),
      ],
    });
  }

  // ==========================================
  // QUOTE FUNCTIONS
  // ==========================================
  // Calculate fees, limits, and receipts before executing operations

  /**
   * Quote OFT sending operation with detailed fee breakdown
   * @param sendParam - Send parameters for the OFT operation
   * @returns Promise with limit, fee details, and receipt information
   */
  async quoteOft(
    sendParam: SendParam | TransactionArgument
  ): Promise<{
    limit: OFTLimit;
    feeDetails: OFTFeeDetail[];
    receipt: OFTReceipt;
  }> {
    return executeSimulate(
      this.client,
      async (tx) => {
        const sendParamArg = isTransactionArgument(sendParam)
          ? sendParam
          : await this.#buildSendParam(tx, sendParam);
        tx.moveCall({
          target: await this.#target("quote_oft"),
          typeArguments: [await this.#coinType()],
          arguments: [
            tx.object(await this.#oftObjectId()),
            sendParamArg,
            tx.object.clock(),
          ],
        });
      },
      (result) => {
        return {
          limit: parseOFTLimit(result[0].value),
          feeDetails: parseOFTFeeDetails(result[1].value),
          receipt: parseOFTReceipt(result[2].value),
        };
      }
    );
  }

  /**
   * Quote messaging fees for OFT sending
   * @param sender - Sender address
   * @param sendParam - Send parameters for the OFT operation
   * @param payInZro - Whether to pay in ZRO tokens
   * @param validators - Optional PTB validators for transaction validation
   * @param maxSimulationTimes - Optional maximum number of simulation attempts
   * @returns Promise<MessagingFee> - The calculated messaging fees
   */
  async quoteSend(
    sender: string,
    sendParam: SendParam | TransactionArgument,
    payInZro: boolean | TransactionArgument,
    validators?: IPTBValidator[],
    maxSimulationTimes?: number
  ): Promise<MessagingFee> {
    const tx = new Transaction();
    const sendParamArg = isTransactionArgument(sendParam)
      ? sendParam
      : await this.#buildSendParam(tx, sendParam);

    const quoteCall = tx.moveCall({
      target: await this.#target("quote_send"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        tx.object(await this.#oappObjectId()),
        asAddress(tx, sender),
        sendParamArg,
        asBool(tx, payInZro),
      ],
    });

    return this.protocolSDK
      .getEndpoint()
      .quote(tx, quoteCall, sender, validators, maxSimulationTimes);
  }

  // ==========================================
  // VIEW FUNCTIONS
  // ==========================================
  // Read-only functions to query OFT state and configuration

  /**
   * Get the upgrade version of this OFT instance
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the upgrade version
   */
  async upgradeVersionMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("upgrade_version"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get the upgrade version of this OFT instance
   * @returns Promise<bigint> - The upgrade version
   */
  async upgradeVersion(): Promise<bigint> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.upgradeVersionMoveCall(tx);
      },
      (result) => BigInt(bcs.U64.parse(result[0].value))
    );
  }

  /**
   * Get the associated OApp object address
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the OApp object address
   */
  async oappObjectMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("oapp_object"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get the associated OApp object address
   * @returns Promise<string> - The OApp object address
   */
  async oappObject(): Promise<string> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.oappObjectMoveCall(tx);
      },
      (result) => bcs.Address.parse(result[0].value)
    );
  }

  /**
   * Get OFT version information
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing version information
   */
  async oftVersionMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("oft_version"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get OFT version information
   * @returns Promise<{ major: number; minor: number }> - The OFT version
   */
  async oftVersion(): Promise<{ major: number; minor: number }> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.oftVersionMoveCall(tx);
      },
      (result) => {
        const major = Number(bcs.U64.parse(result[0].value));
        const minor = Number(bcs.U64.parse(result[1].value));
        return { major, minor };
      }
    );
  }

  /**
   * Get the OFT capability ID
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the OFT capability ID
   */
  async oftCapIdMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("oft_cap_id"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get the OFT capability ID
   * @returns Promise<string> - The OFT capability ID
   */
  async oftCapId(): Promise<string> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.oftCapIdMoveCall(tx);
      },
      (result) => bcs.Address.parse(result[0].value)
    );
  }

  /**
   * Get the migration capability address for this OFT
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the migration capability address
   */
  async migrationCapMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("migration_cap"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get the migration capability address for this OFT
   * @returns Promise<string> - The migration capability address
   */
  async migrationCap(): Promise<string> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.migrationCapMoveCall(tx);
      },
      (result) => bcs.Address.parse(result[0].value)
    );
  }

  async messagingChannel(): Promise<string> {
    return executeSimulate(
      this.client,
      async (tx) => {
        const oftCapId = await this.oftCapIdMoveCall(tx);
        this.protocolSDK
          .getEndpoint()
          .getMessagingChannelMoveCall(tx, oftCapId);
      },
      (result) => bcs.Address.parse(result[0].value)
    );
  }

  /**
   * Get coin metadata address
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing coin metadata address
   */
  async coinMetadataMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("coin_metadata"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get coin metadata address
   * @returns Promise<string> - The coin metadata address
   */
  async coinMetadata(): Promise<string> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.coinMetadataMoveCall(tx);
      },
      (result) => bcs.Address.parse(result[0].value)
    );
  }

  /**
   * Get OFT admin capability address
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the admin capability address
   */
  async adminCapMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("admin_cap"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get OFT admin capability address
   * @returns Promise<string> - The admin capability address
   */
  async adminCap(): Promise<string> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.adminCapMoveCall(tx);
      },
      (result) => bcs.Address.parse(result[0].value)
    );
  }

  /**
   * Get shared decimals for cross-chain compatibility
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing shared decimals
   */
  async sharedDecimalsMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("shared_decimals"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get shared decimals for cross-chain compatibility
   * @returns Promise<number> - The shared decimal precision
   */
  async sharedDecimals(): Promise<number> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.sharedDecimalsMoveCall(tx);
      },
      (result) => bcs.U8.parse(result[0].value)
    );
  }

  /**
   * Get the decimal conversion rate for this OFT
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the decimal conversion rate
   */
  async decimalConversionRateMoveCall(
    tx: Transaction
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("decimal_conversion_rate"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get the decimal conversion rate for this OFT
   * @returns Promise<bigint> - The decimal conversion rate multiplier
   */
  async decimalConversionRate(): Promise<bigint> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.decimalConversionRateMoveCall(tx);
      },
      (result) => BigInt(bcs.U64.parse(result[0].value))
    );
  }

  /**
   * Check if OFT is paused
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the paused status
   */
  async isPausedMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("is_paused"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Check if OFT is paused
   * @returns Promise<boolean> - True if OFT is paused
   */
  async isPaused(): Promise<boolean> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.isPausedMoveCall(tx);
      },
      (result) => bcs.Bool.parse(result[0].value)
    );
  }

  /**
   * Check if this OFT is an adapter (wraps existing token)
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the adapter status
   */
  async isAdapterMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("is_adapter"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Check if this OFT is an adapter (wraps existing token)
   * @returns Promise<boolean> - True if this is an OFT adapter
   */
  async isAdapter(): Promise<boolean> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.isAdapterMoveCall(tx);
      },
      (result) => bcs.Bool.parse(result[0].value)
    );
  }

  /**
   * Decode OFTInfoV1 from encoded bytes
   * @param tx - The transaction to add the move call to
   * @param encodedBytes - The encoded OFTInfoV1 bytes to decode
   * @returns Transaction result containing the decoded OFTInfoV1
   */
  decodeOftInfoV1MoveCall(
    tx: Transaction,
    encodedBytes: Uint8Array | TransactionArgument
  ): TransactionResult {
    return tx.moveCall({
      target: `${this.oftCallCapId}::oft_info_v1::decode`,
      arguments: [asBytes(tx, encodedBytes)],
    });
  }

  /**
   * Decode OFTInfoV1 from encoded bytes
   * @param encodedBytes - The encoded OFTInfoV1 bytes to decode
   * @returns Promise<OFTInfoV1> - The decoded OFTInfoV1 structure
   */
  async decodeOftInfoV1(encodedBytes: Uint8Array): Promise<OFTInfoV1> {
    return executeSimulate(
      this.client,
      (tx) => {
        this.decodeOftInfoV1MoveCall(tx, encodedBytes);
      },
      (result) => parseOFTInfoV1(result[0].value)
    );
  }

  // ==========================================
  // FEE VIEW FUNCTIONS
  // ==========================================
  // Query current fee configuration and settings

  /**
   * Check if the OFT has a fee rate greater than 0 for the specified destination
   * @param tx - The transaction to add the move call to
   * @param dstEid - Destination endpoint ID
   * @returns Transaction result containing whether fee exists
   */
  async hasOftFeeMoveCall(
    tx: Transaction,
    dstEid: number | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("has_oft_fee"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId()), asU32(tx, dstEid)],
    });
  }

  /**
   * Check if the OFT has a fee rate greater than 0 for the specified destination
   * @param dstEid - Destination endpoint ID
   * @returns Promise<boolean> - True if fee exists
   */
  async hasOftFee(dstEid: number): Promise<boolean> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.hasOftFeeMoveCall(tx, dstEid);
      },
      (result) => bcs.Bool.parse(result[0].value)
    );
  }

  /**
   * Get the effective fee rate for a specific destination chain
   * @param tx - The transaction to add the move call to
   * @param dstEid - Destination endpoint ID
   * @returns Transaction result containing the effective fee basis points
   */
  async effectiveFeeBpsMoveCall(
    tx: Transaction,
    dstEid: number | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("effective_fee_bps"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId()), asU32(tx, dstEid)],
    });
  }

  /**
   * Get the effective fee rate for a specific destination chain
   * @param dstEid - Destination endpoint ID
   * @returns Promise<bigint> - The effective fee in basis points
   */
  async effectiveFeeBps(dstEid: number): Promise<bigint> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.effectiveFeeBpsMoveCall(tx, dstEid);
      },
      (result) => BigInt(bcs.U64.parse(result[0].value))
    );
  }

  /**
   * Get the default fee rate
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the default fee basis points
   */
  async defaultFeeBpsMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("default_fee_bps"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get the default fee rate
   * @returns Promise<bigint> - The default fee in basis points
   */
  async defaultFeeBps(): Promise<bigint> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.defaultFeeBpsMoveCall(tx);
      },
      (result) => BigInt(bcs.U64.parse(result[0].value))
    );
  }

  /**
   * Get fee basis points for a specific destination chain
   * @param tx - The transaction to add the move call to
   * @param dstEid - Destination endpoint ID
   * @returns Transaction result containing the fee basis points
   */
  async feeBpsMoveCall(
    tx: Transaction,
    dstEid: number | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("fee_bps"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId()), asU32(tx, dstEid)],
    });
  }

  /**
   * Get fee basis points for a specific destination chain
   * @param dstEid - Destination endpoint ID
   * @returns Promise<bigint> - The fee in basis points
   */
  async feeBps(dstEid: number): Promise<bigint> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.feeBpsMoveCall(tx, dstEid);
      },
      (result) => BigInt(bcs.U64.parse(result[0].value))
    );
  }

  /**
   * Get fee deposit address for OFT
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the fee deposit address
   */
  async feeDepositAddressMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("fee_deposit_address"),
      typeArguments: [await this.#coinType()],
      arguments: [tx.object(await this.#oftObjectId())],
    });
  }

  /**
   * Get fee deposit address for OFT
   * @returns Promise<string> - The fee deposit address
   */
  async feeDepositAddress(): Promise<string> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.feeDepositAddressMoveCall(tx);
      },
      (result) => bcs.Address.parse(result[0].value)
    );
  }

  // ==========================================
  // RATE LIMITER VIEW FUNCTIONS
  // ==========================================
  // Query current rate limiting configuration and status

  /**
   * Get rate limit configuration for an endpoint
   * @param tx - The transaction to add the move call to
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   * @returns Transaction result containing rate limit configuration
   */
  async rateLimitConfigMoveCall(
    tx: Transaction,
    eid: number | TransactionArgument,
    inbound: boolean | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("rate_limit_config"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        asU32(tx, eid),
        asBool(tx, inbound),
      ],
    });
  }

  /**
   * Get rate limit configuration for an endpoint
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   * @returns Promise<{ limit: bigint; windowSeconds: bigint }> - Rate limit configuration
   */
  async rateLimitConfig(
    eid: number,
    inbound: boolean
  ): Promise<{ limit: bigint; windowSeconds: bigint }> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.rateLimitConfigMoveCall(tx, eid, inbound);
      },
      (result) => {
        const limit = BigInt(bcs.U64.parse(result[0].value));
        const windowSeconds = BigInt(bcs.U64.parse(result[1].value));
        return { limit, windowSeconds };
      }
    );
  }

  /**
   * Get current in-flight amount for rate limiting
   * @param tx - The transaction to add the move call to
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   * @returns Transaction result containing in-flight amount
   */
  async rateLimitInFlightMoveCall(
    tx: Transaction,
    eid: number | TransactionArgument,
    inbound: boolean | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("rate_limit_in_flight"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        asU32(tx, eid),
        asBool(tx, inbound),
        tx.object.clock(),
      ],
    });
  }

  /**
   * Get current in-flight amount for rate limiting
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   * @returns Promise<bigint> - Current in-flight amount
   */
  async rateLimitInFlight(eid: number, inbound: boolean): Promise<bigint> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.rateLimitInFlightMoveCall(tx, eid, inbound);
      },
      (result) => BigInt(bcs.U64.parse(result[0].value))
    );
  }

  /**
   * Get rate limit capacity (remaining available amount)
   * @param tx - The transaction to add the move call to
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   * @returns Transaction result containing rate limit capacity
   */
  async rateLimitCapacityMoveCall(
    tx: Transaction,
    eid: number | TransactionArgument,
    inbound: boolean | TransactionArgument
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("rate_limit_capacity"),
      typeArguments: [await this.#coinType()],
      arguments: [
        tx.object(await this.#oftObjectId()),
        asU32(tx, eid),
        asBool(tx, inbound),
        tx.object.clock(),
      ],
    });
  }

  /**
   * Get rate limit capacity (remaining available amount)
   * @param eid - Endpoint ID
   * @param inbound - Whether this is for inbound or outbound transfers
   * @returns Promise<bigint> - Remaining rate limit capacity
   */
  async rateLimitCapacity(eid: number, inbound: boolean): Promise<bigint> {
    return executeSimulate(
      this.client,
      async (tx) => {
        await this.rateLimitCapacityMoveCall(tx, eid, inbound);
      },
      (result) => BigInt(bcs.U64.parse(result[0].value))
    );
  }

  // ==========================================
  // OFT SENDER
  // ==========================================

  /**
   * Create a transaction sender object for OFT operations
   * @param tx - The transaction to add the move call to
   * @returns Transaction result containing the transaction sender object
   */
  async txSenderMoveCall(tx: Transaction): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("tx_sender", OFT_SENDER_MODULE_NAME),
    });
  }

  // ==========================================
  // PRIVATE HELPER FUNCTIONS
  // ==========================================
  // Internal utility functions for OFT operations

  /**
   * Build SendParam struct for OFT operations
   * @param tx - The transaction to add the move call to
   * @param param - Send parameters to build
   * @returns Transaction result containing the SendParam struct
   * @private
   */
  async #buildSendParam(
    tx: Transaction,
    param: SendParam
  ): Promise<TransactionResult> {
    return tx.moveCall({
      target: await this.#target("create", "send_param"),
      arguments: [
        asU32(tx, param.dstEid),
        asBytes32(tx, param.to, this.protocolSDK.getUtils()),
        asU64(tx, param.amountLd),
        asU64(tx, param.minAmountLd),
        asBytes(tx, param.extraOptions),
        asBytes(tx, param.composeMsg),
        asBytes(tx, param.oftCmd),
      ],
    });
  }

  /**
   * Generate the full target path for move calls
   * @param name - The function name to call
   * @param module_name - The module name (defaults to 'oft')
   * @returns The full module path for the move call
   * @private
   */
  async #target(name: string, module_name = MODULE_NAME): Promise<string> {
    return `${await this.#oftPackageId()}::${module_name}::${name}`;
  }

  /**
   * Get the OApp object ID, throwing an error if not available
   * @returns The OApp object ID
   * @throws Error if OApp object ID was not set
   * @private
   */
  async #oappObjectId(): Promise<string> {
    if (this.oappObjectId === undefined) {
      const oappSdk = this.protocolSDK.getOApp(this.oftCallCapId);
      const oappInfo = await oappSdk.getOAppInfoV1();
      this.oappObjectId = oappInfo.oapp_object;
    }
    return this.oappObjectId;
  }

  /**
   * Get the OFT object ID, automatically retrieving it from the OFT info if not cached
   * @returns The OFT object ID
   * @throws Error if OFT object ID cannot be retrieved
   * @private
   */
  async #oftObjectId(): Promise<string> {
    if (this.oftObjectId === undefined) {
      const oftInfo = await this.#OftInfo();
      this.oftObjectId = oftInfo.oftObject;
    }
    return this.oftObjectId;
  }

  /**
   * Get the admin capability ID, automatically retrieving it from the OFT instance if not cached
   * @returns The admin capability ID
   * @throws Error if admin capability cannot be retrieved from the OFT instance
   * @private
   */
  async #adminCapId(): Promise<string> {
    if (this.adminCapId === undefined) {
      this.adminCapId = await this.adminCap();
    }
    return this.adminCapId;
  }

  /**
   * Get the coin type, automatically extracting it from the OFT object if not cached
   * @returns The coin type string (e.g., "0x123::mycoin::MYCOIN")
   * @throws Error if coin type cannot be extracted from the OFT object
   * @private
   */
  async #coinType(): Promise<string> {
    if (this.coinType === undefined) {
      const oftInfo = await this.client.getObject({
        id: await this.#oftObjectId(),
        options: {
          showContent: true,
        },
      });

      const content = oftInfo.data?.content as
        | { type?: string; dataType?: string }
        | undefined;
      if (
        content?.dataType !== "moveObject" ||
        content.type == null ||
        content.type.length === 0
      ) {
        throw new Error("Invalid OFT object data or missing type field");
      }

      // Extract the coin type from the first pair of angle brackets, e.g.:
      // "0xdd39db3a038c70a71fbffedf6b32a50383ace0b5f219a617238bd2fbee1995b0::oft::OFT<0x428907130f475ef50f76c8944d5960772e135e4d64bcb019e181030377049215::test_coin::TEST_COIN>"
      const typeStr = content.type;
      // Match the first angle-bracketed substring
      const angleBracketMatch = typeStr.match(/<([^>]+)>/);
      const coinType = angleBracketMatch?.[1];
      if (coinType === undefined || coinType === "") {
        throw new Error("Failed to extract coinType from object type");
      }
      this.coinType = coinType;
    }
    return this.coinType;
  }

  /**
   * Get OApp info, throwing if not set
   * @returns The OApp info
   * @throws Error if OApp info is not set
   * @private
   */
  async #OftInfo(): Promise<OFTInfoV1> {
    if (!this.oftInfo) {
      const oappSdk = this.protocolSDK.getOApp(this.oftCallCapId);
      this.oftInfo = await executeSimulate(
        this.client,
        (tx) => {
          const oappInfo = oappSdk.getOAppInfoV1MoveCall(tx);
          const extraInfo = oappSdk.getOAppInfoV1ExtraInfoMoveCall(
            tx,
            oappInfo
          );
          this.decodeOftInfoV1MoveCall(tx, extraInfo);
        },
        (result) => parseOFTInfoV1(result[0].value)
      );
    }
    return this.oftInfo;
  }

  /**
   * Get the OFT package ID, automatically retrieving it from the OFT info if not cached
   * @returns The OFT package ID
   * @throws Error if OFT package ID cannot be retrieved
   * @private
   */
  async #oftPackageId(): Promise<string> {
    if (this.oftPackageId === undefined) {
      const oftInfo = await this.#OftInfo();
      this.oftPackageId = oftInfo.oftPackage;
    }
    return this.oftPackageId;
  }
}
