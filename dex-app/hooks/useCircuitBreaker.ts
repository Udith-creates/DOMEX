import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { CIRCUITBREAKER_ADDRESS, CIRCUITBREAKER_ABI } from "@/const/details";

export function useCircuitBreaker(provider: ethers.providers.Web3Provider | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isReady, setIsReady] = useState(false);

  // State for circuit breaker status
  const [isOperational, setIsOperational] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCooldownPeriod, setRateLimitCooldownPeriod] = useState("0");
  const [lastRateLimitTimestamp, setLastRateLimitTimestamp] = useState("0");
  const [gracePeriodEndTimestamp, setGracePeriodEndTimestamp] = useState("0");

  useEffect(() => {
    const initContract = async () => {
      if (!provider) return;

      try {
        const c = new ethers.Contract(CIRCUITBREAKER_ADDRESS, CIRCUITBREAKER_ABI, provider);
        setContract(c);
        setIsReady(true);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to init contract";
        console.error("useCircuitBreaker init error:", errorMsg);
        setError(errorMsg);
        setIsReady(false);
      }
    };

    initContract();
  }, [provider]);

  const loadStatus = useCallback(async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const operational = await contract.isOperational();
      const rateLimited = await contract.isRateLimited();
      const cooldownPeriod = await contract.rateLimitCooldownPeriod();
      const lastRateLimit = await contract.lastRateLimitTimestamp();
      const gracePeriodEnd = await contract.gracePeriodEndTimestamp();

      setIsOperational(operational);
      setIsRateLimited(rateLimited);
      setRateLimitCooldownPeriod(cooldownPeriod.toString());
      setLastRateLimitTimestamp(lastRateLimit.toString());
      setGracePeriodEndTimestamp(gracePeriodEnd.toString());

      console.log("Circuit Breaker Status:", {
        operational,
        rateLimited,
        cooldownPeriod: cooldownPeriod.toString(),
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load status";
      console.error("loadStatus error:", errorMsg);
      setError(errorMsg);
    }
  }, [contract]);

  const checkProtectedContract = useCallback(
    async (contractAddress: string) => {
      try {
        if (!contract) throw new Error("Contract not initialized");
        const isProtected = await contract.isProtectedContract(contractAddress);
        console.log(`${contractAddress} protected: ${isProtected}`);
        return isProtected;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Check failed";
        console.error("checkProtectedContract error:", errorMsg);
        setError(errorMsg);
        throw err;
      }
    },
    [contract]
  );

  const addProtectedContracts = useCallback(
    async (contractAddresses: string[]) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        console.log("Adding protected contracts:", contractAddresses);
        const tx = await contractWithSigner.addProtectedContracts(contractAddresses);
        const receipt = await tx.wait();

        console.log("Contracts added:", receipt);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Add failed";
        console.error("addProtectedContracts error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const removeProtectedContracts = useCallback(
    async (contractAddresses: string[]) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        console.log("Removing protected contracts:", contractAddresses);
        const tx = await contractWithSigner.removeProtectedContracts(contractAddresses);
        const receipt = await tx.wait();

        console.log("Contracts removed:", receipt);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Remove failed";
        console.error("removeProtectedContracts error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const setOperationalStatus = useCallback(
    async (newStatus: boolean) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        console.log("Setting operational status to:", newStatus);
        const tx = await contractWithSigner.setCircuitBreakerOperationalStatus(newStatus);
        const receipt = await tx.wait();

        console.log("Status updated:", receipt);
        setIsOperational(newStatus);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Status update failed";
        console.error("setOperationalStatus error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const startGracePeriod = useCallback(
    async (endTimestampSeconds: number) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        console.log("Starting grace period until:", new Date(endTimestampSeconds * 1000));
        const tx = await contractWithSigner.startGracePeriod(endTimestampSeconds);
        const receipt = await tx.wait();

        console.log("Grace period started:", receipt);
        setGracePeriodEndTimestamp(endTimestampSeconds.toString());
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Grace period start failed";
        console.error("startGracePeriod error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const overrideRateLimit = useCallback(
    async (identifier: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        console.log("Overriding rate limit for:", identifier);
        const tx = await contractWithSigner.overrideRateLimit(identifier);
        const receipt = await tx.wait();

        console.log("Rate limit overridden:", receipt);
        setIsRateLimited(false);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Override failed";
        console.error("overrideRateLimit error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  return {
    loadStatus,
    checkProtectedContract,
    addProtectedContracts,
    removeProtectedContracts,
    setOperationalStatus,
    startGracePeriod,
    overrideRateLimit,
    loading,
    error,
    isReady,
    contract,
    // Status values
    isOperational,
    isRateLimited,
    rateLimitCooldownPeriod,
    lastRateLimitTimestamp,
    gracePeriodEndTimestamp,
  };
}
