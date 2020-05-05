/**
 * Announcements API routes & SQL functionality
 * @author MU Blockchain
 * @date 05.04.2020
 * 
 * Koa Router for MU Blockchain Announcements
 * Connection to S3 MySQL instance via mysql2 import.
 */

let Router = require('@koa/router')
let router = new Router()
let mysql = require('mysql2/promise')

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

module.exports = router