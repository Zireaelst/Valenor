const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Voting Power");
  console.log("========================");

  try {
    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log("Address:", signer.address);

    // Contract addresses
    const fundAddress = "0x534d7313353445378519286b81d8B9Ff4084d0e9";
    const governanceAddress = "0x49cbb6E45f8869ca48537EE162159A3b8FF1Ea86";
    
    // Get contract instances
    const FundContract = await ethers.getContractFactory("FundContract");
    const fund = FundContract.attach(fundAddress);
    
    const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
    const governance = GovernanceContract.attach(governanceAddress);

    // Check donations for each project
    console.log("\n📊 Donations per Project:");
    let totalDonations = 0n;
    for (let i = 1; i <= 4; i++) {
      const donation = await fund.getDonation(signer.address, i);
      console.log(`Project ${i}: ${ethers.formatUnits(donation, 6)} USDC`);
      totalDonations += donation;
    }
    console.log("\nTotal Donations:", ethers.formatUnits(totalDonations, 6), "USDC");

    // Check voting power
    const votingPower = await governance.getVotingPower(signer.address);
    console.log("Voting Power:", ethers.formatUnits(votingPower, 6), "USDC");

    // Check minimum requirements
    const minVotingPower = await governance.minVotingPowerToPropose();
    console.log("Min Required:", ethers.formatUnits(minVotingPower, 6), "USDC");

    if (votingPower >= minVotingPower) {
      console.log("\n✅ You have enough voting power to create proposals!");
    } else {
      const needed = minVotingPower - votingPower;
      console.log("\n❌ Not enough voting power.");
      console.log("Need", ethers.formatUnits(needed, 6), "more USDC in donations.");
    }

  } catch (error) {
    console.error("\n❌ Error checking voting power:");
    console.error(error);
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