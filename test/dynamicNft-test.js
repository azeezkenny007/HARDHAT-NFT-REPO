const {deployments, getNamedAccounts, ethers, network} = require("hardhat")
const {networkConfig} = require("../helper-hardhat-config")
const fs = require("fs")
const {assert,expect} = require("chai")
describe("DynamicSvgNft",()=>{
         let DynamicSvgNft,MockV3Aggregator,chainId
      beforeEach(async()=>{
          chainId = network.config.chainId
         deployer = (await getNamedAccounts()).deployer
         await deployments.fixture(["main"])
         DynamicSvgNft = await ethers.getContract("DynamicSvgNft")
         MockV3Aggregator = await ethers.getContract("MockV3Aggregator")
      })

      describe("Body",()=>{
         it("shows that the tokenId initailization is 0",async()=>{
            const expectedValue = await DynamicSvgNft.getTokenCounter()
            assert.equal(expectedValue.toString(),"0")
       })
 
       it("shows that the image for lowSvg is correct",async()=>{
           const expectedValue = await DynamicSvgNft.getLowSvg()
           const lowSvg = await fs.readFileSync("./images/dynamicNfts/frown.svg", {encoding: "utf8"})
           const prefix = await DynamicSvgNft.getbase64EncodedSvgPrefix()
            assert(expectedValue.includes(prefix.toString()),true)
       })
 
       it("show that the image bytes64 for the highSvg image is correct",async()=>{
            const expectedValue = await DynamicSvgNft.getHighSvg()
            const prefix = await DynamicSvgNft.getbase64EncodedSvgPrefix()
            assert(expectedValue.includes(prefix.toString()),true)
       })
 
       it("shows that the baseURI returns the JSON Prefix",async()=>{
            const expectedValue = await DynamicSvgNft.svgToImageUri("https://media.istockphoto.com/id/1129845783/photo/lagos-nigeria-lekki-ikoyi-bridge-lagos-landmark-infrastructure-and-urban-transportation.jpg?s=612x612&w=0&k=20&c=feTQNjRA0-tAuekoOo6Wr3N71gomagul1vGLB9dMxgE=")
            const prefix = await DynamicSvgNft.getbase64EncodedSvgPrefix()
            assert(expectedValue.includes(prefix.toString()),true)
       })

       it("show the corresponding address to be used",async()=>{
           const expectedValue=await DynamicSvgNft.getAggregatorAdress()
           const NetworkConfigV3Address = await MockV3Aggregator.address
           expect(expectedValue).to.equal(NetworkConfigV3Address)
           
       })
 
       it("increase the tokenId by one , set the tokenToHighValue to the inputed value",async()=>{
            const expectedValue = await DynamicSvgNft.mintNft(3)
            const tokenId = await DynamicSvgNft.getTokenCounter()
            const tokenIdToHighValue  = await DynamicSvgNft.getTokenCounterToHighValue(0)
            assert.equal(tokenId.toString(),"1")
            expect(tokenIdToHighValue.toString(),"3")
       })
 })

      describe("Events",()=>{
         it("Events emitted when a mint action take place",async()=>{
              await expect(DynamicSvgNft.mintNft(3)).to.emit(DynamicSvgNft,"CreatedNft")
         })
      }) 

      describe("Reversal",()=>{
          it("Reverses if the id is not specified to get the corresponding output for the tokenToHighValue",async()=>{
               await expect(DynamicSvgNft.mintNft()).to.be.reverted
               await expect(DynamicSvgNft.getTokenCounterToHighValue()).to.be.reverted
          })
      })   
}


)