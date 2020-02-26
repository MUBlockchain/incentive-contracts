require('dotenv').config()
let TruffleContract = require("@truffle/contract")
let HDWalletProvider = require("@truffle/hdwallet-provider")
let abi = require('../build/contracts/MUBCItemShop.json')
let dummy_data = require('./dummy_data.json')

exports.provider = () => { return new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.' + process.env.INFURA) }

exports.instance = async (provider) => {
    let contract = TruffleContract(abi)
    contract.setProvider(provider)
    let instance = await contract.at(module.exports.address())
    return instance
}

exports.address = () => { return abi.networks['4'].address }

exports.dummyData = async (instance, cron) => {
    let users = dummy_data[0]
    let items = dummy_data[1]
    await dummyUsers(instance, users, cron)
    await dummyItems(instance, items, cron)
}

dummyUsers = async (instance, users, cron) => {
    for (let i = 0; i < users.length; i++) {
        let uuid = await instance.uuid(users[i].uniqueID)
        if(uuid.toNumber() == 0)
            await instance.register(users[i].uniqueID, users[i].name, 2, {from: cron}) //2 = exec role
    }
}

dummyItems = async (instance, items, cron) => {
    let serial = await instance.itemSerial()
    if(serial.toNumber < 1) {
        for (let i = 0; i < items.length; i++) 
            await instance.listItem(items[i].description, items[i].fungibile, items[i].quantity, items[i].cost, {from: cron})
    }
}

module.exports.randomAirdrop = async (instance, cron) => {
    let serial = (await instance.uuidSerial()).toNumber()
    for (let i = 1; i <= serial; i++)
        await instance.mint(i, (Math.floor(Math.random() * 10)), 1, {from: cron})
}
