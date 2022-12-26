const { network, ethers } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_PRICE, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("---------------------------")
    log("Deploying---- please wait")
    let EthUsdPriceFeedAddress
    const chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        const EthUsdPriceFeed = await ethers.getContract("MockV3Aggregator")
        EthUsdPriceFeedAddress = EthUsdPriceFeed.address
    } else {
        EthUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    log("------------------------------------------")

    const lowSvg = await fs.readFileSync("./images/dynamicNfts/frown.svg", {
        encoding: "utf8",
    })
    const highSvg = await fs.readFileSync("./images/dynamicNfts/happy.svg", {
        encoding: "utf8",
    })

    const args = [EthUsdPriceFeedAddress, lowSvg, highSvg]

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmation: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(dynamicSvgNft.address, args)
        log("----awaiting verification on etherscan")
    } else {
        console.log("The hardhat network cannot verify the network")
    }
}

module.exports.tags = ["all", "dynamicNft", "main"]
