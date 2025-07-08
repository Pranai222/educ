// Courses page functionality

document.addEventListener("DOMContentLoaded", function () {
	console.log("[courses.js] DOMContentLoaded event fired.");
	initializeCoursesPage();
});

function initializeCoursesPage() {
	console.log("[courses.js] Initializing courses page...");

	// Get user progress data
	let userProgress = {};
	if (
		window.ProgressTracker &&
		typeof window.ProgressTracker.getAllCourseProgress === "function"
	) {
		userProgress = window.ProgressTracker.getAllCourseProgress();
		console.log("[courses.js] User progress data loaded:", userProgress);
	} else {
		console.warn(
			"[courses.js] ProgressTracker not available or getAllCourseProgress function missing."
		);
	}

	// Check if window.courses is ready
	if (
		typeof window.courses !== "undefined" &&
		Array.isArray(window.courses)
	) {
		console.log("[courses.js] Course data found immediately. Rendering...");
		renderCourses(userProgress);
	} else {
		// Data not ready, wait a bit and try again
		console.warn(
			"[courses.js] Course data not ready yet. Waiting 100ms..."
		);
		setTimeout(function () {
			initializeCoursesPage(userProgress);
		}, 100); // Retry after a short delay
	}
}

function renderCourses(userProgress) {
	console.log("[courses.js] Executing renderCourses...");
	const container = document.getElementById("courses-accordion");
	const inProgressContainer = document.getElementById(
		"in-progress-courses-list"
	);

	if (!container || !inProgressContainer) {
		console.error(
			"[courses.js] CRITICAL: Container #courses-accordion or #in-progress-courses-list not found!"
		);
		return;
	}

	// Clear loading indicators
	container.innerHTML = "";
	inProgressContainer.innerHTML = "";

	try {
		const courses = window.courses;

		if (!courses || courses.length === 0) {
			console.warn(
				"[courses.js] Course array is empty or undefined after check."
			);
			container.innerHTML =
				'<div class="col-12"><div class="alert alert-warning">No courses available.</div></div>';
			return;
		}

		console.log(`[courses.js] Rendering ${courses.length} courses...`);

		// Separate courses in progress
		const coursesInProgress = [];
		const remainingCourses = [];

		courses.forEach((course) => {
			if (
				userProgress[course.id] &&
				userProgress[course.id].percentage > 0
			) {
				coursesInProgress.push(course);
			} else {
				remainingCourses.push(course);
			}
		});

		// Render courses in progress
		if (coursesInProgress.length > 0) {
			renderCoursesInProgress(coursesInProgress, inProgressContainer);
		} else {
			inProgressContainer.innerHTML =
				'<div class="col-12"><div class="alert alert-info">No courses in progress. Start learning today!</div></div>';
		}

		// Group courses by subject and subsection
		const groupedCourses = groupCourses(remainingCourses);

		// Render accordion
		renderAccordion(groupedCourses, container);

		// Implement search filtering (basic example)
		document
			.getElementById("course-search")
			.addEventListener("input", function (e) {
				const searchTerm = e.target.value.toLowerCase();
				filterCourses(searchTerm, groupedCourses, container);
			});
	} catch (error) {
		console.error(
			"[courses.js] Error during renderCourses execution:",
			error
		);
		container.innerHTML =
			'<div class="col-12"><div class="alert alert-danger">Error loading courses.</div></div>';
	}
}

// Function to render courses in progress
function renderCoursesInProgress(courses, container) {
	console.log("[courses.js] Rendering courses in progress...");
	container.innerHTML = ""; // Clear existing content

	// The container already has the row class from HTML, so we don't need to add it again
	// Just ensure it has the proper grid classes
	container.className = "row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4";

	courses.forEach((course) => {
		const col = document.createElement("div");
		col.className = "col"; // Bootstrap column class for responsive grid
		col.innerHTML = createCourseCard(course, true); // Pass true to show progress bar
		container.appendChild(col);
	});
}

// Function to group courses by subject and subsection
function groupCourses(courses) {
	console.log("[courses.js] Grouping courses...");
	const grouped = {};

	courses.forEach((course) => {
		const subject = course.subject || "Other";
		const subSection = course.subSection || "General";

		if (!grouped[subject]) {
			grouped[subject] = {};
		}

		if (!grouped[subject][subSection]) {
			grouped[subject][subSection] = [];
		}

		grouped[subject][subSection].push(course);
	});

	return grouped;
}

// Function to render accordion
function renderAccordion(groupedCourses, container) {
	console.log("[courses.js] Rendering accordion...");
	container.innerHTML = ""; // Clear existing content

	for (const subject in groupedCourses) {
		if (groupedCourses.hasOwnProperty(subject)) {
			const subjectDiv = document.createElement("div");
			subjectDiv.className = "accordion-item";

			const subjectHeader = document.createElement("h2");
			subjectHeader.className = "accordion-header";
			subjectHeader.id = `heading-${subject}`;

			const subjectButton = document.createElement("button");
			subjectButton.className = "accordion-button collapsed";
			subjectButton.type = "button";
			subjectButton.setAttribute("data-bs-toggle", "collapse");
			subjectButton.setAttribute(
				"data-bs-target",
				`#collapse-${subject}`
			);
			subjectButton.setAttribute("aria-expanded", "false");
			subjectButton.setAttribute("aria-controls", `collapse-${subject}`);
			subjectButton.textContent = subject;

			subjectHeader.appendChild(subjectButton);
			subjectDiv.appendChild(subjectHeader);

			const collapseDiv = document.createElement("div");
			collapseDiv.id = `collapse-${subject}`;
			collapseDiv.className = "accordion-collapse collapse";
			collapseDiv.setAttribute("aria-labelledby", `heading-${subject}`);
			collapseDiv.setAttribute("data-bs-parent", "#courses-accordion");

			const accordionBody = document.createElement("div");
			accordionBody.className = "accordion-body";

			for (const subSection in groupedCourses[subject]) {
				if (groupedCourses[subject].hasOwnProperty(subSection)) {
					const subSectionTitle = document.createElement("h4");
					subSectionTitle.textContent = subSection;
					accordionBody.appendChild(subSectionTitle);

					const courseList = document.createElement("div");
					courseList.className =
						"row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"; // Consistent grid layout

					groupedCourses[subject][subSection].forEach((course) => {
						const col = document.createElement("div");
						col.className = "col"; // Use col class for grid layout
						col.innerHTML = createCourseCard(course, false); // Don't show progress bar in accordion
						courseList.appendChild(col);
					});

					accordionBody.appendChild(courseList);
				}
			}

			collapseDiv.appendChild(accordionBody);
			subjectDiv.appendChild(collapseDiv);
			container.appendChild(subjectDiv);
		}
	}
}

// Function to filter courses based on search term
function filterCourses(searchTerm, groupedCourses, container) {
	console.log(`[courses.js] Filtering courses with term: ${searchTerm}`);
	container.innerHTML = ""; // Clear existing content

	for (const subject in groupedCourses) {
		if (groupedCourses.hasOwnProperty(subject)) {
			const subjectDiv = document.createElement("div");
			subjectDiv.className = "accordion-item";

			const subjectHeader = document.createElement("h2");
			subjectHeader.className = "accordion-header";
			subjectHeader.id = `heading-${subject}`;

			const subjectButton = document.createElement("button");
			subjectButton.className = "accordion-button collapsed";
			subjectButton.type = "button";
			subjectButton.setAttribute("data-bs-toggle", "collapse");
			subjectButton.setAttribute(
				"data-bs-target",
				`#collapse-${subject}`
			);
			subjectButton.setAttribute("aria-expanded", "false");
			subjectButton.setAttribute("aria-controls", `collapse-${subject}`);
			subjectButton.textContent = subject;

			subjectHeader.appendChild(subjectButton);
			subjectDiv.appendChild(subjectHeader);

			const collapseDiv = document.createElement("div");
			collapseDiv.id = `collapse-${subject}`;
			collapseDiv.className = "accordion-collapse collapse";
			collapseDiv.setAttribute("aria-labelledby", `heading-${subject}`);
			collapseDiv.setAttribute("data-bs-parent", "#courses-accordion");

			const accordionBody = document.createElement("div");
			accordionBody.className = "accordion-body";

			for (const subSection in groupedCourses[subject]) {
				if (groupedCourses[subject].hasOwnProperty(subSection)) {
					const filteredCourses = groupedCourses[subject][
						subSection
					].filter((course) => {
						return (
							course.title.toLowerCase().includes(searchTerm) ||
							course.description
								.toLowerCase()
								.includes(searchTerm)
						);
					});

					if (filteredCourses.length > 0) {
						const subSectionTitle = document.createElement("h4");
						subSectionTitle.textContent = subSection;
						accordionBody.appendChild(subSectionTitle);

						const courseList = document.createElement("div");
						courseList.className =
							"row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"; // Consistent grid layout

						filteredCourses.forEach((course) => {
							const col = document.createElement("div");
							col.className = "col"; // Bootstrap column class for responsive grid
							col.innerHTML = createCourseCard(course, false); // Don't show progress bar in accordion
							courseList.appendChild(col);
						});

						accordionBody.appendChild(courseList);
					}
				}
			}

			collapseDiv.appendChild(accordionBody);
			subjectDiv.appendChild(collapseDiv);
			container.appendChild(subjectDiv);
		}
	}
}

// Create a course card element
function createCourseCard(course, showProgressBar) {
	let progress = 0,
		started = false;
	if (window.ProgressTracker) {
		const progressData = window.ProgressTracker.getCourseProgress(
			course.id
		);
		if (progressData) {
			progress = progressData.percentage || 0;
			started = progress > 0;
		}
	}

	let levelClass = "bg-info";
	let levelIcon = "fa-signal";

	if (course.level) {
		switch (course.level.toLowerCase()) {
			case "beginner":
				levelClass = "bg-success";
				levelIcon = "fa-seedling";
				break;
			case "intermediate":
				levelClass = "bg-warning";
				levelIcon = "fa-graduation-cap";
				break;
			case "advanced":
				levelClass = "bg-danger";
				levelIcon = "fa-fire";
				break;
		}
	}

	// Generate a random gradient for course placeholder based on course ID
	const seed = course.id
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const hue1 = seed % 360;
	const hue2 = (hue1 + 40) % 360;
	const gradient = `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 70%, 60%) 100%)`;

	const detailPagePath = `./course-details.html?courseId=${course.id}`;

	let progressBarHTML = "";
	if (showProgressBar && progress > 0) {
		progressBarHTML = `
            <div class="progress-container mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <small class="text-muted">${progress}% complete</small>
                    <small class="text-muted">${getDurationText(
						course
					)} remaining</small>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar" role="progressbar"
                         style="width: ${progress}%" aria-valuenow="${progress}"
                         aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        `;
	}

	// Generate instructor info if available
	let instructorHTML = "";
	if (course.instructor) {
		instructorHTML = `
            <div class="d-flex align-items-center mb-3">
                <div class="instructor-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="ms-2">
                    <small class="text-muted d-block">Instructor</small>
                    <span class="instructor-name">${course.instructor}</span>
                </div>
            </div>
        `;
	}

	// Create a unique class for this card animation
	const animationDelay = (course.id.charCodeAt(0) % 5) * 0.1;

	const cardHTML = `
        <div class="card h-100 course-card" style="animation-delay: ${animationDelay}s">
            <div class="course-placeholder" style="background: ${gradient}" title="${
		course.title
	}">
                <i class="fas ${course.icon || "fa-book"} fa-2x"></i>
            </div>
            <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between mb-3">
                    <span class="badge ${levelClass}"><i class="fas ${levelIcon} me-1"></i> ${
		course.level || "All Levels"
	}</span>
                    <span class="badge bg-secondary"><i class="far fa-clock me-1"></i> ${getDurationText(
						course
					)}</span>
                </div>
                <h5 class="card-title">${course.title}</h5>
                <p class="card-text text-muted flex-grow-1">${
					course.description
				}</p>

                ${instructorHTML}

                <div class="mt-auto">
                    ${progressBarHTML}
                    <a href="${detailPagePath}" class="btn ${
		started ? "btn-success" : "btn-primary"
	} w-100">
                        <i class="fas ${
							started ? "fa-redo" : "fa-play"
						} me-2"></i>${
		started ? "Continue Learning" : "Start Learning"
	}
                    </a>
                </div>
            </div>
        </div>
    `;

	return cardHTML;
}

// Get formatted duration text
function getDurationText(course) {
	if (course.duration) return course.duration;
	let totalVideos = 0,
		totalQuizzes = 0;
	if (course.sections) {
		course.sections.forEach((section) => {
			if (section.videos) totalVideos += section.videos.length;
			if (section.quiz) totalQuizzes++;
		});
	}
	const estimatedMinutes = totalVideos * 10 + totalQuizzes * 5;
	const hours = Math.floor(estimatedMinutes / 60);
	const minutes = estimatedMinutes % 60;
	if (hours > 0) return `${hours}h ${minutes > 0 ? minutes + "m" : ""}`;
	return `${minutes}m`;
}
