import { useAccount, useBalance } from "wagmi";
import { sepolia, arbitrumSepolia, optimismSepolia } from "wagmi/chains";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { trpc } from "../utils/trpc";
import { useEffect, useState } from "react";

const SUPPORTED_NETWORKS = [
  { chain: sepolia, name: "Ethereum Sepolia", logo: "⚡" },
  { chain: arbitrumSepolia, name: "Arbitrum Sepolia", logo: "🔵" },
  { chain: optimismSepolia, name: "Optimism Sepolia", logo: "🔴" },
];

export function BalanceDisplay() {
  const { address } = useAccount();
  const [totalUsd, setTotalUsd] = useState(0);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);

  // Calculate total USD value from all networks
  useEffect(() => {
    if (!address) {
      setTotalUsd(0);
      return;
    }

    setIsLoadingTotal(true);
    const fetchTotalBalance = async () => {
      try {
        const promises = SUPPORTED_NETWORKS.map(async ({ chain }) => {
          const balance = await trpc.getBalance.query({ address, chainId: chain.id });
          return balance.totalUsd;
        });
        const balances = await Promise.all(promises);
        setTotalUsd(balances.reduce((sum, balance) => sum + balance, 0));
      } catch (error) {
        console.error('Error fetching total balance:', error);
      } finally {
        setIsLoadingTotal(false);
      }
    };

    fetchTotalBalance();
  }, [address]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Portfolio Balance</CardTitle>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600">
            {isLoadingTotal ? (
              <Skeleton className="h-10 w-32 mx-auto" />
            ) : (
              `$${totalUsd.toFixed(2)}`
            )}
          </div>
          <p className="text-sm text-muted-foreground">Total USD Value</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {SUPPORTED_NETWORKS.map(({ chain, name, logo }) => (
          <NetworkBalance
            key={chain.id}
            chainId={chain.id}
            chainName={name}
            chainLogo={logo}
            address={address}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function NetworkBalance({
  chainId,
  chainName,
  chainLogo,
  address,
}: {
  chainId: number;
  chainName: string;
  chainLogo: string;
  address?: `0x${string}`;
}) {
  const { data: ethBalance, isLoading: ethLoading } = useBalance({
    address,
    chainId,
  });

  const { 
    data: balanceData, 
    isLoading: balanceLoading, 
    error: balanceError 
  } = trpc.getBalance.useQuery(
    { address: address!, chainId },
    { 
      enabled: !!address,
      refetchInterval: 30000, // Refetch every 30 seconds
      staleTime: 15000, // Consider data stale after 15 seconds
    }
  );

  const isLoading = ethLoading || balanceLoading;
  const hasError = balanceError;

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{chainLogo}</span>
          <span className="font-medium">{chainName}</span>
        </div>
        {hasError && (
          <span className="text-xs text-red-500">Error loading</span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">ETH Balance</p>
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <div className="space-y-1">
              <p className="font-mono">
                {balanceData ? `${(parseFloat(balanceData.eth) / 1e18).toFixed(4)} ETH` : "0.0000 ETH"}
              </p>
              <p className="text-xs text-muted-foreground">
                ${balanceData?.ethUsd.toFixed(2) || "0.00"}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">USDC Balance</p>
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <div className="space-y-1">
              <p className="font-mono">
                {balanceData ? `${(parseFloat(balanceData.usdc) / 1e6).toFixed(2)} USDC` : "0.00 USDC"}
              </p>
              <p className="text-xs text-muted-foreground">
                ${balanceData?.usdcUsd.toFixed(2) || "0.00"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}