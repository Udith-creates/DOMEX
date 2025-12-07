import Head from "next/head";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAddress } from "@thirdweb-dev/react";
import { useCircuitBreaker } from "@/hooks/useCircuitBreaker";
import Navbar from "@/components/Navbar";
import CircuitBreakerComponent from "@/components/CircuitBreakerComponent";
import { Box, useToast } from "@chakra-ui/react";

export default function CircuitBreakerPage() {
  const address = useAddress();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  const {
    loadStatus,
    checkProtectedContract,
    addProtectedContracts,
    removeProtectedContracts,
    setOperationalStatus,
    startGracePeriod,
    overrideRateLimit,
    loading,
    error,
    contract,
    isReady,
    isOperational,
    isRateLimited,
    rateLimitCooldownPeriod,
    lastRateLimitTimestamp,
    gracePeriodEndTimestamp,
  } = useCircuitBreaker(provider);

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
    if (isReady) {
      loadStatus();
    }
  }, [isReady, loadStatus]);

  const handleLoadStatus = async () => {
    await loadStatus();
    toast({
      title: "Status Loaded",
      status: "success",
      duration: 3,
      isClosable: true,
    });
  };

  const handleCheckProtected = async () => {
    try {
      const contractAddr = prompt("Enter contract address to check:");
      if (!contractAddr) return;

      const isProtected = await checkProtectedContract(contractAddr);
      toast({
        title: "Contract Status",
        description: isProtected ? "Contract is protected" : "Contract is not protected",
        status: isProtected ? "success" : "info",
        duration: 5,
        isClosable: true,
      });
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

  const handleAddProtected = async () => {
    try {
      const input = prompt("Enter contract addresses (comma-separated):");
      if (!input) return;

      const addresses = input.split(",").map((addr) => addr.trim());
      await addProtectedContracts(addresses);
      toast({
        title: "Success",
        description: `Added ${addresses.length} protected contract(s)`,
        status: "success",
        duration: 5,
        isClosable: true,
      });
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

  const handleRemoveProtected = async () => {
    try {
      const input = prompt("Enter contract addresses to remove (comma-separated):");
      if (!input) return;

      const addresses = input.split(",").map((addr) => addr.trim());
      await removeProtectedContracts(addresses);
      toast({
        title: "Success",
        description: `Removed ${addresses.length} protected contract(s)`,
        status: "success",
        duration: 5,
        isClosable: true,
      });
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

  const handleToggleOperational = async () => {
    try {
      await setOperationalStatus(!isOperational);
      toast({
        title: "Success",
        description: `Circuit breaker is now ${!isOperational ? "operational" : "paused"}`,
        status: "success",
        duration: 5,
        isClosable: true,
      });
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

  const handleStartGracePeriod = async () => {
    try {
      const daysStr = prompt("Enter grace period duration in days:");
      if (!daysStr) return;

      const days = parseInt(daysStr);
      const endTimestamp = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;

      await startGracePeriod(endTimestamp);
      toast({
        title: "Success",
        description: `Grace period started for ${days} day(s)`,
        status: "success",
        duration: 5,
        isClosable: true,
      });
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

  const handleOverrideRateLimit = async () => {
    try {
      const identifier = prompt("Enter limiter identifier (hex format):");
      if (!identifier) return;

      await overrideRateLimit(identifier);
      toast({
        title: "Success",
        description: "Rate limit overridden",
        status: "success",
        duration: 5,
        isClosable: true,
      });
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

  const formatTimestamp = (timestamp: string) => {
    const ts = parseInt(timestamp);
    if (ts === 0) return "Not set";
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <>
      <Head>
        <title>Circuit Breaker - DOMEX</title>
        <meta name="description" content="Circuit Breaker Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", minHeight: "100vh", backgroundColor: "#f7fafc", padding: "32px 0", gap: "32px" }}>
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
            Circuit Breaker Control
          </h2>

          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f7fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <p style={{ marginBottom: "10px" }}>
              <strong>Operational:</strong>{" "}
              <span style={{ fontSize: "16px", fontWeight: "bold", color: isOperational ? "#22863a" : "#cb2431" }}>
                {isOperational ? "✓ Yes" : "✗ No"}
              </span>
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Rate Limited:</strong>{" "}
              <span style={{ fontSize: "16px", fontWeight: "bold", color: isRateLimited ? "#cb2431" : "#22863a" }}>
                {isRateLimited ? "✓ Yes" : "✗ No"}
              </span>
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Rate Limit Cooldown:</strong> {rateLimitCooldownPeriod} seconds
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong>Last Rate Limit:</strong> {formatTimestamp(lastRateLimitTimestamp)}
            </p>
            <p style={{ marginBottom: "0" }}>
              <strong>Grace Period Ends:</strong> {formatTimestamp(gracePeriodEndTimestamp)}
            </p>
            <p style={{ marginTop: "8px", marginBottom: "0" }}>
              <strong>Contract Ready:</strong> {isReady ? "✓ Yes" : "✗ No"}
            </p>
          </div>

          {error && (
            <div style={{ padding: "12px", backgroundColor: "#fed7d7", borderRadius: "6px", marginBottom: "15px", color: "#c53030", border: "1px solid #fc8181" }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={handleLoadStatus}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: "#9c27b0",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Load Status"}
            </button>

            <button
              onClick={handleToggleOperational}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: isOperational ? "#f44336" : "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : isOperational ? "Pause Breaker" : "Activate Breaker"}
            </button>

            <button
              onClick={handleCheckProtected}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: "#2196f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Check Protected"}
            </button>

            <button
              onClick={handleAddProtected}
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
              {loading ? "Loading..." : "Add Protected"}
            </button>

            <button
              onClick={handleRemoveProtected}
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
              {loading ? "Loading..." : "Remove Protected"}
            </button>

            <button
              onClick={handleStartGracePeriod}
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
              {loading ? "Loading..." : "Start Grace Period"}
            </button>

            <button
              onClick={handleOverrideRateLimit}
              disabled={loading}
              style={{
                padding: "12px",
                backgroundColor: "#ff5722",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                fontWeight: "500",
              }}
            >
              {loading ? "Loading..." : "Override Rate Limit"}
            </button>
          </div>
        </Box>

        <CircuitBreakerComponent
          provider={provider}
          circuitBreakerContract={contract}
        />
      </div>
    </>
  );
}
