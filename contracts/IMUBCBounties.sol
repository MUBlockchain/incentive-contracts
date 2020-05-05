pragma solidity >= 0.4.0 < 0.7.0;

abstract contract IMUBCBounties {
    struct Bounty {
        uint bountyID;
        string description;
        uint quantity;
        uint reward;
        bool active;
        uint activeIndex;
        mapping(uint => bool) awards;
        uint[] recipients;
    }
}