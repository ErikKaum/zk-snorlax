# Word's most useless zk-Snark, a.k.a zk-Snorlax

This is a hello world application into the world of zk-Snarks. It's very simple.
If you know the preimage to a hash, a.k.a the secret, you are allowed to increment
the counter in a smart contract. The magic is that you don't have to reveal this secret
to anyone. With zk-Snark technology, you can proove that you know the preimage without
leaking any information about it. And all the calculation happens in the browser!

## Structure

Under circuits you will find all nessecary components for building the zk-Snark. I'm using
circom and circom-hardhat as tools to make this happen. Under contracts you'll find the two
smart contracts which are deployed to the Rinkeby test network using scripts/deploy-useles.js. MainVerifier.sol is the contract that takes a snark proof as input and validates that proof => returns a boolean. The Useless contract imports this functionality and requires that the boolean returns true before proceeding.

Rest of the directories are basic nextJS related things. The .wasm and .zkey are copied to the
public dir and fetched. There might be a smarter way to do this.

#### Happy Hacking!
