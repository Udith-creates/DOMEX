// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ISettlementModule} from "./interfaces/ISettlementModule.sol";

struct LiqChangeNode {
    uint256 nextTimestamp;
    int256 amount;
}

struct Limiter {
    uint256 minLiqRetainedBps;
    uint256 limitBeginThreshold;

    uint256 headTimestamp;
    uint256 tailTimestamp;

    mapping(uint256 => LiqChangeNode) listNodes;

    ISettlementModule settlementModule;

    bool initialized;
    bool overriden;
}
