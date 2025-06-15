import { InstagramApiClient } from '../infrastructure/instagram/instagram.client';
import { SQLiteDatabaseService } from '../infrastructure/database/sqlite.database';
import { Logger } from '../infrastructure/logging/logger';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function processPosts() {
  const logger = new Logger('ProcessPosts');
  const targetUsername = process.env.DEFAULT_TARGET_USERNAME || 'shoonya_store';
  const limit = parseInt(process.env.DEFAULT_POST_LIMIT || '5', 10);

  try {
    // Initialize services
    const instagramClient = new InstagramApiClient();
    const database = new SQLiteDatabaseService();

    // Initialize database
    await database.initialize();
    logger.info('Database initialized');

    // Initialize Instagram client
    await instagramClient.initialize(
      process.env.INSTAGRAM_USERNAME!,
      process.env.INSTAGRAM_PASSWORD!
    );
    logger.info('Instagram client initialized');

    // Get recent posts
    logger.info(`Fetching recent posts for @${targetUsername} (limit: ${limit})`);
    const posts = await instagramClient.getRecentPosts(targetUsername, limit);
    logger.info(`Found ${posts.length} posts to process`);

    // Process each post
    for (const post of posts) {
      logger.info(`\nProcessing post ${post.id}:`);
      logger.info(`- Caption: ${post.caption?.substring(0, 50)}...`);
      logger.info(`- Taken at: ${post.takenAt.toISOString()}`);

      // Check if post is already commented
      const isCommented = await database.isPostCommented(post.id);
      if (isCommented) {
        logger.info(`Post ${post.id} already commented, skipping...`);
        continue;
      }

      // Generate comment
      const comment = process.env.COMMENT_TEMPLATE || "Great post! Keep up the amazing work! 👏";

      try {
        // Post comment
        logger.info(`Attempting to comment on post ${post.id}...`);
        const result = await instagramClient.postComment(post.id, comment);

        if (result.success) {
          // Add to database
          await database.addCommentedPost(post.id, targetUsername, comment);
          logger.info(`Successfully commented on post ${post.id}`);
        } else {
          logger.error(`Failed to comment on post ${post.id}: ${result.message}`);
        }
      } catch (error) {
        logger.error(`Error commenting on post ${post.id}`, error);
      }
    }

    // Get all commented posts
    const commentedPosts = await database.getCommentedPosts(targetUsername);
    logger.info(`\nTotal commented posts for @${targetUsername}: ${commentedPosts.length}`);
    commentedPosts.forEach(post => {
      logger.info(`- Post ${post.postId} commented at ${post.commentedAt.toISOString()}`);
    });

  } catch (error) {
    logger.error('Error processing posts', error);
    process.exit(1);
  }
}

// Run the script
processPosts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 