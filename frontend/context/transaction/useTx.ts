import { useContext } from "react"
import { TX_ACTION, TxContext } from "./TxContext"
import { useError } from "context/errors"
import { Moralis } from "moralis"

export const useTx = () => {
  const { txState, dispatch } = useContext(TxContext)
  const { setError } = useError()

  const initiateTx = () => {
    dispatch({ type: TX_ACTION.INITIATED })
  }

  const pendingTx = (hash: string) => {
    dispatch({ type: TX_ACTION.PENDING, hash })
  }

  const successTx = () => {
    dispatch({ type: TX_ACTION.SUCCESS })
  }

  const clearTx = () => {
    dispatch({ type: TX_ACTION.CLEAR })
  }

  const doTx = async (sendOptions: any) => {
    try {
      initiateTx()
      const tx = await Moralis.executeFunction(sendOptions)
      await handleTx(tx)
      return true
    } catch (err) {
      clearTx()
      setError(err.message, "tx")
    }
  }

  const handleTx = async (transaction: Moralis.ExecuteFunctionResult) => {
    if (!transaction.hash) {
      throw Error("Transaction Failed. No Hash data")
    }

    try {
      pendingTx(transaction.hash)

      //@ts-ignore
      const res = await transaction.wait()
      if (res.blockHash) {
        //TODO:fix this un update state bug
        // if Tx is already closed by user, no need to show the success tx
        // if (txState.stage !== TX_ACTION.CLEAR) {
        //   console.log("xxx", txState.stage)
        //   successTx()
        // }
        successTx()
      } else {
        setError("Transaction failed, please try again.")
      }
    } catch (err) {
      setError(err.message, "tx")
    }
  }

  return { txState, initiateTx, clearTx, doTx, handleTx, pendingTx, successTx }
}
