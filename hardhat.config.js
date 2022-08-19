require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy"); // refer to the npm documentation to properly set this package up
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.9",
  solidity: {
    compilers: [{ version: "0.8.9" }, { version: "0.6.6" }],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      chainId: 4,
      accounts: [process.env.PRIVATE_KEY],
      blockConfirmations: 6,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COIN_MARKET_CAP_KEY,
  },
  namedAccounts: {
    //this gets a hold of the accounts you set in the "networks" object in this config file
    deployer: {
      default: 0, //position 0 of the accounts array in the "networks" object
    },
    users: {
      default: 0,
    },
  },
};
