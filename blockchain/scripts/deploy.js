// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const PatentRegistry = await hre.ethers.getContractFactory("PatentRegistry");
  const registry = await PatentRegistry.deploy();
  // await registry.deployed(); // Not needed in Hardhat v6+
  console.log("PatentRegistry deployed to:", registry.target || registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
