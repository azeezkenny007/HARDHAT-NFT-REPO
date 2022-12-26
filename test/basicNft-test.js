const { expect, assert } = require("chai")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Constructor", () => {
      let BasicNft, deployer, TokenId

      beforeEach(async() => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["main"])
        BasicNft = await ethers.getContract("BasicNft", deployer)
      })

      it("set the number of the counterId properly", async () => {
        const initailValue = await BasicNft.getTokenCounter()
        const expectedValue = "0"
        expect(initailValue.toString()).to.equal(expectedValue)
      })

      it("correctly set the metadata for te NFT", async () => {
        const TOKEN_URL = await BasicNft.TOKEN_URI()
        const expectedTokenId = await BasicNft.tokenURI("0")
        assert.equal(TOKEN_URL, expectedTokenId)
      })

      it("correctly set the uniqueId to number of nft minted ", async () => {
        const mintingTheNft = await BasicNft.mintNfts()
        const initailValue = await BasicNft.getTokenCounter()
        const expectedValue = "1"
        expect(initailValue.toString()).to.equal(expectedValue)
      })

      it("correctly set after the number of id after some accounts mint Nft", async () => {
        const accounts = await ethers.getSigners()
        for (let i = 1; i < 6; i++) {
          const connectedAccounts = accounts[i]
          const connectedMintFunction = await BasicNft.connect(
            connectedAccounts
          )
          const transactionResponse = await connectedMintFunction.mintNfts()
        }

        const initailValue = await BasicNft.getTokenCounter()
        const expectedValue = "5"
        expect(initailValue.toString()).to.equal(expectedValue)
      })

      it("correctly set the name and the symbol of the nft", async () => {
        const name = await BasicNft.name()
        const symbol = await BasicNft.symbol()
        assert.equal(name, "Dogie")
        expect(symbol, "DOG")
      })

      it("set the address and owner correctly", async () => {
        const deployerAddress = deployer
        const deployerBalance = await BasicNft.balanceOf(deployerAddress)
        const mintingTheNft = await BasicNft.mintNfts()
        const owner = await BasicNft.ownerOf("0")
        assert.equal(deployerBalance.toString(), "0")
        expect(owner).to.equal(deployerAddress)
      })
    })
