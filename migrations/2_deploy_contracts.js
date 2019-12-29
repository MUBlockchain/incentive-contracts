require("dotenv").config
const MUBCTokenContract = artifacts.require("./MUBCToken")

module.exports = async (deployer) => {
    await deployer.deploy(MUBCTokenContract)
}