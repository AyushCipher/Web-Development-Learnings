import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import confetti from "canvas-confetti";

function App() {
  const [tasks, setTasks] = useState([]);                 // tasks is an array of all tasks and setTasks is used to update that array.
  const [input, setInput] = useState("");                 // Holds the value from the input field (task text).
  const [editId, setEditId] = useState(null);             // If we are editing a task, this stores its ID. Otherwise, it stays null
  const [completedCount, setCompletedCount] = useState(0); // Stores how many tasks are marked as completed.
  const progressRef = useRef(null);                         //  lets us directly access the .progress div for updating the width.

  // TO ADD OR EDIT A TASK
  const handleAddTask = (e) => {
    e.preventDefault();

    if (!input.trim()) return;                              // If the input is empty, don't add the task.

    // Updates an existing task's text if you're editing 
    if (editId) {                                           // checks whether you're in edit mode and editId is expected to hold the ID of the task being edited
      setTasks((prev) =>      
        prev.map((task) =>                                      // map() function is used to loop through each task and selectively update one 
          task.id === editId ? { ...task, text: input } : task    // checking if the current task's id matches the editId if true  return a new object with the updated text.
        )
      );
      setEditId(null);                                          // After updating the task, resetting the edit mode.
    } else {
      const newTask = {
        id: Date.now(),                                     // a unique ID using current time in ms
        text: input,                                        // the user’s input.
        completed: false,                                   // false by default.
      };
      setTasks((prev) => [...prev, newTask]);               // We add this task to the existing list using setTasks
    }
    setInput("");
  };

  const handleToggle = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }; 

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleEdit = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);    // Load the selected task’s text into the input field →
    if (taskToEdit) {
      setInput(taskToEdit.text);
      setEditId(id);    // Set the editId to that task’s ID → setEditId(id) so handleAddTask knows you're editing that specific task.
    }
  };

  useEffect(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    setCompletedCount(completed);

    if (progressRef.current) {
      progressRef.current.style.width =
        total === 0 ? "0%" : `${(completed / total) * 100}%`;
    }

    if (total > 0 && completed === total) {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [tasks]);

  return (
    <div className="container">
      <div className="stats-container">
        <div className="details">
          <h1>To-Do List</h1>
          <p>Track your daily goals and stay motivated</p>
          <div className="progressBar">
            <div className="progress" ref={progressRef}></div>
          </div>
        </div>
        <div className="stats-numbers">
          <p id="numbers">
            {completedCount}/{tasks.length}
          </p>
        </div>
      </div>

      <form onSubmit={handleAddTask}>
        <input
          className="inputField"
          type="text"
          placeholder="Add your task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="icon">
          {editId ? "✓" : <FaPlus />}
        </button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="taskItem">
            <div className="task">
              <input
                type="checkbox"
                className="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
              />
              <p className={task.completed ? "completed" : ""}>{task.text}</p>
            </div>
            <div className="icons">
              <FaEdit onClick={() => handleEdit(task.id)} className="icon" />
              <FaTrash onClick={() => handleDelete(task.id)} className="icon" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
