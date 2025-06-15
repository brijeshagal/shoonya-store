import initSqlJs, { Database } from 'sql.js';
import * as fs from 'fs';
import { DatabaseService, CommentedPost } from '../../core/domain/interfaces/database.interface';
import { Logger } from '../logging/logger';

export class SQLiteDatabaseService implements DatabaseService {
  private db: Database | null = null;
  private readonly dbPath: string;
  private readonly logger: Logger;

  constructor(dbPath: string = './instagram_comments.db') {
    this.dbPath = dbPath;
    this.logger = new Logger('SQLiteDatabase');
  }

  async initialize(): Promise<void> {
    try {
      const SQL = await initSqlJs();
      
      // Load existing database if it exists
      if (fs.existsSync(this.dbPath)) {
        const fileBuffer = fs.readFileSync(this.dbPath);
        this.db = new SQL.Database(fileBuffer);
        this.logger.info('Loaded existing SQLite database');
      } else {
        this.db = new SQL.Database();
        this.logger.info('Created new SQLite database');
      }
      
      if (!this.db) {
        throw new Error('Failed to initialize SQLite database');
      }

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS commented_posts (
          post_id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          commented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          comment_text TEXT NOT NULL
        )
      `);
      
      this.logger.info('SQLite database initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SQLite database', { error });
      throw error;
    }
  }

  private saveDatabase(): void {
    if (this.db) {
      try {
        const data = this.db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(this.dbPath, buffer);
        this.logger.info('Database saved successfully');
      } catch (error) {
        this.logger.error('Failed to save database', error);
        throw error;
      }
    }
  }

  async isPostCommented(postId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      const result = this.db.exec(
        'SELECT post_id FROM commented_posts WHERE post_id = ?',
        [postId]
      );
      const isCommented = result.length > 0;
      this.logger.info(`Post ${postId} is ${isCommented ? 'already' : 'not yet'} commented`);
      return isCommented;
    } catch (error) {
      this.logger.error(`Failed to check if post ${postId} is commented`, error);
      throw error;
    }
  }

  async addCommentedPost(postId: string, username: string, commentText: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      this.db.exec(
        'INSERT INTO commented_posts (post_id, username, comment_text) VALUES (?, ?, ?)',
        [postId, username, commentText]
      );
      this.saveDatabase();
      this.logger.info(`Added post ${postId} to commented posts`);
    } catch (error) {
      this.logger.error(`Failed to add commented post ${postId}`, error);
      throw error;
    }
  }

  async getCommentedPosts(username?: string): Promise<CommentedPost[]> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      const query = username
        ? 'SELECT * FROM commented_posts WHERE username = ?'
        : 'SELECT * FROM commented_posts';
      const params = username ? [username] : [];
      const result = this.db.exec(query, params);
      
      if (result.length === 0) return [];
      
      const columns = result[0].columns;
      return result[0].values.map(row => {
        const obj: any = {};
        columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return {
          postId: obj.post_id,
          username: obj.username,
          commentedAt: new Date(obj.commented_at),
          commentText: obj.comment_text
        };
      });
    } catch (error) {
      this.logger.error('Failed to get commented posts', error);
      throw error;
    }
  }
} 