/**
 * StorageManager - Utility for handling localStorage operations
 * Provides methods to save, retrieve, and manage user progress data
 */
class StorageManager {
	/**
	 * Save data to localStorage with the given key
	 * @param {string} key - The key to store the data under
	 * @param {any} data - The data to store (will be JSON stringified)
	 */
	static saveData(key, data) {
		try {
			localStorage.setItem(key, JSON.stringify(data));
			return true;
		} catch (error) {
			console.error("Error saving data to localStorage:", error);
			return false;
		}
	}

	/**
	 * Retrieve data from localStorage by key
	 * @param {string} key - The key to retrieve data for
	 * @param {any} defaultValue - Default value if the key doesn't exist
	 * @returns {any} The parsed data or defaultValue if not found
	 */
	static getData(key, defaultValue = null) {
		try {
			const data = localStorage.getItem(key);
			return data ? JSON.parse(data) : defaultValue;
		} catch (error) {
			console.error("Error retrieving data from localStorage:", error);
			return defaultValue;
		}
	}

	/**
	 * Update a specific field in an object stored in localStorage
	 * @param {string} key - The localStorage key
	 * @param {string} field - The field in the object to update
	 * @param {any} value - The new value
	 */
	static updateField(key, field, value) {
		const data = this.getData(key, {});
		data[field] = value;
		return this.saveData(key, data);
	}

	/**
	 * Clear all data for this application from localStorage
	 */
	static clearAllData() {
		// Get all keys that belong to our application
		const appKeys = Object.keys(localStorage).filter((key) =>
			key.startsWith("techCourses_")
		);

		// Remove each key
		appKeys.forEach((key) => localStorage.removeItem(key));
		return appKeys.length;
	}

	/**
	 * Reset progress for a specific course
	 * @param {string} courseId - The ID of the course to reset
	 */
	static resetCourseProgress(courseId) {
		const key = `techCourses_progress_${courseId}`;

		// Initialize with completely empty defaults to ensure full reset
		const newCourseData = {
			id: courseId,
			completed: 0,
			completedVideos: [],
			progress: 0,
			grade: null,
			quizCompleted: false, // Keeping for backward compatibility
			completedQuizzes: {}, // New object to track individual quizzes
			videoProgress: {}, // Ensure this is completely empty
		};

		// First remove the key completely to ensure no data remains
		localStorage.removeItem(key);

		// Then save fresh data
		this.saveData(key, newCourseData);

		console.log(
			`Course ${courseId} progress has been reset in StorageManager`
		);

		// Reset all related keys for this course to be thorough
		const relatedKeys = Object.keys(localStorage).filter(
			(k) => k.startsWith(`techCourses_`) && k.includes(`_${courseId}`)
		);
		relatedKeys.forEach((key) => localStorage.removeItem(key));

		// DO NOT call ProgressManager.resetCourseProgress here - will cause double reset
		// The calling function will handle that separately
	}

	/**
	 * Get course data from storage or initialize if not present
	 * @param {number} courseId - The ID of the course to get
	 * @returns {Object} The course data
	 */
	static getCourseData(courseId) {
		const key = `techCourses_progress_${courseId}`;
		const storedData = this.getData(key, null);

		if (storedData) {
			return storedData;
		}

		// Initialize with defaults if not found
		const newCourseData = {
			id: courseId,
			completed: 0,
			completedVideos: [],
			progress: 0,
			grade: null,
			quizCompleted: false, // Keeping for backward compatibility
			completedQuizzes: {}, // New object to track individual quizzes
			videoProgress: {}, // Store detailed video progress
		};

		this.saveData(key, newCourseData);
		return newCourseData;
	}

	/**
	 * Track video completion for a course
	 * @param {number} courseId - The ID of the course
	 * @param {number} videoIndex - The index of the completed video
	 * @returns {Object} Updated course data with new progress percentage
	 */
	static trackVideoCompletion(courseId, videoIndex) {
		const courseData = this.getCourseData(courseId);

		// Add to completed videos if not already there
		if (!courseData.completedVideos.includes(videoIndex)) {
			courseData.completedVideos.push(videoIndex);

			// Recalculate progress
			this.recalculateProgress(courseId, courseData);

			// Save updated data
			this.saveData(`techCourses_progress_${courseId}`, courseData);

			// Sync with global progress if ProgressManager exists
			if (
				window.ProgressManager &&
				typeof window.ProgressManager.updateCourseProgress ===
					"function"
			) {
				window.ProgressManager.updateCourseProgress(courseId, {
					videosWatched: courseData.completedVideos.length,
					progress: courseData.progress,
				});
			}
		}

		return courseData;
	}

	/**
	 * Recalculate course progress based on completed videos and quizzes
	 * @param {number} courseId - The ID of the course
	 * @param {Object} courseData - The course data object
	 * @returns {number} The updated progress percentage
	 */
	static recalculateProgress(courseId, courseData) {
		// Get course structure directly from course-data.js
		const course = window.courses?.find((c) => c.id === courseId);
		if (!course || !course.sections) return 0;

		// Count total videos and quizzes
		let totalVideos = 0;
		let totalQuizzes = 0;
		let quizIds = [];

		course.sections.forEach((section) => {
			if (section.videos) totalVideos += section.videos.length;
			if (section.quiz) {
				totalQuizzes++;
				quizIds.push(section.quiz.id);
			}
		});

		// Calculate completed items
		const completedVideos = courseData.completedVideos
			? courseData.completedVideos.length
			: 0;

		// Count completed quizzes based on completedQuizzes object
		let completedQuizCount = 0;
		if (courseData.completedQuizzes) {
			// Only count quizzes that actually exist in the course
			quizIds.forEach((quizId) => {
				if (courseData.completedQuizzes[quizId]) {
					completedQuizCount++;
				}
			});
		}

		// Calculate progress percentage
		const totalItems = totalVideos + totalQuizzes;
		const completedItems = completedVideos + completedQuizCount;

		const progressPercent =
			totalItems > 0
				? Math.round((completedItems / totalItems) * 100)
				: 0;

		// Update progress in courseData
		courseData.progress = progressPercent;

		return progressPercent;
	}

	/**
	 * Get the total number of videos in a course
	 * @param {number} courseId - The ID of the course
	 * @returns {number} The total number of videos
	 */
	static getTotalVideos(courseId) {
		const course = window.courses?.find((c) => c.id === courseId);
		if (!course || !course.sections) return 0;

		return course.sections.reduce((count, section) => {
			return count + (section.videos ? section.videos.length : 0);
		}, 0);
	}

	/**
	 * Get the total number of quizzes in a course
	 * @param {number} courseId - The ID of the course
	 * @returns {number} The total number of quizzes
	 */
	static getTotalQuizzes(courseId) {
		const course = window.courses?.find((c) => c.id === courseId);
		if (!course || !course.sections) return 0;

		return course.sections.reduce((count, section) => {
			return count + (section.quiz ? 1 : 0);
		}, 0);
	}

	/**
	 * Get detailed course information including progress
	 * @param {number} courseId - The ID of the course
	 * @returns {Object} Course details with progress info
	 */
	static getCourseDetails(courseId) {
		// Get course data from course-data.js
		const course = window.courses?.find((c) => c.id === courseId);
		if (!course) return null;

		// Get progress data
		const progress = this.getCourseData(courseId);

		// Count videos and quizzes
		let totalVideos = 0;
		let totalQuizzes = 0;

		if (course.sections) {
			course.sections.forEach((section) => {
				if (section.videos) totalVideos += section.videos.length;
				if (section.quiz) totalQuizzes++;
			});
		}

		// Calculate completed items
		const completedVideos = progress.completedVideos
			? progress.completedVideos.length
			: 0;
		const completedQuizzes = progress.completedQuizzes
			? Object.keys(progress.completedQuizzes).length
			: 0;

		return {
			id: course.id,
			title: course.title,
			description: course.description,
			image: course.image,
			duration: course.duration,
			level: course.level,
			totalVideos,
			totalQuizzes,
			completedVideos,
			completedQuizzes,
			progress: progress.progress || 0,
			grade: progress.grade,
		};
	}

	/**
	 * Update quiz grade for a course
	 * @param {number} courseId - The ID of the course
	 * @param {string} quizId - The ID of the specific quiz
	 * @param {number} grade - The grade achieved in the quiz
	 * @returns {Object} Updated course data
	 */
	static updateQuizGrade(courseId, quizId, grade) {
		const courseData = this.getCourseData(courseId);

		// Initialize completedQuizzes if not exists
		if (!courseData.completedQuizzes) {
			courseData.completedQuizzes = {};
		}

		// Store the grade for this specific quiz
		courseData.completedQuizzes[quizId] = {
			grade: grade,
			completedAt: new Date().toISOString(),
		};

		// For backward compatibility, still set the course-level grade to the latest quiz grade
		courseData.grade = grade;
		courseData.quizCompleted = true;

		// Recalculate progress
		this.recalculateProgress(courseId, courseData);

		// Save updated data
		this.saveData(`techCourses_progress_${courseId}`, courseData);

		// Sync with global progress if ProgressManager exists
		if (
			window.ProgressManager &&
			typeof window.ProgressManager.updateCourseProgress === "function"
		) {
			window.ProgressManager.updateCourseProgress(courseId, {
				testsCompleted: Object.keys(courseData.completedQuizzes).length,
				grades: grade,
				progress: courseData.progress,
			});
		}

		return courseData;
	}

	/**
	 * Check if a specific quiz is completed
	 * @param {number} courseId - The ID of the course
	 * @param {string} quizId - The ID of the quiz
	 * @returns {boolean} True if the quiz is completed
	 */
	static isQuizCompleted(courseId, quizId) {
		const courseData = this.getCourseData(courseId);

		// Check if completedQuizzes exists and contains this quiz
		return (
			courseData.completedQuizzes &&
			courseData.completedQuizzes[quizId] !== undefined
		);
	}

	/**
	 * Get quiz grade for a specific quiz
	 * @param {number} courseId - The ID of the course
	 * @param {string} quizId - The ID of the quiz
	 * @returns {number|null} The quiz grade or null if not taken
	 */
	static getQuizGrade(courseId, quizId) {
		const courseData = this.getCourseData(courseId);

		if (courseData.completedQuizzes && courseData.completedQuizzes[quizId]) {
			return courseData.completedQuizzes[quizId].grade;
		}

		return null;
	}

	/**
	 * Update video progress data
	 * @param {number} courseId - The ID of the course
	 * @param {number} videoIndex - The index of the video
	 * @param {Object} progressData - The progress data to save
	 * @returns {Object} Updated course data
	 */
	static updateVideoProgress(courseId, videoIndex, progressData) {
		const courseData = this.getCourseData(courseId);

		// Initialize videoProgress if not exists
		if (!courseData.videoProgress) {
			courseData.videoProgress = {};
		}

		// Update progress data for this video
		courseData.videoProgress[videoIndex] = {
			...progressData,
			timestamp: Date.now(),
		};

		// If video is marked as completed, add to completedVideos if not already there
		if (
			progressData.completed &&
			!courseData.completedVideos.includes(videoIndex)
		) {
			if (!courseData.completedVideos) {
				courseData.completedVideos = [];
			}
			courseData.completedVideos.push(videoIndex);

			// Recalculate progress
			this.recalculateProgress(courseId, courseData);
		}

		// Save updated data
		this.saveData(`techCourses_progress_${courseId}`, courseData);
		return courseData;
	}

	/**
	 * Get video progress data
	 * @param {number} courseId - The ID of the course
	 * @param {number} videoIndex - The index of the video
	 * @returns {Object|null} The progress data or null if not found
	 */
	static getVideoProgress(courseId, videoIndex) {
		const courseData = this.getCourseData(courseId);

		if (courseData.videoProgress && courseData.videoProgress[videoIndex]) {
			return courseData.videoProgress[videoIndex];
		}

		return null;
	}

	/**
	 * Update course data with new values
	 * @param {number} courseId - The ID of the course to update
	 * @param {Object} newData - The new data to apply to the course
	 * @returns {Object} The updated course data
	 */
	static updateCourseData(courseId, newData) {
		const key = `techCourses_progress_${courseId}`;
		const currentData = this.getCourseData(courseId);

		// Merge the new data with the current data
		const updatedData = { ...currentData, ...newData };
		this.saveData(key, updatedData);

		return updatedData;
	}
}

// Export the StorageManager for use in other files
window.StorageManager = StorageManager;
