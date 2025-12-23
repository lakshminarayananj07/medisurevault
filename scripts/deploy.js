const hre = require("hardhat");

async function main() {
  console.log("Deploying MediSure Contract...");

  // 1. Get the Contract Factory
  const MediSure = await hre.ethers.getContractFactory("MediSure");

  // 2. Deploy the Contract
  const medisure = await MediSure.deploy();

  // 3. Wait for deployment to finish
  await medisure.waitForDeployment();

  const address = await medisure.getAddress();
  
  console.log("----------------------------------------------------");
  console.log(`✅ MediSure deployed successfully!`);
  console.log(`📍 Contract Address: ${address}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});