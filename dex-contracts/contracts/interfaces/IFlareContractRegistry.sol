// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IFlareContractRegistry
 * @notice Interface for Flare Contract Registry (FDC)
 * Used to dynamically retrieve contract addresses on Flare network
 */
interface IFlareContractRegistry {
    /**
     * @notice Get contract address by name
     * @param _name Name of the contract (e.g., "FtsoRegistry", "FdcHub")
     * @return Address of the requested contract
     */
    function getContractAddressByName(string memory _name)
        external
        view
        returns (address);

    /**
     * @notice Get contract addresses by multiple names
     * @param _names Array of contract names
     * @return Array of contract addresses
     */
    function getContractAddressesByNames(string[] calldata _names)
        external
        view
        returns (address[] memory);
}
