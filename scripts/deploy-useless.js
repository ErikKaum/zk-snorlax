const hre = require("hardhat");
const fs = require('fs');

async function main() {

  const Contract = await hre.ethers.getContractFactory("Useless");
  const contract = await Contract.deploy();

  await contract.deployed();

  console.log("deployed to:", contract.address);

  function editFile() {
    const data = fs.readFileSync('./utils/contract.js', 'utf-8');

    const remove_after= data.indexOf('"');
    const pre =  data.substring(0, remove_after);
    const result = pre + '"' + contract.address + '"'

    fs.writeFileSync('./utils/contract.js', result, 'utf-8');
  }
  editFile();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
