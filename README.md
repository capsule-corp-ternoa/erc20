# Ternoa ERC20 Token
Welcome to the repo for the Ternoa ERC20 token. This token is designed to be deployed on an EVM compatible chain and supports the following features:
1. Full `ERC20` compliance thanks to the OpenZeppelin reference.
2. Secure way to sign "offchain claims" that other accounst can use to get some tokens out of another one. Think of it as an offchain `approve` + `transferFrom`. This could be used for issuing the coins of presale contributors for example :wink:.

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

### Deploying to a live network
Please define two environment variables as follows:
- `NETWORK_URL` should be the url of the node to use to connect to the live network
- `MNEMONIC` should contains the mnemonic words of the account to use for deployment, make sure it has enough funds

You can then run:
```
npx hardhat --network custom deploy --vault <address that should receive the initial coins>
```

#### Verifying on Etherscan
We also have a plugin in place for etherscan verification, to do so you need to (assuming you kept the environment variables defined):
1. Edit `./hardhat.config.js` and replace `YOUR_ETHERSCAN_API_KEY` with an Etherscan API key (you should be able to generate one on [their website](https://etherscan.io))
2. Simply run `npx hardhat verify --network custom DEPLOYED_CONTRACT_ADDRESS "ADDRESS FOR --vault WHEN DEPLOYING"`

#### Bonus: generating claims locally
Assuming that the environment variables are still deployed:
1. Use `npx hardhat accounts` to list the account available, copy paste one of the addresses you want to use to generate claims (it also needs to have the coins in balance)
2. Wire now or later the correct amount of tokens to the address you selected
3. Generate the claims via `npx hardhat --network custom claims --token DEPLOYED_CONTRACT_ADDR --nonce 0 --json PATH_TO_JSON_CLAIM_FILE --addr ADDR_ISSUING_GRANTS`

We assume that the file at `PATH_TO_JSON_CLAIM_FILE` is formatted as follows:
```json
{
    "addr 1": {
        "vesting1price": 50000,
        "vesting1Epoch": 1639958400,
        "vesting2price": 37500,
        "vesting2Epoch": 1655683200,
        "vesting3price": 37500,
        "vesting3Epoch": 1671494400
    }
}
```

This shall output in the console (you can pipe it to a file) a JSON file with the generated claims.