const { ethers } = require("hardhat");
const { getSavedContractAddresses } = require("../../configs/scripts/utils");
const {
  abi,
} = require("../artifacts/contracts/UniswapV2Router02.sol/UniswapV2Router02.json");
async function quote() {
  const quoteAmount0 = "5";
  //获取router协议
  const routerAddress =
    getSavedContractAddresses()[hre.network.name]["UniswapV2Router"];
  //获取token1 token2协议
  const token1Address = getSavedContractAddresses()[hre.network.name]["Token1"];
  const token2Address = getSavedContractAddresses()[hre.network.name]["Token2"];
  const [signer] = await ethers.getSigners();
  const router = await ethers.getContractAt(abi, routerAddress, signer);
  //调用amountOut询价
  const quoteResult = await router.getAmountsOut(
    ethers.parseUnits(quoteAmount0, 18),
    [token1Address, token2Address]
  );
  console.log(
    "Quote executed successfully, tokenInAmount=%s,tokenOutAmount=%s",
    quoteResult[0],
    quoteResult[1]
  );
}

quote();
