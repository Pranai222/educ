// Course details page functionality

document.addEventListener("DOMContentLoaded", function () {
	// Get the course ID from URL parameters
	const urlParams = new URLSearchParams(window.location.search);
	const courseId = urlParams.get("id");

	// If no course ID in URL, try to get from localStorage
	const selectedCourseId =
		courseId || localStorage.getItem("selectedCourseId");

	if (!selectedCourseId) {
		showError(
			"No course selected. Please go back to the course listing and select a course."
		);
		return;
	}

	// Find the course from the courses array in course-data.js
	const currentCourse = window.courses.find(
		(course) => course.id === selectedCourseId
	);

	if (!currentCourse) {
		showError(
			"Course not found. Please go back to the course listing and select a valid course."
		);
		return;
	}

	console.log("Course found:", currentCourse);

	// Update page title with course name
	document.title = `${currentCourse.title} - eVidya`;

	// Set course title and description
	const courseTitle = document.getElementById("course-title");
	if (courseTitle) {
		courseTitle.textContent = currentCourse.title;
	}

	const courseDescription = document.getElementById("course-description");
	if (courseDescription) {
		courseDescription.innerHTML = `<span class="badge bg-${getLevelBadgeClass(
			currentCourse.level
		)} me-2">${currentCourse.level}</span> ${currentCourse.duration} | ${
			currentCourse.subject
		}`;
	}

	// Initialize Bootstrap modals
	const videoModal = new bootstrap.Modal(
		document.getElementById("videoModal")
	);
	const quizModal = new bootstrap.Modal(document.getElementById("quizModal"));

	// YouTube API variables
	let youtubePlayer = null;
	let currentVideoId = null;
	let currentVideoData = null;
	let videoStartTime = 0;
	let watchTimeInterval = null;
	let totalWatchTime = 0;
	let allVideosInCourse = [];
	let currentVideoIndex = -1;

	// Load user progress data from localStorage
	let userProgress = JSON.parse(
		localStorage.getItem(`progress_${selectedCourseId}`)
	) || {
		completedVideos: [],
		quizResults: {},
		overallProgress: 0,
		totalWatchTime: 0, // In seconds
	};

	// If totalWatchTime wasn't previously tracked, initialize it
	if (userProgress.totalWatchTime === undefined) {
		userProgress.totalWatchTime = 0;
	}

	totalWatchTime = userProgress.totalWatchTime;

	// Extract all videos from the course and flatten them into a single array
	if (currentCourse.sections && currentCourse.sections.length > 0) {
		currentCourse.sections.forEach((section) => {
			if (section.videos && section.videos.length > 0) {
				allVideosInCourse = [...allVideosInCourse, ...section.videos];
			}
		});
	}

	// Update progress bar
	updateProgressBar(userProgress.overallProgress || 0);

	// Render course content
	renderCourseContent(currentCourse, userProgress);

	// Set up YouTube API
	window.onYouTubeIframeAPIReady = function () {
		console.log("YouTube API Ready");
		// The player will be created when a video is selected
	};

	// Handle navigation buttons in video modal
	document
		.getElementById("prevVideoBtn")
		.addEventListener("click", function () {
			navigateVideo("prev");
		});

	document
		.getElementById("nextVideoBtn")
		.addEventListener("click", function () {
			navigateVideo("next");
		});

	// Function to navigate between videos
	function navigateVideo(direction) {
		if (currentVideoIndex === -1 || allVideosInCourse.length === 0) return;

		let newIndex = currentVideoIndex;

		if (direction === "prev") {
			newIndex = Math.max(0, currentVideoIndex - 1);
		} else if (direction === "next") {
			newIndex = Math.min(
				allVideosInCourse.length - 1,
				currentVideoIndex + 1
			);
		}

		// Only change if we're actually moving to a different video
		if (newIndex !== currentVideoIndex) {
			// Save watch time for current video before switching
			saveCurrentWatchTime();

			// Open the new video
			openVideoModal(allVideosInCourse[newIndex]);
		}
	}

	// Handle video completion button in modal
	document
		.getElementById("markVideoCompleted")
		.addEventListener("click", function () {
			const videoId = this.getAttribute("data-video-id");
			if (videoId) {
				markVideoAsCompleted(videoId);

				// Update the video item in the course list
				const videoItem = document.querySelector(
					`.video-item[data-video-id="${videoId}"]`
				);
				if (videoItem) {
					videoItem.classList.add(
						"video-completed",
						"list-group-item-success"
					);
					const badge = videoItem.querySelector(".video-badge");
					if (!badge) {
						const newBadge = document.createElement("span");
						newBadge.className =
							"badge bg-success ms-2 video-badge";
						newBadge.textContent = "Completed";
						videoItem.querySelector("h5").appendChild(newBadge);
					}
				}

				this.disabled = true;
				this.innerHTML =
					'<i class="fas fa-check-circle me-2"></i>Already Completed';
			}
		});

	// Set up reset progress button
	const resetBtn = document.getElementById("reset-progress-btn");
	if (resetBtn) {
		resetBtn.addEventListener("click", function () {
			if (
				confirm(
					"Are you sure you want to reset your progress for this course? This will reset your completed videos, quiz results, and watch time."
				)
			) {
				// Reset progress for this course
				localStorage.setItem(
					`progress_${selectedCourseId}`,
					JSON.stringify({
						completedVideos: [],
						quizResults: {},
						overallProgress: 0,
						totalWatchTime: 0,
					})
				);

				// Refresh the page
				window.location.reload();
			}
		});
	}

	// Helper function to show error messages
	function showError(message) {
		const courseContent = document.getElementById("course-content");
		if (courseContent) {
			courseContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>${message}
                </div>
                <a href="./catalogue.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left me-2"></i>Back to Course Catalogue
                </a>
            `;
		}
		console.error(message);
	}

	// Helper function to determine badge color based on level
	function getLevelBadgeClass(level) {
		switch (level?.toLowerCase()) {
			case "beginner":
				return "success";
			case "intermediate":
				return "warning";
			case "advanced":
				return "danger";
			default:
				return "secondary";
		}
	}

	// Function to update progress bar
	function updateProgressBar(progress) {
		console.log("Updating progress bar:", progress);
		const progressBar = document.getElementById("progress-bar");
		const progressDetails = document.getElementById("progress-details");

		if (progressBar) {
			progressBar.style.width = `${progress}%`;
			progressBar.textContent = `${progress}%`;
			progressBar.setAttribute("aria-valuenow", progress);
		}

		if (progressDetails) {
			// Include total watch time in the progress details
			const formattedWatchTime = formatWatchTime(totalWatchTime);
			progressDetails.innerHTML = `<i class="fas fa-chart-line me-2"></i>Completed ${progress}% of course content | <i class="fas fa-clock me-1"></i>Total watch time: ${formattedWatchTime}`;
		}
	}

	// Format seconds into HH:MM:SS or MM:SS format
	function formatWatchTime(seconds) {
		if (isNaN(seconds) || seconds < 0) seconds = 0;

		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
				.toString()
				.padStart(2, "0")}`;
		} else {
			return `${minutes}:${secs.toString().padStart(2, "0")}`;
		}
	}

	// Function to save the current watch time
	function saveCurrentWatchTime() {
		if (youtubePlayer && currentVideoId) {
			try {
				// Get current video time and calculate elapsed watch time
				const currentTime = youtubePlayer.getCurrentTime();
				const elapsedTime = Math.round(currentTime - videoStartTime);

				if (elapsedTime > 0) {
					// Add to total watch time
					totalWatchTime += elapsedTime;
					userProgress.totalWatchTime = totalWatchTime;

					// Save to localStorage
					localStorage.setItem(
						`progress_${selectedCourseId}`,
						JSON.stringify(userProgress)
					);

					// Update UI
					updateProgressBar(userProgress.overallProgress || 0);

					console.log(
						`Added ${elapsedTime}s watch time. Total: ${totalWatchTime}s`
					);
				}

				// Reset start time for next measurement
				videoStartTime = currentTime;
			} catch (e) {
				console.error("Error saving watch time:", e);
			}
		}
	}

	// Function to calculate and update course progress
	function calculateProgress(course, userProgress) {
		// Count total content items (videos + quizzes)
		let totalItems = 0;
		let completedItems = 0;

		// Count videos and completed videos
		course.sections.forEach((section) => {
			if (section.videos) totalItems += section.videos.length;
			if (section.quiz) totalItems += 1;
		});

		// Count completed videos
		completedItems = userProgress.completedVideos.length;

		// Count completed quizzes
		Object.keys(userProgress.quizResults || {}).forEach((quizId) => {
			if (
				userProgress.quizResults[quizId] &&
				userProgress.quizResults[quizId].completed
			) {
				completedItems++;
			}
		});

		// Calculate percentage
		const progress =
			totalItems > 0
				? Math.round((completedItems / totalItems) * 100)
				: 0;

		// Update user progress
		userProgress.overallProgress = progress;
		localStorage.setItem(
			`progress_${selectedCourseId}`,
			JSON.stringify(userProgress)
		);

		// Update progress bar
		updateProgressBar(progress);

		return progress;
	}

	// Function to render course content
	function renderCourseContent(course, userProgress) {
		const courseContent = document.getElementById("course-content");
		if (!courseContent) {
			console.error("Course content container not found");
			return;
		}

		console.log("Rendering course content");

		// Clear loading message
		courseContent.innerHTML = "";

		// Create container for sections
		const sectionsContainer = document.createElement("div");
		sectionsContainer.className = "course-sections";

		// Render each section
		if (course.sections && course.sections.length > 0) {
			course.sections.forEach((section, sectionIndex) => {
				console.log("Rendering section:", section.title);

				// Create section container
				const sectionDiv = document.createElement("div");
				sectionDiv.className = "section-container mb-5";

				// Add section title
				const sectionTitle = document.createElement("h2");
				sectionTitle.className = "section-title mb-4";
				sectionTitle.innerHTML = `<i class="fas fa-book me-2"></i>${section.title}`;
				sectionDiv.appendChild(sectionTitle);

				// Create section content container
				const sectionContent = document.createElement("div");
				sectionContent.className = "section-content";

				// Create videos list
				const videosList = document.createElement("div");
				videosList.className = "section-videos list-group mb-4";

				// Render videos
				if (section.videos && section.videos.length > 0) {
					section.videos.forEach((video, videoIndex) => {
						// Create video list item
						const videoItem = document.createElement("div");
						videoItem.className =
							"list-group-item list-group-item-action video-item";
						videoItem.setAttribute("data-video-id", video.id);

						// Check if video is completed
						const isCompleted =
							userProgress.completedVideos.includes(video.id);
						if (isCompleted) {
							videoItem.classList.add(
								"list-group-item-success",
								"video-completed"
							);
						}

						// Set video content
						videoItem.innerHTML = `
                            <div class="d-flex w-100 justify-content-between align-items-center">
                                <h5 class="mb-1">
                                    <i class="fas fa-play-circle me-2"></i>${
										video.title
									}
                                    ${
										isCompleted
											? '<span class="badge bg-success ms-2 video-badge">Completed</span>'
											: ""
									}
                                </h5>
                                <button class="btn btn-sm btn-primary watch-video-btn">
                                    <i class="fas fa-play me-1"></i> Watch
                                </button>
                            </div>
                            <p class="text-muted small mb-0">${
								video.description
									? video.description.substring(0, 120) +
									  (video.description.length > 120
											? "..."
											: "")
									: ""
							}</p>
                        `;

						// Add click event to open video modal
						videoItem
							.querySelector(".watch-video-btn")
							.addEventListener("click", function (e) {
								e.stopPropagation(); // Prevent the parent click event
								openVideoModal(video);
							});

						// Make the entire item clickable
						videoItem.addEventListener("click", function () {
							openVideoModal(video);
						});

						// Add to videos container
						videosList.appendChild(videoItem);
					});
				}

				// Add videos list to section content
				sectionContent.appendChild(videosList);

				// Render quiz if available
				if (section.quiz) {
					const quizContainer = document.createElement("div");
					quizContainer.className = "section-quiz mb-4";

					// Create quiz item
					const quizItem = document.createElement("div");
					quizItem.className =
						"list-group-item list-group-item-action quiz-item";
					quizItem.setAttribute("data-quiz-id", section.quiz.id);

					// Check if quiz is completed
					const quizResult =
						userProgress.quizResults &&
						userProgress.quizResults[section.quiz.id];
					const isQuizCompleted = quizResult && quizResult.completed;

					if (isQuizCompleted) {
						quizItem.classList.add("list-group-item-success");
					}

					// Set quiz content
					quizItem.innerHTML = `
                        <div class="d-flex w-100 justify-content-between align-items-center">
                            <h5 class="mb-1">
                                <i class="fas fa-question-circle me-2"></i>${
									section.quiz.title
								}
                                ${
									isQuizCompleted
										? `<span class="badge bg-success ms-2">Completed (Score: ${quizResult.score}%)</span>`
										: ""
								}
                            </h5>
                            <button class="btn btn-sm btn-${
								isQuizCompleted ? "outline-primary" : "primary"
							} take-quiz-btn">
                                <i class="fas fa-${
									isQuizCompleted ? "redo" : "question-circle"
								} me-1"></i>
                                ${isQuizCompleted ? "Retake Quiz" : "Take Quiz"}
                            </button>
                        </div>
                        <p class="text-muted small mb-0">
                            ${
								section.quiz.questions
									? section.quiz.questions.length
									: 0
							} questions to test your knowledge
                        </p>
                    `;

					// Add click event to open quiz modal
					quizItem
						.querySelector(".take-quiz-btn")
						.addEventListener("click", function (e) {
							e.stopPropagation(); // Prevent the parent click event
							openQuizModal(section.quiz);
						});

					// Make the entire item clickable
					quizItem.addEventListener("click", function () {
						openQuizModal(section.quiz);
					});

					// Add to container
					quizContainer.appendChild(quizItem);
					sectionContent.appendChild(quizContainer);
				}

				// Add section content to section container
				sectionDiv.appendChild(sectionContent);

				// Add the section to the main container
				sectionsContainer.appendChild(sectionDiv);
			});
		} else {
			// No sections found
			sectionsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>No content has been added to this course yet.
                </div>
            `;
		}

		// Add all sections to course content
		courseContent.appendChild(sectionsContainer);

		// Calculate initial progress
		calculateProgress(course, userProgress);
	}

	// Function to open video in modal
	function openVideoModal(video) {
		// Save watch time of the current video before loading a new one
		if (youtubePlayer && currentVideoId && currentVideoId !== video.id) {
			saveCurrentWatchTime();
		}

		// Set the current video data
		currentVideoId = video.id;
		currentVideoData = video;
		currentVideoIndex = allVideosInCourse.findIndex(
			(v) => v.id === video.id
		);

		// Update navigation button states
		document.getElementById("prevVideoBtn").disabled =
			currentVideoIndex <= 0;
		document.getElementById("nextVideoBtn").disabled =
			currentVideoIndex >= allVideosInCourse.length - 1;

		// Set modal title
		document.getElementById("videoModalLabel").textContent = video.title;

		// Clear any existing player
		const videoContent = document.getElementById("videoModalContent");
		videoContent.innerHTML = "";

		// Create a div for the player
		const playerDiv = document.createElement("div");
		playerDiv.id = "youtube-player";
		videoContent.appendChild(playerDiv);

		// Extract YouTube video ID from the URL or use provided videoId
		let youtubeVideoId;
		if (video.videoId) {
			youtubeVideoId = video.videoId;
		} else if (video.url) {
			// Extract ID from various YouTube URL formats
			const match = video.url.match(
				/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
			);
			youtubeVideoId = match && match[1];
		}

		if (!youtubeVideoId) {
			videoContent.innerHTML = `<div class="alert alert-warning">Invalid YouTube video URL or ID</div>`;
			return;
		}

		// Set description
		const videoDescription = document.getElementById("videoDescription");
		if (video.description) {
			videoDescription.innerHTML = `<p>${video.description}</p>`;
			videoDescription.classList.remove("d-none");
		} else {
			videoDescription.innerHTML = "";
			videoDescription.classList.add("d-none");
		}

		// Show watch stats container
		document
			.getElementById("videoWatchStats")
			.classList.remove("d-none");
		document.getElementById("videoWatchTime").innerHTML =
			'<i class="fas fa-clock me-1"></i>Watch time: 0:00';

		// Set up the complete button with the video ID
		const completeButton = document.getElementById("markVideoCompleted");
		completeButton.setAttribute("data-video-id", video.id);

		// If the video is already completed, disable the complete button
		const isCompleted = userProgress.completedVideos.includes(video.id);
		completeButton.disabled = isCompleted;
		completeButton.innerHTML = isCompleted
			? '<i class="fas fa-check-circle me-2"></i>Already Completed'
			: '<i class="fas fa-check-circle me-2"></i>Mark as Completed';

		// Create a new YouTube player
		if (typeof YT !== "undefined" && YT.Player) {
			youtubePlayer = new YT.Player("youtube-player", {
				height: "390",
				width: "100%",
				videoId: youtubeVideoId,
				playerVars: {
					playsinline: 1,
					rel: 0,
				},
				events: {
					onReady: onPlayerReady,
					onStateChange: onPlayerStateChange,
				},
			});
		} else {
			// YouTube API not ready yet, load video without advanced tracking
			videoContent.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${youtubeVideoId}?rel=0"
                    title="${video.title}"
                    class="w-100 h-100"
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                </iframe>
            `;
			console.warn("YouTube API not available. Video tracking disabled.");
		}

		// Show modal
		videoModal.show();

		// When modal is closed, clean up player and save watch time
		document
			.getElementById("videoModal")
			.addEventListener("hidden.bs.modal", function () {
				saveCurrentWatchTime();
				clearInterval(watchTimeInterval);
				watchTimeInterval = null;
				videoContent.innerHTML = "";
				youtubePlayer = null;
			});
	}

	// YouTube player ready handler
	function onPlayerReady(event) {
		// Start tracking time from current position
		videoStartTime = event.target.getCurrentTime();

		// Set up interval to update watch time display
		if (watchTimeInterval) {
			clearInterval(watchTimeInterval);
		}

		watchTimeInterval = setInterval(function () {
			if (youtubePlayer && youtubePlayer.getCurrentTime) {
				try {
					const currentTime = youtubePlayer.getCurrentTime();
					const watchTime = Math.round(currentTime - videoStartTime);

					if (watchTime > 0) {
						document.getElementById("videoWatchTime").innerHTML = `<i class="fas fa-clock me-1"></i>Watch time: ${formatWatchTime(
							watchTime
						)}`;
					}
				} catch (e) {
					console.error("Error updating watch time display:", e);
				}
			}
		}, 1000);
	}

	// YouTube player state change handler
	function onPlayerStateChange(event) {
		// YT.PlayerState.ENDED = 0
		if (event.data === YT.PlayerState.ENDED) {
			// Video has ended
			saveCurrentWatchTime();

			// Auto mark the video as completed
			if (!userProgress.completedVideos.includes(currentVideoId)) {
				markVideoAsCompleted(currentVideoId);

				// Update the mark as completed button
				const completeButton = document.getElementById(
					"markVideoCompleted"
				);
				completeButton.disabled = true;
				completeButton.innerHTML =
					'<i class="fas fa-check-circle me-2"></i>Already Completed';

				// Show completion message
				const videoDescription =
					document.getElementById("videoDescription");
				videoDescription.innerHTML += `
                    <div class="alert alert-success mt-3">
                        <i class="fas fa-check-circle me-2"></i>Video marked as completed automatically
                    </div>
                `;
			}
		}
	}

	// Function to open quiz in modal
	function openQuizModal(quiz) {
		// Set modal title
		document.getElementById("quizModalLabel").textContent = quiz.title;

		// Get content container
		const quizContent = document.getElementById("quizModalContent");
		quizContent.innerHTML = "";

		// Create quiz form
		const quizForm = document.createElement("form");
		quizForm.id = `quiz-form-${quiz.id}`;
		quizForm.className = "quiz-form";

		// Check if quiz was already completed
		const quizResult =
			userProgress.quizResults && userProgress.quizResults[quiz.id];
		const isCompleted = quizResult && quizResult.completed;

		// If completed, show results first
		if (isCompleted) {
			const resultDiv = document.createElement("div");
			resultDiv.id = "quiz-completed-result";
			resultDiv.className =
				"alert " +
				(quizResult.score >= 70 ? "alert-success" : "alert-warning");
			resultDiv.innerHTML = `
                <h4>${
					quizResult.score >= 70 ? "Great job!" : "Keep practicing!"
				}</h4>
                <p>You scored ${quizResult.score}% on this quiz.</p>
                <button type="button" class="btn btn-primary retake-quiz-btn">
                    <i class="fas fa-redo me-2"></i>Retake Quiz
                </button>
            `;

			quizContent.appendChild(resultDiv);

			// Handle retake button
			resultDiv
				.querySelector(".retake-quiz-btn")
				.addEventListener("click", function () {
					resultDiv.classList.add("d-none");
					quizForm.classList.remove("d-none");
				});
		}

		// Add appropriate class to hide form if needed
		if (isCompleted) {
			quizForm.classList.add("d-none");
		}

		// Create questions
		if (quiz.questions && quiz.questions.length > 0) {
			quiz.questions.forEach((question, qIndex) => {
				const questionDiv = document.createElement("div");
				questionDiv.className = "mb-4 quiz-question";

				// Add question text
				const questionText = document.createElement("p");
				questionText.className = "fw-bold";
				questionText.textContent = `${qIndex + 1}. ${
					question.question
				}`;
				questionDiv.appendChild(questionText);

				// Add options
				if (question.options && question.options.length > 0) {
					question.options.forEach((option, oIndex) => {
						const optionDiv = document.createElement("div");
						optionDiv.className = "form-check";

						const optionId = `quiz-modal-${quiz.id}-q${qIndex}-o${oIndex}`;

						optionDiv.innerHTML = `
                            <input class="form-check-input" type="radio" name="q${qIndex}" id="${optionId}" value="${oIndex}">
                            <label class="form-check-label" for="${optionId}">${option}</label>
                        `;

						questionDiv.appendChild(optionDiv);
					});
				}

				quizForm.appendChild(questionDiv);
			});

			// Add submit button
			const submitDiv = document.createElement("div");
			submitDiv.className = "text-center mt-4";
			submitDiv.innerHTML = `
                <button type="submit" class="btn btn-primary btn-lg">
                    <i class="fas fa-check-circle me-2"></i>Submit Answers
                </button>
            `;
			quizForm.appendChild(submitDiv);

			// Handle quiz submission
			quizForm.addEventListener("submit", function (e) {
				e.preventDefault();

				// Calculate score
				let score = 0;
				let totalQuestions = quiz.questions.length;

				quiz.questions.forEach((question, qIndex) => {
					const selectedOption = document.querySelector(
						`input[name="q${qIndex}"]:checked`
					);
					if (
						selectedOption &&
						parseInt(selectedOption.value) === question.answer
					) {
						score++;
					}
				});

				const scorePercent = Math.round((score / totalQuestions) * 100);

				// Save in user progress
				if (!userProgress.quizResults) userProgress.quizResults = {};

				userProgress.quizResults[quiz.id] = {
					completed: true,
					score: scorePercent,
					date: new Date().toISOString(),
				};

				// Save progress
				localStorage.setItem(
					`progress_${selectedCourseId}`,
					JSON.stringify(userProgress)
				);

				// Show result message in modal footer
				const resultMsg = document.getElementById("quizResultMsg");
				resultMsg.innerHTML = `
                    <div class="alert ${
						scorePercent >= 70 ? "alert-success" : "alert-warning"
					} mb-0">
                        <strong>${
							scorePercent >= 70
								? "Great job!"
								: "Keep practicing!"
						}</strong>
                        You scored ${scorePercent}% on this quiz.
                    </div>
                `;
				resultMsg.classList.remove("d-none");

				// Hide the form
				quizForm.classList.add("d-none");

				// Add a continue button to close the modal
				const continueBtn = document.createElement("button");
				continueBtn.type = "button";
				continueBtn.className = "btn btn-success";
				continueBtn.innerHTML =
					'<i class="fas fa-check me-2"></i>Continue';
				continueBtn.addEventListener("click", function () {
					quizModal.hide();

					// Update the quiz item in the course list
					const quizItem = document.querySelector(
						`.quiz-item[data-quiz-id="${quiz.id}"]`
					);
					if (quizItem) {
						quizItem.classList.add("list-group-item-success");
						const title = quizItem.querySelector("h5");
						if (title) {
							const badge = title.querySelector(".badge");
							if (badge) {
								badge.textContent = `Completed (Score: ${scorePercent}%)`;
							} else {
								const newBadge = document.createElement("span");
								newBadge.className = "badge bg-success ms-2";
								newBadge.textContent = `Completed (Score: ${scorePercent}%)`;
								title.appendChild(newBadge);
							}
						}

						// Update the button text
						const button = quizItem.querySelector(".take-quiz-btn");
						if (button) {
							button.innerHTML =
								'<i class="fas fa-redo me-1"></i> Retake Quiz';
							button.classList.remove("btn-primary");
							button.classList.add("btn-outline-primary");
						}
					}

					// Recalculate progress
					calculateProgress(currentCourse, userProgress);
				});

				// Clear any existing continue button
				const modalFooter = document.querySelector(
					"#quizModal .modal-footer"
				);
				const existingContinueBtn =
					modalFooter.querySelector(".btn-success");
				if (existingContinueBtn) {
					existingContinueBtn.remove();
				}

				// Add the button before the close button
				const closeBtn = modalFooter.querySelector(".btn-secondary");
				if (closeBtn) {
					modalFooter.insertBefore(continueBtn, closeBtn);
				} else {
					modalFooter.appendChild(continueBtn);
				}
			});
		}

		// Add form to content
		quizContent.appendChild(quizForm);

		// Show modal
		quizModal.show();

		// When modal is hidden, clean up
		document
			.getElementById("quizModal")
			.addEventListener("hidden.bs.modal", function () {
				document
					.getElementById("quizResultMsg")
					.classList.add("d-none");

				// Remove any continue buttons
				const continueBtn = document.querySelector(
					"#quizModal .modal-footer .btn-success"
				);
				if (continueBtn) {
					continueBtn.remove();
				}
			});
	}

	// Function to mark a video as completed
	function markVideoAsCompleted(videoId) {
		console.log("Marking video as completed:", videoId);

		// Get current progress
		let userProgress = JSON.parse(
			localStorage.getItem(`progress_${selectedCourseId}`)
		) || {
			completedVideos: [],
			quizResults: {},
			overallProgress: 0,
			totalWatchTime: 0,
		};

		// Add video to completed list if not already there
		if (!userProgress.completedVideos.includes(videoId)) {
			userProgress.completedVideos.push(videoId);

			// Update in localStorage
			localStorage.setItem(
				`progress_${selectedCourseId}`,
				JSON.stringify(userProgress)
			);

			// Update UI
			const videoItem = document.querySelector(
				`.video-item[data-video-id="${videoId}"]`
			);
			if (videoItem) {
				videoItem.classList.add(
					"list-group-item-success",
					"video-completed"
				);

				// Add completed badge if not exists
				let title = videoItem.querySelector("h5");
				if (title && !title.querySelector(".badge")) {
					const badge = document.createElement("span");
					badge.className = "badge bg-success ms-2 video-badge";
					badge.textContent = "Completed";
					title.appendChild(badge);
				}
			}

			// Recalculate progress
			calculateProgress(currentCourse, userProgress);
		}
	}
});
