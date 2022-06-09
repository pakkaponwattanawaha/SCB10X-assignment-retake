import { ethers, network } from "hardhat";
const hre = require("hardhat");
import { LENDING_FACTORY, LENDING_POOL_ADDRESS_PROVIDER, PRICE_ORACLE, LENDING_POOL, WETH, DAI, UNISWAP_V2_ROUTER } from "../constants/address";

async function main() {
    const accounts = await ethers.getSigners();
    const chainId = network.config.chainId;
    const deployerAddress = accounts[0].address;
    let provider = ethers.getDefaultProvider();
    console.log("Deploying with ", deployerAddress);
    console.log("ChainId: ", chainId);
    let _lendingPoolAddressProvider, _dai, _weth, _uniswap;
    if (chainId == 31337) {
        console.log("mainnet fork!");
        _lendingPoolAddressProvider = LENDING_POOL_ADDRESS_PROVIDER[1];
        _dai = DAI[1];
        _weth = WETH[1];
        _uniswap = UNISWAP_V2_ROUTER[1];
    } else {
        console.log("testnet env");
        _lendingPoolAddressProvider = LENDING_POOL_ADDRESS_PROVIDER[chainId!];
        _dai = DAI[chainId!];
        _weth = WETH[chainId!];
        _uniswap = UNISWAP_V2_ROUTER[chainId!];
    }
    if (chainId != 31337) {
        const LendingFactory = await ethers.getContractFactory("LendingFactory");
        const lendingFactory = await LendingFactory.attach(LENDING_FACTORY[chainId!]);
        await hre.run("verify:verify", {
            address: lendingFactory.address,
            constructorArguments: [
                _lendingPoolAddressProvider,
                _dai,
                _weth,
                _uniswap
            ],
        });

        const positionAddress = await lendingFactory.getAddressFromPositionId(0);
        console.log('positionId 0 at :', positionAddress);

        const LendingPosition = await ethers.getContractFactory("LendingPosition");
        const lendingPosition = await LendingPosition.attach(positionAddress);

        await hre.run("verify:verify", {
            address: lendingPosition.address,
            constructorArguments: [
                0,
                _dai,
                1,
                0,
                30,
                _lendingPoolAddressProvider,
                _weth
            ],
        });
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    });