let { expect } = require('chai')
let { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
let MUBCToken = artifacts.require('./MUBCItemShop')

/**
 * MUBC Incentive Token Item Contract Testing
 * @author Miami University Blockchain Club
 * @date 02.21.2020
 * 
 * Item Testing: 
 *   - Item listing
 *   - Item purchasing
 *   - Item delisting
 *   - Item profiles
 **/

contract('MUBCToken: Item Shop Functionality', (accounts) => {
    
    let cron = accounts[0];
    let uniqueIDs = ['executive_0', 'member_0', 'member_1', 'member_2', 'member_3']
    let names = ['name_0', 'name_1', 'name_2', 'name_3', 'name_4']
    let descriptions = ['description_0', 'description_1', 'description_2', 'description_3']


    beforeEach(async () => {
        this.token = await MUBCToken.new({ from: cron })
        await this.token.register(uniqueIDs[0], names[0], true, { from: cron })
        await this.token.register(uniqueIDs[1], names[1], false, { from: cron })
        await this.token.register(uniqueIDs[2], names[2], false, { from: cron })
        await this.token.register(uniqueIDs[3], names[3], false, { from: cron })
        await this.token.mint(2, 10, 0, { from: cron })
        await this.token.mint(3, 20, 0, { from: cron })
        await this.token.mint(4, 30, 0, { from: cron })
        await this.token.listItem(descriptions[0], false, 2, 10)
    })

    describe('Item listing:', () => {

        it('Items with infinite purchasability can be created', async () => {
            await this.token.listItem(descriptions[1], true, 0, 10, { from: cron })
            let pre_purchase_profile = await this.token.itemProfile(2)
            let pre_purchase_index = pre_purchase_profile._purchasers.length
            let pre_purchase_quantity = pre_purchase_profile._quantity
            expect(pre_purchase_index).equal(0)
            expect(pre_purchase_quantity).to.be.bignumber.equal(new BN(0))
            await this.token.purchaseItem(2, 2, { from: cron })
            await this.token.purchaseItem(2, 3, { from: cron })
            let post_purchase_profile = await this.token.itemProfile(2)
            let post_purchase_index = post_purchase_profile._purchasers.length
            let post_purchase_quantity = post_purchase_profile._quantity
            expect(post_purchase_index).equal(2)
            expect(post_purchase_quantity).to.be.bignumber.equal(new BN(0))
        })

        it('Items with finite purchasability can be created', async () => {
            await this.token.listItem(descriptions[1], false, 3, 10, { from: cron })
            let pre_purchase_profile = await this.token.itemProfile(2)
            let pre_purchase_index = pre_purchase_profile._purchasers.length
            let pre_purchase_quantity = pre_purchase_profile._quantity
            expect(pre_purchase_index).equal(0)
            expect(pre_purchase_quantity).to.be.bignumber.equal(new BN(3))
            await this.token.purchaseItem(2, 2, { from: cron })
            await this.token.purchaseItem(2, 3, { from: cron })
            let post_purchase_profile = await this.token.itemProfile(2)
            let post_purchase_index = post_purchase_profile._purchasers.length
            let post_purchase_quantity = post_purchase_profile._quantity
            expect(post_purchase_index).equal(2)
            expect(post_purchase_quantity).to.be.bignumber.equal(new BN(1))
        })

        it('Item is accessable in itemRegistry & displayed in activeItems', async () => {
            let index = new BN(1)
            let item = await this.token.itemRegistry(index)
            expect(item.description).equal(descriptions[0])
            let allActiveItems = await this.token.getActiveItems()
            expect(allActiveItems[0]).to.be.bignumber.equal(index)
        })

        it('activeSerial and itemSerial increment', async () => {
            let pre_activeSerial = await this.token.activeSerial()
            let pre_itemSerial = await this.token.itemSerial()
            await this.token.listItem(descriptions[1], false, 3, 10, { from: cron })
            let post_activeSerial = await this.token.activeSerial()
            let post_itemSerial = await this.token.itemSerial()
            expect(post_activeSerial).to.be.bignumber.equal(pre_activeSerial.add(new BN(1)))
            expect(post_itemSerial).to.be.bignumber.equal(pre_itemSerial.add(new BN(1)))
        })

        it('Listing returns item ID and emits "ItemListed()"', async () => {
            let expectedID = new BN(2)
            let { logs } = await this.token.listItem(descriptions[1], false, 3, 10, { from: cron })
            let res = logs[0].args[0]
            expect(res).to.be.bignumber.equal(expectedID)
            expectEvent.inLogs(logs, 'ItemListed', {
                itemID: expectedID
            })
        })
    })

    describe('Item purchasing:', () => {

        it('Items with inifinite purchasability can be bought', async () => {
            await this.token.listItem(descriptions[1], true, 0, 10, { from: cron })
            let { logs } = await this.token.purchaseItem(2, 2, { from: cron })
            expectEvent.inLogs(logs, 'ItemPurchased', {
                itemID: new BN(2),
                uuid: new BN(2)
            })
        })

        it('Items with finite purchasability can be bought while in stock', async () => {
            let { logs } = await this.token.purchaseItem(1, 2, { from: cron })
            expectEvent.inLogs(logs, 'ItemPurchased', {
                itemID: new BN(1),
                uuid: new BN(2)
            })
        })

        it('Users cannot purchase items they cannot pay for', async () => {
            await expectRevert(
                this.token.purchaseItem(1, 5, { from: cron }),
                "User has insufficient MUBC Token balance to purchase!"
            )
        })

        it('Out-of-stock items cannot be purchased', async () => {
            await this.token.purchaseItem(1, 2, { from: cron })
            await this.token.purchaseItem(1, 3, { from: cron })
            await expectRevert(
                this.token.purchaseItem(1, 4, { from: cron }),
                "Item is sold out!"
            )
        })

        it('Inactive items cannot be purchased', async () => {
            await this.token.delistItem(1, { from: cron })
            await expectRevert(
                this.token.purchaseItem(1, 2, { from: cron }),
                "Cannot purchase inactive item!"
            )
        })

        it('Users cannot purchase the same item twice', async () => {
            await this.token.purchaseItem(1, 3, { from: cron })
            await expectRevert(
                this.token.purchaseItem(1, 3, { from: cron }),
                "User has already purchased this item!"
            )
        })

        it('User balance decrements according to item cost', async () => {
            let pre_balance = await this.token.getBalance(2)
            await this.token.purchaseItem(1, 2, { from: cron })
            let post_balance = await this.token.getBalance(2);
            let cost = (await this.token.itemRegistry(1)).cost
            expect(pre_balance).to.be.bignumber.equal(post_balance.add(cost))
        })

        it('Purchasing emits "ItemPurchased"', async () => {
            let _itemID = new BN(1)
            let _uuid = new BN(3)
            let { logs } = await this.token.purchaseItem(_itemID, _uuid, { from: cron})
            expectEvent.inLogs(logs, 'ItemPurchased', {
                itemID: _itemID,
                uuid: _uuid
            })
        })
    })

    describe('Item delisting', () => {

        it('Items that are active can be delisted', async () => {
            let _itemID = new BN(1)
            let pre_state = (await this.token.itemRegistry(_itemID)).active
            let { logs } = await this.token.delistItem(_itemID, { from: cron })
            expectEvent.inLogs(logs, 'ItemDelisted', {
                itemID: _itemID
            })
            let post_state = (await this.token.itemRegistry(_itemID)).active
            expect(pre_state).to.be.true
            expect(post_state).to.be.false
        })

        it('Items that are inactive cannot be delisted', async () => {
            let _itemID = new BN(1)
            this.token.delistItem(_itemID, { from: cron })
            await expectRevert(
                this.token.delistItem(_itemID, {from: cron}),
                "Item has already been delisted/ expired!"
            )
        })

        it('activeItems no longer includes the delisted item & activeSerial decrements', async () => {
            let item_1 = new BN(1)
            let item_3 = new BN(3)
            await this.token.listItem(descriptions[1], true, 0, 1, { from: cron })
            await this.token.listItem(descriptions[2], true, 0, 1, { from: cron })
            await this.token.listItem(descriptions[3], true, 0, 1, { from: cron })
            let pre_serial = await this.token.activeSerial()
            let pre_activeItems = await this.token.getActiveItems()
            await this.token.delistItem(item_1, { from: cron })
            await this.token.delistItem(item_3, { from: cron })
            let post_serial = await this.token.activeSerial()
            let post_activeItems = await this.token.getActiveItems()
            expect(post_serial).to.be.bignumber.equal(pre_serial.sub(new BN(2)))
            let pre_1_found = false
            let pre_3_found = false
            let post_1_found = false
            let post_3_found = false
            for (let i = 0; i < pre_activeItems.length; i++) {
                if (pre_activeItems[i].toNumber() == item_1.toNumber())
                    pre_1_found = true;
                else if (pre_activeItems[i].toNumber() == item_3.toNumber())
                    pre_3_found = true;
            }
            for (let i = 0; i < post_activeItems.length; i++) {
                if (post_activeItems[i].toNumber() === item_1.toNumber())
                    post_1_found = true;
                else if (post_activeItems[i].toNumber() === item_3.toNumber())
                    post_3_found = true;
            }   
            expect(pre_1_found).to.be.true
            expect(pre_3_found).to.be.true
            expect(post_1_found).to.be.false
            expect(post_3_found).to.be.false
        })

        it('Delisting emits "ItemDelisted"', async () => {
            let _item = new BN(1)
            let { logs } = await this.token.delistItem(_item, { from: cron })
            expectEvent.inLogs(logs, 'ItemDelisted', {
                itemID: _item
            })
        })
    })

    describe('Item profiles:', () => {

        it('Querying nonexistent serial throws', async () => {
            await expectRevert(
                this.token.itemProfile(new BN(2)), 
                "Cannot query nonexistent item ID!"
            )
        })

        it('Profile returns description, fungibility, quantity, cost, active', async () => {
            let res = await this.token.itemProfile(new BN(1))
            console.log("Result: ", res)
            let _description = descriptions[0]
            let _fungibility = false
            let _quantity = new BN(2)
            let _cost = new BN(10)
            let _active = true
            expect(_description).to.equal(res._description)
            expect(_fungibility).to.equal(res._fungible)
            expect(_quantity).to.be.bignumber.equal(res._quantity)
            expect(_cost).to.be.bignumber.equal(res._cost)
            expect(_active).to.equal(res._active)
        })

        it('Profile returns uuid of all purchasers', async () => {
            let _itemID = new BN(1)
            let member_1 = new BN(2)
            let member_2 = new BN(3)
            await this.token.purchaseItem(_itemID, member_1, { from: cron })
            await this.token.purchaseItem(_itemID, member_2, { from: cron })
            let purchasers = (await this.token.itemProfile(_itemID))._purchasers
            let member_1_found = false
            let member_2_found = false
            for (let i = 0; i < purchasers.length; i++) {
                if (purchasers[i].toNumber() == member_1.toNumber())
                    member_1_found = true;
                else if (purchasers[i].toNumber() == member_2.toNumber())
                    member_2_found = true;
            }
            expect(member_1_found && member_2_found).to.be.true
        })
    })
})
   