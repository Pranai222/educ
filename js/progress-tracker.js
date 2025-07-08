// Progress Tracker Module
// Handles tracking user progress through courses

// Create the ProgressTracker namespace if it doesn't exist
window.ProgressTracker = window.ProgressTracker || {};

(function () {
	// Get progress data from localStorage
	function getProgressData() {
		try {
			const data = localStorage.getItem("courseProgress");
			return data ? JSON.parse(data) : {};
		} catch (e) {
			console.error("Error loading progress data:", e);
			return {};
		}
	}

	// Save progress data to localStorage
	function saveProgressData(data) {
		try {
			localStorage.setItem("courseProgress", JSON.stringify(data));
		} catch (e) {
			console.error("Error saving progress data:", e);
		}
	}

	// Initialize a course if it doesn't exist in the progress data
	function initCourse(progressData, courseId) {
		if (!progressData[courseId]) {
			progressData[courseId] = {
				started: new Date().toISOString(),
				lastAccessed: new Date().toISOString(),
				completed: [],
				started: [],
				totalItems: 0,
			};
		}
		return progressData;
	}

	// Count total number of items in a course
	function calculateTotalItems(courseId) {
		const course = window.courses.find((c) => c.id === courseId);
		if (!course) return 0;

		let totalItems = 0;

		// Count all videos
		if (course.sections) {
			course.sections.forEach((section) => {
				if (section.videos) {
					totalItems += section.videos.length;
				}
				if (section.quiz) {
					totalItems += 1; // Count each quiz as one item
				}
			});
		}

		return totalItems;
	}

	// Mark an item as started
	window.ProgressTracker.startItem = function (courseId, itemId) {
		let progressData = getProgressData();
		progressData = initCourse(progressData, courseId);

		// Update last accessed timestamp
		progressData[courseId].lastAccessed = new Date().toISOString();

		// Add to started array if not already present
		if (!progressData[courseId].started.includes(itemId)) {
			progressData[courseId].started.push(itemId);
		}

		// Update total items count if not set yet
		if (!progressData[courseId].totalItems) {
			progressData[courseId].totalItems = calculateTotalItems(courseId);
		}

		saveProgressData(progressData);
	};

	// Mark an item as completed
	window.ProgressTracker.completeItem = function (courseId, itemId) {
		let progressData = getProgressData();
		progressData = initCourse(progressData, courseId);

		// Update timestamps
		progressData[courseId].lastAccessed = new Date().toISOString();

		// Add to completed array if not already present
		if (!progressData[courseId].completed.includes(itemId)) {
			progressData[courseId].completed.push(itemId);
		}

		// Update total items count if not set yet
		if (!progressData[courseId].totalItems) {
			progressData[courseId].totalItems = calculateTotalItems(courseId);
		}

		saveProgressData(progressData);

		// Return updated progress info
		return window.ProgressTracker.getCourseProgress(courseId);
	};

	// Get progress percentage for a course
	window.ProgressTracker.getCourseProgress = function (courseId) {
		const progressData = getProgressData();

		// If no progress data exists for this course, initialize it
		if (!progressData[courseId]) {
			const updatedData = initCourse(progressData, courseId);
			updatedData[courseId].totalItems = calculateTotalItems(courseId);
			saveProgressData(updatedData);
			return {
				total: updatedData[courseId].totalItems,
				completed: 0,
				started: 0,
				percentage: 0,
			};
		}

		// Ensure total items is calculated
		if (!progressData[courseId].totalItems) {
			progressData[courseId].totalItems = calculateTotalItems(courseId);
			saveProgressData(progressData);
		}

		const total = progressData[courseId].totalItems;
		const completed = progressData[courseId].completed.length;
		const started = progressData[courseId].started.length;

		// Calculate percentage, ensuring we don't divide by zero
		const percentage =
			total > 0 ? Math.round((completed / total) * 100) : 0;

		return {
			total,
			completed,
			started,
			percentage,
		};
	};

	// Reset course progress
	window.ProgressTracker.resetCourseProgress = function (courseId) {
		let progressData = getProgressData();

		if (progressData[courseId]) {
			// Keep the total items count but reset progress arrays
			const totalItems = calculateTotalItems(courseId);

			progressData[courseId] = {
				started: new Date().toISOString(),
				lastAccessed: new Date().toISOString(),
				completed: [],
				started: [],
				totalItems: totalItems,
			};

			saveProgressData(progressData);
			return true;
		}

		return false;
	};

	// Check if a specific item has been completed
	window.ProgressTracker.isItemCompleted = function (courseId, itemId) {
		const progressData = getProgressData();

		if (!progressData[courseId]) {
			return false;
		}

		return progressData[courseId].completed.includes(itemId);
	};

	// Mark a course as started
	window.ProgressTracker.startCourse = function (courseId) {
		let progressData = getProgressData();
		progressData = initCourse(progressData, courseId);

		// Update the last accessed timestamp
		progressData[courseId].lastAccessed = new Date().toISOString();

		// Update total items count if not set yet
		if (!progressData[courseId].totalItems) {
			progressData[courseId].totalItems = calculateTotalItems(courseId);
		}

		saveProgressData(progressData);
	};
})();
