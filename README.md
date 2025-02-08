# UniswapV2 本地部署介绍

## 使用命令行部署

1. 前往 v2-core 执行 npm install 安装依赖
2. 前往 v2-periphery 执行 npm install 安装依赖
3. 启动 npx hardhat node ， v2-core 和 v2-periphery 都提供了 hardhat 环境，任意启动一个即可
4. 使用 npx hardhat run v2-core/scripts/deploy.js --network localhost 部署 UniswapV2Core
5. 使用 npx hardhat run v2-periphery/scripts/deploy.js --network localhost 部署 UniswapV2Periphery

## 使用 bash 脚本部署

1. 前往 v2-core 执行 npm install 安装依赖
2. 前往 v2-periphery 执行 npm install 安装依赖
3. 启动 npx hardhat node ， v2-core 和 v2-periphery 都提供了 hardhat 环境，任意启动一个即可
4. 前往 deployment 目录，执行 sh deploy.sh
