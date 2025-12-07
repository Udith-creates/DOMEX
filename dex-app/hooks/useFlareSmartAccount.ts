import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

const SMART_ACCOUNT_ADDRESS = '0xAcc9a3bb90458885acB4D8DD4920447F7f3DEB1b';

const ABI = [
  {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'value', type: 'uint256' }, { internalType: 'bytes', name: 'data', type: 'bytes' }],
    name: 'execute',
    outputs: [{ internalType: 'bool', name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address[]', name: 'targets', type: 'address[]' }, { internalType: 'uint256[]', name: 'values', type: 'uint256[]' }, { internalType: 'bytes[]', name: 'datas', type: 'bytes[]' }],
    name: 'executeBatch',
    outputs: [{ internalType: 'uint256', name: 'successCount', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { inputs: [{ internalType: 'address', name: 'signer', type: 'address' }], name: 'authorizeSigner', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'signer', type: 'address' }], name: 'revokeSigner', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [{ internalType: 'address', name: 'signer', type: 'address' }], name: 'isAuthorizedSigner', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getNonce', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'getBalance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
];

interface ExecuteParams {
  to: string;
  value: string;
  data: string;
}

interface BatchExecuteParams {
  targets: string[];
  values: string[];
  datas: string[];
}

export function useFlareSmartAccount(provider: ethers.providers.Web3Provider | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (!provider) {
      setContract(null);
      return;
    }

    try {
      const signer = provider.getSigner();
      const newContract = new ethers.Contract(SMART_ACCOUNT_ADDRESS, ABI, signer);
      setContract(newContract);
    } catch (err) {
      console.error('Failed to create contract:', err);
      setError(err instanceof Error ? err.message : 'Failed to create contract');
    }
  }, [provider]);

  const execute = useCallback(
    async (params: ExecuteParams) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error('Provider not connected');

        const tx = await contract.execute(params.to, params.value, params.data);
        const receipt = await tx.wait();
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Execution failed';
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract]
  );

  const executeBatch = useCallback(
    async (params: BatchExecuteParams) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error('Provider not connected');

        const tx = await contract.executeBatch(params.targets, params.values, params.datas);
        const receipt = await tx.wait();
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Batch execution failed';
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract]
  );

  const authorizeSigner = useCallback(
    async (signer: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error('Provider not connected');

        const tx = await contract.authorizeSigner(signer);
        await tx.wait();
        setLoading(false);
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to authorize signer';
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract]
  );

  const revokeSigner = useCallback(
    async (signer: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!contract) throw new Error('Provider not connected');

        const tx = await contract.revokeSigner(signer);
        await tx.wait();
        setLoading(false);
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to revoke signer';
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [contract]
  );

  const isAuthorizedSigner = useCallback(
    async (signer: string) => {
      try {
        if (!contract) throw new Error('Provider not connected');
        return await contract.isAuthorizedSigner(signer);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Check failed');
        return false;
      }
    },
    [contract]
  );

  const getNonce = useCallback(async () => {
    try {
      if (!contract) throw new Error('Provider not connected');
      const nonce = await contract.getNonce();
      return nonce.toString();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get nonce');
      return '0';
    }
  }, [contract]);

  const getBalance = useCallback(async () => {
    try {
      if (!contract) throw new Error('Provider not connected');
      const balance = await contract.getBalance();
      return ethers.utils.formatEther(balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get balance');
      return '0';
    }
  }, [contract]);

  const getOwner = useCallback(async () => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      console.log('Calling getOwner...');
      const ownerAddr = await contract.owner();
      console.log('Owner result:', ownerAddr);
      return ownerAddr;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get owner';
      console.error('getOwner error:', errorMsg, err);
      setError(errorMsg);
      return null;
    }
  }, [contract]);

  const fundAccount = useCallback(
    async (amountInFLR: string) => {
      setLoading(true);
      setError(null);
      try {
        if (!provider) throw new Error('Provider not connected');

        const signer = provider.getSigner();
        const amountWei = ethers.utils.parseEther(amountInFLR);

        console.log('Funding smart account with', amountInFLR, 'FLR');
        const tx = await signer.sendTransaction({
          to: SMART_ACCOUNT_ADDRESS,
          value: amountWei,
        });

        const receipt = await tx.wait();
        console.log('Funding transaction successful:', receipt);
        setLoading(false);
        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Funding failed';
        console.error('fundAccount error:', errorMsg, err);
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    [provider]
  );

  return {
    execute,
    executeBatch,
    authorizeSigner,
    revokeSigner,
    isAuthorizedSigner,
    getNonce,
    getBalance,
    getOwner,
    fundAccount,
    loading,
    error,
    smartAccountAddress: SMART_ACCOUNT_ADDRESS,
    isReady: contract !== null,
  };
}
