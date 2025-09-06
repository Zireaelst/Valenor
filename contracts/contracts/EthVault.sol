// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EthVault {
    mapping(address => uint256) public balances;
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit() external payable {
        require(msg.value > 0, "zero value");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "zero amount");
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    function getBalanceOf(address user) external view returns (uint256) {
        return balances[user];
    }

    receive() external payable { 
        require(msg.value > 0, "zero value");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
}


