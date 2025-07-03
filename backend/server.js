import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch'; // If using Node <18

// Routes
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import followRoutes from './routes/followRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoute from './routes/dashboardRoute.js';
import searchRoutes from './routes/search.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://devlog-hmcjvqzxi-sameer-sharmas-projects-ccb3db7d.vercel.app',
    'https://devlog.sameersharma.me'
  ],
  credentials: true
}));
app.use(express.json());

]app.get('/ping', (req, res) => {
  res.status(200).type('text/plain').send('pong');
});

setInterval(() => {
  fetch('https://devlog-8wzf.onrender.com/ping') 
    .then(res => res.text())
    .then(data => console.log('[Keep-alive] Pinged:', data))
    .catch(err => console.error('[Keep-alive] Ping failed:', err));
}, 14 * 60 * 1000); 

// Routes
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
