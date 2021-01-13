const { expect } = require("chai");

describe("Capsule Coin contract", () => {
    let owner;
    let token;

    beforeEach(async () => {
        const CapsuleCoin = await ethers.getContractFactory("CapsuleCoin");
        const [deployer] = await ethers.getSigners();

        token = await CapsuleCoin.deploy(deployer.address);
        owner = deployer;
    })

    it("Deployment should assign the total supply of tokens to the specified address", async () => {
        const ownerBalance = await token.balanceOf(owner.address);
        expect(await token.totalSupply()).to.equal(ownerBalance);
    });

    it("Has a total supply of 25B tokens", async () => {
        const oneBillion = 1000000000;
        const decimals = await token.decimals();
        expect(await token.totalSupply()).to.equal(2.5 * oneBillion * (10 ^ decimals));
    })
});
