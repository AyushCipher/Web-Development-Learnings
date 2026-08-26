// On page load, it fetches tasks from localStorage, if available, and renders them.
document.addEventListener("DOMContentLoaded", () => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (storedTasks) {
        storedTasks.forEach((task) => tasks.push(task));
        updateTasksList();
        updateStats();
    }
});


let tasks = [];                     // Stores the list of task objects.
let currentEditingIndex = -1;       // currentEditingIndex tracks which task is being edited (-1 -> no task is being edited).


// Saves the tasks array to localStorage so it's persistent across page reloads.
const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Adds a new task or edits an existing one and Resets form and updates view.
const addTask = () => {
    const taskInput = document.getElementById("taskInput");
    const text = taskInput.value.trim();
    if (text) {
        // If we're editing an existing task
        if (currentEditingIndex !== -1) {
            tasks[currentEditingIndex].text = text;
            currentEditingIndex = -1;
            document.getElementById("newtask").innerHTML = "+";     // resets the button text from "✓" back to "+" after editing is finished.
        } else {
            // Add a new task
            tasks.push({ text: text, completed: false });
        }
        updateTasksList();
        updateStats();
        saveTasks();
        taskInput.value = ""; // Clear input after adding/editing task
    }
}

// Toggles the task’s completed status (checkbox checked/unchecked).
const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTasksList();
    updateStats();
    saveTasks();
}

// Deletes the task at the specified index.
const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTasksList();
    updateStats();
    saveTasks();
}


// Edit a task
const editTask = (index) => {
    // Filling input with existing text
    const taskInput = document.getElementById("taskInput");
    taskInput.value = tasks[index].text;
    taskInput.focus();
    // Moves the cursor/focus to the input field, so the user can immediately start typing without having to click it manually.
    
    // Change the button text to ✓ that indicates editing mode
    document.getElementById("newtask").innerHTML = "✓";
    
    // Save the index of the task we're currently editing
    currentEditingIndex = index;
}


// Updates the progress bar and stats.
const updateStats = () => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;

    const progressBar = document.querySelector(".progress");
    progressBar.style.width = `${progress}%`;

    document.getElementById("numbers").innerText = `${completedTasks}/${totalTasks}`;

    // If there is at least one task, and all are completed
    if (tasks.length && completedTasks === totalTasks) {
        blastConfetti();
    }
}


// Update the displayed list of tasks
const updateTasksList = () => {
    const taskList = document.querySelector(".task-list");
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");

        listItem.innerHTML = `
            <div class="taskItem">
                <div class="task ${task.completed ? "completed" : ""}">
                    <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""} onClick="toggleTaskComplete(${index})"/>
                    <p>${task.text}</p>
                </div>
                <div class="icons">
                    <i class="fas fa-edit" style="color: #828dff;" onClick="editTask(${index})"></i>
                    <i class="fas fa-trash" style="color: #ff4d4d;" onClick="deleteTask(${index})"></i>
                </div>
            </div>`;
        taskList.append(listItem);
    });
}

document.getElementById("newtask").addEventListener("click", function (e) {
    e.preventDefault();
    addTask();
});

// Add event listener for Enter key in the input field
document.getElementById("taskInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addTask();
    }
});

// Add event listener for Escape key to cancel editing
document.getElementById("taskInput").addEventListener("keydown", function(e) {
    if (e.key === "Escape" && currentEditingIndex !== -1) {
        e.preventDefault();
        // Cancel editing
        currentEditingIndex = -1;
        document.getElementById("newtask").innerHTML = "+";
        this.value = "";
    }
});

const blastConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio, opts) {
        confetti(
            Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio),
            })
        );
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
}