import config from './config';
import { InstagramApiClient } from './infrastructure/instagram/instagram.client';
import { SQLiteDatabaseService } from './infrastructure/database/sqlite.database';
import { InstagramInteractionService } from './core/services/instagram.service';
import { Logger } from './infrastructure/logging/logger';

const logger = new Logger('Application');

async function main() {
  try {
    // Initialize services
    const instagramClient = new InstagramApiClient();
    const database = new SQLiteDatabaseService(config.DB_PATH);
    const instagramService = new InstagramInteractionService(instagramClient, database);

    // Initialize Instagram client
    await instagramClient.initialize(config.INSTAGRAM_USERNAME, config.INSTAGRAM_PASSWORD);
    logger.info('Instagram client initialized');

    // Initialize database
    await database.initialize();
    logger.info('Database initialized');

    // Process posts
    const targetUsername = config.DEFAULT_TARGET_USERNAME;
    const limit = Number(config.DEFAULT_POST_LIMIT);
    
    logger.info(`Starting to process posts for @${targetUsername} (limit: ${limit})`);
    const result = await instagramService.processNewPosts(targetUsername, limit);
    logger.info(`Processed ${result.processed} posts for @${result.username}`);

    // Get and display commented posts
    const commentedPosts = await instagramService.getCommentedPosts(targetUsername);
    logger.info(`\nTotal commented posts for @${targetUsername}: ${commentedPosts.length}`);
    commentedPosts.forEach(post => {
      logger.info(`- Post ${post.postId} commented at ${post.commentedAt.toISOString()}`);
    });

  } catch (error) {
    logger.error('Failed to process posts', error);
    process.exit(1);
  }
}

main();