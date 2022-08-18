import { expect } from "chai"
import { ethers } from "hardhat"
import { MentoraSwap } from "../typechain-types/contracts/mentoraSwap.sol/MentoraSwap"
import { WMATIC } from "../typechain-types/contracts/WMATIC"
import { FMWP } from "../typechain-types/contracts/FMWP"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"

const { BigNumber: BN } = ethers
const MWP = "0xd2B2Ad7252AA2f633223c9863dd979772E7FB416"
const WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"

describe("Mentora Swap", () => {
  let swapContract:any
  let mwp:any
  let wmatic: any
  let owner: SignerWithAddress, addr1: SignerWithAddress, addr2: SignerWithAddress, addr3: SignerWithAddress
  const deadline = (Math.floor(Date.now() / 1000 + 1800))
  const poolFee = 3000
  const prov = ethers.getDefaultProvider(); 

  before(async () => {
    ;[owner, addr1, addr2, addr3] = await ethers.getSigners()
    wmatic = await ethers.getContractAt("IWMATIC", WMATIC)
    mwp = await ethers.getContractAt("MentoraWellPlayedToken", MWP)
    const SwapContract = await ethers.getContractFactory("mentoraSwap")
    swapContract = await SwapContract.deploy("0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada")
    await swapContract.deployed()
  })

  describe("SWAP Functions", () => {
    it.only("MATICtoMWP", async () => {
      const initialMaticBalance = await prov.getBalance(owner.address);
      const sendMaticAmount = {value: ethers.utils.parseEther("1")}
      const minAmountOut = 0 
      await swapContract.connect(owner).MaticToMwp(deadline,minAmountOut,poolFee, sendMaticAmount)
      const finalMWPBalance = await mwp.balanceOf(owner.address)
      const finalMaticBalance = await prov.getBalance(owner.address);
      expect(finalMWPBalance).to.gt(0)
      console.log("finalMaticBalance", finalMaticBalance)
      console.log("initialMaticBalance", initialMaticBalance)
      console.log("finalMaticBalance.sub(initialMaticBalance)", finalMaticBalance.sub(initialMaticBalance))

      expect(finalMaticBalance.sub(initialMaticBalance)).closeTo(ethers.utils.parseEther("1").toNumber(), 10000)
    })
  
    
    it("MWPtoMATIC", async () => {
      
      const balance = await prov.getBalance(owner.address);
      console.log("Saldo Matic pré swap: ",balance)
      const amountMWP = await mwp.balanceOf(owner.address)
      await mwp.connect(owner).approve(swapContract.address, amountMWP)
      await swapContract.connect(owner).MwpToMatic(ethers.utils.parseEther("30"), (Math.floor(Date.now() / 1000 + 1800)), 0, 3000)
      const amountMWPB = await mwp.balanceOf(owner.address)
      console.log("Saldo novo: ", (amountMWPB.sub(amountMWP)))
      console.log("Saldo pré swap MWP: ",amountMWP)
      console.log("Saldo pós swap: ",amountMWPB)
      const balance2 = await prov.getBalance(owner.address);
      console.log("Saldo Matic pós swap: ",balance2)
    })

  })




})
