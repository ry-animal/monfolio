import { z } from "zod";

/**
 * Ethereum address validation regex
 * Matches 0x followed by 40 hexadecimal characters
 */
const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Validates if a string is a valid Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
	return ETHEREUM_ADDRESS_REGEX.test(address);
}

/**
 * Zod schema for Ethereum addresses
 */
export const ethereumAddressSchema = z
	.string()
	.min(1, "Address is required")
	.refine(isValidEthereumAddress, {
		message:
			"Invalid Ethereum address format. Must be 0x followed by 40 hexadecimal characters",
	});

/**
 * Zod schema for chain IDs with validation against supported chains
 */
export const chainIdSchema = z
	.number()
	.positive("Chain ID must be positive")
	.int("Chain ID must be an integer");
