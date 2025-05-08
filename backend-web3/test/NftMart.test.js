const { ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NftMart", function () {
          let nftMart, nftMartContract, nft, nftContract, deployer, player
          const price = ethers.parseEther("0.01")
          const tokenId = 0

          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              player = accounts[1]

              nftMartContract = await ethers.getContractFactory("NftMart")
              nftMart = await nftMartContract.deploy()

              nftContract = await ethers.getContractFactory("BasicNft")
              nft = await nftContract.deploy()
              await nft.mintNft()
              await nft.approve(nftMart.target, tokenId)
          })
      })
