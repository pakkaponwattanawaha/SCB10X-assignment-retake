import { useState } from "react"

export const useLoading = () => {
  const [isLoading, setLoading] = useState(false)

  const onLoad = () => setLoading(true)
  const onDone = () => setLoading(false)

  const showResult = (LoadingComponent: JSX.Element, RenderComponent: JSX.Element) => {
    if (isLoading) {
      return
    } else {
      return RenderComponent
    }
  }

  return { isLoading, onLoad, onDone, showResult }
}
