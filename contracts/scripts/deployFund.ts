import { ethers } from "hardhat";

async function main() {
  console.log("Deploying FundContract...");

  // Check if USDC_ADDRESS is provided in environment
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;
  if (!usdcAddress) {
    throw new Error("USDC_TOKEN_ADDRESS not found in environment variables. Please set it in your .env file.");
  }

  console.log("Using USDC token address:", usdcAddress);

  // Get the contract factory
  const FundContract = await ethers.getContractFactory("FundContract");

  // Deploy the contract with USDC address
  const fundContract = await FundContract.deploy(usdcAddress);

  // Wait for deployment to complete
  await fundContract.waitForDeployment();

  const contractAddress = await fundContract.getAddress();
  
  console.log("FundContract deployed to:", contractAddress);
  console.log("Deployment completed successfully!");

  // Verify contract on Etherscan if API key is provided
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await fundContract.deploymentTransaction()?.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [usdcAddress],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  // Display contract information
  console.log("\n=== Contract Information ===");
  console.log("Contract Address:", contractAddress);
  console.log("USDC Token Address:", await fundContract.usdcToken());
  console.log("Owner:", await fundContract.owner());
  console.log("Governance:", await fundContract.governance());
  console.log("Total Donations:", await fundContract.totalDonations());
  console.log("Total Released:", await fundContract.totalReleased());

  // Test basic functionality
  console.log("\n=== Testing Contract ===");
  try {
    const [owner] = await ethers.getSigners();
    
    // Check USDC token details (try TestUSDC interface first, fallback to ERC20)
    try {
      const usdcToken = await ethers.getContractAt("TestUSDC", usdcAddress);
      const tokenName = await usdcToken.name();
      const tokenSymbol = await usdcToken.symbol();
      const tokenDecimals = await usdcToken.decimals();
      
      console.log("USDC Token Details:");
      console.log("- Name:", tokenName);
      console.log("- Symbol:", tokenSymbol);
      console.log("- Decimals:", tokenDecimals);
      
      // Check contract balance
      const contractBalance = await fundContract.getContractBalance();
      console.log("Contract USDC Balance:", ethers.formatUnits(contractBalance, tokenDecimals), tokenSymbol);
    } catch (tokenError) {
      console.log("Could not get token details (using ERC20 interface):", tokenError.message);
      
      // Fallback to basic ERC20 interface
      const usdcToken = await ethers.getContractAt("IERC20", usdcAddress);
      const contractBalance = await fundContract.getContractBalance();
      console.log("Contract USDC Balance:", ethers.formatUnits(contractBalance, 6), "USDC");
    }
    
    // Test governance functions
    console.log("Testing governance functions...");
    const currentGovernance = await fundContract.governance();
    console.log("Current governance:", currentGovernance);
    
  } catch (error) {
    console.log("Error testing contract:", error);
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Update your .env file with FUND_CONTRACT_ADDRESS:", contractAddress);
  console.log("2. Deploy governance contract and set it as governance");
  console.log("3. Test donation functionality");
  console.log("4. Test milestone release functionality");
  console.log("5. Update frontend with contract address");

  console.log("\n=== Environment Variables to Add ===");
  console.log("FUND_CONTRACT_ADDRESS=" + contractAddress);

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\nDeployment script completed successfully!");
    console.log("FundContract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
