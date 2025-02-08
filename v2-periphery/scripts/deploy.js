const hre = require("hardhat");
const {
  saveContractAddress,
  getSavedContractAddresses,
} = require("../../configs/scripts/utils");

async function deployPeriphery() {
  //因为UniswapV2使用weth来代替eth 所以需要部署一次weth
  const wethContract = await hre.ethers.getContractFactory("WETH9");
  const weth = await wethContract.deploy();
  await weth.waitForDeployment();

  //获取UniswapV2工厂合约地址
  const factoryAddress =
    getSavedContractAddresses()[hre.network.name]["UniswapV2Factory"];

  //部署UniswapV2Router协议
  const routerContract = await hre.ethers.getContractFactory(
    "UniswapV2Router02"
  );
  const router = await routerContract.deploy(
    factoryAddress,
    await weth.getAddress()
  );
  await router.waitForDeployment();

  console.log("WETH contract address is %s", await weth.getAddress());
  console.log(
    "UniswapV2Router contract address is %s",
    await router.getAddress()
  );

  //写入weth合约地址
  saveContractAddress(hre.network.name, "WETH", await weth.getAddress());
  //写入UniswapV2Router合约地址
  saveContractAddress(
    hre.network.name,
    "UniswapV2Router",
    await router.getAddress()
  );

  console.log(
    "WETH,UniswapV2Router have been persisted in config/contract-addresses.json!"
  );
}

deployPeriphery();
