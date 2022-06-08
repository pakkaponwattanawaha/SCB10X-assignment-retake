import { useEffect, useContext } from "react"
import { ErrorAction, ErrorContext } from "context/errors/ErrorContext"

type ErrorType = "tx" | "server"

export const useError = () => {
  const { errorState, dispatch } = useContext(ErrorContext)

  const setError = (errMessage: string, type?: ErrorType) => {
    if (type === "tx") {
      if (errMessage.includes("User denied transaction signature")) {
        errMessage = "User denied transaction."
      } else {
        console.error("TX ERROR: ", errMessage)
        errMessage = "Transaction failed, please try again."
      }
    } else if (type === "server") {
      console.error("SERVER ERROR: ", errMessage)
      errMessage = "Something went wrong, please refresh the page or contact developer!"
    }

    dispatch({ type: ErrorAction.SHOW_ERROR, message: errMessage })
  }

  const clearError = () => {
    dispatch({ type: ErrorAction.HIDE_ERROR })
  }

  useEffect(() => {
    const { message, show } = errorState
    if (message === "" || !show) return

    const timeout = setTimeout(clearError, 3000)

    return () => clearTimeout(timeout)
  }, [errorState])

  return { errorState, setError, clearError }
}
