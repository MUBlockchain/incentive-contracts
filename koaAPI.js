require('dotenv').config()

let TruffleContract = require("@truffle/contract")
let HDWalletProvider = require("@truffle/hdwallet-provider")
let provider = new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.' + process.env.INFURA)
let abi = require('./build/contracts/MUBCToken.json')
let contract = TruffleContract(abi)
contract.setProvider(provider)
let instance;

let accounts = [
    'gilcrejp',
    'cookepf',
    'overbetn',
    'bargera2',
    'dearthjd3',
    'stanam',
    'bartkoas',
    'blackba2',
    'grothsd',
    'czajkaat'
]
let names = [
    'Jack Gilcrest',
    'Peter Cooke',
    'Torsten Overbeck',
    'Ashton Barger',
    'Jake Dearth',
    'Alex Stan',
    'Alexandra Bartkoske',
    'Allie Blackburn',
    'Sam Groth',
    'Adrian Czajka'
]

/**
 * Initialize smart contract
 */
let init = async () => {
    instance = await contract.at(process.env.RINKEBY_ADDRESS)
    let config = true;
    if (config) {
        await register()
        await mint()
    }
    await allBalances()
}

let register = async () => {
    for (let i = 0; i < accounts.length; i++) {
        let uuid = await instance.uuidLookUp(accounts[i])
        if(uuid.toNumber() == 0) {
            console.log("New Registration(" + accounts[i] + ":" + names[i] + ")")
            await instance.register(accounts[i], names[i], 2, {from: provider.addresses[0]}) //2 = exec role
        }
        let serial = await instance.getUserSerial();
        console.log("Registration Iteration #" + i + "; User Serial #" + serial.toString())
    }

}

let mint = async () => {
    for (let i = 1; i <= accounts.length; i++) {
        let gift = Math.floor(Math.random() * 10)
        let balance = await instance.getBalance(i)
        console.log("Balance of " + accounts[i-1] + "(uuid: " + i + ") pre-mint: " + balance.toString())
        await instance.mint(i, gift, 1, {from: provider.addresses[0]})
        balance = await instance.getBalance(i)
        console.log("Balance of " + accounts[i-1] + "(uuid: " + i + ") post-mint: " + balance.toString())
    }
}

let allBalances = async () => {
    let table = []
    let serial = await instance.getUserSerial()
    for (let i = 1; i <= serial.toNumber(); i++) {
        let ret = await instance.getBalance(i)
        table[i-1] = ret.toNumber();
    }
    for (let i = 0; i < table.length; i++)
        console.log("Account " + accounts[i] + "balance: " + table[i])
    return table
}

let getBalance = async (_uuid) => {
    return (await instance.getBalance(_uuid)).toNumber()
}

init()

let Koa = require('koa')
let Router = require('@koa/router')

let API = new Koa()
let router = new Router()

router.get('/api/balance', async (ctx) => {
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
API.use(router.routes()).use(router.allowedMethods())
API.listen(3000)