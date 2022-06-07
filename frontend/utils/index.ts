export const openInNewTab = (url: string) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer")
    if (newWindow) newWindow.opener = null
}

export const shortenAddress = (address: string) => {
    if (!address || address.length === 0) {
        return "0x000...00000"
    }
    return address.substring(0, 6) + "..." + address.substring(address.length - 6, address.length)
}