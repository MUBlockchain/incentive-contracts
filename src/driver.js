/**
 * Full web3JS wrapper for the MUBCItemShop contract
 */
class MUBCItemShopDriver {
    
    constructor (_contract) {
        this.contract = _contract
        this.cron = this.contract.cron()
    }

    async uuid(uniqueID) {
        let ret = await this.contract.uuid(uniqueID)
        return ret.toNumber()
    }
    
    async uuidSerial() {
        return (await this.contract.uuidSerial()).toNumber()
    }
    
    async balance(_uuid) {
        let ret = await this.contract.getBalance(_uuid)
        return ret.toNumber()
    }
    
    async mint(_to, _quantity, _as) {
        let balances = {}
        balances.preBalance = (await this.contract.getBalance(_to)).toNumber()
        await this.contract.mint(_to, _quantity, _as, {from: await this.cron})
        balances.postBalance = (await this.contract.getBalance(_to)).toNumber()
        return balances
    }
    
    async profile(_uuid) {
        let profile = {}
        let ret = await this.contract.profile(_uuid)
        profile.uniqueID = ret._uniqueID
        profile.name = ret._name
        profile.balance = ret._balance.toNumber()
        profile.purchases = ret._purchases.map(i => i.toNumber())
        return profile
    }
    
    async itemSerial() {
        return (await this.contract.itemSerial()).toNumber()
    }

    async activeSerial() {
        return (await this.contract.activeSerial()).toNumber()
    }

    async activeIndex() {
        let active = []
        let serial = await this.itemSerial()
        for (let i = 1; i <= serial; i++)
            active[i-1] = await this.contract.activeItems(i)
        return active.map(i => i.toNumber())
    }

    async activeItems() {
        let index = await this.activeIndex()
        let active = []
        for (let i = 0; i < index.length; i++) 
            active[i] = await this.itemProfile(i+1)
        return active
    }
    
    async itemProfile(_serial) {
        let profile = {}
        let ret = await this.contract.itemProfile(_serial)
        profile.serial = _serial
        profile.description = ret._description
        profile.fungible = ret._fungible
        profile.quantity = ret._quantity.toNumber()
        profile.cost = ret._cost.toNumber()
        profile.active = ret._active
        profile.purchasers = ret._purchasers.map(i => i.toNumber())
        return profile
    }
    
    async purchase(_serial, _as) {
        let uuid = await this.uuid(_as)
        await this.contract.purchaseItem(_serial, uuid, {from: await this.cron})
    }

    async list(_description, _fungible, _quantity, _cost) {
        let ret = await this.contract.listItem(_description, _fungible, _quantity, _cost, {from: await this.cron})
        return ret.logs[0].args.itemID.toNumber()
    }
}

module.exports = MUBCItemShopDriver