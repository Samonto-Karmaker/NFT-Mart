const { ethers, network, run } = require("hardhat")
const {
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../../helper-hardhat-config")
require("dotenv").config()

const main = async () => {
    console.log("Deploying contracts...")
    try {
        const contractFactory = await ethers.getContractFactory("BasicNft")
        const contract = await contractFactory.deploy()
        console.log("Contract deployed to address:", contract.target)
        if (
            network.config.chainId === 11155111 &&
            process.env.ETHERSCAN_API_KEY
        ) {
            console.log("Waiting for block confirmations...")
            await contract.deployTransaction.wait(
                VERIFICATION_BLOCK_CONFIRMATIONS,
            )
            await verify(contract.target, [])
        }
    } catch (error) {
        console.error("Error deploying contract:", error)
        process.exit(1)
    }
}

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (err) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.log("Already verified")
        } else {
            console.log(err)
        }
    }
}

main().catch((err) => {
    console.error("Error in main function:", err)
    process.exit(1)
})
