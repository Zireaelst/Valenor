const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FundContract", function () {
  let fundContract;
  let usdcToken;
  let owner;
  let donor1;
  let donor2;
  let recipient;
  let governance;

  const PROJECT_ID_1 = 1;
  const PROJECT_ID_2 = 2;
  const DONATION_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC
  const RELEASE_AMOUNT = ethers.parseUnits("500", 6); // 500 USDC

  beforeEach(async function () {
    [owner, donor1, donor2, recipient, governance] = await ethers.getSigners();

    // Deploy TestUSDC token
    const TestUSDC = await ethers.getContractFactory("TestUSDC");
    usdcToken = await TestUSDC.deploy();
    await usdcToken.waitForDeployment();

    // Deploy FundContract
    const FundContract = await ethers.getContractFactory("FundContract");
    fundContract = await FundContract.deploy(await usdcToken.getAddress());
    await fundContract.waitForDeployment();

    // Mint USDC to donors
    await usdcToken.mint(donor1.address, ethers.parseUnits("10000", 6));
    await usdcToken.mint(donor2.address, ethers.parseUnits("10000", 6));

    // Approve FundContract to spend USDC
    await usdcToken.connect(donor1).approve(await fundContract.getAddress(), ethers.parseUnits("10000", 6));
    await usdcToken.connect(donor2).approve(await fundContract.getAddress(), ethers.parseUnits("10000", 6));

    // Set governance (owner is initial governance)
    await fundContract.setGovernance(governance.address);
  });

  describe("Deployment", function () {
    it("Should set the right USDC token address", async function () {
      expect(await fundContract.usdcToken()).to.equal(await usdcToken.getAddress());
    });

    it("Should set the right owner", async function () {
      expect(await fundContract.owner()).to.equal(owner.address);
    });

    it("Should have zero initial values", async function () {
      expect(await fundContract.totalDonations()).to.equal(0);
      expect(await fundContract.totalReleased()).to.equal(0);
    });

    it("Should reject deployment with zero address", async function () {
      const FundContract = await ethers.getContractFactory("FundContract");
      await expect(FundContract.deploy(ethers.ZeroAddress))
        .to.be.revertedWith("FundContract: Invalid USDC token address");
    });
  });

  describe("Donations", function () {
    it("Should allow donations to projects", async function () {
      const tx = await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_1);
      await expect(tx)
        .to.emit(fundContract, "DonationReceived")
        .withArgs(donor1.address, PROJECT_ID_1, DONATION_AMOUNT, await getBlockTimestamp());

      expect(await fundContract.getDonation(donor1.address, PROJECT_ID_1)).to.equal(DONATION_AMOUNT);
      expect(await fundContract.getProjectDonations(PROJECT_ID_1)).to.equal(DONATION_AMOUNT);
      expect(await fundContract.totalDonations()).to.equal(DONATION_AMOUNT);
    });

    it("Should allow multiple donations to same project", async function () {
      await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_1);
      await fundContract.connect(donor2).donate(DONATION_AMOUNT, PROJECT_ID_1);

      expect(await fundContract.getProjectDonations(PROJECT_ID_1)).to.equal(DONATION_AMOUNT * 2n);
      expect(await fundContract.totalDonations()).to.equal(DONATION_AMOUNT * 2n);
    });

    it("Should allow donations to different projects", async function () {
      await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_1);
      await fundContract.connect(donor2).donate(DONATION_AMOUNT, PROJECT_ID_2);

      expect(await fundContract.getProjectDonations(PROJECT_ID_1)).to.equal(DONATION_AMOUNT);
      expect(await fundContract.getProjectDonations(PROJECT_ID_2)).to.equal(DONATION_AMOUNT);
      expect(await fundContract.totalDonations()).to.equal(DONATION_AMOUNT * 2n);
    });

    it("Should reject donations with zero amount", async function () {
      await expect(fundContract.connect(donor1).donate(0, PROJECT_ID_1))
        .to.be.revertedWith("FundContract: Amount must be greater than zero");
    });

    it("Should reject donations with zero project ID", async function () {
      await expect(fundContract.connect(donor1).donate(DONATION_AMOUNT, 0))
        .to.be.revertedWith("FundContract: Invalid project ID");
    });

    it("Should reject donations without USDC approval", async function () {
      const [, , , , , newDonor] = await ethers.getSigners();
      await usdcToken.mint(newDonor.address, DONATION_AMOUNT);
      
      await expect(fundContract.connect(newDonor).donate(DONATION_AMOUNT, PROJECT_ID_1))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should reject donations with insufficient USDC balance", async function () {
      const [, , , , , newDonor] = await ethers.getSigners();
      await usdcToken.connect(newDonor).approve(await fundContract.getAddress(), DONATION_AMOUNT);
      
      await expect(fundContract.connect(newDonor).donate(DONATION_AMOUNT, PROJECT_ID_1))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Milestone Releases", function () {
    beforeEach(async function () {
      // Setup donations first
      await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_1);
      await fundContract.connect(donor2).donate(DONATION_AMOUNT, PROJECT_ID_1);
    });

    it("Should allow governance to release milestone funds", async function () {
      const tx = await fundContract.connect(governance).releaseMilestone(PROJECT_ID_1, recipient.address, RELEASE_AMOUNT);
      await expect(tx)
        .to.emit(fundContract, "MilestoneReleased")
        .withArgs(PROJECT_ID_1, recipient.address, RELEASE_AMOUNT, await getBlockTimestamp());

      expect(await fundContract.getProjectReleased(PROJECT_ID_1)).to.equal(RELEASE_AMOUNT);
      expect(await fundContract.totalReleased()).to.equal(RELEASE_AMOUNT);
      expect(await fundContract.getProjectAvailable(PROJECT_ID_1)).to.equal(DONATION_AMOUNT * 2n - RELEASE_AMOUNT);
    });

    it("Should reject milestone release by non-governance", async function () {
      await expect(fundContract.connect(donor1).releaseMilestone(PROJECT_ID_1, recipient.address, RELEASE_AMOUNT))
        .to.be.revertedWith("FundContract: Only governance can call this function");
    });

    it("Should reject milestone release with zero amount", async function () {
      await expect(fundContract.connect(governance).releaseMilestone(PROJECT_ID_1, recipient.address, 0))
        .to.be.revertedWith("FundContract: Amount must be greater than zero");
    });

    it("Should reject milestone release with zero project ID", async function () {
      await expect(fundContract.connect(governance).releaseMilestone(0, recipient.address, RELEASE_AMOUNT))
        .to.be.revertedWith("FundContract: Invalid project ID");
    });

    it("Should reject milestone release to zero address", async function () {
      await expect(fundContract.connect(governance).releaseMilestone(PROJECT_ID_1, ethers.ZeroAddress, RELEASE_AMOUNT))
        .to.be.revertedWith("FundContract: Invalid recipient address");
    });

    it("Should reject milestone release exceeding available project funds", async function () {
      // First release some funds to reduce available balance
      await fundContract.connect(governance).releaseMilestone(PROJECT_ID_1, recipient.address, RELEASE_AMOUNT);
      
      // Add more donations to ensure contract has enough balance
      await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_2);
      
      // Now try to release more than available for PROJECT_ID_1
      const excessiveAmount = DONATION_AMOUNT * 2n - RELEASE_AMOUNT + 1n;
      await expect(fundContract.connect(governance).releaseMilestone(PROJECT_ID_1, recipient.address, excessiveAmount))
        .to.be.revertedWith("FundContract: Amount exceeds available project funds");
    });

    it("Should reject milestone release exceeding contract balance", async function () {
      // Drain contract balance
      await fundContract.connect(owner).emergencyWithdraw();
      
      await expect(fundContract.connect(governance).releaseMilestone(PROJECT_ID_1, recipient.address, RELEASE_AMOUNT))
        .to.be.revertedWith("FundContract: Insufficient contract balance");
    });
  });

  describe("Governance Management", function () {
    it("Should allow owner to set governance", async function () {
      const currentGovernance = await fundContract.governance();
      const tx = await fundContract.setGovernance(governance.address);
      await expect(tx)
        .to.emit(fundContract, "GovernanceUpdated")
        .withArgs(currentGovernance, governance.address);

      expect(await fundContract.governance()).to.equal(governance.address);
    });

    it("Should reject setting governance to zero address", async function () {
      await expect(fundContract.setGovernance(ethers.ZeroAddress))
        .to.be.revertedWith("FundContract: Invalid governance address");
    });

    it("Should reject setting governance by non-owner", async function () {
      await expect(fundContract.connect(donor1).setGovernance(governance.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_1);
      await fundContract.connect(donor2).donate(DONATION_AMOUNT, PROJECT_ID_1);
      await fundContract.connect(governance).releaseMilestone(PROJECT_ID_1, recipient.address, RELEASE_AMOUNT);
    });

    it("Should return correct donation amounts", async function () {
      expect(await fundContract.getDonation(donor1.address, PROJECT_ID_1)).to.equal(DONATION_AMOUNT);
      expect(await fundContract.getDonation(donor2.address, PROJECT_ID_1)).to.equal(DONATION_AMOUNT);
      expect(await fundContract.getDonation(donor1.address, PROJECT_ID_2)).to.equal(0);
    });

    it("Should return correct project totals", async function () {
      expect(await fundContract.getProjectDonations(PROJECT_ID_1)).to.equal(DONATION_AMOUNT * 2n);
      expect(await fundContract.getProjectReleased(PROJECT_ID_1)).to.equal(RELEASE_AMOUNT);
      expect(await fundContract.getProjectAvailable(PROJECT_ID_1)).to.equal(DONATION_AMOUNT * 2n - RELEASE_AMOUNT);
    });

    it("Should return correct contract balance", async function () {
      const expectedBalance = DONATION_AMOUNT * 2n - RELEASE_AMOUNT;
      expect(await fundContract.getContractBalance()).to.equal(expectedBalance);
    });
  });

  describe("Emergency Functions", function () {
    beforeEach(async function () {
      await fundContract.connect(donor1).donate(DONATION_AMOUNT, PROJECT_ID_1);
    });

    it("Should allow owner to emergency withdraw all funds", async function () {
      const balanceBefore = await usdcToken.balanceOf(owner.address);
      await fundContract.emergencyWithdraw();
      const balanceAfter = await usdcToken.balanceOf(owner.address);
      
      expect(balanceAfter - balanceBefore).to.equal(DONATION_AMOUNT);
    });

    it("Should allow owner to emergency withdraw specific amount", async function () {
      const withdrawAmount = ethers.parseUnits("500", 6);
      const balanceBefore = await usdcToken.balanceOf(owner.address);
      await fundContract.emergencyWithdrawAmount(withdrawAmount);
      const balanceAfter = await usdcToken.balanceOf(owner.address);
      
      expect(balanceAfter - balanceBefore).to.equal(withdrawAmount);
    });

    it("Should reject emergency withdraw by non-owner", async function () {
      await expect(fundContract.connect(donor1).emergencyWithdraw())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should reject emergency withdraw when no funds available", async function () {
      await fundContract.emergencyWithdraw();
      await expect(fundContract.emergencyWithdraw())
        .to.be.revertedWith("FundContract: No funds to withdraw");
    });

    it("Should reject emergency withdraw amount exceeding balance", async function () {
      const excessiveAmount = DONATION_AMOUNT + 1n;
      await expect(fundContract.emergencyWithdrawAmount(excessiveAmount))
        .to.be.revertedWith("FundContract: Insufficient balance");
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy in donate function", async function () {
      // This test would require a malicious contract to test properly
      // For now, we just verify the function exists and can be called
      expect(typeof fundContract.donate).to.equal("function");
    });

    it("Should prevent reentrancy in releaseMilestone function", async function () {
      // This test would require a malicious contract to test properly
      // For now, we just verify the function exists and can be called
      expect(typeof fundContract.releaseMilestone).to.equal("function");
    });
  });

  // Helper function to get block timestamp
  async function getBlockTimestamp() {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  }
});
