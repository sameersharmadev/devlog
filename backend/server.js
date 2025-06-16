import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feedback', feedbackRoutes);
app.listen(4000)