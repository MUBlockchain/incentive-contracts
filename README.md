# MUBC INCENTIVE TOKEN
By: Miami University Blockchain Club

Incentive system for arbitrary academic club operations. Using bounties, tokens, and an item shop, we bootstrap an economy on which we can build on. 

ToDo:
 - Smart Contract Unit Testing
 - React Native App on iOS and Android
 - Web App integration with static mubc.io

## SMART CONTRACT SUITE

This repository was initialized by truffle, and has the correct configuration file to deploy to an MUBC-owned infura endpoint. You must add a '.env' file with the following variables to get functionality: { MNEMONIC= word1... word12, INFURA_RINKEBY=infura.io/...}. 

Deploy the program with 'truffle migrate'. Once migrations finish, grab the MUBCToken contract address and add it to the .env file as { RINKEBY_ADDRESS=0x49..a3}

The API includes all current testing. 

## API

Once the above has been completed, run 'node koaAPI.js'. This will run a script that will do 3 things:
 1. Checks to see if the example users are registered, and registers them if they are not
 2. Mints each account a random 0-9 new MUBC token
 3. Runs a Koa server on port 3000 where requests can be made (i.e. http://x.x.x.x:3000/api/balance?uniqueid=[Miami's Unique ID assigned to students here])