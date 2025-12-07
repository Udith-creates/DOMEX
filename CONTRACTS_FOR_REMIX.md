# DOMEX Smart Contracts - Remix IDE Deployment Guide

## Overview
This document lists all smart contracts in the DOMEX project, organized by folder and ready for Remix IDE deployment.

---

## 📁 Main Deployable Contracts

### 1. **MultiDEX.sol**
- **Location**: `scaffold-eth/packages/hardhat/contracts/MultiDEX.sol`
- **Type**: Core DEX Contract
- **Purpose**: Multi-token decentralized exchange with Flare network integration
- **Key Features**:
  - Support for multiple token pairs
  - Liquidity management
  - Flare FTSO price oracle integration
  - Owner-controlled token support
- **Constructor**: No parameters
- **Dependencies**: `@openzeppelin/contracts/token/ERC20/IERC20.sol`, Flare interfaces
- **Network**: Flare Network (Coston2 testnet)

### 2. **DEX.sol**
- **Location**: `scaffold-eth/packages/hardhat/contracts/DEX.sol`
- **Type**: Liquidity Pool Contract
- **Purpose**: Basic AMM liquidity pool with ERC20 token support
- **Key Features**:
  - Add/Remove liquidity functionality
  - Swap tokens
  - LP token minting
  - Constant product formula (x * y = k)
- **Constructor Parameters**: `address _token` (ERC20 token address)
- **Dependencies**: `@openzeppelin/contracts/token/ERC20/ERC20.sol`, `Ownable`
- **Network**: Any EVM-compatible chain

### 3. **SwapGuard.sol**
- **Location**: `scaffold-eth/packages/hardhat/contracts/SwapGuard.sol`
- **Type**: Oracle Price Feed Contract
- **Purpose**: Integrates Flare FTSO price oracle for secure price feeds
- **Key Features**:
  - Get real-time token prices from Flare FTSO
  - Price feed validation
  - Decimal precision handling
- **Constructor**: No parameters
- **Dependencies**: Flare contract registry interfaces
- **Network**: Flare Network (Coston2 testnet)

### 4. **FrontRunner.sol**
- **Location**: `scaffold-eth/packages/hardhat/contracts/FrontRunner.sol`
- **Type**: Front-running Attack Simulator (Educational)
- **Purpose**: Demonstrates MEV front-running attacks for security testing
- **Key Features**:
  - Price manipulation simulation
  - Attack execution pattern
  - Profit extraction mechanism
- **Constructor Parameters**: 
  - `address _multiDex` (MultiDEX contract address)
  - `address _tokenA` (First token)
  - `address _tokenB` (Second token)
- **Dependencies**: IMultiDEX interface, OpenZeppelin IERC20
- **⚠️ Warning**: Educational/testing contract - DO NOT deploy to mainnet
- **Network**: Test networks only

### 5. **FrontRunnerSim.sol**
- **Location**: `scaffold-eth/packages/hardhat/contracts/FrontRunnerSim.sol`
- **Type**: Front-running Simulation Contract
- **Purpose**: Simulates front-running attacks for testing SwapGuard defenses
- **Key Features**:
  - Attack pattern simulation
  - Defense mechanism testing
- **Constructor Parameters**: Same as FrontRunner.sol
- **⚠️ Warning**: Educational/testing contract - DO NOT deploy to mainnet
- **Network**: Test networks only

### 6. **MultiDEXold.sol**
- **Location**: `scaffold-eth/packages/hardhat/contracts/MultiDEXold.sol`
- **Type**: Legacy DEX Contract
- **Purpose**: Previous version of MultiDEX (deprecated)
- **Status**: ⚠️ DEPRECATED - Use MultiDEX.sol instead

---

## 🔧 Token Contracts (ERC20)

### 1. **WETH.sol** (Wrapped ETH)
- **Location**: `scaffold-eth/packages/hardhat/contracts/WETH.sol`
- **Type**: ERC20 Token
- **Purpose**: Wrapped Ethereum token for DEX liquidity
- **Features**: Standard ERC20 with wrap/unwrap functionality

### 2. **USDC.sol** (USD Coin)
- **Location**: `scaffold-eth/packages/hardhat/contracts/USDC.sol`
- **Type**: ERC20 Token
- **Purpose**: Stablecoin token for liquidity pairs
- **Features**: Standard ERC20 stablecoin implementation

### 3. **WFLR.sol** (Wrapped Flare)
- **Location**: `scaffold-eth/packages/hardhat/contracts/WFLR.sol`
- **Type**: ERC20 Token
- **Purpose**: Wrapped Flare token for Flare network compatibility
- **Features**: Standard ERC20 with Flare network integration

---

## 📚 Additional Contracts by Folder

### Foundry Folder (`foundry/src/`)
- **MultiDEX.sol**: Foundry version of MultiDEX
- **DEX.sol**: Foundry version of DEX
- **SwapGuard.sol**: Foundry version of SwapGuard
- **Counter.sol**: Example counter contract (for testing)

### DEX-Contracts Folder (`dex-contracts/contracts/`)
- **DEX.sol**: Initial DEX implementation
- **CircuitBreaker.sol**: Circuit breaker safety mechanism

---

## 🚀 Remix IDE Deployment Steps

### Deployment Order (Recommended):

1. **Deploy Token Contracts First**:
   - Deploy WETH.sol
   - Deploy USDC.sol
   - Deploy WFLR.sol
   - Save the contract addresses

2. **Deploy Core DEX**:
   - Deploy MultiDEX.sol
   - Save the MultiDEX address

3. **Deploy Oracle/Guardian**:
   - Deploy SwapGuard.sol

4. **Deploy Liquidity Pool**:
   - Deploy DEX.sol with WETH token address

5. **Deploy Testing Contracts** (testnet only):
   - Deploy FrontRunner.sol with (MultiDEX, WETH, USDC addresses)
   - Deploy FrontRunnerSim.sol with same parameters

### Network Configuration for Remix:
```
Network: Flare Coston2 Testnet
RPC: https://coston2-api.flare.network/ext/C/rpc
Chain ID: 114
```

---

## 📋 Contract Dependencies Map

```
├── WETH.sol (standalone ERC20)
├── USDC.sol (standalone ERC20)
├── WFLR.sol (standalone ERC20)
│
├── MultiDEX.sol
│   ├── Depends on: IERC20, Flare interfaces
│   └── Used by: DEX, FrontRunner
│
├── DEX.sol
│   ├── Depends on: ERC20, WETH
│   └── Standalone liquidity pool
│
├── SwapGuard.sol
│   ├── Depends on: Flare FTSO Registry
│   └── Used as: Oracle/guardian for MultiDEX
│
├── FrontRunner.sol ⚠️ TEST ONLY
│   ├── Depends on: MultiDEX, WETH, USDC
│   └── Purpose: Attack simulation
│
└── FrontRunnerSim.sol ⚠️ TEST ONLY
    ├── Depends on: MultiDEX, WETH, USDC
    └── Purpose: Defense testing
```

---

## 🔐 Security Notes

1. **Verify Flare Network Integration**: SwapGuard and MultiDEX require Flare network FTSO registry access
2. **Token Approval**: Token contracts must approve DEX contracts before swaps
3. **Liquidity Initialization**: DEX.sol requires initial liquidity before trading
4. **Test Extensively**: Use Coston2 testnet before mainnet deployment
5. **Front-Running Contracts**: FrontRunner.sol and FrontRunnerSim.sol are for testing only

---

## 📝 Deployed Contract Addresses

| Contract | Address |
|----------|---------|
| **WETH.sol** | `0x7EF7C01051fEA0664ca3aa834934B46493905f19` |
| **USDC.sol** | `0xa47a8F4032bcAa9E6613546D2B2B3A37E19853c7` |
| **WFLR.sol** | `0xaCA7cC72e45B9c198Ab50A6Dd27609a750437694` |
| **MultiDEX.sol** | `0x86B31797B79cF963a5fCD5451753289CF7668fD4` |
| **DEX.sol** | `0xecE08aE9faa1Fb4bB222Bd5c25578b51c59189cf` |
| **SwapGuard.sol** | `0xf7265BBeAd290f2Ff8CF2E3d0291ca837B5Eb4FA` |
| **FrontRunner.sol** | `0xf43295119749CC3055f3D5591a1d1ef48d2D2aFE` |
| **FrontRunnerSim.sol** | `0x87345494fe7F06f73c88e6e0069cB7cBDb33Feb7` |
| **CircuitBreaker.sol** | `0x158539ED915830ab0d0b5feC55CE68E1e2A32350` |

---

## 📋 Constructor Parameters Quick Reference

| Contract | Parameters | Example |
|----------|-----------|---------|
| **MultiDEX.sol** | None | - |
| **DEX.sol** | `_token` (address) | `0x7EF7C01051fEA0664ca3aa834934B46493905f19` (WETH) |
| **SwapGuard.sol** | None | - |
| **FrontRunner.sol** | `_multiDex`, `_tokenA`, `_tokenB` | `0x86B31797B79cF963a5fCD5451753289CF7668fD4`, `0x7EF7C01051fEA0664ca3aa834934B46493905f19`, `0xa47a8F4032bcAa9E6613546D2B2B3A37E19853c7` |
| **FrontRunnerSim.sol** | `_multiDex`, `_tokenA`, `_tokenB` | `0x86B31797B79cF963a5fCD5451753289CF7668fD4`, `0x7EF7C01051fEA0664ca3aa834934B46493905f19`, `0xa47a8F4032bcAa9E6613546D2B2B3A37E19853c7` |
| **WETH.sol** | None | - |
| **USDC.sol** | None | - |
| **WFLR.sol** | None | - |

---

## 🔗 Useful Resources

- **Remix IDE**: https://remix.ethereum.org
- **Flare Network Docs**: https://docs.flare.network
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts
- **Coston2 Faucet**: https://coston2-faucet.flare.network

---

## ✅ Pre-Deployment Checklist

- [ ] Review all contract code in Remix
- [ ] Compile contracts successfully
- [ ] Have testnet funds (Coston2)
- [ ] Save deployment addresses
- [ ] Initialize liquidity pools
- [ ] Test swap functionality
- [ ] Verify oracle price feeds
- [ ] Audit security considerations
