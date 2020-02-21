struct Bounty {
        uint bountyID;
        string description;
        bool fungible;
        uint quantity;
        uint incentive;
        bool active;
        mapping(uint => bool) awards;
        uint[] awardedUsers;
        uint awardIndex;
    }