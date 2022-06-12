import Useless from "../artifacts/contracts/Useless.sol/Useless.json"
import { CONTRACT_ADDRESS } from "../utils/contract"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Head from "next/head"
import toast, { Toaster } from 'react-hot-toast';

import vkey from "../circuits/main.vkey.json"
import builder from "../circuitComponents/witnessCalculator"
import { groth16 } from "snarkjs"

export default function Home() {
    
  const [proof, setProof] = useState(null)
  const [secret, setSecret] = useState(null)
  const [account, setAccount] = useState("")
  const [verified, setVerified] = useState(false)
  const [prooving, setProoving] = useState(false)
  const [state, setState] = useState("connect wallet to see")
  const [knob, setKnob] = useState(false)

  const mintWithProof = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, Useless.abi, signer);

    const hash = BigInt("7458154942849797190940752027358916042742345412716764758548659896754328773279")
        
    const pi_a_1 = BigInt(proof.pi_a[0])
    const pi_a_2 = BigInt(proof.pi_a[1])

    const pi_b_1 = BigInt(proof.pi_b[0][1])
    const pi_b_2 = BigInt(proof.pi_b[0][0])
    const pi_b_3 = BigInt(proof.pi_b[1][1])
    const pi_b_4 = BigInt(proof.pi_b[1][0])

    const pi_c_1 = BigInt(proof.pi_c[0])
    const pi_c_2 = BigInt(proof.pi_c[1])

    const _proof = [pi_a_1, pi_a_2, pi_b_1, pi_b_2, pi_b_3, pi_b_4, pi_c_1, pi_c_2]
    
    await contract.setState(_proof, [hash])

    toast('Wait a minute for the call to process.', {
      icon: '⌛',
    }); 

    contract.on('Updated', (sender) => {
      setKnob(!knob)
      toast.success("Success!!")
    })
    return () => {
      contract.removeAllListeners();
    }
  }

  const generateAndVerifyProof = async () => {
    setProoving(true)
    
    const wasm = await fetch("main.wasm")
    const wasmBuffer = await wasm.arrayBuffer();
    const zkey = await fetch("main.zkey")
    const zkeyBuffer = await zkey.arrayBuffer();

    let circuitInputs; 
    try {
      circuitInputs = {
        x: BigInt(secret),
        hash: BigInt("7458154942849797190940752027358916042742345412716764758548659896754328773279")
      }
    } catch(e) {
      toast.error('Input must be integers...')
    }

    const witnessCalculator = await builder(wasmBuffer)
    let wtnsBuff;
    
    try {
      wtnsBuff = await witnessCalculator.calculateWTNSBin(circuitInputs, 0)
    } catch(e) {
      toast.error("Wrong secret!")
      setProoving(false)
      return
    }

    const { proof, publicSignals } = await groth16.prove(
      new Uint8Array(zkeyBuffer),
      wtnsBuff,
      null
    );

    setProof(proof)
    const res = await groth16.verify(vkey, publicSignals, proof);
    if (res) {
      setVerified(true)
    }

    setProoving(false)
    toast.success('Success!!')
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0])
        console.log('connected to:', accounts[0])

        const chain = ethereum.chainId
        if (chain !== "0x4") {
          toast('Looks like you are not on Rinkeby! Switch please.', {
            icon: '👀',
          });
          
        }
      }   

    } catch(e) {
      console.log(e)
      toast.error('No metamask found 🤷')
    }
  }

  const Text = () => {
    if (account) {
      return(
        <p className="font-bold"> 🟢 Connect wallet</p>
      ) 
    } else {
    return(
      <p className="font-bold"> 🔴 Connect wallet</p>
    )
    }
  }

  useEffect(() => {
    const checkConnection = async() => {
      try {
        const { ethereum } = window
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const addresses = await provider.listAccounts(); 
          if (addresses) {
          setAccount(addresses[0])

          const signer = provider.getSigner()
          const contract = new ethers.Contract(CONTRACT_ADDRESS, Useless.abi, signer);
          const state = await contract.getState()
          setState(state.toNumber())
          }
        }
      } catch(e) {
        console.log(e)
      }
    }
    checkConnection();
  },[account, knob])

  return (
    <>   
      <Head>
        <title>zk-snorlax</title>
        <link rel="shortcut icon" href="snorlax.png" />
      </Head>
      <Toaster />
      <div className="flex w-full h-screen justify-center items-center">
        <div className="flex flex-col justify-between items-center h-full w-5/6 md:w-1/2">
          
          <div className="flex self-end justify-start p-5">
            <button onClick={connectWallet} className="p-2 border border-black font-bold"><Text/></button>
          </div>
          
          <div className="flex flex-col space-y-10">

            <div className="flex flex-col items-center justify-center space-y-2">
              <h1 className="text-4xl font-bold text-center">WORLD&apos;S MOST USELESS ZK-SNARK</h1>
              <p className="text-center">
                Using the state-of-the-art technology & cryprography - if you have the secret -
                you are allowed to invoke a function which increments a counter. On-chain of course.
              </p>
            </div>

            <div className="flex flex-col justify-center items-center space-y-2">
              <p>the secret is:</p>
              <form>
                <input onChange={(e) => setSecret(e.target.value)} className="p-1 w-80 border border-black"></input>
              </form>
              <button disabled={prooving} onClick={generateAndVerifyProof} className="disabled:animate-spin p-2 border border-black font-bold">
                generate proof
              </button>
            </div>

            <div className="flex flex-col text-center justify-center items-center space-y-2">
              <p>
                you are only allowed to call this after you have created a valid proof. <br />
                Remember to switch to Rinkeby and get some fake eth to call this function.
              </p>
              <button onClick={mintWithProof} disabled={!verified} className="p-2 border disabled:opacity-50 border-black font-bold">call smart contract</button>
            </div>

          </div>
          
          <div className="flex flex-col justify-center items-center space-y-2 pb-20">
            <p className="text-center">current state of the counter: {state} <br /> <br />
            read more:  
              <a className="underline" href="https://twitter.com/ErikKaum/status/1535339668077780992?s=20&t=f_HArzANGV8fU_Zc908Jmw">    
                  https://twitter.com/ErikKaum/status/1535339668077780992?s=20&t=f_HArzANGV8fU_Zc908Jmw
              </a>            
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
