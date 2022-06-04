//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
// import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {IUniswapV2Router02} from "./interfaces/IUniswapV2Router02.sol";
import {ILendingPool} from "./interfaces/ILendingPool.sol";
import {ILendingPoolAddressesProvider} from "./interfaces/ILendingPoolAddressesProvider.sol";
import {IPriceOracle} from "./interfaces/IPriceOracle.sol";
import {IWETH} from "./interfaces/IWETH.sol";
import {LendingFactory} from "./LendingFactory.sol";
import "hardhat/console.sol";

contract LendingPosition is Ownable {
    bool isRepay;
    bool isLiquidated; // check when try to repay if this address still own aWETH or what ever aave use

    uint256 public amount;
    uint256 public borrowAmount;
    uint256 public positionPrice;
    address public tokenToBorrow;
    uint256 public interestRateMode;
    uint16 public referralCode;
    uint256 public leveragePercentage;

    uint256 public amountBorrowedSwapped;

    IERC20 public wethToken;

    ILendingPool public lendingPool;
    IPriceOracle public priceOracle;

    ILendingPoolAddressesProvider public lendingPoolAddressProvider;
    IUniswapV2Router02 public uniswapRouter;

    address factory;

    constructor(
        uint256 _amount,
        address _tokenToBorrow,
        uint256 _interestRateMode,
        uint16 _referralCode,
        uint256 _leveragePercentage,
        address _lendingPoolAddressProvider
    ) {
        amount = _amount;
        tokenToBorrow = _tokenToBorrow;
        interestRateMode = _interestRateMode;
        referralCode = _referralCode;
        leveragePercentage = _leveragePercentage;
        lendingPoolAddressProvider = ILendingPoolAddressesProvider(
            _lendingPoolAddressProvider
        );
        lendingPool = ILendingPool(lendingPoolAddressProvider.getLendingPool());
        priceOracle = IPriceOracle(lendingPoolAddressProvider.getPriceOracle());
        factory = msg.sender;
        uniswapRouter = IUniswapV2Router02(
            LendingFactory(factory).getUniswapAddress()
        );
        wethToken = IWETH(LendingFactory(factory).getWETHAddress());
    }

    function performLeverageLend() external returns (uint256) {
        require(
            wethToken.approve(address(lendingPool), 2**256 - 1),
            "approve failed."
        );
        console.log("inside leverageLend");
        uint256 daiPrice = priceOracle.getAssetPrice(tokenToBorrow);

        lendingPool.deposit(
            address(wethToken),
            ((amount * 95) / 100),
            address(this),
            referralCode
        );
        (
            uint256 total_collat,
            uint256 totalDEBT,
            uint256 borrowableAmount,
            ,
            ,

        ) = getPositionData();
        borrowAmount = ((10**18 * ((amount * 95) / 100) * leveragePercentage) /
            (daiPrice * 100));
        require(
            borrowAmount <= (borrowableAmount * 10**18) / daiPrice,
            "insufficient amount to borrow"
        );
        console.log(
            "borrow and borrowable amount",
            borrowAmount,
            borrowableAmount,
            totalDEBT
        );
        lendingPool.borrow(
            tokenToBorrow,
            borrowAmount,
            interestRateMode,
            referralCode,
            address(this)
        );

        console.log( //borrowed dai
            "borrowed balance",
            IERC20(tokenToBorrow).balanceOf(address(this))
        );
        (
            ,
            uint256 totalDEBT2,
            uint256 borrowableAmount2,
            ,
            ,

        ) = getPositionData();
        console.log(
            "borrowamount(DAI) , borrowable(ETH), totalDebt(ETH)",
            borrowAmount,
            borrowableAmount2,
            totalDEBT2
        );
        console.log(
            "DAI ,WETH balance,ETH",
            IERC20(tokenToBorrow).balanceOf(address(this)),
            wethToken.balanceOf(address(this)),
            address(this).balance
        );
        IERC20(tokenToBorrow).approve(
            address(uniswapRouter),
            IERC20(tokenToBorrow).balanceOf(address(this))
        );
        address[] memory path = new address[](2);
        path[0] = tokenToBorrow;
        path[1] = uniswapRouter.WETH();
        uniswapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            IERC20(tokenToBorrow).balanceOf(address(this)),
            0,
            path,
            address(this),
            block.timestamp + 60 //1 minute
        );
        console.log(
            "DAI ,WETH balance,ETH",
            IERC20(tokenToBorrow).balanceOf(address(this)),
            wethToken.balanceOf(address(this)),
            address(this).balance
        );
        positionPrice = daiPrice;
        getAmountToClosePositionInETH();
        closePosition();
        return wethToken.balanceOf(address(this)); //amount of current position
    }

    function closePosition() public payable {
        // swap ETH for DAI => repay aave

        (, uint256 totalDebtETH, , , , ) = getPositionData();
        console.log(
            "repay_amount",
            totalDebtETH,
            "WETH balance",
            wethToken.balanceOf(address(this))
        );
        uint256 daiPrice = priceOracle.getAssetPrice(tokenToBorrow);
        // require(
        //     totalDebtETH <= wethToken.balanceOf(address(this)) + msg.value,
        //     "need more ETH to close position"
        // );
        // if (
        //     totalDebtETH <=
        //     (IERC20(tokenToBorrow).balanceOf(address(this)) * daiPrice)
        // ) {
        //     //dont swap
        // } else {
        //     //swap msg.value
        // }

        wethToken.approve(
            address(uniswapRouter),
            wethToken.balanceOf(address(this))
        );
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenToBorrow;
        uniswapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            wethToken.balanceOf(address(this)),
            0,
            path,
            address(this),
            block.timestamp + 60 //1 minute
        );
        console.log(
            "already swap currentDAI : ",
            IERC20(tokenToBorrow).balanceOf(address(this)),
            "already swap currentWETH : ",
            wethToken.balanceOf(address(this))
        );
        console.log("total borrow DAI", borrowAmount);

        IERC20(tokenToBorrow).approve(address(lendingPool), type(uint256).max);

        console.log("already approve dai");
        uint256 amount_repaid = lendingPool.repay(
            tokenToBorrow,
            borrowAmount,
            interestRateMode,
            address(this)
        );
        uint256 amount_withdrawn = lendingPool.withdraw(
            address(wethToken),
            type(uint256).max,
            address(this)
        );

        console.log("already repay", amount_repaid);
        (
            ,
            uint256 totalDEBT3,
            uint256 borrowableAmount3,
            ,
            ,

        ) = getPositionData();
        console.log(
            "before repay:borrowAmount(DAI) , borrowable(ETH), totalDebt(ETH)",
            borrowAmount,
            borrowableAmount3,
            totalDEBT3
        );

        console.log(
            "already swap currentDAI : ",
            IERC20(tokenToBorrow).balanceOf(address(this)),
            wethToken.balanceOf(address(this)),
            address(this).balance
        );
        //repay
        // swap excess DAI to ETH
        // transfer all ETH to owner()
        //update state variable
    }

    function getAmountToClosePositionInETH() public returns (uint256) {
        (, uint256 totalDebtETH, , , , ) = getPositionData();
        // uint256 repay_amount_eth = ((10**18 * totalDebtETH) /
        //     (priceOracle.getAssetPrice(tokenToBorrow)));
        return totalDebtETH;
    }

    function getCurrentPosition() public view returns (uint256) {
        (uint256 totalCollateralETH, , , , , ) = getPositionData();

        return wethToken.balanceOf(address(this)) + totalCollateralETH;
    }

    // uint256 totalCollateralETH,
    // uint256 totalDebtETH,
    // uint256 availableBorrowsETH,
    // uint256 currentLiquidationThreshold,
    // uint256 ltv,
    // uint256 healthFactor
    function getPositionData()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return lendingPool.getUserAccountData(address(this));
    }
}
