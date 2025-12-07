s# CircuitBreaker Testing Guide - 2 Day Period

## Quick Start

### Parameters for 2-Day Testing

```
_rateLimitCooldownPeriod: 3600        (1 hour)
_withdrawalPeriod: 172800             (2 days)
_liquidityTickLength: 600             (10 minutes)
```

---

## What Each Parameter Does

### 1. **_rateLimitCooldownPeriod = 3600 (1 hour)**
- **Purpose**: Cooldown period before you can manually override a rate limit
- **Why 1 hour?**: For testing, you don't want to wait 24 hours between override attempts
- **In action**: If rate limit is triggered, you must wait 1 hour before calling `overrideExpiredRateLimit()`

### 2. **_withdrawalPeriod = 172800 (2 days)**
- **Purpose**: The time window for tracking liquidity changes
- **Why 2 days?**: Matches your 2-day test period so you see complete liquidity flow
- **In action**: CircuitBreaker monitors all liquidity changes within the past 2 days
- **Formula**: 172800 seconds = 48 hours

### 3. **_liquidityTickLength = 600 (10 minutes)**
- **Purpose**: Time buckets for organizing liquidity change data
- **Why 10 minutes?**: Granular enough to catch patterns, not too noisy
- **In action**: Every 10 minutes, the system creates a new "tick" for tracking changes
- **Formula**: 600 seconds = 10 minutes

---

## Testing Timeline

With these parameters, here's what to expect:

| Time | What Happens |
|------|--------------|
| **T+0** | Deploy CircuitBreaker |
| **T+10min** | First liquidity tick created |
| **T+20min** | Second tick created |
| **T+1hr** | Can override rate limit if triggered |
| **T+2days** | Test window completes |

---

## How to Deploy

### Option 1: Deploy to Local Hardhat Network
```bash
cd dex-contracts
npx hardhat run scripts/testCircuitBreaker.js
```
This deploys AND runs all tests locally (fastest)

### Option 2: Deploy to Coston2 Testnet
```bash
# Make sure you have FLR tokens in your account
npx hardhat run scripts/deployCircuitBreaker.js --network coston2
```
This deploys to Flare testnet (persistent)

---

## What to Test

### Essential Tests ✅
1. **Add Protected Contracts** - Register your DEX contract
2. **Add Security Parameters** - Set limits for tokens
3. **Grace Period** - Allow operations within safety window
4. **Rate Limit Triggers** - Verify limits work
5. **Override Rate Limit** - Test manual recovery

### Example Test Flow
```javascript
// 1. Deploy
const cb = await deploy CircuitBreaker(3600, 172800, 600, owner)

// 2. Add your DEX as protected
await cb.addProtectedContracts([dexAddress])

// 3. Add limits for a token pair
await cb.addSecurityParameter(
  tokenPairId,
  5000,                              // 50% min liquidity
  ethers.utils.parseEther("1000"),   // Trigger threshold
  settlementModuleAddress
)

// 4. Start grace period (optional safety window)
await cb.startGracePeriod(futureTimestamp)

// 5. Monitor operations
const isRateLimited = await cb.isParameterRateLimited(tokenPairId)
```

---

## Key Contract Functions

### Owner Functions (use with owner account)
```
addProtectedContracts(address[] contracts)
removeProtectedContracts(address[] contracts)
addSecurityParameter(bytes32 id, uint256 minLiq, uint256 threshold, address settlement)
updateSecurityParameter(bytes32 id, uint256 minLiq, uint256 threshold, address settlement)
setCircuitBreakerOperationalStatus(bool status)
startGracePeriod(uint256 endTimestamp)
overrideRateLimit(bytes32 identifier)
```

### Protected Contract Functions (call from DEX)
```
increaseParameter(bytes32 id, uint256 amount, address target, uint256 value, bytes data)
decreaseParameter(bytes32 id, uint256 amount, address target, uint256 value, bytes data)
```

### View Functions (anyone can call)
```
isParameterRateLimited(bytes32 identifier) returns (bool)
isInGracePeriod() returns (bool)
liquidityChanges(bytes32 identifier, uint256 tickTimestamp) returns (uint256, int256)
isProtectedContract(address contract) returns (bool)
isOperational() returns (bool)
```

---

## Troubleshooting

### Error: "CircuitBreaker__NotAProtectedContract"
**Solution**: You forgot to call `addProtectedContracts()` with your DEX address

### Error: "CircuitBreaker__NotOperational"
**Solution**: Circuit breaker is paused. Call `setCircuitBreakerOperationalStatus(true)`

### Error: "CircuitBreaker__NotRateLimited"
**Solution**: You tried to override a rate limit that isn't active

### Error: "CircuitBreaker__CooldownPeriodNotReached"
**Solution**: You tried to override too soon. Wait 1 hour after rate limit triggers

---

## For Integration with Your DEX

After testing CircuitBreaker in isolation:

1. **Register DEX as Protected Contract**
   ```javascript
   await circuitBreaker.addProtectedContracts([DEX_ADDRESS])
   ```

2. **Add Security Parameters for Each Token Pair**
   ```javascript
   await circuitBreaker.addSecurityParameter(
     keccak256("WETH_USDC"),
     5000,  // 50% min liquidity
     parseEther("10000"),  // Trigger at 10k
     settlementModuleAddress
   )
   ```

3. **Call from DEX During Swaps**
   ```javascript
   // In your DEX swap function:
   const triggered = await circuitBreaker.increaseParameter(
     tokenPairId,
     swapAmount,
     address(this),
     0,
     ""
   )
   
   if (triggered) {
     // Handle emergency situation
     emit CircuitBreakerTriggered()
   }
   ```

---

## Success Metrics

✅ CircuitBreaker deploys without errors
✅ Can add protected contracts
✅ Can set security parameters
✅ Can verify rate limit status
✅ Can override rate limits after cooldown
✅ Grace period works as expected

**Now you're ready to test!** 🚀
