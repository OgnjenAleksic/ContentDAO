// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Content DAO
/// @author Ognjen Aleksic
/// @custom: This is unfinished experimental contract

/*Functionality that is yet to be implemented: Allowing creator to propose the vote */

/*Functionality that is yet to be implemented(2): Only creator shoud be able to withdraw ETH
  after certan condition is met
  Condition: if more than 50% CT holders vote that the proposed content has been created.
  */

//IMPORTS
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

//CUSTOM ERRORS
error Please_Deposit_Right_Amount();
error The_Mint_Is_Closed();
error Withdrawal_Unsuccessful();
error You_Have_Already_Minted_CT();
error Upkeep_Is_Not_Needed();

contract ContentDAO is ERC20, AutomationCompatibleInterface {
    enum MintStatus {
        OPEN,
        CLOSED
    }

    event TheMintHasClosed();
    event TokensHaveBeenBurned();
    event CreatorHasReceivedEth();

    AggregatorV3Interface internal priceFeed;
    address private immutable i_creator;
    uint32 private constant MINTING_OPEN_DURATION = 1 seconds;
    uint256 private s_lastTimestamp;
    uint256 private constant PRICE_IN_USD = 15 * 10 ** 18;
    MintStatus s_mintStatus;
    address[] private s_holders;

    //Constructor function
    constructor(
        address aggregatorV3Address,
        address creator
    ) ERC20("ContentToken", "CT") {
        //Price feed
        priceFeed = AggregatorV3Interface(aggregatorV3Address);
        //Minting
        s_lastTimestamp = block.timestamp;
        s_mintStatus = MintStatus.OPEN;
        i_creator = creator;
        _mint(i_creator, 2 * (10 ** decimals()));
    }

    modifier onlyCreator() {
        require(msg.sender == i_creator);
        _;
    }

    //Getting the ETH price in USD functionality!
    function getLatestPrice() public view returns (uint256) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 10000000000);
    }

    function convertToUsd(
        uint256 enteredAmountByUserInEth
    ) public view returns (uint256) {
        uint256 oneEthInUsd = getLatestPrice();
        uint256 enteredAmountByUserInUsd = (enteredAmountByUserInEth *
            oneEthInUsd) / 1000000000000000000;
        return enteredAmountByUserInUsd;
    }

    /**
     * @dev I have added the chainlink automation that will close the mint after a week
     * Upkeep needed has to be true. That means:
     * 1) Enough time has passed (one week)
     * 2) There are holders of CT token
     * 3) Minting status is OPEN
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool enoughTimePassed = (block.timestamp - s_lastTimestamp) >
            MINTING_OPEN_DURATION;
        bool hasHolders = s_holders.length > 0;
        bool mintingStatusOpen = (s_mintStatus == MintStatus.OPEN);
        upkeepNeeded = (enoughTimePassed && hasHolders && mintingStatusOpen);
        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) revert Upkeep_Is_Not_Needed();
        _updateMintStatus();
    }

    function _updateMintStatus() internal {
        s_mintStatus = MintStatus.CLOSED;
        emit TheMintHasClosed();
    }

    /**
     * Checks if the minter has deposited right amount(in USD)
     * Checks if the mint status is still open(if first week of the month has passed)
     * Checks if sender has already minted a CT token
     * If all checks are passed the minter will be added to an array of CT holders
     * Minter will get one CT token, which will give him/her an exclusive right to vote about certan content creation
     */
    function ctTokenMint() public payable {
        if (convertToUsd(msg.value) != PRICE_IN_USD) {
            revert Please_Deposit_Right_Amount();
        }

        if (balanceOf(msg.sender) == 1 * 10 ** 18) {
            revert You_Have_Already_Minted_CT();
        }

        if (s_mintStatus == MintStatus.CLOSED) {
            revert The_Mint_Is_Closed();
        }

        _mint(msg.sender, 1 * (10 ** decimals()));

        s_holders.push(msg.sender);
    }

    /**This function is automaticly called at the end of each month
     * Copies holders array from storage to memory for cheaper iteration
     * Burns all CT tokens minted
     * Restarts holders array
     * Returns Mint status back to open
     * Sends ETH to the the content creator
     * Added: sets lastTimestamp to the timestamp of the block that inclueded this tx
     */
    function endMonthTokenBurn() public onlyCreator {
        address[] memory holders = s_holders;

        for (uint256 i = 0; i < holders.length; i++) {
            _burn(holders[i], 1 * (10 ** decimals()));
        }

        s_holders = new address[](0);
        s_mintStatus = MintStatus.OPEN;
        s_lastTimestamp = block.timestamp;

        (bool success, ) = payable(i_creator).call{
            value: address(this).balance
        }("");
        if (!success) revert Withdrawal_Unsuccessful();

        emit TokensHaveBeenBurned();
        emit CreatorHasReceivedEth();
    }

    //Getters
    function getBalance(
        address enteredAddress
    ) external view returns (uint256) {
        return balanceOf(enteredAddress);
    }

    function getCreator() external view returns (address) {
        return i_creator;
    }

    function getMintPrice() external pure returns (uint256) {
        return PRICE_IN_USD;
    }

    function getHolders() external view returns (address[] memory) {
        return s_holders;
    }

    function getMintStatus() external view returns (MintStatus) {
        return s_mintStatus;
    }

    function getLatestTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    function getLastTimestamp() external view returns (uint256) {
        return s_lastTimestamp;
    }

    function getMintDuration() external pure returns (uint) {
        return MINTING_OPEN_DURATION;
    }

    function getPriceFeedAddress()
        external
        view
        returns (AggregatorV3Interface)
    {
        return priceFeed;
    }
}
