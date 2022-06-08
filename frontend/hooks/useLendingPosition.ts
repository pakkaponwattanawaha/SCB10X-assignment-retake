import {
    FACTORY_ABI,
    LENDING_FACTORY,
    POSITION_ABI,
    isChainSupport,
} from "contract"
import Router from "next/router"
import { useMoralis, useChain } from "react-moralis"
import { useState } from "react"
import { ethers } from "ethers"
import { useLoading } from "./useLoading"
import { useError } from "context/errors"
import { Position } from "types"

export const useLendingPosition = () => {
    const { web3: moralisProvider, account } = useMoralis()
    const { chain } = useChain()
    const { setError } = useError()
    const { isLoading, onLoad, onDone } = useLoading()
    const [position, setPosition] = useState<Position>(
        {
            owner: ethers.constants.AddressZero,
            isOpened: false,
            isLiquidated: false,
            amount: 0,
            borrowAmount: 0,
            positionPrice: 0,
            address: "",
            interestRateMode: 1,
            referralCode: 0,
            leveragePercentage: 30
        })

    const fetchPosition = async (positionId: number, positionAddress?: string) => {
        onLoad()
        if (!isChainSupport(chain)) {
            return onDone()
        }
        if (!positionAddress && positionId !== -1) {
            const factory = new ethers.Contract(
                LENDING_FACTORY[chain.networkId],
                FACTORY_ABI,
                moralisProvider
            )
            positionAddress = (await factory.functions.getAddressFromPositionId(positionId))[0]
        }

        const positionContract = new ethers.Contract(positionAddress, POSITION_ABI, moralisProvider)
        const pos: Position = {
            owner: (await positionContract.owner()).toString(),
            isOpened: (await positionContract.isOpened()).toString(),
            isLiquidated: (await positionContract.isLiquidated()).toString(),
            amount: (await positionContract.amount()).toString(),
            borrowAmount: (await positionContract.borrowAmount()).toString(),
            positionPrice: (await positionContract.positionPrice()).toString(),
            address: positionAddress.toString(),
            interestRateMode: (await positionContract.interestRateMode()).toString(),
            referralCode: (await positionContract.referralCode()).toString(),
            leveragePercentage: (await positionContract.leveragePercentage()).toString(),
        }
        setPosition(pos)
        onDone()
        return pos
    }

    return { fetchPosition, position, isLoading }
}