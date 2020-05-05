 pragma solidity >= 0.4.0 < 0.7.0;

 abstract contract IMUBCItems {

    event ItemListed(uint itemID);
    event ItemPurchased(uint itemID, uint uuid);
    event ItemDelisted(uint itemID);

    struct Item {
        uint itemID;
        string description;
        uint quantity;
        uint cost;
        bool active;
        uint activeIndex;
        mapping(uint => bool) purchases;
        uint[] purchasers;
    }

    mapping(uint => Item) public itemRegistry;
    mapping(uint => uint) public activeItems;
    uint public itemSerial;
    uint public activeSerial;

    /**
     * @dev modifier onlyCron
     * List a new item on the MUBC shop
     * @param _description string: a short description of the item being offered for purchase
     * @param _quantity uint: number of times this item can be purchased.
     * @param _cost uint: how many incentive tokens must be burned to purchase this item
     * @return _itemID uint: the itemSerial given to the newly listed item
     **/
    function listItem(
        string memory _description,
        uint _quantity,
        uint _cost
        ) public virtual returns (uint _itemID);
    
    /**
     * @dev modifier onlyCron
     * Permanently retire an item from the shop
     * @param _itemID uint: the itemID of the Item being toggled as inactive
     **/
    function delistItem(uint _itemID) public virtual; 
    
    /**
     * @dev modifier onlyCron
     * Spend MUBC tokens to purchase an item. Items should not be purchasable twice.
     * @param _itemID uint: the itemID of the item being purchased
     * @param _as uint: userID of the user purchasing the item
     **/
    function purchaseItem(uint _itemID, uint _as) public virtual;

    /**
     * Get an array of all the currently active items in the incentive network
     * @return _itemIDs uint[]: array of all items currently marked active
     **/
    function getActiveItems() public virtual view returns (uint[] memory _itemIDs);

    /**
     * Return the data associated with an item
     * @param _id uint: the itemID being queried
     * @return _description string: the description of the item and it's properties/ entitlements if bought
     * @return _quantity uint: the number of times this item can be purchased.
     * @return _cost uint: the number of MUBC tokens that are burned from the user's account upon purchase
     * @return _active bool: true if the item is open for interaction and false if it is permanently locked
     * @return _purchasers uint[]: array of userIDs that purchased this item
     **/
    function itemProfile(uint _id) public virtual view returns (
        string memory _description,
        uint _quantity,
        uint _cost,
        bool _active,
        uint[] memory _purchasers
        );
}
