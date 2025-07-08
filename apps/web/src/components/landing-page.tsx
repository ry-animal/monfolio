import { useState } from "react";
import { BodyL, BodyM, H1, H2 } from "./design-system";
import { Dashboard } from "./dashboard";

export function LandingPage() {
	const [showApp, setShowApp] = useState(false);

	if (showApp) {
		return <Dashboard />;
	}

	return (
		<div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
			{/* Hero Section */}
			<div className="text-center space-y-4">
				<H1>Monfolio</H1>
				<H2 className="text-muted-foreground">
					Legitimate Blockchain Portfolio Analytics Tool
				</H2>
				<BodyL className="text-muted-foreground max-w-2xl mx-auto">
					A read-only blockchain data visualization tool for tracking Ethereum transactions 
					and token balances across multiple networks. Built for educational and portfolio 
					analysis purposes.
				</BodyL>
			</div>

			{/* What This Tool Does */}
			<div className="bg-muted/50 rounded-lg p-6 space-y-4">
				<H2>What This Tool Does</H2>
				<div className="grid md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<h3 className="font-semibold text-green-600">✓ Safe Features</h3>
						<ul className="space-y-1 text-sm text-muted-foreground">
							<li>• Read-only blockchain data viewing</li>
							<li>• Display transaction history</li>
							<li>• Show token balances</li>
							<li>• Multi-network support (Sepolia, Arbitrum, Optimism)</li>
							<li>• Portfolio analytics and visualization</li>
						</ul>
					</div>
					<div className="space-y-2">
						<h3 className="font-semibold text-red-600">✗ What We Never Do</h3>
						<ul className="space-y-1 text-sm text-muted-foreground">
							<li>• Store or access private keys</li>
							<li>• Request seed phrases or passwords</li>
							<li>• Initiate transactions</li>
							<li>• Collect personal information</li>
							<li>• Request financial information</li>
						</ul>
					</div>
				</div>
			</div>

			{/* Technology Stack */}
			<div className="bg-muted/50 rounded-lg p-6 space-y-4">
				<H2>Technology & Security</H2>
				<BodyM className="text-muted-foreground">
					Built with modern web technologies including React, TypeScript, and tRPC. 
					Deployed on Cloudflare infrastructure with comprehensive security headers. 
					All blockchain interactions are read-only through public APIs.
				</BodyM>
				<div className="flex flex-wrap gap-2">
					{['React', 'TypeScript', 'tRPC', 'Cloudflare', 'Viem', 'Wagmi'].map((tech) => (
						<span key={tech} className="px-3 py-1 bg-primary/10 rounded-full text-sm">
							{tech}
						</span>
					))}
				</div>
			</div>

			{/* Disclaimer */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-2">
				<h3 className="font-semibold text-blue-900">Important Disclaimer</h3>
				<BodyM className="text-blue-800">
					This is an educational blockchain analytics tool, not a financial service or trading platform. 
					It only displays publicly available blockchain data. No financial advice is provided. 
					Always verify information independently and never share private keys or seed phrases.
				</BodyM>
			</div>

			{/* CTA */}
			<div className="text-center">
				<button
					onClick={() => setShowApp(true)}
					className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
				>
					View Portfolio Analytics Tool
				</button>
				<BodyM className="text-muted-foreground mt-2 block">
					Clicking this will show the blockchain data viewer
				</BodyM>
			</div>
		</div>
	);
}