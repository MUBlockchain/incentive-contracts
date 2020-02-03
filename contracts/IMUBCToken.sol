pragma solidity >=0.4.0 < 0.7.0;

import "./SafeMath.sol";

contract IMUBCToken {
    
    using SafeMath for uint256;
    
    modifier onlyCron() {
        require(msg.sender == cron, "Executing address is not the CRON address!");
        _;
    }
    
    event UserRegistered(uint userID);
    event IncentiveMinted(uint value, uint userID, uint by);
    event ItemListed(uint itemID);
    event ItemPurchased(uint itemID, uint userID);
    event ItemDelisted(uint itemID);
    event BountyListed(uint bountyID);
    event BountyAwarded(uint bountyID, uint userID);
    event BountyDelisted(uint bountyID);

    enum Roles { None, User, Exec }

    struct User {
        string uniqueID;
        string name;
        uint userID;
        uint totalBurn;
        uint[] purchases;
        uint[] awards;
    }
    
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
    
    struct Item {
        uint itemID;
        string description;
        bool fungible;
        uint quantity;
        uint cost;
        bool active;
        mapping(uint => bool) purchases;
        uint[] purchasingUsers;
        uint purchaseIndex;
    }
    
    mapping(string => uint) public uuid;
    mapping(uint => User) userRegistry;
    mapping(uint => Bounty) bountyRegistry;
    mapping(uint => Item) itemRegistry;
    mapping(uint => uint) roles;
    mapping(uint => uint) balance;
    
    uint userSerial;
    uint bountySerial;
    uint itemSerial;
    uint[] activeBounties;
    uint[] activeItems;
    
    address cron;
    
    /**
     * @dev modifier onlyCron
     * Register a new user onto the MUBC Token network
     * @param _uniqueID string: the uniqueID used by Miami University to identify its students
     * @param _name string: student name;
     * @param _role uint: the permissions given to this account
     * @return _id uint: userSerial of the newly registered account
     **/
    function register(string memory _uniqueID, string memory _name, uint _role) public returns (uint _id);
    
    /**
     * @dev modifier onlyCron
     * Create new incentive tokens. Reason for minting should be derived from _as
     * @param _id uint: the userID of the incentive's recipient
     * @param _value: the quantity of tokens being minted to the recipient
     * @param _as: specifies who minted the tokens
     *  - value of 0 denotes bounty minting
     *  - value =/= 0 specifies the userID who minted the transaction for record purposes
     **/
    function mint(uint _id, uint _value, uint _as) public;
    
    /**
     * @dev modifier onlyCron
     * List a new item on the MUBC shop
     * @param _description string: a short description of the item being offered for purchase
     * @param _fungible bool: true if item can be infinitely purchased, false otherwise
     * @param _quantity uint: number of times this item can be purchased. if fungible, set value to 0
     * @param _cost uint: how many incentive tokens must be burned to purchase this item
     * @return _itemID uint: the itemSerial given to the newly listed item
     **/
    function listItem(string memory _description, bool _fungible, uint _quantity, uint _cost) public returns (uint _itemID);
    
    /**
     * @dev modifier onlyCron
     * Permanently retire an item from the shop
     * @param _itemID uint: the itemID of the Item being toggled as inactive
     * @param _as uint: the userID of the 
     **/
    function delistItem(uint _itemID, uint _as) public; 
    
    /**
     * @dev modifier onlyCron
     * Spend MUBC tokens to purchase an item. Items should not be purchasable twice.
     * @param _itemID uint: the itemID of the item being purchased
     * @param _as uint: userID of the user purchasing the item
     **/
    function purchaseItem(uint _itemID, uint _as) public;
    
    /**
     * @dev modifier onlyCron
     * List a new bounty on the network
     * @param _description string: short description of the task required to complete the bounty
     * @param _fungible bool: true if infinitely available and false otherwise
     * @param _quantity uint: number of times this bounty can be awarded. Set value to 0 if fungible
     * @param _incentive uint: the number of MUBC token that will be minted to a bounty award recipient's account
     * @return _bountyID uint: bountySerial given to the newly listed bounty
     **/
    function listBounty(string memory _description, bool _fungible, uint _quantity, uint _incentive) public returns (uint _bountyID);
    
    /**
     * @dev modifier onlyCron
     * Permanently remove a bounty from the MUBC incentive network
     * @param _bountyID uint: bountyID of the bounty being deslisted
     * @param _as uint: userID of the account delisting the bounty
     **/
    function delistBounty(uint _bountyID, uint _as) public;
    
    /**
     * @dev modifier onlyCron
     * Award a bounty to a user's account
     * @param _bountyID uint: bountyID of the bounty being paid out
     * @param _id uint: userID of the account recieving award
     * @param _as uint: userID of the account awarding the bounty. 0 if automated.
     **/
    function awardBounty(uint _bountyID, uint _id, uint _as) public;
    
    /**
     * Return all currently active bounties
     * @return _bountyIDs uint[]: array of all bounties marked active
     **/
    function getActiveBounties() public view returns (uint[] memory _bountyIDs);
    
    /**
     * Get an array of all the currently active items in the incentive network
     * @return _itemIDs uint[]: array of all items currently marked active
     **/
    function getActiveItems() public view returns (uint[] memory _itemIDs);
    
    /**
     * Return the balance of a given userID
     * @param _id uint: the userID being looked up
     * @return _balance uint: the number of MUBC tokens the 
     **/
    function getBalance(uint _id) public view returns (uint _balance);
    
    /**
     * Return the data associated with a user profile
     * @param _id uint: the userID being queried
     * @return _uniqueID string: the identifying string given to students by Miami University
     * @return _name string: the student's name
     * @return _balance uint: the user's current MUBC Incentive Token balance
     * @return _totalBurn uint: the total number of tokens an account has burned by purchasing an item
     * @return _purchases uint[]: array of all itemIDs this account owns on the MUBC Incentive Network
     * @return _awards uint[]: array of all bountyIDs this account has been awarded
     **/
    function profile(uint _id) public view returns (
        string memory _uniqueID,
        string memory _name, 
        uint _balance,
        uint _totalBurn,
        uint[] memory _purchases,
        uint[] memory _awards
        );
    
    
    
    
    
    
    
    /**
     * Return the data associated with a bounty
     * @param _id uint: the bountyID being queried
     * @return _description string: the description of the bounty's task
     * @return _fungible bool: true if the bounty is infinite, and false otherwise
     * @return _quantity uint: the number of times this bounty can be awarded. If fungible, returns 0
     * @return _incentive uint: the number of MUBC tokens that are minted to the recipient upon the award
     * @return _active bool: true if the bounty is open for interaction and false if it is permanently locked
     * @return _awards uint[]: array of userIDs that were awarded this bounty
     **/
    function bountyProfile(uint _id) public view returns (
        string memory _description,
        bool _fungible,
        uint _quantity,
        uint _incentive,
        bool _active,
        uint[] memory _awards
        );
        
    /**
     * Return the data associated with an item
     * @param _id uint: the itemID being queried
     * @return _description string: the description of the item and it's properties/ entitlements if bought
     * @return _fungible bool: true if the item is infinite, and false otherwise
     * @return _quantity uint: the number of times this item can be purchased. If fungible, returns 0
     * @return _cost uint: the number of MUBC tokens that are burned from the user's account upon purchase
     * @return _active bool: true if the item is open for interaction and false if it is permanently locked
     * @return _purchases uint[]: array of userIDs that purchased this item
     **/
    function itemProfile(uint _id) public view returns (
        string memory _description,
        bool _fungible,
        uint _quanitity,
        uint _incentive,
        bool _active,
        uint[] memory _purchases
        );
}