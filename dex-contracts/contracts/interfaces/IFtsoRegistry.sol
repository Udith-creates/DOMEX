// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IFtsoRegistry
 * @notice Interface for Flare Time Series Oracle (FTSO) Registry
 */
interface IFtsoRegistry {
    /**
     * @notice Get current price of a symbol with decimals
     * @param _symbol Token symbol (e.g., "FLR", "USDC", "BTC", "ETH")
     * @return _price Current price in wei
     * @return _timestamp Timestamp of the price
     * @return _decimals Number of decimals for the price
     */
    function getCurrentPriceWithDecimals(string memory _symbol)
        external
        view
        returns (
            uint256 _price,
            uint256 _timestamp,
            uint256 _decimals
        );

    /**
     * @notice Get current price of a symbol
     * @param _symbol Token symbol
     * @return _price Current price
     * @return _timestamp Timestamp of the price
     */
    function getCurrentPrice(string memory _symbol)
        external
        view
        returns (uint256 _price, uint256 _timestamp);

    /**
     * @notice Get price at a specific timestamp
     * @param _symbol Token symbol
     * @param _timestamp Timestamp to get price for
     * @return _price Price at that timestamp
     * @return _timestamp Actual timestamp of the price
     */
    function getPriceAtTimestamp(string memory _symbol, uint256 _timestamp)
        external
        view
        returns (uint256 _price, uint256 _timestamp);
}
