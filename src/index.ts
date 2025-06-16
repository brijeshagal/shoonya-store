import config from './config';
import { InstagramApiClient } from './infrastructure/instagram/instagram.client';
import { SQLiteDatabaseService } from './infrastructure/database/sqlite.database';
import { InstagramInteractionService } from './core/services/instagram.service';
import { Logger } from './infrastructure/logging/logger';

const logger = new Logger('Application');

async function processCommentInteractions(instagramService: InstagramInteractionService, targetUsername: string, limit: number) {
  try {
    logger.info(`Starting to process comment interactions for @${targetUsername} (limit: ${limit})`);
    
    // Get recent posts from the target account
    const posts = await instagramService.getRecentPosts(targetUsername, limit);
    logger.info(`Found ${posts.length} posts to process comments for`);

    for (const post of posts) {
      logger.info(`\nProcessing comments for post ${post.id}:`);
      logger.info(`- Caption: ${post.caption?.substring(0, 50)}...`);
      
      // Get comments for the post
      const comments = await instagramService.getComments(post.id);
      logger.info(`Found ${comments.length} comments to process`);

      for (const comment of comments) {
        const isReplied = await instagramService.isCommentReplied(comment.id);
        if (isReplied) {
          logger.info(`Comment ${comment.id} already replied to, skipping...`);
          continue;
        }

        const reply = "Thanks for your comment! 🙏"; // TODO: Implement reply generation
        
        try {
          logger.info(`Attempting to reply to comment ${comment.id}...`);
          const result = await instagramService.replyToComment(post.id, comment.id, reply);
          
          if (result.success) {
            await instagramService.addCommentInteraction(comment.id, post.id, targetUsername, reply);
            logger.info(`Successfully replied to comment ${comment.id}`);
          } else {
            logger.error(`Failed to reply to comment ${comment.id}: ${result.message}`);
          }
        } catch (error) {
          logger.error(`Error replying to comment ${comment.id}`, error);
        }
      }
    }

    // Get and display comment interactions
    const commentInteractions = await instagramService.getCommentInteractions();
    logger.info(`\nTotal comment interactions: ${commentInteractions.length}`);
    commentInteractions.forEach(interaction => {
      logger.info(`- Comment ${interaction.commentId} on post ${interaction.postId} replied at ${interaction.repliedAt.toISOString()}`);
    });

  } catch (error) {
    logger.error('Failed to process comment interactions', error);
    throw error;
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
    
    logger.info(`Starting to process posts for @${targetUsername} (limit: ${limit})`);
    const result = await instagramService.processNewPosts(targetUsername, limit);
    logger.info(`Processed ${result.processed} posts for @${result.username}`);

    // Get and display commented posts
    const commentedPosts = await instagramService.getCommentedPosts(targetUsername);
    logger.info(`\nTotal commented posts for @${targetUsername}: ${commentedPosts.length}`);
    commentedPosts.forEach(post => {
      logger.info(`- Post ${post.postId} commented at ${post.commentedAt.toISOString()}`);
    });

    // Process comment interactions for a different account
    const commentTargetUsername = config.COMMENT_TARGET_USERNAME || 'shoonya.ai'; // Add this to config
    const commentLimit = Number(config.COMMENT_POST_LIMIT || '5'); // Add this to config
    await processCommentInteractions(instagramService, commentTargetUsername, commentLimit);

  } catch (error) {
    logger.error('Failed to process posts', error);
    process.exit(1);
  }
}

main();