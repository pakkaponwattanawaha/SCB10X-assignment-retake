//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import { LendingPosition } from "./LendingPosition.sol";
import { IWETH } from "./interfaces/IWETH.sol";
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
    lendingPoolAddressProvider = _lendingPoolAddressProvider;
    dai_address = _dai;
    weth_address = _weth;
    uniswap_address = _uniswap;
    wethToken = IWETH(weth_address);
  }

  function getPositionOwner(uint256 positionId) public view returns (address) {
    return LendingPosition(positionAddress[positionId]).owner();
  }

  function getRecieptAddress() public {}

  function openPositionWithETH(
    address _tokenToBorrow,
    uint256 _interestRateMode,
    uint16 _referralCode,
    uint256 _leveragePercentage
  ) external payable {
    require(
      _leveragePercentage <= maxLeveragePercentage,
      "ltv exceed accepted amount"
    );
    LendingPosition position = new LendingPosition(
      msg.value,
      _tokenToBorrow,
      _interestRateMode,
      _referralCode,
      _leveragePercentage,
      lendingPoolAddressProvider
    );

    wethToken.deposit{ value: msg.value }(); //mint weth to factory
    wethToken.approve(address(this), wethToken.balanceOf(address(this)));
    console.log(
      "WETH balance",
      address(this),
      address(position),
      wethToken.balanceOf(address(this))
    );
    console.log("balance of sender", msg.sender.balance);
    wethToken.transferFrom(
      address(this),
      address(position),
      wethToken.balanceOf(address(this))
    ); // transfer all weth to position

    console.log(
      "after transferFrom",
      position.amount(),
      position.leveragePercentage(),
      wethToken.balanceOf(address(position))
    );
    position.performLeverageLend();

    position.transferOwnership(msg.sender);

    positionAddress[totalPosition] = address(position);
    openedPosition[msg.sender].push(totalPosition);
    allPositions.push(address(position));
    emit openPosition(totalPosition, address(position), msg.sender);
    totalPosition++;
  }

  function closePositionWithETH(uint256 positionId) public payable {
    // check for liquidation (when aToken of position is lower than amount collateral?)
    // or just dont handle casr for liquidation yet just repay
    // get accountDetail and check for amount needed to repay
    // transfer ETH to position address
    // call close position in the lending position
  }

  function getAddressFromPositionId() public {}

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
    return LendingPosition(positionAddress[positionId]).getPositionData();
  }

  function getDaiAddress() public view returns (address) {
    return dai_address;
  }

  function getWETHAddress() public view returns (address) {
    return weth_address;
  }

  function getUniswapAddress() public view returns (address) {
    return uniswap_address;
  }
}
