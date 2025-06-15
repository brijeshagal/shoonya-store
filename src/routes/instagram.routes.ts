// import { Router } from 'express';
// import InstagramController from '../controllers/instagram.controller';

// const router = Router();
// const instagramController = InstagramController.getInstance();

// // Get user ID by username
// router.get('/user/:username', async (req, res) => {
//     await instagramController.getUserIdByUsername(req, res)
// });

// // Create a new post
// router.post('/posts', async (req, res) => { 
//     await instagramController.createPost(req, res) 
// });

// // Handle comments
// router.post('/comments', async (req, res) => { 
//     await instagramController.handleComment(req, res) 
// });

// // Like media
// router.post('/media/:mediaId/like', async (req, res) => { 
//     await instagramController.likeMedia(req, res) 
// });

// // Chat routes
// router.post('/chat/message', async (req, res) => {
//     await instagramController.sendDirectMessage(req, res)
// });

// router.get('/chat/messages/:userId', async (req, res) => {
//     await instagramController.getDirectMessages(req, res)
// });

// router.get('/chat/threads', async (req, res) => {
//     await instagramController.getChatThreads(req, res)
// });

// router.post('/chat/threads/:threadId/seen', async (req, res) => {
//     await instagramController.markThreadAsSeen(req, res)
// });

// export default router; 