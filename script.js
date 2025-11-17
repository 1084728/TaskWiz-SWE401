// --- Data model ---
let tasks = [];

const taskForm = document.getElementById("task-form");
const taskTableBody = document.querySelector("#task-table tbody");
const prioritizeBtn = document.getElementById("prioritize-btn");
const clearBtn = document.getElementById("clear-btn");

// Summary elements
const summaryTotal = document.getElementById("summary-total");
const summaryHigh = document.getElementById("summary-high");
const summaryHours = document.getElementById("summary-hours");

// Load tasks from localStorage on page load
window.addEventListener("load", () => {
  const stored = localStorage.getItem("taskwiz_tasks");
  if (stored) {
    tasks = JSON.parse(stored);
  }
  renderTasks();
});

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("taskwiz_tasks", JSON.stringify(tasks));
}

// Update summary boxes
function updateSummary() {
  const total = tasks.length;
  const totalHours = tasks.reduce((sum, t) => sum + (t.hours || 0), 0);
  const highPriorityCount = tasks.filter(t => (t.priority || 0) >= 10).length;

  summaryTotal.textContent = total;
  summaryHours.textContent = totalHours;
  summaryHigh.textContent = highPriorityCount;
}

// Handle Add Task form submit
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const deadline = document.getElementById("deadline").value;
  const hours = Number(document.getElementById("hours").value);
  const difficulty = Number(document.getElementById("difficulty").value);
  const category = document.getElementById("category").value;

  if (!title || !deadline) {
    alert("Please enter a title and deadline.");
    return;
  }

  const task = {
    id: Date.now(),
    title,
    deadline,
    hours,
    difficulty,
    category,
    priority: 0
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  taskForm.reset();
});

// Simple "AI-style" priority scoring function
function calculatePriority(task) {
  const today = new Date();
  const due = new Date(task.deadline);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.max(1, Math.round((due - today) / msPerDay));

  // Near deadline -> higher score
  const deadlineScore = 10 / daysLeft;
  const difficultyScore = task.difficulty * 2;
  const effortScore = task.hours;

  return Number((deadlineScore + difficultyScore + effortScore).toFixed(2));
}

// Prioritize button
prioritizeBtn.addEventListener("click", () => {
  tasks = tasks.map(t => ({ ...t, priority: calculatePriority(t) }));
  tasks.sort((a, b) => b.priority - a.priority);
  saveTasks();
  renderTasks();
});

// Clear all tasks
clearBtn.addEventListener("click", () => {
  if (confirm("Clear all tasks?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// Delete one task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// Render tasks into the table
function renderTasks() {
  taskTableBody.innerHTML = "";
  tasks.forEach(task => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${task.title}</td>
      <td>${task.deadline}</td>
      <td>${task.hours}</td>
      <td>${task.difficulty}</td>
      <td>${task.category}</td>
      <td>${task.priority || "-"}</td>
      <td><button onclick="deleteTask(${task.id})">Delete</button></td>
    `;

    taskTableBody.appendChild(tr);
  });

  updateSummary();
}

// make deleteTask visible to HTML onclick
window.deleteTask = deleteTask;
