//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";
import { ILendingPool } from "./interfaces/ILendingPool.sol";
import { ILendingPoolAddressesProvider } from "./interfaces/ILendingPoolAddressesProvider.sol";
import { IPriceOracle } from "./interfaces/IPriceOracle.sol";
// import {loxWETH} from "./loxWETH.sol"; => may be not?? bc too complecate and we already keep track of position amount
import { IWETH } from "./interfaces/IWETH.sol";

struct position {
  uint256 positionId; //id
  address onBehalfOf; //address
  uint256 amount; // amount
  uint256 leveragePercentage;
  uint256 positionPrice; //priceIn
  uint256 interestRate;
  uint256 timeStamp;
  bool isLiquidated; //??? can we use it
}

contract LeverageLending {
  //Position Factory , position id , position contract => we deposit onBehalf of position contract??
  //calculate health of each position with health calculator => calculateHealthFactorFromBalances (https://github.com/aave/protocol-v2/blob/ice/mainnet-deployment-03-12-2020/contracts/protocol/libraries/logic/GenericLogic.sol)
  //user get minted a recipt token(like aWETH)

  //TODO ETH -> deposit to aave
  // borrow DAI (USDT)
  // swap DAI to ETH

  //TODO close position
  // swapETH back to DAI
  // repay aave
  // swap back to ETH -> calculate pnl

  // how do we separate position from different account => either seperate in factory manner or just make the math right => what about the interest rate???

  // how do we handle liquidate of each position that can effect other position(bc we are the position owner) => we kinda cant => upkeep or incentivised

  // mapping(uint256 => address) public positionToUser; // id -> address of owner
  // mapping(address => uint256[]) public userToPositionId; // address -> opening positions
  // mapping(uint256 => position) public positionIdToPosition; //( or maybe just one address can have one live position #check position > 0 then wont allow for new position)

  mapping(address => position) private userToPosition; //one address can have one live position #check position > 0 then wont allow for new position

  // uint256 public totalPosition = 0;
  uint256 private currentDebt = 0;

  address[] public allUser;
  uint256 maxLeveragePercentage = 80;
  uint256 interestRateMode = 1;
  uint16 referralCode = 0;

  IWETH public wethToken;

  address public dai_address;
  address public weth_address;

  ILendingPool public lendingPool;
  IPriceOracle public priceOracle;

  ILendingPoolAddressesProvider public provider;
  IUniswapV2Router01 public uniswapRouter;

  address public owner;

  constructor(
    address _lendingPoolAddressProvider,
    address _priceFeed,
    address _dai,
    address _weth,
    address _uniswap
  ) {
    provider = ILendingPoolAddressesProvider(_lendingPoolAddressProvider);
    lendingPool = ILendingPool(provider.getLendingPool());
    priceOracle = IPriceOracle(provider.getPriceOracle());
    uniswapRouter = IUniswapV2Router01(_uniswap);
    dai_address = 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD;
    weth_address = 0xd0A1E359811322d97991E03f863a0C30C2cF029C;
    wethToken = IWETH(weth_address);
    owner = msg.sender;
  }

  //1ETH -> 1WETH -> deposit to aave -> borrow 200DAI -> swap DAI for WETH  ==> add user data and update current debth
  //swap +- WETH(include capital gain or lose -> deposit to get WETH) for 200DAI -> repay DAI -> get WETH -> swap to 1ETH ==> update user data and current debth

  function openPositionWithETH(uint256 leveragePercentage) external payable {
    // open position with eth => swap to weth first
    require(leveragePercentage <= 80, "ltv exceed accepted amount");

    wethToken.deposit{ value: msg.value }(); // will mint WETH for msg.sender for msg.value amount

    uint256 daiPrice = priceOracle.getAssetPrice(dai_address);
    uint256 borrow_amount = (((msg.value * leveragePercentage) / 100)) *
      uint256(10**18 / daiPrice);
    deposit(address(this), msg.value, leveragePercentage);

    lendingPool.borrow(
      dai_address,
      borrow_amount,
      interestRateMode,
      referralCode,
      address(this)
    );

    // deposit
    // borrow
    // swap
    // add user's detail
    // add user to allUser
    // add position(if all is success) to  positionToUser and  userPositions
    if (userToPosition[msg.sender].amount > 0) {} else {}
    currentDebt += msg.value; //amount collat in aave
    // totalPosition++;
  }

  function deposit(
    address onBehalfOf,
    uint256 amount,
    uint256 leveragePercentage
  ) internal {
    require(
      wethToken.approve(address(lendingPool), 2**256 - 1),
      "approve failed."
    );
    lendingPool.deposit(address(wethToken), amount, onBehalfOf, referralCode);
  }

  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) public returns (uint256[] memory amounts) {
    IERC20(path[0]).approve(address(uniswapRouter), amountIn);
    uint256[] memory amounts_uni = uniswapRouter.swapExactTokensForTokens(
      amountIn,
      0,
      path,
      to,
      deadline
    );
    require(amounts_uni[path.length - 1] > amountOutMin);
    return amounts_uni;
  }

  function closePosition(address _user) public payable {
    // how to repay?? => repay partially of contract's position=> need to calculate fee ourself
  }

  function viewAccountData(address _user) public {
    // => just return struct , may be added health factor calculator, maybe loop throught all position and display result
  }

  function getCurrentPnl(address _user) public {
    // calculate and return pnl of user's position
  }
}
