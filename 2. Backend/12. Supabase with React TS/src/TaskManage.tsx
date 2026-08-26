import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Task } from './types';
import {
  fetchAllTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadImage,
  subscribeToTaskChanges,
} from './api';
import { getErrorMessage } from './helpers';


export default function TaskManager({ session }: any) {
  // STATE MANAGEMENT
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state for creating new task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskImage, setNewTaskImage] = useState<File | null>(null);

  // Form state for editing task (null = not editing)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // LOAD TASKS ON MOUNT
  useEffect(() => {
    loadTasks();

    // Subscribe to real-time updates for this user
    const userEmail = session?.user?.email;
    if (userEmail) {
      const unsubscribe = subscribeToTaskChanges(
        (newTask) => {
          setTasks((prev) => {
            // Check if task already exists (to prevent duplicates)
            const exists = prev.some(t => t.id === newTask.id);
            if (exists) {
              // Update existing task
              return prev.map(t => t.id === newTask.id ? newTask : t);
            } else {
              // Add new task
              return [newTask, ...prev];
            }
          });
          toast.success('Task updated in real-time!');
        },
        userEmail,
        (taskId) => {
          setTasks((prev) => prev.filter(t => t.id !== taskId));
          toast.success('Task deleted in real-time!');
        }
      );

      return unsubscribe;
    }
  }, [session]);

  // LOAD ALL TASKS 
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTasks();
      setTasks(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };



  // CREATE NEW TASK
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!newTaskTitle.trim() || !newTaskDesc.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      // Upload image if provided
      let imageUrl: string | null = null;
      if (newTaskImage) {
        toast.loading('📤 Uploading image...');
        imageUrl = await uploadImage(newTaskImage);
        toast.dismiss(); // Dismiss loading toast
      }

      // Create task in database
      const newTask = await createTask(
        newTaskTitle,
        newTaskDesc,
        imageUrl,
        session.user.email
      );

      if (newTask) {
        setTasks((prev) => [newTask, ...prev]);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskImage(null);
        toast.success('Task created successfully!');
      }
    } catch (err) {
      toast.dismiss(); // Dismiss any loading toast
      toast.error(`Failed to create task: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };



  // EDIT TASK 
  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
  };



  // UPDATE TASK
  const handleUpdateTask = async (e: React.FormEvent, taskId: number) => {
    e.preventDefault();

    if (!editTitle.trim() || !editDesc.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await updateTask(taskId, editTitle, editDesc);

      // Update UI
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, title: editTitle, description: editDesc }
            : task
        )
      );

      setEditingTaskId(null);
      setEditTitle('');
      setEditDesc('');
      toast.success('Task updated successfully!');
    } catch (err) {
      toast.error(`Failed to update task: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };



  // DELETE TASK WITH CONFIRMATION
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      setLoading(true);
      await deleteTask(taskId);

      // Remove from UI
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (err) {
      toast.error(`Failed to delete task: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE FILE INPUT WITH VALIDATION
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setNewTaskImage(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WebP images are allowed');
      e.target.value = ''; // Reset input
      return;
    }

    setNewTaskImage(file);
    toast.success(`✅ Image selected: ${file.name}`);
  };

  // RENDER COMPONENT
  return (
    <div className="task-container">
      

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="task-title">📝 Task Manager</h1>
      </div>

      {/* CREATE TASK FORM */}
      <form onSubmit={handleCreateTask} className="task-form">
        <h2>Add New Task</h2>

        <input
          type="text"
          placeholder="Task title"
          className="task-input"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          disabled={loading}
        />

        <textarea
          placeholder="Task description"
          className="task-textarea"
          value={newTaskDesc}
          onChange={(e) => setNewTaskDesc(e.target.value)}
          disabled={loading}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          disabled={loading}
        />
        {newTaskImage && (
          <p style={{ fontSize: '0.9em', color: '#666', margin: '5px 0' }}>
            📁 Selected: {newTaskImage.name} ({(newTaskImage.size / 1024).toFixed(2)} KB)
          </p>
        )}

        <button type="submit" className="task-button" disabled={loading}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {/* TASKS LIST */}
      <div className="task-list">
        <h2>Your Tasks ({tasks.length})</h2>

        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Create your first task!</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-card">
              {/* Display Mode */}
              {editingTaskId !== task.id && (
                <>
                  <div className="task-content">
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    {task.image_url && (
                      <img src={task.image_url} alt={task.title} className="task-image" />
                    )}
                  </div>

                  <div className="task-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditTask(task)}
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </>
              )}

              {/* Edit Mode */}
              {editingTaskId === task.id && (
                <form onSubmit={(e) => handleUpdateTask(e, task.id)} className="edit-form">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="task-input"
                    disabled={loading}
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="task-textarea"
                    disabled={loading}
                  />
                  <div className="edit-actions">
                    <button type="submit" className="save-btn" disabled={loading}>
                      💾 Save
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setEditingTaskId(null)}
                      disabled={loading}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
