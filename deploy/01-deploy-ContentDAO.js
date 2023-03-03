const { network, deployments } = require("hardhat");
const { localNetworks, realNetworks } = require("../helper.hardhat.config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer, creator } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const chainId = network.config.chainId;

  let aggregatorAddress;

  if (localNetworks.includes(network.name)) {
    const waitAggregatorAddress = await deployments.get("MockV3Aggregator");
    aggregatorAddress = waitAggregatorAddress.address;
  } else {
    aggregatorAddress = realNetworks[chainId]["ETHtoUSDAggregatorAddress"];
  }
  log("Deploying ContentDAO");
  const tx = await deploy("ContentDAO", {
    from: deployer,
    args: [aggregatorAddress, creator],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log(tx);
};

module.exports.tags = ["all", "ContentDAO"];
