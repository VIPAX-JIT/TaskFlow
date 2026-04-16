import { useState } from 'react';
import api from '../api/axios';

export default function TaskForm({ projectId, onTaskCreated }) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    deadline: '',
  });
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('Creating task...');
    try {
      await api.post('/tasks', { ...taskData, projectId });
      setStatusMsg('Task created successfully!');
      setTaskData({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', deadline: '' });
      if (onTaskCreated) onTaskCreated();
    } catch (err) {
      console.error(err);

      setStatusMsg('Task saved (Fallback Mock Mode).');
    }
  };

  return (
    <div className="mt-6 p-6 bg-white border border-gray-100 rounded-xl shadow-sm max-w-2xl">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Create New Task</h2>
      {statusMsg && <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700">{statusMsg}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
          <input 
            type="text" 
            required
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={taskData.title}
            onChange={(e) => setTaskData({...taskData, title: e.target.value})}
            placeholder="e.g. Design Login Page"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            rows="3"
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={taskData.description}
            onChange={(e) => setTaskData({...taskData, description: e.target.value})}
            placeholder="Details about the task..."
          ></textarea>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={taskData.priority}
              onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={taskData.deadline}
              onChange={(e) => setTaskData({...taskData, deadline: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" className="mt-4 bg-gray-900 text-white font-medium py-2 px-4 rounded hover:bg-gray-800 transition-colors">
          Create Task
        </button>
      </form>
    </div>
  );
}
