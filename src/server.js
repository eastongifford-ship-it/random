const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const CanvasAPI = require('./canvasAPI');
const GPACalculator = require('./gpaCalculator');
const GradeHistory = require('./gradeHistory');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize services
let canvasAPI = null;
let gradeHistory = new GradeHistory('./data');
let lastGPAData = null;
let updateInterval = null;

// Auto-initialize Canvas API from environment variables if provided
if (process.env.CANVAS_BASE_URL && process.env.CANVAS_API_TOKEN) {
  initializeCanvasAPI(process.env.CANVAS_BASE_URL, process.env.CANVAS_API_TOKEN);
  console.log('Canvas API auto-initialized from environment variables');
}

/**
 * Initialize Canvas API connection
 */
function initializeCanvasAPI(baseURL, apiToken) {
  canvasAPI = new CanvasAPI(baseURL, apiToken);
}

/**
 * Fetch and calculate current GPA
 */
async function fetchCurrentGPA() {
  try {
    if (!canvasAPI) {
      throw new Error('Canvas API not initialized');
    }

    const courses = await canvasAPI.getCourses();
    const gpaData = GPACalculator.calculateGPA(courses);
    
    // Detect significant changes
    const change = gradeHistory.detectGPAChange(gpaData.currentGPA);
    if (change) {
      console.log('GPA Change detected:', change);
    }

    // Store in history
    gradeHistory.addSnapshot(gpaData);
    lastGPAData = gpaData;

    return gpaData;
  } catch (error) {
    // log the canvas error if available
    if (error.response) {
      console.error('Error fetching current GPA:', error.message, 'status', error.response.status, 'data', error.response.data);
    } else {
      console.error('Error fetching current GPA:', error.message);
    }
    throw error;
  }
}

/**
 * Start periodic updates
 */
function startPeriodicUpdates() {
  const interval = process.env.UPDATE_INTERVAL || 300000; // 5 minutes default

  updateInterval = setInterval(async () => {
    try {
      await fetchCurrentGPA();
      console.log(`[${new Date().toISOString()}] GPA updated`);
    } catch (error) {
      console.error('Error in periodic update:', error.message);
    }
  }, interval);

  console.log(`Periodic updates started (every ${interval / 1000} seconds)`);
}

/**
 * Stop periodic updates
 */
function stopPeriodicUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log('Periodic updates stopped');
  }
}

// Routes

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Initialize connection with Canvas credentials
 */
app.post('/api/init', (req, res) => {
  try {
    const { baseURL, apiToken } = req.body;

    if (!baseURL || !apiToken) {
      return res.status(400).json({ error: 'Missing baseURL or apiToken' });
    }

    initializeCanvasAPI(baseURL, apiToken);
    res.json({ status: 'initialized', message: 'Canvas API initialized successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get current GPA
 */
app.get('/api/gpa/current', async (req, res) => {
  try {
    if (!canvasAPI) {
      return res.status(400).json({ error: 'Canvas API not initialized. Please call /api/init first.' });
    }

    const gpaData = await fetchCurrentGPA();
    res.json(gpaData);
  } catch (error) {
    // propagate status and details when thrown by axios
    if (error.response) {
      const status = error.response.status || 500;
      return res.status(status).json({
        error: error.message,
        details: error.response.data || null
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get GPA history
 */
app.get('/api/gpa/history', (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const history = gradeHistory.getHistoryForDays(days);
    res.json({ days, entries: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all history
 */
app.get('/api/gpa/history/all', (req, res) => {
  try {
    const history = gradeHistory.getAllHistory();
    res.json({ entries: history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start updates
 */
app.post('/api/updates/start', (req, res) => {
  try {
    if (!canvasAPI) {
      return res.status(400).json({ error: 'Canvas API not initialized' });
    }

    if (updateInterval) {
      return res.status(400).json({ message: 'Updates already running' });
    }

    startPeriodicUpdates();
    res.json({ status: 'running', message: 'Periodic updates started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Stop updates
 */
app.post('/api/updates/stop', (req, res) => {
  try {
    stopPeriodicUpdates();
    res.json({ status: 'stopped', message: 'Periodic updates stopped' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get update status
 */
app.get('/api/updates/status', (req, res) => {
  res.json({
    running: updateInterval !== null,
    lastUpdate: lastGPAData ? lastGPAData.lastUpdated : null
  });
});

/**
 * Get user profile
 */
app.get('/api/user/profile', async (req, res) => {
  try {
    if (!canvasAPI) {
      return res.status(400).json({ error: 'Canvas API not initialized' });
    }

    const profile = await canvasAPI.getUserProfile();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Export grades as CSV
 */
app.get('/api/export/csv', (req, res) => {
  try {
    if (!lastGPAData) {
      return res.status(400).json({ error: 'No GPA data available' });
    }

    const courses = lastGPAData.courses;
    let csv = 'Course Name,Grade (%),Letter Grade,Grade Point\n';

    courses.forEach(course => {
      csv += `"${course.name}",${course.grade},${course.letterGrade},${course.gradePoint}\n`;
    });

    csv += `\nGPA Summary\n`;
    csv += `Current GPA,${lastGPAData.currentGPA}\n`;
    csv += `Weighted GPA,${lastGPAData.weightedGPA}\n`;
    csv += `Course Count,${lastGPAData.courseCount}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="grades.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(`Canvas GPA Tracker server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to use the application`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  stopPeriodicUpdates();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  stopPeriodicUpdates();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
