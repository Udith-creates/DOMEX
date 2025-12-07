# CircuitBreaker Integration Guide

## Deployed Contract

**Address**: `0x158539ED915830ab0d0b5feC55CE68E1e2A32350`  
**Network**: Flare Coston2 Testnet (Chain ID: 114)  
**Block Explorer**: https://coston2-explorer.flare.network/address/0x158539ED915830ab0d0b5feC55CE68E1e2A32350

---

## Quick Test Your Deployment

```bash
cd dex-contracts
npx hardhat run scripts/testDeployedCircuitBreaker.js --network coston2
```

This will:
- ✅ Verify the contract is deployed
- ✅ Read all contract parameters
- ✅ Check if you're the owner
- ✅ Test protected contract management
- ✅ Test security parameters
- ✅ Verify operational status

---

## Integration Steps

### Step 1: Register Your DEX as Protected Contract

```javascript
// As the owner, call:
await circuitBreaker.addProtectedContracts([DEX_ADDRESS])

// Example:
await circuitBreaker.addProtectedContracts([
  "0x86B31797B79cF963a5fCD5451753289CF7668fD4"  // Your MultiDEX address
])
```

### Step 2: Add Security Parameters for Each Token Pair

```javascript
// Create identifier for token pair
const pairId = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("WETH_USDC")
)

// Add security parameter
await circuitBreaker.addSecurityParameter(
  pairId,
  5000,                              // 50% min liquidity (in basis points)
  ethers.utils.parseEther("10000"),  // Trigger threshold
  settlementModuleAddress            // Address to call when triggered
)
```

### Step 3: Integrate CircuitBreaker Calls into Your DEX

In your DEX contract's swap/deposit/withdrawal functions:

```solidity
// When increasing liquidity/parameter
bool triggered = circuitBreaker.increaseParameter(
  pairIdentifier,
  amount,
  address(this),
  0,
  ""
);

if (triggered) {
  // Handle emergency - circuit breaker was triggered
  // The settlement module's prevent() function is automatically called
  revert("CircuitBreaker triggered - operation prevented");
}

// When decreasing liquidity/parameter
bool triggered = circuitBreaker.decreaseParameter(
  pairIdentifier,
  amount,
  address(this),
  0,
  ""
);

if (triggered) {
  // Handle emergency situation
  revert("CircuitBreaker triggered - withdrawal prevented");
}
```

### Step 4: Optional - Set Up Grace Period

If you want a safety window before rate limiting kicks in:

```javascript
const now = Math.floor(Date.now() / 1000);
const gracePeriodEnd = now + (2 * 24 * 60 * 60); // 2 days from now

await circuitBreaker.startGracePeriod(gracePeriodEnd)
```

---

## Contract Parameters (Current Settings)

| Parameter | Value | Duration |
|-----------|-------|----------|
| **Rate Limit Cooldown** | 3600 seconds | 1 hour |
| **Withdrawal Period** | 172800 seconds | 2 days |
| **Liquidity Tick Length** | 600 seconds | 10 minutes |

These parameters mean:
- CircuitBreaker tracks liquidity changes for **2 days**
- Changes are grouped in **10-minute buckets**
- You must wait **1 hour** before manually overriding a triggered limit

---

## Key Functions Reference

### Owner-Only Functions

```javascript
// Add contracts that can call the circuit breaker
addProtectedContracts(address[] contracts)

// Remove protected contracts
removeProtectedContracts(address[] contracts)

// Add limits for a token pair
addSecurityParameter(
  bytes32 identifier,
  uint256 minLiqRetainedBps,      // e.g., 5000 = 50%
  uint256 limitBeginThreshold,    // e.g., parseEther("10000")
  address settlementModule        // Contract to handle emergencies
)

// Update existing security parameters
updateSecurityParameter(
  bytes32 identifier,
  uint256 minLiqRetainedBps,
  uint256 limitBeginThreshold,
  address settlementModule
)

// Pause/unpause the circuit breaker
setCircuitBreakerOperationalStatus(bool status)

// Set a grace period (no rate limiting within this window)
startGracePeriod(uint256 endTimestamp)

// Manually override a triggered rate limit (after cooldown)
overrideRateLimit(bytes32 identifier)
```

### Protected Contract Functions (Called from Your DEX)

```javascript
// Call when increasing liquidity/deposits
increaseParameter(
  bytes32 identifier,
  uint256 amount,
  address settlementTarget,       // Usually address(this)
  uint256 settlementValue,        // Usually 0
  bytes memory settlementPayload  // Usually ""
) returns (bool triggered)

// Call when decreasing liquidity/withdrawals
decreaseParameter(
  bytes32 identifier,
  uint256 amount,
  address settlementTarget,
  uint256 settlementValue,
  bytes memory settlementPayload
) returns (bool triggered)
```

### View Functions (Anyone Can Call)

```javascript
// Check if a contract is protected
isProtectedContract(address contract) returns (bool)

// Check if circuit breaker is operational
isOperational() returns (bool)

// Check global rate limit status
isRateLimited() returns (bool)

// Check if specific parameter is rate limited
isParameterRateLimited(bytes32 identifier) returns (bool)

// Check if currently in grace period
isInGracePeriod() returns (bool)

// Get liquidity changes at specific timestamp
liquidityChanges(bytes32 identifier, uint256 timestamp)
  returns (uint256 nextTimestamp, int256 amount)
```

---

## Testing Your Integration

### Test 1: Verify Setup
```javascript
const isProtected = await circuitBreaker.isProtectedContract(dexAddress);
console.log("DEX is protected:", isProtected); // Should be true

const isRateLimited = await circuitBreaker.isParameterRateLimited(pairId);
console.log("Pair is rate limited:", isRateLimited); // Should be false initially
```

### Test 2: Simulate Large Deposit
```javascript
// Make a large deposit that exceeds threshold
// Should trigger circuit breaker if conditions met

const amount = ethers.utils.parseEther("50000");
const tx = await dex.addLiquidity(amount);
const receipt = await tx.wait();

// Check if rate limit was triggered
const isRateLimited = await circuitBreaker.isParameterRateLimited(pairId);
console.log("Rate limited after large deposit:", isRateLimited);
```

### Test 3: Test Recovery
```javascript
// Wait for cooldown period (1 hour in test params)
// Then override the rate limit

await circuitBreaker.overrideRateLimit(pairId);

// Verify it's no longer rate limited
const isRateLimited = await circuitBreaker.isParameterRateLimited(pairId);
console.log("Rate limited after override:", isRateLimited); // Should be false
```

---

## Troubleshooting

### Error: "CircuitBreaker__NotAProtectedContract"
**Cause**: You're calling the circuit breaker from a contract that wasn't added  
**Fix**: Register your DEX with `addProtectedContracts()`

### Error: "CircuitBreaker__NotOperational"
**Cause**: Circuit breaker is paused  
**Fix**: Call `setCircuitBreakerOperationalStatus(true)`

### Error: "CircuitBreaker__CooldownPeriodNotReached"
**Cause**: You tried to override too soon after triggering  
**Fix**: Wait 1 hour (3600 seconds) before calling `overrideRateLimit()`

### Error: "CircuitBreaker__InvalidGracePeriodEnd"
**Cause**: Grace period timestamp is in the past  
**Fix**: Set timestamp to a future time: `Math.floor(Date.now()/1000) + duration`

---

## Monitoring

### Check Circuit Breaker Status

```javascript
async function checkCircuitBreakerStatus() {
  const isOperational = await circuitBreaker.isOperational();
  const isRateLimited = await circuitBreaker.isRateLimited();
  const inGracePeriod = await circuitBreaker.isInGracePeriod();
  
  console.log({
    operational: isOperational,
    rateLimited: isRateLimited,
    inGracePeriod: inGracePeriod,
    timestamp: Math.floor(Date.now() / 1000)
  });
}
```

### Monitor Token Pair Status

```javascript
async function checkTokenPairStatus(pairId) {
  const isRateLimited = await circuitBreaker.isParameterRateLimited(pairId);
  const currentTime = Math.floor(Date.now() / 1000);
  const changes = await circuitBreaker.liquidityChanges(pairId, currentTime);
  
  console.log({
    pairId: pairId,
    rateLimited: isRateLimited,
    nextTimestamp: changes.nextTimestamp,
    amount: changes.amount
  });
}
```

---

## Deployment Checklist

- [ ] CircuitBreaker deployed at `0x158539ED915830ab0d0b5feC55CE68E1e2A32350`
- [ ] DEX contract added as protected contract
- [ ] Security parameters added for all token pairs
- [ ] Settlement module configured (if using custom settlement)
- [ ] Grace period set (if needed)
- [ ] Tested `increaseParameter()` calls
- [ ] Tested `decreaseParameter()` calls
- [ ] Verified rate limit triggers work
- [ ] Tested override mechanism
- [ ] Frontend configured to handle circuit breaker triggers
- [ ] User documentation updated

---

## What Happens When Circuit Breaker Triggers

1. **Detection**: Liquidity drops below minimum threshold
2. **Trigger**: `increaseParameter()` or `decreaseParameter()` returns `true`
3. **Execution**: Settlement module's `prevent()` function is called automatically
4. **Stop**: Transaction is reverted or operation is blocked
5. **Recovery**: 
   - After 1 hour cooldown: Call `overrideRateLimit()` to re-enable
   - Or: Adjust parameters with `updateSecurityParameter()`

---

## Next Steps

1. **Test the deployment**: Run `testDeployedCircuitBreaker.js`
2. **Integrate with DEX**: Add circuit breaker calls to swap functions
3. **Set up monitoring**: Watch for rate limit triggers
4. **Plan recovery**: Implement settlement module or manual recovery process
5. **User communication**: Inform users about circuit breaker protection

---

**Support**: If you need help integrating, review the test files:
- `scripts/testDeployedCircuitBreaker.js` - Comprehensive testing
- `scripts/deployCircuitBreaker.js` - Deployment reference
- `test/CircuitBreaker.test.js` - Unit tests with examples
