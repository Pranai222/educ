// v:\Code\ProjectCode\eVidya\js\home.js

// Function to create the HTML for a single course card (adapted from catalogue.js)
function createHomepageCourseCard(course) {
	const card = document.createElement("div");
	// Use the same base class as the catalogue card for styling
	card.className = "course-card h-100"; // Add h-100 for consistent height in grid

	// --- Image Handling ---
	// Use course.image if available, otherwise a placeholder.
	// Assumes course-data.js provides an 'image' property.
	// Using a seeded placeholder for consistency if no image provided.
	let imagePath =
		course.image ||
		`https://picsum.photos/seed/${course.id || Math.random()}/400/225`;
	const fallbackImage = `https://picsum.photos/seed/${
		course.id || Math.random()
	}/400/225`; // Fallback

	// --- Difficulty Badge ---
	const levelClass = course.level?.toLowerCase() || "unknown";
	const levelText = course.level || "N/A";
	const difficultyBadge = `<div class="difficulty-badge ${levelClass}">${levelText}</div>`;

	// --- Card Structure (Simplified for homepage - no progress bar) ---
	card.innerHTML = `
        <div class="course-image">
            <img src="${imagePath}" alt="${
		course.title || "Course image"
	}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImage}';">
            ${difficultyBadge}
        </div>
        <div class="course-content d-flex flex-column"> <!-- Use flex column -->
            <h3 class="course-title">${course.title || "Untitled Course"}</h3>
            <!-- Keep description shorter on homepage -->
            <p class="course-description flex-grow-1">${
				course.description
					? course.description.substring(0, 100) +
					  (course.description.length > 100 ? "..." : "")
					: "No description available."
			}</p>
            <div class="course-meta mt-auto"> <!-- Push meta towards bottom -->
                <span><i class="material-icons">schedule</i> ${
					course.duration || "N/A"
				}</span>
                <span><i class="material-icons">category</i> ${
					course.subject || "N/A"
				}</span>
            </div>
            <!-- Ensure the link path is correct relative to index.html -->
            <a href="./pages/course-details.html?courseId=${
				course.id
			}" class="btn primary-btn btn-sm mt-2 stretched-link">View Course</a>
        </div>
    `;

	// Note: The stretched-link on the button makes the whole card clickable.

	return card;
}

// Function to load featured/popular courses onto the homepage
function loadFeaturedCourses(numberOfCourses = 4) {
	// Default to showing 4 courses
	const coursesContainer = document.getElementById("courses-container");

	if (!coursesContainer) {
		console.error("Homepage courses container not found!");
		return;
	}

	// Check if course data is available
	if (
		typeof window.courses === "undefined" ||
		!Array.isArray(window.courses)
	) {
		coursesContainer.innerHTML =
			'<p class="text-center text-danger">Could not load course data.</p>';
		console.error(
			"Course data (window.courses) is not available or not an array."
		);
		return;
	}

	// --- Get Courses ---
	// Sort by popularity (enrollments) and take the top 'numberOfCourses'
	// Make a copy before sorting to not modify the original window.courses
	const sortedCourses = [...window.courses].sort(
		(a, b) => (b.enrollments || 0) - (a.enrollments || 0)
	);
	const featuredCourses = sortedCourses.slice(0, numberOfCourses);

	// --- Render Courses ---
	coursesContainer.innerHTML = ""; // Clear loading message or previous content

	if (featuredCourses.length === 0) {
		coursesContainer.innerHTML =
			'<p class="text-center text-muted">No featured courses available at the moment.</p>';
		return;
	}

	featuredCourses.forEach((course) => {
		const courseCardElement = createHomepageCourseCard(course);

		// Create the wrapper div with Bootstrap column classes
		const wrapper = document.createElement("div");
		// Use the same column classes as catalogue.html for consistency (e.g., 4 columns on XL)
		// Adjust if you want fewer columns on the homepage (e.g., col-lg-4 col-md-6 for 3 columns)
		wrapper.className = "col-xl-3 col-lg-4 col-md-6 mb-4 d-flex"; // Added d-flex for equal height cards

		wrapper.appendChild(courseCardElement);
		coursesContainer.appendChild(wrapper);
	});
}

// --- Metrics Calculation (Keep this if it's used in home.js) ---
function updateMetrics() {
	const coursesCountEl = document.getElementById("courses-count");
	const videosCountEl = document.getElementById("videos-count");
	const quizzesCountEl = document.getElementById("quizzes-count");
	const courseStatsDiv = document.getElementById("course-stats");

	if (
		typeof window.courses !== "undefined" &&
		Array.isArray(window.courses)
	) {
		const courses = window.courses;
		let totalVideos = 0;
		let totalQuizzes = 0;

		courses.forEach((course) => {
			if (course.sections) {
				course.sections.forEach((section) => {
					if (section.videos) totalVideos += section.videos.length;
					if (section.quiz) totalQuizzes++;
				});
			}
		});

		if (coursesCountEl) coursesCountEl.textContent = courses.length;
		if (videosCountEl) videosCountEl.textContent = totalVideos;
		if (quizzesCountEl) quizzesCountEl.textContent = totalQuizzes;

		// Update the welcome section stats too
		if (courseStatsDiv) {
			courseStatsDiv.innerHTML = `
                <div class="alert alert-info d-flex align-items-center">
                    <i class="fas fa-info-circle me-2 fa-lg"></i>
                    <div>
                        Explore <strong>${courses.length}</strong> courses available with
                        <strong>${totalVideos}</strong> video lessons and
                        <strong>${totalQuizzes}</strong> interactive quizzes!
                    </div>
                </div>
            `;
		}
	} else {
		// Handle case where course data isn't loaded
		if (coursesCountEl) coursesCountEl.textContent = "N/A";
		if (videosCountEl) videosCountEl.textContent = "N/A";
		if (quizzesCountEl) quizzesCountEl.textContent = "N/A";
		if (courseStatsDiv)
			courseStatsDiv.innerHTML =
				'<div class="alert alert-warning">Could not load course statistics.</div>';
	}
}

// --- Run on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", function () {
	// Update metrics display
	updateMetrics();

	// Load featured courses
	loadFeaturedCourses(4); // Load the top 4 popular courses

	// Add event listener for the main CTA button (already in index.html script, but good practice)
	const viewCoursesBtn = document.getElementById("view-courses-btn");
	if (viewCoursesBtn) {
		viewCoursesBtn.addEventListener("click", function (e) {
			e.preventDefault();
			// Ensure path is correct from index.html
			const coursesPath = "./pages/catalogue.html";
			console.log("Navigating to courses page:", coursesPath);
			window.location.href = coursesPath;
		});
	}

	// Remove or comment out the inline script block in index.html that calls loadFeaturedCourses
	// and updates metrics, as home.js now handles it.
});
