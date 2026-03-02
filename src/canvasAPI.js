const axios = require('axios');

class CanvasAPI {
  constructor(baseURL, apiToken) {
    this.baseURL = baseURL;
    this.apiToken = apiToken;
    this.client = axios.create({
      baseURL: baseURL,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Get all courses for the user
   */
  async getCourses() {
    try {
      // Use the user courses endpoint and include enrollments so we can access grade info
      const response = await this.client.get('/api/v1/users/self/courses', {
        params: {
          per_page: 100,
          include: ['term', 'enrollments']
        }
      });
      return response.data;
    } catch (error) {
      // include more context when logging so that 404s or other status codes are easier
      let details = error.response ? ` status=${error.response.status} data=${JSON.stringify(error.response.data)}` : '';
      console.error('Error fetching courses:', error.message + details);
      throw error;
    }
  }

  /**
   * Get all assignments for a specific course
   */
  async getAssignments(courseId) {
    try {
      const response = await this.client.get(`/api/v1/courses/${courseId}/assignments`, {
        params: {
          per_page: 100,
          include: ['submission']
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching assignments for course ${courseId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get submissions for a specific course
   */
  async getSubmissions(courseId) {
    try {
      const response = await this.client.get(`/api/v1/courses/${courseId}/students/submissions`, {
        params: {
          per_page: 100,
          include: ['assignment']
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching submissions for course ${courseId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get course grades
   */
  async getCourseGrades(courseId) {
    try {
      const response = await this.client.get(`/api/v1/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course grades for ${courseId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const response = await this.client.get('/api/v1/users/self');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      throw error;
    }
  }
}

module.exports = CanvasAPI;
