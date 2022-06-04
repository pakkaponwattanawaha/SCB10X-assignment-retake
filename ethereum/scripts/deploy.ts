import { ethers, network } from "hardhat";
const hre = require("hardhat");
import { LENDING_POOL_ADDRESS_PROVIDER, PRICE_ORACLE, LENDING_POOL, WETH, DAI, UNISWAP_V2_ROUTER } from "../constants/address";

async function main() {
  const accounts = await ethers.getSigners();
  const chainId = network.config.chainId;
  const deployerAddress = accounts[0].address;
  // let provider = ethers.getDefaultProvider();
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



  // We get the contract to deploy
  const LendingFactory = await ethers.getContractFactory("LendingFactory");
  const lendingFactory = await LendingFactory.deploy(
    _lendingPoolAddressProvider,
    _dai,
    _weth,
    _uniswap

  );
  await lendingFactory.deployed();
  // const positionId = await lendingFactory.totalPosition()
  console.log("total position", await lendingFactory.totalPosition());
  // console.log("balance of user", await provider.getBalance(deployerAddress));
  const tx = await lendingFactory.openPositionWithETH(
    _dai,
    1,
    0,
    30
    , {
      value: "1000000000000000",
    });
  const LendingPosition = await ethers.getContractFactory("LendingPosition");
  // const positionAddress = (await lendingFactory.functions.lootboxAddress(0))[0];
  // const lendingPosition = LendingPosition.attach(positionAddress);

  console.log(tx);
  // console.log("position in WETH", lendingPosition.getCurrentPosition())
  // console.log("amount TO repay", lendingPosition.getAmountToClosePositionInETH())
  const tx2 = await lendingFactory.openPositionWithETH(
    _dai,
    1,
    0,
    80
    , {
      value: "1000000000000000",
    });
  console.log(tx2);

  // console.log("balance of user", await provider.getBalance(deployerAddress));

  // await hre.run("verify:verify", {
  //   address: lendingFactory.address,
  //   constructorArguments: [
  //     _lendingPoolAddressProvider,
  //     _dai,
  //     _weth,
  //     _uniswap
  //   ],
  // });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })