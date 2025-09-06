const { ethers } = require("hardhat");

async function main() {
  // Get recipient and amount from environment variables or command line
  const recipient = process.env.FAUCET_RECIPIENT || "0x364438D7b53337422e26D94534fCBDF01a6b17F2";
  const amount = process.env.FAUCET_AMOUNT || "1000";
  
  console.log("Using recipient:", recipient);
  console.log("Using amount:", amount);

  // Validate recipient address
  if (!ethers.isAddress(recipient)) {
    console.error("Error: Invalid recipient address");
    process.exit(1);
  }

  // Validate amount
  const amountNumber = parseFloat(amount);
  if (isNaN(amountNumber) || amountNumber <= 0) {
    console.error("Error: Amount must be a positive number");
    process.exit(1);
  }

  console.log("🚰 TestUSDC Faucet Script");
  console.log("==========================");
  console.log("Recipient:", recipient);
  console.log("Amount:", amount, "USDC");

  try {
    // Get the deployed TestUSDC contract
    const testUSDCAddress = process.env.USDC_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    if (!testUSDCAddress) {
      console.error("Error: USDC_TOKEN_ADDRESS not found in environment variables");
      console.error("Please set USDC_TOKEN_ADDRESS in your .env file");
      process.exit(1);
    }

    console.log("TestUSDC Contract Address:", testUSDCAddress);

    // Get the contract instance
    const TestUSDC = await ethers.getContractFactory("TestUSDC");
    const testUSDC = TestUSDC.attach(testUSDCAddress);

    // Get the signer (faucet operator)
    const [signer] = await ethers.getSigners();
    console.log("Faucet Operator:", signer.address);

    // Check if signer is the owner
    const owner = await testUSDC.owner();
    if (signer.address.toLowerCase() !== owner.toLowerCase()) {
      console.error("Error: Only the contract owner can mint tokens");
      console.error("Current owner:", owner);
      console.error("Your address:", signer.address);
      process.exit(1);
    }

    // Get balance before minting
    console.log("\n📊 Balance Check (Before)");
    console.log("=========================");
    const balanceBefore = await testUSDC.balanceOf(recipient);
    const formattedBalanceBefore = ethers.formatUnits(balanceBefore, 6);
    console.log("Recipient balance:", formattedBalanceBefore, "USDC");

    // Convert amount to wei (6 decimals for USDC)
    const mintAmount = ethers.parseUnits(amount, 6);
    console.log("Mint amount (wei):", mintAmount.toString());

    // Check total supply before
    const totalSupplyBefore = await testUSDC.totalSupply();
    const formattedTotalSupplyBefore = ethers.formatUnits(totalSupplyBefore, 6);
    console.log("Total supply:", formattedTotalSupplyBefore, "USDC");

    // Perform the mint transaction
    console.log("\n🔄 Minting Tokens...");
    console.log("===================");
    const tx = await testUSDC.mint(recipient, mintAmount);
    console.log("Transaction hash:", tx.hash);
    console.log("Waiting for confirmation...");

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Block number:", receipt?.blockNumber);
    console.log("Gas used:", receipt?.gasUsed.toString());

    // Get balance after minting
    console.log("\n📊 Balance Check (After)");
    console.log("========================");
    const balanceAfter = await testUSDC.balanceOf(recipient);
    const formattedBalanceAfter = ethers.formatUnits(balanceAfter, 6);
    console.log("Recipient balance:", formattedBalanceAfter, "USDC");

    // Check total supply after
    const totalSupplyAfter = await testUSDC.totalSupply();
    const formattedTotalSupplyAfter = ethers.formatUnits(totalSupplyAfter, 6);
    console.log("Total supply:", formattedTotalSupplyAfter, "USDC");

    // Calculate the difference
    const balanceDifference = balanceAfter - balanceBefore;
    const formattedDifference = ethers.formatUnits(balanceDifference, 6);
    console.log("Balance increase:", formattedDifference, "USDC");

    const supplyDifference = totalSupplyAfter - totalSupplyBefore;
    const formattedSupplyDifference = ethers.formatUnits(supplyDifference, 6);
    console.log("Supply increase:", formattedSupplyDifference, "USDC");

    // Verify the mint was successful
    if (balanceDifference === mintAmount) {
      console.log("\n✅ Faucet operation successful!");
      console.log("Tokens minted successfully to recipient");
    } else {
      console.log("\n❌ Faucet operation failed!");
      console.log("Expected increase:", ethers.formatUnits(mintAmount, 6), "USDC");
      console.log("Actual increase:", formattedDifference, "USDC");
    }

    // Display summary
    console.log("\n📋 Summary");
    console.log("==========");
    console.log("Recipient:", recipient);
    console.log("Amount minted:", amount, "USDC");
    console.log("Transaction hash:", tx.hash);
    console.log("New balance:", formattedBalanceAfter, "USDC");
    console.log("New total supply:", formattedTotalSupplyAfter, "USDC");

  } catch (error) {
    console.error("\n❌ Faucet operation failed!");
    console.error("Error:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("insufficient funds")) {
        console.error("💡 Tip: Make sure you have enough ETH for gas fees");
      } else if (error.message.includes("nonce")) {
        console.error("💡 Tip: Try again in a few seconds (nonce issue)");
      } else if (error.message.includes("gas")) {
        console.error("💡 Tip: Gas limit might be too low, try increasing it");
      }
    }
    
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Faucet script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
