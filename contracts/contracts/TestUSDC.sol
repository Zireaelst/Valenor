// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestUSDC
 * @dev A test USDC token for Ethereum Sepolia testnet
 * @notice This is a mock USDC token for testing purposes only
 */
contract TestUSDC is ERC20, Ownable {
    uint8 private _decimals;

    constructor() ERC20("Test USDC", "tUSDC") Ownable() {
        _decimals = 6; // USDC has 6 decimals
        _mint(msg.sender, 1000000 * 10**_decimals); // Mint 1M test USDC to deployer
    }

    /**
     * @dev Returns the number of decimals used to get its user representation
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Mint tokens to a specific address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Mint tokens to multiple addresses (only owner)
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint to each address
     */
    function mintBatch(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "TestUSDC: Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Burn tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burn tokens from a specific address (only owner)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyOwner {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
}
