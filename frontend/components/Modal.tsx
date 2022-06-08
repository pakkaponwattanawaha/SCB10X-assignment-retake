interface ModalProps {
  open: boolean
  onClose: () => void
  title?: JSX.Element | string
  content: JSX.Element | string
  confirmButton?: JSX.Element
  zIndex?: number
  bgZIndex?: number
}

export const Modal = ({
  open,
  onClose,
  title,
  content,
  confirmButton,
  zIndex = 20,
  bgZIndex = zIndex - 10,
}: ModalProps) => {
  return (
    <>
      {open ? (
        <>
          <div
            style={{ zIndex: zIndex }}
            className={
              "justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 outline-none focus:outline-none"
            }
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="pt-4 border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {title && (
                  <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                    <h3 className="text-3xl font-medium">{title}</h3>
                  </div>
                )}

                <div className="relative p-6 flex-auto">{content}</div>

                {true && (
                  <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                    {confirmButton}
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ zIndex: bgZIndex }} className={"opacity-25 fixed inset-0 bg-black"}></div>
        </>
      ) : null}
    </>
  )
}
