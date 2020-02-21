require("dotenv").config
const MUBCTokenContract = artifacts.require("./MUBCCore")

module.exports = async (deployer) => {
    await deployer.deploy(MUBCTokenContract)
}