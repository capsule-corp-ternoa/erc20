# Ternoa ERC20 Token
Welcome to the repo for the Ternoa ERC20 token. This token is designed to be deployed on an EVM compatible chain and supports the following features:
1. Full `ERC20` compliance thanks to the OpenZeppelin reference.
2. Secure way to sign "offchain claims" that other accounst can use to get some tokens out of another one. Think of it as an offchain `approve` + `transferFrom`. This could be used for issuing the coins of presale contributors for example :smile:.

## Development
We use `hardhat` to manage and test the token along with `ethers.js`.

### Dependencies
Just make sure you have a working Node JS development environment and run `npm install` once.

### Compiling the contracts
Use `npx hardhat compile`, it will generate fill the `artificates` directory for you.

### Unit tests
Use `npx hardhat test` to run our unit testing suite.