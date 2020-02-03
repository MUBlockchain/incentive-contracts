pragma solidity >=0.4.0 < 0.7.0;
pragma experimental ABIEncoderV2;

import "./IMUBCToken.sol";

contract MUBCToken is IMUBCToken {

    constructor() public {
        cron = msg.sender;
    }

    function register(string memory _uniqueID, string memory _name, uint _role) public onlyCron returns (uint _id) {
        require(uuid[_uniqueID] == 0, "User is already enrolled!");
        userSerial = userSerial.add(1);
        User storage user = userRegistry[userSerial];
        user.uniqueID = _uniqueID;
        user.name = _name;
        roles[userSerial] = _role;
        uuid[_uniqueID] = userSerial;
        emit UserRegistered(userSerial);
    }

    //@dev Make a better function for cron minting vs manual minting
    function mint(uint _id, uint _value, uint _as) public onlyCron {
        require(roles[_as] == uint(Roles.Exec), "User is not permitted to mint MUBC Incentive Tokens!");
        balance[_id] = balance[_id].add(_value);
        emit IncentiveMinted(_value, _id, _as);
    }

    function listItem(string memory _description, bool _fungible, uint _quantity, uint _cost) public returns (uint _itemID) {
        return 1;
    }

    function delistItem(uint _itemID, uint _as) public {
        return;
    }

    function purchaseItem(uint _itemID, uint _as) public {
        return;
    }

    function listBounty(string memory _description, bool _fungible, uint _quantity, uint _incentive) public onlyCron returns (uint _bountyID) {
        return 1;
    }

    function delistBounty(uint _bountyID, uint _as) public onlyCron {
        return;
    }

    function awardBounty(uint _bountyID, uint _id, uint _as) public onlyCron {
        Bounty storage bounty = bountyRegistry[_bountyID];
        require(bounty.active, "This bounty has ended permanently!");
        require(bounty.fungible || bounty.quantity > 0, "This bounty has been depleted");
        balance[_id] += bounty.incentive;
        emit IncentiveMinted(_bountyID, _id, _as);
        bounty.awardIndex = bounty.awardIndex.add(1);
        bounty.awards[_id] = true;
        bounty.awardedUsers.push(_id);
        User storage user = userRegistry[_id];
        user.awards.push(_bountyID);
        emit BountyAwarded(_bountyID, _id);
    }

    function getActiveBounties() public view returns (uint[] memory _bountyIDs) {
        _bountyIDs = activeBounties;
    }

    function getActiveItems() public view returns (uint[] memory _itemIDs) {
        _itemIDs = activeItems;
    }

    function getBalance(uint _id) public view returns (uint _balance) {
        _balance = balance[_id];
    }

    function profile(uint _id) public view returns (
        string memory _uniqueID,
        string memory _name,
        uint _balance,
        uint _totalBurn,
        uint[] memory _purchases,
        uint[] memory _awards
        ) {
            User memory profile = userRegistry[_id];
            _uniqueID = profile.uniqueID;
            _name = profile.name;
            _balance = balance[_id];
            _totalBurn = profile.totalBurn;
            _purchases = profile.purchases;
            _awards = profile.awards;
        }

    function bountyProfile(uint _id) public view returns (
        string memory _description,
        bool _fungible,
        uint _quantity,
        uint _incentive,
        bool _active,
        uint[] memory _awards
        ) {
            Bounty memory profile = bountyRegistry[_id];
            _description = profile.description;
            _fungible = profile.fungible;
            _quantity = profile.quantity;
            _incentive = profile.incentive;
            _active = profile.active;
            _awards = profile.awardedUsers;
        }

    function itemProfile(uint _id) public view returns (
        string memory _description,
        bool _fungible,
        uint _quantity,
        uint _cost,
        bool _active,
        uint[] memory _purchases
        ) {
            Item memory profile = itemRegistry[_id];
            _description = profile.description;
            _fungible = profile.fungible;
            _quantity = profile.quantity;
            _cost = profile.cost;
            _active = profile.active;
            _purchases = profile.purchasingUsers;
    }

    //no commenting
    function getUserSerial() public view returns (uint _serial) {
        return userSerial;
    }

    //no commenting
    function uuidLookUp(string memory _uniqueID) public view returns (uint _id) {
        return uuid[_uniqueID];
    }

}