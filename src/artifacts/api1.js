require('dotenv').config()

let Prep = require('./rinkeby.prep.js')
let Driver = require('./driver.js')
let Koa = require('koa')
let Router = require('@koa/router')
let mysql = require('mysql2/promise')
let jwt = require('jsonwebtoken')
let {OAuth2Client} = require('google-auth-library')
let oauth = new OAuth2Client(process.env.OAUTH)
let driver = null
let db = null

let announcements_api = require('./apis/announcements.api')

let auth = async (ctx, next) => {
    let token = ctx.query.token
    try {
        ctx.token = jwt.verify(token, process.env.JWT)
        await next()
    } catch (err) {
        ctx.status = 403
        ctx.body = err.message
    }
}

let routes = () => {

    router.get('/api/signin', async (ctx) => {
        let id = ctx.query.id
        console.log("id:", id)
        try {
            await verify(id)
            ctx.body = {
                "token": id
            }
        } catch (err) {
            ctx.status = 403
            ctx.body = err.message
        }
    })

    let openDB = async () => {
        db = await mysql.createConnection({
            host: process.env.DB_URL,
            user: process.env.DB_USER,
            password: process.env.DB_SECRET,
            database: "mubc"
        })
    }
    
    router.get('/list', auth, async (ctx) => {
        await openDB()
        try {
            let [rows] = await db.execute("SELECT * FROM Announcements")
            ctx.body = {
                "announcements": rows
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })
    
    router.get('/add', auth, async (ctx) => {
        await openDB()
        try {
            let [rows] = await db.execute(
                'INSERT INTO Announcements (announcement, title, author) values ( "' +
                ctx.request.query.announcement + '", "' +
                ctx.request.query.title + '", "' +
                ctx.request.query.author + '");'
            )
            ctx.body = {
                "announcements": rows
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    router.get('/api/user/register', auth, async (ctx) => {
        try {
            let uniqueID = ctx.request.query.uniqueid
            let name = ctx.request.query.name
            let executive = ctx.request.query.executive
            await driver.register(uniqueID, name, executive)
            let uuid = await driver.uuid(uniqueID)
            ctx.body = {
                "uniqueID": uniqueID,
                "uuid": uuid
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })
    
    router.get('/api/user/all', auth, async (ctx) => {
        try {
            let profiles = await driver.allProfile()
            ctx.body = {
                "profiles": profiles
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })
    
    router.get('/api/user/:uniqueid/uuid', auth, async (ctx) => {
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
    
    router.get('/api/user/serial', auth, async (ctx) => {
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
    
    router.get('/api/user/:uniqueid/balance', auth, async (ctx) => {
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
    
    router.get('/api/user/:uniqueid/profile', auth, async (ctx) => {
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
    
    router.get('/api/user/:uniqueid/mint', auth, async (ctx) => {
        try {
            let to = await driver.uuid(ctx.params.uniqueid)
            let as = await driver.uuid(ctx.request.query.as)
            console.log('as: ', as)
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

    this.router.get('/api/item/serial', auth, async (ctx) => {
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

    this.router.get('/api/item/activeserial', auth, async (ctx) => {
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

    this.router.get('/api/item/active', auth, async (ctx) => {
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

    this.router.get('/api/item/activeindex', auth, async (ctx) => {
        try {
            let active = await driver.activeIndex()
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

    this.router.get('/api/item/:serial/profile', auth, async (ctx) => {
        try {
            let item = await driver.itemProfile(ctx.params.serial)
            ctx.body = {
                "serial": item.serial,
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

    this.router.get('/api/item/:serial/purchase', auth, async (ctx) => {
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

    //new
    this.router.get('/api/item/:serial/delist', auth, async (ctx) => {
        try {
            await driver.delist(ctx.params.serial)
            ctx.body = {
                "item": ctx.params.serial,
                "activeIndex": await driver.activeIndex()
            }
        } catch (err) {
            ctx.response.status = 500
            ctx.body = {
                "error": err.message
            }
        }
    })

    this.router.get('/api/item/list', auth, async (ctx) => {
        let description = ctx.request.query.description
        let fungible = ctx.request.query.description
        let quantity = ctx.request.query.quantity
        let cost = ctx.request.query.cost
        try {
            let serial = await driver.list(description, fungible, quantity, cost)
            let item = await driver.itemProfile(serial)
            ctx.body = {
                "serial": item.serial,
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
    this.router.use('/api/announcements', announcements_api)
    routes()
    this.api.use(this.router.routes()).use(this.router.allowedMethods())
    this.api.listen(3001)
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
    console.log("Ethereum Contract Connection Established")
    driver = new Driver(this.instance)
    console.log("Driver Initialized")
    await openDB();
    console.log("MySQL Connection Established")
    await initAPI()
    console.log("API Initialized")
}
init()




