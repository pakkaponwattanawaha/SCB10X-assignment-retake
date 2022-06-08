export interface formDataType {
    amount: number,
    tokenToBorrow: string,
    interestRateMode: number,
    referralCode: number,
    leveragePercentage: number
}
export interface Position {
    pid: number,
    owner: string
    isOpened: boolean;
    isLiquidated: boolean;
    amount: number;
    borrowAmount: number;
    positionPrice: number
    address: string;
    interestRateMode: number;
    referralCode: number;
    leveragePercentage: number;

}
