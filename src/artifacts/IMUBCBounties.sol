struct Bounty {
        uint bountyID;
        string description;
        bool fungible;
        uint quantity;
        uint incentive;
        bool active;
        uint awardIndex;
        mapping(uint => bool) awards;
        uint[] awardedUsers;
    }

    mapping(uint => Bounty) bountyRegistry;
      uint bountySerial;
      uint[] activeBounties;

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
         event BountyListed(uint bountyID);
    event BountyAwarded(uint bountyID, uint userID);
    event BountyDelisted(uint bountyID);