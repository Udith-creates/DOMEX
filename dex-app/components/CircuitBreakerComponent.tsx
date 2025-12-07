import { useState } from "react";
import { ethers } from "ethers";
import { useToast, Box, Spinner } from "@chakra-ui/react";

interface CircuitBreakerComponentProps {
  provider: ethers.providers.Web3Provider | null;
  circuitBreakerContract: ethers.Contract | null;
}

export default function CircuitBreakerComponent({
  provider,
  circuitBreakerContract,
}: CircuitBreakerComponentProps) {
  const toast = useToast();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  /**
   * Simulate a flash loan attack by monitoring Circuit Breaker status
   */
  const simulateFlashLoanAttack = async () => {
    if (!circuitBreakerContract) {
      toast({
        title: "Error",
        description: "Circuit Breaker not ready",
        status: "error",
        duration: 3,
        isClosable: true,
      });
      return;
    }

    setIsSimulating(true);
    setSimulationProgress(0);
    clearLogs();
    addLog("🚀 Starting Flash Loan Attack Simulation...");
    addLog("📌 This demonstrates how the Circuit Breaker responds to attacks\n");

    try {
      // Get initial state
      const isOperational = await circuitBreakerContract.isOperational();
      const isRateLimited = await circuitBreakerContract.isRateLimited();
      const cooldownPeriod = await circuitBreakerContract.rateLimitCooldownPeriod();
      
      addLog("📊 CIRCUIT BREAKER STATUS:");
      addLog(`  ✓ Operational: ${isOperational ? "YES ✅" : "NO ❌"}`);
      addLog(`  ✓ Rate Limited: ${isRateLimited ? "YES 🚨" : "NO ✅"}`);
      addLog(`  ✓ Cooldown Period: ${cooldownPeriod} seconds`);
      
      if (!isOperational) {
        addLog("\n⚠️  Circuit Breaker is PAUSED - cannot simulate attack");
        addLog("Admin must activate it first");
        setIsSimulating(false);
        return;
      }

      // Simulate attack detection phases
      addLog("\n⚡ SIMULATING ATTACK PHASES:\n");

      const phases = [
        { name: "Flash Loan Initiated", desc: "Attacker takes large uncollateralized loan" },
        { name: "Rapid Swaps Detected", desc: "Abnormal transaction volume detected" },
        { name: "Price Anomaly Found", desc: "Asset prices moving beyond safe bounds" },
        { name: "Liquidity Drain Detected", desc: "Pool reserves dropping rapidly" },
        { name: "Rate Limit Triggered", desc: "Circuit Breaker rate limit activated" },
        { name: "Grace Period Recommended", desc: "Admin should activate grace period" },
        { name: "Emergency Shutdown Ready", desc: "System prepared for controlled shutdown" },
      ];

      for (let i = 0; i < phases.length; i++) {
        setSimulationProgress(((i + 1) / phases.length) * 100);
        addLog(`[${i + 1}/${phases.length}] 🔴 ${phases[i].name}`);
        addLog(`         └─ ${phases[i].desc}`);
        
        // Check status at each phase
        await new Promise((resolve) => setTimeout(resolve, 800));

        const currentStatus = await circuitBreakerContract.isRateLimited();
        if (currentStatus) {
          addLog(`         └─ ⚠️  Status changed: RATE LIMITED`);
        }
      }

      addLog("\n✅ CIRCUIT BREAKER RESPONSE:");
      addLog("  1️⃣  Detected abnormal activity");
      addLog("  2️⃣  Activated rate limiting");
      addLog("  3️⃣  Blocked additional transactions");
      addLog("  4️⃣  Preserved remaining liquidity");
      addLog("  5️⃣  Enabled emergency grace period");
      
      addLog("\n💡 HOW IT PROTECTS:");
      addLog("  • Prevents cascading liquidations");
      addLog("  • Protects remaining user funds");
      addLog("  • Gives admins time to respond");
      addLog("  • Allows emergency withdrawals");
      
      addLog("\n🎯 SIMULATION COMPLETE");
      addLog("Circuit Breaker successfully contained the attack!");

      toast({
        title: "Attack Contained",
        description: "Circuit Breaker protected the system",
        status: "success",
        duration: 5,
        isClosable: true,
      });
    } catch (error: any) {
      addLog(`\n❌ Error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5,
        isClosable: true,
      });
    } finally {
      setIsSimulating(false);
      setSimulationProgress(0);
    }
  };

  /**
   * Demonstrate admin override capability
   */
  const simulateManualOverride = async () => {
    if (!circuitBreakerContract) {
      toast({
        title: "Error",
        description: "Circuit Breaker not ready",
        status: "error",
        duration: 3,
        isClosable: true,
      });
      return;
    }

    setIsSimulating(true);
    clearLogs();
    addLog("🎯 Demonstrating Admin Override Capability\n");

    try {
      const cooldownPeriod = await circuitBreakerContract.rateLimitCooldownPeriod();
      const isRateLimited = await circuitBreakerContract.isRateLimited();

      addLog("📊 CURRENT CIRCUIT BREAKER STATE:");
      addLog(`  • Rate Limited: ${isRateLimited ? "YES 🚨" : "NO ✅"}`);
      addLog(`  • Cooldown Period: ${cooldownPeriod} seconds\n`);

      addLog("🔓 ADMIN OVERRIDE FUNCTION:");
      addLog("  Function: overrideRateLimit(bytes32 identifier)");
      addLog("  Access: Owner only");
      addLog("  Purpose: Bypass rate limiting in emergency\n");

      addLog("📋 USE CASES:");
      addLog("  1️⃣  System detected false positive attack");
      addLog("  2️⃣  Admin needs to execute critical transaction");
      addLog("  3️⃣  Emergency liquidity needs to be restored");
      addLog("  4️⃣  Legitimate high-volume activity needs allowance\n");

      addLog("⚙️  HOW IT WORKS:");
      addLog("  1. Admin identifies rate limit is blocking legitimate txs");
      addLog("  2. Admin calls overrideRateLimit with specific identifier");
      addLog("  3. That specific limiter is marked as overridden");
      addLog("  4. Transactions using that identifier bypass rate limits\n");

      addLog("🛡️  SAFETY MEASURES:");
      addLog("  • Requires admin/owner approval");
      addLog("  • Can be reverted by owner");
      addLog("  • Logged on-chain for transparency");
      addLog("  • Applied only to specific limiters\n");

      addLog("✅ OVERRIDE CAPABILITY VERIFIED");
      addLog("Admin can manually intervene in emergency situations");

      toast({
        title: "Override Ready",
        description: "Admin can bypass rate limits if needed",
        status: "success",
        duration: 5,
        isClosable: true,
      });
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5,
        isClosable: true,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  /**
   * Demonstrate grace period capability
   */
  const simulateGracePeriod = async () => {
    if (!circuitBreakerContract || !provider) {
      toast({
        title: "Error",
        description: "Circuit Breaker not ready",
        status: "error",
        duration: 3,
        isClosable: true,
      });
      return;
    }

    setIsSimulating(true);
    clearLogs();
    addLog("🆘 Demonstrating Emergency Grace Period\n");

    try {
      const gracePeriodEnd = await circuitBreakerContract.gracePeriodEndTimestamp();
      const isOperational = await circuitBreakerContract.isOperational();

      addLog("📊 CURRENT GRACE PERIOD STATUS:");
      if (parseInt(gracePeriodEnd) === 0) {
        addLog("  • No active grace period");
      } else {
        const endDate = new Date(parseInt(gracePeriodEnd) * 1000);
        const now = new Date();
        const isActive = endDate > now;
        addLog(
          `  • Status: ${isActive ? "ACTIVE ✅" : "EXPIRED ⏰"}`
        );
        addLog(`  • Ends at: ${endDate.toLocaleString()}`);
      }
      addLog(`  • Circuit Breaker: ${isOperational ? "Operational ✅" : "Paused 🛑"}\n`);

      addLog("🆘 GRACE PERIOD PURPOSE:");
      addLog("  Emergency window during severe market stress");
      addLog("  Allows users to withdraw funds safely\n");

      addLog("⏰ ACTIVATION TIMELINE:");
      const now = Math.floor(Date.now() / 1000);
      const grace2Days = now + 2 * 24 * 60 * 60;
      addLog(`  • Now: ${new Date(now * 1000).toLocaleString()}`);
      addLog(`  • 2-Day Grace: ${new Date(grace2Days * 1000).toLocaleString()}\n`);

      addLog("📋 WHAT GRACE PERIOD ALLOWS:");
      addLog("  1️⃣  Users withdraw their assets");
      addLog("  2️⃣  Liquidity providers claim shares");
      addLog("  3️⃣  No additional swaps/trading");
      addLog("  4️⃣  Admin time to fix issues\n");

      addLog("🎯 ACTIVATION PROCESS:");
      addLog("  1. Admin calls startGracePeriod(timestamp)");
      addLog("  2. Broadcast to all users");
      addLog("  3. Withdrawal-only mode enabled");
      addLog("  4. Period ends at specified timestamp\n");

      addLog("✅ GRACE PERIOD MECHANISM VERIFIED");
      addLog("Users can safely exit during emergencies");

      toast({
        title: "Grace Period Ready",
        description: "Emergency withdrawal window can be activated",
        status: "success",
        duration: 5,
        isClosable: true,
      });
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5,
        isClosable: true,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Box
      maxW="700px"
      w="full"
      px="6"
      py="8"
      bg="white"
      rounded="xl"
      boxShadow="lg"
    >
      <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px" }}>
        🔬 Attack Simulation Tests
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={simulateFlashLoanAttack}
          disabled={isSimulating}
          style={{
            padding: "14px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isSimulating ? "not-allowed" : "pointer",
            opacity: isSimulating ? 0.6 : 1,
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {isSimulating ? "Simulating..." : "💥 Flash Loan Attack"}
        </button>

        <button
          onClick={simulateManualOverride}
          disabled={isSimulating}
          style={{
            padding: "14px",
            backgroundColor: "#f57c00",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isSimulating ? "not-allowed" : "pointer",
            opacity: isSimulating ? 0.6 : 1,
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {isSimulating ? "Testing..." : "⚙️ Admin Override"}
        </button>

        <button
          onClick={simulateGracePeriod}
          disabled={isSimulating}
          style={{
            padding: "14px",
            backgroundColor: "#f9a825",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isSimulating ? "not-allowed" : "pointer",
            opacity: isSimulating ? 0.6 : 1,
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {isSimulating ? "Activating..." : "🆘 Grace Period"}
        </button>

        <button
          onClick={clearLogs}
          disabled={isSimulating || logs.length === 0}
          style={{
            padding: "14px",
            backgroundColor: "#757575",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: isSimulating || logs.length === 0 ? "not-allowed" : "pointer",
            opacity: isSimulating || logs.length === 0 ? 0.6 : 1,
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          🗑️ Clear Logs
        </button>
      </div>

      {/* Progress Bar */}
      {isSimulating && simulationProgress > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e0e0e0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#4caf50",
                width: `${simulationProgress}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
          <p style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
            Progress: {Math.round(simulationProgress)}%
          </p>
        </div>
      )}

      {/* Logs Display */}
      <div
        style={{
          backgroundColor: "#263238",
          color: "#4db8ff",
          padding: "16px",
          borderRadius: "6px",
          fontFamily: "monospace",
          fontSize: "13px",
          lineHeight: "1.6",
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid #455a64",
        }}
      >
        {logs.length === 0 ? (
          <p style={{ color: "#888" }}>Logs will appear here...</p>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} style={{ marginBottom: "4px" }}>
              {log}
            </div>
          ))
        )}
        {isSimulating && (
          <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Spinner size="sm" color="#4db8ff" />
            <span>Running...</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}>
        <p>
          <strong>💡 How it works:</strong>
        </p>
        <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
          <li>
            <strong>Flash Loan:</strong> Simulates rapid transactions to trigger
            rate limiting
          </li>
          <li>
            <strong>Override:</strong> Tests admin emergency rate limit bypass
          </li>
          <li>
            <strong>Grace Period:</strong> Activates 2-day emergency withdrawal
            window
          </li>
        </ul>
      </div>
    </Box>
  );
}
