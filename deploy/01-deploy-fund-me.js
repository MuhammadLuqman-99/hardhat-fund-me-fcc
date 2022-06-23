// biasa kita guna
// import
// main function
// calling main function

/* function deployFunc() {
    console.log("Hi!")
}

module.exports.default = deployFunc */

/* module.exports = async (hre) => {
    // hre.getNameAccounts
    // hre.deployments
    const { getNameAccounts, deployments } = hre
} */

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is x use address y
    // if chainId is z use address a
    // untk buat mcm ni kita pakai aave(helper-hardhat-config)
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if the contract doesn't exist, we deploy a minimal version of
    // for our local testing(mocks)

    // when going for localhost or hardhat network we want use mock
    // (mock ni mcm fake price feed yang kita guna untk test)
    // well what happen if masa kita guna mock tapi nak tkr chain? => tgk contract.sol

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put priceFeed
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("-------------------------------")
}

module.exports.tags = ["all", "fundme"]
