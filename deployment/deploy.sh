#!/bin/bash
# 执行前需启动hardhat本地节点(npx hardhat node)
# 切换至 ../v2-core 目录并执行 deploy 脚本
cd ../v2-core && npx hardhat run scripts/deploy.js --network localhost

# 切换至 ../v2-periphery 目录并执行 deploy 脚本
cd ../v2-periphery && npx hardhat run scripts/deploy.js --network localhost

# 执行 addLiquidity 脚本(测试添加流动性)
npx hardhat run scripts/addLiquidity.js --network localhost

# 执行 quote 脚本（测试报价）
npx hardhat run scripts/quote.js --network localhost

# 执行 swap 脚本（测试交换）
npx hardhat run scripts/swap.js --network localhost