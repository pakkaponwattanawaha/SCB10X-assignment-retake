import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { ethers, network } from "hardhat";
import { LENDING_POOL_ADDRESS_PROVIDER, WETH, DAI, UNISWAP_V2_ROUTER } from "../constants/address";


// open one position with POINT_THREE_ZEROS_ONE_ETH at 30 percent -> repay
// open one position with POINT_THREE_ZEROS_ONE_ETH at 70 percent -> repay

describe("LendingFactory", function () {
    this.timeout(300000);
    let accounts: SignerWithAddress[];
    let chainId: number | undefined;
    let deployerAddress: string;

    let LendingFactory: ContractFactory;

    let lendingFactory: Contract;
    let position_0: Contract;
    let position_1: Contract;
    let ticket: Contract;

    let positionAddress_0: string;
    let positionAddress_1: string;
    let amount_0: number;
    let amount_1: number;
    let leveragePercentage_0: number = 30;
    let leveragePercentage_1: number = 70;

    const interestRateMode: number = 1;
    const referralCode: number = 0;
    let _lendingPoolAddressProvider: string, _dai: string, _weth: string, _uniswap: string;
    before(async function (done) {
        this.timeout(300000);

        const accounts = await ethers.getSigners();
        const chainId = network.config.chainId;
        const deployerAddress = accounts[0].address;
        let provider = ethers.getDefaultProvider();
        // console.log("Deploying with ", deployerAddress);
        // console.log("ChainId: ", chainId);

        if (chainId == 31337) {
            console.log("mainnet fork!")
            _lendingPoolAddressProvider = LENDING_POOL_ADDRESS_PROVIDER[1];
            _dai = DAI[1];
            _weth = WETH[1];
            _uniswap = UNISWAP_V2_ROUTER[1];
        } else {
            console.log("testnet env");
            _lendingPoolAddressProvider = LENDING_POOL_ADDRESS_PROVIDER[chainId!];
            _dai = DAI[chainId!];
            _weth = WETH[chainId!];
            _uniswap = UNISWAP_V2_ROUTER[chainId!];
        }
        const LendingFactory = await ethers.getContractFactory("LendingFactory");
        lendingFactory = await LendingFactory.deploy(
            _lendingPoolAddressProvider,
            _dai,
            _weth,
            _uniswap
        );
        await lendingFactory.deployed();
        console.log("Factory depolyed")
        ////// open first position //////
        const tx_pos0 = await lendingFactory
            .connect(accounts[1])
            .openPositionWithETH(
                _dai,
                interestRateMode,
                referralCode,
                leveragePercentage_0,
                {
                    value: ethers.utils.parseEther("0.0001"),
                }
            )
        console.log("after position 0")
        const receipt_0 = await tx_pos0.wait();
        positionAddress_0 = await lendingFactory.getAddressFromPositionId("0");
        position_0 = await ethers.getContractAt("LendingPosition", positionAddress_0);
        console.log("Position 0 opened")
        console.log(await position_0.balance)
        ////// open second position //////
        const tx_pos1 = await lendingFactory
            .connect(accounts[2])
            .openPositionWithETH(
                _dai,
                interestRateMode,
                referralCode,
                leveragePercentage_1,
                {
                    value: ethers.utils.parseEther("0.001"),
                }
            )
        const receipt_1 = await tx_pos1.wait();
        positionAddress_1 = await lendingFactory.getAddressFromPositionId("1");
        position_1 = await ethers.getContractAt("LendingPosition", positionAddress_1);
        console.log("Position 1 opened")
        setTimeout(done, 300000);
    });

    describe("Check variables", function () {
        it("Should set Factory owner to deployer", async function () {
            expect(await lendingFactory.owner()).to.equal(deployerAddress);
        })
    });

    describe("position variable", function () {
        it("Total lootbox should increase", async function () {
            expect(await lendingFactory.totalPosition()).to.equal("1");
        })

        it("check position size", async function () {
            expect(
                (await position_0.amount()
                )).to.equal(ethers.utils.parseEther("0.0001"));
            expect(
                (await position_1.amount()
                )).to.equal(ethers.utils.parseEther("0.001"));
        })
    });

    describe("position balance", function () {
        it("Position 0 WETH", async function () {
            expect(await position_0.balance).to.greaterThanOrEqual((await position_0.amount()) * 0.95 * (await position_0.leveragePercentage()) / 100);
        })
        it("Position 1 WETH", async function () {
            expect(await position_0.balance).to.greaterThanOrEqual((await position_1.amount()) * 0.95 * (await position_1.leveragePercentage()) / 100);
        })
    });

    describe("position variable", function () {
        before(async function (done) {// close Position
            this.timeout(100000);
            await position_0.closePositionWithETH({ value: await position_0.getAdditionalETHToClosePosition(), "gasLimit": 30000000 });
            await position_1.closePositionWithETH({ value: await position_1.getAdditionalETHToClosePosition(), "gasLimit": 30000000 });
            setTimeout(done, 100000);
        })
        it("Close position check", async function () {
            expect(
                (await position_0.borrowAmount()
                )).to.equal(0);
            expect(
                (await position_1.borrowAmount()
                )).to.equal(0);
            expect(
                (await position_0.positionPrice()
                )).to.equal(0);
            expect(
                (await position_1.positionPrice()
                )).to.equal(0);
        })
    });

});
