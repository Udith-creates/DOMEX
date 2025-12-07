# CircuitBreaker Testing Commands

## Quick Commands

### 1️⃣ Test Deployed Contract (Verify it works)
```bash
cd c:\Users\UDITH\Desktop\DOMEX\DOMEX\dex-contracts
npx hardhat run scripts/testDeployedCircuitBreaker.js --network coston2
```
**What it does**: Verifies contract is deployed, readable, and all functions work

---

### 2️⃣ Setup CircuitBreaker (Add DEX + Parameters)
```bash
npx hardhat run scripts/testCircuitBreakerSetup.js --network coston2
```
**What it does**:
- ✅ Adds your MultiDEX as protected contract
- ✅ Creates security parameter for WETH_USDC
- ✅ Sets grace period
- ✅ Verifies everything works

---

### 3️⃣ Deploy New CircuitBreaker (If needed)
```bash
npx hardhat run scripts/deployCircuitBreaker.js --network coston2
```
**What it does**: Deploys a fresh CircuitBreaker contract

---

### 4️⃣ Run Unit Tests (Local testing)
```bash
npx hardhat test test/CircuitBreaker.test.js
```
**What it does**: Runs comprehensive unit tests locally (no network needed)

---

## Expected Output

### After Running `testDeployedCircuitBreaker.js`

```
🔍 CircuitBreaker Deployed Contract Testing
==========================================

📍 Connected Account: 0x...
📡 Network: coston2 (Chain ID: 114)
📄 Contract Address: 0x158539ED915830ab0d0b5feC55CE68E1e2A32350

✅ TEST 1: Verify Contract Deployment
  ✓ Contract found at address

✅ TEST 2: Read Contract Parameters
  ✓ Owner: 0x...
  ✓ Is Operational: true
  ✓ Is Rate Limited: false
  ✓ Rate Limit Cooldown (seconds): 3600
  ✓ Withdrawal Period (seconds): 172800
  ✓ Tick Length (seconds): 600

✅ TEST 3: Check Owner Status
  ✓ You are the CONTRACT OWNER
  ✓ You can call owner-only functions

✅ TESTING COMPLETED SUCCESSFULLY!
```

---

### After Running `testCircuitBreakerSetup.js`

```
🚀 CircuitBreaker Complete Setup & Testing

📍 Account: 0x...
🔗 Network: Flare Coston2

👤 Owner: 0x...
🔑 You are owner: YES ✅

============================================================
✅ STEP 1: Add MultiDEX as Protected Contract
============================================================
Already protected: false
⏳ Adding MultiDEX...
✅ Added! Tx: 0x...
✓ MultiDEX is now protected: true

============================================================
✅ STEP 2: Add Security Parameters for WETH_USDC
============================================================
📝 Parameters:
  Pair ID: 0x...
  Min Liquidity: 5000 bps (50%)
  Threshold: 1000.0 tokens
  Settlement Module: 0x...

⏳ Adding security parameter...
✅ Added! Tx: 0x...
✓ Parameter rate limited status: false

============================================================
✅ ALL SETUP COMPLETED SUCCESSFULLY!
============================================================
```

---

## Testing Checklist

### ✅ Verify Deployment
- [ ] Run: `npx hardhat run scripts/testDeployedCircuitBreaker.js --network coston2`
- [ ] See: "✅ TESTING COMPLETED SUCCESSFULLY!"

### ✅ Setup CircuitBreaker
- [ ] Run: `npx hardhat run scripts/testCircuitBreakerSetup.js --network coston2`
- [ ] See: "✅ ALL SETUP COMPLETED SUCCESSFULLY!"

### ✅ Verify Integration Points
- [ ] DEX is added as protected contract
- [ ] Security parameters are set for token pairs
- [ ] Circuit breaker is operational
- [ ] Grace period is active

### ✅ Integration Testing
- [ ] Call `increaseParameter()` from DEX on large deposit
- [ ] Call `decreaseParameter()` from DEX on withdrawal
- [ ] Verify rate limit triggers correctly
- [ ] Test override after cooldown

### ✅ Production Ready
- [ ] Update deployment documentation
- [ ] Test with real liquidity amounts
- [ ] Implement settlement module
- [ ] Update frontend to handle triggers
- [ ] Commit to GitHub

---

## Troubleshooting Commands

### Check if you're the owner
```bash
npx hardhat run -c "
const hre = require('hardhat');
const ethers = hre.ethers;
const CB = new ethers.Contract(
  '0x158539ED915830ab0d0b5feC55CE68E1e2A32350',
  ['function owner() view returns (address)'],
  ethers.provider
);
async function main() {
  const owner = await CB.owner();
  console.log('Owner:', owner);
  console.log('You:', (await ethers.getSigners())[0].address);
}
main();
" --network coston2
```

### Check if DEX is protected
```bash
npx hardhat run -c "
const hre = require('hardhat');
const ethers = hre.ethers;
const CB = new ethers.Contract(
  '0x158539ED915830ab0d0b5feC55CE68E1e2A32350',
  ['function isProtectedContract(address) view returns (bool)'],
  ethers.provider
);
async function main() {
  const protected = await CB.isProtectedContract('0x86B31797B79cF963a5fCD5451753289CF7668fD4');
  console.log('DEX is protected:', protected);
}
main();
" --network coston2
```

### Check operational status
```bash
npx hardhat run -c "
const hre = require('hardhat');
const ethers = hre.ethers;
const CB = new ethers.Contract(
  '0x158539ED915830ab0d0b5feC55CE68E1e2A32350',
  ['function isOperational() view returns (bool)'],
  ethers.provider
);
async function main() {
  const operational = await CB.isOperational();
  console.log('Is operational:', operational);
}
main();
" --network coston2
```

---

## Contract Address Reference

**CircuitBreaker**: `0x158539ED915830ab0d0b5feC55CE68E1e2A32350`  
**Network**: Flare Coston2 (Chain ID: 114)  
**Explorer**: https://coston2-explorer.flare.network/address/0x158539ED915830ab0d0b5feC55CE68E1e2A32350

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Only owner can call" | Make sure you're using owner account |
| Transaction fails | Check account has FLR balance for gas |
| "Contract not found" | Verify address on block explorer |
| Rate limit not triggering | Check if parameters are set correctly |
| Can't override | Wait 1 hour (cooldown period) |

---

## Next: Integrate with Your DEX

Once setup is complete, integrate into your MultiDEX contract:

```solidity
// In your swap/deposit function
bool triggered = ICircuitBreaker(circuitBreakerAddress).increaseParameter(
  tokenPairId,
  depositAmount,
  address(this),
  0,
  ""
);

require(!triggered, "Circuit breaker triggered");
```

---

**Questions?** Check the full guides:
- `CIRCUITBREAKER_INTEGRATION_GUIDE.md` - Complete integration reference
- `CIRCUITBREAKER_TESTING_GUIDE.md` - Parameter explanations
