// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import dotenv from 'dotenv';
// import cron from 'node-cron';
// import instagramRoutes from './routes/instagram.routes';

import { InstagramClientInterface } from "./utils/client";

// // Load environment variables
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware
// app.use(helmet()); // Security headers
// app.use(cors()); // Enable CORS
// app.use(express.json()); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// // Routes
// app.use('/api/instagram', instagramRoutes);

// // Basic route
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to Shoonya Node API' });
// });

// // Error handling middleware
// app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Sample cron job (runs every minute)
// cron.schedule('* * * * *', () => {
//   console.log('Running a task every minute');
// });

// // Start server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// }); 

async function testInstagram(){
  const instagramManager = await InstagramClientInterface.start();
  console.log(instagramManager.state.profile)
  // instagramManager.interaction.sendDM();
  instagramManager.interaction.commentOnPost();
}
testInstagram();