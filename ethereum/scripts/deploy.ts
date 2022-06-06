import { ethers, network } from "hardhat";
const hre = require("hardhat");
import { LENDING_POOL_ADDRESS_PROVIDER, PRICE_ORACLE, LENDING_POOL, WETH, DAI, UNISWAP_V2_ROUTER } from "../constants/address";

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



  console.log("balance of user", await provider.getBalance(deployerAddress));

  // Deploy Factory
  console.log("Deploying LendingFactory...");
  const LendingFactory = await ethers.getContractFactory("LendingFactory");

  const lendingFactory = await LendingFactory.deploy(
    _lendingPoolAddressProvider,
    _dai,
    _weth,
    _uniswap

  );
  await lendingFactory.deployed();
  const delay = (ms: any) => new Promise(res => setTimeout(res, ms));
  await delay(5000);
  console.log("Deployed!! at: ", lendingFactory.address);

  // if (chainId != 31337) {
  //   await hre.run("verify:verify", {
  //     address: lendingFactory.address,
  //     constructorArguments: [
  //       _lendingPoolAddressProvider,
  //       _dai,
  //       _weth,
  //       _uniswap
  //     ],
  //   });
  // }


  let balance = await provider.getBalance(deployerAddress);
  console.log(deployerAddress + ':' + ethers.utils.formatEther(balance));
  // console.log(await lendingFactory.totalPosition());
  // console.log("WETH balance ", await lendingFactory.TestOnKovan());
  // const tx = await lendingFactory.TestDeposit(
  //   _dai,
  //   1,
  //   0,
  //   30
  //   , { value: ethers.utils.parseEther("0.0001"), "gasLimit": 30000000 });
  // tx.wait();
  // console.log(tx);

  const tx1 = await lendingFactory.openPositionWithETH(
    _dai,
    1,
    0,
    30,
    _lendingPoolAddressProvider,
    {
      value: ethers.utils.parseEther("0.0001"), "gasLimit": 30000000
    });
  tx1.wait();

  console.log("opened position 0", tx1);
  // console.log("WETH balance ", await lendingFactory.TestOnKovan());
  // const LendingPosition = await ethers.getContractFactory("LendingPosition");
  // const positionAddress = (await lendingFactory.functions.lootboxAddress(0))[0];
  // const lendingPosition = LendingPosition.attach(positionAddress);

  // console.log("position in WETH", lendingPosition.getCurrentPosition())
  // console.log("amount TO repay", lendingPosition.getAmountToClosePositionInETH())
  // const tx2 = await lendingFactory.openPositionWithETH(
  //   _dai,
  //   1,
  //   0,
  //   80
  //   , { value: ethers.utils.parseEther("0.0001")});
  // console.log(tx2);

  // console.log("balance of user", await provider.getBalance(deployerAddress));


  console.log("opened Position of ", deployerAddress);
  const positionAddress = await lendingFactory.getAddressFromPositionId(0);
  console.log('position 0 at :', positionAddress)

  // const LendingPosition = await ethers.getContractFactory("LendingPosition");
  // const lendingPosition = await LendingPosition.attach(positionAddress);
  // const tx2 = await lendingPosition.closePositionWithETH({ "gasLimit": 30000000 });
  // await tx2.wait();
  // console.log(tx2)
  // console.log("balance of user after closeed position", await provider.getBalance(deployerAddress));


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })