// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";
import {IFtsoRegistry} from "./interfaces/IFtsoRegistry.sol";
import {IFlareContractRegistry} from "./interfaces/IFlareContractRegistry.sol";

/**
 * @title FTSOCircuitBreaker
 * @notice Circuit breaker that uses Flare's FTSO price feeds to detect market anomalies
 * @dev Monitors token prices and blocks transactions when volatility exceeds thresholds
 */
contract FTSOCircuitBreaker is Ownable {
    ////////////////////////////////////////////////////////////////
    //                      STATE VARIABLES                       //
    ////////////////////////////////////////////////////////////////

    // Flare Contract Registry address (FDC)
    address public constant FLARE_CONTRACT_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;

    // Price feed configuration
    mapping(string => uint256) public priceThresholds; // token symbol => max allowed price change in basis points (e.g., 500 = 5%)
    mapping(string => uint256) public lastRecordedPrices; // token symbol => last price in wei
    mapping(string => uint256) public lastPriceTimestamps; // token symbol => timestamp of last price update

    // Circuit breaker state
    bool public isOperational = true;
    bool public isTriggered = false;
    uint256 public triggeredAt;

    // Protected contracts that can call the circuit breaker
    mapping(address => bool) public isProtectedContract;
    address[] public protectedContracts;

    // Recovery settings
    uint256 public recoveryCooldownPeriod = 1 hours;
    uint256 public priceCheckWindowSize = 15 minutes;

    ////////////////////////////////////////////////////////////////
    //                           EVENTS                           //
    ////////////////////////////////////////////////////////////////

    event CircuitBreakerTriggered(
        string indexed token,
        uint256 lastPrice,
        uint256 currentPrice,
        uint256 priceChange
    );

    event CircuitBreakerReset(uint256 timestamp);
    event ThresholdUpdated(string indexed token, uint256 threshold);
    event ProtectedContractAdded(address indexed contractAddress);
    event ProtectedContractRemoved(address indexed contractAddress);
    event OperationalStatusChanged(bool newStatus);

    ////////////////////////////////////////////////////////////////
    //                           ERRORS                           //
    ////////////////////////////////////////////////////////////////

    error CircuitBreaker__NotOperational();
    error CircuitBreaker__TriggeredAndInCooldown();
    error CircuitBreaker__NotAProtectedContract();
    error CircuitBreaker__InvalidThreshold();
    error CircuitBreaker__TokenNotConfigured();
    error CircuitBreaker__FTSORegistryNotFound();
    error CircuitBreaker__PriceFeedError();

    ////////////////////////////////////////////////////////////////
    //                         MODIFIERS                          //
    ////////////////////////////////////////////////////////////////

    modifier onlyOperational() {
        if (!isOperational) revert CircuitBreaker__NotOperational();
        _;
    }

    modifier onlyProtected() {
        if (!isProtectedContract[msg.sender]) {
            revert CircuitBreaker__NotAProtectedContract();
        }
        _;
    }

    modifier whenNotTriggered() {
        if (isTriggered) {
            if (block.timestamp - triggeredAt < recoveryCooldownPeriod) {
                revert CircuitBreaker__TriggeredAndInCooldown();
            }
            isTriggered = false;
        }
        _;
    }

    ////////////////////////////////////////////////////////////////
    //                      CONSTRUCTOR                           //
    ////////////////////////////////////////////////////////////////

    constructor(address _initialOwner) Ownable(_initialOwner) {}

    ////////////////////////////////////////////////////////////////
    //                    ADMIN FUNCTIONS                         //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Add a protected contract that can call the circuit breaker
     * @param _contract Address of the contract to protect
     */
    function addProtectedContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid contract address");
        if (!isProtectedContract[_contract]) {
            isProtectedContract[_contract] = true;
            protectedContracts.push(_contract);
            emit ProtectedContractAdded(_contract);
        }
    }

    /**
     * @notice Remove a protected contract
     * @param _contract Address of the contract to remove
     */
    function removeProtectedContract(address _contract) external onlyOwner {
        if (isProtectedContract[_contract]) {
            isProtectedContract[_contract] = false;
            // Remove from array (order doesn't matter)
            for (uint256 i = 0; i < protectedContracts.length; i++) {
                if (protectedContracts[i] == _contract) {
                    protectedContracts[i] = protectedContracts[protectedContracts.length - 1];
                    protectedContracts.pop();
                    break;
                }
            }
            emit ProtectedContractRemoved(_contract);
        }
    }

    /**
     * @notice Configure price threshold for a token
     * @param _tokenSymbol FTSO token symbol (e.g., "FLR", "USDC")
     * @param _thresholdBps Maximum allowed price change in basis points (e.g., 500 = 5%)
     */
    function setTokenThreshold(string calldata _tokenSymbol, uint256 _thresholdBps) external onlyOwner {
        if (_thresholdBps == 0 || _thresholdBps > 10000) revert CircuitBreaker__InvalidThreshold();
        priceThresholds[_tokenSymbol] = _thresholdBps;
        emit ThresholdUpdated(_tokenSymbol, _thresholdBps);
    }

    /**
     * @notice Set the cooldown period after circuit breaker is triggered
     * @param _cooldownPeriod Cooldown duration in seconds
     */
    function setRecoveryCooldownPeriod(uint256 _cooldownPeriod) external onlyOwner {
        require(_cooldownPeriod > 0, "Cooldown must be > 0");
        recoveryCooldownPeriod = _cooldownPeriod;
    }

    /**
     * @notice Manually reset the circuit breaker
     */
    function resetCircuitBreaker() external onlyOwner {
        if (isTriggered) {
            isTriggered = false;
            emit CircuitBreakerReset(block.timestamp);
        }
    }

    /**
     * @notice Set operational status
     * @param _status True to enable, false to disable
     */
    function setOperationalStatus(bool _status) external onlyOwner {
        isOperational = _status;
        emit OperationalStatusChanged(_status);
    }

    ////////////////////////////////////////////////////////////////
    //                   CORE FUNCTIONS                           //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Check if a transaction should be blocked based on price volatility
     * @param _tokenSymbol FTSO token symbol to check
     * @return shouldBlock True if transaction should be blocked
     */
    function checkPriceVolatility(string calldata _tokenSymbol)
        external
        onlyProtected
        onlyOperational
        whenNotTriggered
        returns (bool shouldBlock)
    {
        if (priceThresholds[_tokenSymbol] == 0) revert CircuitBreaker__TokenNotConfigured();

        // Get current price from FTSO
        (uint256 currentPrice, uint256 _timestamp) = _getCurrentPrice(_tokenSymbol);

        // First time checking this token - just record the price
        if (lastRecordedPrices[_tokenSymbol] == 0) {
            lastRecordedPrices[_tokenSymbol] = currentPrice;
            lastPriceTimestamps[_tokenSymbol] = block.timestamp;
            return false;
        }

        // Calculate price change percentage (in basis points)
        uint256 lastPrice = lastRecordedPrices[_tokenSymbol];
        uint256 priceChange = _calculatePriceChange(lastPrice, currentPrice);
        uint256 threshold = priceThresholds[_tokenSymbol];

        // Check if price change exceeds threshold
        if (priceChange > threshold) {
            isTriggered = true;
            triggeredAt = block.timestamp;
            emit CircuitBreakerTriggered(_tokenSymbol, lastPrice, currentPrice, priceChange);
            return true;
        }

        // Update recorded price
        if (block.timestamp - lastPriceTimestamps[_tokenSymbol] >= priceCheckWindowSize) {
            lastRecordedPrices[_tokenSymbol] = currentPrice;
            lastPriceTimestamps[_tokenSymbol] = block.timestamp;
        }

        return false;
    }

    /**
     * @notice Get current price of a token from FTSO
     * @param _tokenSymbol FTSO token symbol
     * @return price Current price in wei
     * @return timestamp Timestamp of the price
     */
    function getCurrentPrice(string calldata _tokenSymbol)
        external
        view
        returns (uint256 price, uint256 timestamp)
    {
        return _getCurrentPrice(_tokenSymbol);
    }

    ////////////////////////////////////////////////////////////////
    //                   INTERNAL FUNCTIONS                       //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Get current price from FTSO via FDC
     * @param _tokenSymbol Token symbol to get price for
     * @return price Current price in wei
     * @return timestamp Price timestamp
     */
    function _getCurrentPrice(string memory _tokenSymbol)
        internal
        view
        returns (uint256 price, uint256 timestamp)
    {
        // Get FTSO Registry from FDC
        IFlareContractRegistry contractRegistry = IFlareContractRegistry(FLARE_CONTRACT_REGISTRY);
        address ftsoRegistryAddress = contractRegistry.getContractAddressByName("FtsoRegistry");

        if (ftsoRegistryAddress == address(0)) {
            revert CircuitBreaker__FTSORegistryNotFound();
        }

        IFtsoRegistry ftsoRegistry = IFtsoRegistry(ftsoRegistryAddress);

        // Get price with decimals
        (uint256 _price, uint256 _timestamp, uint256 _decimals) = ftsoRegistry
            .getCurrentPriceWithDecimals(_tokenSymbol);

        if (_price == 0) {
            revert CircuitBreaker__PriceFeedError();
        }

        return (_price, _timestamp);
    }

    /**
     * @notice Calculate percentage change between two prices
     * @param _lastPrice Previous price
     * @param _currentPrice Current price
     * @return changeBps Change in basis points
     */
    function _calculatePriceChange(uint256 _lastPrice, uint256 _currentPrice)
        internal
        pure
        returns (uint256 changeBps)
    {
        if (_lastPrice == 0) return 0;

        uint256 absoluteChange;
        if (_currentPrice >= _lastPrice) {
            absoluteChange = _currentPrice - _lastPrice;
        } else {
            absoluteChange = _lastPrice - _currentPrice;
        }

        // Calculate percentage change in basis points (multiply by 10000 for precision)
        changeBps = (absoluteChange * 10000) / _lastPrice;

        return changeBps;
    }

    ////////////////////////////////////////////////////////////////
    //                   VIEW FUNCTIONS                           //
    ////////////////////////////////////////////////////////////////

    /**
     * @notice Get time until circuit breaker can be reset
     * @return secondsUntilReset Seconds until reset is possible (0 if already can reset)
     */
    function getTimeUntilReset() external view returns (uint256 secondsUntilReset) {
        if (!isTriggered) return 0;

        uint256 timeElapsed = block.timestamp - triggeredAt;
        if (timeElapsed >= recoveryCooldownPeriod) return 0;

        return recoveryCooldownPeriod - timeElapsed;
    }

    /**
     * @notice Get all protected contracts
     * @return List of protected contract addresses
     */
    function getProtectedContracts() external view returns (address[] memory) {
        return protectedContracts;
    }

    /**
     * @notice Check if circuit breaker is in recovery cooldown
     * @return inCooldown True if triggered and within cooldown period
     */
    function isInCooldown() external view returns (bool inCooldown) {
        return isTriggered && (block.timestamp - triggeredAt < recoveryCooldownPeriod);
    }

    ////////////////////////////////////////////////////////////////
    //                    RECEIVE & FALLBACK                      //
    ////////////////////////////////////////////////////////////////

    receive() external payable {}
    fallback() external payable {}
}
