const HDWalletProvider = require("truffle-hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    rinkeby: {
      provider() {
        return new HDWalletProvider(
          process.env.METAMASK_SEED_PHRASE,
          process.env.INFURA_ENDPOINT
        );
      },
      network_id: 4,
      gas: 4_500_000,
      gasPrice: 10_000_000_000,
    },
  },
  mocha: {},
  compilers: {
    solc: {},
  },
};
