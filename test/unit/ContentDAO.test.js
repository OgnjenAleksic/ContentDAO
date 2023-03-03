const { inputToConfig } = require("@ethereum-waffle/compiler");
const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const { assert } = require("chai");
const { deployments, getNamedAccounts, ethers, network } = require("hardhat");
const { localNetworks } = require("../../helper.hardhat.config");

!localNetworks.includes(network.name)
  ? describe.skip
  : describe("ContentDAO", () => {
      let deployer, creator, contentDAO, MockV3Aggregator;

      beforeEach(async () => {
        await deployments.fixture(["all"]);
        creator = (await getNamedAccounts()).creator;
        deployer = (await getNamedAccounts()).deployer;

        contentDAO = await ethers.getContract("ContentDAO", creator);
        MockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("Constructor", () => {
        //CONTRACT CONSTRUCTOR
        it("Sets the AggregatorV3Interface address correctly", async () => {
          const priceFeedAddress = await contentDAO.getPriceFeedAddress();
          const mockAddress = MockV3Aggregator.address;
          assert.equal(priceFeedAddress, mockAddress);
        });
        it("Sets last timestamp as the block timestamp", async () => {
          const lastTimestamp = await contentDAO.getLatestTimestamp();
          const provider = ethers.provider;
          const block = await provider.getBlock(2);
          const timestamp = await block.timestamp;
          assert.equal(timestamp, lastTimestamp);
        });
        it("Sets mint status to open", async () => {
          const mintStatus = await contentDAO.getMintStatus();
          assert.equal(mintStatus.toString(), "0");
        });
        it("Sets creator to provided address", async () => {
          const getCreator = await contentDAO.getCreator();
          assert.equal(getCreator, creator);
        });
        it("Mints 2 CT tokens for the creator", async () => {
          const creatorBalance = await contentDAO.getBalance(creator);
          assert.equal(creatorBalance.toString(), ethers.utils.parseEther("2"));
        });
        //ERC20 CONSTRUCTOR
        it("Sets token name correctly", async () => {
          const tokenName = await contentDAO.name();
          assert.equal(tokenName, "ContentToken");
        });
        it("Sets token symbol correctly", async () => {
          const tokenSymbol = await contentDAO.symbol();
          assert.equal(tokenSymbol, "CT");
        });
      });
    });
