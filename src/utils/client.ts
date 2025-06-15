import { validateInstagramConfig } from "./environment";
import { initializeClient } from "./lib/auth";
import { InstagramInteractionService } from "./services/interaction";
import { InstagramPostService } from "./services/post";
import { type InstagramState } from "./types";

export interface InstagramClient {
    name: string;
    start(): Promise<{
        post: InstagramPostService;
        interaction: InstagramInteractionService;
        state: InstagramState;
        stop(): Promise<void>;
    }>;
}

export const InstagramClientInterface: InstagramClient = {
    name: 'instagram',
    // async fetchComments(){
    //     return await 
    // }
    async start() {
        try {
            // Validate configuration
            const config = await validateInstagramConfig();
            console.log("Instagram client configuration validated");

            // Initialize client and get initial state
            const state = await initializeClient(config);
            console.log("Instagram client initialized");

            // Create services
            const postService = new InstagramPostService(state);
            const interactionService = new InstagramInteractionService(
                state
            );

            // Start services
            if (!config.INSTAGRAM_DRY_RUN) {
                await postService.start();
                console.log("Instagram post service started");

                if (config.INSTAGRAM_ENABLE_ACTION_PROCESSING) {
                    // await interactionService.start();
                    console.log("Instagram interaction service started");
                }
            } else {
                console.log("Instagram client running in dry-run mode");
            }

            // Return manager instance
            return {
                post: postService,
                interaction: interactionService,
                state,
                async stop() {
                    console.log("Stopping Instagram client services...");
                },
            };
        } catch (error) {
            console.error("Failed to start Instagram client:", error);
            throw error;
        }
    },
};