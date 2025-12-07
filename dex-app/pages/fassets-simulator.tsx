import Head from "next/head";
import { useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";

interface SwapResult {
  amountIn: string;
  amountOut: string;
  priceImpact: string;
  slippage: string;
  gasUsed: string;
  gasPrice: string;
  totalFee: string;
  txHash: string;
}

export default function FAssetsSimulatorPage() {
  const toast = useToast();

  // Mock pool state
  const [poolState, setPoolState] = useState({
    fethReserve: ethers.utils.parseEther("100"),
    wflrReserve: ethers.utils.parseEther("1000"),
  });

  // User state
  const [userFETH, setUserFETH] = useState(ethers.utils.parseEther("10"));
  const [userWFLR, setUserWFLR] = useState(ethers.utils.parseEther("100"));
  const [userLiquidity, setUserLiquidity] = useState(ethers.utils.parseEther("31.62")); // sqrt(100 * 1000)

  const [logs, setLogs] = useState<string[]>([]);
  const [swapResult, setSwapResult] = useState<SwapResult | null>(null);
  const [totalFeesAccumulated, setTotalFeesAccumulated] = useState(ethers.utils.parseEther("0"));
  const [txCount, setTxCount] = useState(0);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const clearLogs = () => setLogs([]);

  // Generate realistic gas fees (Flare Coston2 testnet)
  const generateGasFees = () => {
    // Gas price: 25 Gwei (typical testnet)
    const gasPrice = ethers.BigNumber.from("25000000000"); // 25 Gwei

    // Gas used: varies by operation (250k-350k gas for swaps)
    const gasUsed = ethers.BigNumber.from(
      250000 + Math.floor(Math.random() * 100000) // 250k-350k
    );

    const totalFeeWei = gasPrice.mul(gasUsed);

    return {
      gasPrice,
      gasUsed,
      totalFeeWei,
      gasPriceGwei: ethers.utils.formatUnits(gasPrice, "gwei"),
      totalFeeFlr: ethers.utils.formatEther(totalFeeWei),
    };
  };

  // Generate realistic transaction hash
  const generateTxHash = () => {
    return "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  };

  // AMM formula: x * y = k (constant product formula)
  const calculateSwapAmount = (
    amountIn: ethers.BigNumber,
    reserveIn: ethers.BigNumber,
    reserveOut: ethers.BigNumber
  ): ethers.BigNumber => {
    // Formula: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
    const numerator = amountIn.mul(reserveOut);
    const denominator = reserveIn.add(amountIn);
    return numerator.div(denominator);
  };

  const simulateSwapFETHForFLR = async () => {
    try {
      const amount = prompt("Enter amount of fETH to swap (e.g., 1):");
      if (!amount) return;

      clearLogs();
      addLog("🚀 Starting fETH → WFLR Swap Simulation\n");

      const amountWei = ethers.utils.parseEther(amount);

      // Check balance
      addLog(`📊 Checking balance: ${amount} fETH`);
      if (userFETH.lt(amountWei)) {
        addLog("❌ Insufficient fETH balance!");
        toast({
          title: "Error",
          description: "Insufficient fETH balance",
          status: "error",
          duration: 5,
          isClosable: true,
        });
        return;
      }
      addLog(`✓ Balance check passed`);

      // Approve step
      addLog("\n1️⃣ Approval Step");
      addLog(`Approving ${amount} fETH for pool...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      addLog(`✓ Approval confirmed`);

      // Calculate output
      addLog("\n2️⃣ Calculating Swap Output");
      const amountOut = calculateSwapAmount(
        amountWei,
        poolState.fethReserve,
        poolState.wflrReserve
      );
      const amountOutFormatted = ethers.utils.formatEther(amountOut);

      addLog(`Input: ${amount} fETH`);
      addLog(`Output: ${amountOutFormatted} WFLR`);

      // Calculate metrics
      const pricePerFETH = amountOut.mul(ethers.BigNumber.from(10).pow(18)).div(amountWei);
      const pricePerFETHFormatted = ethers.utils.formatEther(pricePerFETH);

      const spotPrice = poolState.wflrReserve.mul(ethers.BigNumber.from(10).pow(18)).div(poolState.fethReserve);
      const spotPriceFormatted = ethers.utils.formatEther(spotPrice);

      const priceImpact = spotPrice.sub(pricePerFETH).mul(10000).div(spotPrice);
      const priceImpactFormatted = priceImpact.toNumber() / 100;

      addLog(`\nExecution Price: ${pricePerFETHFormatted} WFLR per fETH`);
      addLog(`Spot Price: ${spotPriceFormatted} WFLR per fETH`);
      addLog(`Price Impact: ${priceImpactFormatted.toFixed(2)}%`);

      // Execute swap
      addLog("\n3️⃣ Executing Swap");
      addLog("Broadcasting transaction...");
      
      // Generate gas fees
      const { gasPrice, gasUsed, totalFeeWei, gasPriceGwei, totalFeeFlr } = generateGasFees();
      const txHash = generateTxHash();
      
      addLog(`\n⛽ Gas Estimation:`);
      addLog(`Gas Price: ${gasPriceGwei} Gwei`);
      addLog(`Gas Used: ${gasUsed.toString()}`);
      addLog(`Total Fee: ${totalFeeFlr} FLR`);
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      addLog(`✓ Transaction confirmed`);
      addLog(`📍 Tx Hash: ${txHash}`);

      // Update state
      const newPoolFETH = poolState.fethReserve.add(amountWei);
      const newPoolWFLR = poolState.wflrReserve.sub(amountOut);
      const newUserFETH = userFETH.sub(amountWei);
      const newUserWFLR = userWFLR.add(amountOut);

      setPoolState({
        fethReserve: newPoolFETH,
        wflrReserve: newPoolWFLR,
      });

      setUserFETH(newUserFETH);
      setUserWFLR(newUserWFLR);
      setTotalFeesAccumulated(totalFeesAccumulated.add(totalFeeWei));
      setTxCount(txCount + 1);

      addLog("\n✅ Swap Completed Successfully!");
      addLog(`\n📈 Updated Pool State:`);
      addLog(`fETH Reserve: ${ethers.utils.formatEther(newPoolFETH)}`);
      addLog(`WFLR Reserve: ${ethers.utils.formatEther(newPoolWFLR)}`);
      addLog(`\n👤 Your New Balance:`);
      addLog(`fETH: ${ethers.utils.formatEther(newUserFETH)}`);
      addLog(`WFLR: ${ethers.utils.formatEther(newUserWFLR)}`);

      setSwapResult({
        amountIn: amount,
        amountOut: amountOutFormatted,
        priceImpact: `${priceImpactFormatted.toFixed(2)}%`,
        slippage: "0.3%",
        gasUsed: gasUsed.toString(),
        gasPrice: gasPriceGwei,
        totalFee: totalFeeFlr,
        txHash: txHash,
      });

      toast({
        title: "Swap Successful",
        description: `Swapped ${amount} fETH for ${amountOutFormatted} WFLR (Fee: ${totalFeeFlr} FLR)`,
        status: "success",
        duration: 5,
        isClosable: true,
      });
    } catch (err) {
      addLog(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5,
        isClosable: true,
      });
    }
  };

  const simulateSwapFLRForFETH = async () => {
    try {
      const amount = prompt("Enter amount of WFLR to swap (e.g., 10):");
      if (!amount) return;

      clearLogs();
      addLog("🚀 Starting WFLR → fETH Swap Simulation\n");

      const amountWei = ethers.utils.parseEther(amount);

      // Check balance
      addLog(`📊 Checking balance: ${amount} WFLR`);
      if (userWFLR.lt(amountWei)) {
        addLog("❌ Insufficient WFLR balance!");
        toast({
          title: "Error",
          description: "Insufficient WFLR balance",
          status: "error",
          duration: 5,
          isClosable: true,
        });
        return;
      }
      addLog(`✓ Balance check passed`);

      // Approve step
      addLog("\n1️⃣ Approval Step");
      addLog(`Approving ${amount} WFLR for pool...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      addLog(`✓ Approval confirmed`);

      // Calculate output
      addLog("\n2️⃣ Calculating Swap Output");
      const amountOut = calculateSwapAmount(
        amountWei,
        poolState.wflrReserve,
        poolState.fethReserve
      );
      const amountOutFormatted = ethers.utils.formatEther(amountOut);

      addLog(`Input: ${amount} WFLR`);
      addLog(`Output: ${amountOutFormatted} fETH`);

      // Calculate metrics
      const pricePerWFLR = amountOut.mul(ethers.BigNumber.from(10).pow(18)).div(amountWei);
      const pricePerWFLRFormatted = ethers.utils.formatEther(pricePerWFLR);

      const spotPrice = poolState.fethReserve.mul(ethers.BigNumber.from(10).pow(18)).div(poolState.wflrReserve);
      const spotPriceFormatted = ethers.utils.formatEther(spotPrice);

      const priceImpact = spotPrice.sub(pricePerWFLR).mul(10000).div(spotPrice);
      const priceImpactFormatted = priceImpact.toNumber() / 100;

      addLog(`\nExecution Price: ${pricePerWFLRFormatted} fETH per WFLR`);
      addLog(`Spot Price: ${spotPriceFormatted} fETH per WFLR`);
      addLog(`Price Impact: ${priceImpactFormatted.toFixed(2)}%`);

      // Execute swap
      addLog("\n3️⃣ Executing Swap");
      addLog("Broadcasting transaction...");
      
      // Generate gas fees
      const { gasPrice, gasUsed, totalFeeWei, gasPriceGwei, totalFeeFlr } = generateGasFees();
      const txHash = generateTxHash();
      
      addLog(`\n⛽ Gas Estimation:`);
      addLog(`Gas Price: ${gasPriceGwei} Gwei`);
      addLog(`Gas Used: ${gasUsed.toString()}`);
      addLog(`Total Fee: ${totalFeeFlr} FLR`);
      
      await new Promise((resolve) => setTimeout(resolve, 800));
      addLog(`✓ Transaction confirmed`);
      addLog(`📍 Tx Hash: ${txHash}`);

      // Update state
      const newPoolWFLR = poolState.wflrReserve.add(amountWei);
      const newPoolFETH = poolState.fethReserve.sub(amountOut);
      const newUserWFLR = userWFLR.sub(amountWei);
      const newUserFETH = userFETH.add(amountOut);

      setPoolState({
        fethReserve: newPoolFETH,
        wflrReserve: newPoolWFLR,
      });

      setUserFETH(newUserFETH);
      setUserWFLR(newUserWFLR);
      setTotalFeesAccumulated(totalFeesAccumulated.add(totalFeeWei));
      setTxCount(txCount + 1);

      addLog("\n✅ Swap Completed Successfully!");
      addLog(`\n📈 Updated Pool State:`);
      addLog(`fETH Reserve: ${ethers.utils.formatEther(newPoolFETH)}`);
      addLog(`WFLR Reserve: ${ethers.utils.formatEther(newPoolWFLR)}`);
      addLog(`\n👤 Your New Balance:`);
      addLog(`fETH: ${ethers.utils.formatEther(newUserFETH)}`);
      addLog(`WFLR: ${ethers.utils.formatEther(newUserWFLR)}`);

      setSwapResult({
        amountIn: amount,
        amountOut: amountOutFormatted,
        priceImpact: `${priceImpactFormatted.toFixed(2)}%`,
        slippage: "0.3%",
        gasUsed: gasUsed.toString(),
        gasPrice: gasPriceGwei,
        totalFee: totalFeeFlr,
        txHash: txHash,
      });

      toast({
        title: "Swap Successful",
        description: `Swapped ${amount} WFLR for ${amountOutFormatted} fETH (Fee: ${totalFeeFlr} FLR)`,
        status: "success",
        duration: 5,
        isClosable: true,
      });
    } catch (err) {
      addLog(`❌ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <>
      <Head>
        <title>fAssets Simulator - DOMEX</title>
        <meta name="description" content="fAssets Pool Simulator" />
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
          gap: "24px",
        }}
      >
        {/* Pool Status Card */}
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
            📊 fAssets Pool Status
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#e3f2fd",
                borderRadius: "8px",
                border: "1px solid #90caf9",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#1976d2" }}>
                fETH Reserve
              </p>
              <p
                style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#0d47a1",
                }}
              >
                {ethers.utils.formatEther(poolState.fethReserve)}
              </p>
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f3e5f5",
                borderRadius: "8px",
                border: "1px solid #ce93d8",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#7b1fa2" }}>
                WFLR Reserve
              </p>
              <p
                style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#4a148c",
                }}
              >
                {ethers.utils.formatEther(poolState.wflrReserve)}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "#f1f1f1",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#666",
            }}
          >
            <strong>Price:</strong> 1 fETH = {(
              Number(ethers.utils.formatEther(poolState.wflrReserve)) /
              Number(ethers.utils.formatEther(poolState.fethReserve))
            ).toFixed(2)}{" "}
            WFLR
          </div>
        </div>

        {/* User Balances Card */}
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
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
            👤 Your Balances
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#e8f5e9",
                borderRadius: "8px",
                border: "1px solid #81c784",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#2e7d32" }}>
                fETH
              </p>
              <p
                style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#1b5e20",
                }}
              >
                {ethers.utils.formatEther(userFETH)}
              </p>
            </div>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#fff3e0",
                borderRadius: "8px",
                border: "1px solid #ffb74d",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#e65100" }}>
                WFLR
              </p>
              <p
                style={{
                  margin: "0",
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#bf360c",
                }}
              >
                {ethers.utils.formatEther(userWFLR)}
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <button
              onClick={simulateSwapFETHForFLR}
              style={{
                padding: "12px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Swap fETH → WFLR
            </button>
            <button
              onClick={simulateSwapFLRForFETH}
              style={{
                padding: "12px",
                backgroundColor: "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Swap WFLR → fETH
            </button>
          </div>
        </div>

        {/* Swap Result Card */}
        {swapResult && (
          <div
            style={{
              maxWidth: "700px",
              width: "100%",
              padding: "24px",
              backgroundColor: "#e8f5e9",
              borderRadius: "12px",
              border: "2px solid #4caf50",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              ✅ Last Swap Result
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Amount In</p>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
                  {swapResult.amountIn}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Amount Out</p>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
                  {swapResult.amountOut}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Price Impact</p>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
                  {swapResult.priceImpact}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>Slippage</p>
                <p style={{ margin: "0", fontSize: "16px", fontWeight: "bold" }}>
                  {swapResult.slippage}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#fff9c4",
                borderRadius: "8px",
                border: "1px solid #fbc02d",
              }}
            >
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#f57f17" }}>Gas Used</p>
                <p style={{ margin: "0", fontSize: "14px", fontWeight: "bold", color: "#f57f17" }}>
                  {swapResult.gasUsed}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "12px", color: "#f57f17" }}>Gas Price</p>
                <p style={{ margin: "0", fontSize: "14px", fontWeight: "bold", color: "#f57f17" }}>
                  {swapResult.gasPrice} Gwei
                </p>
              </div>
              <div
                style={{
                  gridColumn: "1 / -1",
                }}
              >
                <p style={{ margin: "0", fontSize: "12px", color: "#f57f17" }}>Transaction Fee</p>
                <p style={{ margin: "0", fontSize: "18px", fontWeight: "bold", color: "#d32f2f" }}>
                  ⛽ {swapResult.totalFee} FLR
                </p>
              </div>
              <div
                style={{
                  gridColumn: "1 / -1",
                  wordBreak: "break-all",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>Transaction Hash</p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: "#1976d2",
                    backgroundColor: "#e3f2fd",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  {swapResult.txHash}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fee Summary Card */}
        {txCount > 0 && (
          <div
            style={{
              maxWidth: "700px",
              width: "100%",
              padding: "24px",
              backgroundColor: "#fce4ec",
              borderRadius: "12px",
              border: "2px solid #e91e63",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
              💰 Total Transactions & Fees
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e91e63",
                }}
              >
                <p style={{ margin: "0", fontSize: "12px", color: "#c2185b" }}>Total Transactions</p>
                <p style={{ margin: "0", fontSize: "24px", fontWeight: "bold", color: "#880e4f" }}>
                  {txCount}
                </p>
              </div>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e91e63",
                }}
              >
                <p style={{ margin: "0", fontSize: "12px", color: "#c2185b" }}>Total Fees Paid</p>
                <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#d32f2f" }}>
                  {ethers.utils.formatEther(totalFeesAccumulated)} FLR
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logs Card */}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0" }}>
              📋 Transaction Log
            </h2>
            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              style={{
                padding: "8px 16px",
                backgroundColor: logs.length === 0 ? "#ccc" : "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: logs.length === 0 ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              Clear
            </button>
          </div>

          <div
            style={{
              backgroundColor: "#263238",
              color: "#4db8ff",
              padding: "16px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "13px",
              lineHeight: "1.6",
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #455a64",
            }}
          >
            {logs.length === 0 ? (
              <p style={{ color: "#888", margin: "0" }}>Logs will appear here...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ marginBottom: "4px" }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
