 event ItemListed(uint itemID);
    event ItemPurchased(uint itemID, uint userID);
    event ItemDelisted(uint itemID);
    event BountyListed(uint bountyID);
    event BountyAwarded(uint bountyID, uint userID);
    event BountyDelisted(uint bountyID);

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

    mapping(uint => Bounty) bountyRegistry;
    mapping(uint => Item) itemRegistry;

      uint bountySerial;
    uint itemSerial;
    uint[] activeBounties;
    uint[] activeItems;
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