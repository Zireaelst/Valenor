const { ethers } = require("hardhat");

async function main() {
  console.log("=== Account Balance Check ===\n");

  const [deployer] = await ethers.getSigners();
  const address = deployer.address;
  
  console.log("Account:", address);
  console.log("Network:", hre.network.name);
  
  try {
    const balance = await ethers.provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("Balance:", balanceInEth, "ETH");
    
    if (balance === 0n) {
      console.log("\n⚠️  WARNING: Account has no ETH!");
      console.log("Get testnet ETH from:");
      console.log("- https://sepoliafaucet.com/");
      console.log("- https://faucets.chain.link/sepolia");
    } else if (ethers.parseEther("0.01") > balance) {
      console.log("\n⚠️  WARNING: Low balance! Consider getting more testnet ETH.");
    } else {
      console.log("\n✅ Account has sufficient balance for deployment.");
    }
    
  } catch (error) {
    console.error("Error checking balance:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
