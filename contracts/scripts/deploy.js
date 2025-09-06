const { ethers } = require("hardhat");

async function main() {
  console.log("\n🚀 EthVault Deployment Script");
  console.log("==============================");

  // Get the contract factory
  const Contract = await ethers.getContractFactory("EthVault");
  
  // Deploy the contract
  console.log("\n📦 Deploying EthVault...");
  const contract = await Contract.deploy();
  
  // Wait for deployment to complete
  await contract.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await contract.getAddress();
  
  console.log("\n✅ EthVault deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", (await ethers.getSigners())[0].address);
  
  // Optional: Get some contract info
  try {
    const deployerBalance = await contract.getBalanceOf((await ethers.getSigners())[0].address);
    const contractBalance = await ethers.provider.getBalance(contractAddress);
    
    console.log("\n📊 Contract Information:");
    console.log("Deployer Balance in Vault:", ethers.formatEther(deployerBalance), "ETH");
    console.log("Contract ETH Balance:", ethers.formatEther(contractBalance), "ETH");
  } catch (error) {
    console.log("Note: Could not retrieve contract info");
  }
  
  console.log("\n🎉 Deployment completed successfully!");
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed!");
    console.error("Error:", error);
    process.exit(1);
  });