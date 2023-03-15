//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ContentDAO.sol";

error Proposal_Status_Is_Closed();
error You_Dont_Hold_CT();
error Proposal_Has_Been_Finalized();

contract ProposalDAO is ContentDAO {
    struct Proposal {
        string proposalName;
        uint256 votes;
    }

    struct Voter {
        bool voted;
    }

    Proposal[3] proposals;

    Proposal winningProposal;

    constructor(
        address aggregatorV3Address,
        address creator
    ) ContentDAO(aggregatorV3Address, creator) {}
}
