//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/ILendingPool.sol";
import "./interfaces/ILendingPoolAddressesProvider.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/IWETH.sol";
import "./LendingFactory.sol";

import "hardhat/console.sol";

contract LendingPosition is Ownable {
    // bool isRepay;
    // bool isLiquidated; // check when try to repay if this address still own aWETH or what ever aave use

    uint256 public amount;
    uint256 public borrowAmount;
    uint256 public positionPrice;
    address public tokenToBorrow;
    uint256 public interestRateMode;
    uint16 public referralCode;
    uint256 public leveragePercentage;

    uint256 public amountBorrowedSwapped;

    IWETH public wethToken;

    ILendingPool public lendingPool;
    IPriceOracle public priceOracle;

    ILendingPoolAddressesProvider public lendingPoolAddressProvider;
    IUniswapV2Router02 public uniswapRouter;

    address factory;

    constructor(
        address _tokenToBorrow,
        uint256 _interestRateMode,
        uint16 _referralCode,
        uint256 _leveragePercentage,
        address _lendingPoolAddressProvider,
        address _weth
    ) payable {
        amount = msg.value;
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
            LendingFactory(factory).uniswap_address()
        );
        wethToken = IWETH(_weth);
    }

    // constructor(
    //       address _tokenToBorrow,
    //       uint256 _interestRateMode,
    //       uint16 _referralCode,
    //       uint256 _leveragePercentage,
    //       address _lendingPoolAddressProvider,
    //       address _weth
    //   ) payable {}

    function getWETH() public {
        wethToken.deposit{value: (address(this).balance * 95) / 100}();
    }

    function performLeverageLend() public returns (uint256) {
        // dont always use stuff from constructor
        wethToken.deposit{value: (address(this).balance * 95) / 100}();
        wethToken.approve(address(lendingPool), 2**256 - 1);

        // console.log("inside leverageLend");
        uint256 daiPrice = priceOracle.getAssetPrice(tokenToBorrow);

        lendingPool.deposit(
            address(wethToken),
            ((amount * 95) / 100),
            address(this),
            referralCode
        );
        (, , uint256 borrowableAmount, , , ) = getPositionData();
        borrowAmount = ((10**18 * ((amount * 95) / 100) * leveragePercentage) /
            (daiPrice * 100));
        // require(
        //     borrowAmount <= (borrowableAmount * 10**18) / daiPrice,
        //     "insufficient amount to borrow"
        // );
        // console.log(
        //     "borrow and borrowable amount",
        //     borrowAmount,
        //     borrowableAmount,
        //     totalDEBT
        // );

        lendingPool.borrow(
            tokenToBorrow,
            borrowAmount,
            interestRateMode,
            referralCode,
            address(this)
        );

        // console.log( //borrowed dai
        //     "borrowed balance",
        //     IERC20(tokenToBorrow).balanceOf(address(this))
        // );
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
        //TRADE DAI -> ETH (bc kovan dont have DAI -> WETH)
        uniswapRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
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
        return wethToken.balanceOf(address(this)); //amount of current position
    }

    function closePositionWithETH() public payable onlyOwner {
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

        //swap all weth to DAI (need to be more than borrow + fee)
        // wethToken.approve(
        //     address(uniswapRouter),
        //     wethToken.balanceOf(address(this))
        // );

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenToBorrow;
        uniswapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: address(this).balance
        }(
            // address(this).balance,
            0,
            path,
            address(this),
            block.timestamp + 60 //1 minute
        );
        // console.log(
        //     "already swap currentDAI : ",
        //     IERC20(tokenToBorrow).balanceOf(address(this)),
        //     "already swap currentWETH : ",
        //     wethToken.balanceOf(address(this))
        // );
        // console.log("total borrow DAI", borrowAmount);

        IERC20(tokenToBorrow).approve(address(lendingPool), type(uint256).max);

        // console.log("already approve dai");
        uint256 amount_repaid = lendingPool.repay(
            tokenToBorrow,
            type(uint256).max,
            interestRateMode,
            address(this)
        );
        // cannot withdraw bc we didnot repay all debt + fee => need to be more than borrowed
        (
            uint256 totalCollateralETH4,
            uint256 totalDebtETH4,
            uint256 availableBorrowsETH4,
            uint256 currentLiquidationThreshold4,
            uint256 ltv4,
            uint256 healthFactor4
        ) = getPositionData();

        console.log(
            totalCollateralETH4,
            totalDebtETH4,
            availableBorrowsETH4,
            healthFactor4
        );

        uint256 amount_withdrawn = lendingPool.withdraw(
            address(wethToken),
            type(uint256).max,
            address(this)
        );
        // console.log("already withdraw from aave");
        swapAllERC20ToETH(tokenToBorrow);
        withDrawAllWETH();

        payable(msg.sender).transfer(address(this).balance); // user need get position address and call close from frontend
        console.log(
            "already swap currentDAI : ",
            IERC20(tokenToBorrow).balanceOf(address(this)),
            wethToken.balanceOf(address(this)),
            address(this).balance
        );
    }

    function getAdditionalETHToClosePosition() public {}

    function swapAllERC20ToETH(address _token) internal {
        uint256 TokenBalance = IERC20(_token).balanceOf(address(this));
        if (TokenBalance > 0) {
            IERC20(_token).approve(address(uniswapRouter), TokenBalance);
            address[] memory path = new address[](2);
            path[0] = _token;
            path[1] = uniswapRouter.WETH();
            // console.log(IERC20(_token).balanceOf(address(this)));
            uniswapRouter.swapExactTokensForETH(
                TokenBalance,
                0,
                path,
                address(this),
                block.timestamp + 60
            );
        }
    }

    function withDrawAllWETH() internal {
        uint256 TokenBalance = wethToken.balanceOf(address(this));
        if (TokenBalance > 0) {
            wethToken.withdraw(TokenBalance);
        }
    }

    function getTotalDebtETH() public view returns (uint256) {
        (, uint256 totalDebtETH, , , , ) = getPositionData();
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

    fallback() external payable {}
}
