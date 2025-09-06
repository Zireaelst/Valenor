const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovernanceContract", function () {
  let governanceContract;
  let fundContract;
  let usdcToken;
  let owner;
  let donor1;
  let donor2;
  let donor3;
  let recipient;

  const PROJECT_ID_1 = 1;
  const PROJECT_ID_2 = 2;
  const DONATION_AMOUNT = ethers.parseUnits("5000", 6); // 5000 USDC
  const PROPOSAL_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC
  const VOTING_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    [owner, donor1, donor2, donor3, recipient] = await ethers.getSigners();

    // Deploy TestUSDC token
    const TestUSDC = await ethers.getContractFactory("TestUSDC");
    usdcToken = await TestUSDC.deploy();
    await usdcToken.waitForDeployment();

    // Deploy FundContract
    const FundContract = await ethers.getContractFactory("FundContract");
    fundContract = await FundContract.deploy(await usdcToken.getAddress());
    await fundContract.waitForDeployment();

    // Deploy GovernanceContract
    const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
    governanceContract = await GovernanceContract.deploy(await fundContract.getAddress());
    await governanceContract.waitForDeployment();

    // Set governance in FundContract
    await fundContract.setGovernance(await governanceContract.getAddress());

    // Mint USDC to donors
    await usdcToken.mint(donor1.address, ethers.parseUnits("10000", 6));
    await usdcToken.mint(donor2.address, ethers.parseUnits("10000", 6));
    await usdcToken.mint(donor3.address, ethers.parseUnits("10000", 6));

    // Approve FundContract to spend USDC
    await usdcToken.connect(donor1).approve(await fundContract.getAddress(), ethers.parseUnits("10000", 6));
    await usdcToken.connect(donor2).approve(await fundContract.getAddress(), ethers.parseUnits("10000", 6));
    await usdcToken.connect(donor3).approve(await fundContract.getAddress(), ethers.parseUnits("10000", 6));

    // Make donations to create voting power
    await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_1);
    await fundContract.connect(donor2).donate(DONATION_AMOUNT, PROJECT_ID_1);
    await fundContract.connect(donor3).donate(DONATION_AMOUNT, PROJECT_ID_2);
  });

  describe("Deployment", function () {
    it("Should set the right FundContract address", async function () {
      expect(await governanceContract.fundContract()).to.equal(await fundContract.getAddress());
    });

    it("Should set the right owner", async function () {
      expect(await governanceContract.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      expect(await governanceContract.VOTING_PERIOD()).to.equal(VOTING_PERIOD);
      expect(await governanceContract.MIN_PROPOSAL_AMOUNT()).to.equal(ethers.parseUnits("100", 6));
      expect(await governanceContract.MIN_VOTING_POWER()).to.equal(ethers.parseUnits("1000", 6));
    });

    it("Should reject deployment with zero address", async function () {
      const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
      await expect(GovernanceContract.deploy(ethers.ZeroAddress))
        .to.be.revertedWith("GovernanceContract: Invalid FundContract address");
    });
  });

  describe("Voting Power", function () {
    it("Should calculate voting power based on donations", async function () {
      const votingPower1 = await governanceContract.getVotingPower(donor1.address);
      const votingPower2 = await governanceContract.getVotingPower(donor2.address);
      const votingPower3 = await governanceContract.getVotingPower(donor3.address);

      expect(votingPower1).to.equal(DONATION_AMOUNT);
      expect(votingPower2).to.equal(DONATION_AMOUNT);
      expect(votingPower3).to.equal(DONATION_AMOUNT);
    });

    it("Should return zero voting power for non-donors", async function () {
      const votingPower = await governanceContract.getVotingPower(recipient.address);
      expect(votingPower).to.equal(0);
    });
  });

  describe("Proposal Creation", function () {
    it("Should allow creating proposals with sufficient voting power", async function () {
      const tx = await governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        recipient.address
      );
      
      await expect(tx)
        .to.emit(governanceContract, "ProposalCreated")
        .withArgs(
          0,
          donor1.address,
          "Fund project development",
          PROJECT_ID_1,
          PROPOSAL_AMOUNT,
          recipient.address,
          await getBlockTimestamp() + VOTING_PERIOD
        );

      const proposal = await governanceContract.getProposal(0);
      expect(proposal.description).to.equal("Fund project development");
      expect(proposal.targetProjectId).to.equal(PROJECT_ID_1);
      expect(proposal.amount).to.equal(PROPOSAL_AMOUNT);
      expect(proposal.recipient).to.equal(recipient.address);
      expect(proposal.proposer).to.equal(donor1.address);
    });

    it("Should reject proposal creation with insufficient voting power", async function () {
      await expect(governanceContract.connect(recipient).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        recipient.address
      ))
        .to.be.revertedWith("GovernanceContract: Insufficient voting power");
    });

    it("Should reject proposal with empty description", async function () {
      await expect(governanceContract.connect(donor1).createProposal(
        "",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        recipient.address
      ))
        .to.be.revertedWith("GovernanceContract: Description cannot be empty");
    });

    it("Should reject proposal with zero project ID", async function () {
      await expect(governanceContract.connect(donor1).createProposal(
        "Fund project development",
        0,
        PROPOSAL_AMOUNT,
        recipient.address
      ))
        .to.be.revertedWith("GovernanceContract: Invalid project ID");
    });

    it("Should reject proposal with amount below minimum", async function () {
      const minAmount = await governanceContract.MIN_PROPOSAL_AMOUNT();
      await expect(governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        minAmount - 1n,
        recipient.address
      ))
        .to.be.revertedWith("GovernanceContract: Amount below minimum");
    });

    it("Should reject proposal with zero recipient address", async function () {
      await expect(governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        ethers.ZeroAddress
      ))
        .to.be.revertedWith("GovernanceContract: Invalid recipient address");
    });

    it("Should reject proposal exceeding available project funds", async function () {
      // First create a proposal and execute it to reduce available funds
      await governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        recipient.address
      );
      
      // Vote to pass the proposal
      await governanceContract.connect(donor1).vote(0, true);
      await governanceContract.connect(donor2).vote(0, true);

      // Fast forward time to end voting period
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine");

      // Execute the proposal
      await governanceContract.executeProposal(0);

      // Now try to create a proposal that exceeds available funds
      const excessiveAmount = DONATION_AMOUNT * 2n - PROPOSAL_AMOUNT + 1n;
      await expect(governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        excessiveAmount,
        recipient.address
      ))
        .to.be.revertedWith("GovernanceContract: Amount exceeds available project funds");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Create a proposal
      await governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        recipient.address
      );
    });

    it("Should allow voting on proposals", async function () {
      await expect(governanceContract.connect(donor1).vote(0, true))
        .to.emit(governanceContract, "Voted")
        .withArgs(0, donor1.address, true, DONATION_AMOUNT);

      const proposal = await governanceContract.getProposal(0);
      expect(proposal.votesFor).to.equal(DONATION_AMOUNT);
      expect(proposal.votesAgainst).to.equal(0);
    });

    it("Should allow voting against proposals", async function () {
      await expect(governanceContract.connect(donor1).vote(0, false))
        .to.emit(governanceContract, "Voted")
        .withArgs(0, donor1.address, false, DONATION_AMOUNT);

      const proposal = await governanceContract.getProposal(0);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(DONATION_AMOUNT);
    });

    it("Should reject voting by non-voters", async function () {
      await expect(governanceContract.connect(recipient).vote(0, true))
        .to.be.revertedWith("GovernanceContract: No voting power");
    });

    it("Should reject double voting", async function () {
      await governanceContract.connect(donor1).vote(0, true);
      await expect(governanceContract.connect(donor1).vote(0, false))
        .to.be.revertedWith("GovernanceContract: Already voted");
    });

    it("Should reject voting on invalid proposal", async function () {
      await expect(governanceContract.connect(donor1).vote(999, true))
        .to.be.revertedWith("GovernanceContract: Invalid proposal ID");
    });

    it("Should reject voting on executed proposal", async function () {
      // Vote to pass the proposal
      await governanceContract.connect(donor1).vote(0, true);
      await governanceContract.connect(donor2).vote(0, true);

      // Fast forward time to end voting period
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine");

      // Execute the proposal
      await governanceContract.executeProposal(0);

      // Try to vote on executed proposal
      await expect(governanceContract.connect(donor3).vote(0, true))
        .to.be.revertedWith("GovernanceContract: Proposal already executed");
    });

    it("Should reject voting after deadline", async function () {
      // Fast forward time past deadline
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine");

      await expect(governanceContract.connect(donor1).vote(0, true))
        .to.be.revertedWith("GovernanceContract: Voting period ended");
    });
  });

  describe("Proposal Execution", function () {
    beforeEach(async function () {
      // Create a proposal
      await governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        recipient.address
      );
    });

    it("Should execute passed proposals", async function () {
      // Vote to pass the proposal
      await governanceContract.connect(donor1).vote(0, true);
      await governanceContract.connect(donor2).vote(0, true);

      // Fast forward time to end voting period
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine");

      // Execute the proposal
      await expect(governanceContract.executeProposal(0))
        .to.emit(governanceContract, "ProposalExecuted")
        .withArgs(0, PROJECT_ID_1, recipient.address, PROPOSAL_AMOUNT);

      const proposal = await governanceContract.getProposal(0);
      expect(proposal.executed).to.be.true;
    });

    it("Should reject execution of failed proposals", async function () {
      // Vote against the proposal
      await governanceContract.connect(donor1).vote(0, false);
      await governanceContract.connect(donor2).vote(0, false);

      // Fast forward time to end voting period
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine");

      await expect(governanceContract.executeProposal(0))
        .to.be.revertedWith("GovernanceContract: Proposal not passed");
    });

    it("Should reject execution before deadline", async function () {
      // Vote to pass the proposal
      await governanceContract.connect(donor1).vote(0, true);
      await governanceContract.connect(donor2).vote(0, true);

      await expect(governanceContract.executeProposal(0))
        .to.be.revertedWith("GovernanceContract: Voting period not ended");
    });

    it("Should reject execution of already executed proposals", async function () {
      // Vote to pass the proposal
      await governanceContract.connect(donor1).vote(0, true);
      await governanceContract.connect(donor2).vote(0, true);

      // Fast forward time to end voting period
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine");

      // Execute the proposal
      await governanceContract.executeProposal(0);

      // Try to execute again
      await expect(governanceContract.executeProposal(0))
        .to.be.revertedWith("GovernanceContract: Proposal already executed");
    });

    it("Should reject execution of invalid proposals", async function () {
      await expect(governanceContract.executeProposal(999))
        .to.be.revertedWith("GovernanceContract: Invalid proposal ID");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Create multiple proposals
      await governanceContract.connect(donor1).createProposal(
        "Fund project development",
        PROJECT_ID_1,
        PROPOSAL_AMOUNT,
        recipient.address
      );
      await governanceContract.connect(donor2).createProposal(
        "Fund project marketing",
        PROJECT_ID_2,
        PROPOSAL_AMOUNT,
        recipient.address
      );
    });

    it("Should return correct proposal count", async function () {
      expect(await governanceContract.getProposalCount()).to.equal(2);
    });

    it("Should return correct proposal details", async function () {
      const proposal = await governanceContract.getProposal(0);
      expect(proposal.description).to.equal("Fund project development");
      expect(proposal.targetProjectId).to.equal(PROJECT_ID_1);
      expect(proposal.amount).to.equal(PROPOSAL_AMOUNT);
      expect(proposal.recipient).to.equal(recipient.address);
    });

    it("Should return correct proposal state", async function () {
      expect(await governanceContract.getProposalState(0)).to.equal("Active");
    });

    it("Should return correct voting statistics", async function () {
      await governanceContract.connect(donor1).vote(0, true);
      await governanceContract.connect(donor2).vote(0, false);

      const [votesFor, votesAgainst, totalVotes] = await governanceContract.getVotingStats(0);
      expect(votesFor).to.equal(DONATION_AMOUNT);
      expect(votesAgainst).to.equal(DONATION_AMOUNT);
      expect(totalVotes).to.equal(DONATION_AMOUNT * 2n);
    });

    it("Should return correct proposal passed status", async function () {
      await governanceContract.connect(donor1).vote(0, true);
      await governanceContract.connect(donor2).vote(0, false);

      expect(await governanceContract.proposalPassed(0)).to.be.false;

      // Add more votes for
      await governanceContract.connect(donor3).vote(0, true);
      expect(await governanceContract.proposalPassed(0)).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to call owner functions", async function () {
      // These functions currently revert with "not implemented" but should not revert with access control errors
      await expect(governanceContract.emergencyPause())
        .to.be.revertedWith("GovernanceContract: Emergency pause not implemented");
      
      await expect(governanceContract.updateMinProposalAmount(ethers.parseUnits("200", 6)))
        .to.be.revertedWith("GovernanceContract: Update minimum amount not implemented");
    });

    it("Should reject non-owner from calling owner functions", async function () {
      await expect(governanceContract.connect(donor1).emergencyPause())
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(governanceContract.connect(donor1).updateMinProposalAmount(ethers.parseUnits("200", 6)))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // Helper function to get block timestamp
  async function getBlockTimestamp() {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  }
});
