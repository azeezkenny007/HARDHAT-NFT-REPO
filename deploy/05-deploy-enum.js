const {network} =require("hardhat")
const {developmentChains,DECIMALS,INITIAL_PRICE} =require("../helper-hardhat-config")
const {verify} =require("../utils/verify")

module.exports=async({getNamedAccounts,deployments})=>{
    const {deploy,log} = deployments
    const {deployer} = await getNamedAccounts()

    const args =[]

    const EnumExample = await deploy("EnumExample",{
       from: deployer ,
       log :true,
       args : args,
       waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
     await verify(EnumExample.address, args)
     log("----awaiting verification on etherscan")
 } else {
     console.log("The hardhat network cannot verify the network")
 }
}

module.exports.tags = ["all", "EnumExample", "main"]

