const { ethers } = require("hardhat");
const { getSavedContractAddresses } = require("../../configs/scripts/utils");
const {
  abi: abiRouter,
} = require("../artifacts/contracts/UniswapV2Router02.sol/UniswapV2Router02.json");
const {
  abi: abiErc20,
} = require("../artifacts/contracts/interfaces/IERC20.sol/IERC20.json");
async function swap() {
  console.log("\n\n🐴...执行swap脚本⏰");
  const routerAddress =
    getSavedContractAddresses()[hre.network.name]["UniswapV2Router"];
  const token1Address = getSavedContractAddresses()[hre.network.name]["Token1"];
  const token2Address = getSavedContractAddresses()[hre.network.name]["Token2"];
  const amountIn = ethers.parseUnits("5", 18);
  const [signer] = await ethers.getSigners();

  //授权swap划拨自己的token1
  let token1 = await ethers.getContractAt(abiErc20, token1Address, signer);
  let token2 = await ethers.getContractAt(abiErc20, token2Address, signer);

  await token1.approve(routerAddress, amountIn);
  const router = await ethers.getContractAt(abiRouter, routerAddress, signer);
  //100s超时
  let deadline = Math.round(new Date().getTime() / 1000) + 100;
  console.log(`Check Balance before swap token1 ${amountIn}`);
  console.log("balance of token1 ", await token1.balanceOf(signer.address));
  console.log("balance of token2 ", await token2.balanceOf(signer.address));
  //执行兑换
  await router.swapExactTokensForTokens(
    amountIn,
    0,
    [token1Address, token2Address],
    signer.address,
    deadline
  );
  console.log(`Check Balance after swap token1 ${amountIn}`);
  console.log("balance of token1 ", await token1.balanceOf(signer.address));
  console.log("balance of token2 ", await token2.balanceOf(signer.address));
}

swap();
