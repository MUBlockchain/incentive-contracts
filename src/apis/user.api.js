/**
 * User API Routes
 * @author MU Blockchain
 * @date 05.04.2020
 * 
 * Koa Router for MU Blockchain Token User data
 */

let Driver = require('../driver.js')
let Router = require('@koa/router')
let router = new Router()
let driver, auth = null

/**
 * Initialize this api by passing in a smart contract driver and the auth api
 * @param {*} _driver driver.js
 * @param {*} _auth auth.api.js
 */
let init = (_driver, _auth) => {
    driver = _driver
    auth = _auth
}

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

module.exports = {
    router: router,
    init: init,
}