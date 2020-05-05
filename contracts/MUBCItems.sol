pragma solidity >= 0.4.0 < 0.7.0;
pragma experimental ABIEncoderV2;

import './MUBCCore.sol';
import './IMUBCItems.sol';

contract MUBCItems is MUBCCore, IMUBCItems {

    function listItem(
        string memory _description,
        uint _quantity,
        uint _cost
        ) public override onlyCron() returns (uint _itemID) {

        itemSerial = itemSerial.add(1);
        Item storage item = itemRegistry[itemSerial];
        item.itemID = itemSerial;
        item.description = _description;
        item.quantity = _quantity;
        item.cost = _cost;
        item.active = true;
        activeSerial = activeSerial.add(1);
        activeItems[activeSerial] = itemSerial;
        item.activeIndex = activeSerial;
        emit ItemListed(itemSerial);
        return itemSerial;
    }

    function delistItem(uint _itemID) public override onlyCron() {
        Item storage delistedItem = itemRegistry[_itemID];
        require(delistedItem.active, "Item has already been delisted/ expired!");
        Item storage shiftedItem = itemRegistry[activeSerial];
        delistedItem.active = false;
        shiftedItem.activeIndex = delistedItem.activeIndex;
        delistedItem.activeIndex = 0;
        activeItems[shiftedItem.activeIndex] = shiftedItem.itemID;
        activeItems[activeSerial] = 0;
        activeSerial = activeSerial.sub(1);
        emit ItemDelisted(itemSerial);
    }

    function purchaseItem(uint _itemID, uint _as) public override onlyCron() {
        Item storage item = itemRegistry[_itemID];
        require(item.active, "Cannot purchase inactive item!");
        require(item.quantity > 0, "Item is sold out!");
        require(getBalance(_as) >= item.cost, "User has insufficient MUBC Token balance to purchase!");
        require(!item.purchases[_as], "User has already purchased this item!");
        item.quantity = item.quantity.sub(1);
        User storage user = userRegistry[_as];
        user.purchases.push(_itemID);
        item.purchases[_as] = true;
        item.purchasers.push(_as);
        user.balance = user.balance.sub(item.cost);
        emit ItemPurchased(_itemID, _as);
    }

    function getActiveItems() public override view returns (uint[] memory _itemIDs) {
        uint[] memory arr = new uint[](activeSerial);
        for (uint i = 0; i < activeSerial; i++)
            arr[i] = activeItems[i.add(1)];
        return arr;
    }

    function itemProfile(uint _id) public override view returns (
        string memory _description,
        uint _quantity,
        uint _cost,
        bool _active,
        uint[] memory _purchasers
        ) {

        Item memory item = itemRegistry[_id];
        bytes memory str = bytes(item.description);
        require(str.length > 0, "Cannot query nonexistent item ID!");
        _description = item.description;
        _quantity = item.quantity;
        _cost = item.cost;
        _active = item.active;
        _purchasers = item.purchasers;
    }
}