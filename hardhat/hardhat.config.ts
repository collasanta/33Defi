require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')
require('dotenv').config()

module.exports = {
  solidity: {
  compilers: [
    {
      version: "0.7.6"
    },
    {
      version: "0.8.0"
    },
    {
      version: "0.7.5"
    },
    {
      version: "0.8.7"
    }
  ]
},
  networks: {
    hardhat:{
      forking:{
        url: process.env.POLYGON_MUMBAI_RPC_PROVIDER
      }
    },
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_PROVIDER,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    },
    // polygon: {
    //   url: process.env.POLYGON_MAINNET_RPC_PROVIDER,
    //   accounts:
    //     process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []
    // }
  },

  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      // rinkeby: process.env.RINKEBY_API_KEY
    }
  }
}

export {};