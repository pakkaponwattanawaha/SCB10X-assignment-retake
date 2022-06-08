import { useEffect } from "react"
import { useNotification } from "web3uikit"
import { TIconType } from "web3uikit/dist/components/Icon/collection"
import { IPosition, notifyType } from "web3uikit/dist/components/Notification/types"
import { useError } from "./useError"

export const ErrorModal = () => {
  const { errorState } = useError()

  const dispatch = useNotification()

  const handleNewNotification = (type: notifyType, icon?: TIconType, position?: IPosition) => {
    dispatch({
      type,
      message: errorState.message,
      title: "Error",
      icon,
      position: position || "topR",
    })
  }

  useEffect(() => {
    if (errorState.show) {
      handleNewNotification("error")
    }
  }, [errorState.message])

  return (
    <>
      {errorState.show && (
        <div className="absolute z-10 top-5 left-1/2 transform -translate-x-1/2"></div>
      )}
    </>
  )
}
