// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFtsoRegistry {
    /**
     * @notice Gets the current price for a symbol with timestamp & decimals.
     * @return _price     Price in wei or token decimals
     * @return _timestamp When the price was updated
     * @return _decimals  Number of decimals the price uses
     */
    function getCurrentPriceWithDecimals(string calldata _symbol)
        external
        view
        returns (uint256 _price, uint256 _timestamp, uint256 _decimals);
}
