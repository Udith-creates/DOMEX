import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useSDK, useAddress } from '@thirdweb-dev/react';
import { useFlareSmartAccount } from '../hooks/useFlareSmartAccount';

export function SmartAccountComponent() {
  const sdk = useSDK();
  const address = useAddress();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [balance, setBalance] = useState('0');
  const [nonce, setNonce] = useState('0');
  const [owner, setOwner] = useState('');

  const {
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
    smartAccountAddress,
    isReady,
  } = useFlareSmartAccount(provider);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum && address) {
        try {
          const browserProvider = new ethers.providers.Web3Provider((window as any).ethereum);
          setProvider(browserProvider);
        } catch (err) {
          console.error('Failed to init provider:', err);
        }
      }
    };

    initProvider();
  }, [address]);

  useEffect(() => {
    const loadAccountInfo = async () => {
      if (isReady) {
        try {
          console.log('Loading account info...');
          const ownerAddr = await getOwner();
          console.log('Owner:', ownerAddr);
          setOwner(ownerAddr || '');

          const balanceStr = await getBalance();
          console.log('Balance:', balanceStr);
          setBalance(balanceStr);

          const nonceStr = await getNonce();
          console.log('Nonce:', nonceStr);
          setNonce(nonceStr);
        } catch (err) {
          console.error('Failed to load account info:', err);
        }
      }
    };

    loadAccountInfo();
  }, [isReady, getBalance, getNonce, getOwner]);

  const handleExecute = async () => {
    try {
      const targetAddress = prompt('Enter target address:');
      const value = prompt('Enter value (in FLR):', '0');
      const data = prompt('Enter call data (hex):', '0x');

      if (!targetAddress || !value || !data) return;

      await execute({
        to: targetAddress,
        value: ethers.utils.parseEther(value).toString(),
        data,
      });

      alert('Transaction executed successfully');
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleAuthorizeSigner = async () => {
    try {
      const signer = prompt('Enter signer address:');
      if (!signer) return;

      await authorizeSigner(signer);
      alert('Signer authorized successfully');
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRevokeSigner = async () => {
    try {
      const signer = prompt('Enter signer address to revoke:');
      if (!signer) return;

      await revokeSigner(signer);
      alert('Signer revoked successfully');
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCheckSigner = async () => {
    try {
      const signer = prompt('Enter signer address to check:');
      if (!signer) return;

      const isAuth = await isAuthorizedSigner(signer);
      alert(`Signer ${signer} is ${isAuth ? 'authorized' : 'not authorized'}`);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
        setOwner(ownerAddr || '');
      } catch (err) {
        console.error('Failed to refresh:', err);
      }
    }
  };

  const handleFundAccount = async () => {
    try {
      const amount = prompt('Enter amount in FLR to send:');
      if (!amount) return;

      await fundAccount(amount);
      alert('Funding successful! Refreshing...');
      await handleRefresh();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '20px' }}>
      <h2>Flare Smart Account</h2>

      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p>
          <strong>Smart Account:</strong> {smartAccountAddress}
        </p>
        <p>
          <strong>Owner:</strong> {owner || 'Loading...'}
        </p>
        <p>
          <strong>Balance:</strong> {balance} FLR
        </p>
        <p>
          <strong>Nonce:</strong> {nonce}
        </p>
        <p>
          <strong>Connected Account:</strong> {address || 'Not connected'}
        </p>
        <p>
          <strong>Contract Ready:</strong> {isReady ? '✓ Yes' : '✗ No'}
        </p>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffcccc', borderRadius: '4px', marginBottom: '10px', color: '#cc0000' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button onClick={handleExecute} disabled={loading} style={{ padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Execute Transaction'}
        </button>

        <button onClick={handleFundAccount} disabled={loading} style={{ padding: '10px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Fund Account'}
        </button>

        <button onClick={handleAuthorizeSigner} disabled={loading} style={{ padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Authorize Signer'}
        </button>

        <button onClick={handleRevokeSigner} disabled={loading} style={{ padding: '10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Revoke Signer'}
        </button>

        <button onClick={handleCheckSigner} disabled={loading} style={{ padding: '10px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Loading...' : 'Check Signer'}
        </button>
      </div>

      <button onClick={handleRefresh} disabled={loading} style={{ marginTop: '10px', padding: '10px', width: '100%', backgroundColor: '#9C27B0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        {loading ? 'Loading...' : 'Refresh Info'}
      </button>
    </div>
  );
}
