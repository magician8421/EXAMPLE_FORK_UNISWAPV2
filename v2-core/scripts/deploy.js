const hre = require("hardhat");
const { saveContractAddress } = require("../../configs/scripts/utils");
const {
  abi,
} = require("../artifacts/contracts/UniswapV2Pair.sol/UniswapV2Pair.json");

async function deployUniswap() {
  //token1初始化的数量
  const tokenOneAmount = "1000";
  //token2初始化数量
  const tokenTwoAmount = "2000";

  const [signer1] = await hre.ethers.getSigners();
  //uniswapv2工厂合约
  const factoryContract = await hre.ethers.getContractFactory(
    "UniswapV2Factory"
  );
  //构造uniswapv2工厂合约 使用signer1作为服务费接收者
  const factory = await factoryContract.deploy(signer1.address);
  await factory.waitForDeployment();

  //打印下init合约用于检查create2前后是否一致
  console.log("pair init code", await factory.INIT_CODE_PAIR_HASH());

  //部署token1并提前mint
  const token1Contract = await hre.ethers.getContractFactory("Token1");
  const token1 = await token1Contract.deploy(
    hre.ethers.parseUnits(tokenOneAmount, 18)
  );
  await token1.waitForDeployment();

  //部署token2并提前mint
  const token2Contract = await hre.ethers.getContractFactory("Token2");
  const token2 = await token2Contract.deploy(
    hre.ethers.parseUnits(tokenTwoAmount, 18)
  );
  await token2.waitForDeployment();

  const token1Address = await token1.getAddress();
  const token2Address = await token2.getAddress();
  //token1和token2 在uniswap2 中创建pair
  await factory.createPair(token1Address, token2Address);

  console.log("factory contract address is %s", await factory.getAddress());
  console.log("token1 contract address is %s", token1Address);
  console.log("token2 contract address is %s", token2Address);

  //查看pair对创建结果
  console.log("pair length", await factory.allPairsLength());
  console.log(
    "pair address",
    await factory.getPair(await token1.getAddress(), await token2.getAddress())
  );

  const pair = await hre.ethers.getContractAt(
    abi,
    await factory.getPair(token1Address, token2Address, signer1)
  );
  //检查pair对余额
  //在uniswapv2中 pair会进行排序
  const reservers = await pair.getReserves();
  if (token1Address < token2Address) {
    console.log(
      "checking pair reverse token1=%s,token2=%s",
      reservers[0],
      reservers[1]
    );
  } else {
    console.log(
      "checking pair reverse token1=%s,token2=%s",
      reservers[1],
      reservers[0]
    );
  }

  //开始写入合约配置
  //写入工厂合约地址
  saveContractAddress(
    hre.network.name,
    "UniswapV2Factory",
    await factory.getAddress()
  );
  //写入token1合约地址
  saveContractAddress(hre.network.name, "Token1", await token1.getAddress());
  //写入token2合约地址
  saveContractAddress(hre.network.name, "Token2", await token2.getAddress());

  console.log(
    "UniswapV2Factory,Token1,Token2  have been persisted in config/contract-addresses.json!"
  );
}

deployUniswap();
