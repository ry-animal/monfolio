import { ConnectKitButton } from "connectkit";
import { Button } from "./ui/button";
import { Typography } from "./design-system/typography";
import { useState } from "react";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
}

const walletOptions: WalletOption[] = [
  {
    id: "phantom",
    name: "Phantom",
    icon: "/LMark.png",
  },
  {
    id: "metamask",
    name: "MetaMask",
    icon: "/LMark.png",
  },
];

function WalletSelectionModal({ onClose, onConnect }: { onClose: () => void; onConnect: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Typography variant="bodyL" color="secondary" className="mb-6">
            Track and manage your crypto and NFT portfolio with ease.
          </Typography>

          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <img src="/LMark.png" alt="Monfolio" className="h-6 w-6" />
            </div>
          </div>

          <Typography variant="h6" weight="semiBold" className="mb-6">
            Connect to Monfolio.
          </Typography>
        </div>

        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => {
                onConnect();
                onClose();
              }}
              className="flex w-full items-center gap-4 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <img
                src={wallet.icon}
                alt={wallet.name}
                className="h-8 w-8 rounded-lg"
              />
              <Typography variant="bodyM" weight="medium">
                {wallet.name}
              </Typography>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function WalletButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <ConnectKitButton.Custom>
        {({ isConnected, isConnecting, show, address, ensName, chain }) => {
          const handleConnect = () => {
            if (!isConnected) {
              setShowModal(true);
            } else {
              show?.();
            }
          };

          return (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              variant={isConnected ? "outline" : "default"}
            >
              {isConnecting
                ? "Connecting..."
                : isConnected
                  ? ensName ?? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                  : "Connect Wallet"}
            </Button>
          );
        }}
      </ConnectKitButton.Custom>

      {showModal && (
        <WalletSelectionModal
          onClose={() => setShowModal(false)}
          onConnect={() => {
            const connectButton = document.querySelector('[data-testid="connectkit-connect-button"]') as HTMLButtonElement;
            if (connectButton) {
              connectButton.click();
            }
          }}
        />
      )}
    </>
  );
}