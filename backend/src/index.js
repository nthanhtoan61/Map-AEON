import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import locationRoutes from './routes/locationRoutes.js';

// Load biến môi trường
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());

// Routes
app.use('/api/locations', locationRoutes);

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối với MongoDB'))
  .catch((error) => console.error('❌ Lỗi kết nối MongoDB:', error));

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
}); 