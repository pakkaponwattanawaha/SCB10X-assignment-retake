import React, { useReducer, Dispatch } from "react"

export enum ErrorAction {
  SHOW_ERROR = "SHOW_ERROR",
  HIDE_ERROR = "HIDE_ERROR",
}

type ErrorState = { show: boolean; message: string }
type ReducerAction =
  | { type: ErrorAction.HIDE_ERROR }
  | { type: ErrorAction.SHOW_ERROR; message: string }

const initialState: ErrorState = { show: false, message: "" }

const errorReducer = (_state: ErrorState, action: ReducerAction): ErrorState => {
  switch (action.type) {
    case ErrorAction.SHOW_ERROR:
      return { show: true, message: action.message }
    case ErrorAction.HIDE_ERROR:
      return initialState
  }
}

type Context = {
  errorState: ErrorState
  dispatch: Dispatch<ReducerAction>
}

export const ErrorContext = React.createContext<Context>({
  errorState: initialState,
  dispatch: () => {
    return
  },
})

interface ErrorProviderProps {
  children: React.ReactNode
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorState, dispatch] = useReducer(errorReducer, initialState)

  return <ErrorContext.Provider value={{ errorState, dispatch }}>{children}</ErrorContext.Provider>
}
