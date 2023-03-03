# ContentDAOProject

ContentDAO:
ContentDAO is an experimental project that enables voters who mint the CT token to vote on which content should content creator create once a month.
At the end of each month, voters also vote on whether the content creator has created content. If the content creator has created content, he can withdraw ETH.

Disclaimer:
Please note that this project is experimental, unfinished and has no production purpose. Use at your own risk.

Features:

CT token minting: voters can mint the CT token by depositing the equivalent of $15 USD in ETH. This gives them the exclusive right to vote on which content creator should create once a month.
Voting on content creation: voters can use their CT tokens to vote on which content creator should create.
Content creation verification: at the end of each month, voters vote on whether the content creator has created content. If the content creator has created content, he can withdraw ETH.
Automatic minting closing: the minting of CT tokens is closed automatically at the end of the first week of each month.
ETH withdrawal: if the content creator has created content, he can withdraw ETH.

Smart Contract

The ContentDAO smart contract is based on the ERC20 standard. It includes the following functions:

ctTokenMint(): allows voters to mint the CT token by depositing the equivalent of $15 USD in ETH.

updateMintStatus(): automatically closes the minting of CT tokens at the end of the first week of each month.

endMonthTokenBurn(): verifies whether the content creator has created content, burns all CT tokens, sends ETH to the content creator, and resets the minting status.

getBalance(): returns the balance of CT tokens for a given address.

getCreator(): returns the address of the content creator.

getMintPrice(): returns the price of minting a CT token in USD.

getHolders(): returns an array of CT token holders.

getMintStatus(): returns the current minting status.

Custom Errors:

The ContentDAO smart contract includes the following custom errors:

Please_Deposit_Right_Amount(): the minter has not deposited the correct amount of ETH.

The_Mint_Is_Closed(): the minting of CT tokens is closed.

Withdrawal_Unsuccessful(): the withdrawal of ETH was unsuccessful.

You_Have_Already_Minted_CT(): the minter has already minted a CT token.

License

This project is licensed under the MIT License.
