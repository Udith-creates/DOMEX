// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FTSOCircuitBreaker} from "./FTSOCircuitBreaker.sol";

/**
 * @title DEXWithCircuitBreaker
 * @notice Example DEX integration with FTSO-based Circuit Breaker
 */
contract DEXWithCircuitBreaker {
    FTSOCircuitBreaker public circuitBreaker;

    event SwapExecuted(address indexed user, string tokenIn, string tokenOut, uint256 amount);
    event SwapBlocked(address indexed user, string reason);

    constructor(address _circuitBreakerAddress) {
        circuitBreaker = FTSOCircuitBreaker(_circuitBreakerAddress);
    }

    /**
     * @notice Execute a swap with circuit breaker protection
     * @param _tokenInSymbol Input token FTSO symbol (e.g., "FLR")
     * @param _tokenOutSymbol Output token FTSO symbol (e.g., "USDC")
     * @param _amountIn Amount of input token
     * @return amountOut Amount of output token
     */
    function swapWithProtection(
        string calldata _tokenInSymbol,
        string calldata _tokenOutSymbol,
        uint256 _amountIn
    ) external returns (uint256 amountOut) {
        // Check circuit breaker for input token
        bool inputTokenBlocked = circuitBreaker.checkPriceVolatility(_tokenInSymbol);
        if (inputTokenBlocked) {
            emit SwapBlocked(msg.sender, "Input token price volatility too high");
            revert("Swap blocked: circuit breaker triggered");
        }

        // Check circuit breaker for output token
        bool outputTokenBlocked = circuitBreaker.checkPriceVolatility(_tokenOutSymbol);
        if (outputTokenBlocked) {
            emit SwapBlocked(msg.sender, "Output token price volatility too high");
            revert("Swap blocked: circuit breaker triggered");
        }

        // Execute swap (placeholder logic)
        amountOut = _executeSwap(_tokenInSymbol, _tokenOutSymbol, _amountIn);

        emit SwapExecuted(msg.sender, _tokenInSymbol, _tokenOutSymbol, _amountIn);
        return amountOut;
    }

    /**
     * @notice Check if a specific token pair swap is allowed
     * @param _tokenInSymbol Input token symbol
     * @param _tokenOutSymbol Output token symbol
     * @return allowed True if swap is allowed
     * @return reason Reason if not allowed
     */
    function isSwapAllowed(
        string calldata _tokenInSymbol,
        string calldata _tokenOutSymbol
    ) external view returns (bool allowed, string memory reason) {
        if (circuitBreaker.isTriggered()) {
            uint256 timeUntilReset = circuitBreaker.getTimeUntilReset();
            if (timeUntilReset > 0) {
                return (false, "Circuit breaker triggered - recovery in progress");
            }
        }

        if (!circuitBreaker.isOperational()) {
            return (false, "Circuit breaker not operational");
        }

        // Could add more checks for individual tokens here
        return (true, "Swap allowed");
    }

    /**
     * @notice Internal swap execution (placeholder)
     */
    function _executeSwap(
        string calldata _tokenInSymbol,
        string calldata _tokenOutSymbol,
        uint256 _amountIn
    ) internal pure returns (uint256) {
        // Placeholder - implement actual swap logic
        // This would call Uniswap, your DEX logic, etc.
        return _amountIn; // Simplified
    }

    receive() external payable {}
}
