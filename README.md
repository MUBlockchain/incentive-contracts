Note: build is included to allow a connection to the smart contract with little difficulty between different hosts running this client. This is not secure, but we can always roll back the chain!

You must have the INFURA slug ('infura.io/...') and the wallet MNEMONIC ('word0... word11') to run the api yourself.
Your wallet must be the mnemonic of the CRON/ deployer. This build is configured for Rinkeby, as stated above.

# Run
run 'npm run api' to begin the service. Wait until the console prints 'API Initialized' to make requests.
See https://docs.google.com/document/d/1z3q08ALWsdC4yl8huuMAbYBJhkxiRYW4L34EAPD08-k/edit?usp=sharing for poor but complete documentation of queries. 


## There is no user authentication, JWT is in our stack don't @ me