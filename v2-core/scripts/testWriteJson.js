const { write } = require("fs");
const hre = require("hardhat");
const { saveContractAddress } = require("../../configs/scripts/utils");

async function writeJson() {
  saveContractAddress(hre.network.name, "router", "222");
}

writeJson();
