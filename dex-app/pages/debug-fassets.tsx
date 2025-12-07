import Head from "next/head";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAddress } from "@thirdweb-dev/react";
import Navbar from "@/components/Navbar";
import { FASSET_ADDRESS } from "@/const/details";

const ERC20_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", "type": "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", "type": "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", "type": "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", "type": "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

const POOL_ABI = [
  {
    inputs: [],
    name: "fETH",
    outputs: [{ internalType: "address", name: "", "type": "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "WFLR",
    outputs: [{ internalType: "address", name: "", "type": "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserveFETH",
    outputs: [{ internalType: "uint256", name: "", "type": "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "reserveWFLR",
    outputs: [{ internalType: "uint256", name: "", "type": "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

export default function DebugFAssetsPage() {
  const address = useAddress();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum && address) {
        try {
          const browserProvider = new ethers.providers.Web3Provider((window as any).ethereum);
          setProvider(browserProvider);
        } catch (err) {
          console.error("Failed to init provider:", err);
        }
      }
    };

    initProvider();
  }, [address]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const clearLogs = () => setLogs([]);

  const runDiagnostics = async () => {
    clearLogs();
    addLog("🔍 Starting fAssets Diagnostics...\n");

    if (!provider || !address) {
      addLog("❌ Provider or address not available");
      return;
    }

    try {
      // Get pool contract
      addLog("1️⃣ Loading fAsset Pool Contract...");
      const pool = new ethers.Contract(FASSET_ADDRESS, POOL_ABI, provider);
      addLog(`✓ Pool address: ${FASSET_ADDRESS}`);

      // Get token addresses
      addLog("\n2️⃣ Fetching Token Addresses...");
      const fethAddr = await pool.fETH();
      const wflrAddr = await pool.WFLR();
      addLog(`✓ fETH address: ${fethAddr}`);
      addLog(`✓ WFLR address: ${wflrAddr}`);

      if (fethAddr.toLowerCase() === wflrAddr.toLowerCase()) {
        addLog("\n⚠️  WARNING: fETH and WFLR are the same address!");
        addLog("This indicates the pool contract may not be properly initialized.");
        addLog("The pool needs separate fETH and WFLR token contracts.\n");
        
        addLog("📋 SOLUTION:");
        addLog("1. The fAsset pool contract needs to be redeployed");
        addLog("2. It should be initialized with separate fETH and WFLR addresses");
        addLog("3. OR use a different pool address that has correct token setup\n");
        
        return;
      }

      // Get token info
      addLog("\n3️⃣ Loading Token Information...");
      const feth = new ethers.Contract(fethAddr, ERC20_ABI, provider);
      const wflr = new ethers.Contract(wflrAddr, ERC20_ABI, provider);

      const fethName = await feth.name();
      const fethSymbol = await feth.symbol();
      const fethDecimals = await feth.decimals();
      const wflrName = await wflr.name();
      const wflrSymbol = await wflr.symbol();
      const wflrDecimals = await wflr.decimals();

      addLog(`✓ fETH: ${fethName} (${fethSymbol}) - ${fethDecimals} decimals`);
      addLog(`✓ WFLR: ${wflrName} (${wflrSymbol}) - ${wflrDecimals} decimals`);

      // Get user balances
      addLog("\n4️⃣ Checking Your Token Balances...");
      const fethBalance = await feth.balanceOf(address);
      const wflrBalance = await wflr.balanceOf(address);

      const fethFormatted = ethers.utils.formatEther(fethBalance);
      const wflrFormatted = ethers.utils.formatEther(wflrBalance);

      addLog(`✓ Your fETH: ${fethFormatted}`);
      addLog(`✓ Your WFLR: ${wflrFormatted}`);

      if (fethBalance.isZero()) {
        addLog("⚠️  WARNING: You have 0 fETH - cannot swap or add liquidity!");
      }
      if (wflrBalance.isZero()) {
        addLog("⚠️  WARNING: You have 0 WFLR - cannot swap or add liquidity!");
      }

      // Get pool reserves
      addLog("\n5️⃣ Checking Pool Reserves...");
      const reserveFETH = await pool.reserveFETH();
      const reserveWFLR = await pool.reserveWFLR();

      const reserveFETHFormatted = ethers.utils.formatEther(reserveFETH);
      const reserveWFLRFormatted = ethers.utils.formatEther(reserveWFLR);

      addLog(`✓ Pool fETH Reserve: ${reserveFETHFormatted}`);
      addLog(`✓ Pool WFLR Reserve: ${reserveWFLRFormatted}`);

      addLog("\n✅ DIAGNOSTICS COMPLETE");
      addLog("\n📋 NEXT STEPS:");
      if (fethBalance.isZero() || wflrBalance.isZero()) {
        addLog("1. You need tokens to test fAssets");
        addLog("2. Contact testnet faucet or transfer from another account");
        addLog("3. Return here to verify balances");
      } else {
        addLog("1. Your balances look good!");
        addLog("2. Go to fAssets page and try swapping");
      }
    } catch (err) {
      addLog(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <Head>
        <title>Debug fAssets - DOMEX</title>
        <meta name="description" content="fAssets Debug Tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: "100vh",
          backgroundColor: "#f7fafc",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            width: "100%",
            padding: "24px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            🔍 fAssets Diagnostics
          </h2>

          <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
            This tool helps identify issues with the fAssets pool and your token balances.
          </p>

          <button
            onClick={runDiagnostics}
            style={{
              padding: "12px 24px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
              marginBottom: "20px",
            }}
          >
            Run Diagnostics
          </button>

          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            style={{
              padding: "12px 24px",
              backgroundColor: "#757575",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: logs.length === 0 ? "not-allowed" : "pointer",
              fontWeight: "500",
              marginLeft: "10px",
              opacity: logs.length === 0 ? 0.5 : 1,
            }}
          >
            Clear Logs
          </button>

          <div
            style={{
              backgroundColor: "#263238",
              color: "#4db8ff",
              padding: "16px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "13px",
              lineHeight: "1.6",
              maxHeight: "500px",
              overflowY: "auto",
              marginTop: "20px",
              border: "1px solid #455a64",
            }}
          >
            {logs.length === 0 ? (
              <p style={{ color: "#888" }}>Logs will appear here...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: "4px" }}>
                  {log}
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#fff3cd", borderRadius: "6px", border: "1px solid #ffc107" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold" }}>💡 What This Shows:</h3>
            <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "13px" }}>
              <li>Token addresses and their details</li>
              <li>Your current fETH and WFLR balances</li>
              <li>Pool reserve information</li>
              <li>Whether you have tokens to perform swaps</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
