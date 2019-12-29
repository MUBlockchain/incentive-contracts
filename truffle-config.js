const HDWalletProvider = require('truffle-hdwallet-provider')
require("dotenv").config ()

console.log("UIFHIEUFHIUWEFHIUQEWHFIUWFHDIU: ", process.env.INFURA_API)
module.exports = {

  networks: {
    development: {
      provider: () => { return new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_API) },
      network_id: "3",
    }  
  },
  compilers: {
    solc: {
      version: "0.5.11",
      settings: {
       optimizer: {
         enabled: false,
         runs: 200
       }
      }
    }
  }
}
