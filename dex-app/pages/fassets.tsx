import Head from "next/head";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAddress } from "@thirdweb-dev/react";
import { useFAsset } from "@/hooks/useFAsset";
import Navbar from "@/components/Navbar";
import { Box, useToast } from "@chakra-ui/react";

export default function FAssetsPage() {
  const address = useAddress();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [reserveFETH, setReserveFETH] = useState("0");
  const [reserveWFLR, setReserveWFLR] = useState("0");
  const [fethBalance, setFethBalance] = useState("0");
  const [wflrBalance, setWflrBalance] = useState("0");
  const [fethAddress, setFethAddress] = useState<string | null>(null);
  const [wflrAddress, setWflrAddress] = useState<string | null>(null);

  const {
    swapFETHForFLR,
    swapFLRForFETH,
    addLiquidity,
    removeLiquidity,
    getReserveFETH,
    getReserveWFLR,
    getFETHAddress,
    getWFLRAddress,
    approveFETH,
    approveWFLR,
    getFETHBalance,
    getWFLRBalance,
    loading,
    error,
    isReady,
  } = useFAsset(provider);

  const toast = useToast();

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

  useEffect(() => {
    const loadReserves = async () => {
      if (isReady) {
        try {
          const feth = await getReserveFETH();
          const wflr = await getReserveWFLR();
          const fethAddr = await getFETHAddress();
          const wflrAddr = await getWFLRAddress();
          
          setReserveFETH(feth);
          setReserveWFLR(wflr);
          setFethAddress(fethAddr);
          setWflrAddress(wflrAddr);

          if (address && fethAddr && wflrAddr) {
            const fethBal = await getFETHBalance(fethAddr, address);
            const wflrBal = await getWFLRBalance(wflrAddr, address);
            setFethBalance(fethBal);
            setWflrBalance(wflrBal);
          }
        } catch (err) {
          console.error("Failed to load reserves:", err);
        }
      }
    };

    loadReserves();
  }, [isReady, getReserveFETH, getReserveWFLR, getFETHAddress, getWFLRAddress, getFETHBalance, getWFLRBalance, address]);

  const handleSwapFETHForFLR = async () => {
    try {
      const amount = prompt("Enter amount of fETH to swap:");
      if (!amount) return;

      if (!fethAddress) {
        toast({
          title: "Error",
          description: "fETH address not loaded",
          status: "error",
          duration: 5,
          isClosable: true,
        });
        return;
      }

      // First approve the token
      toast({
        title: "Approving",
        description: "Please approve fETH spending...",
        status: "info",
        duration: 10,
        isClosable: true,
      });

      await approveFETH(fethAddress, amount);

      // Then swap
      await swapFETHForFLR(amount);
      toast({
        title: "Success",
        description: `Swapped ${amount} fETH for FLR`,
        status: "success",
        duration: 5,
        isClosable: true,
      });

      const newReserves = await Promise.all([getReserveFETH(), getReserveWFLR()]);
      setReserveFETH(newReserves[0]);
      setReserveWFLR(newReserves[1]);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5,
        isClosable: true,
      });
    }
  };

  const handleSwapFLRForFETH = async () => {
    try {
      const amount = prompt("Enter amount of WFLR to swap:");
      if (!amount) return;

      if (!wflrAddress) {
        toast({
          title: "Error",
          description: "WFLR address not loaded",
          status: "error",
          duration: 5,
          isClosable: true,
        });
        return;
      }

      // First approve the token
      toast({
        title: "Approving",
        description: "Please approve WFLR spending...",
        status: "info",
        duration: 10,
        isClosable: true,
      });

      await approveWFLR(wflrAddress, amount);

      // Then swap
      await swapFLRForFETH(amount);
      toast({
        title: "Success",
        description: `Swapped ${amount} WFLR for fETH`,
        status: "success",
        duration: 5,
        isClosable: true,
      });

      const newReserves = await Promise.all([getReserveFETH(), getReserveWFLR()]);
      setReserveFETH(newReserves[0]);
      setReserveWFLR(newReserves[1]);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5,
        isClosable: true,
      });
    }
  };

  const handleAddLiquidity = async () => {
    try {
      const feth = prompt("Enter amount of fETH:");
      if (!feth) return;
      const wflr = prompt("Enter amount of WFLR:");
      if (!wflr) return;

      await addLiquidity(feth, wflr);
      toast({
        title: "Success",
        description: `Added ${feth} fETH and ${wflr} WFLR as liquidity`,
        status: "success",
        duration: 5,
        isClosable: true,
      });

      const newReserves = await Promise.all([getReserveFETH(), getReserveWFLR()]);
      setReserveFETH(newReserves[0]);
      setReserveWFLR(newReserves[1]);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5,
        isClosable: true,
      });
    }
  };

  const handleRemoveLiquidity = async () => {
    try {
      const liquidity = prompt("Enter amount of liquidity tokens to burn:");
      if (!liquidity) return;

      await removeLiquidity(liquidity);
      toast({
        title: "Success",
        description: `Removed ${liquidity} liquidity`,
        status: "success",
        duration: 5,
        isClosable: true,
      });

      const newReserves = await Promise.all([getReserveFETH(), getReserveWFLR()]);
      setReserveFETH(newReserves[0]);
      setReserveWFLR(newReserves[1]);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unknown error",
        status: "error",
        duration: 5,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Head>
        <title>fAssets Exchange - DOMEX</title>
        <meta name="description" content="fAssets Exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", minHeight: "100vh", backgroundColor: "#f7fafc", padding: "32px 0" }}>
        <Box
          maxW="600px"
          w="full"
          px="6"
          py="8"
          bg="white"
          rounded="xl"
          boxShadow="lg"
        >
          <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
            fAsset Pool
          </h2>

          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f7fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "bold" }}>Pool Reserves</h3>
            <p style={{ marginBottom: "8px" }}>
              <strong>fETH Reserve:</strong> <span style={{ fontSize: "18px", fontWeight: "bold", color: "#22543d" }}>{reserveFETH}</span>
            </p>
            <p style={{ marginBottom: "0" }}>
              <strong>WFLR Reserve:</strong> <span style={{ fontSize: "18px", fontWeight: "bold", color: "#22543d" }}>{reserveWFLR}</span>
            </p>
            <p style={{ marginTop: "8px", marginBottom: "0" }}>
              <strong>Contract Ready:</strong> {isReady ? "✓ Yes" : "✗ No"}
            </p>
          </div>

          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "8px", border: "1px solid #c8e6c9" }}>
            <h3 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: "bold" }}>Your Balances</h3>
            <p style={{ marginBottom: "8px" }}>
              <strong>fETH Balance:</strong> <span style={{ fontSize: "18px", fontWeight: "bold", color: "#1b5e20" }}>{fethBalance}</span>
            </p>
            <p style={{ marginBottom: "0" }}>
              <strong>WFLR Balance:</strong> <span style={{ fontSize: "18px", fontWeight: "bold", color: "#1b5e20" }}>{wflrBalance}</span>
            </p>
          </div>

          {error && (
            <div style={{ padding: "12px", backgroundColor: "#fed7d7", borderRadius: "6px", marginBottom: "15px", color: "#c53030", border: "1px solid #fc8181" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={handleSwapFETHForFLR}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Swap fETH → FLR"}
            </button>

            <button
              onClick={handleSwapFLRForFETH}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Swap FLR → fETH"}
            </button>

            <button
              onClick={handleAddLiquidity}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Add Liquidity"}
            </button>

            <button
              onClick={handleRemoveLiquidity}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Remove Liquidity"}
            </button>
          </div>
        </Box>
      </div>
    </>
  );
}
