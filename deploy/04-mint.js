const { network,ethers } = require("hardhat")
const { DECIMALS, INITIAL_PRICE } = require("../helper-hardhat-config")
const { developmentChains } = require("../helper-hardhat-config")


const BASE_FEE = "250000000000000000" // 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deployer } = await getNamedAccounts()
    //Minting for the basic Nft
    console.log(`minting for the basic nft`)
    const basicNft = await ethers.getContract("BasicNft",deployer)
    const mintBasicNft = await basicNft.mintNfts()
    await mintBasicNft.wait(1)

    console.log(`Basic nft of index 0 have token URI ${await basicNft.tokenURI(0)}`)
    
    console.log("---------------------------------------------------")
    // End of the Mint function for Basic Nft

    // Minting the RandomIpfsNft
    const randomIpfsNft = await ethers.getContract("RandomipfsNft",deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    await new Promise(async (resolve, reject) => {
        setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 600000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            resolve()
        })
        const mintRandomIpfsNft = await randomIpfsNft.requestNft({value:mintFee.toString()})
        const mintRandomIpfsNftReceipt = await mintRandomIpfsNft.wait(1)
        if(developmentChains.includes(network.name)){
            const requestId = mintRandomIpfsNftReceipt.events[1].args.requestId.toString()
            const VrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock",deployer)
            await VrfCoordinatorV2Mock.fulfillRandomWords(requestId,randomIpfsNft.address)
        }
    })
            console.log("---------------------------------------------------")
            console.log(`RandomIpfsNft of index 0 have token URI ${await randomIpfsNft.tokenURI(0)}`)
            console.log("---------------------------------------------------")
            // End of minting the RandomIpfsNft

    
    //Minting the DynamicsvgNft
    const highValue= ethers.utils.parseEther("4000")
    const DynamicSvgNft =await ethers.getContract("DynamicSvgNft",deployer)
    const mintDynamicNft = await DynamicSvgNft.mintNft(highValue.toString())
    const mintDynamicNftReceipt = await mintDynamicNft.wait(1)
    console.log("---------------------------------------------------")
    console.log(`DynamicNft of index 0 have token URI ${await DynamicSvgNft.tokenURI(1)}`)
    console.log("---------------------------------------------------")

    
}

module.exports.tags=["all","mint"]