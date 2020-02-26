let Prep = require('./rinkeby.prep.js')
let Driver = require('./driver.js')
let Koa = require('koa')
let Router = require('@koa/router')

let routes = () => {
    this.router.get('/api/balance', async (ctx) => {
        let uniqueID = ctx.request.query.uniqueid
        let uuid = await instance.uuid(uniqueID)
        let balance = await instance.getBalance(uuid)
        let name = await instance.profile(uuid)._name
        ctx.body = {
            "name": name,
            "uniqueID": uniqueID,
            "balance": balance.toNumber(),
            "uuid": uuid.toNumber()
        }
    })
    this.router.get('/api/items', async (ctx) => {
        let serial = ctx.request.query.serial

        let res = await this.instance.itemProfile(serial)
        console.log(res)
        ctx.body = {
            "description": res._description,
            "fungible": res._fungibility,
            "quantity": res._quantity,
            "cost": res._cost,
            "active": res._active,
            "purchasers": res._purchasers
        }
    })
}

let initAPI = () => {
    this.api = new Koa()
    this.router = new Router()
    routes()
    this.api.use(this.router.routes()).use(this.router.allowedMethods())
    this.api.listen(3000)
}

let initContract = async () => {
    this.provider = Prep.provider()
    this.instance = await Prep.instance(this.provider)
    this.cron = this.provider.addresses[0]
    await Prep.dummyData(this.instance, this.cron)
    await Prep.randomAirdrop(this.instance, this.cron)
    
    Driver.init(this.instance)

}
initContract()
initAPI()




