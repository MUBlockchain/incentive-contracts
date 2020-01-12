pragma solidity >=0.4.0 < 0.7.0;

import "https://github.com/enjin/erc-1155/blob/master/contracts/ERC1155.sol";

contract MUBCToken is ERC1155
{
    
    bytes4 constant private INTERFACE_SIGNATURE_URI = 0x0e89341c;

    // id => creators
    mapping (uint256 => address) public creators;

    // A nonce to ensure we have a unique id each time we mint.
    uint256 public nonce;

    modifier creatorOnly(uint256 _id) {
        require(creators[_id] == msg.sender);
        _;
    }
    
    function createToken(uint256 _initialSupply, string calldata _uri) external returns(uint256 _id) {

        _id = ++nonce;
        creators[_id] = msg.sender;
        balances[_id][msg.sender] = _initialSupply;

        // Transfer event with mint semantic
        emit TransferSingle(msg.sender, address(0x0), msg.sender, _id, _initialSupply);

        if (bytes(_uri).length > 0)
            emit URI(_uri, _id);
    }
    
    function addCreator() public
    {
        creators[0] = msg.sender;
    }
    
}