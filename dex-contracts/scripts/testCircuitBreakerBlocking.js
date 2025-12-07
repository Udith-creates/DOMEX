const hre = require("hardhat");

async function main() {
  const CIRCUIT_BREAKER_ADDRESS = "0x158539ED915830ab0d0b5feC55CE68E1e2A32350";
  const CB_ABI = require("../artifacts/contracts/CircuitBreaker.sol/CircuitBreaker.json").abi;

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Connect to CircuitBreaker
  const cb = new hre.ethers.Contract(CIRCUIT_BREAKER_ADDRESS, CB_ABI, signer);

  // Step 1: Check initial state
  console.log("\n=== STEP 1: Check Initial State ===");
  const isOperational = await cb.isOperational();
  const isRateLimited = await cb.isRateLimited();
  console.log("Is Operational:", isOperational);
  console.log("Is Rate Limited:", isRateLimited);

  if (!isOperational) {
    console.error("❌ CircuitBreaker is not operational!");
    return;
  }

  // Step 2: Create identifier for a DEX contract
  const DEX_ADDRESS = "0x86B31797B79cF963a5fCD5451753289CF7668fD4";
  const identifier = hre.ethers.keccak256(
    hre.ethers.solidityPacked(["string", "address"], ["DEX_SWAP", DEX_ADDRESS])
  );
  console.log("\n=== STEP 2: Created Identifier ===");
  console.log("Identifier:", identifier);

  // Step 3: Trigger rate limit by calling increaseParameter multiple times
  console.log("\n=== STEP 3: Triggering Rate Limit ===");
  const amount = hre.ethers.parseEther("1");

  try {
    for (let i = 0; i < 8; i++) {
      console.log(`Calling increaseParameter (${i + 1}/8)...`);
      const tx = await cb.increaseParameter(identifier, amount);
      await tx.wait();
      console.log(`✓ Call ${i + 1} successful`);
    }
  } catch (error) {
    if (error.reason && error.reason.includes("RateLimited")) {
      console.log("✅ Rate limit triggered as expected!");
    } else {
      console.error("Error:", error.message);
      return;
    }
  }

  // Step 4: Verify rate limited state
  console.log("\n=== STEP 4: Verify Rate Limit Active ===");
  const rateLimitedAfter = await cb.isRateLimited();
  console.log("Is Rate Limited:", rateLimitedAfter);

  if (rateLimitedAfter) {
    console.log("✅ CircuitBreaker is BLOCKING transactions as expected!");
  }

  // Step 5: Check cooldown time
  console.log("\n=== STEP 5: Rate Limit Cooldown Info ===");
  const cooldownPeriod = await cb.rateLimitCooldownPeriod();
  const lastRateLimitTime = await cb.lastRateLimitTimestamp();
  console.log("Cooldown Period:", cooldownPeriod.toString(), "seconds");
  console.log("Last Rate Limit Timestamp:", lastRateLimitTime.toString());
  console.log("Will reset after:", new Date((Number(lastRateLimitTime) + Number(cooldownPeriod)) * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
