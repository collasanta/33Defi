const { expect } = require("chai")
const { ethers } = require("hardhat")

const MWP = "0xd2B2Ad7252AA2f633223c9863dd979772E7FB416"
const WMATIC = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"


describe("Mentora Swap", () => {
  let swapContract:any
  let accounts:any
  let wmatic:any
  let mwp:any

  before(async () => {
    accounts = await ethers.getSigners(1)

    wmatic = await ethers.getContractAt("IWMATIC", WMATIC)
    mwp = await ethers.getContractAt("IERC20", MWP)

    const SwapContract = await ethers.getContractFactory("mentoraSwap")
    swapContract = await SwapContract.deploy("0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada")
    await swapContract.deployed()
    console.log("mentoraSwap deployed at:", swapContract.address)
  })

  it("MATICtoMWP", async () => {
    console.log("starting SWAP MATICtoMWP")
    

    console.log("MWP balance 0", await mwp.balanceOf(accounts[0].address))
    const sendMatic = {value: ethers.utils.parseEther("200")}
    await swapContract.connect(accounts[0]).MaticToMwp((Math.floor(Date.now() / 1000 + 1800)),0,3000, sendMatic)
    console.log("swap done")
    console.log("MWP balance 1", await mwp.balanceOf(accounts[0].address))
  })

  
  it("MWPtoMATIC", async () => {
    const prov = ethers.getDefaultProvider(); 
    const balance = await prov.getBalance(accounts[0].address);
    console.log("Saldo Matic pré swap: ",balance)

    const amountMWP = await mwp.balanceOf(accounts[0].address)
    await mwp.connect(accounts[0]).approve(swapContract.address, amountMWP)
    await swapContract.connect(accounts[0]).MwpToMatic(ethers.utils.parseEther("30"), (Math.floor(Date.now() / 1000 + 1800)), 0, 3000)
    const amountMWPB = await mwp.balanceOf(accounts[0].address)
    console.log("Saldo novo: ", (amountMWPB - amountMWP))
    console.log("Saldo pré swap MWP: ",amountMWP)
    console.log("Saldo pós swap: ",amountMWPB)
    const balance2 = await prov.getBalance(accounts[0].address);
    console.log("Saldo Matic pós swap: ",balance2)

  })

})

export {}