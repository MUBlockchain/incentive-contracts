require("dotenv").config
const MUBCTokenContract = artifacts.require("./MUBCItemShop")

module.exports = async (deployer) => {
    await deployer.deploy(MUBCTokenContract)
}