const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { assert, expect } = require("chai");

// unit testing is for testing with the local node

network.config.chainId == 31337
  ? describe("FundME", async () => {
      let fundMe, deployer, mockV3Aggregator;
      let sendValue = ethers.utils.parseEther("1"); // this is 1 ETH
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer; // this will look into the config file and find the named accounts and take the deployer
        await deployments.fixture("all"); // deploy the contracts in the deploy scripts with the tag "all"
        fundMe = await ethers.getContract("FundMe", deployer); // this is then the FundMe contract instance
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        ); // this is the MockV3Aggregator contract instance
      });

      describe("Constructor", () => {
        it("Should set the aggregator addresses correctly", async () => {
          const response = await fundMe.getPriceFeed(); // gives you an address (make reference to the ABI)
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async () => {
        it("Fails if You don't send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.reverted;
        });

        it("Updates the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });

          const response = await fundMe.getAddressToAmountFunded(deployer); //"deployer" already gives you the address of the deployer

          assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to the array of Funders", async () => {
          await fundMe.fund({ value: sendValue });

          const funder = await fundMe.getFunder(0);

          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue }); // fund the contract before carrying out any tests on the withdraw function
        });

        it("Withdraw ETH from a single founder", async () => {
          //Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // can also be ethers.provider.getBalance()

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Act

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait();

          const { gasUsed, effectiveGasPrice } = transactionReceipt; //pull out the gas used for this transaction

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //gasCost

          const gasCost = gasUsed.mul(effectiveGasPrice); // gasUsed * effectiveGasPrice for Big Numbers
          //Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            //check if the starting balance of the deployer + starting balance of the contract == amount withdrawn by deployer + gas fees required to make that withdrawal txn
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });

        it("allows us to withdraw with multiple funders", async () => {
          // Arrange
          const accounts = await ethers.getSigners(); // this gets a hold of all those test accounts in the local network
          // console.log(accounts);
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = fundMe.connect(accounts[i]); // this creates a new instance of the contract connected to each account
            await fundMeConnectedContract.fund({ value: sendValue }); // each account then sends 1 ETH to the contract
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // can also be ethers.provider.getBalance()

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait();

          const { gasUsed, effectiveGasPrice } = transactionReceipt; //pull out the gas used for this transaction
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            //check if the starting balance of the deployer + starting balance of the contract == amount withdrawn by deployer + gas fees required to make that withdrawal txn
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );

          //Make sure funders are reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted; //since the array becomes empty, calling the address at index 0 should be reverted
          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            ); // all amounts donated by these accounts should then return to zero
          }
        });

        it("Only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const notOwner = accounts[1];

          const notOwnerConnectedContract = await fundMe.connect(notOwner); // this person is then connected to the contract

          await expect(
            notOwnerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });

        it("Cheaper withdraw...", async () => {
          //Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          ); // can also be ethers.provider.getBalance()

          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //Act

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait();

          const { gasUsed, effectiveGasPrice } = transactionReceipt; //pull out the gas used for this transaction

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          //gasCost

          const gasCost = gasUsed.mul(effectiveGasPrice); // gasUsed * effectiveGasPrice for Big Numbers
          //Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            //check if the starting balance of the deployer + starting balance of the contract == amount withdrawn by deployer + gas fees required to make that withdrawal txn
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
      });
    })
  : describe.skip;
