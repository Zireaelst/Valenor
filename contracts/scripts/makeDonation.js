const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Making Test Donation");
  console.log("=======================");

  try {
    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Contract addresses
    const usdcAddress = "0x249Cd8D3C907ae0565C0Fd1f335b098f5b85121A";
    const fundAddress = "0x534d7313353445378519286b81d8B9Ff4084d0e9";
    
    // Get contract instances
    const TestUSDC = await ethers.getContractFactory("TestUSDC");
    const usdc = TestUSDC.attach(usdcAddress);
    
    const FundContract = await ethers.getContractFactory("FundContract");
    const fund = FundContract.attach(fundAddress);

    // Check USDC balance
    const balance = await usdc.balanceOf(signer.address);
    console.log("\n📊 Current Balances:");
    console.log("USDC Balance:", ethers.formatUnits(balance, 6), "USDC");

    // Check current allowance
    const currentAllowance = await usdc.allowance(signer.address, fundAddress);
    console.log("Current Allowance:", ethers.formatUnits(currentAllowance, 6), "USDC");

    // Donation details - donate to all 4 projects
    const donationAmount = ethers.parseUnits("300", 6); // 300 USDC per project
    const projectIds = [1, 2, 3, 4]; // All 4 projects

    // First approve if needed
    if (currentAllowance < donationAmount * BigInt(projectIds.length)) {
      console.log("\n🔄 Approving USDC...");
      const approveAmount = ethers.parseUnits("2000", 6); // 2000 USDC total
      const approveTx = await usdc.approve(fundAddress, approveAmount);
      await approveTx.wait();
      console.log("✅ USDC approved!");

      const newAllowance = await usdc.allowance(signer.address, fundAddress);
      console.log("New Allowance:", ethers.formatUnits(newAllowance, 6), "USDC");
    }

    // Make donations to each project
    console.log("\n📋 Making Donations:");
    for (const projectId of projectIds) {
      // Check current donation for this project
      const currentDonation = await fund.getDonation(signer.address, projectId);
      console.log(`\nProject ${projectId} current donation:`, ethers.formatUnits(currentDonation, 6), "USDC");

      if (currentDonation < donationAmount) {
        console.log(`🔄 Donating to Project ${projectId}...`);
        console.log("Amount:", ethers.formatUnits(donationAmount - currentDonation, 6), "USDC");
        
        const tx = await fund.donate(donationAmount - currentDonation, projectId);
        console.log("Transaction hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("✅ Donation confirmed!");
        console.log("Gas used:", receipt.gasUsed.toString());

        const newDonation = await fund.getDonation(signer.address, projectId);
        console.log("New donation amount:", ethers.formatUnits(newDonation, 6), "USDC");
      } else {
        console.log("✅ Already donated enough to this project");
      }
    }

    // Check final voting power
    const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
    const governance = GovernanceContract.attach("0x420A19BD1C52F01127006D643Cc788439C2557A6");
    
    const votingPower = await governance.getVotingPower(signer.address);
    console.log("\n📊 Final Voting Power:", ethers.formatUnits(votingPower, 6), "USDC");

    const minVotingPower = await governance.minVotingPowerToPropose();
    console.log("Min Required Power:", ethers.formatUnits(minVotingPower, 6), "USDC");

    if (votingPower >= minVotingPower) {
      console.log("✅ You now have enough voting power to create proposals!");
    } else {
      console.log("❌ Still need more voting power to create proposals.");
      console.log("Need", ethers.formatUnits(minVotingPower - votingPower, 6), "more USDC in donations.");
    }

  } catch (error) {
    console.error("\n❌ Error making donation:");
    console.error(error);
    
    if (error.message.includes("insufficient allowance")) {
      console.error("\n💡 Tip: Need to approve USDC first");
    } else if (error.message.includes("insufficient funds")) {
      console.error("\n💡 Tip: Not enough USDC balance");
    }
  }
}

main()
  .then(() => {
    console.log("\nScript completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });