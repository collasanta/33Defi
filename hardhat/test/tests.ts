import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai";
import { ethers } from "hardhat";

const MWP = "0xd2B2Ad7252AA2f633223c9863dd979772E7FB416"
const WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"

describe("Tests", function () {
  let swapContract:any
  let wmatic:any
  let mwp:any
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress
  let addr3: SignerWithAddress
  let addr4: SignerWithAddress
  const prov = ethers.getDefaultProvider(); 

  before(async () => {
    ;[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners()
    wmatic = await ethers.getContractAt("WMATIC", WMATIC)
    mwp = await ethers.getContractAt("IERC20", MWP)
    const SwapContract = await ethers.getContractFactory("customFeeCollector")
    
    swapContract = await SwapContract.deploy("0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada")
    await swapContract.deployed()
    console.log("customFeeColletor deployed to:", swapContract.address)
  })

  describe("SWAP Functions", () => {

    it("MATICtoMWP", async () => {
        console.log("MWP balance 0", await mwp.balanceOf(owner.address))
        const sendMatic = {value: ethers.utils.parseEther("1")}
        await swapContract.connect(owner).MaticToMwp((Math.floor(Date.now() / 1000 + 1800)),0,3000, sendMatic)
        console.log("swap done")
        console.log("MWP balance 1", await mwp.balanceOf(owner.address))

      })


    it("MWPtoMATIC", async () => {
      const amountMWP = await mwp.balanceOf(owner.address)
      console.log("saldo MWP pre swap", amountMWP)
      await mwp.connect(owner).approve(swapContract.address, amountMWP)
      await swapContract.connect(owner).MwpToMatic(ethers.utils.parseEther("100"), (Math.floor(Date.now() / 1000 + 1800)), 0, 3000)
      const amountMWPB = await mwp.balanceOf(owner.address)
      console.log("Saldo MWP pós swap: ",amountMWPB)
    })

  })



})
