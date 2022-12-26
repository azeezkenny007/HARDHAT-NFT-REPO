/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("dotenv").config()

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKET_CAP_API_KEY = process.env.COINMARKET_CAP_API_KEY

module.exports = {
    defaultNetwork: "hardhat",
    solidity:{
        compilers:[{version:"0.8.9"},{version:"0.6.6"}]
    },
     
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },

        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },

        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
        },

        
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKET_CAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        
        user: {
            default: 1,
        },
    },
    mocha: {
        timeout: 900000,
    },  
}
