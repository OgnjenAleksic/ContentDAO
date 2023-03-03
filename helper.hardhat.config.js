const localNetworks = ["hardhat", "localhost"];

const realNetworks = {
  5: {
    name: "Goerli",
    ETHtoUSDAggregatorAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};

module.exports = {
  localNetworks,
  realNetworks,
};
