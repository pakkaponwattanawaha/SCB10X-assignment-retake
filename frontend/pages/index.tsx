import Router from "next/router";
import { useEffect, useState } from "react";
import { useChain, useMoralis } from "react-moralis";
import { FACTORY_ABI, LENDING_FACTORY } from "contract";
import { ethers } from "ethers";
import { OpenPositionForm } from "components";
import { useTx } from "context/transaction";
import { formDataType } from "types";

const initialFormData = {
  amount: 0,
  tokenToBorrow: "0xff795577d9ac8bd7d90ee22b6c1703490b6512fd",
  interestRateMode: 1,
  referralCode: 0,
  leveragePercentage: 30,
};

const Home = () => {
  const {
    account,
    enableWeb3,
    isWeb3Enabled,
    web3: moralisProvider,
  } = useMoralis();
  const { chain } = useChain();
  const [formData, setFormData] = useState<formDataType>(initialFormData);
  const [balance, setBalance] = useState<number>();
  const { doTx, clearTx } = useTx();

  async function handleFormSumbit(e) {
    console.log(formData, chain.chainId);
    e.preventDefault();
    await openPosition();
  }

  const openPosition = async () => {
    const sendOptions = {
      contractAddress: LENDING_FACTORY[chain.networkId],
      functionName: "openPositionWithETH",
      abi: FACTORY_ABI,
      msgValue: ethers.utils.parseEther(formData.amount.toString()),
      params: {
        _tokenToBorrow: formData.tokenToBorrow.toString(),
        _interestRateMode: formData.interestRateMode.toString(),
        _referralCode: formData.referralCode.toString(),
        _leveragePercentage: formData.leveragePercentage.toString(),
      },
    };
    const isSuccess = await doTx(sendOptions);
    if (isSuccess) {
      setFormData(initialFormData);
    }
  };

  const positionListener = () => {
    const factory = new ethers.Contract(
      LENDING_FACTORY[chain.networkId],
      FACTORY_ABI,
      moralisProvider
    );
    factory.on("openPosition", (positionId, positionAddress, owner) => {
      const pid = Number(positionId.toString());
      if (account?.toUpperCase() === owner?.toUpperCase()) {
        clearTx();
        Router.push("/position/" + pid);
      }
    });
  };
  const getBalance = async () => {
    const balance = moralisProvider
      ? (await moralisProvider.getBalance(account)).toString()
      : "0";
    // console.log(balance);
    setBalance(Number(ethers.utils.formatEther(balance)));
  };

  useEffect(() => {
    if (account) getBalance();
  }, [account]);

  useEffect(() => {
    if (isWeb3Enabled && chain) {
      positionListener();
    } else {
      enableWeb3();
    }
  }, [chain, isWeb3Enabled]);

  return (
    <div className="h-screen bg-gray-50 flex justify-center justify-items-center">
      <div className="flex flex-col  items-center justify-items-center centered  rounded w-3/5  mt-10">
        <h2 className="w-3/5 text-[42px] font-bold pb-3">Leverage Lending </h2>
        <div className=" border w-3/5 bg-white justify-self-center shadow-xl rounded-xl p-5">
          <div className="grid w-fit pt-3  rounded-lg  w-full px-16 py-3">
            <form
              onSubmit={(e) => handleFormSumbit(e)}
              className="w-full max-w-lg"
            >
              <OpenPositionForm
                balance={balance}
                formData={formData}
                setFormData={setFormData}
              />
              <button
                type="submit"
                className="w-full bg-main1 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-5 rounded-2xl focus:outline-none focus:shadow-outline"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
