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
 *   - Item creation
 *   - Item transactions
 *   - Item expiry
 *   - Item profiles
 *   - uniqueID internal permissions
 * Bounty Testing:
 *   - Bounty creation
 *   - Bounty transactions
 *   - Bounty expiry
 *   - Bounty profiles
 *   - uniqueID internal permissions
 */
let { expect } = require('chai')
let { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
let MUBCToken = artifacts.require('./MUBCCore')

contract('MUBCToken: Core Functionality', (accounts) => {

    let cron = accounts[0];
    let uniqueIDs = ['executive_0', 'executive_1', 'member_0', 'member_1', 'member_2']
    let names = ['name_0', 'name_1', 'name_2', 'name_3', 'name_4']


    beforeEach(async () => {
        this.token = await MUBCToken.new({ from: cron })
        await this.token.register(uniqueIDs[0], names[0], true, { from: cron })
        await this.token.register(uniqueIDs[1], names[1], false, { from: cron })
        //console.log("Instance keys: ", Object.keys(this.token))
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

        it('@TODO: Profile returns all purchased items', async () => {
            //to be implemented in a bit
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