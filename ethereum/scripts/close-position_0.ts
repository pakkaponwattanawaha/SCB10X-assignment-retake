import { ethers, network } from "hardhat";
const hre = require("hardhat");
import { LENDING_POOL_ADDRESS_PROVIDER, LENDING_FACTORY, WETH, DAI, UNISWAP_V2_ROUTER } from "../constants/address";

async function main() {
    const accounts = await ethers.getSigners();
    const chainId = network.config.chainId;
    const deployerAddress = accounts[0].address;
    let provider = ethers.getDefaultProvider();
    console.log("Deploying with ", deployerAddress);
    console.log("ChainId: ", chainId);
    let _lendingPoolAddressProvider, _dai, _weth, _uniswap;
    if (chainId == 31337) {
        console.log("mainnet fork!")
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

    const LendingFactory = await ethers.getContractFactory("LendingFactory");
    const lendingFactory = await LendingFactory.attach(LENDING_FACTORY[chainId!]);

    console.log("opened Position of ", deployerAddress);
    const positionAddress = await lendingFactory.getAddressFromPositionId(0);
    console.log('position 0 at :', positionAddress)

    const LendingPosition = await ethers.getContractFactory("LendingPosition");
    const lendingPosition = await LendingPosition.attach(positionAddress);
    const tx = await lendingPosition.closePositionWithETH({ "gasLimit": 30000000 });
    await tx.wait();
    console.log(tx)
    console.log("balance of user after closed position", await provider.getBalance(deployerAddress));


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })