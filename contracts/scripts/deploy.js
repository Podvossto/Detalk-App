const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with ${deployer.address} on ${hre.network.name}`);

  const token = await hre.ethers.deployContract("TokenContract");
  await token.waitForDeployment();

  const chat = await hre.ethers.deployContract("ChatContract", [
    await token.getAddress(),
  ]);
  await chat.waitForDeployment();

  await (await token.setMinter(await chat.getAddress())).wait();

  console.log("\nAdd these to the frontend .env.local:\n");
  console.log(`VITE_CHAT_CONTRACT_ADDRESS=${await chat.getAddress()}`);
  console.log(`VITE_TOKEN_CONTRACT_ADDRESS=${await token.getAddress()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
