pragma solidity >=0.4.0 < 0.7.0;
pragma experimental ABIEncoderV2;

import "./IMUBCCore.sol";

contract MUBCCore is IMUBCCore {

    constructor() public {
        cron = msg.sender;
    }

    function register(string memory _uniqueID, string memory _name, bool _executive)
        public override onlyCron() circuitBreaker() returns (uint _uuid) {

        require(uuid[_uniqueID] == 0, "User is already enrolled!");
        uuidSerial = uuidSerial.add(1);
        User storage user = userRegistry[uuidSerial];
        user.uniqueID = _uniqueID;
        user.name = _name;
        executive[uuidSerial] = _executive;
        uuid[_uniqueID] = uuidSerial;
        emit UserRegistered(uuidSerial);
        return uuidSerial;
    }

    function mint(uint _uuid, uint _value, uint _as) public override
        onlyCron() circuitBreaker() onlyExecutive(_as) {

        bytes memory str = bytes(userRegistry[_uuid].name);
        require(str.length != 0, "Cannot mint to unused uuid index!");
        userRegistry[_uuid].balance = userRegistry[_uuid].balance.add(_value);
        tokenSupply = tokenSupply.add(_value);
        emit IncentiveMinted(_value, _uuid, _as);
    }

    function flipBreaker(uint _as) public override
        onlyCron() onlyExecutive(_as) returns (bool _state) {
        circuitBroken = !circuitBroken;
        emit BreakerFlipped(circuitBroken, _as);
        _state = circuitBroken;
    }

    function getBalance(uint _uuid) public override view returns (uint _balance) {
        return userRegistry[_uuid].balance;
    }

    function profile(uint _uuid) public override view returns (
        string memory _uniqueID,
        string memory _name,
        uint _balance,
        uint[] memory _purchases,
        uint[] memory _awards
        ) {
            
        bytes memory str = bytes(userRegistry[_uuid].name);
        require(str.length != 0, "Cannot profile account that does not exist!");
        User memory user = userRegistry[_uuid];
        _uniqueID = user.uniqueID;
        _name = user.name;
        _balance = user.balance;
        _purchases = user.purchases;
        _awards = user.awards;
    }

}