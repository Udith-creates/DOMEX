// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFlareContractRegistry {
    /**
     * @notice Returns contract address by name.
     * Example: getContractAddressByName("FtsoRegistry")
     */
    function getContractAddressByName(string calldata _name)
        external
        view
        returns (address);
}
