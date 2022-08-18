import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {
  const aggreggatorAddress = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada" //MUMBAI
  const MentoraSwap = await ethers.getContractFactory("mentoraSwap");
  const mentoraSwap = await MentoraSwap.deploy(aggreggatorAddress);

  await mentoraSwap.deployed();

  console.log("mentoraSWAP deployed to:", mentoraSwap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
