import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    // user: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //     required: true
    // },
    clerkId: {
        type: String,
        required: true
    },
    task: String,
    status: String
}, { timestamps: true });

const taskModel = mongoose.model("Task", taskSchema);

export default taskModel;