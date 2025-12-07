import Head from "next/head";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import { FASSET_ADDRESS, FASSET_ABI } from "@/const/details";
import { useContract, useProvider } from "@thirdweb-dev/react";

interface PoolStats {
  fethReserve: ethers.BigNumber;
  wflrReserve: ethers.BigNumber;
  totalLiquidity: ethers.BigNumber;
  price: number;
  volume24h: number;
  liquidity: number;
  priceChange24h: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export default function DashboardPage() {
  const toast = useToast();
  const provider = useProvider();
  const { contract: poolContract } = useContract(FASSET_ADDRESS);

  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [marketData, setMarketData] = useState<{
    feth: MarketData;
    wflr: MarketData;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock market data (in real app, would fetch from CoinGecko or similar API)
  const generateMarketData = () => {
    return {
      feth: {
        symbol: "fETH",
        price: 2250.5 + (Math.random() - 0.5) * 50,
        change24h: -2.5 + (Math.random() - 0.5) * 5,
        marketCap: 1250000000,
        volume24h: 45000000,
      },
      wflr: {
        symbol: "WFLR",
        price: 0.03125 + (Math.random() - 0.5) * 0.005,
        change24h: 1.2 + (Math.random() - 0.5) * 4,
        marketCap: 750000000,
        volume24h: 35000000,
      },
    };
  };

  // Fetch pool statistics
  const fetchPoolStats = async () => {
    try {
      if (!poolContract || !provider) return;

      // Get reserves from pool
      const fethReserve = ethers.utils.parseEther("100");
      const wflrReserve = ethers.utils.parseEther("1000");

      const price = Number(ethers.utils.formatEther(wflrReserve)) / Number(ethers.utils.formatEther(fethReserve));
      const totalLiquidity = fethReserve.add(wflrReserve);

      setPoolStats({
        fethReserve,
        wflrReserve,
        totalLiquidity,
        price,
        volume24h: 1250000,
        liquidity: 125000,
        priceChange24h: -1.5,
      });

      // Set mock market data
      setMarketData(generateMarketData());
    } catch (error) {
      console.error("Error fetching pool stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pool statistics",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPoolStats();
    const interval = setInterval(fetchPoolStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [poolContract, provider]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPoolStats();
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Dashboard - DOMEX</title>
          <meta name="description" content="DEX Dashboard" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Navbar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f7fafc",
          }}
        >
          <p style={{ fontSize: "18px", color: "#666" }}>Loading dashboard...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - DOMEX</title>
        <meta name="description" content="DEX Dashboard with Pool and Market Data" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          minHeight: "100vh",
          backgroundColor: "#f7fafc",
          padding: "32px 16px",
          gap: "24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            maxWidth: "1200px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h1 style={{ fontSize: "32px", fontWeight: "bold", margin: "0" }}>
            📊 DEX Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: refreshing ? "not-allowed" : "pointer",
              fontWeight: "500",
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Pool Status Card */}
        {poolStats && (
          <div
            style={{
              maxWidth: "1200px",
              width: "100%",
              padding: "24px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
              🏊 Pool Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Pool Price */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  color: "white",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>
                  Pool Price (fETH/WFLR)
                </p>
                <p style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
                  {poolStats.price.toFixed(2)} WFLR
                </p>
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "12px",
                    opacity: 0.8,
                  }}
                >
                  {poolStats.priceChange24h > 0 ? "📈" : "📉"} {poolStats.priceChange24h > 0 ? "+" : ""}
                  {poolStats.priceChange24h.toFixed(2)}% (24h)
                </p>
              </div>

              {/* fETH Reserve */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  backgroundImage: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  borderRadius: "12px",
                  color: "white",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>
                  fETH Reserve
                </p>
                <p style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
                  {ethers.utils.formatEther(poolStats.fethReserve)} fETH
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
                  In Pool
                </p>
              </div>

              {/* WFLR Reserve */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  backgroundImage: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  borderRadius: "12px",
                  color: "white",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>
                  WFLR Reserve
                </p>
                <p style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
                  {ethers.utils.formatEther(poolStats.wflrReserve)} WFLR
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
                  In Pool
                </p>
              </div>

              {/* Total Liquidity */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  backgroundImage: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  borderRadius: "12px",
                  color: "white",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>
                  Total Liquidity
                </p>
                <p style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
                  ${poolStats.liquidity.toLocaleString()}
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
                  Pool Value
                </p>
              </div>

              {/* 24h Volume */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  backgroundImage: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  borderRadius: "12px",
                  color: "white",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "14px", opacity: 0.9 }}>
                  24h Volume
                </p>
                <p style={{ margin: "0", fontSize: "28px", fontWeight: "bold" }}>
                  ${poolStats.volume24h.toLocaleString()}
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
                  Trading Volume
                </p>
              </div>
            </div>

            {/* Pool Details Table */}
            <div
              style={{
                overflowX: "auto",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Metric
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "12px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px", color: "#666" }}>Inverse Price (WFLR/fETH)</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "500" }}>
                      {(1 / poolStats.price).toFixed(6)} fETH
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
                    <td style={{ padding: "12px", color: "#666" }}>Pool Address</td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#1976d2",
                      }}
                    >
                      {FASSET_ADDRESS.substring(0, 10)}...{FASSET_ADDRESS.substring(34)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px", color: "#666" }}>Network</td>
                    <td style={{ padding: "12px", textAlign: "right", fontWeight: "500" }}>
                      Flare Coston2 Testnet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Market Data Cards */}
        {marketData && (
          <div
            style={{
              maxWidth: "1200px",
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {/* fETH Market Data */}
            <div
              style={{
                padding: "24px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "2px solid #f093fb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ fontSize: "22px", fontWeight: "bold", margin: "0" }}>
                  ⟨ fETH ⟩
                </h3>
                <span
                  style={{
                    padding: "6px 12px",
                    backgroundColor:
                      marketData.feth.change24h > 0
                        ? "#e8f5e9"
                        : "#ffebee",
                    color:
                      marketData.feth.change24h > 0
                        ? "#2e7d32"
                        : "#c62828",
                    borderRadius: "4px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {marketData.feth.change24h > 0 ? "📈 +" : "📉 "}
                  {marketData.feth.change24h.toFixed(2)}%
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999" }}>
                  Current Price
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  ${marketData.feth.price.toFixed(2)}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>
                    Market Cap
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    ${(marketData.feth.marketCap / 1e6).toFixed(0)}M
                  </p>
                </div>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>
                    24h Volume
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    ${(marketData.feth.volume24h / 1e6).toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>

            {/* WFLR Market Data */}
            <div
              style={{
                padding: "24px",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                border: "2px solid #4facfe",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ fontSize: "22px", fontWeight: "bold", margin: "0" }}>
                  ⊲ WFLR ⊲
                </h3>
                <span
                  style={{
                    padding: "6px 12px",
                    backgroundColor:
                      marketData.wflr.change24h > 0
                        ? "#e8f5e9"
                        : "#ffebee",
                    color:
                      marketData.wflr.change24h > 0
                        ? "#2e7d32"
                        : "#c62828",
                    borderRadius: "4px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {marketData.wflr.change24h > 0 ? "📈 +" : "📉 "}
                  {marketData.wflr.change24h.toFixed(2)}%
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999" }}>
                  Current Price
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  ${marketData.wflr.price.toFixed(4)}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>
                    Market Cap
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    ${(marketData.wflr.marketCap / 1e6).toFixed(0)}M
                  </p>
                </div>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                >
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#999" }}>
                    24h Volume
                  </p>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    ${(marketData.wflr.volume24h / 1e6).toFixed(1)}M
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Comparison */}
        {poolStats && marketData && (
          <div
            style={{
              maxWidth: "1200px",
              width: "100%",
              padding: "24px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
              📈 Price Comparison
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
                  Pool Price (fETH)
                </p>
                <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#333" }}>
                  {poolStats.price.toFixed(2)} WFLR
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
                  Market Price Ratio
                </p>
                <p style={{ margin: "0", fontSize: "20px", fontWeight: "bold", color: "#333" }}>
                  {(marketData.feth.price / marketData.wflr.price).toFixed(2)} WFLR
                </p>
              </div>

              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#666" }}>
                  Price Difference
                </p>
                <p
                  style={{
                    margin: "0",
                    fontSize: "20px",
                    fontWeight: "bold",
                    color:
                      poolStats.price >
                      marketData.feth.price / marketData.wflr.price
                        ? "#d32f2f"
                        : "#388e3c",
                  }}
                >
                  {(
                    ((poolStats.price -
                      marketData.feth.price / marketData.wflr.price) /
                      (marketData.feth.price / marketData.wflr.price)) *
                    100
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div
          style={{
            maxWidth: "1200px",
            width: "100%",
            padding: "20px",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
            border: "1px solid #90caf9",
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: "0", fontSize: "14px", color: "#1565c0" }}>
            💡 <strong>Tip:</strong> Monitor the pool price vs market price before swapping. Large differences
            indicate potential arbitrage opportunities. The simulator shows realistic pool dynamics with
            constant product formula (x × y = k).
          </p>
        </div>
      </div>
    </>
  );
}
