require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const PRIVATE_KEY_DEPLOYER = process.env.PRIVATE_KEY_DEPLOYER || "";
const PRIVATE_KEY_CREATOR = process.env.PRIVATE_KEY_CREATOR || "";
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      chainId: 5,
      accounts: [PRIVATE_KEY_DEPLOYER, PRIVATE_KEY_CREATOR],
    },
    localHost: {
      url: "http://127.0.0.1:8545/",
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    creator: {
      default: 1,
    },
  },

  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    currency: "USD",
  },

  solidity: {
    compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
  },
};
