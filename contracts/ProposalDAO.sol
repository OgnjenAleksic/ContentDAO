//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ContentDAO.sol";

contract ProposalDAO is ContentDAO {
    struct Proposal {
        string proposalName;
        uint256 yesVotes;
        uint256 noVotes;
        bool finalized;
    }

    constructor(
        address aggregatorV3Address,
        address creator
    ) ContentDAO(aggregatorV3Address, creator) {}

    uint numberOfProposals;

    mapping(uint => Proposal) numberOfProposalToProposal;

    //Proposing a vote

    function proposeVote(string memory _proposalName) external onlyCreator {
        numberOfProposalToProposal[numberOfProposals] = Proposal(
            _proposalName,
            0,
            0,
            false
        );

        numberOfProposals++;
    }

    //Voting
}
