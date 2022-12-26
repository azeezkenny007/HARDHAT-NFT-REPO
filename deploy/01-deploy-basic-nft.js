const {network} =require("hardhat")
const {developmentChains,DECIMALS,INITIAL_PRICE} =require("../helper-hardhat-config")
const {verify} =require("../utils/verify")

module.exports=async({getNamedAccounts,deployments})=>{
    const {deploy,log} = deployments
    const {deployer} = await getNamedAccounts()
    log("---------------------------")
    log("Deploying---- please wait")

    const args = []

    const BasicNft =await deploy("BasicNft",{
       from : deployer,
       log: true ,
       arg: args ,
       waitConfimations : network.config.blockConfimations || 1
    })

    log("Contract has been deployed!!!")
  
    

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(BasicNft.address,args)
        log("----awaiting verification on etherscan")
    }
    else{
     log("contract cannot be verified on the hardhat network")
    }

    log("---------------------------")

}

module.exports.tags=["all","BasicNft",'main']