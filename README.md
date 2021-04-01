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

#### Bonus: example of claiming flow
1. In a dedicated terminal start a local node via `npx hardhat node`
2. Open a new terminal to run the other commands
3. Run `npx hardhat accounts` take two addresses from there to be your vault and grantee. In our case we did as follow
   ```sh
   export VAULT=0x70997970c51812dc3a010c7d01b50e0d17dc79c8
   export GRANTEE=0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc
   ```
4. Deploy the token via `npx hardhat --network custom deploy --vault $VAULT`, and note its address, we did:
   ```sh
   export TOKEN=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```
5. Create an offchain claim for the grantee from the vault, note its "proof" output, via this command `npx hardhat --network custom create-claim --addr $VAULT --dest $GRANTEE --token $TOKEN --nonce 100 --block 1 --amount 10`
6. Save the offchain proof somewhere, we did:
   ```sh
   export PROOF=0xed3229c291f4f827705480cf298141914b9ba93940a47d79e0ff4659bd28253202310ff9bea0e3a4e07c9d794fefccfd31409abee3ee88ad9d97fc32a3133e8f1c
   ```
7. You can now claim the funds! Just use `npx hardhat --network custom use-claim --proof $PROOF --from $VAULT --to $GRANTEE --amount 10 --block 1 --token $TOKEN --nonce 100`
8. You can also check the balance of the grantee to confirm it got the tokens:
   ```sh
   npx hardhat --network custom balance --addr $GRANTEE --token $TOKEN
   0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc has a balance of 10
   ```

> For convience purposes we map any amount you give to the scripts to their actual, decimal less, extended variant in Ethereum / Solidity slang. If you give the scripts a decimal number it will produce an error.