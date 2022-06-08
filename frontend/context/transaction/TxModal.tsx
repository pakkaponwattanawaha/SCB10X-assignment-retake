import { Loading, Illustration } from "web3uikit";
import { Modal } from "components";
import { useTx } from "./useTx";
import { TX_ACTION } from "./TxContext";
import { useChain } from "react-moralis";
import { shortenAddress, openInNewTab } from "utils";
import { CHAINID_TO_DETAIL, isChainSupport } from "contract";
import { useEffect, useState } from "react";

export const TxModal = () => {
  const { txState, clearTx } = useTx();
  const { hash, show, stage } = txState;
  const { chain } = useChain();

  const [url, setUrl] = useState("");

  useEffect(() => {
    const url =
      chain && isChainSupport(chain)
        ? CHAINID_TO_DETAIL[chain.chainId].scan + "tx/" + hash
        : "http://wrong-chain/" + hash;
    setUrl(url);
  }, [hash, chain]);

  const showText = () => {
    if (stage === TX_ACTION.INITIATED) {
      return (
        <div className="font-light mt-5 text-center">
          <h3>Your transaction is pending.</h3>
          <h3>Please confirm the transaction!</h3>
        </div>
      );
    }

    if (stage === TX_ACTION.PENDING) {
      return (
        <div className="font-light mt-5 text-center">
          <h3>Your transaction is already submitted on the blockchain.</h3>
          <h3> It should be mined shortly!</h3>
        </div>
      );
    }
  };

  const content = (
    <div className="flex flex-col items-center text-black w-100">
      <h3 className="p-4 text-xl font-medium">{stage}</h3>

      {[TX_ACTION.INITIATED, TX_ACTION.PENDING].includes(stage) && (
        <div className="m-12">
          <Loading size={40} spinnerColor="#0022EE" />
        </div>
      )}

      {showText()}

      {[TX_ACTION.PENDING, TX_ACTION.SUCCESS].includes(stage) && (
        <div className="p-5 items-center text-center justify-center">
          {stage === TX_ACTION.SUCCESS && (
            <Illustration width={100} height={100} logo="confirmed" />
          )}
          <button
            className="pt-5 underline text-main1"
            onClick={() => openInNewTab(url)}
          >
            Transaction Hash: {shortenAddress(hash)}
          </button>
        </div>
      )}
    </div>
  );
  return (
    <>
      <div>
        <Modal
          zIndex={100}
          bgZIndex={60}
          open={show}
          onClose={() => clearTx()}
          content={content}
        />
      </div>
    </>
  );
};
