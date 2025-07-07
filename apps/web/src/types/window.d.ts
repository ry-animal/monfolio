declare global {
	interface Window {
		/**
		 * Phantom or other Solana wallet provider injected into the browser.
		 * The exact shape isn't important for our usage – we only check for the
		 * `isPhantom` flag, so leave the rest as `any` for flexibility.
		 */
		solana?: {
			isPhantom?: boolean;
			[key: string]: any;
		};
	}
}

export {};
