const { inputToConfig } = require("@ethereum-waffle/compiler");
const { getContractFactory } = require("@nomiclabs/hardhat-ethers/types");
const { assert } = require("chai");
const { utils } = require("ethers");
const {
  deployments,
  getNamedAccounts,
  ethers,
  network,
  hardhatArguments,
} = require("hardhat");
const { localNetworks } = require("../../helper.hardhat.config");

!localNetworks.includes(network.name)
  ? describe.skip
  : describe("ContentDAO", () => {
      let deployer,
        creator,
        contentDAO,
        MockV3Aggregator,
        timestamp,
        latestTimestamp;

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
          latestTimestamp = await contentDAO.getLatestTimestamp();
          const provider = ethers.provider;
          const block = await provider.getBlock(2);
          timestamp = await block.timestamp;
          assert.equal(timestamp, latestTimestamp);
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

      describe("ETH to USD converter", () => {
        it("Converts ETH value entered by user to USD", async () => {
          const ethAmount = await contentDAO.convertToUsd(
            ethers.utils.parseEther("1")
          );
          const ethAmountToStr = ethAmount.toString();
          const [, LatestPrice] = await MockV3Aggregator.latestRoundData();
          const LatestPriceToString = LatestPrice.toString() * "10000000000";
          assert.equal(ethAmountToStr, LatestPriceToString);
        });
      });
      describe("CheckUpkeep", () => {
        let contractWithSigner;
        beforeEach(async () => {
          const signer = (await ethers.getSigners())[3];
          contractWithSigner = contentDAO.connect(signer);
        });

        it("Checks if enought time has passed, has holders and is open", async () => {
          const mintingDuration = await contentDAO.getMintDuration();
          await contractWithSigner.ctTokenMint({
            value: ethers.utils.parseEther("0.0075"),
          });
          let [upkeepNeeded] = await contentDAO.checkUpkeep("0x");
          assert.equal(upkeepNeeded, false);
          await network.provider.send("evm_increaseTime", [
            mintingDuration.toNumber() + 5,
          ]);
          await network.provider.send("evm_mine", []);
          [upkeepNeeded] = await contentDAO.checkUpkeep("0x");
          assert.equal(upkeepNeeded, true);
        });
      });
    });
