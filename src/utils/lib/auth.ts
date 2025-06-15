// src/lib/auth.ts
import { IgLoginTwoFactorRequiredError } from "instagram-private-api";
import type { InstagramConfig } from "../environment";
import type { InstagramState } from "../types";
import { fetchProfile } from "./profile";
import { createInitialState, getIgClient } from "./state";

/**
 * Authenticates with Instagram
 */
async function authenticate(
    config: InstagramConfig
): Promise<InstagramState> {
    const ig = getIgClient();
    const state = createInitialState();

    try {
        // Generate device ID
        ig.state.generateDevice(config.INSTAGRAM_USERNAME);

        // Proceed with fresh login
        try {
            await ig.account.login(
                config.INSTAGRAM_USERNAME,
                config.INSTAGRAM_PASSWORD
            );

            const profile = await fetchProfile(config);
            return {
                ...state,
                isInitialized: true,
                profile,
            };
        } catch (error) {
            if (error instanceof IgLoginTwoFactorRequiredError) {
                // Handle 2FA if needed - would need to implement 2FA code generation
                throw new Error("2FA authentication not yet implemented");
            }
            throw error;
        }
    } catch (error) {
        console.error("Authentication failed:", error);
        throw error;
    }
}

/**
 * Sets up webhooks for real-time updates if needed
 */
async function setupWebhooks() {
    // Implement webhook setup
    // This is a placeholder for future implementation
}

/**
 * Initializes the Instagram client
 */
export async function initializeClient(
    config: InstagramConfig
): Promise<InstagramState> {
    try {
        // Authenticate and get initial state
        const state = await authenticate(config);

        // Set up webhook handlers if needed
        await setupWebhooks();

        return state;
    } catch (error) {
        console.error("Failed to initialize Instagram client:", error);
        throw error;
    }
}

// Export other authentication related functions if needed
export { authenticate, setupWebhooks };
