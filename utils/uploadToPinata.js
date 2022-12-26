const pinataSdk = require("@pinata/sdk")
const fs = require("fs")
require("dotenv").config()
const PINATA_API_KEY =process.env.PINATA_API_KEY
const PINATA_API_SECRET =process.env.PINATA_API_SECRET
const pinata = pinataSdk(PINATA_API_KEY,PINATA_API_SECRET)

const path = require("path")
 
async function storeImages(imagesFilePath) {
 // Points to that folder
    const fullImagesPath = path.resolve(imagesFilePath)
    //Returns the files present in the folder
    const files = fs.readdirSync(fullImagesPath)
    console.log(files)

    let responses = []

    console.log("uploading to Ipfs")

    for(fileIndex in files){
     console.log(`working on ${fileIndex} file`)
    const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
      try{
         const response = await pinata.pinFileToIPFS(readableStreamForFile)
         responses.push(response)
      }catch(e){
          console.log(e)
      }
    }

    return {responses,files}
}

async function storeTokenURIMetadata(metadata){
    try{
         const response = await pinata.pinJSONToIPFS(metadata)
         return response
    }catch(e){
       console.log(e)
    }
    return null
  
}

module.exports={
  storeImages,
  storeTokenURIMetadata
}