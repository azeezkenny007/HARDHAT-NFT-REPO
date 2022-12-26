const { expect, assert } = require("chai")
const { getNamedAccounts, deployments, ethers} = require("hardhat")

describe("Constructor",()=>{
   let deployer,VRFCoordinatorV2Mock ,RandomNft,mintFee

    beforeEach(async()=>{
       deployer = (await getNamedAccounts()).deployer
       await deployments.fixture(["main"])
       VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock",deployer)
       RandomNft = await ethers.getContract("RandomipfsNft",deployer) 
       mintFee = await RandomNft.getMintFee() 
    })

    it("Ensures the mintFee is correct",async()=>{
       const mintFee = await RandomNft.getMintFee()
       expect(mintFee.toString()).to.equal("10000000000000000")
    })

    it("Shows the chance Array of the contract",async()=>{
       const chanceArray = await RandomNft.getChanceArray()
       const expectedValue = chanceArray.toString()
       const chance1 = expectedValue.slice(0,2)
       const chance2 = expectedValue.slice(3,5)
       const chance3 = expectedValue.slice(6,9)
       assert.equal(chance1,"10")
       assert.equal(chance2,"30")
       expect(chance3).to.equal("100")
       
    })

    describe("Requesting Nft Minting",()=>{
        it("Reverts if the money entered is lesser than the mintFee",async()=>{
            await expect(RandomNft.requestNft({value:"1000000000000000"})).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent()")
        })

        it("Emits an event when We request for an Nft",async()=>{
           await expect(RandomNft.requestNft({value : mintFee.toString()})).to.emit(RandomNft,"NftRequested")
        })
    })

    describe("Moded Rng Test",()=>{
        it("returns 0 when the value used is 7",async()=>{
                const expectedValue = await RandomNft.getBreedFromModdedRng(7)
                assert.equal(0,expectedValue)
        })

        it("returns 1 when the value entered is 30",async()=>{
            const expectedValue = await RandomNft.getBreedFromModdedRng(30)
            expect(1).to.equal(expectedValue)
        })

        it("returns 1 when the value entered is 90",async()=>{
         const expectedValue = await RandomNft.getBreedFromModdedRng(90)
         expect(2).to.equal(expectedValue)
      })

      it("Reverts when it is out of bound",async()=>{
           await expect( RandomNft.getBreedFromModdedRng(150)).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds()")
      })



    })

    describe("TokenUrils",()=>{
         it("Check if the TokenUris has been added",async()=>{
              const expectedValue = await RandomNft.getTokenURIS(0) 
              expect(expectedValue.includes("ipfs://")).to.be.true
         })
    })
    


})