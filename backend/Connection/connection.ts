import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/ToDoAppDB")
        console.log("✅ Database connection is successful.");

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}