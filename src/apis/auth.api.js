let Router = require('@koa/router')
let router = new Router()

let verify = async (_token) => {
    let ticket = await oauth.verifyIdToken({
        idToken: _token,
        audience: process.env.OAUTH
    })
    let payload = ticket.getPayload()
    let userid = payload['sub']
}

let sign = async (token) => {
    return jwt.sign(token, process.env.JWT)
}

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

module.exports = {
    router,
    auth
}