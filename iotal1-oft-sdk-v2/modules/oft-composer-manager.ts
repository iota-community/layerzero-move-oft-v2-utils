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
  asBytes32,
  asObject,
  executeSimulate,
} from "@layerzerolabs/lz-iotal1-sdk-v2";

export const OFTComposerManagerErrorCode = {
  // OFT Composer Manager related errors
  EComposeTransferNotFound: 1,
  EDepositAddressNotFound: 2,
} as const;

/**
 * OFT Composer Manager
 *
 * This class manages the registry for OFT Composer operations, including
 * deposit addresses and compose transfer routing for cross-chain composition.
 */
export class OFTComposerManager {
  public packageId: string;
  public readonly client: IotaClient;
  public readonly registryObjectId: string;
  private readonly protocolSDK: SDK;

  constructor(protocolSDK: SDK, packageId: string, registryObjectId: string) {
    this.client = protocolSDK.client;
    this.protocolSDK = protocolSDK;
    this.packageId = packageId;
    this.registryObjectId = registryObjectId;
  }

  // === Set Functions ===

  /**
   * Set deposit address for OFT composer
   * @param tx - The transaction to add the move call to
   * @param composerCallCap - The composer call capability transaction result
   * @param depositAddress - The new deposit address
   * @returns Transaction result containing the set operation
   */
  setDepositAddressMoveCall(
    tx: Transaction,
    composerCallCap: string | TransactionArgument,
    depositAddress: string | TransactionArgument
  ): TransactionResult {
    return tx.moveCall({
      target: this.#target("set_deposit_address"),
      arguments: [
        tx.object(this.registryObjectId),
        asObject(tx, composerCallCap),
        asAddress(tx, depositAddress),
      ],
    });
  }

  // === View Functions ===

  /**
   * Get deposit address for a composer
   * @param tx - The transaction to add the move call to
   * @param composer - The composer address
   * @returns Transaction result containing the deposit address
   */
  getDepositAddressMoveCall(
    tx: Transaction,
    composer: string | TransactionArgument
  ): TransactionResult {
    return tx.moveCall({
      target: this.#target("get_deposit_address"),
      arguments: [tx.object(this.registryObjectId), asAddress(tx, composer)],
    });
  }

  /**
   * Get compose transfer object for composition operations
   * @param tx - The transaction to add the move call to
   * @param from - The sender address
   * @param guid - The GUID transaction result
   * @param composer - The composer address
   * @returns Transaction result containing the compose transfer object
   */
  getComposeTransferMoveCall(
    tx: Transaction,
    from: string | TransactionArgument,
    guid: Uint8Array | TransactionArgument,
    composer: string | TransactionArgument
  ): TransactionResult {
    return tx.moveCall({
      target: this.#target("get_compose_transfer"),
      arguments: [
        tx.object(this.registryObjectId),
        asAddress(tx, from),
        asBytes32(tx, guid, this.protocolSDK.getUtils()),
        asAddress(tx, composer),
      ],
    });
  }

  /**
   * Get compose transfer object address
   * @param from - The sender address
   * @param guid - The GUID as number array
   * @param composer - The composer address
   * @returns Promise<string> - The compose transfer object address
   */
  async getComposeTransfer(
    from: string,
    guid: Uint8Array,
    composer: string
  ): Promise<string> {
    return executeSimulate(
      this.client,
      (tx) => {
        return this.getComposeTransferMoveCall(
          tx,
          from,
          asBytes32(tx, guid, this.protocolSDK.getUtils()),
          composer
        );
      },
      (result) => {
        const parsed = bcs.Address.parse(result[0].value);
        return parsed;
      }
    );
  }

  // === Private Functions ===

  /**
   * Generate the full target path for move calls
   * @param func - The function name to call
   * @returns The full module path for the move call
   * @private
   */
  #target(func: string): string {
    return `${this.packageId}::oft_composer_manager::${func}`;
  }
}
