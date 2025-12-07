import Head from "next/head";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useSDK, useAddress } from "@thirdweb-dev/react";
import { useFlareSmartAccount } from "@/hooks/useFlareSmartAccount";
import Navbar from "@/components/Navbar";
import { Box, Button, Flex, Spinner, useToast } from "@chakra-ui/react";

export default function SmartAccountPage() {
  const address = useAddress();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [balance, setBalance] = useState("0");
  const [nonce, setNonce] = useState("0");
  const [owner, setOwner] = useState("");

  const {
    execute,
    authorizeSigner,
    revokeSigner,
    isAuthorizedSigner,
    getNonce,
    getBalance,
    getOwner,
    fundAccount,
    loading,
    error,
    smartAccountAddress,
    isReady,
  } = useFlareSmartAccount(provider);

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
    const loadAccountInfo = async () => {
      if (isReady) {
        try {
          console.log("Loading account info...");
          const ownerAddr = await getOwner();
          console.log("Owner:", ownerAddr);
          setOwner(ownerAddr || "");

          const balanceStr = await getBalance();
          console.log("Balance:", balanceStr);
          setBalance(balanceStr);

          const nonceStr = await getNonce();
          console.log("Nonce:", nonceStr);
          setNonce(nonceStr);
        } catch (err) {
          console.error("Failed to load account info:", err);
        }
      }
    };

    loadAccountInfo();
  }, [isReady, getBalance, getNonce, getOwner]);

  const handleExecute = async () => {
    try {
      const targetAddress = prompt("Enter target address:");
      const value = prompt("Enter value (in FLR):", "0");
      const data = prompt("Enter call data (hex):", "0x");

      if (!targetAddress || !value || !data) return;

      await execute({
        to: targetAddress,
        value: ethers.utils.parseEther(value).toString(),
        data,
      });

      toast({
        title: "Success",
        description: "Transaction executed successfully",
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

  const handleAuthorizeSigner = async () => {
    try {
      const signer = prompt("Enter signer address:");
      if (!signer) return;

      await authorizeSigner(signer);
      toast({
        title: "Success",
        description: "Signer authorized successfully",
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

  const handleRevokeSigner = async () => {
    try {
      const signer = prompt("Enter signer address to revoke:");
      if (!signer) return;

      await revokeSigner(signer);
      toast({
        title: "Success",
        description: "Signer revoked successfully",
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

  const handleCheckSigner = async () => {
    try {
      const signer = prompt("Enter signer address to check:");
      if (!signer) return;

      const isAuth = await isAuthorizedSigner(signer);
      toast({
        title: "Result",
        description: `Signer ${signer} is ${isAuth ? "authorized" : "not authorized"}`,
        status: isAuth ? "success" : "info",
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

  const handleFundAccount = async () => {
    try {
      const amount = prompt("Enter amount in FLR to send:");
      if (!amount) return;

      await fundAccount(amount);
      toast({
        title: "Success",
        description: `Sent ${amount} FLR to smart account`,
        status: "success",
        duration: 5,
        isClosable: true,
      });

      // Refresh balance
      setTimeout(async () => {
        const newBalance = await getBalance();
        setBalance(newBalance);
      }, 2000);
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

  const handleRefresh = async () => {
    if (isReady && provider) {
      try {
        const balanceStr = await getBalance();
        setBalance(balanceStr);

        const nonceStr = await getNonce();
        setNonce(nonceStr);

        const ownerAddr = await getOwner();
        setOwner(ownerAddr || "");

        toast({
          title: "Refreshed",
          description: "Account info updated",
          status: "success",
          duration: 3,
          isClosable: true,
        });
      } catch (err) {
        console.error("Failed to refresh:", err);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Smart Account - DOMEX</title>
        <meta name="description" content="Flare Smart Account Management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <Flex direction="column" align="center" justify="flex-start" minH="100vh" bg="gray.50" py="8">
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
            Flare Smart Account
          </h2>

          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f7fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            <p style={{ marginBottom: "8px" }}>
              <strong>Smart Account:</strong>
              <br />
              <code style={{ fontSize: "12px", wordBreak: "break-all" }}>{smartAccountAddress}</code>
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>Owner:</strong> {owner || "Loading..."}
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>Balance:</strong> <span style={{ fontSize: "18px", fontWeight: "bold", color: "#22543d" }}>{balance} FLR</span>
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>Nonce:</strong> {nonce}
            </p>
            <p style={{ marginBottom: "0" }}>
              <strong>Connected Account:</strong>
              <br />
              <code style={{ fontSize: "12px", wordBreak: "break-all" }}>{address || "Not connected"}</code>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
            <button
              onClick={handleFundAccount}
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
              {loading ? "Loading..." : "Fund Account"}
            </button>

            <button
              onClick={handleExecute}
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
              {loading ? "Loading..." : "Execute Tx"}
            </button>

            <button
              onClick={handleAuthorizeSigner}
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
              {loading ? "Loading..." : "Authorize Signer"}
            </button>

            <button
              onClick={handleRevokeSigner}
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
              {loading ? "Loading..." : "Revoke Signer"}
            </button>

            <button
              onClick={handleCheckSigner}
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
              {loading ? "Loading..." : "Check Signer"}
            </button>

            <button
              onClick={handleRefresh}
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
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </Box>
      </Flex>
    </>
  );
}
