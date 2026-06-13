import { Edit, Delete } from 'lucide-react'
import clsx from 'clsx'
import { useState, useEffect } from 'react'
import API from '../api/axios'
import { toast } from 'react-toastify'
import { useUser } from "@clerk/react";

type Tasks = {
  _id: number;
  task: string;
  status: string;
}

type TaskListProps = {
  setEditTask: React.Dispatch<React.SetStateAction<Tasks | null>>;
  refetch: boolean;
  setRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}

function TaskList({ setEditTask, refetch, setRefetch }: TaskListProps) {
  const [taskList, setTaskList] = useState<Tasks[]>([]);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await API.get('/tasks');
        setTaskList(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
  }, [refetch, isSignedIn]);

  function handleEdit(id: number) {
    const taskToEdit = taskList.find(task => task._id === id);
    if (taskToEdit) {
      setEditTask(taskToEdit);
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await API.delete(`/tasks/${id}`);
      if (response.status === 200) {
        toast.success("Task deleted successfully");
        setRefetch(prev => !prev);
      } else {
        toast.error(response.data.message || "Error deleting task");
      }
    }
    catch (error) {
      toast.error("Error deleting task");
    }
  }

  return (
    <>
      {
        taskList.map((task) => (
          <div key={task._id} className={clsx("w-full flex flex-col gap-4 sm:gap-0 sm:flex-row justify-center sm:justify-between border border-b-2 shadow-md rounded-lg p-4", task.status === "completed" ? "border-green-500 shadow-green-200" : "border-red-500 shadow-red-200")}>
            <p className="sm:w-[80%] w-full">{task.task}</p>
            <div className="sm:w-[20%] w-full flex gap-2 sm:justify-end justify-center items-center">
              <button onClick={() => handleEdit(task._id)} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-300 cursor-pointer flex items-center">
                <Edit className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]" />
              </button>
              <button onClick={() => handleDelete(task._id)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors duration-300 cursor-pointer flex items-center">
                <Delete className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px]" />
              </button>
            </div>
          </div>
        ))
      }
    </>
  )
}

export default TaskList