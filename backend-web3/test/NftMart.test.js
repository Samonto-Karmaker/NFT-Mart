const { ethers } = require("hardhat")
const { expect, assert } = require("chai")
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

          describe("listNFT", function () {
              // not owner can't list
              it("reverts if not owner", async () => {
                  await expect(
                      nftMart
                          .connect(player)
                          .listNFT(nft.target, tokenId, price),
                  ).to.be.revertedWithCustomError(nftMart, "NotOwner")
              })
              // nft price can't be 0
              it("reverts if price is 0", async () => {
                  await expect(
                      nftMart.listNFT(nft.target, tokenId, 0),
                  ).to.be.revertedWithCustomError(
                      nftMart,
                      "PriceMustBeGreaterThanZero",
                  )
              })
              // is event emitted
              it("emits event when listed", async () => {
                  await expect(nftMart.listNFT(nft.target, tokenId, price))
                      .to.emit(nftMart, "NftListed")
                      .withArgs(deployer.address, nft.target, tokenId, price)
              })
              // not approved can't list
              it("reverts if not approved", async () => {
                  await nft.approve(ethers.ZeroAddress, tokenId)
                  await expect(
                      nftMart.listNFT(nft.target, tokenId, price),
                  ).to.be.revertedWithCustomError(nftMart, "NotApproved")
              })
              // is token properly listed
              it("lists the token", async () => {
                  await nftMart.listNFT(nft.target, tokenId, price)
                  const listedNft = await nftMart.getListing(
                      nft.target,
                      tokenId,
                  )
                  assert(listedNft.price.toString() == price.toString())
                  assert(listedNft.seller == deployer.address)
              })
              // can't list already listed token
              it("reverts if already listed", async () => {
                  await nftMart.listNFT(nft.target, tokenId, price)
                  await expect(
                      nftMart.listNFT(nft.target, tokenId, price),
                  ).to.be.revertedWithCustomError(nftMart, "AlreadyListed")
              })
          })
          describe("buyNFT", function () {
              // not listed can't buy
              it("reverts if not listed", async () => {
                  await expect(
                      nftMart.buyNFT(nft.target, tokenId),
                  ).to.be.revertedWithCustomError(nftMart, "NotListed")
              })
              // not enough ether can't buy
              it("reverts if not enough ether", async () => {
                  await nftMart.listNFT(nft.target, tokenId, price)
                  await expect(
                      nftMart.connect(player).buyNFT(nft.target, tokenId, {
                          value: ethers.parseEther("0.001"),
                      }),
                  ).to.be.revertedWithCustomError(nftMart, "PriceNotMet")
              })
              // is transaction successful and event emitted
              it("transfers the token and emits event", async () => {
                  await nftMart.listNFT(nft.target, tokenId, price)
                  await expect(
                      nftMart
                          .connect(player)
                          .buyNFT(nft.target, tokenId, { value: price }),
                  )
                      .to.emit(nftMart, "NftBought")
                      .withArgs(player.address, nft.target, tokenId, price)

                  const newNftOwner = await nft.ownerOf(tokenId)
                  assert(newNftOwner == player.address)

                  const listedNft = await nftMart.getListing(
                      nft.target,
                      tokenId,
                  )
                  assert(listedNft.seller == ethers.ZeroAddress)
                  assert(listedNft.price == 0)
              })
              // is excess ether returned
              it("returns excess ether", async () => {
                  await nftMart.listNFT(nft.target, tokenId, price)
                  const playerBalanceBefore = await ethers.provider.getBalance(
                      player.address,
                  )
                  const txResponse = await nftMart
                      .connect(player)
                      .buyNFT(nft.target, tokenId, {
                          value: ethers.parseEther("0.1"),
                      })
                  const txReceipt = await txResponse.wait(1)
                  const { gasUsed, gasPrice } = txReceipt
                  const gasCost = gasUsed * gasPrice
                  const playerBalanceAfter = await ethers.provider.getBalance(
                      player.address,
                  )
                  assert(
                      (playerBalanceAfter + gasCost).toString() ==
                          (playerBalanceBefore - price).toString(),
                  )
              })
          })
          describe("cancelListing", function () {
              // not listed can't cancel
              it("reverts if not listed", async () => {
                  await expect(
                      nftMart.cancelListing(nft.target, tokenId),
                  ).to.be.revertedWithCustomError(nftMart, "NotListed")
              })
              // not owner can't cancel
              it("reverts if not owner", async () => {
                  await nftMart.listNFT(nft.target, tokenId, price)
                  await expect(
                      nftMart
                          .connect(player)
                          .cancelListing(nft.target, tokenId),
                  ).to.be.revertedWithCustomError(nftMart, "NotOwner")
              })
              // removes the listing and emits event
              it("removes the listing and emits event", async () => {
                  await nftMart.listNFT(nft.target, tokenId, price)
                  await expect(nftMart.cancelListing(nft.target, tokenId))
                      .to.emit(nftMart, "NftCanceled")
                      .withArgs(deployer.address, nft.target, tokenId)

                  const listedNft = await nftMart.getListing(nft.target, tokenId)
                  assert(listedNft.seller == ethers.ZeroAddress)
                  assert(listedNft.price == 0)
              })
          })
      })
