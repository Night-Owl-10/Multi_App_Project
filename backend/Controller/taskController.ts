import Task from "../Model/taskModel";
import User from "../Model/userModal";

export const createTask = async (req: any, res: any) => {
    try {
        const mongoUser = await User.findOne({ firebase_uid: req.user.uid });
        if (!mongoUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const { task, status } = req.body;
        const newTask = new Task({
            user: mongoUser._id,
            task,
            status,
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Error creating task", error });
    }
};

export const getAllTasks = async (req: any, res: any) => {
    try {
        const mongoUser = await User.findOne({ firebase_uid: req.user.uid });
        if (!mongoUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const tasks = await Task.find({ user: mongoUser._id }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error });
    }
};

export const updateTask = async (req: any, res: any) => {
    try {
        const mongoUser = await User.findOne({ firebase_uid: req.user.uid });
        if (!mongoUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const { id } = req.params;
        const { task, status } = req.body;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user: mongoUser._id },
            { task, status },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Error updating task", error });
    }
};

export const deleteTask = async (req: any, res: any) => {
    try {
        const mongoUser = await User.findOne({ firebase_uid: req.user.uid });
        if (!mongoUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const { id } = req.params;

        const deletedTask = await Task.findOneAndDelete({ _id: id, user: mongoUser._id });

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task", error });
    }
};