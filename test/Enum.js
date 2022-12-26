const {deployments, getNamedAccounts, ethers, network} = require("hardhat")
const {networkConfig} = require("../helper-hardhat-config")
const fs = require("fs")
const {assert,expect} = require("chai")

describe("Enum",()=>{
 let deployer,EnumExample
    beforeEach(async()=>{
          deployer = (await getNamedAccounts()).deployer
          await deployments.fixture(["EnumExample"])
          EnumExample = await ethers.getContract("EnumExample",deployer)
    })

    it("set the initialize state to zero",async()=>{
        const initialState = await EnumExample.getState()
        expect(initialState.toString()).to.equal("0")
    })

    it("set the state to the initialize state before any state action can be performed",async()=>{
        const setInitialized = await EnumExample.initialize()
        const presentState = await EnumExample.getState()
        expect(presentState.toString()).to.equal("1")
    })

    it("reverses if the flow is not correct",async()=>{
      await expect (EnumExample.deactivate()).to.be.revertedWith("Error: Contract not active")
      await expect (EnumExample.activate()).to.be.revertedWith("Error: Contract not initialized")
    })

    it("Confirms the normal workflow of the smart contract",async()=>{
        const getConstructorState = await EnumExample.getState()
        const initialized = await EnumExample.initialize()
        const initializedState = await EnumExample.getState()
        const activate = await EnumExample.activate()
        const activateState = await EnumExample.getState()
        const deactivate = await EnumExample.deactivate()
        const deactivateState = await EnumExample.getState()
        assert.equal(getConstructorState.toString(),"0")
        assert.equal(initializedState.toString(),"1")
        assert.equal(activateState.toString(),"2")
        assert.equal(deactivateState.toString(),"3")
    })


    
})