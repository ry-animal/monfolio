import { ModeToggle } from "./mode-toggle";
import { WalletButton } from "./wallet-button";

export default function Header() {

  return (
    <div>
      <div className="flex flex-row items-center justify-end px-2 py-4">
        <div className="flex items-center gap-2">
          <WalletButton />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
