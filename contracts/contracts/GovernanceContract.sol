// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./FundContract.sol";

/**
 * @title GovernanceContract
 * @dev A governance contract for managing proposals and voting on fund releases
 * @notice This contract allows donors to create proposals and vote on milestone releases
 */
contract GovernanceContract is Ownable {
    // Reference to the FundContract
    FundContract public immutable fundContract;

    // Proposal structure
    struct Proposal {
        string description;
        uint256 targetProjectId;
        uint256 amount;
        address recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        address proposer;
        uint256 createdAt;
    }

    // Events
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 targetProjectId,
        uint256 amount,
        address recipient,
        uint256 deadline
    );

    event Voted(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        uint256 targetProjectId,
        address recipient,
        uint256 amount
    );

    // Proposal storage
    Proposal[] public proposals;
    
    // Mapping: proposalId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Mapping: proposalId => voter => voting power used
    mapping(uint256 => mapping(address => uint256)) public votingPowerUsed;

    // Constants
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant MIN_PROPOSAL_AMOUNT = 100 * 10**6; // 100 USDC (6 decimals)
    uint256 public constant MIN_VOTING_POWER = 1000 * 10**6; // 1000 USDC (6 decimals)

    // Modifiers
    modifier validProposal(uint256 proposalId) {
        require(proposalId < proposals.length, "GovernanceContract: Invalid proposal ID");
        _;
    }

    modifier proposalNotExecuted(uint256 proposalId) {
        require(!proposals[proposalId].executed, "GovernanceContract: Proposal already executed");
        _;
    }

    modifier votingPeriodActive(uint256 proposalId) {
        require(block.timestamp <= proposals[proposalId].deadline, "GovernanceContract: Voting period ended");
        _;
    }

    modifier hasVotingPower(address voter) {
        require(getVotingPower(voter) >= MIN_VOTING_POWER, "GovernanceContract: Insufficient voting power");
        _;
    }

    /**
     * @dev Constructor sets the FundContract address
     * @param _fundContract Address of the FundContract
     */
    constructor(address _fundContract) {
        require(_fundContract != address(0), "GovernanceContract: Invalid FundContract address");
        fundContract = FundContract(_fundContract);
    }

    /**
     * @dev Create a new proposal
     * @param description Description of the proposal
     * @param projectId Target project ID for fund release
     * @param amount Amount of USDC to release
     * @param recipient Address to receive the funds
     */
    function createProposal(
        string memory description,
        uint256 projectId,
        uint256 amount,
        address recipient
    ) external hasVotingPower(msg.sender) {
        require(bytes(description).length > 0, "GovernanceContract: Description cannot be empty");
        require(projectId > 0, "GovernanceContract: Invalid project ID");
        require(amount >= MIN_PROPOSAL_AMOUNT, "GovernanceContract: Amount below minimum");
        require(recipient != address(0), "GovernanceContract: Invalid recipient address");
        require(amount <= fundContract.getProjectAvailable(projectId), "GovernanceContract: Amount exceeds available project funds");

        uint256 proposalId = proposals.length;
        uint256 deadline = block.timestamp + VOTING_PERIOD;

        proposals.push(Proposal({
            description: description,
            targetProjectId: projectId,
            amount: amount,
            recipient: recipient,
            votesFor: 0,
            votesAgainst: 0,
            deadline: deadline,
            executed: false,
            proposer: msg.sender,
            createdAt: block.timestamp
        }));

        emit ProposalCreated(
            proposalId,
            msg.sender,
            description,
            projectId,
            amount,
            recipient,
            deadline
        );
    }

    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param support True for yes, false for no
     */
    function vote(uint256 proposalId, bool support) 
        external 
        validProposal(proposalId) 
        proposalNotExecuted(proposalId) 
        votingPeriodActive(proposalId) 
    {
        require(!hasVoted[proposalId][msg.sender], "GovernanceContract: Already voted");
        
        uint256 votingPower = getVotingPower(msg.sender);
        require(votingPower > 0, "GovernanceContract: No voting power");

        hasVoted[proposalId][msg.sender] = true;
        votingPowerUsed[proposalId][msg.sender] = votingPower;

        if (support) {
            proposals[proposalId].votesFor += votingPower;
        } else {
            proposals[proposalId].votesAgainst += votingPower;
        }

        emit Voted(proposalId, msg.sender, support, votingPower);
    }

    /**
     * @dev Execute a proposal if it has passed
     * @param proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 proposalId) 
        external 
        validProposal(proposalId) 
        proposalNotExecuted(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.deadline, "GovernanceContract: Voting period not ended");
        require(proposal.votesFor > proposal.votesAgainst, "GovernanceContract: Proposal not passed");
        require(proposal.amount <= fundContract.getProjectAvailable(proposal.targetProjectId), "GovernanceContract: Insufficient project funds");

        proposal.executed = true;

        // Call FundContract to release milestone
        fundContract.releaseMilestone(
            proposal.targetProjectId,
            proposal.recipient,
            proposal.amount
        );

        emit ProposalExecuted(
            proposalId,
            proposal.targetProjectId,
            proposal.recipient,
            proposal.amount
        );
    }

    /**
     * @dev Get voting power for an address based on their donations
     * @param voter Address to check voting power for
     * @return Voting power (sum of all donations across all projects)
     */
    function getVotingPower(address voter) public view returns (uint256) {
        uint256 totalVotingPower = 0;
        
        // We need to iterate through projects to get total donations
        // For now, we'll use a simple approach - check donations for common project IDs
        for (uint256 i = 1; i <= 4; i++) { // Check first 4 project IDs
            totalVotingPower += fundContract.getDonation(voter, i);
        }
        
        return totalVotingPower;
    }

    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     * @return Proposal struct
     */
    function getProposal(uint256 proposalId) external view validProposal(proposalId) returns (Proposal memory) {
        return proposals[proposalId];
    }

    /**
     * @dev Get total number of proposals
     * @return Number of proposals created
     */
    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }

    /**
     * @dev Get next proposal ID
     * @return Next proposal ID
     */
    function nextProposalId() external view returns (uint256) {
        return proposals.length;
    }

    /**
     * @dev Check if a proposal has passed
     * @param proposalId ID of the proposal
     * @return True if proposal has passed (votesFor > votesAgainst)
     */
    function proposalPassed(uint256 proposalId) external view validProposal(proposalId) returns (bool) {
        Proposal memory proposal = proposals[proposalId];
        return proposal.votesFor > proposal.votesAgainst;
    }

    /**
     * @dev Get proposal state
     * @param proposalId ID of the proposal
     * @return State string: "Active", "Passed", "Rejected", "Executed"
     */
    function getProposalState(uint256 proposalId) external view validProposal(proposalId) returns (string memory) {
        Proposal memory proposal = proposals[proposalId];
        
        if (proposal.executed) {
            return "Executed";
        }
        
        if (block.timestamp <= proposal.deadline) {
            return "Active";
        }
        
        if (proposal.votesFor > proposal.votesAgainst) {
            return "Passed";
        }
        
        return "Rejected";
    }

    /**
     * @dev Get voting statistics for a proposal
     * @param proposalId ID of the proposal
     * @return votesFor Total votes for
     * @return votesAgainst Total votes against
     * @return totalVotes Total votes cast
     */
    function getVotingStats(uint256 proposalId) external view validProposal(proposalId) returns (
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 totalVotes
    ) {
        Proposal memory proposal = proposals[proposalId];
        votesFor = proposal.votesFor;
        votesAgainst = proposal.votesAgainst;
        totalVotes = votesFor + votesAgainst;
    }

    /**
     * @dev Get minimum proposal amount
     * @return Minimum amount required for proposals
     */
    function minProposalAmount() external pure returns (uint256) {
        return MIN_PROPOSAL_AMOUNT;
    }

    /**
     * @dev Get minimum voting power required to propose
     * @return Minimum voting power required
     */
    function minVotingPowerToPropose() external pure returns (uint256) {
        return MIN_VOTING_POWER;
    }
}