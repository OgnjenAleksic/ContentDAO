const { network } = require("hardhat");
const { localNetworks } = require("../helper.hardhat.config");

const decimals = 8;
const initialAnswer = 200000000000;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;

  if (localNetworks.includes(network.name)) {
    log("Local network detected, deploying Mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      args: [decimals, initialAnswer],
      log: true,
    });
    log("Mocks deployed!");
    log(
      "--------------------------------------------------------------------------------------------------"
    );
  }
};

module.exports.tags = ["all", "mocks"];
