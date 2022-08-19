import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import 'dotenv/config';

const config: HardhatUserConfig = {
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
      },
      {
        version: "0.4.18"
      }
    ]
  },
    networks: {
      hardhat:{
        forking:{
          url: process.env.POLYGON_MUMBAI_RPC_PROVIDER!,
          blockNumber: 27649548 // LOCKING/CACHING THE BLOCK NUMBER WILL INCREASE SPEED THE VELOCITY OF TESTS UP TO 20X
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
        polygonMumbai: process.env.POLYGONSCAN_API_KEY!,
        // rinkeby: process.env.RINKEBY_API_KEY
      }
    }
};

export default config;
