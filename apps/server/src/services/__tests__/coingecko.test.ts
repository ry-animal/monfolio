import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateUsdValue, fetchTokenPrices } from "../coingecko";

// Mock fetch globally
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

describe("CoinGecko Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("fetchTokenPrices", () => {
		it("should fetch token prices successfully without API key", async () => {
			const mockResponse = {
				ethereum: {
					usd: 2000.5,
				},
				"usd-coin": {
					usd: 1.0,
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			} as Response);

			const result = await fetchTokenPrices();

			expect(result).toEqual({
				ethereum: { usd: 2000.5 },
				"usd-coin": { usd: 1.0 },
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("api.coingecko.com/api/v3/simple/price"),
			);
		});

		it("should fetch token prices with API key when provided", async () => {
			process.env.COINGECKO_API_KEY = "test-api-key";

			const mockResponse = {
				ethereum: {
					usd: 2000.5,
				},
				"usd-coin": {
					usd: 1.0,
				},
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			} as Response);

			const result = await fetchTokenPrices();

			expect(result).toEqual({
				ethereum: { usd: 2000.5 },
				"usd-coin": { usd: 1.0 },
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("pro-api.coingecko.com/api/v3/simple/price"),
			);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("x_cg_pro_api_key=test-api-key"),
			);

			// Clean up
			delete process.env.COINGECKO_API_KEY;
		});

		it("should handle API errors gracefully", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(fetchTokenPrices()).rejects.toThrow("Network error");
		});

		it("should handle non-200 responses", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 429,
				statusText: "Too Many Requests",
			} as Response);

			await expect(fetchTokenPrices()).rejects.toThrow();
		});

		it("should handle malformed JSON responses", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => {
					throw new Error("Invalid JSON");
				},
			} as unknown as Response);

			await expect(fetchTokenPrices()).rejects.toThrow("Invalid JSON");
		});

		it("should return default prices when API is unavailable", async () => {
			mockFetch.mockRejectedValueOnce(new Error("API Unavailable"));

			try {
				await fetchTokenPrices();
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe("API Unavailable");
			}
		});
	});

	describe("calculateUsdValue", () => {
		it("should calculate USD value correctly for ETH (18 decimals)", () => {
			const amount = "1000000000000000000"; // 1 ETH in wei
			const decimals = 18;
			const priceUsd = 2000.5;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(2000.5);
		});

		it("should calculate USD value correctly for USDC (6 decimals)", () => {
			const amount = "1000000"; // 1 USDC with 6 decimals
			const decimals = 6;
			const priceUsd = 1.0;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(1.0);
		});

		it("should handle zero amounts", () => {
			const amount = "0";
			const decimals = 18;
			const priceUsd = 2000.5;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(0);
		});

		it("should handle fractional amounts", () => {
			const amount = "500000000000000000"; // 0.5 ETH in wei
			const decimals = 18;
			const priceUsd = 2000.0;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(1000.0);
		});

		it("should handle very small amounts", () => {
			const amount = "1000000000000000"; // 0.001 ETH in wei
			const decimals = 18;
			const priceUsd = 2000.0;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(2.0);
		});

		it("should handle large amounts", () => {
			const amount = "1000000000000000000000"; // 1000 ETH in wei
			const decimals = 18;
			const priceUsd = 2000.0;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(2000000.0);
		});

		it("should handle zero price", () => {
			const amount = "1000000000000000000"; // 1 ETH in wei
			const decimals = 18;
			const priceUsd = 0;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(0);
		});

		it("should handle different decimal places", () => {
			// Test with 8 decimals (like Bitcoin)
			const amount = "100000000"; // 1 unit with 8 decimals
			const decimals = 8;
			const priceUsd = 50000.0;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(50000.0);
		});

		it("should handle string amounts with scientific notation", () => {
			const amount = "1e18"; // 1 ETH in wei (scientific notation)
			const decimals = 18;
			const priceUsd = 2000.0;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			expect(result).toBe(2000.0);
		});

		it("should handle precision correctly", () => {
			const amount = "1234567890123456789"; // 1.234567890123456789 ETH
			const decimals = 18;
			const priceUsd = 2000.123456789;

			const result = calculateUsdValue(amount, decimals, priceUsd);

			// Should be approximately 2469.29 (calculated: 1.234567890123456789 * 2000.123456789)
			expect(result).toBeCloseTo(2469.29, 1);
		});
	});
});
