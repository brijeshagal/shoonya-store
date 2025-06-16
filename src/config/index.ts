import * as dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Define configuration schema
const configSchema = z.object({
  // Instagram credentials
  INSTAGRAM_USERNAME: z.string().min(1),
  INSTAGRAM_PASSWORD: z.string().min(1),

  // Database
  DB_PATH: z.string().default('./instagram_comments.db'),

  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Instagram settings
  DEFAULT_TARGET_USERNAME: z.string().default('shoonya_store'),
  DEFAULT_POST_LIMIT: z.string().default('5'),
  COMMENT_TEMPLATE: z.string().default('Great post! Keep up the amazing work! 👏'),
  COMMENT_TARGET_USERNAME: z.string().default('shoonya.ai'),
  COMMENT_POST_LIMIT: z.string().default('5'),

  // OpenAI configuration
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-4-turbo-preview')
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
  COMMENT_TARGET_USERNAME: process.env.COMMENT_TARGET_USERNAME,
  COMMENT_POST_LIMIT: process.env.COMMENT_POST_LIMIT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL
});

export type Config = z.infer<typeof configSchema>;
export default config; 