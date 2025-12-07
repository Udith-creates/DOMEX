const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FTSO Circuit Breaker...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy FTSOCircuitBreaker
  const FTSOCircuitBreaker = await hre.ethers.getContractFactory("FTSOCircuitBreaker");
  const circuitBreaker = await FTSOCircuitBreaker.deploy(deployer.address);
  await circuitBreaker.waitForDeployment();

  const cbAddress = await circuitBreaker.getAddress();
  console.log("✅ FTSOCircuitBreaker deployed at:", cbAddress);

  // Deploy DEXWithCircuitBreaker example
  const DEXWithCircuitBreaker = await hre.ethers.getContractFactory("DEXWithCircuitBreaker");
  const dex = await DEXWithCircuitBreaker.deploy(cbAddress);
  await dex.waitForDeployment();

  const dexAddress = await dex.getAddress();
  console.log("✅ DEXWithCircuitBreaker deployed at:", dexAddress);

  // Configure the circuit breaker
  console.log("\n📋 Configuring Circuit Breaker...");

  // Add DEX as protected contract
  const addTx = await circuitBreaker.addProtectedContract(dexAddress);
  await addTx.wait();
  console.log("✅ DEX added as protected contract");

  // Set token thresholds (5% volatility threshold)
  const tokens = [
    { symbol: "FLR", threshold: 500 }, // 5% = 500 basis points
    { symbol: "USDC", threshold: 300 }, // 3% threshold for stablecoin
    { symbol: "BTC", threshold: 1000 }, // 10% threshold for volatile asset
    { symbol: "ETH", threshold: 800 }, // 8% threshold
  ];

  for (const token of tokens) {
    const tx = await circuitBreaker.setTokenThreshold(token.symbol, token.threshold);
    await tx.wait();
    console.log(`✅ Set ${token.symbol} threshold to ${token.threshold} bps (${(token.threshold / 100).toFixed(2)}%)`);
  }

  // Set recovery cooldown to 1 hour
  const cooldownTx = await circuitBreaker.setRecoveryCooldownPeriod(3600);
  await cooldownTx.wait();
  console.log("✅ Recovery cooldown set to 1 hour");

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log("Circuit Breaker Address:", cbAddress);
  console.log("DEX Address:", dexAddress);
  console.log("Deployer:", deployer.address);
  console.log("\n📖 Configuration:");
  console.log("- FLR: 5% volatility threshold");
  console.log("- USDC: 3% volatility threshold (stablecoin)");
  console.log("- BTC: 10% volatility threshold");
  console.log("- ETH: 8% volatility threshold");
  console.log("- Recovery Cooldown: 1 hour");

  console.log("\n🧪 To test the circuit breaker:");
  console.log(`1. Swap tokens via DEX contract: swapWithProtection("FLR", "USDC", amount)`);
  console.log("2. Circuit breaker will monitor FTSO prices");
  console.log("3. If price volatility > threshold, swap will be blocked");
  console.log("4. After 1 hour cooldown, circuit breaker resets");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
