module.exports = async ({
  deployments,
  getNamedAccounts,
  ethers: { provider, utils, BigNumber },
}) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  log(`Chain ID: ${chainId}`);
  log("Deploying fun storage contract ....");
  const funWithStorage = await deploy("FunWithStorage", {
    from: deployer,
    args: [],
    log: true,
  }); // this actually returns the receipt of the contract deployment

  // log(funWithStorage);
  // const fun = await ethers.getContract("FunWithStorage");
  // log(fun);

  const slotTwo = await provider.getStorageAt(
    funWithStorage.address,
    utils.keccak256(utils.toUtf8Bytes("0x0000000000000000000000000000000000000000000000000000000000000001"))
    // utils.keccak256(
    //   "0x0000000000000000000000000000000000000000000000000000000000000001"
    // )
  );

  log(parseInt(slotTwo));
  // log((await fun.myArray(1)).toString());
  //   log("Logging storage...");
  //   for (let i = 0; i < 10; i++) {
  //     log(
  //       `Location ${i}: ${await ethers.provider.getStorageAt(
  //         funWithStorage.address,
  //         i
  //       )}`
  //     );
  //   }
};

module.exports.tags = ["storage"];
