const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ValenorSocialFund", function () {
  let valenorFund;
  let owner;
  let member1;
  let member2;
  let nonMember;

  const MINIMUM_STAKE = ethers.parseEther("0.1");
  const VOTING_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function () {
    [owner, member1, member2, nonMember] = await ethers.getSigners();
    
    const ValenorSocialFund = await ethers.getContractFactory("ValenorSocialFund");
    valenorFund = await ValenorSocialFund.deploy();
    await valenorFund.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await valenorFund.owner()).to.equal(owner.address);
    });

    it("Should have correct initial values", async function () {
      expect(await valenorFund.MINIMUM_STAKE()).to.equal(MINIMUM_STAKE);
      expect(await valenorFund.totalMembers()).to.equal(0);
      expect(await valenorFund.totalStaked()).to.equal(0);
    });
  });

  describe("Joining the Fund", function () {
    it("Should allow users to join with minimum stake", async function () {
      await expect(valenorFund.connect(member1).joinFund({ value: MINIMUM_STAKE }))
        .to.emit(valenorFund, "MemberJoined")
        .withArgs(member1.address, MINIMUM_STAKE);

      expect(await valenorFund.isMember(member1.address)).to.be.true;
      expect(await valenorFund.totalMembers()).to.equal(1);
      expect(await valenorFund.totalStaked()).to.equal(MINIMUM_STAKE);
    });

    it("Should reject joining with insufficient stake", async function () {
      await expect(
        valenorFund.connect(member1).joinFund({ value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Insufficient stake amount");
    });

    it("Should reject joining if already a member", async function () {
      await valenorFund.connect(member1).joinFund({ value: MINIMUM_STAKE });
      
      await expect(
        valenorFund.connect(member1).joinFund({ value: MINIMUM_STAKE })
      ).to.be.revertedWith("Already a member");
    });
  });

  describe("Leaving the Fund", function () {
    beforeEach(async function () {
      await valenorFund.connect(member1).joinFund({ value: MINIMUM_STAKE });
    });

    it("Should allow members to leave and withdraw stake", async function () {
      const initialBalance = await ethers.provider.getBalance(member1.address);
      
      await expect(valenorFund.connect(member1).leaveFund())
        .to.emit(valenorFund, "MemberLeft")
        .withArgs(member1.address, MINIMUM_STAKE);

      expect(await valenorFund.isMember(member1.address)).to.be.false;
      expect(await valenorFund.totalMembers()).to.equal(0);
      expect(await valenorFund.totalStaked()).to.equal(0);
    });

    it("Should reject leaving if not a member", async function () {
      await expect(
        valenorFund.connect(nonMember).leaveFund()
      ).to.be.revertedWith("Not a member");
    });
  });

  describe("Proposal Creation", function () {
    beforeEach(async function () {
      await valenorFund.connect(member1).joinFund({ value: MINIMUM_STAKE });
      await valenorFund.connect(owner).depositFunds({ value: ethers.parseEther("1") });
    });

    it("Should allow members to create proposals", async function () {
      const title = "Test Proposal";
      const description = "This is a test proposal";
      const amount = ethers.parseEther("0.5");
      const recipient = member2.address;

      await expect(
        valenorFund.connect(member1).createProposal(title, description, amount, recipient)
      ).to.emit(valenorFund, "ProposalCreated")
        .withArgs(1, member1.address, title, amount);

      const proposal = await valenorFund.getProposal(1);
      expect(proposal.proposer).to.equal(member1.address);
      expect(proposal.title).to.equal(title);
      expect(proposal.amount).to.equal(amount);
      expect(proposal.recipient).to.equal(recipient);
    });

    it("Should reject proposal creation by non-members", async function () {
      await expect(
        valenorFund.connect(nonMember).createProposal(
          "Test", "Description", ethers.parseEther("0.1"), member2.address
        )
      ).to.be.revertedWith("Only members can create proposals");
    });

    it("Should reject proposal with insufficient contract balance", async function () {
      await expect(
        valenorFund.connect(member1).createProposal(
          "Test", "Description", ethers.parseEther("2"), member2.address
        )
      ).to.be.revertedWith("Insufficient contract balance");
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      await valenorFund.connect(member1).joinFund({ value: MINIMUM_STAKE });
      await valenorFund.connect(member2).joinFund({ value: MINIMUM_STAKE });
      await valenorFund.connect(owner).depositFunds({ value: ethers.parseEther("1") });

      await valenorFund.connect(member1).createProposal(
        "Test Proposal", "Description", ethers.parseEther("0.5"), nonMember.address
      );
      proposalId = 1;
    });

    it("Should allow members to vote", async function () {
      await expect(valenorFund.connect(member1).vote(proposalId, true))
        .to.emit(valenorFund, "VoteCast")
        .withArgs(proposalId, member1.address, true, MINIMUM_STAKE);

      expect(await valenorFund.hasVoted(proposalId, member1.address)).to.be.true;
    });

    it("Should reject voting by non-members", async function () {
      await expect(
        valenorFund.connect(nonMember).vote(proposalId, true)
      ).to.be.revertedWith("Only members can vote");
    });

    it("Should reject double voting", async function () {
      await valenorFund.connect(member1).vote(proposalId, true);
      
      await expect(
        valenorFund.connect(member1).vote(proposalId, false)
      ).to.be.revertedWith("Already voted");
    });
  });

  describe("Proposal Execution", function () {
    let proposalId;

    beforeEach(async function () {
      await valenorFund.connect(member1).joinFund({ value: MINIMUM_STAKE });
      await valenorFund.connect(member2).joinFund({ value: MINIMUM_STAKE });
      await valenorFund.connect(owner).depositFunds({ value: ethers.parseEther("1") });

      await valenorFund.connect(member1).createProposal(
        "Test Proposal", "Description", ethers.parseEther("0.5"), nonMember.address
      );
      proposalId = 1;
    });

    it("Should execute proposal after voting period with majority support", async function () {
      // Vote for the proposal
      await valenorFund.connect(member1).vote(proposalId, true);
      await valenorFund.connect(member2).vote(proposalId, true);

      // Fast forward time to end voting period
      await ethers.provider.send("evm_increaseTime", [VOTING_DURATION + 1]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await ethers.provider.getBalance(nonMember.address);

      await expect(valenorFund.executeProposal(proposalId))
        .to.emit(valenorFund, "ProposalExecuted")
        .withArgs(proposalId, nonMember.address, ethers.parseEther("0.5"));

      const finalBalance = await ethers.provider.getBalance(nonMember.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("0.5"));
    });

    it("Should reject execution before voting period ends", async function () {
      await valenorFund.connect(member1).vote(proposalId, true);
      
      await expect(
        valenorFund.executeProposal(proposalId)
      ).to.be.revertedWith("Voting still active");
    });
  });
});
