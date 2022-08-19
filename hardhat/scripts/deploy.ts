import { ethers } from "hardhat";

async function main() {
  const aggreggatorAddress = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada" //MUMBAI
  const CustomFeeCollector = await ethers.getContractFactory("customFeeCollector");
  const customFeeCollector = await CustomFeeCollector.deploy(aggreggatorAddress);

  await customFeeCollector.deployed();

  console.log(`customFeeCollector deployed to ${customFeeCollector.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
