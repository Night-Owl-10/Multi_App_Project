import express from 'express';
import { createTask, deleteTask, getAllTasks, updateTask } from '../Controller/taskController';


const router = express.Router();

router.post('/tasks', createTask);
router.get('/tasks', getAllTasks);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;