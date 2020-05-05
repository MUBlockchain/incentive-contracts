/**
 * MUBC Incentive Token Smart Contract Suite
 * @author Miami University Blockchain Club
 * @date 02.20.2020
 * 
 * Core Testing:
 *   - Deployer/ CRON external permissions 
 *   - User registration
 *   - Token minting and balances
 *   - Circuit breaker
 *   - User profiles
 *   - uniqueID internal permissions
 * Item Testing: 
 *   - Item listing
 *   - Item purchasing
 *   - Item delisting
 *   - Item profiles
 *   - uniqueID internal permissions
 * @TODO Bounty Testing:
 *   - Bounty creation
 *   - Bounty transactions
 *   - Bounty expiry
 *   - Bounty profiles
 *   - uniqueID internal permissions
 */
let CoreTest = require('./core.test.js')
let { expect } = require('chai')
let { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
let MUBCToken = artifacts.require('./MUBCItems')

contract('MUBCToken: Core Functionality', (accounts) => {

    let cron = accounts[0];
    let uniqueIDs = ['executive_0', 'executive_1', 'member_0', 'member_1', 'member_2']
    let names = ['name_0', 'name_1', 'name_2', 'name_3', 'name_4']

    beforeEach(async () => {
        this.token = await MUBCToken.new({ from: cron })
        await this.token.register(uniqueIDs[0], names[0], true, { from: cron })
        await this.token.register(uniqueIDs[1], names[1], false, { from: cron })
    })

    describe('Deployer/ cron external permissions ("onlyCron()"):', () => {

        it('Cron address is publically accessable', async () => {
            let address = await this.token.cron()
            expect(address).to.be.equal(cron)
        })

        it('Deploying address (cron) can access methods modified by "onlyCron()"', async () => {
            let uuidSerial = await this.token.uuidSerial()
            let { logs } = await this.token.register(uniqueIDs[2], names[2], false, { from: cron})
            expectEvent.inLogs(logs, 'UserRegistered', { uuid: uuidSerial.add(new BN(1)) })
        })

        it('Arbitrary addresses (not cron) revert from "onlyCron()"', async () => {
            await expectRevert(
                this.token.register(
                    uniqueIDs[2],
                    names[2],
                    false,
                    { from: accounts[1] }
                ),'Executing address is not the CRON address!')
        })
    })

    describe('User registration:', () => {

        it('New users can be enrolled as a member', async () => {
            let uuid = await this.token.uuid(uniqueIDs[2])
            expect(uuid).to.be.bignumber.equal(new BN(0))
            let { logs } = await this.token.register(uniqueIDs[2], names[2], false, { from: cron })
            uuid = logs[0].args[0];
            expect(uuid).to.be.bignumber.equal(new BN(3))
            let executive_bool = await this.token.executive(uuid)
            expect(executive_bool).to.be.false
        })

        it('New users can be enrolled as an executive', async () => {
            let uuid = await this.token.uuid(uniqueIDs[2])
            expect(uuid).to.be.bignumber.equal(new BN(0))
            let { logs } = await this.token.register(uniqueIDs[2], names[2], true, { from: cron })
            uuid = logs[0].args[0];
            expect(uuid).to.be.bignumber.equal(new BN(3))
            let executive_bool = await this.token.executive(uuid)
            expect(executive_bool).to.be.true
        })

        it('Existing users cannot be enrolled', async () => {
            await this.token.register(uniqueIDs[2], names[2], false, { from: cron })
            await expectRevert(
                this.token.register(
                    uniqueIDs[2],
                    names[2],
                    false,
                    {from: cron }
                ), 'User is already enrolled!')
        })

        it('Registration returns uuid and emits "userRegistered()" event', async () => {
            let uuidExpected = (await this.token.uuidSerial()).add(new BN(1))
            let { logs } = await this.token.register(uniqueIDs[2], names[2], false, { from: cron })
            expectEvent.inLogs(logs, 'UserRegistered', { uuid: uuidExpected })
            expect(logs[0].args[0]).to.be.bignumber.equal(uuidExpected)
        })
    })

    describe('Token minting and balances:', () => {

        it('New MUBC Token can be minted to existing users', async () => {
            let mint_exec = new BN(13)
            let mint_member = new BN(407)
            let expected_supply = mint_exec.add(mint_member)
            let executive_pre_balance = await this.token.getBalance(new BN(1))
            let member_pre_balance = await this.token.getBalance(new BN(2))
            let pre_supply = await this.token.tokenSupply()
            expect(executive_pre_balance).to.be.bignumber.equal(new BN(0))
            expect(member_pre_balance).to.be.bignumber.equal(new BN(0))
            expect(pre_supply).to.be.bignumber.equal(new BN(0))
            await this.token.mint(1, mint_exec, 0, { from: cron })
            await this.token.mint(2, mint_member, 0, { from: cron })
            let executive_post_balance = await this.token.getBalance(new BN(1))
            let member_post_balance = await this.token.getBalance(new BN(2))
            let post_supply = await this.token.tokenSupply()
            expect(post_supply).to.be.bignumber.equal(expected_supply)
            expect(executive_post_balance).to.be.bignumber.equal(mint_exec)
            expect(member_post_balance).to.be.bignumber.equal(mint_member)
        })

        it('New MUBC Token cannot be minted to non-existent users', async () => {
            await expectRevert(
                this.token.mint(4, (new BN(11)), 0, { from: cron }),
                "Cannot mint to unused uuid index!"
                )
        })

        it('Minting emits "IncentiveMinted()', async () => {
            let token_value = new BN(400)
            let { logs } = await this.token.mint(1, token_value, 0, { from: cron })
            expectEvent.inLogs(logs, 'IncentiveMinted', {
                value: token_value,
                uuid: new BN(1),
                by: new BN(0)
            })
        })
    })

    describe('Circuit breaker', () => {

        it('The circuit breaker state can be toggled on and off', async () => {
            let state = await this.token.circuitBroken()
            expect(state).to.be.false
            await this.token.flipBreaker(0)
            state = await this.token.circuitBroken()
            expect(state).to.be.true
        })

        it('The contract is non-functional while the circuit is broken', async () => {
            await this.token.flipBreaker(0)
            await expectRevert(
                this.token.mint(0, (new BN(11)), 0, { from: cron}),
                'Contract is not active: the circuit breaker is flipped!'
            )
        })

        it('Breaker flip returns state and emits "BreakerFlipped()"', async () => {
            let { logs } = await this.token.flipBreaker(0)
            expect(logs[0].args[0]).to.be.true;
            expectEvent.inLogs(logs, 'BreakerFlipped', {
                state: true,
                by: new BN(0)
            })
        })
    })

    describe('User profiles', () => {

        it('Non-existent profile queries revert', async () => {
            await expectRevert(
                this.token.profile(4),
                "Cannot profile account that does not exist!"
            )
        })

        it('uniqueIDs can look up uuids', async () => {
            let uuid = await this.token.uuid(uniqueIDs[0])
            expect(uuid).to.be.bignumber.equal(new BN(1))
        })

        it('Profile returns uniqueID, name, balance', async () => {
            let expectedBalance = new BN(4130)
            await this.token.mint(1, expectedBalance, 0, { from: cron })
            let res = await this.token.profile(1)
            expect(res._uniqueID).to.equal(uniqueIDs[0])
            expect(res._name).to.equal(names[0])
            expect(res._balance).to.be.bignumber.equal(expectedBalance)
        })

        it('@TODO: Profile returns all completed bounties', async () => {
            //to be implemented in a bit
        })

        it('Profile returns all purchased items', async () => {
            let _member = new BN(2)
            await this.token.mint(_member, 3, 0)
            let _item1 = new BN(1)
            let _item2 = new BN(2)
            let _item3 = new BN(3)
            let pre_purchases = (await this.token.profile(_member))._purchases
            await this.token.listItem("desc_1", 10, 1, { from: cron })
            await this.token.listItem("desc_2", 10, 1, { from: cron })
            await this.token.listItem("desc_3", 10, 1, { from: cron })
            await this.token.purchaseItem(_item1, _member, { from: cron })
            await this.token.purchaseItem(_item2, _member, { from: cron })
            await this.token.purchaseItem(_item3, _member, { from: cron })
            let post_purchases = (await this.token.profile(_member))._purchases
            let found_1 = false;
            let found_2 = false;
            let found_3 = false;
            for (let i = 0; i < post_purchases.length; i++) {
                if (post_purchases[i].toNumber() == _item1.toNumber())
                    found_1 = true;
                else if (post_purchases[i].toNumber() == _item2.toNumber())
                    found_2 = true;
                else if (post_purchases[i].toNumber() == _item3.toNumber())
                    found_3 = true;
            }
            expect(pre_purchases.length == 0).to.be.true
            expect(found_1 && found_2 && found_3).to.be.true
        })
    })

    describe('uniqueID internal permissions ("onlyExecutive()"):', () => {

        describe('Token minting permissions:', () => {

            it('Executive accounts can mint MUBC Token', async () => {
                let expectedBalance = new BN(999)
                let { logs } = await this.token.mint(1, expectedBalance, 0, { from: cron })
                expectEvent.inLogs(logs, 'IncentiveMinted', {
                    value: expectedBalance,
                    uuid: new BN(1),
                    by: new BN(0)
                })
            })

            it('Member accounts cannot mint MUBC Token', async () => {
                await expectRevert(
                    this.token.mint(1, 60, 4, { from: cron }),
                    "Cannot execute: User is not a club Executive!"
                )
            })
        })

        describe('Circuit breaker permissions:', () => {

            it('Executive accounts can flip the circuit breaker', async () => {
                let { logs } = await this.token.flipBreaker(0, { from: cron })
                expectEvent.inLogs(logs, 'BreakerFlipped', {
                    state: true,
                    by: new BN(0)
                })
            })

            it('Member accounts cannot flip the circuit breaker', async () => {
                await expectRevert(
                    this.token.flipBreaker(4, { from: cron }),
                    "Cannot execute: User is not a club Executive!"
                )
            })
        })
    })
})

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
        await this.token.listItem(descriptions[0], 2, 10)
    })

    describe('Item listing:', () => {

        it('Items with finite purchasability can be created', async () => {
            await this.token.listItem(descriptions[1], 3, 10, { from: cron })
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
            await this.token.listItem(descriptions[1], 3, 10, { from: cron })
            let post_activeSerial = await this.token.activeSerial()
            let post_itemSerial = await this.token.itemSerial()
            expect(post_activeSerial).to.be.bignumber.equal(pre_activeSerial.add(new BN(1)))
            expect(post_itemSerial).to.be.bignumber.equal(pre_itemSerial.add(new BN(1)))
        })

        it('Listing returns item ID and emits "ItemListed()"', async () => {
            let expectedID = new BN(2)
            let { logs } = await this.token.listItem(descriptions[1], 3, 10, { from: cron })
            let res = logs[0].args[0]
            expect(res).to.be.bignumber.equal(expectedID)
            expectEvent.inLogs(logs, 'ItemListed', {
                itemID: expectedID
            })
        })
    })

    describe('Item purchasing:', () => {

        it('Items with inifinite purchasability can be bought', async () => {
            await this.token.listItem(descriptions[1], 10, 10, { from: cron })
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
            await this.token.listItem(descriptions[1], 1, 1, { from: cron })
            await this.token.listItem(descriptions[2], 1, 1, { from: cron })
            await this.token.listItem(descriptions[3], 1, 1, { from: cron })
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

        it('Profile returns description, quantity, cost, active', async () => {
            let res = await this.token.itemProfile(new BN(1))
            let _description = descriptions[0]
            let _quantity = new BN(2)
            let _cost = new BN(10)
            let _active = true
            expect(_description).to.equal(res._description)
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