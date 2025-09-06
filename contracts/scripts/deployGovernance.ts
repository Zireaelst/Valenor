import { ethers } from "hardhat";

async function main() {
  console.log("Deploying GovernanceContract...");

  // Check if FUND_CONTRACT_ADDRESS is provided in environment
  const fundContractAddress = process.env.FUND_CONTRACT_ADDRESS;
  if (!fundContractAddress) {
    throw new Error("FUND_CONTRACT_ADDRESS not found in environment variables. Please set it in your .env file.");
  }

  console.log("Using FundContract address:", fundContractAddress);

  // Get the contract factory
  const GovernanceContract = await ethers.getContractFactory("GovernanceContract");

  // Deploy the contract with FundContract address
  const governanceContract = await GovernanceContract.deploy(fundContractAddress);

  // Wait for deployment to complete
  await governanceContract.waitForDeployment();

  const contractAddress = await governanceContract.getAddress();
  
  console.log("GovernanceContract deployed to:", contractAddress);
  console.log("Deployment completed successfully!");

  // Verify contract on Etherscan if API key is provided
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await governanceContract.deploymentTransaction()?.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [fundContractAddress],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  // Display contract information
  console.log("\n=== Contract Information ===");
  console.log("Contract Address:", contractAddress);
  console.log("FundContract Address:", await governanceContract.fundContract());
  console.log("Owner:", await governanceContract.owner());
  console.log("Voting Period:", await governanceContract.VOTING_PERIOD());
  console.log("Min Proposal Amount:", ethers.formatUnits(await governanceContract.MIN_PROPOSAL_AMOUNT(), 6), "USDC");
  console.log("Min Voting Power:", ethers.formatUnits(await governanceContract.MIN_VOTING_POWER(), 6), "USDC");

  // Test basic functionality
  console.log("\n=== Testing Contract ===");
  try {
    const [owner] = await ethers.getSigners();
    
    // Check FundContract details
    const fundContract = await ethers.getContractAt("FundContract", fundContractAddress);
    const fundOwner = await fundContract.owner();
    const currentGovernance = await fundContract.governance();
    
    console.log("FundContract Details:");
    console.log("- Owner:", fundOwner);
    console.log("- Current Governance:", currentGovernance);
    
    // Test governance functions
    console.log("Testing governance functions...");
    const proposalCount = await governanceContract.getProposalCount();
    console.log("Current proposal count:", proposalCount);
    
  } catch (error) {
    console.log("Error testing contract:", error);
  }

  // Set governance in FundContract
  console.log("\n=== Setting Governance ===");
  try {
    const [owner] = await ethers.getSigners();
    const fundContract = await ethers.getContractAt("FundContract", fundContractAddress);
    
    // Check if we need to set governance
    const currentGovernance = await fundContract.governance();
    if (currentGovernance !== contractAddress) {
      console.log("Setting governance in FundContract...");
      const tx = await fundContract.setGovernance(contractAddress);
      await tx.wait();
      console.log("Governance set successfully!");
      
      // Verify the change
      const newGovernance = await fundContract.governance();
      console.log("New governance address:", newGovernance);
    } else {
      console.log("Governance already set correctly.");
    }
  } catch (error) {
    console.log("Error setting governance:", error);
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Update your .env file with GOVERNANCE_CONTRACT_ADDRESS:", contractAddress);
  console.log("2. Test proposal creation functionality");
  console.log("3. Test voting functionality");
  console.log("4. Test proposal execution functionality");
  console.log("5. Update frontend with contract address");

  console.log("\n=== Environment Variables to Add ===");
  console.log("GOVERNANCE_CONTRACT_ADDRESS=" + contractAddress);

  console.log("\n=== Integration Example ===");
  console.log("// Create a proposal");
  console.log(`await governanceContract.createProposal("Fund project development", 1, ethers.parseUnits("1000", 6), recipientAddress);`);
  console.log("");
  console.log("// Vote on a proposal");
  console.log(`await governanceContract.vote(0, true); // true for yes, false for no`);
  console.log("");
  console.log("// Execute a proposal (after voting period ends)");
  console.log(`await governanceContract.executeProposal(0);`);

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\nDeployment script completed successfully!");
    console.log("GovernanceContract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
