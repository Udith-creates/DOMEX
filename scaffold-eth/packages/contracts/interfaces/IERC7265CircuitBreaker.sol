// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC7265CircuitBreaker {
    // -------- EVENTS -------- //

    event SecurityParameterAdded(
        bytes32 indexed identifier,
        uint256 minLiqRetainedBps,
        uint256 limitBeginThreshold,
        address settlementModule
    );

    event GracePeriodStarted(uint256 gracePeriodEndTimestamp);

    // NOTE: This event is spelled incorrectly in your original contract.
    event ParameterInrease(uint256 amount, bytes32 indexed identifier);

    event ParameterDecrease(uint256 amount, bytes32 indexed identifier);

    event RateLimited(bytes32 indexed identifier);

    // -------- CORE API -------- //

    function addProtectedContracts(address[] calldata _ProtectedContracts)
        external;

    function removeProtectedContracts(address[] calldata _ProtectedContracts)
        external;

    function addSecurityParameter(
        bytes32 identifier,
        uint256 minLiqRetainedBps,
        uint256 limitBeginThreshold,
        address settlementModule
    ) external;

    function updateSecurityParameter(
        bytes32 identifier,
        uint256 minLiqRetainedBps,
        uint256 limitBeginThreshold,
        address settlementModule
    ) external;

    function setCircuitBreakerOperationalStatus(bool newOperationalStatus)
        external;

    function increaseParameter(
        bytes32 identifier,
        uint256 amount,
        address settlementTarget,
        uint256 settlementValue,
        bytes calldata settlementPayload
    ) external returns (bool);

    function decreaseParameter(
        bytes32 identifier,
        uint256 amount,
        address settlementTarget,
        uint256 settlementValue,
        bytes calldata settlementPayload
    ) external returns (bool);
}
