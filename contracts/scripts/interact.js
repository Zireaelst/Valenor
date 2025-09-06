const hre = require("hardhat");
const { ethers } = hre;

const CONTRACT = process.env.CONTRACT_ADDRESS || "0x0AD6E1db1D5d4470270a66cbEB081d23E612b3B7"; // .env'ye ekleyebilirsin

async function main() {
  const [signer] = await ethers.getSigners();
  const c = await ethers.getContractAt("EthVault", CONTRACT, signer);
  
  // Get arguments from environment or hardcoded for testing
  const cmd = process.env.INTERACT_CMD || "balance";
  const arg = process.env.INTERACT_ARG || "";

  if (cmd === "deposit") {
    const tx = await c.deposit({ value: ethers.parseEther(arg) });
    await tx.wait();
    console.log("deposited", arg);
  } else if (cmd === "withdraw") {
    const tx = await c.withdraw(ethers.parseEther(arg));
    await tx.wait();
    console.log("withdrew", arg);
  } else if (cmd === "balance") {
    const user = arg || await signer.getAddress();
    const bal = await c.getBalanceOf(user);
    console.log("balance (wei):", bal.toString());
  } else {
    console.log("usage: deposit <eth> | withdraw <eth> | balance [addr]");
  }
}

main().catch(console.error);
