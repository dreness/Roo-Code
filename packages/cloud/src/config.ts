export const PRODUCTION_CLERK_BASE_URL = "https://clerk.roocode.com"
export const PRODUCTION_ROO_CODE_API_URL = "https://app.roocode.com"
export const PRODUCTION_ROO_CODE_PROVIDER_URL = "https://api.roocode.com/proxy"

/**
 * Get the Clerk authentication service base URL.
 * Can be overridden with CLERK_BASE_URL environment variable for self-hosted setups.
 * See SELF_HOSTING.md for more information.
 */
export const getClerkBaseUrl = () => {
	const url = process.env.CLERK_BASE_URL || PRODUCTION_CLERK_BASE_URL
	return url.replace(/\/$/, "") // Remove trailing slash
}

/**
 * Get the Roo Code API service base URL.
 * Can be overridden with ROO_CODE_API_URL environment variable for self-hosted setups.
 * See SELF_HOSTING.md for more information.
 */
export const getRooCodeApiUrl = () => {
	const url = process.env.ROO_CODE_API_URL || PRODUCTION_ROO_CODE_API_URL
	return url.replace(/\/$/, "") // Remove trailing slash
}

/**
 * Get the Roo Code provider proxy base URL.
 * Can be overridden with ROO_CODE_PROVIDER_URL environment variable for self-hosted setups.
 * See SELF_HOSTING.md for more information.
 */
export const getRooCodeProviderUrl = () => {
	const url = process.env.ROO_CODE_PROVIDER_URL || PRODUCTION_ROO_CODE_PROVIDER_URL
	return url.replace(/\/$/, "") // Remove trailing slash
}

/**
 * Check if using custom (self-hosted) cloud services.
 */
export const isUsingCustomCloudServices = () => {
	return (
		!!process.env.CLERK_BASE_URL ||
		!!process.env.ROO_CODE_API_URL ||
		!!process.env.ROO_CODE_PROVIDER_URL
	)
}

/**
 * Get a summary of current cloud service configuration for logging/debugging.
 */
export const getCloudServiceConfig = () => {
	return {
		clerkBaseUrl: getClerkBaseUrl(),
		rooCodeApiUrl: getRooCodeApiUrl(),
		rooCodeProviderUrl: getRooCodeProviderUrl(),
		isCustom: isUsingCustomCloudServices(),
	}
}
