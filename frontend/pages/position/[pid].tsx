import React, { useEffect, useState } from "react";
import Router from "next/router";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { LENDING_FACTORY, FACTORY_ABI } from "contract";
import { useLendingPosition } from "hooks/useLendingPosition";
import { Loading } from "web3uikit";
import { MoralisProvider, useChain, useMoralis } from "react-moralis";
import { POSITION_ABI } from "contract";
import { useTx } from "context/transaction";
import { ethers } from "ethers";

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

  const getBalance = async () => {
    const balance = moralisProvider
      ? (await moralisProvider.getBalance(position.address)).toString()
      : "0";
    setBalance(ethers.utils.formatEther(balance));
  };
  useEffect(() => {
    getBalance();
    console.log(position);
  }, [pid, position]);

  useEffect(() => {
    fetchPosition(Number(pid));
    if (isWeb3Enabled && chain && position) {
      positionListener();
    } else {
      enableWeb3();
    }
  }, [chain, isWeb3Enabled]);

  ///// add close position event listener => refresh to use the isOpen boolean to handle///////

  const positionListener = () => {
    const positionContract = new ethers.Contract(
      position.address,
      POSITION_ABI,
      moralisProvider
    );
    positionContract.on("closePosition", (positionAddress, owner) => {
      if (account?.toUpperCase() === owner?.toUpperCase()) {
        clearTx();
        Router.reload();
      }
    });
  };
  return (
    <div>
      pid:{pid}
      <div>
        {isLoading ? (
          <Loading size={40} spinnerColor="#0A0A0A" />
        ) : (
          <>{JSON.stringify(position)}</>
        )}
      </div>
      <div>
        {position &&
        position?.owner?.toUpperCase() === account?.toUpperCase() ? (
          <div>
            <h3>You are the owner of this position</h3>
            <div>{balance.toString()}</div>
            <button
              onClick={(e) => handleClosePosition(e)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Close Position
            </button>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};
export default Pid;
