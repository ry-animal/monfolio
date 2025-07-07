import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { config } from "../lib/web3";

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="auto"
          options={{
            embedGoogleFonts: true,
            walletConnectName: "WalletConnect",
            hideTooltips: false,
            hideQuestionMarkCTA: false,
            hideNoWalletCTA: false,
            walletConnectCTA: "link",
            enforceSupportedChains: true,
            customAvatar: undefined,
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}