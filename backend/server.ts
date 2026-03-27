import express from 'express';
import cors from 'cors';
import { connectDB } from './Connection/connection';
import taskRoutes from './Routes/taskRoute';
import userRoutes from './Routes/userRoute';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', taskRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});