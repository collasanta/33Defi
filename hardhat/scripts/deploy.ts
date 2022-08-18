import { ethers } from "hardhat";
import "@nomiclabs/hardhat-ethers";

async function main() {

  const MentoraSwap = await ethers.getContractFactory("mentoraSwap");
  const mentoraSwap = await MentoraSwap.deploy();

  await mentoraSwap.deployed();

  console.log("mentoraSWAP deployed to:", mentoraSwap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
