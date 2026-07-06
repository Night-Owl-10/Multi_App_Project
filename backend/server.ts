import express from 'express';
import cors from 'cors';
import { connectDB } from './Connection/connection';
import taskRoutes from './Routes/taskRoute';
import webhookRoutes from './Routes/webhookRoute';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express'

dotenv.config({
    path: `.env.${process.env.NODE_ENV || "development"}`,
});

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
app.use(clerkMiddleware());

app.use('/api', taskRoutes);
app.use('/api', webhookRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});