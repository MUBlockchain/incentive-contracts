pragma solidity >=0.4.0 < 0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol"
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol"

contract MUBCToken is ERC20Mintable, ERC20Detailed {
    
    constructor() {
        ERC20Detailed("MUBCToken", "MUBC", 18) {
            _mint(msg.sender,10000 * (10 ** uint256(decimals())));
            }
        }
    }
}