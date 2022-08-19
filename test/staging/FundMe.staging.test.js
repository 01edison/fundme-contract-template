const {
  getNamedAccounts,
  deployments,
  ethers: { utils, getContract },
  network,
} = require("hardhat");

const { assert, expect } = require("chai");
network.config.chainId == 31337
  ? describe.skip
  : describe("Fund Me", async () => {
      let fundMe, deployer;
      const sendValue = utils.parseEther("0.2");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        console.log(deployer);
        fundMe = await getContract("FundMe", deployer);
      });

      it("Allows owner to fund and withdraw from the contract", async () => {
        // expect(await fundMe.fund({ value: sendValue })).to.not.be.reverted;
        await fundMe.withdraw();

        // const endingBalance = await fundMe.provider.getBalance(fundMe.address);

        // assert.equal(endingBalance.toString(), "0");
      });
    });
