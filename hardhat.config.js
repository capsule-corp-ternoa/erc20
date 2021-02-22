// View https://hardhat.org/config/ for help adding more options.

const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

task("deploy", "Deploy the token to the specified network")
  .addParam("vault", "account that will be allocated the total token supply")
  .setAction(async taskArgs => {
    const CapsuleCoin = await ethers.getContractFactory("CapsuleCoin");

    console.log(`🚀 Deploying token with vault ${taskArgs.vault}`);
    const deployed = await CapsuleCoin.deploy(taskArgs.vault);
    console.log(`🎁 Token deployed to ${deployed.address}`);
  });

task("accounts", "Prints the list of connected accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("claims", "Create offchain claims for some tokens as defined in a JSON file")
  .addParam("addr", "addr of the account creating the claims")
  .addParam("token", "address of the deployed contract")
  .addParam("json", "json file of the claims to generate")
  .addParam("nonce", "nonce value that will be incremented for every new claim")
  .setAction(async taskArgs => {
    let signer = undefined;
    const accounts = await ethers.getSigners();
    for (const account of accounts) {
      if (account.address == taskArgs.addr) {
        signer = account;
      }
    }

    if (signer == undefined) {
      throw new Error("account to create claims not found");
    }

    const CapsuleCoin = await ethers.getContractAt("CapsuleCoin", taskArgs.token);
    const decimals = await CapsuleCoin.decimals();

    let createClaim = async (destination, amount, forBlock, nonce) => {
      let hash = await CapsuleCoin.hashForClaim(signer.address, destination, amount, forBlock, nonce);
      let signed = signer.signMessage(ethers.utils.arrayify(hash));

      return signed;
    }

    const currentBlock = await ethers.provider.getBlock();

    const claims = require(taskArgs.json);
    let generatedClaims = {};
    let nonce = parseInt(taskArgs.nonce, 10);

    for (const addr in claims) {
      const entry = claims[addr];
      generatedClaims[addr] = [];

      const vestings = [
        {
          epoch: entry.vesting1Epoch,
          tokens: entry.vesting1price,
        },
        {
          epoch: entry.vesting2Epoch,
          tokens: entry.vesting2price,
        },
        {
          epoch: entry.vesting3Epoch,
          tokens: entry.vesting3price,
        }
      ];

      for (const id in vestings) {
        const vesting = vestings[id];

        const blockTimeInSeconds = 30; // on average...
        const at = parseInt(vesting.epoch, 10);
        const inHowManySeconds = at - currentBlock.timestamp;
        const inHowManyBlocks = Math.floor(inHowManySeconds / blockTimeInSeconds);
        const atBlock = inHowManyBlocks + currentBlock.number;

        const amount = ethers.BigNumber.from(vesting.tokens);
        const ten = ethers.BigNumber.from("10");
        const convertedAmount = amount.mul(ten.pow(decimals));

        const proof = await createClaim(addr, amount, atBlock, convertedAmount);
        generatedClaims[addr].push({
          proof: proof,
          from: signer.address,
          to: addr,
          amount: convertedAmount.toString(),
          validity: atBlock,
          nonce: nonce
        });

        nonce += 1;
      }
    }

    console.log(JSON.stringify(generatedClaims, null, 4));
  })

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.6",
  networks: {
    custom: {
      url: process.env.NETWORK_URL || "http://localhost:8545",
      accounts: {
        mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
      }
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "YOUR_ETHERSCAN_API_KEY"
  }
};