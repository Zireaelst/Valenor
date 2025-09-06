const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EthVault", function () {
  let ethVault;
  let owner;
  let user1;
  let user2;

  const DEPOSIT_AMOUNT = ethers.parseEther("0.1"); // 0.1 ETH
  const WITHDRAW_AMOUNT = ethers.parseEther("0.05"); // 0.05 ETH

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy EthVault
    const EthVault = await ethers.getContractFactory("EthVault");
    ethVault = await EthVault.deploy();
    await ethVault.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await ethVault.getAddress()).to.be.properAddress;
    });

    it("Should have zero initial balances", async function () {
      expect(await ethVault.getBalanceOf(owner.address)).to.equal(0);
      expect(await ethVault.getBalanceOf(user1.address)).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should allow ETH deposits", async function () {
      const tx = await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      
      await expect(tx)
        .to.emit(ethVault, "Deposited")
        .withArgs(user1.address, DEPOSIT_AMOUNT);

      expect(await ethVault.getBalanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT);
      expect(await ethVault.balances(user1.address)).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should allow multiple deposits from same user", async function () {
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });

      const expectedBalance = DEPOSIT_AMOUNT * 2n;
      expect(await ethVault.getBalanceOf(user1.address)).to.equal(expectedBalance);
    });

    it("Should allow deposits from different users", async function () {
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      await ethVault.connect(user2).deposit({ value: DEPOSIT_AMOUNT });

      expect(await ethVault.getBalanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT);
      expect(await ethVault.getBalanceOf(user2.address)).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should reject deposits with zero value", async function () {
      await expect(ethVault.connect(user1).deposit({ value: 0 }))
        .to.be.revertedWith("zero value");
    });

    it("Should handle receive() function for direct ETH transfers", async function () {
      const tx = await user1.sendTransaction({
        to: await ethVault.getAddress(),
        value: DEPOSIT_AMOUNT
      });

      await expect(tx)
        .to.emit(ethVault, "Deposited")
        .withArgs(user1.address, DEPOSIT_AMOUNT);

      expect(await ethVault.getBalanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Setup deposits first
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      await ethVault.connect(user2).deposit({ value: DEPOSIT_AMOUNT });
    });

    it("Should allow withdrawals", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      
      const tx = await ethVault.connect(user1).withdraw(WITHDRAW_AMOUNT);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      await expect(tx)
        .to.emit(ethVault, "Withdrawn")
        .withArgs(user1.address, WITHDRAW_AMOUNT);

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      const expectedBalance = balanceBefore + WITHDRAW_AMOUNT - gasUsed;
      
      expect(await ethVault.getBalanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT - WITHDRAW_AMOUNT);
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001")); // Allow for gas variance
    });

    it("Should allow full balance withdrawal", async function () {
      await ethVault.connect(user1).withdraw(DEPOSIT_AMOUNT);
      expect(await ethVault.getBalanceOf(user1.address)).to.equal(0);
    });

    it("Should reject withdrawals exceeding balance", async function () {
      const excessiveAmount = DEPOSIT_AMOUNT + 1n;
      await expect(ethVault.connect(user1).withdraw(excessiveAmount))
        .to.be.revertedWith("insufficient");
    });

    it("Should reject withdrawals with zero amount", async function () {
      await expect(ethVault.connect(user1).withdraw(0))
        .to.be.revertedWith("zero amount");
    });

    it("Should not affect other users' balances", async function () {
      await ethVault.connect(user1).withdraw(WITHDRAW_AMOUNT);
      expect(await ethVault.getBalanceOf(user2.address)).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Contract Balance", function () {
    it("Should track contract ETH balance correctly", async function () {
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      await ethVault.connect(user2).deposit({ value: DEPOSIT_AMOUNT });

      const contractBalance = await ethers.provider.getBalance(await ethVault.getAddress());
      expect(contractBalance).to.equal(DEPOSIT_AMOUNT * 2n);
    });

    it("Should reduce contract balance after withdrawal", async function () {
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      
      const balanceBefore = await ethers.provider.getBalance(await ethVault.getAddress());
      await ethVault.connect(user1).withdraw(WITHDRAW_AMOUNT);
      const balanceAfter = await ethers.provider.getBalance(await ethVault.getAddress());

      expect(balanceAfter).to.equal(balanceBefore - WITHDRAW_AMOUNT);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple rapid deposits and withdrawals", async function () {
      // Multiple deposits
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });

      expect(await ethVault.getBalanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT * 3n);

      // Multiple withdrawals
      await ethVault.connect(user1).withdraw(WITHDRAW_AMOUNT);
      await ethVault.connect(user1).withdraw(WITHDRAW_AMOUNT);

      expect(await ethVault.getBalanceOf(user1.address)).to.equal(DEPOSIT_AMOUNT * 3n - WITHDRAW_AMOUNT * 2n);
    });

    it("Should handle receive() with zero value", async function () {
      await expect(user1.sendTransaction({
        to: await ethVault.getAddress(),
        value: 0
      })).to.be.revertedWith("zero value");
    });
  });

  describe("Gas Optimization", function () {
    it("Should use reasonable gas for deposits", async function () {
      const tx = await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      const receipt = await tx.wait();
      
      // Gas should be reasonable (less than 100k)
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });

    it("Should use reasonable gas for withdrawals", async function () {
      await ethVault.connect(user1).deposit({ value: DEPOSIT_AMOUNT });
      
      const tx = await ethVault.connect(user1).withdraw(WITHDRAW_AMOUNT);
      const receipt = await tx.wait();
      
      // Gas should be reasonable (less than 100k)
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });
  });
});
