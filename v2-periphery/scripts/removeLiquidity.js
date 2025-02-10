const { ethers } = require("hardhat");
const hre = require("hardhat");

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

async function removeLiquidity() {
    console.log("\n\n🐷...执行移除流动性脚本⏰");
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

    //实例化token1和token2合约
    let token1 = await ethers.getContractAt(wethAbi, token1Address, signer);
    let token2 = await ethers.getContractAt(wethAbi, token2Address, signer);

    //检查用户在tokne1和token2上的余额
    const balanceOf1 = await token1.balanceOf(signer.address);
    const balanceOf2 = await token2.balanceOf(signer.address);
    console.log("token1 balanceOf1 ", balanceOf1);
    console.log("token2 balanceOf2 ", balanceOf2);

    //设置100s超时
    let deadline = Math.round(new Date().getTime() / 1000) + 100;

    // 找到pair合约(LP代币合约)
    // 通过工厂检查用户账户LP代币余额(liquidity)
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

    // LP代币余额
    const liquidity = await pair.balanceOf(signer.address);

    // 设置最小提取数量，有滑点限制时设置，这里不考虑滑点限制，设置为0
    const AMOUNT_MIN = 0;

    const amountAMin = AMOUNT_MIN;
    const amountBMin = AMOUNT_MIN;

    // 授权router划拨自己的LP代币
    await pair.approve(routerAddress, liquidity);

    //移除流动性
    await routerContract.removeLiquidity(
        token1Address,
        token2Address,
        liquidity,
        amountAMin,
        amountBMin,
        signer.address,
        deadline
    );

    //通过工厂检查pair合约余额
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
    // 检查移除流动性后用户在pair上的余额:LP代币余额
    console.log("pair balanceOf", await pair.balanceOf(signer.address));

    //检查移除流动性后用户在tokne1和token2上的余额
    console.log("token1 balanceOf1 after removed liquidity", await token1.balanceOf(signer.address));
    console.log("token2 balanceOf2 after removed liquidity", await token2.balanceOf(signer.address));
}

removeLiquidity();
