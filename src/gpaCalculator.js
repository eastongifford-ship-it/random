/**
 * Calculate GPA based on grades
 * Supports weighted GPA calculation
 */

class GPACalculator {
  /**
   * Calculate GPA from course grades
   * @param {Array} courses - Array of courses with grade information
   * @returns {Object} - GPA calculations
   */
  static calculateGPA(courses) {
    if (!courses || courses.length === 0) {
      return { currentGPA: 0, weightedGPA: 0, courses: [] };
    }

    let totalPoints = 0;
    let totalCredits = 0;
    const processedCourses = [];

    courses.forEach(course => {
      // Try multiple common Canvas fields for a final/current grade
      let gradeValue = null;

      if (course.current_final_grade !== undefined && course.current_final_grade !== null) {
        gradeValue = course.current_final_grade;
      } else if (course.enrollments && course.enrollments.length > 0) {
        const enrollment = course.enrollments[0];
        if (enrollment.computed_final_score !== undefined && enrollment.computed_final_score !== null) {
          gradeValue = enrollment.computed_final_score;
        } else if (enrollment.computed_current_score !== undefined && enrollment.computed_current_score !== null) {
          gradeValue = enrollment.computed_current_score;
        } else if (enrollment.grades) {
          if (enrollment.grades.final_score !== undefined && enrollment.grades.final_score !== null) {
            gradeValue = enrollment.grades.final_score;
          } else if (enrollment.grades.current_score !== undefined && enrollment.grades.current_score !== null) {
            gradeValue = enrollment.grades.current_score;
          }
        }
      }

      if (gradeValue === null || gradeValue === undefined) {
        return; // Skip courses without usable grade information
      }

      const grade = parseFloat(gradeValue);
      if (isNaN(grade)) return;

      const credits = course.total_weight || course.credit_hours || 1; // Default to 1 credit if not specified

      const gradePoint = this.gradeToPoint(grade);
      
      processedCourses.push({
        id: course.id,
        name: course.name,
        grade: grade,
        gradePoint: gradePoint,
        credits: credits,
        letterGrade: this.pointToLetter(gradePoint)
      });

      totalPoints += gradePoint * credits;
      totalCredits += credits;
    });

    const weightedGPA = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    const simpleGPA = this.calculateSimpleGPA(processedCourses);

    return {
      currentGPA: Number(simpleGPA.toFixed(2)),
      weightedGPA: Number(weightedGPA.toFixed(2)),
      courseCount: processedCourses.length,
      courses: processedCourses,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Convert percentage grade to 4.0 scale point
   * @param {Number} percentage - Grade percentage (0-100)
   * @returns {Number} - Grade point (0-4.0)
   */
  static gradeToPoint(percentage) {
    if (percentage >= 93) return 4.0;
    if (percentage >= 90) return 3.9;
    if (percentage >= 87) return 3.8;
    if (percentage >= 83) return 3.7;
    if (percentage >= 80) return 3.6;
    if (percentage >= 77) return 3.5;
    if (percentage >= 73) return 3.4;
    if (percentage >= 70) return 3.3;
    if (percentage >= 67) return 3.2;
    if (percentage >= 63) return 3.1;
    if (percentage >= 60) return 3.0;
    if (percentage >= 57) return 2.9;
    if (percentage >= 53) return 2.8;
    if (percentage >= 50) return 2.7;
    if (percentage >= 47) return 2.6;
    if (percentage >= 43) return 2.5;
    if (percentage >= 40) return 2.4;
    return 2.0;
  }

  /**
   * Convert grade point to letter grade
   * @param {Number} point - Grade point (0-4.0)
   * @returns {String} - Letter grade
   */
  static pointToLetter(point) {
    if (point >= 3.9) return 'A+';
    if (point >= 3.7) return 'A';
    if (point >= 3.5) return 'A-';
    if (point >= 3.3) return 'B+';
    if (point >= 3.1) return 'B';
    if (point >= 2.9) return 'B-';
    if (point >= 2.7) return 'C+';
    if (point >= 2.5) return 'C';
    if (point >= 2.3) return 'C-';
    if (point >= 2.1) return 'D+';
    if (point >= 1.9) return 'D';
    if (point >= 1.7) return 'D-';
    return 'F';
  }

  /**
   * Calculate simple average GPA (unweighted)
   * @param {Array} courses - Processed courses array
   * @returns {Number} - Simple GPA
   */
  static calculateSimpleGPA(courses) {
    if (courses.length === 0) return 0;
    const sum = courses.reduce((acc, course) => acc + course.gradePoint, 0);
    return sum / courses.length;
  }

  /**
   * Calculate grade change between two GPA snapshots
   * @param {Number} oldGPA - Previous GPA
   * @param {Number} newGPA - Current GPA
   * @returns {Object} - Change details
   */
  static calculateGPAChange(oldGPA, newGPA) {
    const change = newGPA - oldGPA;
    const percentChange = oldGPA !== 0 ? ((change / oldGPA) * 100) : 0;

    return {
      change: Number(change.toFixed(3)),
      percentChange: Number(percentChange.toFixed(2)),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }
}

module.exports = GPACalculator;
