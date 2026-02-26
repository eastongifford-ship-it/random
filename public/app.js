// Global state
let state = {
  connected: false,
  baseURL: null,
  apiToken: null,
  currentGPA: null,
  history: [],
  updateRunning: false
};

// DOM Elements
const setupSection = document.getElementById('setupSection');
const dashboardSection = document.getElementById('dashboardSection');
const setupForm = document.getElementById('setupForm');
const connectionStatus = document.getElementById('connectionStatus');
const currentGPAEl = document.getElementById('currentGPA');
const weightedGPAEl = document.getElementById('weightedGPA');
const courseCountEl = document.getElementById('courseCount');
const gpaLastUpdatedEl = document.getElementById('gpaLastUpdated');
const gradesTableBody = document.getElementById('gradesTableBody');
const refreshBtn = document.getElementById('refreshBtn');
const toggleUpdatesBtn = document.getElementById('toggleUpdatesBtn');
const exportBtn = document.getElementById('exportBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const notificationsContainer = document.getElementById('notificationsContainer');
const toastContainer = document.getElementById('toastContainer');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const noHistoryMessage = document.getElementById('noHistoryMessage');

// Setup Form Handler
setupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const baseURL = document.getElementById('baseURL').value.trim();
  const apiToken = document.getElementById('apiToken').value.trim();

  if (!baseURL || !apiToken) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  try {
    showToast('Connecting to Canvas...', 'info');
    
    const response = await fetch('/api/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseURL, apiToken })
    });

    if (!response.ok) {
      throw new Error('Failed to connect to Canvas');
    }

    state.connected = true;
    state.baseURL = baseURL;
    state.apiToken = apiToken;

    // Save credentials to localStorage (with warning)
    localStorage.setItem('canvasBaseURL', baseURL);
    localStorage.setItem('canvasApiToken', apiToken);

    updateConnectionStatus();
    showSetup(false);
    loadUserProfile();
    refreshGPA();
    showToast('Connected to Canvas successfully!', 'success');
  } catch (error) {
    showToast(`Connection failed: ${error.message}`, 'error');
  }
});

// Load saved credentials
function loadSavedCredentials() {
  const baseURL = localStorage.getItem('canvasBaseURL');
  const apiToken = localStorage.getItem('canvasApiToken');

  if (baseURL && apiToken) {
    document.getElementById('baseURL').value = baseURL;
    document.getElementById('apiToken').value = apiToken;
  }
}

// Update Connection Status
function updateConnectionStatus() {
  if (state.connected) {
    connectionStatus.classList.add('connected');
    connectionStatus.innerHTML = '<span class="status-indicator"></span><span>Connected</span>';
  } else {
    connectionStatus.classList.remove('connected');
    connectionStatus.innerHTML = '<span class="status-indicator"></span><span>Not Connected</span>';
  }
}

// Show/Hide Setup Section
function showSetup(show) {
  if (show) {
    setupSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
  } else {
    setupSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
  }
}

// Load User Profile
async function loadUserProfile() {
  try {
    const response = await fetch('/api/user/profile');
    if (response.ok) {
      const user = await response.json();
      userName.textContent = user.name || 'Student';
      userEmail.textContent = user.email || 'user@example.com';
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
}

// Refresh GPA
async function refreshGPA() {
  try {
    refreshBtn.disabled = true;
    const response = await fetch('/api/gpa/current');
    
    if (!response.ok) {
      throw new Error('Failed to fetch GPA');
    }

    const gpaData = await response.json();
    state.currentGPA = gpaData;

    // Update UI
    currentGPAEl.textContent = gpaData.currentGPA.toFixed(2);
    weightedGPAEl.textContent = gpaData.weightedGPA.toFixed(2);
    courseCountEl.textContent = gpaData.courseCount;
    gpaLastUpdatedEl.textContent = `Last updated: ${formatTime(new Date())}`;

    // Update grades table
    updateGradesTable(gpaData.courses);

    // Load and display history
    loadHistory();

    showToast('GPA updated successfully', 'success');
  } catch (error) {
    showToast(`Error refreshing GPA: ${error.message}`, 'error');
  } finally {
    refreshBtn.disabled = false;
  }
}

// Update Grades Table
function updateGradesTable(courses) {
  if (!courses || courses.length === 0) {
    gradesTableBody.innerHTML = '<tr><td colspan="4" class="loading">No courses available</td></tr>';
    return;
  }

  gradesTableBody.innerHTML = courses
    .map(course => `
      <tr>
        <td>${escapeHtml(course.name)}</td>
        <td>${course.grade.toFixed(1)}%</td>
        <td>${course.letterGrade}</td>
        <td>${course.gradePoint.toFixed(2)}</td>
      </tr>
    `)
    .join('');
}

// Load GPA History
async function loadHistory() {
  try {
    const response = await fetch('/api/gpa/history?days=30');
    if (response.ok) {
      state.history = await response.json();
      renderGPAChart();
    }
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

// Render GPA Chart
function renderGPAChart() {
  const canvas = document.getElementById('gpaChart');
  if (!canvas || !state.history.entries || state.history.entries.length === 0) {
    noHistoryMessage.style.display = 'block';
    return;
  }

  noHistoryMessage.style.display = 'none';

  // Simple chart rendering using canvas
  const ctx = canvas.getContext('2d');
  const entries = state.history.entries;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  canvas.width = width;
  canvas.height = height;

  // Clear canvas
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);

  // Get min and max GPA for scaling
  const gpas = entries.map(e => e.gpa);
  const minGPA = Math.min(...gpas, 3.0);
  const maxGPA = Math.max(...gpas, 4.0);
  const gpaRange = maxGPA - minGPA || 1;

  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = height - (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw line chart
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();

  entries.forEach((entry, index) => {
    const x = (index / Math.max(entries.length - 1, 1)) * width;
    const y = height - ((entry.gpa - minGPA) / gpaRange) * (height * 0.8);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw points
  ctx.fillStyle = '#3b82f6';
  entries.forEach((entry, index) => {
    const x = (index / Math.max(entries.length - 1, 1)) * width;
    const y = height - ((entry.gpa - minGPA) / gpaRange) * (height * 0.8);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Toggle Auto-Update
async function toggleUpdates() {
  try {
    if (state.updateRunning) {
      await fetch('/api/updates/stop', { method: 'POST' });
      state.updateRunning = false;
      toggleUpdatesBtn.textContent = '▶️ Start Auto-Update';
      showNotification('Auto-update stopped', 'info');
    } else {
      await fetch('/api/updates/start', { method: 'POST' });
      state.updateRunning = true;
      toggleUpdatesBtn.textContent = '⏸️ Stop Auto-Update';
      showNotification('Auto-update started - GPA will be checked every 5 minutes', 'success');
    }
  } catch (error) {
    showToast(`Error toggling updates: ${error.message}`, 'error');
  }
}

// Export to CSV
async function exportCSV() {
  try {
    const response = await fetch('/api/export/csv');
    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showToast('Grades exported to CSV', 'success');
  } catch (error) {
    showToast(`Export failed: ${error.message}`, 'error');
  }
}

// Disconnect
function disconnect() {
  if (confirm('Are you sure you want to disconnect? Your local data will be preserved.')) {
    state.connected = false;
    state.currentGPA = null;
    state.history = [];
    updateConnectionStatus();
    showSetup(true);
    notificationsContainer.innerHTML = '';
    showToast('Disconnected from Canvas', 'info');
  }
}

// Show Notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    danger: '❌'
  };

  notification.innerHTML = `
    <div class="notification-icon">${icons[type]}</div>
    <div class="notification-content">
      <div class="notification-message">${escapeHtml(message)}</div>
    </div>
  `;

  notificationsContainer.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}

// Show Toast
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Event Listeners
refreshBtn.addEventListener('click', refreshGPA);
toggleUpdatesBtn.addEventListener('click', toggleUpdates);
exportBtn.addEventListener('click', exportCSV);
disconnectBtn.addEventListener('click', disconnect);

// Format Time
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSavedCredentials();
  updateConnectionStatus();

  // Resize canvas on window resize
  window.addEventListener('resize', () => {
    if (state.history && state.history.entries) {
      renderGPAChart();
    }
  });
});
