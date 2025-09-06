// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ValenorSocialFund
 * @dev A decentralized autonomous social fund for community-driven proposals
 */
contract ValenorSocialFund is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    // Proposal structure
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 amount;
        address recipient;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool cancelled;
        mapping(address => bool) hasVoted;
    }

    // Member structure
    struct Member {
        address memberAddress;
        uint256 stakeAmount;
        uint256 joinTime;
        bool isActive;
    }

    // State variables
    Counters.Counter private _proposalCounter;
    Counters.Counter private _memberCounter;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Member) public members;
    mapping(address => bool) public isMember;
    
    uint256 public constant MINIMUM_STAKE = 0.1 ether;
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant EXECUTION_DELAY = 1 days;
    uint256 public constant QUORUM_THRESHOLD = 30; // 30% of total members
    
    uint256 public totalStaked;
    uint256 public totalMembers;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, uint256 amount);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, address indexed recipient, uint256 amount);
    event ProposalCancelled(uint256 indexed proposalId);
    event MemberJoined(address indexed member, uint256 stakeAmount);
    event MemberLeft(address indexed member, uint256 stakeAmount);
    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    constructor() Ownable() {}

    /**
     * @dev Join the fund by staking minimum amount
     */
    function joinFund() external payable {
        require(msg.value >= MINIMUM_STAKE, "Insufficient stake amount");
        require(!isMember[msg.sender], "Already a member");
        
        members[msg.sender] = Member({
            memberAddress: msg.sender,
            stakeAmount: msg.value,
            joinTime: block.timestamp,
            isActive: true
        });
        
        isMember[msg.sender] = true;
        totalStaked += msg.value;
        totalMembers++;
        _memberCounter.increment();
        
        emit MemberJoined(msg.sender, msg.value);
    }

    /**
     * @dev Leave the fund and withdraw stake
     */
    function leaveFund() external nonReentrant {
        require(isMember[msg.sender], "Not a member");
        require(members[msg.sender].isActive, "Member not active");
        
        uint256 stakeAmount = members[msg.sender].stakeAmount;
        
        members[msg.sender].isActive = false;
        isMember[msg.sender] = false;
        totalStaked -= stakeAmount;
        totalMembers--;
        
        (bool success, ) = msg.sender.call{value: stakeAmount}("");
        require(success, "Transfer failed");
        
        emit MemberLeft(msg.sender, stakeAmount);
    }

    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _amount,
        address _recipient
    ) external {
        require(isMember[msg.sender], "Only members can create proposals");
        require(_amount > 0, "Amount must be greater than 0");
        require(_recipient != address(0), "Invalid recipient");
        require(address(this).balance >= _amount, "Insufficient contract balance");
        
        _proposalCounter.increment();
        uint256 proposalId = _proposalCounter.current();
        
        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.proposer = msg.sender;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.amount = _amount;
        newProposal.recipient = _recipient;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + VOTING_DURATION;
        newProposal.executed = false;
        newProposal.cancelled = false;
        
        emit ProposalCreated(proposalId, msg.sender, _title, _amount);
    }

    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 _proposalId, bool _support) external {
        require(isMember[msg.sender], "Only members can vote");
        require(_proposalId > 0 && _proposalId <= _proposalCounter.current(), "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.votesFor += members[msg.sender].stakeAmount;
        } else {
            proposal.votesAgainst += members[msg.sender].stakeAmount;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, members[msg.sender].stakeAmount);
    }

    /**
     * @dev Execute a proposal if it passes
     */
    function executeProposal(uint256 _proposalId) external nonReentrant {
        require(_proposalId > 0 && _proposalId <= _proposalCounter.current(), "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting still active");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal cancelled");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 quorum = (totalStaked * QUORUM_THRESHOLD) / 100;
        
        require(totalVotes >= quorum, "Quorum not met");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");
        
        proposal.executed = true;
        
        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        require(success, "Transfer failed");
        
        emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amount);
    }

    /**
     * @dev Cancel a proposal (only proposer or owner)
     */
    function cancelProposal(uint256 _proposalId) external {
        require(_proposalId > 0 && _proposalId <= _proposalCounter.current(), "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.cancelled, "Proposal already cancelled");
        require(
            msg.sender == proposal.proposer || msg.sender == owner(),
            "Not authorized to cancel"
        );
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(_proposalId);
    }

    /**
     * @dev Deposit funds to the contract
     */
    function depositFunds() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 _proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory title,
        string memory description,
        uint256 amount,
        address recipient,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        bool cancelled
    ) {
        require(_proposalId > 0 && _proposalId <= _proposalCounter.current(), "Invalid proposal ID");
        
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.amount,
            proposal.recipient,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.cancelled
        );
    }

    /**
     * @dev Get total number of proposals
     */
    function getProposalCount() external view returns (uint256) {
        return _proposalCounter.current();
    }

    /**
     * @dev Check if user has voted on a proposal
     */
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        require(_proposalId > 0 && _proposalId <= _proposalCounter.current(), "Invalid proposal ID");
        return proposals[_proposalId].hasVoted[_voter];
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}
