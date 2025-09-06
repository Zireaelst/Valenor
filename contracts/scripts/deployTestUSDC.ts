import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TestUSDC...");

  // Get the contract factory
  const TestUSDC = await ethers.getContractFactory("TestUSDC");

  // Deploy the contract
  const testUSDC = await TestUSDC.deploy();

  // Wait for deployment to complete
  await testUSDC.waitForDeployment();

  const contractAddress = await testUSDC.getAddress();
  
  console.log("TestUSDC deployed to:", contractAddress);
  console.log("Deployment completed successfully!");

  // Verify contract on Etherscan if API key is provided
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await testUSDC.deploymentTransaction()?.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }

  // Display contract information
  console.log("\n=== Contract Information ===");
  console.log("Contract Address:", contractAddress);
  console.log("Name:", await testUSDC.name());
  console.log("Symbol:", await testUSDC.symbol());
  console.log("Decimals:", await testUSDC.decimals());
  console.log("Total Supply:", ethers.formatUnits(await testUSDC.totalSupply(), 6));
  console.log("Owner:", await testUSDC.owner());

  // Test basic functionality
  console.log("\n=== Testing Contract ===");
  try {
    const [owner, addr1] = await ethers.getSigners();
    const ownerBalance = await testUSDC.balanceOf(owner.address);
    console.log("Owner balance:", ethers.formatUnits(ownerBalance, 6), "USDC");
    
    // Test minting to a new address
    const mintAmount = ethers.parseUnits("1000", 6);
    await testUSDC.mint(addr1.address, mintAmount);
    const addr1Balance = await testUSDC.balanceOf(addr1.address);
    console.log("Test mint successful. Address 1 balance:", ethers.formatUnits(addr1Balance, 6), "USDC");
  } catch (error) {
    console.log("Error testing contract:", error);
  }

  console.log("\n=== Next Steps ===");
  console.log("1. Update your other contracts with this USDC address:", contractAddress);
  console.log("2. Use this address as USDC_TOKEN_ADDRESS in your .env file");
  console.log("3. Test token transfers and approvals");
  console.log("4. Deploy other contracts that depend on this USDC token");

  return contractAddress;
}

main()
  .then((address) => {
    console.log("\nDeployment script completed successfully!");
    console.log("TestUSDC address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
