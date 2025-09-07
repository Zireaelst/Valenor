const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Governance Setup");
  console.log("===========================");

  try {
    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Contract addresses
    const fundAddress = "0x534d7313353445378519286b81d8B9Ff4084d0e9";
    const governanceAddress = "0x420A19BD1C52F01127006D643Cc788439C2557A6";
    
    // Get contract instances
    const FundContract = await ethers.getContractFactory("FundContract");
    const fund = FundContract.attach(fundAddress);
    
    // Check governance address
    const currentGovernance = await fund.governance();
    console.log("\n📊 Current Setup:");
    console.log("FundContract address:", fundAddress);
    console.log("Current governance:", currentGovernance);
    console.log("Expected governance:", governanceAddress);

    if (currentGovernance.toLowerCase() !== governanceAddress.toLowerCase()) {
      console.log("\n❌ Governance mismatch!");
      console.log("Setting correct governance...");
      
      const tx = await fund.setGovernance(governanceAddress);
      await tx.wait();
      
      const newGovernance = await fund.governance();
      console.log("\n✅ Governance updated!");
      console.log("New governance:", newGovernance);
    } else {
      console.log("\n✅ Governance setup is correct!");
    }

  } catch (error) {
    console.error("\n❌ Error checking governance:");
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
