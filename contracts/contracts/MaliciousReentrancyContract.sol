// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FundContract.sol";

/**
 * @title MaliciousReentrancyContract
 * @dev A malicious contract for testing reentrancy protection
 * @notice This contract is used only for testing purposes
 */
contract MaliciousReentrancyContract {
    IERC20 public usdcToken;
    FundContract public fundContract;
    
    constructor(address _usdcToken, address _fundContract) {
        usdcToken = IERC20(_usdcToken);
        fundContract = FundContract(_fundContract);
    }
    
    function attack(uint256 projectId) external {
        // Attempt to donate and then call back into the contract
        usdcToken.approve(address(fundContract), 1000 * 10**6);
        fundContract.donate(1000 * 10**6, projectId);
        
        // This should trigger reentrancy guard
        fundContract.donate(1000 * 10**6, projectId);
    }
}
