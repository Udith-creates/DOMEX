import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { FASSET_ADDRESS, FASSET_ABI } from "@/const/details";

export function useFAsset(provider: ethers.providers.Web3Provider | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      if (!provider) return;

      try {
        const c = new ethers.Contract(FASSET_ADDRESS, FASSET_ABI, provider);
        setContract(c);
        setIsReady(true);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to init contract";
        console.error("useFAsset init error:", errorMsg);
        setError(errorMsg);
        setIsReady(false);
      }
    };

    initContract();
  }, [provider]);

  const swapFETHForFLR = useCallback(
    async (amountFETH: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const amountWei = ethers.utils.parseEther(amountFETH);

        console.log("Swapping fETH for FLR:", amountFETH);
        const tx = await contractWithSigner.swapFETHForFLR(amountWei);
        const receipt = await tx.wait();

        console.log("Swap successful:", receipt);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Swap failed";
        console.error("swapFETHForFLR error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const swapFLRForFETH = useCallback(
    async (amountFLR: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const amountWei = ethers.utils.parseEther(amountFLR);

        console.log("Swapping FLR for fETH:", amountFLR);
        const tx = await contractWithSigner.swapFLRForFETH(amountWei);
        const receipt = await tx.wait();

        console.log("Swap successful:", receipt);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Swap failed";
        console.error("swapFLRForFETH error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const addLiquidity = useCallback(
    async (amountFETH: string, amountWFLR: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const fethWei = ethers.utils.parseEther(amountFETH);
        const wflrWei = ethers.utils.parseEther(amountWFLR);

        console.log("Adding liquidity:", amountFETH, "fETH and", amountWFLR, "WFLR");
        const tx = await contractWithSigner.addLiquidity(fethWei, wflrWei);
        const receipt = await tx.wait();

        console.log("Liquidity added:", receipt);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Add liquidity failed";
        console.error("addLiquidity error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const removeLiquidity = useCallback(
    async (liquidity: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error("Contract not initialized");
        if (!provider) throw new Error("Provider not connected");

        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        const liquidityWei = ethers.utils.parseEther(liquidity);

        console.log("Removing liquidity:", liquidity);
        const tx = await contractWithSigner.removeLiquidity(liquidityWei);
        const receipt = await tx.wait();

        console.log("Liquidity removed:", receipt);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Remove liquidity failed";
        console.error("removeLiquidity error:", errorMsg);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract, provider]
  );

  const getReserveFETH = useCallback(async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const reserve = await contract.reserveFETH();
      return ethers.utils.formatEther(reserve);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get reserve";
      console.error("getReserveFETH error:", errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [contract]);

  const getReserveWFLR = useCallback(async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const reserve = await contract.reserveWFLR();
      return ethers.utils.formatEther(reserve);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get reserve";
      console.error("getReserveWFLR error:", errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [contract]);

  const getFETHAddress = useCallback(async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const addr = await contract.fETH();
      return addr;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get fETH address";
      console.error("getFETHAddress error:", errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [contract]);

  const getWFLRAddress = useCallback(async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      const addr = await contract.WFLR();
      return addr;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get WFLR address";
      console.error("getWFLRAddress error:", errorMsg);
      setError(errorMsg);
      throw err;
    }
  }, [contract]);

  return {
    swapFETHForFLR,
    swapFLRForFETH,
    addLiquidity,
    removeLiquidity,
    getReserveFETH,
    getReserveWFLR,
    getFETHAddress,
    getWFLRAddress,
    loading,
    error,
    isReady,
    contract,
  };
}
