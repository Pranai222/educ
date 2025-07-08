// Course Navigation Script
// This script handles course content display, navigation and progress tracking

let player;
let courseId;
let courseData;
let currentVideoId;
let currentContentType = null;
let videoDurationCache = {};
let modalInstance = null;
let currentElementIndex = -1;
let allContentElements = [];
let hasNextElement = false;
let hasPrevElement = false;

// Initialize the course page once DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	console.log("Course navigation script initialized");
	initCoursePage();
	createContentModal();
});

// Create the modal for displaying videos and quizzes
function createContentModal() {
	// Create modal HTML
	const modalHTML = `
    <div class="modal fade" id="contentModal" tabindex="-1" aria-labelledby="contentModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="contentModalLabel">Content Title</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="modal-content-container"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" id="prev-content-btn" class="btn btn-secondary" disabled>
                        <i class="fas fa-arrow-left me-2"></i>Previous
                    </button>
                    <button type="button" id="mark-complete-btn" class="btn btn-success">
                        <i class="fas fa-check-circle me-2"></i>Mark as Completed
                    </button>
                    <button type="button" id="next-content-btn" class="btn btn-primary" disabled>
                        Next<i class="fas fa-arrow-right ms-2"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>`;

	// Append modal to body
	document.body.insertAdjacentHTML("beforeend", modalHTML);

	// Initialize Bootstrap modal
	const modalElement = document.getElementById("contentModal");
	modalInstance = new bootstrap.Modal(modalElement);

	// Add event listeners
	modalElement.addEventListener("hidden.bs.modal", handleModalHidden);
	document
		.getElementById("mark-complete-btn")
		.addEventListener("click", markCurrentContentComplete);
	document
		.getElementById("next-content-btn")
		.addEventListener("click", navigateToNextContent);
	document
		.getElementById("prev-content-btn")
		.addEventListener("click", navigateToPrevContent);
}

// Handle modal hidden event
function handleModalHidden() {
	// Stop video if it's playing - safely check if player exists and has methods
	if (player && typeof player.pauseVideo === "function") {
		try {
			player.pauseVideo();
		} catch (e) {
			console.warn("Could not pause video:", e);
		}
	}
}

// Mark current content as complete
function markCurrentContentComplete() {
	if (
		currentElementIndex >= 0 &&
		currentElementIndex < allContentElements.length
	) {
		const currentItem = allContentElements[currentElementIndex];
		window.ProgressTracker.markContentCompleted(courseId, currentItem.id);

		// Update UI
		updateContentItemUI(currentItem.id);
		updateProgressDisplay(
			window.ProgressTracker.getCourseProgress(courseId)
		);

		// Disable mark complete button
		document.getElementById("mark-complete-btn").disabled = true;

		// Enable next button if there's a next element
		if (hasNextElement) {
			document.getElementById("next-content-btn").disabled = false;
		}
	}
}

// Navigate to next content
function navigateToNextContent() {
	console.log(
		"Navigating to next content. Current index:",
		currentElementIndex,
		"Total items:",
		allContentElements.length
	);

	if (currentElementIndex < allContentElements.length - 1) {
		currentElementIndex++;
		const nextItem = allContentElements[currentElementIndex];

		console.log("Loading next content:", {
			type: nextItem.type,
			id: nextItem.id,
			title: nextItem.data.title,
		});

		// Reset UI state for navigation buttons
		const nextButton = document.getElementById("next-content-btn");
		nextButton.classList.add("btn-primary");
		nextButton.classList.remove("btn-warning");
		nextButton.innerHTML = 'Next <i class="fas fa-arrow-right ms-2"></i>';

		// Load the next content
		loadContentInModal(nextItem);
	}
}

// Navigate to previous content
function navigateToPrevContent() {
	if (currentElementIndex > 0) {
		currentElementIndex--;
		const prevItem = allContentElements[currentElementIndex];
		if (prevItem) {
			// Make sure we're working with the complete object
			const prevContent = {
				type: prevItem.type,
				id: prevItem.id,
				data: prevItem.data,
				section: prevItem.section,
			};

			// Update navigation state
			hasPrevElement = currentElementIndex > 0;
			hasNextElement =
				currentElementIndex < allContentElements.length - 1;

			// Load the previous content
			loadContentInModal(prevContent);
		}
	}
}

// Update the UI for a content item that has been completed
function updateContentItemUI(contentId) {
	const contentItem = document.getElementById(`content-${contentId}`);
	if (contentItem) {
		const statusSpan = contentItem.querySelector(".status-icon");
		if (statusSpan) {
			statusSpan.innerHTML =
				'<i class="fas fa-check-circle text-success"></i>';
		}

		// Add completed badge if not already there
		if (!contentItem.querySelector(".badge.bg-success")) {
			const badgeSpan = document.createElement("span");
			badgeSpan.className = "badge bg-success ms-2";
			badgeSpan.innerHTML = '<i class="fas fa-check me-1"></i>Completed';
			contentItem.querySelector(".content-title").appendChild(badgeSpan);
		}
	}
}

// Initialize the course page
function initCoursePage() {
	// Get the courseId from URL parameters
	const urlParams = new URLSearchParams(window.location.search);
	courseId =
		urlParams.get("courseId") || localStorage.getItem("selectedCourseId");

	if (!courseId) {
		showError(
			"No course selected. Please select a course from the courses page."
		);
		return;
	}

	// Try to get cached video durations
	try {
		const cached = localStorage.getItem("videoDurationCache");
		if (cached) {
			videoDurationCache = JSON.parse(cached);
		}
	} catch (e) {
		console.error("Error loading video duration cache:", e);
	}

	// Load course data
	loadCourseData(courseId);

	// Setup event handlers
	setupEventHandlers();
}

// Load course data
function loadCourseData(courseId) {
	console.log("Loading course data for ID:", courseId);

	// Get courses data
	let courses = [];
	try {
		// Try to get courses from global variable first (data directory)
		if (window.courses && Array.isArray(window.courses)) {
			console.log("Found courses from window.courses global variable");
			courses = window.courses;
		} else {
			console.error("No courses found in expected locations");
			showError(
				"Failed to load course data. Please refresh and try again."
			);
			return;
		}

		// Find selected course
		courseData = courses.find((course) => course.id === courseId);

		console.log("Found course data:", courseData);

		if (!courseData) {
			showError(`Course with ID ${courseId} not found.`);
			return;
		}

		// Update page title and description
		document.title = `${courseData.title} - eVidya`;
		document.getElementById("course-title").textContent = courseData.title;
		document.getElementById("course-description").textContent =
			courseData.description;

		// Load course content
		loadCourseContent(courseData);

		// Update progress display
		updateProgressDisplay(
			window.ProgressTracker.getCourseProgress(courseId)
		);
	} catch (error) {
		console.error("Error loading course data:", error);
		showError("Failed to load course data. Please try again later.");
	}
}

// Load course content
function loadCourseContent(courseData) {
	const contentContainer = document.getElementById("course-content");
	if (!contentContainer) return;

	// Clear existing content
	contentContainer.innerHTML = "";

	if (!courseData.sections || courseData.sections.length === 0) {
		contentContainer.innerHTML =
			'<div class="alert alert-info">No content available for this course yet.</div>';
		return;
	}

	// Initialize content elements array - this controls navigation order
	allContentElements = [];

	// Loop through sections
	courseData.sections.forEach((section, sectionIndex) => {
		const sectionElement = createSectionElement(section, sectionIndex);
		contentContainer.appendChild(sectionElement);

		// Build the sequential content flow correctly
		// We'll ensure videos and quizzes are interleaved properly
		if (section.videos && section.videos.length > 0) {
			// For debugging
			console.log(`Processing section ${sectionIndex}: ${section.title}`);
			console.log(
				`Found ${section.videos.length} videos and ${
					section.quiz ? 1 : 0
				} quiz`
			);

			// If there's only one video and a quiz, put the quiz after the video
			if (section.videos.length === 1 && section.quiz) {
				allContentElements.push({
					type: "video",
					id: section.videos[0].id,
					data: section.videos[0],
					section: sectionIndex,
				});

				allContentElements.push({
					type: "quiz",
					id: section.quiz.id,
					data: section.quiz,
					section: sectionIndex,
				});
			}
			// If there are multiple videos and a quiz, position the quiz after all videos
			else {
				section.videos.forEach((video) => {
					allContentElements.push({
						type: "video",
						id: video.id,
						data: video,
						section: sectionIndex,
					});
				});

				if (section.quiz) {
					allContentElements.push({
						type: "quiz",
						id: section.quiz.id,
						data: section.quiz,
						section: sectionIndex,
					});
				}
			}
		}
	});

	// Log the final navigation sequence for debugging
	console.log(
		"Content navigation sequence:",
		allContentElements.map(
			(item, idx) =>
				`${idx}: ${item.type}: ${item.data.title} (section: ${item.section})`
		)
	);
}

// Create a section element
function createSectionElement(section, index) {
	const sectionDiv = document.createElement("div");
	sectionDiv.className = "card mb-4 course-section";
	sectionDiv.setAttribute("data-section-index", index);

	sectionDiv.innerHTML = `
        <div class="card-header">
            <h3 class="mb-0">${section.title}</h3>
        </div>
        <div class="card-body">
            <div class="list-group content-list"></div>
        </div>
    `;

	const contentList = sectionDiv.querySelector(".content-list");

	// Add videos
	if (section.videos && section.videos.length > 0) {
		section.videos.forEach((video) => {
			const isCompleted = window.ProgressTracker.isContentCompleted(
				courseId,
				video.id
			);

			const videoItem = document.createElement("a");
			videoItem.href = "#";
			videoItem.className =
				"list-group-item list-group-item-action d-flex align-items-center";
			videoItem.id = `content-${video.id}`;
			videoItem.setAttribute("data-content-type", "video");
			videoItem.setAttribute("data-content-id", video.id);

			// Use the predefined duration if available, otherwise fall back to cached duration
			const duration = video.duration || videoDurationCache[video.id];
			const durationText = duration ? formatDuration(duration) : "Video";

			videoItem.innerHTML = `
                <span class="status-icon me-3">
                    <i class="fas ${
						isCompleted
							? "fa-check-circle text-success"
							: "fa-play-circle text-primary"
					}"></i>
                </span>
                <span class="content-title flex-grow-1">
                    ${video.title}
                    ${
						isCompleted
							? '<span class="badge bg-success ms-2"><i class="fas fa-check me-1"></i>Completed</span>'
							: ""
					}
                </span>
                <span class="badge bg-light text-dark">
                    <i class="fas fa-clock me-1"></i>${durationText}
                </span>
            `;

			videoItem.addEventListener("click", (e) => {
				e.preventDefault();

				// Find index of this video in allContentElements
				currentElementIndex = allContentElements.findIndex(
					(item) => item.type === "video" && item.id === video.id
				);

				// Determine if there are next/prev elements
				hasNextElement =
					currentElementIndex < allContentElements.length - 1;
				hasPrevElement = currentElementIndex > 0;

				// Load video in modal
				loadContentInModal({
					type: "video",
					id: video.id,
					data: video,
					section: index,
				});
			});

			contentList.appendChild(videoItem);
		});
	}

	// Add quiz
	if (section.quiz) {
		const quiz = section.quiz;
		const isCompleted = window.ProgressTracker.isContentCompleted(
			courseId,
			quiz.id
		);

		const quizItem = document.createElement("a");
		quizItem.href = "#";
		quizItem.className =
			"list-group-item list-group-item-action d-flex align-items-center";
		quizItem.id = `content-${quiz.id}`;
		quizItem.setAttribute("data-content-type", "quiz");
		quizItem.setAttribute("data-content-id", quiz.id);

		quizItem.innerHTML = `
            <span class="status-icon me-3">
                <i class="fas ${
					isCompleted
						? "fa-check-circle text-success"
						: "fa-question-circle text-warning"
				}"></i>
            </span>
            <span class="content-title flex-grow-1">
                ${quiz.title}
                ${
					isCompleted
						? '<span class="badge bg-success ms-2"><i class="fas fa-check me-1"></i>Completed</span>'
						: ""
				}
            </span>
            <span class="badge bg-light text-dark">
                <i class="fas fa-list me-1"></i>${
					quiz.questions.length
				} Questions
            </span>
        `;

		quizItem.addEventListener("click", (e) => {
			e.preventDefault();

			// Find index of this quiz in allContentElements
			currentElementIndex = allContentElements.findIndex(
				(item) => item.type === "quiz" && item.id === quiz.id
			);

			// Determine if there are next/prev elements
			hasNextElement =
				currentElementIndex < allContentElements.length - 1;
			hasPrevElement = currentElementIndex > 0;

			// Load quiz in modal
			loadContentInModal({
				type: "quiz",
				id: quiz.id,
				data: quiz,
				section: index,
			});
		});

		contentList.appendChild(quizItem);
	}

	return sectionDiv;
}

// Load content in the modal
function loadContentInModal(contentItem) {
	if (!contentItem) return;

	const modalTitle = document.getElementById("contentModalLabel");
	const contentContainer = document.getElementById("modal-content-container");
	const prevButton = document.getElementById("prev-content-btn");
	const nextButton = document.getElementById("next-content-btn");
	const markCompleteButton = document.getElementById("mark-complete-btn");

	// Clear content container
	contentContainer.innerHTML = "";

	// Set modal title based on content type
	modalTitle.textContent = contentItem.data.title;

	// Update current content type
	currentContentType = contentItem.type;

	// Debug logging for navigation
	console.log("Loading content:", {
		type: contentItem.type,
		id: contentItem.id,
		index: currentElementIndex,
		hasPrev: hasPrevElement,
		hasNext: hasNextElement,
		total: allContentElements.length,
	});

	// Enable/disable navigation buttons
	prevButton.disabled = !hasPrevElement;
	nextButton.disabled = !hasNextElement;

	// Reset next button appearance to default
	nextButton.classList.add("btn-primary");
	nextButton.classList.remove("btn-warning");
	nextButton.innerHTML = 'Next <i class="fas fa-arrow-right ms-2"></i>';

	// If next content is a quiz, update next button appearance
	if (hasNextElement) {
		const nextContentIndex = currentElementIndex + 1;
		if (nextContentIndex < allContentElements.length) {
			const nextContent = allContentElements[nextContentIndex];
			if (nextContent && nextContent.type === "quiz") {
				nextButton.classList.add("btn-warning");
				nextButton.classList.remove("btn-primary");
				nextButton.innerHTML =
					'Continue to Quiz <i class="fas fa-question-circle ms-2"></i>';
			}
		}
	}

	// Handle mark complete button
	const isCompleted = window.ProgressTracker.isContentCompleted(
		courseId,
		contentItem.id
	);
	markCompleteButton.disabled = isCompleted;

	// Mark content as started
	window.ProgressTracker.markContentStarted(courseId, contentItem.id);

	// Load content based on type
	if (contentItem.type === "video") {
		loadVideoInModal(contentItem.data);
	} else if (contentItem.type === "quiz") {
		loadQuizInModal(contentItem.data);
	}

	// Show the modal
	modalInstance.show();
}

// Helper function to ensure YouTube API is loaded
function loadYouTubeAPI() {
	if (typeof YT === "undefined" || typeof YT.Player === "undefined") {
		// Add YouTube API script if not already present
		if (!document.getElementById("youtube-api")) {
			const tag = document.createElement("script");
			tag.id = "youtube-api";
			tag.src = "https://www.youtube.com/iframe_api";
			const firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

			console.log("YouTube API script added");
		}

		// Return a promise that resolves when API is ready
		return new Promise((resolve) => {
			window.onYouTubeIframeAPIReady = () => {
				console.log("YouTube API ready");
				resolve();
			};
		});
	} else {
		// API already loaded
		return Promise.resolve();
	}
}

// Load video in modal - with YouTube API check and duration calculation
async function loadVideoInModal(video) {
	const contentContainer = document.getElementById("modal-content-container");
	currentVideoId = video.id;

	// Create video container
	const videoContainer = document.createElement("div");
	videoContainer.innerHTML = `
        <div class="ratio ratio-16x9 mb-3">
            <div id="player"></div>
        </div>
        <p class="video-description">${
			video.description || "No description available."
		}</p>
    `;

	contentContainer.appendChild(videoContainer);

	try {
		// Ensure YouTube API is loaded
		await loadYouTubeAPI();

		// Initialize YouTube player - destroy first if exists
		if (player) {
			try {
				player.destroy();
			} catch (e) {
				console.warn("Could not destroy previous player:", e);
			}
		}

		// Create new YouTube player
		player = new YT.Player("player", {
			videoId: video.videoId,
			playerVars: {
				playsinline: 1,
				rel: 0,
				modestbranding: 1,
			},
			events: {
				onReady: onPlayerReady,
				onStateChange: onPlayerStateChange,
			},
		});
	} catch (e) {
		console.error("Error initializing YouTube player:", e);
		contentContainer.innerHTML += `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error loading video. Please ensure you have an internet connection and try again.
            </div>
        `;
	}
}

// Load quiz in modal
function loadQuizInModal(quiz) {
	const contentContainer = document.getElementById("modal-content-container");

	// Create quiz container
	const quizContainer = document.createElement("div");
	quizContainer.className = "quiz-container";

	// Create quiz form
	const quizForm = document.createElement("form");
	quizForm.id = "quiz-form";

	// Add questions
	quiz.questions.forEach((question, index) => {
		const questionDiv = document.createElement("div");
		questionDiv.className = "mb-4";

		// Question text
		const questionHeading = document.createElement("h5");
		questionHeading.className = "mb-3";
		questionHeading.textContent = `${index + 1}. ${question.question}`;
		questionDiv.appendChild(questionHeading);

		// Options
		question.options.forEach((option, optIndex) => {
			const optionDiv = document.createElement("div");
			optionDiv.className = "form-check mb-2";

			const input = document.createElement("input");
			input.type = "radio";
			input.className = "form-check-input";
			input.name = `question-${index}`;
			input.id = `question-${index}-option-${optIndex}`;
			input.value = optIndex;

			const label = document.createElement("label");
			label.className = "form-check-label";
			label.htmlFor = `question-${index}-option-${optIndex}`;
			label.textContent = option;

			optionDiv.appendChild(input);
			optionDiv.appendChild(label);
			questionDiv.appendChild(optionDiv);
		});

		quizForm.appendChild(questionDiv);
	});

	// Submit button
	const submitButton = document.createElement("button");
	submitButton.type = "submit";
	submitButton.className = "btn btn-primary";
	submitButton.innerHTML =
		'<i class="fas fa-check-circle me-2"></i>Submit Answers';
	quizForm.appendChild(submitButton);

	// Results container
	const resultsDiv = document.createElement("div");
	resultsDiv.id = "quiz-results";
	resultsDiv.className = "d-none";
	resultsDiv.innerHTML = `
        <div class="alert mt-3" role="alert"></div>
    `;

	// Add form and results to quiz container
	quizContainer.appendChild(quizForm);
	quizContainer.appendChild(resultsDiv);

	// Add quiz container to modal
	contentContainer.appendChild(quizContainer);

	// Add submit handler
	quizForm.addEventListener("submit", function (e) {
		e.preventDefault();

		// Calculate score
		let correctAnswers = 0;
		const totalQuestions = quiz.questions.length;

		quiz.questions.forEach((question, index) => {
			const selected = document.querySelector(
				`input[name="question-${index}"]:checked`
			);
			if (
				selected &&
				parseInt(selected.value) === question.correctAnswer
			) {
				correctAnswers++;
			}
		});

		const score = Math.round((correctAnswers / totalQuestions) * 100);
		const passed = score >= 70; // 70% pass threshold

		// Display results
		const resultsAlert = resultsDiv.querySelector(".alert");
		resultsAlert.className = `alert ${
			passed ? "alert-success" : "alert-danger"
		}`;
		resultsAlert.innerHTML = `
            <h5>${passed ? "Congratulations!" : "Try Again"}</h5>
            <p>You scored ${score}% (${correctAnswers} out of ${totalQuestions} correct)</p>
            <p>${
				passed
					? "You have successfully completed this quiz!"
					: "You need to score at least 70% to pass this quiz."
			}</p>
        `;

		// Show results
		resultsDiv.classList.remove("d-none");

		// Mark as completed if passed
		if (passed) {
			window.ProgressTracker.markContentCompleted(courseId, quiz.id);
			document.getElementById("mark-complete-btn").disabled = true;
			updateContentItemUI(quiz.id);
			updateProgressDisplay(
				window.ProgressTracker.getCourseProgress(courseId)
			);

			// Enable next button if available
			if (hasNextElement) {
				document.getElementById("next-content-btn").disabled = false;
			}
		}
	});
}

// YouTube player ready event handler
function onPlayerReady(event) {
	// Play video
	event.target.playVideo();

	// Get duration and verify it
	if (currentVideoId) {
		const actualDuration = player.getDuration();

		// Find the video object in course data
		const videoObject = findVideoById(currentVideoId);

		if (actualDuration > 0 && videoObject) {
			const storedDuration = videoObject.duration;

			// Check if stored duration is significantly different (more than 2 seconds)
			if (
				!storedDuration ||
				Math.abs(storedDuration - actualDuration) > 2
			) {
				console.log(
					`Duration mismatch for ${currentVideoId}: stored=${storedDuration}, actual=${actualDuration}`
				);

				// Update the duration display
				const durationBadge = document.querySelector(
					`#content-${currentVideoId} .badge.bg-light`
				);
				if (durationBadge) {
					durationBadge.innerHTML = `<i class="fas fa-clock me-1"></i>${formatDuration(
						actualDuration
					)}`;
				}
			}
		}
	}
}

// Helper function to find a video by ID in the course data
function findVideoById(videoId) {
	if (!courseData || !courseData.sections) return null;

	for (const section of courseData.sections) {
		if (section.videos) {
			const video = section.videos.find((v) => v.id === videoId);
			if (video) return video;
		}
	}

	return null;
}

// YouTube player state change event handler
function onPlayerStateChange(event) {
	// Video ended
	if (event.data === YT.PlayerState.ENDED && currentVideoId) {
		// Mark as completed
		window.ProgressTracker.markContentCompleted(courseId, currentVideoId);
		document.getElementById("mark-complete-btn").disabled = true;

		// Update UI
		updateContentItemUI(currentVideoId);
		updateProgressDisplay(
			window.ProgressTracker.getCourseProgress(courseId)
		);

		// Find next content
		if (hasNextElement) {
			const nextContentIndex = currentElementIndex + 1;
			const nextContent = allContentElements[nextContentIndex];

			// Check if next content is a quiz
			const isQuizNext = nextContent && nextContent.type === "quiz";

			// Enable next button
			const nextButton = document.getElementById("next-content-btn");
			nextButton.disabled = false;

			// Add visual emphasis to the next button if it's a quiz
			if (isQuizNext) {
				nextButton.classList.add("btn-warning");
				nextButton.classList.remove("btn-primary");
				nextButton.innerHTML =
					'Continue to Quiz <i class="fas fa-question-circle ms-2"></i>';
			} else {
				nextButton.classList.add("btn-primary");
				nextButton.classList.remove("btn-warning");
				nextButton.innerHTML =
					'Next Video <i class="fas fa-arrow-right ms-2"></i>';
			}

			// Show appropriate "Next" prompt
			const contentContainer = document.getElementById(
				"modal-content-container"
			);
			const nextPrompt = document.createElement("div");
			nextPrompt.className = "alert alert-success mt-3";

			if (isQuizNext) {
				nextPrompt.innerHTML =
					'<i class="fas fa-check-circle me-2"></i><strong>Video completed!</strong> Please continue to the quiz to test your knowledge.';
			} else {
				nextPrompt.innerHTML =
					'<i class="fas fa-check-circle me-2"></i>Video completed! Ready for next content?';
			}

			contentContainer.appendChild(nextPrompt);
		}
	}
}

// Update progress display
function updateProgressDisplay(progress) {
	if (!progress) return;

	const progressBar = document.getElementById("progress-bar");
	const progressDetails = document.getElementById("progress-details");

	if (progressBar) {
		progressBar.style.width = `${progress.percentage}%`;
		progressBar.setAttribute("aria-valuenow", progress.percentage);
		progressBar.textContent = `${progress.percentage}%`;
	}

	if (progressDetails) {
		progressDetails.innerHTML = `<i class="fas fa-tasks me-2"></i>${progress.completed} of ${progress.total} items completed (${progress.percentage}%)`;
	}
}

// Setup event handlers
function setupEventHandlers() {
	// Reset progress button
	const resetBtn = document.getElementById("reset-progress-btn");
	if (resetBtn) {
		resetBtn.addEventListener("click", function () {
			if (
				confirm(
					"Are you sure you want to reset your progress for this course? This cannot be undone."
				)
			) {
				window.ProgressTracker.resetCourseProgress(courseId);
				updateProgressDisplay(
					window.ProgressTracker.getCourseProgress(courseId)
				);

				// Reload the page to reset all UI elements
				window.location.reload();
			}
		});
	}
}

// Show error message
function showError(message) {
	const contentContainer = document.getElementById("course-content");
	if (contentContainer) {
		contentContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>${message}
            </div>
        `;
	}
}

// Format duration from seconds to MM:SS
function formatDuration(seconds) {
	if (!seconds || isNaN(seconds)) return "00:00";
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
		.toString()
		.padStart(2, "0")}`;
}
