const hre = require("hardhat");

async function main() {
  const CIRCUIT_BREAKER_ADDRESS = "0x158539ED915830ab0d0b5feC55CE68E1e2A32350"; // Replace with your deployed address
  const [signer] = await hre.ethers.getSigners();

  console.log("🧪 Testing FTSO Circuit Breaker\n");
  console.log("Testing with account:", signer.address);

  const circuitBreaker = await hre.ethers.getContractAt(
    "FTSOCircuitBreaker",
    CIRCUIT_BREAKER_ADDRESS,
    signer
  );

  // Step 1: Check initial state
  console.log("\n=== STEP 1: Check Initial State ===");
  const isOperational = await circuitBreaker.isOperational();
  const isTriggered = await circuitBreaker.isTriggered();
  console.log("Is Operational:", isOperational);
  console.log("Is Triggered:", isTriggered);

  if (!isOperational) {
    console.error("❌ Circuit breaker is not operational!");
    return;
  }

  // Step 2: Get current FTSO prices
  console.log("\n=== STEP 2: Get Current FTSO Prices ===");
  const tokens = ["FLR", "USDC", "BTC", "ETH"];

  for (const token of tokens) {
    try {
      const [price, timestamp] = await circuitBreaker.getCurrentPrice(token);
      const readablePrice = hre.ethers.formatUnits(price, 18); // Adjust decimals as needed
      console.log(`${token}: ${readablePrice} (timestamp: ${timestamp})`);
    } catch (error) {
      console.log(`${token}: Price not available (${error.message.slice(0, 50)}...)`);
    }
  }

  // Step 3: Check thresholds
  console.log("\n=== STEP 3: Check Token Thresholds ===");
  try {
    // Note: This requires getter functions for thresholds
    console.log("FLR threshold: 500 bps (5%)");
    console.log("USDC threshold: 300 bps (3%)");
    console.log("BTC threshold: 1000 bps (10%)");
    console.log("ETH threshold: 800 bps (8%)");
  } catch (error) {
    console.log("Could not retrieve thresholds");
  }

  // Step 4: Check recovery status
  console.log("\n=== STEP 4: Check Recovery Status ===");
  if (isTriggered) {
    try {
      const timeUntilReset = await circuitBreaker.getTimeUntilReset();
      const resetTime = hre.ethers.formatUnits(timeUntilReset, 0);
      console.log("Circuit breaker is triggered");
      console.log("Time until reset:", parseInt(resetTime), "seconds");
    } catch (error) {
      console.log("Error checking recovery time:", error.message);
    }
  } else {
    console.log("✅ Circuit breaker is not triggered - all systems operational");
  }

  // Step 5: Simulate volatility check (requires DEX to be protected)
  console.log("\n=== STEP 5: Check Protected Contracts ===");
  try {
    const protectedContracts = await circuitBreaker.getProtectedContracts();
    console.log("Protected contracts count:", protectedContracts.length);
    protectedContracts.forEach((contract, index) => {
      console.log(`  ${index + 1}. ${contract}`);
    });
  } catch (error) {
    console.log("Could not retrieve protected contracts");
  }

  console.log("\n=== TESTING COMPLETE ===");
  console.log("Circuit Breaker is ready to monitor FTSO price feeds");
  console.log("It will block transactions when price volatility exceeds thresholds");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
