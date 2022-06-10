pragma solidity 0.8.4;

import { Verifier } from "./MainVerifier.sol";
import "hardhat/console.sol";


contract Useless {

    uint256 public hash = uint256(7458154942849797190940752027358916042742345412716764758548659896754328773279);
    uint256 theState = 0;
    event Updated(address _you);

    Verifier private verifier;

    constructor() {
        verifier = new Verifier();
    }

    function setState(uint[8] memory proof, uint[1] memory input) public {
    
        uint[2] memory a = [proof[0], proof[1]];
        uint[2][2] memory b = [[proof[2], proof[3]], [proof[4], proof[5]]];
        uint[2] memory c = [proof[6], proof[7]];

        require(verifier.verifyProof(a, b, c, input), "invalid proof");

        theState ++;
        emit Updated(msg.sender);
    }

    function getState() public view returns(uint256) {
        return theState;
    }
}

