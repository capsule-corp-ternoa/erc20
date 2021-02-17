// View https://hardhat.org/config/ for help adding more options.

require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");

task("deploy", "Deploy the token to a specified network")
  .addParam("vault", "account that will be allocated the total token supply")
  .setAction(async taskArgs => {
    const CapsuleCoin = await ethers.getContractFactory("CapsuleCoin");

    console.log(`🚀 Deploying token with vault ${taskArgs.vault}`);
    const deployed = await CapsuleCoin.deploy(taskArgs.vault);
    console.log(`🎁 Token deployed to ${deployed.address}`);
  });

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