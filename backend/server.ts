import express from 'express';
import cors from 'cors';
import { connectDB } from './Connection/connection';
import taskRoutes from './Routes/taskRoute';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRoutes from './Routes/userRoute';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:5173",
    "https://multi-app-project.vercel.app",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api', taskRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});