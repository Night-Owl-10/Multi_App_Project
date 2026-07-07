import TaskList from "../components/TaskList"
import { useState } from "react"
import { toast } from "react-toastify"
import API from "../api/axios"

type Task = {
  _id: number;
  task: string;
  status: string;
};

function Home() {

  const [task, setTask] = useState("");
  const [status, setStatus] = useState("pending");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [refetch, setRefetch] = useState(false);

  const isSignedIn = false;

  function handleReset() {
    setTask("");
    setStatus("pending");
  }

  function handleTask(e: React.ChangeEvent<HTMLInputElement>) {
    if (editTask) {
      setEditTask({ ...editTask, task: e.target.value });
    }
    setTask(e.target.value);
  }

  function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    if (editTask) {
      setEditTask({ ...editTask, status: e.target.value });
    }
    setStatus(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      if (!isSignedIn) {
        toast.error("You must be logged in to add or edit tasks");
        return;
      }

      const taskToValidate = editTask ? editTask.task : task;
      if (taskToValidate.trim() === "") {
        toast.error("Task cannot be empty");
        return;
      }

      if (taskToValidate.length > 100) {
        toast.error("Task cannot exceed 100 characters");
        return;
      }

      if (editTask) {
        const response = await API.put(`/tasks/${editTask._id}`, { task: editTask.task, status: editTask.status })
        if (response.status === 200) {
          toast.success("Task updated successfully");
          setEditTask(null);
          setRefetch(prev => !prev);
        } else {
          toast.error(response.data.message || "Error updating task");
        }
      } else {
        const response = await API.post('/tasks', { task, status })
        if (response.status === 201) {
          toast.success("Task added successfully");
          setRefetch(prev => !prev);
        } else {
          toast.error(response.data.message || "Error adding task");
        }
      }
    } catch (error) {
      toast.error("An error occurred while processing your request");
    }
    handleReset();
  }


  return (
    <main className="flex flex-col items-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-300 shadow-gray-400 shadow-md rounded-lg w-full min-h-32 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 mt-8">
        <input type="text" placeholder="Enter Task" onChange={(e) => handleTask(e)} name="task" value={editTask ? editTask.task : task} className="w-full sm:w-3/4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select onChange={(e) => handleStatus(e)} name="status" value={editTask ? editTask.status : status} className="w-1/2 xs:w-1/4 sm:w-1/8 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button type="button" onClick={handleReset} className="w-1/2 xs:w-1/4 sm:w-1/12 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors duration-300">Clear</button>
        <button type="submit" className="w-1/2 xs:w-1/4 sm:w-1/12 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-300">{editTask ? "Update" : "Add"}</button>
      </form>

      <div className="bg-white border border-gray-300 shadow-gray-400 shadow-md rounded-lg w-full flex flex-col gap-4 p-4 mt-24 h-105 overflow-y-scroll">
        {!isSignedIn
          ? <p className="text-center text-gray-500">Please sign in to view and manage your tasks.</p>
          : <TaskList setEditTask={setEditTask} refetch={refetch} setRefetch={setRefetch} />
        }
      </div>

    </main>
  )
}

export default Home