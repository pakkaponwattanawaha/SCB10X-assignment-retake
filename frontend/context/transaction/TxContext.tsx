import { createContext, useReducer, Dispatch } from "react"

export enum TX_ACTION {
  INITIATED = "Confirm Transaction",
  PENDING = "Transaction Pending",
  SUCCESS = "Transaction Completed",
  CLEAR = "Clearing Transaction",
}

type TxState = { show: boolean; hash: string; stage: TX_ACTION }

type txReducerAction =
  | { type: TX_ACTION.INITIATED }
  | { type: TX_ACTION.PENDING; hash: string }
  | { type: TX_ACTION.SUCCESS }
  | { type: TX_ACTION.CLEAR }

const initialState: TxState = { show: false, hash: "", stage: TX_ACTION.CLEAR }

const txReducer = (_state: TxState, action: txReducerAction): TxState => {
  switch (action.type) {
    case TX_ACTION.INITIATED:
      return { show: true, hash: "", stage: TX_ACTION.INITIATED }
    case TX_ACTION.PENDING:
      return { show: true, hash: action.hash, stage: TX_ACTION.PENDING }
    case TX_ACTION.SUCCESS:
      return { show: true, hash: _state.hash, stage: TX_ACTION.SUCCESS }
    case TX_ACTION.CLEAR:
      return initialState
  }
}

type txContext = {
  txState: TxState
  dispatch: Dispatch<txReducerAction>
}

export const TxContext = createContext<txContext>({
  txState: initialState,
  dispatch: () => {
    return
  },
})

interface TxProviderProps {
  children: React.ReactNode
}

export const TxProvider: React.FC<TxProviderProps> = ({ children }) => {
  const [txState, dispatch] = useReducer(txReducer, initialState)

  return <TxContext.Provider value={{ txState, dispatch }}>{children}</TxContext.Provider>
}
