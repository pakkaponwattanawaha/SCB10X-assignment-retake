import { useMoralis, useWeb3Contract, useChain } from "react-moralis"
import { LENDING_FACTORY, FACTORY_ABI, SUPPORT_CHAINID } from "contract"
import { useEffect, useState } from "react"
import { useLendingPosition } from "./useLendingPosition"
import { ethers } from "ethers"
import { useLoading } from "./useLoading"
import { useError } from "context/errors"
import { Position } from "types"

export const useLendingFactory = () => {
    const { enableWeb3, isWeb3Enabled, web3: moralisProvider, account } = useMoralis()
    const { fetchPosition, position } = useLendingPosition()
    const { chain } = useChain()
    const [allPositionOpened, setAllPositionOpened] = useState<any | undefined>()
    const [allPidOpened, setAllPidOpened] = useState<Number[]>([])

    const { isLoading, onLoad, onDone } = useLoading()

    const getUserOpenedPositionId = async () => {
        const factory = new ethers.Contract(
            LENDING_FACTORY[chain.networkId],
            FACTORY_ABI,
            moralisProvider
        )
        const ids = (await factory.functions.getUserOpenedPosition(account))[0]
        // console.log(ids)
        return ids
    }
    const getUserOpenedPosition = async (positionIds: number[]) => {
        let positions = []
        for (let id of positionIds) {
            const position = await fetchPosition(id)
            positions.push(position)
        }
        return positions
    }
    useEffect(() => {
        const main = async () => {
            const positionIds = await getUserOpenedPositionId()
            setAllPidOpened(positionIds)
            const positions = await getUserOpenedPosition(positionIds)
            // console.log(positions)
            setAllPositionOpened(positions)
            onDone()
        }
        if (isWeb3Enabled && chain) {
            onLoad()
            if (!SUPPORT_CHAINID.includes(chain.chainId)) {
                return
            }
            main()
        } else {
            enableWeb3()
        }
    }, [isWeb3Enabled, chain])
    return { allPositionOpened, allPidOpened, isLoading }
}