// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISettlementModule {
    /**
     * @notice Called by the CircuitBreaker when a limit is triggered.
     * @param target The address the settlement module should interact with.
     * @param value  The ETH value forwarded with the call.
     * @param data   Arbitrary payload for settlement logic.
     */
    function prevent(
        address target,
        uint256 value,
        bytes calldata data
    ) external payable;
}
