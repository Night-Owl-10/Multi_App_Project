import express from 'express';
import { createTask, deleteTask, getAllTasks, updateTask } from '../Controller/taskController';
import { verifyFirebaseToken } from '../Middleware/firebaseAuth';

const router = express.Router();

router.post('/tasks', verifyFirebaseToken, createTask);
router.get('/tasks', verifyFirebaseToken, getAllTasks);
router.put('/tasks/:id', verifyFirebaseToken, updateTask);
router.delete('/tasks/:id', verifyFirebaseToken, deleteTask);

export default router;