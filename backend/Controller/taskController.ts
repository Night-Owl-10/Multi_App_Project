import Task from "../Model/taskModel";
import { getAuth } from "@clerk/express";

export const createTask = async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req)

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const { task, status } = req.body;
        const newTask = new Task({
            clerkId: userId,
            task: task,
            status: status
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ message: "Error creating task", error });
    }
};

export const getAllTasks = async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req)

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const tasks = await Task.find({ clerkId: userId }).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks", error });
    }
};

export const updateTask = async (req: any, res: any) => {
    try {
        const { userId } = getAuth(req)

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const { id } = req.params;
        const { task, status } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(id, { task, status }, { new: true });
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
        const { userId } = getAuth(req)

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task", error });
    }
};