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

  useEffect(() => {
    if (isWeb3Enabled && chain) {
      positionListener();
    } else {
      enableWeb3();
    }
  }, [chain, isWeb3Enabled]);

  return (
    <div className="w-0.8 p-16 grid justify-items-center ">
      <div className="grid pl-16 w-full justify-items-start ">
        <h2 className="text-[42px] font-bold">Leverage Lending </h2>
      </div>
      <div className="grid pl-16 pt-8 justify-items-start rounded-lg  w-full ">
        <div className="w-3/4">
          <form
            onSubmit={(e) => handleFormSumbit(e)}
            className="w-full max-w-lg"
          >
            <OpenPositionForm formData={formData} setFormData={setFormData} />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
