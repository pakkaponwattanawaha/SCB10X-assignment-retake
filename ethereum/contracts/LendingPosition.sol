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
    bool public isOpened = false;

    uint256 public pid;
    uint256 public amount;
    uint256 public borrowAmount;
    uint256 public positionPrice;
    address public tokenToBorrow;
    uint256 public interestRateMode;
    uint16 public referralCode;
    uint256 public leveragePercentage;

    IWETH public wethToken;

    ILendingPool public lendingPool;
    IPriceOracle public priceOracle;

    ILendingPoolAddressesProvider public lendingPoolAddressProvider;
    IUniswapV2Router02 public uniswapRouter;

    address factory;

    event closePosition(address indexed positionAddress, address owner);

    constructor(
        uint256 _pid,
        address _tokenToBorrow,
        uint256 _interestRateMode,
        uint16 _referralCode,
        uint256 _leveragePercentage,
        address _lendingPoolAddressProvider,
        address _weth
    ) payable {
        amount = msg.value;
        pid = _pid;
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

    function performLeverageLend() public onlyOwner returns (uint256) {
        require(isOpened == false, "already open position");
        wethToken.deposit{value: (address(this).balance * 95) / 100}();
        wethToken.approve(address(lendingPool), 2**256 - 1);
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

        lendingPool.borrow(
            tokenToBorrow,
            borrowAmount,
            interestRateMode,
            referralCode,
            address(this)
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
        isOpened = true;
        return address(this).balance; //amount of current position
    }

    function closePositionWithETH() public payable onlyOwner {
        require(!isLiquidated(), "position liquidated");
        require(isOpened, "position closed");
        (, uint256 totalDebtETH, , , , ) = getPositionData();
        console.log(
            "require block ",
            totalDebtETH,
            address(this).balance + msg.value
        );
        console.log(
            "repay_amount",
            totalDebtETH,
            "WETH balance",
            wethToken.balanceOf(address(this))
        );
        uint256 daiPrice = priceOracle.getAssetPrice(tokenToBorrow);

        ///// Normally in mainnet we would need this
        ////  But the uniswap ETH <-> aave DAI rate in testnet make balance wierd

        // require(
        //     totalDebtETH <= (address(this).balance + msg.value),
        //     "need more ETH to close position"
        // );

        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenToBorrow;
        uniswapRouter.swapExactETHForTokensSupportingFeeOnTransferTokens{
            value: address(this).balance
        }(
            0,
            path,
            address(this),
            block.timestamp + 60 //1 minute
        );

        IERC20(tokenToBorrow).approve(address(lendingPool), type(uint256).max);

        uint256 amount_repaid = lendingPool.repay(
            tokenToBorrow,
            type(uint256).max,
            interestRateMode,
            address(this)
        );
        (
            uint256 totalCollateralETH4,
            uint256 totalDebtETH4,
            uint256 availableBorrowsETH4,
            uint256 currentLiquidationThreshold4,
            uint256 ltv4,
            uint256 healthFactor4
        ) = getPositionData();

        uint256 amount_withdrawn = lendingPool.withdraw(
            address(wethToken),
            type(uint256).max,
            address(this)
        );

        swapAllERC20ToETH(tokenToBorrow);
        withDrawAllWETH();

        payable(msg.sender).transfer(address(this).balance);
        isOpened = false;
        borrowAmount = 0;
        positionPrice = 0;
        emit closePosition(address(this), owner());
    }

    function getAdditionalETHToClosePosition() public view returns (uint256) {
        return (getTotalDebtETH() -
            ((amount * leveragePercentage * 95) / 10000));
    }

    function isLiquidated() public view returns (bool) {
        // Aave position is close but by owner
        return (borrowAmount > 0) && (getTotalDebtETH() == 0);
    }

    function swapAllERC20ToETH(address _token) internal {
        uint256 TokenBalance = IERC20(_token).balanceOf(address(this));
        if (TokenBalance > 0) {
            IERC20(_token).approve(address(uniswapRouter), TokenBalance);
            address[] memory path = new address[](2);
            path[0] = _token;
            path[1] = uniswapRouter.WETH();
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
