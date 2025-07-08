const progressData = {
	courses: [
		{
			id: 1,
			title: "Functional Programming",
			videosWatched: 0,
			testsCompleted: 0,
			grades: null,
			marks: null,
			progress: 0,
		},
		{
			id: 2,
			title: "Web Development Fundamentals",
			videosWatched: 0,
			testsCompleted: 0,
			grades: null,
			marks: null,
			progress: 0,
		},
		{
			id: 3,
			title: "Data Structures and Algorithms",
			videosWatched: 0,
			testsCompleted: 0,
			grades: null,
			marks: null,
			progress: 0,
		},
		{
			id: 4,
			title: "React Fundamentals",
			videosWatched: 0,
			testsCompleted: 0,
			grades: null,
			marks: null,
			progress: 0,
		},
	],
};

// Save the current progress data to localStorage
function saveProgress() {
	StorageManager.saveData("techCourses_progressData", progressData);
}

// Load progress data from localStorage
function loadProgress() {
	const data = StorageManager.getData("techCourses_progressData", null);
	if (data) {
		return data;
	}
	return progressData;
}

// Initialize course progress tracking
function initializeProgress() {
	// Ensure progress exists for all courses in the system
	if (window.courses && Array.isArray(window.courses)) {
		const data = loadProgress();
		let hasChanges = false;

		// Check for new courses that need to be added to progress tracking
		window.courses.forEach((course) => {
			const existingCourse = data.courses.find((c) => c.id === course.id);
			if (!existingCourse) {
				data.courses.push({
					id: course.id,
					title: course.title,
					videosWatched: 0,
					testsCompleted: 0,
					grades: null,
					marks: null,
					progress: 0,
				});
				hasChanges = true;
			}
		});

		// Remove courses that no longer exist in the system
		const updatedCourses = [];
		data.courses.forEach((course) => {
			if (window.courses.some((c) => c.id === course.id)) {
				updatedCourses.push(course);
			}
		});

		if (data.courses.length !== updatedCourses.length) {
			data.courses = updatedCourses;
			hasChanges = true;
		}

		if (hasChanges) {
			progressData.courses = data.courses;
			saveProgress();
		} else {
			// Just update our local copy
			progressData.courses = data.courses;
			syncIndividualCourseProgress();
		}
	}

	// Also ensure each course has individual progress data
	if (window.courses && Array.isArray(window.courses)) {
		window.courses.forEach((course) => {
			// Initialize or retrieve course data using StorageManager
			StorageManager.getCourseData(course.id);
		});
	}
}

// Function to get course details including total videos and quizzes
function getCourseDetails(courseId) {
	// Find course in courses array from course-data.js
	const course = window.courses
		? window.courses.find((c) => c.id === courseId)
		: null;

	if (!course) return null;

	let totalVideos = 0;
	let totalQuizzes = 0;
	let videoIds = [];

	// Count all videos and quizzes in the course
	if (course.sections && course.sections.length > 0) {
		course.sections.forEach((section, sectionIndex) => {
			if (section.videos && section.videos.length > 0) {
				section.videos.forEach((video, videoIndex) => {
					// Calculate a unique global index for each video
					const globalVideoIndex = sectionIndex * 10 + videoIndex;
					videoIds.push(globalVideoIndex);
					totalVideos++;
				});
			}

			if (section.quiz) {
				totalQuizzes++;
			}
		});
	}

	return {
		id: course.id,
		title: course.title,
		description: course.description,
		image: course.image,
		duration: course.duration,
		level: course.level,
		totalVideos,
		totalQuizzes,
		videoIds,
		totalItems: totalVideos + totalQuizzes,
	};
}

// Sync individual course progress with global progress data
function syncIndividualCourseProgress() {
	// First get all available courses from course-data.js
	if (window.courses && Array.isArray(window.courses)) {
		// Update progress data for each course
		window.courses.forEach((course) => {
			const courseData = StorageManager.getCourseData(course.id);
			if (courseData) {
				// Get course details
				const courseDetails = getCourseDetails(course.id);

				// Find or create course in global progress
				let globalCourse = progressData.courses.find(
					(c) => c.id === course.id
				);
				if (!globalCourse) {
					// Course doesn't exist in global progress, add it
					globalCourse = {
						id: course.id,
						title: course.title,
						videosWatched: 0,
						testsCompleted: 0,
						grades: null,
						marks: null,
						progress: 0,
					};
					progressData.courses.push(globalCourse);
				}

				// Update global progress data from individual course data
				globalCourse.title = course.title; // Ensure title is up to date
				globalCourse.videosWatched = courseData.completedVideos
					? courseData.completedVideos.length
					: 0;
				globalCourse.testsCompleted = courseData.quizCompleted ? 1 : 0;
				globalCourse.grades = courseData.grade;

				// Calculate progress percentage using totals from course-data.js
				if (courseDetails) {
					const totalItems = courseDetails.totalItems;
					const completedItems =
						globalCourse.videosWatched +
						globalCourse.testsCompleted;
					globalCourse.progress =
						totalItems > 0
							? Math.round((completedItems / totalItems) * 100)
							: 0;
				}
			}
		});

		// Save the updated global progress
		saveProgress();
	}
}

// Add helper methods for tracking course progress
function trackVideoWatched(courseId) {
	const course = progressData.courses.find((c) => c.id === courseId);
	if (course) {
		course.videosWatched++;
		saveProgress();
		return course.videosWatched;
	}
	return 0;
}

function trackTestCompleted(courseId, grade) {
	const course = progressData.courses.find((c) => c.id === courseId);
	if (course) {
		course.testsCompleted++;
		course.grades = grade;
		saveProgress();
		return true;
	}
	return false;
}

// Update course progress in global progress data
function updateCourseProgress(courseId, progressInfo) {
	const course = progressData.courses.find((c) => c.id === courseId);
	if (course) {
		if (progressInfo.videosWatched !== undefined) {
			course.videosWatched = progressInfo.videosWatched;
		}
		if (progressInfo.testsCompleted !== undefined) {
			course.testsCompleted = progressInfo.testsCompleted;
		}
		if (progressInfo.grades !== undefined) {
			course.grades = progressInfo.grades;
		}

		// Get totals from course data for accurate percentage calculation
		const courseDetails = getCourseDetails(courseId);
		if (courseDetails) {
			// Calculate progress percentage based on completed items
			const totalItems = courseDetails.totalItems;
			const completedItems = course.videosWatched + course.testsCompleted;

			// Calculate progress as a percentage
			course.progress =
				totalItems > 0
					? Math.round((completedItems / totalItems) * 100)
					: 0;
		}

		saveProgress();
	}
}

// Reset progress for a specific course
function resetCourseProgress(courseId) {
	const course = progressData.courses.find((c) => c.id === courseId);
	if (course) {
		// Set all progress tracking values to zero/null
		course.videosWatched = 0;
		course.testsCompleted = 0;
		course.grades = null;
		course.marks = null;
		course.progress = 0;

		console.log(
			`Course ${courseId} progress has been reset in ProgressManager`
		);

		// Save the updated progress
		saveProgress();

		// Return true to indicate success
		return true;
	}
	return false;
}

// Export the functions
window.ProgressManager = {
	saveProgress,
	loadProgress,
	initializeProgress,
	trackVideoWatched,
	trackTestCompleted,
	updateCourseProgress,
	resetCourseProgress,
	syncIndividualCourseProgress,
	getCourseDetails,
};

// Initialize progress data immediately when the script loads
initializeProgress();
