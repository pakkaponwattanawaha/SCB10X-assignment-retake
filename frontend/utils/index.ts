import { ethers } from "ethers"
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
export const numberToFixedDigit = (value: string, decimals: number) => {
    return Number(Number(value).toFixed(decimals))
}
export const formatWei = (wei: number) => {
    if (isNaN(wei)) return 0;
    const Ethers = ethers.utils.formatEther(wei.toString())
    return numberToFixedDigit(Ethers.toString(), 6).toString();
}
export const statusFormatter = (position: any): string => {
    if (position.isLiquidated === "true") return "Liquidated";
    if (position.isOpened === "false") return "Closed";
    return "Active";
};