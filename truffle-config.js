const HDWalletProvider = require('@truffle/hdwallet-provider')
require("dotenv").config()

module.exports = {

  networks: {
    development: {
      provider: () => { return new HDWalletProvider(process.env.MNEMONIC, 'http://0.0.0.0:8545') },
      network_id: "*",
    },
    ropsten: {
      provider: () => { return new HDWalletProvider(process.env.MNEMONIC, 'https://ropsten.' + process.env.INFURA) },
      network_id: "3",
    },
    rinkeby: {
      provider: () => { return new HDWalletProvider(process.env.MNEMONIC, 'https://rinkeby.' + process.env.INFURA) },
      network_id: "4",
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
