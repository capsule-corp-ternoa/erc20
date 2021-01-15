# Ternoa ERC20 Token
Welcome to the repo for the Ternoa ERC20 token. This token is designed to be deployed on an EVM compatible chain and supports the following features:
1. Full `ERC20` compliance thanks to the OpenZeppelin reference.
2. Secure way to sign "offchain claims" that other accounst can use to get some tokens out of another one. Think of it as an offchain `approve` + `transferFrom`. This could be used for issuing the coins of presale contributors for example :smile:.

> An account will need to have enough coins for its offchain approval to work. Meaning that it is recommended to create a specific "presale" account with exactly the right number of coins to be claimed in order to keep things clean and transparent.

## Development
We use `hardhat` to manage and test the token along with `ethers.js`.

### Dependencies
Just make sure you have a working Node JS development environment and run `npm install` once.

### Compiling the contracts
Use `npx hardhat compile`, it will generate fill the `artificates` directory for you.

### Unit tests
Use `npx hardhat test` to run our unit testing suite.

### Deploying to a local network
Open a terminal and run `npx hardhat node` there, keep it running.

You can now deploy the token by using a command of the type `npx hardhat deploy --vault 0x2546bcd3c84621e976d8185a91a922ae77ecec30`. You can change the `--vault` argument to whatever address you'd like to receive the total supply of coins.

> Because we use the deployment task with a local hardhat network it already knows which private keys to use to sign the transactions. However, when deploying on a production network you may have to fine tune the configuration.