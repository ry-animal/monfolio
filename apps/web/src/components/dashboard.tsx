import { useAccount } from "wagmi";
import { H1, BodyL } from "./design-system";
import { NetworkSelector } from "./network-selector";
import { BalanceDisplay } from "./balance-display";
import { TransactionHistory } from "./transaction-history";

export function Dashboard() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div 
          className="text-center"
          style={{
            width: '402px',
            height: '100px',
            gap: '16px',
            position: 'absolute',
            top: '64px',
            left: '64px',
            opacity: 1,
            transform: 'rotate(0deg)'
          }}
        >
          <H1 color="monad-purple" weight="bold">Monfolio</H1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div 
        className="text-center"
        style={{
          width: '402px',
          height: '100px',
          gap: '16px',
          position: 'absolute',
          top: '64px',
          left: '64px',
          opacity: 1,
          transform: 'rotate(0deg)'
        }}
      >
        <H1 color="monad-purple" weight="bold">Monfolio</H1>
        <BodyL className="text-muted-foreground">
          Your portfolio across Ethereum, Arbitrum, and Optimism testnets
        </BodyL>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <NetworkSelector />
        </div>
        <div className="lg:col-span-2">
          <BalanceDisplay />
        </div>
      </div>

      <div className="w-full">
        <TransactionHistory />
      </div>
    </div>
  );
}