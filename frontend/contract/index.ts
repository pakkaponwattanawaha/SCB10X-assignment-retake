import { abi as factoryAbi } from "./LendingFactory/LendingFactory.json"
import { abi as lendingpositionAbi } from "./LendingPosition/LendingPosition.json"
import { abi as priceOracleAbi } from "./interfaces/IPriceOracle.sol/IPriceOracle.json"

export { priceOracleAbi as PRICEORACLE_ABI }
export { factoryAbi as FACTORY_ABI }
export { lendingpositionAbi as POSITION_ABI }

export const LENDING_POOL_ADDRESS_PROVIDER: { [chainId: number]: string } = {
    //mainnet
    1: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    //Kovan
    42: "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
}
export const PRICE_ORACLE: { [chainId: number]: string } = {
    //mainnet
    1: "0xA50ba011c48153De246E5192C8f9258A2ba79Ca9",
    //Kovan
    42: "0xB8bE51E6563BB312Cbb2aa26e352516c25c26ac1",
}
export const LENDING_POOL: { [chainId: number]: string } = {
    //mainnet
    1: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    //Kovan
    42: "0xE0fBa4Fc209b4948668006B2bE61711b7f465bAe",
}

export const WETH_GATEWAY: { [chainId: number]: string } = {
    //mainnet
    1: "0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04",
    //Kovan
    42: "0xA61ca04DF33B72b235a8A28CfB535bb7A5271B70",
}
export const WETH: { [chainId: number]: string } = {
    //mainnet
    1: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    //Kovan
    42: "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
}
export const DAI: { [chainId: number]: string } = {
    //mainnet
    1: "0x6b175474e89094c44da98b954eedeac495271d0f",
    //Kovan
    42: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD", //(aave dai)

}

export const UNISWAP_V2_ROUTER: { [chainId: number]: string } = {
    //mainnet
    1: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    //Kovan (uniswap has low pool on aaveDAI => use DAI but use aaveDAI to get price from priceOracle)
    42: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
}
export const A_WETH: { [chainId: number]: string } = {
    //mainnet
    1: "",
    //Kovan
    42: "0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347",
}

export const LENDING_FACTORY: { [chainId: number]: string } = {
    //mainnet
    1: "",
    //Kovan
    42: "0xC19d3d48BcE197F92bA13d575A31DcD20D48FDa7",
}

export const LENDING_POSITION_0: { [chainId: number]: string } = {
    //mainnet
    1: "",
    //Kovan
    42: " 0xdEdd4918F46952Ae2DEA440d505a7E03689ad558",
}
export const SUPPORT_CHAINID = ["0x2a"]

export const isChainSupport = (chain: any) => {
    if (!chain || !chain.chainId) {
        return false
    }
    if (!SUPPORT_CHAINID.includes(chain.chainId)) {
        return false
    }
    return true
}

export enum CHAIN_SUPPORT {
    "KOVAN" = "Ethereum Kovan",
}

interface CHAIN_DETAIL {
    name: string
    shortName: string
    src: string
    icon: string
    color: string
    scan: string
    currency: string
}

export const CHAINID_TO_DETAIL: { [chainId: string]: CHAIN_DETAIL } = {

    "0x2a": {
        name: "Ethereum Kovan",
        shortName: "Kovan",
        src: "ethereum",
        icon: "eth",
        color: "#e7b527",
        scan: "https://kovan.etherscan.io/tx/",
        currency: "ETH",
    },

}
