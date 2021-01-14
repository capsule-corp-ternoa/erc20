const { expect } = require("chai");

describe("Capsule Coin contract", () => {
    let owner;
    let user;
    let token;

    beforeEach(async () => {
        const CapsuleCoin = await ethers.getContractFactory("CapsuleCoin");
        [owner, user] = await ethers.getSigners();

        token = await CapsuleCoin.deploy(owner.address);
    })

    context("Deployment", () => {
        it("Deployment should assign the total supply of tokens to the specified address", async () => {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        });

        it("Has a total supply of 25B tokens", async () => {
            const oneBillion = 1000000000;
            const decimals = await token.decimals();
            expect(await token.totalSupply()).to.equal(2.5 * oneBillion * (10 ^ decimals));
        })
    })

    context("Offchain Claim", () => {
        const targetAmount = 10000;
        const salt = 1;

        let createClaim = async (destination, amount, forBlock, salt) => {
            let hash = await token.hashForClaim(owner.address, destination, amount, forBlock, salt);
            let signed = owner.signMessage(hash);

            return signed;
        }

        context("Valid", () => {
            it("Transfer the coins", async () => {
                const claim = await createClaim(user.address, targetAmount, ethers.provider.blockNumber, salt);

                await token
                    .connect(user)
                    .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt);

                const totalSupply = await token.totalSupply();
                expect(await token.balanceOf(owner.address)).to.equal(totalSupply - targetAmount);
                expect(await token.balanceOf(user.address)).to.equal(targetAmount);
            })

            it("Marks the salt as used", async () => {
                const salt = 1;
                const claim = await createClaim(user.address, targetAmount, ethers.provider.blockNumber, salt);

                await token
                    .connect(user)
                    .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt);

                expect(await token.saltUsed(owner.address, salt)).to.equal(true);
            })
        })

        context("Invalid", () => {
            it("Refuse already used salt")

            it("Refuse if submitted too early")
            it("Refuse bad signature")
        })
    })
});
