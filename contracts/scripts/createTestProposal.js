const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Creating Test Proposal");
  console.log("=========================");

  try {
    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log("Signer address:", signer.address);

    // Contract addresses
    const governanceAddress = "0x952B2FCDc797A800C3cE83373441E02a6f7866cc";
    
    // Get the GovernanceContract instance
    const GovernanceContract = await ethers.getContractFactory("GovernanceContract");
    const governance = GovernanceContract.attach(governanceAddress);

    // Proposal details
    const description = "Test Proposal for Education Initiative - Fund new learning materials and teacher training programs";
    const projectId = 1; // Education Initiative
    const amount = ethers.parseUnits("1000", 6); // 1000 USDC
    const recipient = "0x364438D7b53337422e26D94534fCBDF01a6b17F2"; // Your address

    console.log("\n📋 Proposal Details:");
    console.log("Description:", description);
    console.log("Project ID:", projectId);
    console.log("Amount:", ethers.formatUnits(amount, 6), "USDC");
    console.log("Recipient:", recipient);

    // Create the proposal
    console.log("\n🔄 Creating proposal...");
    const tx = await governance.createProposal(description, projectId, amount, recipient);
    console.log("Transaction hash:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Block number:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());

    // Get the next proposal ID to see if our proposal was created
    const nextProposalId = await governance.nextProposalId();
    console.log("Next proposal ID:", nextProposalId.toString());
    
    if (nextProposalId > 0) {
      const proposalId = nextProposalId - 1n;
      console.log("\n📊 Created Proposal ID:", proposalId.toString());
      
      // Get proposal details
      const proposal = await governance.proposals(proposalId);
      console.log("Proposal details:");
      console.log("- Description:", proposal[0]);
      console.log("- Project ID:", proposal[1].toString());
      console.log("- Amount:", ethers.formatUnits(proposal[2], 6), "USDC");
      console.log("- Recipient:", proposal[3]);
      console.log("- Votes For:", ethers.formatUnits(proposal[4], 6), "USDC");
      console.log("- Votes Against:", ethers.formatUnits(proposal[5], 6), "USDC");
      console.log("- Deadline:", new Date(Number(proposal[6]) * 1000).toISOString());
      console.log("- Executed:", proposal[7]);
      console.log("- Proposer:", proposal[8]);
    }

    console.log("\n🎉 Test proposal created successfully!");

  } catch (error) {
    console.error("\n❌ Error creating proposal:");
    console.error(error);
    
    if (error.message.includes("insufficient voting power")) {
      console.error("💡 Tip: You need to make donations first to get voting power");
    } else if (error.message.includes("insufficient funds")) {
      console.error("💡 Tip: Make sure you have enough ETH for gas fees");
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
