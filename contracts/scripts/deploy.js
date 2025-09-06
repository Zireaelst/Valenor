const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Valenor Social Fund...");

  // Get the contract factory
  const ValenorSocialFund = await ethers.getContractFactory("ValenorSocialFund");

  // Deploy the contract
  const valenorFund = await ValenorSocialFund.deploy();

  // Wait for deployment to complete
  await valenorFund.waitForDeployment();

  const contractAddress = await valenorFund.getAddress();
  
  console.log("Valenor Social Fund deployed to:", contractAddress);
  console.log("Deployment completed successfully!");

  // Verify contract on BaseScan if API key is provided
  if (process.env.BASESCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await valenorFund.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on BaseScan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
