import React from "react";
import type { NextPage } from "next";
import { useLendingFactory } from "hooks/useLendingFactory";
import { Loading } from "web3uikit";
import Link from "next/link";
import {
  formatWei,
  numberToFixedDigit,
  statusFormatter,
  shortenAddress,
} from "utils";
import { useChain } from "react-moralis";
const Dashboard: NextPage = () => {
  const { chain } = useChain();
  const { allPositionOpened, isLoading } = useLendingFactory();

  return (
    <div className="h-screen bg-gray-50 flex justify-center">
      <div className="centered  rounded w-4/5  mt-10">
        <h2 className="text-[42px] font-bold pb-3">Dashboard </h2>
        {isLoading ? (
          <Loading size={40} spinnerColor="#0022EE" />
        ) : (
          <div className="border bg-white shadow-xl rounded p-5">
            <div className="grid grid-cols-8 justify-items-center items-center font-bold gap-5 border-b px-3 pt-5 pb-3">
              <div>Asset</div>
              <div>Address</div>
              <div>Amount Deposit</div>
              <div>Amount Borrow</div>
              <div>Position Price</div>
              <div>RateMode</div>
              <div>Status</div>
              <div>Percentage</div>
            </div>
            {allPositionOpened ? (
              allPositionOpened.map((position, idx) => {
                return (
                  <Link key={idx} href={`/position/${position.pid}`}>
                    <div
                      className=" grid grid-cols-8 justify-items-center gap-1 border rounded cursor-pointer px-3 py-5 hover:shadow-sm  hover:scale-[102%] transition duration-500"
                      key={idx}
                    >
                      <div>ETH</div>
                      <div>{shortenAddress(position.address)}</div>
                      <div>{formatWei(position.amount).toString()} ETH</div>
                      <div>
                        {formatWei(position.borrowAmount).toString()} DAI
                      </div>
                      <div>
                        {position.positionPrice == 0
                          ? 0
                          : numberToFixedDigit(
                              (10 ** 18 / position.positionPrice).toString(),
                              3
                            )}
                      </div>
                      <div>
                        {position.interestRateMode == 1 ? "Fixed" : "Variable"}
                      </div>
                      <div>{statusFormatter(position)}</div>
                      <div>{position.leveragePercentage}</div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
