let Prep = require('./rinkeby.prep.js')
let MUBCItemShopDriver = require('./driver.js')
let Koa = require('koa')
let Router = require('@koa/router')

let driver = null

let routes = () => {

    this.router.get('/api/user/:uniqueid/uuid', async (ctx) => {
        try {
            let uuid = await driver.uuid(ctx.params.uniqueid)
            ctx.body = {
                "uuid": uuid
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/user/serial', async (ctx) => {
        try {
            ctx.body = {
                "serial": await driver.uuidSerial()
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/user/:uniqueid/balance', async (ctx) => {
        try {
            let uuid = await driver.uuid(ctx.params.uniqueid)
            let balance = await driver.balance(uuid)
            ctx.body = {
                "balance": balance
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }   
    })

    this.router.get('/api/user/:uniqueid/profile', async (ctx) => {
        try {
            let uuid = await driver.uuid(ctx.params.uniqueid)
            let profile = await driver.profile(uuid)
            ctx.body = {
                "uniqueID": profile.uniqueID,
                "name": profile.name,
                "uuid": uuid,
                "balance": profile.balance,
                "purchases": profile.purchases
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
        
    })

    this.router.get('/api/user/:uniqueid/mint', async (ctx) => {
        try {
            let to = await driver.uuid(ctx.params.uniqueid)
            let as = await driver.uuid(ctx.request.query.as)
            let balances = await driver.mint(to, ctx.request.query.quantity, as)
            ctx.body = {
                "recipient": ctx.request.query.to,
                "quantity": ctx.request.query.quantity,
                "pre-mint_balance": balances.preBalance,
                "post-mint_balance": balances.postBalance,
                "minter": ctx.request.query.as
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/item/serial', async (ctx) => {
        try {
            ctx.body = {
                "serial": await driver.itemSerial()
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/item/activeserial', async (ctx) => {
        try {
            ctx.body = {
                "serial": await driver.activeSerial()
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/item/active', async (ctx) => {
        try {
            let active = await driver.activeItems()
            ctx.body = {
                "active": active
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/item/:serial/profile', async (ctx) => {
        try {
            let item = await driver.itemProfile(ctx.params.serial)
            ctx.body = {
                "serial" : item.serial,
                "description": item.description,
                "fungible": item.fungible,
                "quantity": item.quantity,
                "cost": item.cost,
                "active": item.active,
                "purchasers": item.purchasers
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
        
    })

    this.router.get('/api/item/:serial/purchase', async (ctx) => {
        try {
            await driver.purchase(ctx.params.serial, ctx.request.query.uniqueid)
            ctx.body = {
                "purchaser": ctx.request.query.uniqueid,
                "item": ctx.params.serial
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/item/list', async (ctx) => {
        let description = ctx.request.query.description
        let fungible = ctx.request.query.description
        let quantity = ctx.request.query.quantity
        let cost = ctx.request.query.cost
        try {
            let serial = await driver.list(description, fungible, quantity, cost)
            let item = await driver.itemProfile(serial)
            ctx.body = {
                "serial" : item.serial,
                "description": item.description,
                "fungible": item.fungibility,
                "quantity": item.quantity,
                "cost": item.cost,
                "active": item.active,
                "purchasers": item.purchasers
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
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

let initContract = async (mint) => {
    this.provider = Prep.provider()
    this.instance = await Prep.instance(this.provider)
    this.cron = this.provider.addresses[0]
    await Prep.dummyData(this.instance, this.cron)
    if (mint)
        await Prep.randomAirdrop(this.instance, this.cron)
    

}

let init = async () => {
    console.log("Running MUBCToken API Service")
    await initContract(false)
    console.log("Contract Initialized")
    driver = new MUBCItemShopDriver(this.instance)
    console.log("Driver Initialized")
    await initAPI()
    console.log("API Initialized")
}
init()




