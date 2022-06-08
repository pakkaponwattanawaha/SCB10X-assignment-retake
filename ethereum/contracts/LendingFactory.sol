//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./LendingPosition.sol";
import "./interfaces/IWETH.sol";
import "hardhat/console.sol";

contract LendingFactory is Ownable {
    mapping(uint256 => address) positionAddress;
    mapping(address => uint256[]) openedPosition;

    address[] allPositions;
    uint256 public totalPosition = 0;

    uint256 maxLeveragePercentage = 80;

    address public dai_address;
    address public weth_address;
    address public uniswap_address;
    address public lendingPoolAddressProvider;

    IWETH public wethToken;

    event openPosition(
        uint256 indexed positionId,
        address positionAddress,
        address owner
    );

    constructor(
        address _lendingPoolAddressProvider,
        address _dai,
        address _weth,
        address _uniswap
    ) {
        console.log("Factory creation start");
        lendingPoolAddressProvider = _lendingPoolAddressProvider;
        dai_address = _dai;
        weth_address = _weth;
        uniswap_address = _uniswap;
        wethToken = IWETH(_weth);
        console.log("Factory creation finish");
    }

    function openPositionWithETH(
        address _tokenToBorrow,
        uint256 _interestRateMode,
        uint16 _referralCode,
        uint256 _leveragePercentage
    ) external payable {
        console.log("before require");
        require(
            _leveragePercentage <= maxLeveragePercentage,
            "ltv exceed accepted amount"
        );
        console.log("before creating new position");
        LendingPosition position = new LendingPosition{value: msg.value}(
            totalPosition,
            _tokenToBorrow,
            _interestRateMode,
            _referralCode,
            _leveragePercentage,
            lendingPoolAddressProvider,
            weth_address
        );
        require(
            _leveragePercentage <= maxLeveragePercentage,
            "ltv exceed accepted amount"
        );
        position.performLeverageLend();
        position.transferOwnership(msg.sender);
        positionAddress[totalPosition] = address(position);
        openedPosition[msg.sender].push(totalPosition);
        allPositions.push(address(position));
        emit openPosition(totalPosition, address(position), msg.sender);
        totalPosition++;
    }

    function getPositionOwner(uint256 positionId)
        public
        view
        returns (address)
    {
        return LendingPosition(payable(positionAddress[positionId])).owner();
    }

    function getAddressFromPositionId(uint256 positionId)
        public
        view
        returns (address)
    {
        return positionAddress[positionId];
    }

    function getUserOpenedPosition(address _user)
        public
        view
        returns (uint256[] memory)
    {
        return openedPosition[_user];
    }

    function getPositionDataById(uint256 positionId)
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
        return
            LendingPosition(payable(positionAddress[positionId]))
                .getPositionData();
    }
}
