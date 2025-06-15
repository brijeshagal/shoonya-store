import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define configuration schema
const configSchema = z.object({
  // Instagram credentials
  INSTAGRAM_USERNAME: z.string(),
  INSTAGRAM_PASSWORD: z.string(),

  // Database
  DB_PATH: z.string().default('./instagram_comments.db'),

  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Instagram settings
  DEFAULT_TARGET_USERNAME: z.string().default('shoonya_store'),
  DEFAULT_POST_LIMIT: z.string().default('5'),
  COMMENT_TEMPLATE: z.string().default('Great post! Keep up the amazing work! 👏'),
});

// Parse and validate configuration
const config = configSchema.parse({
  INSTAGRAM_USERNAME: process.env.INSTAGRAM_USERNAME,
  INSTAGRAM_PASSWORD: process.env.INSTAGRAM_PASSWORD,
  DB_PATH: process.env.DB_PATH,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DEFAULT_TARGET_USERNAME: process.env.DEFAULT_TARGET_USERNAME,
  DEFAULT_POST_LIMIT: process.env.DEFAULT_POST_LIMIT,
  COMMENT_TEMPLATE: process.env.COMMENT_TEMPLATE,
});

export default config; 