import React, { useEffect, useState } from "react";
import Router from "next/router";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import {
  PRICEORACLE_ABI,
  PRICE_ORACLE,
  DAI,
  CHAINID_TO_DETAIL,
} from "contract";
import { useLendingPosition } from "hooks/useLendingPosition";
import { Loading } from "web3uikit";
import { useChain, useMoralis } from "react-moralis";
import { POSITION_ABI } from "contract";
import { useTx } from "context/transaction";
import { ethers } from "ethers";
import {
  formatWei,
  numberToFixedDigit,
  openInNewTab,
  shortenAddress,
  statusFormatter,
} from "utils";
import { PositionData } from "types";

const Pid: NextPage = () => {
  const router = useRouter();
  const { pid } = router.query;
  const {
    enableWeb3,
    isWeb3Enabled,
    web3: moralisProvider,
    account,
  } = useMoralis();
  const { chain } = useChain();
  const { fetchPosition, position, isLoading } = useLendingPosition();
  const [balance, setBalance] = useState<String>("");
  const [daiPrice, setDaiPrice] = useState<number>();
  const [positionData, setPositionData] = useState<PositionData>();

  const { doTx, clearTx } = useTx();

  async function handleClosePosition(e) {
    e.preventDefault();
    await closePosition();
  }
  const getAdditionalETHToClosePosition = async () => {
    const positionContract = new ethers.Contract(
      position.address,
      POSITION_ABI,
      moralisProvider
    );
    const additionalAmount = (
      await positionContract.functions.getAdditionalETHToClosePosition()
    )[0].toString();
    console.log(additionalAmount);
    return additionalAmount;
  };
  const getPositionData = async () => {
    const positionContract = new ethers.Contract(
      position.address,
      POSITION_ABI,
      moralisProvider
    );
    const positionData = await positionContract.functions.getPositionData();
    let ret = {
      totalCollateralETH: Number(positionData[0]),
      totalDebtETH: Number(positionData[1]),
      availableBorrowsETH: Number(positionData[2]),
      currentLiquidationThreshold: Number(positionData[3]),
      ltv: Number(positionData[4]),
      healthFactor: Number(positionData[5]),
    };
    setPositionData(ret);
    console.log("positionData", ret);
    return positionData;
  };
  const closePosition = async () => {
    const value = await getAdditionalETHToClosePosition();
    const sendOptions = {
      contractAddress: position.address,
      functionName: "closePositionWithETH",
      abi: POSITION_ABI,
      msgValue: value, // get addition eth to close!
    };
    await doTx(sendOptions);
  };
  const getCurrentDAIPrice = async () => {
    const priceOracleContract = new ethers.Contract(
      PRICE_ORACLE[chain.networkId],
      PRICEORACLE_ABI,
      moralisProvider
    );
    const daiPrice = (
      await priceOracleContract.functions.getAssetPrice(DAI[chain.networkId])
    )[0];
    setDaiPrice(Number(daiPrice));
    return daiPrice;
  };
  const getBalance = async () => {
    const balance = moralisProvider
      ? (await moralisProvider.getBalance(position.address)).toString()
      : "0";
    setBalance(
      numberToFixedDigit(
        ethers.utils.formatEther(balance).toString(),
        8
      ).toString()
    );
  };
  useEffect(() => {
    if (position && position?.address) {
      getBalance();
      if (moralisProvider) getPositionData();
    }
  }, [position]);

  useEffect(() => {
    fetchPosition(Number(pid));
    if (isWeb3Enabled && chain && position) {
      getCurrentDAIPrice();
      positionListener();
    } else {
      enableWeb3();
    }
  }, [pid, chain, isWeb3Enabled]);

  const positionListener = () => {
    const positionContract = new ethers.Contract(
      position.address,
      POSITION_ABI,
      moralisProvider
    );
    positionContract.on("closePosition", (positionAddress, owner) => {
      if (account?.toUpperCase() === owner?.toUpperCase()) {
        clearTx();
        // Router.reload();
      }
    });
  };
  const pnlInDAI =
    position.positionPrice == 0
      ? 0
      : numberToFixedDigit(
          (
            (1 / daiPrice - 1 / position.positionPrice) *
            position.borrowAmount
          ).toString(),
          8
        );
  return (
    <div className="h-screen bg-gray-50 flex justify-center gap-2">
      <div className="centered  rounded w-1/2  mt-10">
        <h2 className="text-[42px] font-bold pb-3">Position Detail </h2>
        <div>
          {isLoading ? (
            <Loading size={40} spinnerColor="#0022EE" />
          ) : (
            <div className="border bg-white shadow-xl rounded-xl p-5">
              <div>
                <h4 className="text-[24px] font-bold pb-3">Supply Info </h4>
                <div className="cursor-pointer">
                  <span>Position Address: </span>
                  <a
                    className="font-bold"
                    onClick={() => {
                      openInNewTab(
                        CHAINID_TO_DETAIL[chain.chainId].scan +
                          "address/" +
                          position.address
                      );
                    }}
                  >
                    {shortenAddress(position.address)}
                  </a>
                </div>
                <div>Status :{statusFormatter(position)}</div>
                <div>Deposit Amount: {formatWei(position.amount)} ETH</div>
                <div>
                  Position Price:{" "}
                  {position.positionPrice == 0
                    ? 0
                    : 10 ** 18 / position.positionPrice}
                </div>

                <h4 className="text-[24px] font-bold py-3">Borrow Info </h4>
                <div>Borrow Amount: {formatWei(position.borrowAmount)} DAI</div>
                <div>Current ETH price: {10 ** 18 / daiPrice}</div>
                <div>
                  Interest Rate Mode:{" "}
                  {position.interestRateMode === 1 ? "Fixed" : "Variable"}
                </div>
                <div>Leverage Percentage: {position.leveragePercentage} %</div>

                <div>PNL: {pnlInDAI} DAI </div>
              </div>
              <div className="mt-5">
                {position &&
                position?.owner?.toUpperCase() === account?.toUpperCase() ? (
                  <div>
                    <button
                      onClick={(e) => handleClosePosition(e)}
                      className="bg-main1 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Close Position
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="centered  rounded w-1/3  mt-10 pt-[75px]">
        <div>
          {!isLoading && positionData ? (
            <div className="border bg-white shadow-xl rounded-xl p-5">
              <h4 className="text-[24px] font-bold pb-3">Aave Details </h4>
              <div>
                Total Collateral:{formatWei(positionData.totalCollateralETH)}{" "}
                ETH
              </div>
              <div>Total Debt: {formatWei(positionData.totalDebtETH)} ETH</div>
              <div>
                Available Borrows: {formatWei(positionData.availableBorrowsETH)}{" "}
                ETH
              </div>
              <div>
                Current Liquidation Treshold:{" "}
                {positionData.currentLiquidationThreshold / 100} %
              </div>
              <div>Loan To Value: {positionData.ltv / 100} %</div>
              <div>Health Factor: {positionData.healthFactor}</div>
            </div>
          ) : (
            <Loading size={40} spinnerColor="#0022EE" />
          )}
        </div>
      </div>
    </div>
  );
};
export default Pid;
