import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import followRoutes from './routes/followRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config();
const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://devlog-hmcjvqzxi-sameer-sharmas-projects-ccb3db7d.vercel.app',
        'https://devlog.sameersharma.me'
      ],
    credentials: true               
  }));app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes);

app.listen(4000)