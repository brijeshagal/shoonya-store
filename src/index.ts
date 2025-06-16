import config from './config';
import { InstagramApiClient } from './infrastructure/instagram/instagram.client';
import { SQLiteDatabaseService } from './infrastructure/database/sqlite.database';
import { InstagramInteractionService } from './core/services/instagram.service';
import { Logger } from './scripts/logging/logger';

const logger = new Logger('Application');

async function processCommentInteractions(instagramService: InstagramInteractionService, targetUsername: string, limit: number) {
  try {
    logger.info(`Starting to process comment interactions for @${targetUsername} (limit: ${limit})`);
    
    // Get recent posts from the target account
    const posts = await instagramService.getRecentPosts(targetUsername, limit);
    logger.info(`Found ${posts.length} posts to process comments for`);

    for (const post of posts) {
      try {
        logger.info(`\nProcessing comments for post ${post.id}:`);
        logger.info(`- Caption: ${post.caption?.substring(0, 50)}...`);
        
        // Get comments for the post
        let comments;
        try {
          comments = await instagramService.getComments(post.id);
          logger.info(`Found ${comments.length} comments to process`);
        } catch (error) {
          logger.warn(`Could not access comments for post ${post.id}, skipping...`, { error });
          continue; // Skip to next post if comments can't be accessed
        }

        for (const comment of comments) {
          try {
            // Skip if the comment is from our own account
            if (comment.username === config.INSTAGRAM_USERNAME) {
              logger.info(`Skipping comment ${comment.id} as it's from our own account`);
              continue;
            }

            const isReplied = await instagramService.isCommentReplied(comment.id);
            if (isReplied) {
              logger.info(`Comment ${comment.id} already replied to, skipping...`);
              continue;
            }

            const reply = "Automated Comment Test!"; // TODO: Implement reply generation
            
            logger.info(`Attempting to reply to comment ${comment.id}...`);
            const result = await instagramService.replyToComment(post.id, comment.id, reply);
            
            if (result.success) {
              await instagramService.addCommentInteraction(comment.id, post.id, targetUsername, reply);
              logger.info(`Successfully replied to comment ${comment.id}`);
            } else {
              logger.error(`Failed to reply to comment ${comment.id}: ${result.message}`);
            }
          } catch (error) {
            logger.error(`Error processing comment ${comment.id}`, error);
            continue; // Continue with next comment if one fails
          }
        }
      } catch (error) {
        logger.error(`Error processing post ${post.id}`, error);
        continue; // Continue with next post if one fails
      }
    }

    // Get and display comment interactions
    try {
      const commentInteractions = await instagramService.getCommentInteractions();
      logger.info(`\nTotal comment interactions: ${commentInteractions.length}`);
      commentInteractions.forEach(interaction => {
        logger.info(`- Comment ${interaction.commentId} on post ${interaction.postId} replied at ${interaction.repliedAt.toISOString()}`);
      });
    } catch (error) {
      logger.error('Failed to fetch comment interactions', error);
    }

  } catch (error) {
    logger.error('Failed to process comment interactions', error);
    // Don't throw the error, just log it and continue
  }
}

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

    // Process posts for the default target
    const targetUsername = config.DEFAULT_TARGET_USERNAME;
    const limit = Number(config.DEFAULT_POST_LIMIT);
    
    try {
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
      logger.error(`Failed to process posts for @${targetUsername}`, error);
    }

    // Process comment interactions for a different account
    const commentTargetUsername = config.COMMENT_TARGET_USERNAME || 'shoonyaai';
    const commentLimit = Number(config.COMMENT_POST_LIMIT || '5');
    await processCommentInteractions(instagramService, commentTargetUsername, commentLimit);

  } catch (error) {
    logger.error('Application failed', error);
    process.exit(1);
  }
}

main();