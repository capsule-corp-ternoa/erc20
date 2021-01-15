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
        let claim;

        let createClaim = async (destination, amount, forBlock, salt) => {
            let hash = await token.hashForClaim(owner.address, destination, amount, forBlock, salt);
            let signed = owner.signMessage(ethers.utils.arrayify(hash));

            return signed;
        }

        before(async () => {
            claim = await createClaim(user.address, targetAmount, ethers.provider.blockNumber, salt);
        })

        context("Valid", () => {
            it("Transfer the coins", async () => {
                await token
                    .connect(user)
                    .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt);

                const totalSupply = await token.totalSupply();
                expect(await token.balanceOf(owner.address)).to.equal(totalSupply - targetAmount);
                expect(await token.balanceOf(user.address)).to.equal(targetAmount);
            })

            it("Marks the salt as used", async () => {
                await token
                    .connect(user)
                    .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt);

                expect(await token.saltUsed(owner.address, salt)).to.equal(true);
            })
        })

        context("Invalid", () => {
            let expectError = async (promise, expectedError) => {
                try {
                    await promise;
                } catch (error) {
                    if (error.message.indexOf(expectedError) === -1) {
                        // When the exception was a revert, the resulting string will include only
                        // the revert reason, otherwise it will be the type of exception (e.g. 'invalid opcode')
                        const actualError = error.message.replace(
                            /Returned error: VM Exception while processing transaction: (revert )?/,
                            '',
                        );
                        expect(actualError).to.equal(expectedError, "Wrong kind of exception received");
                    }
                    return;
                }

                expect.fail("Expected an error that did not occur");
            }

            it("Fails if not enough coins in balance", async () => {
                const totalSupply = await token.totalSupply();
                await token.connect(owner).transfer(user.address, totalSupply); // Zero balance

                await expectError(
                    token
                        .connect(user)
                        .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt),
                    "ERC20: transfer amount exceeds balance"
                );
            })

            it("Refuse already used salt", async () => {
                await token
                    .connect(user)
                    .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt);

                await expectError(
                    token
                        .connect(user)
                        .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt),
                    "Ternoa: salt already used"
                );
            })

            it("Refuse if submitted too early", async () => {
                const earlyClaim = await createClaim(user.address, targetAmount, ethers.provider.blockNumber + 1000, salt);

                await expectError(
                    token
                        .connect(user)
                        .claimOffchainGrant(earlyClaim, owner.address, user.address, targetAmount, ethers.provider.blockNumber + 1000, salt),
                    "Ternoa: too early"
                );
            })

            it("Refuse corrupted proof or signature", async () => {
                // We sign something very differemt, signature verification should fail
                const corruptedSignature = await createClaim(user.address, 1, 1, salt);

                await expectError(
                    token
                        .connect(user)
                        .claimOffchainGrant(corruptedSignature, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt),
                    "Ternoa: bad proof"
                );
            })

            it("Refuse bad source", async () => {
                await expectError(
                    // We replaced owner.address with user.address
                    token
                        .connect(user)
                        .claimOffchainGrant(claim, user.address, user.address, targetAmount, ethers.provider.blockNumber, salt),
                    "Ternoa: bad proof"
                );
            })

            it("Refuse bad destination", async () => {
                await expectError(
                    // We replaced user.address with owner.address
                    token
                        .connect(user)
                        .claimOffchainGrant(claim, owner.address, owner.address, targetAmount, ethers.provider.blockNumber, salt),
                    "Ternoa: bad proof"
                );
            })

            it("Refuse bad amount", async () => {
                await expectError(
                    // Target Amount is incremented
                    token
                        .connect(user)
                        .claimOffchainGrant(claim, owner.address, user.address, targetAmount + 1, ethers.provider.blockNumber, salt),
                    "Ternoa: bad proof"
                );
            })

            it("Refuse bad block", async () => {
                await expectError(
                    // We are decremented the block to try to claim earlier
                    token
                        .connect(user)
                        .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber - 1, salt),
                    "Ternoa: bad proof"
                );
            })

            it("Refuse bad salt", async () => {
                await expectError(
                    // Salt is modified tp try to double claim
                    token
                        .connect(user)
                        .claimOffchainGrant(claim, owner.address, user.address, targetAmount, ethers.provider.blockNumber, salt + 1),
                    "Ternoa: bad proof"
                );
            })
        })
    })
});
