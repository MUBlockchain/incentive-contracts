pragma solidity >=0.4.0 < 0.7.0;

import "./SafeMath.sol";

abstract contract IMUBCCore {

    using SafeMath for uint256;

    event UserRegistered(uint uuid);
    event IncentiveMinted(uint value, uint uuid, uint by);
    event BreakerFlipped(bool state, uint by);

    modifier onlyCron() {
        require(msg.sender == cron, "Executing address is not the CRON address!");
        _;
    }

    modifier circuitBreaker() {
        require(!circuitBroken, "Contract is not active: the circuit breaker is flipped!");
        _;
    }

    modifier onlyExecutive(uint _uuid) {
        require(executive[_uuid] || _uuid == 0, "Cannot execute: User is not a club Executive!");
        _;
    }

    struct User {
        string uniqueID;
        string name;
        uint uuid;
        uint balance;
        uint[] purchases;
        uint[] awards;
    }

    mapping(string => uint) public uuid;
    mapping(uint => User) public userRegistry;
    mapping(uint => bool) public executive;

    uint public tokenSupply;
    uint public uuidSerial;
    bool public circuitBroken;
    address public cron;

    /**
     * @dev modifier onlyCron
     * Register a new user onto the MUBC Token network
     * @param _uniqueID string: the uniqueID used by Miami University to identify its students
     * @param _name string: student name;
     * @param _executive bool: true if the user should be enrolled with permissions, and false otherwise
     * @return _uuid uint: userSerial of the newly registered account
     **/
    function register(string memory _uniqueID, string memory _name, bool _executive) public virtual returns (uint _uuid);

    /**
     * @dev modifier onlyCron, onlyExecutive
     * Create new incentive tokens. Reason for minting should be derived from _as
     * @param _uuid uint: the userID of the incentive's recipient
     * @param _value: the quantity of tokens being minted to the recipient
     * @param _as: specifies who minted the tokens
     *  - value of 0 denotes bounty minting
     *  - value =/= 0 specifies the userID who minted the transaction for record purposes
     **/
    function mint(uint _uuid, uint _value, uint _as) public virtual;

    /**
     * @dev modifer onlyCron, onlyExecutive
     * Enable or disable the circuit breaker
     * @param _as uint: the uuid of the user tring to flip the circuit breaker
     * @return _state bool: true if the circuit is broken, and false otherwise
     */
    function flipBreaker(uint _as) public virtual returns (bool _state);

    /**
     * Return the balance of a given userID
     * @param _uuid uint: the userID being looked up
     * @return _balance uint: the number of MUBC tokens the
     **/
    function getBalance(uint _uuid) public virtual view returns (uint _balance);

    /**
     * Return the data associated with a user profile
     * @param _uuid uint: the userID being queried
     * @return _uniqueID string: the identifying string given to students by Miami University
     * @return _name string: the student's name
     * @return _balance uint: the user's current MUBC Incentive Token balance
     * @return _purchases uint[]: array of all itemIDs this account owns on the MUBC Incentive Network
     * @return _awards uint[]: array of all bountyIDs this account has been awarded
     **/
    function profile(uint _uuid) public virtual view returns (
        string memory _uniqueID,
        string memory _name,
        uint _balance,
        uint[] memory _purchases,
        uint[] memory _awards
        );
}