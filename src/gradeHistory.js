const fs = require('fs');
const path = require('path');

class GradeHistory {
  constructor(dataDir = 'data') {
    this.dataDir = dataDir;
    this.historyFile = path.join(dataDir, 'gpa_history.json');
    this.ensureDataDir();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Load history from file
   */
  loadHistory() {
    try {
      if (fs.existsSync(this.historyFile)) {
        const data = fs.readFileSync(this.historyFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading history:', error.message);
    }
    return [];
  }

  /**
   * Save history to file
   */
  saveHistory(history) {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('Error saving history:', error.message);
    }
  }

  /**
   * Add GPA snapshot to history
   */
  addSnapshot(gpaData) {
    const history = this.loadHistory();
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      gpa: gpaData.currentGPA,
      weightedGPA: gpaData.weightedGPA,
      courseCount: gpaData.courseCount,
      courses: gpaData.courses
    };

    history.push(snapshot);
    // Keep only last 100 snapshots to avoid huge files
    if (history.length > 100) {
      history.shift();
    }

    this.saveHistory(history);
    return snapshot;
  }

  /**
   * Get history for the last N days
   */
  getHistoryForDays(days) {
    const history = this.loadHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return history.filter(snapshot => {
      return new Date(snapshot.timestamp) >= cutoffDate;
    });
  }

  /**
   * Get all history
   */
  getAllHistory() {
    return this.loadHistory();
  }

  /**
   * Clear old entries (older than N days)
   */
  clearOldEntries(days) {
    const history = this.loadHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filtered = history.filter(snapshot => {
      return new Date(snapshot.timestamp) >= cutoffDate;
    });

    this.saveHistory(filtered);
    return history.length - filtered.length; // Return count of deleted entries
  }

  /**
   * Get latest GPA snapshot
   */
  getLatestSnapshot() {
    const history = this.loadHistory();
    return history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Check if there's a significant GPA change
   */
  detectGPAChange(currentGPA, threshold = 0.1) {
    const latest = this.getLatestSnapshot();
    if (!latest) return null;

    const change = Math.abs(currentGPA - latest.gpa);
    
    if (change >= threshold) {
      return {
        previousGPA: latest.gpa,
        currentGPA: currentGPA,
        change: currentGPA - latest.gpa,
        timestamp: latest.timestamp
      };
    }

    return null;
  }
}

module.exports = GradeHistory;
