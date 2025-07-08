// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
	// --- DOM Elements ---
	const coursesContainer = document.getElementById("courses-container");
	const searchInput = document.getElementById("search-input");
	const searchBtn = document.getElementById("search-button");
	const levelFilter = document.getElementById("level-filter");
	const categoryFilter = document.getElementById("category-filter");
	const durationFilter = document.getElementById("duration-filter");
	const instructorFilter = document.getElementById("instructor-filter");
	const sortByFilter = document.getElementById("sort-by-filter");
	const applyFiltersButton = document.getElementById("apply-filters");
	const clearFiltersButton = document.getElementById("clear-filters");
	const activeFiltersContainer = document.getElementById("active-filters");
	const filterTagsContainer = document.getElementById("filter-tags");
	const gridViewBtn = document.getElementById("grid-view-btn");
	const listViewBtn = document.getElementById("list-view-btn");
	const noCoursesMessage = document.getElementById("no-courses-message");
	const loadingIndicator = document.getElementById("loading-indicator");
	const currentlyLearningSection = document.getElementById(
		"currently-learning-section"
	);
	const currentlyLearningContainer = document.getElementById(
		"currently-learning-container"
	);
	const noProgressMessage = document.getElementById("no-progress-message");
	const scrollLeftBtn = document.getElementById("scroll-left");
	const scrollRightBtn = document.getElementById("scroll-right");

	// --- State Variables ---
	let currentViewMode = "grid"; // Default view: 'grid' or 'list' - will be overwritten by localStorage if available
	let currentFilters = {
		category: "",
		level: "",
		duration: "",
		instructor: "",
		sortBy: "popularity",
		searchTerm: "",
	};
	let courseProgress =
		JSON.parse(localStorage.getItem("courseProgress")) || {};
	let allCoursesData = []; // To store the initial course data

	// --- Initialization ---
	init();

	function init() {
		// Ensure essential containers exist
		if (!coursesContainer || !currentlyLearningContainer) {
			console.error("Essential course containers not found!");
			return;
		}

		// Check if course data is loaded
		if (
			typeof window.courses === "undefined" ||
			!Array.isArray(window.courses)
		) {
			console.error(
				"Course data (window.courses) not found or not an array!"
			);
			showNoResults(
				"Error: Could not load course data.",
				coursesContainer,
				noCoursesMessage
			);
			hideLoading();
			return;
		}
		allCoursesData = window.courses; // Store data

		// --- Load persisted view mode ---
		const savedViewMode = localStorage.getItem("catalogueViewMode");
		// Validate the saved value, default to 'grid' if invalid or not found
		if (savedViewMode === "grid" || savedViewMode === "list") {
			currentViewMode = savedViewMode;
		} else {
			currentViewMode = "grid"; // Fallback to default
		}
		// --- End Load ---

		setViewModeUI(currentViewMode); // Set button states and container classes based on loaded/default mode

		// Initial render
		filterAndRenderCourses();

		// Setup listeners
		setupEventListeners();
	}

	// --- Event Listeners ---
	function setupEventListeners() {
		searchBtn?.addEventListener("click", handleSearch);
		searchInput?.addEventListener("keyup", (event) => {
			if (event.key === "Enter") handleSearch();
		});
		applyFiltersButton?.addEventListener("click", handleApplyFilters);
		clearFiltersButton?.addEventListener("click", handleClearFilters);
		gridViewBtn?.addEventListener("click", () =>
			setViewModeAndRender("grid")
		);
		listViewBtn?.addEventListener("click", () =>
			setViewModeAndRender("list")
		);

		// Add event listeners for scroll buttons
		if (scrollLeftBtn) {
			scrollLeftBtn.addEventListener("click", () => {
				scrollHorizontally(-300); // Scroll left by 300px
			});
		}

		if (scrollRightBtn) {
			scrollRightBtn.addEventListener("click", () => {
				scrollHorizontally(300); // Scroll right by 300px
			});
		}
	}

	// Function to scroll the horizontal container
	function scrollHorizontally(amount) {
		const scrollContainer = document.querySelector(".horizontal-scroll");
		if (scrollContainer) {
			scrollContainer.scrollBy({
				left: amount,
				behavior: "smooth",
			});
		}
	}

	function handleSearch() {
		currentFilters.searchTerm = searchInput?.value.trim() || "";
		filterAndRenderCourses();
	}

	function handleApplyFilters() {
		currentFilters = {
			category: categoryFilter?.value || "",
			level: levelFilter?.value || "",
			duration: durationFilter?.value || "",
			instructor: instructorFilter?.value || "",
			sortBy: sortByFilter?.value || "popularity",
			searchTerm: searchInput?.value.trim() || "",
		};
		filterAndRenderCourses();
		// Optionally hide the filter panel
		const advancedFiltersElement =
			document.getElementById("advancedFilters");
		const advancedFiltersInstance = advancedFiltersElement
			? bootstrap.Collapse.getInstance(advancedFiltersElement)
			: null;
		advancedFiltersInstance?.hide();
	}

	function handleClearFilters() {
		// Reset form elements
		if (categoryFilter) categoryFilter.value = "";
		if (levelFilter) levelFilter.value = "";
		if (durationFilter) durationFilter.value = "";
		if (instructorFilter) instructorFilter.value = "";
		if (sortByFilter) sortByFilter.value = "popularity";
		if (searchInput) searchInput.value = ""; // Clear search input too

		// Reset filters object
		currentFilters = {
			category: "",
			level: "",
			duration: "",
			instructor: "",
			sortBy: "popularity",
			searchTerm: "",
		};
		filterAndRenderCourses();
	}

	// --- View Mode ---
	function setViewModeAndRender(mode) {
		// Only proceed if the mode is actually changing
		if (mode !== currentViewMode && (mode === "grid" || mode === "list")) {
			currentViewMode = mode;
			// --- Persist view mode ---
			localStorage.setItem("catalogueViewMode", mode);
			// --- End Persist ---
			setViewModeUI(mode);
			// Re-render with the current filtered data, just changing the layout
			// No need to re-filter, just re-render the list
			// For simplicity, filterAndRenderCourses handles the rendering part correctly
			filterAndRenderCourses();
		}
	}

	function setViewModeUI(mode) {
		if (!coursesContainer || !gridViewBtn || !listViewBtn) return;

		if (mode === "grid") {
			coursesContainer.className = "row g-4"; // Bootstrap grid classes
			gridViewBtn.classList.add("active");
			listViewBtn.classList.remove("active");
		} else {
			// List view
			coursesContainer.className = "courses-list-view"; // Custom class for list styling
			listViewBtn.classList.add("active");
			gridViewBtn.classList.remove("active");
		}
	}

	// --- Loading and Messages ---
	function showLoading() {
		if (loadingIndicator) loadingIndicator.style.display = "block";
		if (coursesContainer) coursesContainer.innerHTML = ""; // Clear main course area
		if (noCoursesMessage) noCoursesMessage.style.display = "none";
	}

	function hideLoading() {
		if (loadingIndicator) loadingIndicator.style.display = "none";
	}

	function showNoResults(
		message = "No courses found matching your filters.",
		container = coursesContainer,
		messageElement = noCoursesMessage
	) {
		if (container) container.innerHTML = ""; // Clear the specific container
		if (messageElement) {
			messageElement.textContent = message;
			messageElement.style.display = "block";
		}
	}

	function hideNoResults(messageElement = noCoursesMessage) {
		if (messageElement) messageElement.style.display = "none";
	}

	// --- Filtering and Sorting ---
	function filterAndSortCourses() {
		let filtered = [...allCoursesData]; // Start with all courses

		// Apply filters (logic remains the same)
		if (currentFilters.category)
			filtered = filtered.filter(
				(c) =>
					c.subject?.toLowerCase() ===
					currentFilters.category.toLowerCase()
			);
		if (currentFilters.level)
			filtered = filtered.filter(
				(c) =>
					c.level?.toLowerCase() ===
					currentFilters.level.toLowerCase()
			);
		if (currentFilters.instructor)
			filtered = filtered.filter(
				(c) =>
					c.instructor?.toLowerCase() ===
					currentFilters.instructor.toLowerCase()
			);
		if (currentFilters.duration) {
			filtered = filtered.filter((c) => {
				const hours = parseInt(c.duration) || 0;
				if (currentFilters.duration === "short")
					return hours > 0 && hours < 3;
				if (currentFilters.duration === "medium")
					return hours >= 3 && hours <= 10;
				if (currentFilters.duration === "long") return hours > 10;
				return false;
			});
		}
		if (currentFilters.searchTerm) {
			const term = currentFilters.searchTerm.toLowerCase();
			filtered = filtered.filter(
				(c) =>
					c.title?.toLowerCase().includes(term) ||
					c.description?.toLowerCase().includes(term) ||
					c.subject?.toLowerCase().includes(term) ||
					c.instructor?.toLowerCase().includes(term)
			);
		}

		// Apply sorting (logic remains the same)
		switch (currentFilters.sortBy) {
			case "newest":
				filtered.sort(
					(a, b) =>
						new Date(b.releaseDate || 0) -
						new Date(a.releaseDate || 0)
				);
				break;
			case "highest-rated":
				filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
				break;
			case "a-z":
				filtered.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case "popularity":
			default:
				filtered.sort(
					(a, b) =>
						(b.enrollments || 0) - (a.enrollments || 0) ||
						a.title.localeCompare(b.title)
				);
				break;
		}
		return filtered;
	}

	// --- Rendering ---
	function filterAndRenderCourses() {
		showLoading();
		updateActiveFilterTags();

		// Render currently learning first (doesn't depend on filters)
		renderCurrentlyLearning();

		// Use timeout to allow UI updates (loading indicator)
		setTimeout(() => {
			const filteredCourses = filterAndSortCourses();

			if (filteredCourses.length === 0) {
				showNoResults(
					"No courses found matching your filters.",
					coursesContainer,
					noCoursesMessage
				);
			} else {
				hideNoResults(noCoursesMessage);
				renderCourseList(filteredCourses, coursesContainer);
			}
			hideLoading();
		}, 50); // Shorter delay might be sufficient
	}

	function renderCourseList(courses, container) {
		if (!container) return;
		container.innerHTML = ""; // Clear previous content

		courses.forEach((course) => {
			const courseCard = createCourseCard(course);
			let wrapper;

			// Use the currentViewMode state variable to decide the layout
			if (currentViewMode === "grid") {
				wrapper = document.createElement("div");
				wrapper.className =
					"col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4 course-card-wrapper";
				wrapper.appendChild(courseCard);
			} else {
				// List view
				wrapper = document.createElement("div");
				wrapper.className = "course-card-wrapper";
				wrapper.appendChild(courseCard);
			}
			container.appendChild(wrapper);
		});
	}

	function renderCurrentlyLearning() {
		if (
			!currentlyLearningContainer ||
			!currentlyLearningSection ||
			!noProgressMessage
		)
			return;

		// Get user progress data from localStorage for all courses
		let userProgressData = {};
		allCoursesData.forEach((course) => {
			const progressKey = `progress_${course.id}`;
			const courseProgress = JSON.parse(
				localStorage.getItem(progressKey)
			);
			if (courseProgress && courseProgress.overallProgress > 0) {
				userProgressData[course.id] = {
					progress: courseProgress.overallProgress,
					totalWatchTime: courseProgress.totalWatchTime || 0,
				};
			}
		});

		const inProgressCourses = allCoursesData.filter(
			(course) =>
				userProgressData[course.id] &&
				userProgressData[course.id].progress > 0
		);

		// Sort by progress percentage (highest first)
		inProgressCourses.sort(
			(a, b) =>
				(userProgressData[b.id]?.progress || 0) -
				(userProgressData[a.id]?.progress || 0)
		);

		currentlyLearningContainer.innerHTML = "";

		if (inProgressCourses.length === 0) {
			currentlyLearningSection.style.display = "none";
		} else {
			currentlyLearningSection.style.display = "block";
			hideNoResults(noProgressMessage);

			// Toggle visibility of scroll buttons based on course count
			const scrollButtons = document.querySelector(".scroll-buttons");
			if (scrollButtons) {
				if (inProgressCourses.length <= 3) {
					scrollButtons.style.display = "none";
				} else {
					scrollButtons.style.display = "block";
				}
			}

			inProgressCourses.forEach((course) => {
				const courseProgress = userProgressData[course.id];
				const card = createCourseCard(course, true, courseProgress);

				const wrapper = document.createElement("div");
				wrapper.className = "course-card-wrapper";
				wrapper.appendChild(card);

				currentlyLearningContainer.appendChild(wrapper);
			});
		}
	}

	function createCourseCard(
		course,
		showProgress = false,
		progressData = null
	) {
		// Get course progress data
		const progress = progressData?.progress || 0;
		const watchTimeSeconds = progressData?.totalWatchTime || 0;

		// Format watch time
		const formattedWatchTime = formatWatchTime(watchTimeSeconds);

		const card = document.createElement("div");
		card.className = "course-card";

		let imagePath = `https://picsum.photos/seed/${course.id}/400/225`;
		if (typeof config?.images?.getCourseImageUrl === "function") {
			imagePath = config.images.getCourseImageUrl(course);
		} else if (course.image) {
			imagePath = course.image;
		}
		const fallbackImage = `https://picsum.photos/seed/${course.id}/400/225`;

		const progressHTML =
			showProgress && progress > 0
				? `
				<div class="progress-bar-container mb-2 mt-auto">
					<div class="progress-bar" style="width: ${progress}%" title="${progress}% Complete"></div>
				</div>
				<div class="progress-text text-muted small">${progress}% Complete</div>`
				: "";

		const watchTimeHTML =
			showProgress && watchTimeSeconds > 0
				? `<div class="watch-time">
				<i class="fas fa-clock"></i> ${formattedWatchTime} watched
			   </div>`
				: "";

		const levelClass = course.level?.toLowerCase() || "unknown";
		const levelText = course.level || "N/A";
		const difficultyBadge = `<div class="difficulty-badge ${levelClass}">${levelText}</div>`;

		card.innerHTML = `
			<div class="course-image">
				<img src="${imagePath}" alt="${
			course.title || "Course image"
		}" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImage}';">
				${difficultyBadge}
			</div>
			<div class="course-content">
				<h3 class="course-title">${course.title || "Untitled Course"}</h3>
				<p class="course-description">${
					course.description || "No description available."
				}</p>
				<div class="course-meta">
					<span><i class="material-icons">schedule</i> ${course.duration || "N/A"}</span>
					<span><i class="material-icons">category</i> ${course.subject || "N/A"}</span>
				</div>
				${progressHTML}
				${watchTimeHTML}
				<a href="course-details.html?id=${
					course.id
				}" class="btn primary-btn btn-sm mt-2 stretched-link">
					${showProgress && progress > 0 ? "Continue Learning" : "View Course"}
				</a>
			</div>
		`;

		card.addEventListener("click", function (event) {
			// Stretched link handles navigation
		});

		return card;
	}

	// Format seconds into HH:MM:SS or MM:SS format
	function formatWatchTime(seconds) {
		if (isNaN(seconds) || seconds < 0) seconds = 0;

		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		} else if (minutes > 0) {
			return `${minutes}m ${secs}s`;
		} else {
			return `${secs}s`;
		}
	}

	// --- Filter Tags ---
	function updateActiveFilterTags() {
		// Logic remains the same
		if (!activeFiltersContainer || !filterTagsContainer) return;

		const activeFilterEntries = Object.entries(currentFilters).filter(
			([key, value]) =>
				value &&
				!(key === "sortBy" && value === "popularity") &&
				key !== "searchTerm"
		);

		if (activeFilterEntries.length === 0 && !currentFilters.searchTerm) {
			activeFiltersContainer.classList.add("d-none");
			return;
		}

		activeFiltersContainer.classList.remove("d-none");
		filterTagsContainer.innerHTML = "";

		if (currentFilters.searchTerm) {
			addFilterTag(
				"Search",
				`"${currentFilters.searchTerm}"`,
				"searchTerm"
			);
		}

		activeFilterEntries.forEach(([key, value]) => {
			let label = key.charAt(0).toUpperCase() + key.slice(1);
			let textValue = value;
			const selectElement = document.getElementById(`${key}-filter`);
			if (selectElement) {
				const selectedOption = selectElement.querySelector(
					`option[value="${value}"]`
				);
				if (selectedOption) {
					textValue = selectedOption.textContent;
				}
			}
			addFilterTag(label, textValue, key);
		});
	}

	function addFilterTag(label, value, filterKey) {
		// Logic remains the same
		if (!filterTagsContainer) return;
		const tag = document.createElement("span");
		tag.className = "badge bg-light text-dark border filter-tag me-1 mb-1";
		tag.innerHTML = `${label}: ${value} <i class="fas fa-times ms-1 remove-filter" data-filter="${filterKey}" role="button" title="Remove filter"></i>`;
		filterTagsContainer.appendChild(tag);

		tag.querySelector(".remove-filter")?.addEventListener(
			"click",
			function () {
				const filterType = this.dataset.filter;
				const filterElement = document.getElementById(
					`${filterType}-filter`
				);
				if (filterElement)
					filterElement.value =
						filterType === "sortBy" ? "popularity" : "";
				if (filterType === "searchTerm" && searchInput)
					searchInput.value = "";

				currentFilters[filterType] =
					filterType === "sortBy" ? "popularity" : "";

				filterAndRenderCourses();
			}
		);
	}
}); // End DOMContentLoaded
