// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FundContract
 * @dev A contract for managing USDC donations and milestone-based fund releases
 * @notice This contract handles donations to specific projects and releases funds based on milestones
 */
contract FundContract is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Immutable USDC token address
    IERC20 public immutable usdcToken;

    // Events
    event DonationReceived(
        address indexed donor,
        uint256 indexed projectId,
        uint256 amount,
        uint256 timestamp
    );

    event MilestoneReleased(
        uint256 indexed projectId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event GovernanceUpdated(
        address indexed oldGovernance,
        address indexed newGovernance
    );

    // Governance contract address
    address public governance;

    // Mapping: donor => projectId => amount donated
    mapping(address => mapping(uint256 => uint256)) public donations;

    // Mapping: projectId => total amount donated
    mapping(uint256 => uint256) public projectDonations;

    // Mapping: projectId => total amount released
    mapping(uint256 => uint256) public projectReleased;

    // Total donations received
    uint256 public totalDonations;

    // Total funds released
    uint256 public totalReleased;

    // Modifiers
    modifier onlyGovernance() {
        require(msg.sender == governance, "FundContract: Only governance can call this function");
        _;
    }

    modifier validProject(uint256 projectId) {
        require(projectId > 0, "FundContract: Invalid project ID");
        _;
    }

    modifier validAmount(uint256 amount) {
        require(amount > 0, "FundContract: Amount must be greater than zero");
        _;
    }

    /**
     * @dev Constructor sets the USDC token address
     * @param _usdcToken Address of the USDC ERC20 token
     */
    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "FundContract: Invalid USDC token address");
        usdcToken = IERC20(_usdcToken);
        governance = msg.sender; // Owner becomes initial governance
    }

    /**
     * @dev Donate USDC to a specific project
     * @param amount Amount of USDC to donate (in token units)
     * @param projectId ID of the project to donate to
     */
    function donate(uint256 amount, uint256 projectId) 
        external 
        nonReentrant 
        validProject(projectId) 
        validAmount(amount) 
    {
        // Transfer USDC from donor to this contract
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update donation records
        donations[msg.sender][projectId] += amount;
        projectDonations[projectId] += amount;
        totalDonations += amount;

        // Emit event
        emit DonationReceived(msg.sender, projectId, amount, block.timestamp);
    }

    /**
     * @dev Release milestone funds to a recipient
     * @param projectId ID of the project
     * @param recipient Address to receive the funds
     * @param amount Amount of USDC to release
     */
    function releaseMilestone(
        uint256 projectId, 
        address recipient, 
        uint256 amount
    ) 
        external 
        onlyGovernance 
        nonReentrant 
        validProject(projectId) 
        validAmount(amount) 
    {
        require(recipient != address(0), "FundContract: Invalid recipient address");
        require(amount <= usdcToken.balanceOf(address(this)), "FundContract: Insufficient contract balance");
        
        // Check if project has enough donations
        uint256 availableForProject = projectDonations[projectId] - projectReleased[projectId];
        require(amount <= availableForProject, "FundContract: Amount exceeds available project funds");

        // Update release records
        projectReleased[projectId] += amount;
        totalReleased += amount;

        // Transfer USDC to recipient
        usdcToken.safeTransfer(recipient, amount);

        // Emit event
        emit MilestoneReleased(projectId, recipient, amount, block.timestamp);
    }

    /**
     * @dev Set the governance contract address (only owner)
     * @param _governance Address of the governance contract
     */
    function setGovernance(address _governance) external onlyOwner {
        require(_governance != address(0), "FundContract: Invalid governance address");
        address oldGovernance = governance;
        governance = _governance;
        emit GovernanceUpdated(oldGovernance, _governance);
    }

    /**
     * @dev Get donation amount for a specific donor and project
     * @param donor Address of the donor
     * @param projectId ID of the project
     * @return Amount donated by the donor to the project
     */
    function getDonation(address donor, uint256 projectId) external view returns (uint256) {
        return donations[donor][projectId];
    }

    /**
     * @dev Get total donations for a project
     * @param projectId ID of the project
     * @return Total amount donated to the project
     */
    function getProjectDonations(uint256 projectId) external view returns (uint256) {
        return projectDonations[projectId];
    }

    /**
     * @dev Get total funds released for a project
     * @param projectId ID of the project
     * @return Total amount released for the project
     */
    function getProjectReleased(uint256 projectId) external view returns (uint256) {
        return projectReleased[projectId];
    }

    /**
     * @dev Get available funds for a project (donated - released)
     * @param projectId ID of the project
     * @return Available amount for the project
     */
    function getProjectAvailable(uint256 projectId) external view returns (uint256) {
        return projectDonations[projectId] - projectReleased[projectId];
    }

    /**
     * @dev Get contract's USDC balance
     * @return Current USDC balance of the contract
     */
    function getContractBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @dev Emergency function to withdraw all USDC (only owner)
     * @notice This should only be used in emergency situations
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "FundContract: No funds to withdraw");
        
        usdcToken.safeTransfer(owner(), balance);
    }

    /**
     * @dev Emergency function to withdraw specific amount (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdrawAmount(uint256 amount) external onlyOwner {
        require(amount > 0, "FundContract: Amount must be greater than zero");
        require(amount <= usdcToken.balanceOf(address(this)), "FundContract: Insufficient balance");
        
        usdcToken.safeTransfer(owner(), amount);
    }
}
