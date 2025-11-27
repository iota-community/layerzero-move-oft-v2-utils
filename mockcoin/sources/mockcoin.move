module mock_coin::mockcoin;

// === imports ===

use iota::coin::{create_currency};
use iota::url::{Self};

// === Structs ===

/// One-Time Witness struct for the MOCKCOIN coin.
public struct MOCKCOIN has drop {}

// === Constants ===

const DECIMALS: u8 = 9;
const NAME: vector<u8> = b"MUSDT";
const SYMBOL: vector<u8> = b"MUSDT";
const DESCRIPTION: vector<u8> = b"Mock USDT";
const ICON_URL: vector<u8> = b"https://images.iotaspam.io/4.png";

fun init(witness: MOCKCOIN, ctx: &mut TxContext) {
    let (treasury, metadata) = create_currency(
        witness,
        DECIMALS,
        SYMBOL,
        NAME,
        DESCRIPTION,
        option::some(url::new_unsafe_from_bytes(ICON_URL)),
        ctx,
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury, ctx.sender());
}

#[test_only]
public(package) fun init_for_testing(ctx: &mut TxContext) {
    init(MOCKCOIN {}, ctx)
}
    
