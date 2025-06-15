// import { Request, Response } from 'express';

// class InstagramController {
//   private static instance: InstagramController;

//   private constructor() {}

//   public static getInstance(): InstagramController {
//     if (!InstagramController.instance) {
//       InstagramController.instance = new InstagramController();
//     }
//     return InstagramController.instance;
//   }

//   async getUserIdByUsername(req: Request, res: Response) {
//     try {
//       const { username } = req.params;
      
//       if (!username) {
//         return res.status(400).json({ error: 'username is required' });
//       }

//       const instagramService = await InstagramService.getInstance();
//       const userId = await instagramService.getUserIdByUsername(username);
      
//       res.status(200).json({ userId });
//     } catch (error) {
//       console.error('Error in getUserIdByUsername:', error);
//       res.status(500).json({ error: 'Failed to get user ID' });
//     }
//   }

//   async createPost(req: Request, res: Response) {
//     try {
//       const { media, caption } = req.body;
      
//       if (!media || !Array.isArray(media) || media.length === 0) {
//         return res.status(400).json({ error: 'Media array is required' });
//       }

//       if (!caption) {
//         return res.status(400).json({ error: 'Caption is required' });
//       }

//       const instagramService = await InstagramService.getInstance();
//       const result = await instagramService.createPost(media, caption);
      
//       res.status(201).json(result);
//     } catch (error) {
//       console.error('Error in createPost:', error);
//       res.status(500).json({ error: 'Failed to create post' });
//     }
//   }

//   async handleComment(req: Request, res: Response) {
//     try {
//       const { mediaId, comment, userId } = req.body;
      
//       if (!mediaId || !comment || !userId) {
//         return res.status(400).json({ error: 'mediaId, comment, and userId are required' });
//       }

//       const instagramService = await InstagramService.getInstance();
//       const result = await instagramService.handleComment(mediaId, comment, userId);
      
//       res.status(200).json(result);
//     } catch (error) {
//       console.error('Error in handleComment:', error);
//       res.status(500).json({ error: 'Failed to handle comment' });
//     }
//   }

//   async likeMedia(req: Request, res: Response) {
//     try {
//       const { mediaId } = req.params;
      
//       if (!mediaId) {
//         return res.status(400).json({ error: 'mediaId is required' });
//       }

//       const instagramService = await InstagramService.getInstance();
//       const result = await instagramService.likeMedia(mediaId);
      
//       res.status(200).json(result);
//     } catch (error) {
//       console.error('Error in likeMedia:', error);
//       res.status(500).json({ error: 'Failed to like media' });
//     }
//   }

//   // Chat controller methods
//   async sendDirectMessage(req: Request, res: Response) {
//     try {
//       const { userId, message } = req.body;
      
//       if (!userId || !message) {
//         return res.status(400).json({ error: 'userId and message are required' });
//       }

//       const instagramService = await InstagramService.getInstance();
//       const result = await instagramService.sendDirectMessage(userId, message);
      
//       res.status(200).json(result);
//     } catch (error) {
//       console.error('Error in sendDirectMessage:', error);
//       res.status(500).json({ error: 'Failed to send direct message' });
//     }
//   }

//   async getDirectMessages(req: Request, res: Response) {
//     try {
//       const { userId } = req.params;
//       const { limit } = req.query;
      
//       if (!userId) {
//         return res.status(400).json({ error: 'userId is required' });
//       }

//       const instagramService = await InstagramService.getInstance();
//       const result = await instagramService.getDirectMessages(
//         userId,
//         limit ? parseInt(limit as string) : undefined
//       );
      
//       res.status(200).json(result);
//     } catch (error) {
//       console.error('Error in getDirectMessages:', error);
//       res.status(500).json({ error: 'Failed to get direct messages' });
//     }
//   }

//   async getChatThreads(req: Request, res: Response) {
//     try {
//       const { limit } = req.query;
      
//       const instagramService = await InstagramService.getInstance();
//       const result = await instagramService.getChatThreads(
//         limit ? parseInt(limit as string) : undefined
//       );
      
//       res.status(200).json(result);
//     } catch (error) {
//       console.error('Error in getChatThreads:', error);
//       res.status(500).json({ error: 'Failed to get chat threads' });
//     }
//   }

//   async markThreadAsSeen(req: Request, res: Response) {
//     try {
//       const { threadId } = req.params;
      
//       if (!threadId) {
//         return res.status(400).json({ error: 'threadId is required' });
//       }

//       const instagramService = await InstagramService.getInstance();
//       const result = await instagramService.markThreadAsSeen(threadId);
      
//       res.status(200).json(result);
//     } catch (error) {
//       console.error('Error in markThreadAsSeen:', error);
//       res.status(500).json({ error: 'Failed to mark thread as seen' });
//     }
//   }
// }

// export default InstagramController; 