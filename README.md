# SCB 10X Smart Contract Engineer Test
# Table of content
  - Smart Contract
    - Stack used
    - Design pattern
    - How to run
    - testing
  - Frontend
    - Stack used
    - design pattern
    - How to run
    - Deployment  Environment
  - Demo
    - Home page
    - Lending
    - Lending transaction
    - Lending position
    - Dashboard
    - Position Detail
    - Closing Position
# Smart Contract:
### Stack used 
  - Development environment : hardhat
  - network : Ethereum Koran, main-net fork
  - EVM : solidity 
  - testing : chai + ethers (testing still have timeout issue)
  - DEX : Uniswap
  - DeFi protocol : Aave
  - Oracle : Aave Price Oracle
  - Library : Openzeppelin , hardhat console
  - Provider : Infura.io
### Design Pattern

The design of the smart contract use the Factory and product design pattern 
With the benefit of separating each position and able to hold position value separately between each 

![Factory and product](https://user-images.githubusercontent.com/54467698/172827327-7554c2ae-09b4-41b9-b035-f0b64bf80b61.png)
![diagram-Page-2 drawio (1)](https://user-images.githubusercontent.com/54467698/172827483-ecf6261c-b776-40c8-abc5-8e7953274ae3.png)
### How to run
`npx hardhat run scripts/deploy.ts --network kovan`

Update `LENDING_FACTORY` variable in ethereum/constant/address to the deployed factory address

`npx hardhat run scripts/open-position_0.ts --network kovan`

`npx hardhat run scripts/verify.ts --network kovan`

`npx hardhat run scripts/close-position_0.ts --network kovan`

Update `LENDING_POSITION_0` variable in ethereum/constant/address.ts to the deployed position address

Also update the same variable in frontend/contract/index.ts to make frontend fetch the deployed contract
### Testing
`npx hardhat test`
# Frontend
### Stack used 
  - Framework : Next.js
  - Styling : Tailwind CSS
  - Provider: Moralis
  - Library: ethers + web3uikit
  - Deploying Environment: Vercel + fleek
  - https://scb-10x-assignment-retake.vercel.app/

### Design Pattern
### How to run
# Demo

- Home page
<img width="1440" alt="Screen Shot 2565-06-09 at 16 18 49" src="https://user-images.githubusercontent.com/54467698/172828809-a3b7674a-c244-4c6b-81ae-3470c1053435.png">

- Lending
<img width="1440" alt="Screen Shot 2565-06-09 at 16 22 11" src="https://user-images.githubusercontent.com/54467698/172828875-f136dac2-f547-4fe8-8037-a1c34190138c.png">

- Lending transaction
<img width="1440" alt="Screen Shot 2565-06-09 at 16 22 11" src="https://user-images.githubusercontent.com/54467698/172828911-121c4528-324b-496a-bd3f-c9c00a8763aa.png">
<img width="414" alt="Screen Shot 2565-06-09 at 16 22 35" src="https://user-images.githubusercontent.com/54467698/172828931-93e98b24-8fe0-48ff-914d-dd8bc4fe84bb.png">

- Lending position
<img width="1440" alt="Screen Shot 2565-06-09 at 16 23 18" src="https://user-images.githubusercontent.com/54467698/172829037-030ea6ad-6e60-478e-8d6f-5df3f771e584.png">

- Dashboard
<img width="1440" alt="Screen Shot 2565-06-09 at 16 20 58" src="https://user-images.githubusercontent.com/54467698/172829111-0b00fdc2-5b77-4f7e-825f-2143ef3ffe9b.png">

- Position Detail
<img width="1440" alt="Screen Shot 2565-06-09 at 16 23 00" src="https://user-images.githubusercontent.com/54467698/172829210-cfa9a9ef-352a-4c08-829f-7b2e38852e45.png">

- Closing Position
<img width="1440" alt="Screen Shot 2565-06-09 at 16 27 05" src="https://user-images.githubusercontent.com/54467698/172829266-0c8c285a-89bf-4132-8c5d-080245812f1d.png">
<img width="1440" alt="Screen Shot 2565-06-09 at 16 27 55" src="https://user-images.githubusercontent.com/54467698/172829277-728a3460-a697-4841-8c6d-c7c7e563439b.png">
<img width="1440" alt="Screen Shot 2565-06-09 at 16 28 08" src="https://user-images.githubusercontent.com/54467698/172829292-f697f413-46f2-430c-b65b-82b60201fb72.png">

