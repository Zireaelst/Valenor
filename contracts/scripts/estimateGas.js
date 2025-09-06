const { ethers } = require("hardhat");

async function main() {
  console.log("=== Gas Estimation ===\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Network:", hre.network.name);
  console.log();

  try {
    // Get current gas price
    const gasPrice = await ethers.provider.getFeeData();
    console.log("Current gas price:", ethers.formatUnits(gasPrice.gasPrice, "gwei"), "gwei");
    console.log();

    // Estimate deployment gas
    const ValenorSocialFund = await ethers.getContractFactory("ValenorSocialFund");
    const deploymentGas = await ValenorSocialFund.getDeployTransaction().then(tx => 
      ethers.provider.estimateGas(tx)
    );

    console.log("Estimated deployment gas:", deploymentGas.toString());
    
    // Calculate deployment cost
    const deploymentCost = deploymentGas * gasPrice.gasPrice;
    const deploymentCostInEth = ethers.formatEther(deploymentCost);
    
    console.log("Estimated deployment cost:", deploymentCostInEth, "ETH");
    console.log();

    // Check if account has enough balance
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log("Account balance:", balanceInEth, "ETH");
    
    if (deploymentCost > balance) {
      console.log("❌ Insufficient balance for deployment!");
      console.log("Need at least:", deploymentCostInEth, "ETH");
      console.log("Missing:", ethers.formatEther(deploymentCost - balance), "ETH");
    } else {
      console.log("✅ Sufficient balance for deployment");
      console.log("Remaining after deployment:", ethers.formatEther(balance - deploymentCost), "ETH");
    }

  } catch (error) {
    console.error("Error estimating gas:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
