const {network, waffle, ethers} =require("hardhat")
const {developmentChains,DECIMALS,INITIAL_PRICE, networkConfig} =require("../helper-hardhat-config")
const {verify} =require("../utils/verify")
const {storeImages,storeTokenURIMetadata} = require("../utils/uploadToPinata")

const imagesLocation ='./images/randomNfts'

const metadataTemplate ={
    name:"",
    description:"",
    image:"",
    attributes:[
       {
         trait_type:"cuteness",
         value: 100
       }
    ]
}

const FUND_AMOUNT = "10000000000000000000000"

module.exports= async({ getNamedAccounts, deployments}) => {
    const {deploy, log } = deployments
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Mock,vrfCoordinatorV2Address, subscriptionId, tokenURIS

    tokenURIS = [
      'ipfs://QmQs4yASJakykKzcUYiJoQEFptCuufghNA3S5J2CkD47tp',
      'ipfs://QmXry9jwWVKfbt6V87Gzd97WJ5LGAmtyWY7znSQXCRysv9',
      'ipfs://QmX5V7Xc31vMfM8tYgrNefix1WCFmiMqpLzjDtk6PgTQd2'
    ]

 

    if(process.env.UPLOAD_TO_PINATA == "true"){
         tokenURIS = await handleTokenURIS()
    }

   if (developmentChains.includes(network.name)) {
       // create VRFV2 Subscription
       vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
       vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
       const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
       const transactionReceipt = await transactionResponse.wait()
       subscriptionId = transactionReceipt.events[0].args.subId
       // Fund the subscription
       // Our mock makes it so we don't actually have to worry about sending fund
       await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
      
    }
    else{
      vrfCoordinatorV2Address =networkConfig[chainId]["vrfCoordinatorV2"]
      subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    log("----------------------------------")
 
   

    const gasLane = networkConfig[chainId]["gasLane"]
    const mintFee = networkConfig[chainId]["mintFee"]
    const callBackGasLimit = networkConfig[chainId]["callbackGasLimit"]

    const args =[

         vrfCoordinatorV2Address,
          subscriptionId,
          gasLane,
          callBackGasLimit, 
          tokenURIS,
          mintFee
      ]

      const RandomipfsNfts = await deploy("RandomipfsNft",{
          from: deployer ,
          log: true,
          args : args,
          waitConfirmations : network.config.blockConfirmations || 1

      })
      log("------------------------------")

      if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(subscriptionId, RandomipfsNfts.address)
    }


      if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
         await verify(RandomipfsNfts.address,args)
         log("----awaiting verification on etherscan")
     }
      else{
       console.log("The hardhat network cannot verify the network")
     }

}





async function handleTokenURIS() {
   tokenURIS =[]

   const { responses : imageUploadResponses , files} = await storeImages(imagesLocation)

   for (imageUploadResponsesIndex in imageUploadResponses) {
      // let tokenUriMetadata ={...metadataTemplate}
      // tokenUriMetadata.name =files[imageUploadResponsesIndex].replace(".png","")
      // tokenUriMetadata.description = `An Adorable ${tokenUriMetadata.name} pup!`
      // tokenUriMetadata.image =`ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`
      // console.log(`uploading ${tokenUriMetadata.name} `)
      // const metaDataResponse = await storeTokenURIMetadata(tokenUriMetadata)
      // console.log("------------------The Metadata------------------")
      // console.log(metaDataResponse)
      // tokenURIS.push(`ipfs://${metaDataResponse.IpfsHash}`) 
      
      let tokenUriMetadata ={...metadataTemplate}
      tokenUriMetadata.name = files[imageUploadResponsesIndex].replace(".png","")
      tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
      tokenUriMetadata.image =`ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`
      console.log(`Uploading ${tokenUriMetadata.name}`)
      const metaDataResponse = await storeTokenURIMetadata(tokenUriMetadata)
      console.log("------------------Metadata--------------")
      console.log(metaDataResponse)
      tokenURIS.push(`ipfs://${metaDataResponse.IpfsHash}`)
   }
   console.log("Token uris have been uploaded!!!")
   console.log(tokenURIS)


   return tokenURIS
}

module.exports.tags =["all","randomipfs","main"]