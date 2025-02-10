const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");
const { getSavedContractAddresses } = require("../../configs/scripts/utils");
const {
  abi: wethAbi,
} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");
const {
  abi: pairAbi,
} = require("../../v2-core/artifacts/contracts/UniswapV2Pair.sol/UniswapV2Pair.json");
const {
  abi: factoryAbi,
} = require("../../v2-core/artifacts/contracts/UniswapV2Factory.sol/UniswapV2Factory.json");

async function addLiquidity() {
  console.log("\n\n🐷...执行添加流动性脚本⏰");
  const routerAddress =
    getSavedContractAddresses()[hre.network.name]["UniswapV2Router"];
  const token1Address = getSavedContractAddresses()[hre.network.name]["Token1"];
  const token2Address = getSavedContractAddresses()[hre.network.name]["Token2"];
  const [signer] = await ethers.getSigners();
  //获取uniswapV2Router合约
  const routerContract = await ethers.getContractAt(
    "UniswapV2Router02",
    routerAddress,
    signer
  );
  //添加流动性的金额
  let tokenOneAmount = ethers.parseUnits("100", 18);
  let tokenTwoAmount = ethers.parseUnits("200", 18);

  //授权swap划拨自己的token1和token2
  let token1 = await ethers.getContractAt(wethAbi, token1Address, signer);
  let token2 = await ethers.getContractAt(wethAbi, token2Address, signer);
  await token1.approve(routerAddress, tokenOneAmount);
  await token2.approve(routerAddress, tokenTwoAmount);
  //检查swaprouter是否具备足够多的allowance
  const allowance1 = await token1.allowance(signer.address, routerAddress);
  const allowance2 = await token2.allowance(signer.address, routerAddress);
  console.log("token1 allowance ", allowance1);
  console.log("token2 allowance ", allowance2);

  //检查用户在tokne1和token2上的余额
  const balanceOf1 = await token1.balanceOf(signer.address);
  const balanceOf2 = await token2.balanceOf(signer.address);
  console.log("token1 balanceOf1 ", balanceOf1);
  console.log("token2 balanceOf2 ", balanceOf2);

  //设置100s超时
  let deadline = Math.round(new Date().getTime() / 1000) + 100;

  //添加流动性
  await routerContract.addLiquidity(
    token1Address,
    token2Address,
    tokenOneAmount,
    tokenTwoAmount,
    tokenOneAmount,
    tokenTwoAmount,
    signer.address,
    deadline
  );

  //通过工厂检查pair合约余额
  const factoryAddress =
    getSavedContractAddresses()[hre.network.name]["UniswapV2Factory"];
  const factory = await hre.ethers.getContractAt(
    factoryAbi,
    factoryAddress,
    signer
  );
  const pair = await hre.ethers.getContractAt(
    pairAbi,
    await factory.getPair(
      await token1.getAddress(),
      await token2.getAddress(),
      signer
    )
  );

  const reservers = await pair.getReserves();

  //在uniswapv2中 pair会进行排序
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
}

addLiquidity();
