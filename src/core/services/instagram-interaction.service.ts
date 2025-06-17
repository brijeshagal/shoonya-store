import { Logger } from '../../scripts/logging/logger';
import { DatabaseService } from '../domain/interfaces/database.interface';
import { InstagramComment, InstagramInteractionResult, InstagramPost, InstagramService, InstagramUser } from '../domain/interfaces/instagram.interface';
import { LLMInteractionService } from './llm-interaction.service';
import { ContentContext, MediaContent } from '../domain/interfaces/llm.interface';
import { InstagramGraphService } from './instagram-graph.service';

export class InstagramInteractionService {
  private readonly instagram: InstagramService;
  private readonly database: DatabaseService;
  private readonly logger: Logger;
  private readonly llmService: LLMInteractionService;

  constructor(database: DatabaseService, llmService: LLMInteractionService) {
    this.instagram = new InstagramGraphService();
    this.database = database;
    this.logger = new Logger('InstagramInteractionService');
    this.llmService = llmService;
  }

  // ... existing code ...
} 