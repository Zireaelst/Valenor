const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestUSDC", function () {
  let testUSDC;
  let owner;
  let addr1;
  let addr2;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDC
  const MINT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const TestUSDC = await ethers.getContractFactory("TestUSDC");
    testUSDC = await TestUSDC.deploy();
    await testUSDC.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await testUSDC.owner()).to.equal(owner.address);
    });

    it("Should have correct token details", async function () {
      expect(await testUSDC.name()).to.equal("Test USDC");
      expect(await testUSDC.symbol()).to.equal("tUSDC");
      expect(await testUSDC.decimals()).to.equal(6);
    });

    it("Should mint initial supply to owner", async function () {
      expect(await testUSDC.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await testUSDC.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await expect(testUSDC.mint(addr1.address, MINT_AMOUNT))
        .to.emit(testUSDC, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, MINT_AMOUNT);

      expect(await testUSDC.balanceOf(addr1.address)).to.equal(MINT_AMOUNT);
    });

    it("Should reject minting by non-owner", async function () {
      await expect(
        testUSDC.connect(addr1).mint(addr2.address, MINT_AMOUNT)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow batch minting", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [MINT_AMOUNT, MINT_AMOUNT];

      await testUSDC.mintBatch(recipients, amounts);

      expect(await testUSDC.balanceOf(addr1.address)).to.equal(MINT_AMOUNT);
      expect(await testUSDC.balanceOf(addr2.address)).to.equal(MINT_AMOUNT);
    });

    it("Should reject batch minting with mismatched arrays", async function () {
      const recipients = [addr1.address, addr2.address];
      const amounts = [MINT_AMOUNT]; // Different length

      await expect(
        testUSDC.mintBatch(recipients, amounts)
      ).to.be.revertedWith("TestUSDC: Arrays length mismatch");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await testUSDC.mint(addr1.address, MINT_AMOUNT);
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.parseUnits("100", 6);
      
      await expect(testUSDC.connect(addr1).burn(burnAmount))
        .to.emit(testUSDC, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, burnAmount);

      expect(await testUSDC.balanceOf(addr1.address)).to.equal(MINT_AMOUNT - burnAmount);
    });

    it("Should allow owner to burn from any address", async function () {
      const burnAmount = ethers.parseUnits("100", 6);
      
      // First approve the owner to spend tokens
      await testUSDC.connect(addr1).approve(owner.address, burnAmount);
      
      await expect(testUSDC.burnFrom(addr1.address, burnAmount))
        .to.emit(testUSDC, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, burnAmount);

      expect(await testUSDC.balanceOf(addr1.address)).to.equal(MINT_AMOUNT - burnAmount);
    });

    it("Should reject burning more than balance", async function () {
      const burnAmount = MINT_AMOUNT + 1n;
      
      await expect(
        testUSDC.connect(addr1).burn(burnAmount)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await testUSDC.mint(addr1.address, MINT_AMOUNT);
    });

    it("Should allow standard ERC20 transfers", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      
      await expect(testUSDC.connect(addr1).transfer(addr2.address, transferAmount))
        .to.emit(testUSDC, "Transfer")
        .withArgs(addr1.address, addr2.address, transferAmount);

      expect(await testUSDC.balanceOf(addr1.address)).to.equal(MINT_AMOUNT - transferAmount);
      expect(await testUSDC.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should allow approved transfers", async function () {
      const transferAmount = ethers.parseUnits("100", 6);
      
      await testUSDC.connect(addr1).approve(addr2.address, transferAmount);
      
      await expect(testUSDC.connect(addr2).transferFrom(addr1.address, addr2.address, transferAmount))
        .to.emit(testUSDC, "Transfer")
        .withArgs(addr1.address, addr2.address, transferAmount);

      expect(await testUSDC.balanceOf(addr1.address)).to.equal(MINT_AMOUNT - transferAmount);
      expect(await testUSDC.balanceOf(addr2.address)).to.equal(transferAmount);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to transfer ownership", async function () {
      await testUSDC.transferOwnership(addr1.address);
      expect(await testUSDC.owner()).to.equal(addr1.address);
    });

    it("Should reject non-owner from transferring ownership", async function () {
      await expect(
        testUSDC.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
