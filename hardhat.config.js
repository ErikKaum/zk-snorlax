require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-circom');
require('dotenv').config()


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  
  circom: {
    inputBasePath: "./circuits",
    ptau: "powersOfTau28_hez_final_15.ptau",
    circuits: [
      {
        name: "main"
        // No protocol, so it defaults to groth16
      },
    ],
  },

  networks: {
    hardhat: {
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.RINKEBY_ACCOUNT]
    }
  },

  etherscan: {
      apiKey: process.env.ETHER_SCAN_KEY
  }
  
};
