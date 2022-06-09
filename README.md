# SCB 10X Smart Contract Engineer Test
 - Deployment Url: https://scb-10x-assignment-retake.vercel.app/
### Table of content

   - [Smart Contract](#smart-contract)
     - [Stack used](#stack-used)
     - [Design pattern](#design-pattern)
     - [How to run](#how-to-run)
     - [testing](#testing)
  - [Frontend](#frontend)
    - [Stack used](#stack-used-1)
    - [Design pattern](#design-pattern-1)
    - [How to run](#how-to-run-1)
    - [Deployment Environment](#deployment-environment)
  - [Demo](#demo)
    - [Home page](#home-page)
    - [Lending](#lending)
    - [Lending transaction](#lending-transaction)
    - [Lending position](#lending-position)
    - [Dashboard](#dashboard)
    - [Position Detail](#position-detail)
    - [Closing Position](#closing-position)
  - [Additional features](#additional-features)
  - [Possible Improvements](#possible-improvements)
# Smart Contract:
### Stack used 
  - Development environment : hardhat
  - Chain : Ethereum + solidity 
  - Network : Ethereum Kovan, main-net fork
  - testing : chai + ethers (testing still have timeout issue)
  - DEX : Uniswap
  - Lending protocol : Aave
  - Oracle : Aave Price Oracle
  - Libraries : Openzeppelin , hardhat console
  - Provider : Infura.io
  
### Design Pattern

The design of the smart contract we use the Factory and product design pattern mainly because ease of position management
Main benefits is to separating each position, able to hold position values separately for every and Factory can still track/manage all the position.

![Factory and product](https://user-images.githubusercontent.com/54467698/172827327-7554c2ae-09b4-41b9-b035-f0b64bf80b61.png)

Factory and Product Pattern

![diagram-Page-2 drawio (3)](https://user-images.githubusercontent.com/54467698/172893884-6f91d8e0-173b-47c8-8fa6-c7e6da9ca879.png)

Overview of user opening a position 

![diagram-Page-3 drawio](https://user-images.githubusercontent.com/54467698/172893955-d5cd979c-6c8a-4c35-be2c-c3ee0e6f93c7.png)

Overview of user closing a position 
### How to run

Deploy LendingFactory.sol with

 `npx hardhat run scripts/deploy.ts --network kovan`

 Then Update `LENDING_FACTORY` variable in ethereum/constant/address.ts to the deployed factory address

 Optional: 
 
 `npx hardhat run scripts/open-position_0.ts --network kovan`

 `npx hardhat run scripts/verify.ts --network kovan`

 `npx hardhat run scripts/close-position_0.ts --network kovan`

 Update `LENDING_POSITION_0` variable in ethereum/constant/address.ts to the deployed position address

 Also update the same variable in frontend/contract/index.ts to make frontend connect with the deployed contract

### Testing
- For testing we mainly use `chai`  
- To test simply run
  `npx hardhat test`
  
  
# Frontend
### Stack used 
  - Framework : Next.js
  - Styling : Tailwind CSS
  - Provider: Moralis
  - Library: ethers + web3uikit
  - Deploying Environment: Vercel + fleek([fleek is down at the moment](https://forum.dfinity.org/t/is-the-network-down-for-anyone-else/13613))
  - https://scb-10x-assignment-retake.vercel.app/

### How to run

 `npm install`
 
 `npm run dev `
 
   or
   
 `yarn install`
 
 `yarn dev`

### Deployment Environment

Vercel `https://scb-10x-assignment-retake.vercel.app/`

Fleek.co  ` `

# Demo

### Home page
<img width="1440" alt="Screen Shot 2565-06-09 at 16 18 49" src="https://user-images.githubusercontent.com/54467698/172828809-a3b7674a-c244-4c6b-81ae-3470c1053435.png">

### Lending
- the smart contract is set to keep 5% of deposit amount as buffer for possible price fluctuation
<img width="1440" alt="Screen Shot 2565-06-09 at 16 22 11" src="https://user-images.githubusercontent.com/54467698/172828875-f136dac2-f547-4fe8-8037-a1c34190138c.png">

### Lending transaction

<img width="1440" alt="Screen Shot 2565-06-09 at 16 22 11" src="https://user-images.githubusercontent.com/54467698/172828911-121c4528-324b-496a-bd3f-c9c00a8763aa.png">
 
<img width="414" alt="Screen Shot 2565-06-09 at 16 22 35" src="https://user-images.githubusercontent.com/54467698/172828931-93e98b24-8fe0-48ff-914d-dd8bc4fe84bb.png">

### Lending position
- Noted that in mainnet the balance of lending position should be percentage of Lending Percentage given but in testnet uniswap pool price is not accurate resulting in inaccurate balance (technically just swap all ETH to DAI then lend ETH is more profitable)
- Also the Oracle used to determine borrowable DAI amount is by Aave not Uniswap.
 
<img width="1440" alt="Screen Shot 2565-06-09 at 16 23 18" src="https://user-images.githubusercontent.com/54467698/172829037-030ea6ad-6e60-478e-8d6f-5df3f771e584.png">

### Dashboard
- Dashboard will display all position owned by user 
<img width="1440" alt="Screen Shot 2565-06-09 at 16 20 58" src="https://user-images.githubusercontent.com/54467698/172829111-0b00fdc2-5b77-4f7e-825f-2143ef3ffe9b.png">

### Position Detail
 - The application will calulate addition ETH needed to close position if PNL is negative
<img width="1440" alt="Screen Shot 2565-06-09 at 16 23 00" src="https://user-images.githubusercontent.com/54467698/172829210-cfa9a9ef-352a-4c08-829f-7b2e38852e45.png">

### Closing Position
- closing position might automatically require extra ETH depend on current ETH to DAI price
<img width="1440" alt="Screen Shot 2565-06-09 at 16 27 05" src="https://user-images.githubusercontent.com/54467698/172829266-0c8c285a-89bf-4132-8c5d-080245812f1d.png">
<img width="1440" alt="Screen Shot 2565-06-09 at 16 27 55" src="https://user-images.githubusercontent.com/54467698/172829277-728a3460-a697-4841-8c6d-c7c7e563439b.png">
- position is repaid and transfer back to user
<img width="1440" alt="Screen Shot 2565-06-09 at 16 28 08" src="https://user-images.githubusercontent.com/54467698/172829292-f697f413-46f2-430c-b65b-82b60201fb72.png">

# Additional features
 - (Bonus) able to close position and get 1.0x ETH back 
 - (Bonus) unit testing
 - variable lending rate (from 0 to 80% for ETH-DAI)
 - automatic additional ETH to close position calculation
 - liquidation handling (for status displaying) 
 - event listener
 - Dashboard for all opened position
 - block explorer

# Possible Improvements
- Use buffer or api provider to fetch data faster(eg. thegraph)
- Mint recipt token for user
- Withdraw current balance of liquidated position
- Display current interest rate and accumulated interest 
