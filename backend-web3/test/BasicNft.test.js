const { developmentChains } = require("../helper-hardhat-config")
const { ethers, network } = require("hardhat")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BasicNft", function () {
          let basicNft, deployer
          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              const nftContract = await ethers.getContractFactory("BasicNft")
              basicNft = await nftContract.deploy()
          })
          describe("constructor", function () {
              it("initializes the NFT correctly", async () => {
                  const name = await basicNft.name()
                  const symbol = await basicNft.symbol()
                  const tokenCounter = await basicNft.getTokenCounter()

                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
          describe("mintNFT", function () {
              it("allows users to mint an NFT and updates appropriately", async () => {
                  const txResponse = await basicNft.mintNft()
                  const txReceipt = await txResponse.wait(1)

                  const tokenCounter = await basicNft.getTokenCounter()
                  const tokenURI = await basicNft.tokenURI(tokenCounter)

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, await basicNft.TOKEN_URI())
              })
              it("emits an event after minting an NFT", async () => {
                  await expect(basicNft.mintNft())
                      .to.emit(basicNft, "DogMinted")
                      .withArgs("0")
              })
          })
      })
