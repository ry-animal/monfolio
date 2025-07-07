import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHAIN_CONFIG, fetchBalance, fetchTransactions } from "../blockchain";

// Import getApiKey through dynamic import since it's not exported
const getApiKey = async (chainId: number): Promise<string | undefined> => {
	const module = await import("../blockchain");
	// Access the internal function through the module
	return (module as any).getApiKey?.(chainId);
};

// Mock fetch globally
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

describe("Blockchain Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Set up environment variables
		process.env.ETHERSCAN_API_KEY = "test-etherscan-key";
		process.env.ARBISCAN_API_KEY = "test-arbiscan-key";
		process.env.OPTIMISM_ETHERSCAN_API_KEY = "test-optimism-key";
	});

	describe("Environment Variables", () => {
		it("should have test environment variables set", () => {
			expect(process.env.ETHERSCAN_API_KEY).toBe("test-etherscan-key");
			expect(process.env.ARBISCAN_API_KEY).toBe("test-arbiscan-key");
			expect(process.env.OPTIMISM_ETHERSCAN_API_KEY).toBe("test-optimism-key");
		});
	});

	describe("fetchBalance", () => {
		it("should fetch ETH and USDC balances successfully", async () => {
			const mockEthResponse = {
				status: "1",
				result: "1000000000000000000", // 1 ETH in wei
			};

			const mockUsdcResponse = {
				status: "1",
				result: "1000000", // 1 USDC (6 decimals)
			};

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockEthResponse,
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockUsdcResponse,
				} as Response);

			const result = await fetchBalance(
				"0x1234567890123456789012345678901234567890",
				11155111,
			);

			expect(result).toEqual({
				eth: "1000000000000000000",
				usdc: "1000000",
			});

			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		it("should handle API errors gracefully", async () => {
			mockFetch.mockRejectedValueOnce(new Error("API Error"));

			await expect(
				fetchBalance("0x1234567890123456789012345678901234567890", 11155111),
			).rejects.toThrow("API Error");
		});

		it("should handle zero balances", async () => {
			const mockEthResponse = {
				status: "1",
				result: "0",
			};

			const mockUsdcResponse = {
				status: "1",
				result: "0",
			};

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockEthResponse,
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockUsdcResponse,
				} as Response);

			const result = await fetchBalance(
				"0x1234567890123456789012345678901234567890",
				11155111,
			);

			expect(result).toEqual({
				eth: "0",
				usdc: "0",
			});
		});
	});

	describe("fetchTransactions", () => {
		it("should fetch and combine native and token transactions", async () => {
			const mockNativeResponse = {
				status: "1",
				result: [
					{
						hash: "0xabc123",
						blockNumber: "100",
						timeStamp: "1640995200",
						from: "0x1234567890123456789012345678901234567890",
						to: "0x0987654321098765432109876543210987654321",
						value: "1000000000000000000",
						gas: "21000",
						gasPrice: "20000000000",
						gasUsed: "21000",
					},
				],
			};

			const mockTokenResponse = {
				status: "1",
				result: [
					{
						hash: "0xdef456",
						blockNumber: "101",
						timeStamp: "1640995260",
						from: "0x1234567890123456789012345678901234567890",
						to: "0x0987654321098765432109876543210987654321",
						value: "1000000",
						tokenName: "USD Coin",
						tokenSymbol: "USDC",
						tokenDecimal: "6",
						contractAddress: "0xa0b86a33e6e1b3f3c55b3bb2e69c3e3c9e5e5b0c",
					},
				],
			};

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockNativeResponse,
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockTokenResponse,
				} as Response);

			const result = await fetchTransactions(
				"0x1234567890123456789012345678901234567890",
				11155111,
			);

			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				hash: "0xabc123",
				value: "1000000000000000000",
			});
			expect(result[1]).toMatchObject({
				hash: "0xdef456",
				value: "1000000",
				tokenSymbol: "USDC",
			});
		});

		it("should handle empty transaction results", async () => {
			const mockEmptyResponse = {
				status: "1",
				result: [],
			};

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockEmptyResponse,
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: async () => mockEmptyResponse,
				} as Response);

			const result = await fetchTransactions(
				"0x1234567890123456789012345678901234567890",
				11155111,
			);

			expect(result).toHaveLength(0);
		});

		it("should handle API errors in transaction fetching", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(
				fetchTransactions(
					"0x1234567890123456789012345678901234567890",
					11155111,
				),
			).rejects.toThrow("Network error");
		});

		it("should use provided start and end blocks", async () => {
			const mockResponse = {
				status: "1",
				result: [],
			};

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => mockResponse,
			} as Response);

			await fetchTransactions(
				"0x1234567890123456789012345678901234567890",
				11155111,
				1000,
				2000,
			);

			// Check that startblock and endblock parameters are included in the URLs
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("startblock=1000"),
			);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("endblock=2000"),
			);
		});
	});

	describe("CHAIN_CONFIG", () => {
		it("should have correct configuration for all supported chains", () => {
			expect(CHAIN_CONFIG).toHaveProperty("11155111"); // Ethereum Sepolia
			expect(CHAIN_CONFIG).toHaveProperty("421614"); // Arbitrum Sepolia
			expect(CHAIN_CONFIG).toHaveProperty("11155420"); // Optimism Sepolia

			// Check that each chain has required properties
			Object.values(CHAIN_CONFIG).forEach((config) => {
				expect(config).toHaveProperty("explorerApiUrl");
				expect(config).toHaveProperty("usdcAddress");
				expect(config).toHaveProperty("name");
				expect(config).toHaveProperty("nativeToken");
				expect(typeof config.explorerApiUrl).toBe("string");
				expect(typeof config.usdcAddress).toBe("string");
				expect(typeof config.name).toBe("string");
				expect(typeof config.nativeToken).toBe("string");
			});
		});
	});
});
