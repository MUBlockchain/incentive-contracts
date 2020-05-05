require("dotenv").config
const MUBCTokenContract = artifacts.require("./MUBCItems")

module.exports = async (deployer) => {
    await deployer.deploy(MUBCTokenContract)
}