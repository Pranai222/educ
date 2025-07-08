/**
 * Main JavaScript file for the eVidya Platform
 * Handles initialization and global utilities
 */

// Detect if we're running on GitHub Pages and adjust paths if needed
(function () {
	// For GitHub Pages - set the expected base path (can be empty for username.github.io repos)
	const githubPagesRepo = "eVidya";

	// Function to determine if we're running on GitHub Pages
	function isRunningOnGitHubPages() {
		return window.location.hostname.includes("github.io");
	}

	// Function to get the correct base path
	function getBasePath() {
		if (isRunningOnGitHubPages()) {
			// We're on GitHub Pages, use the repository name as the base path
			// Some repos might be deployed at the root (username.github.io)
			if (window.location.pathname.includes(`/${githubPagesRepo}/`)) {
				return `/${githubPagesRepo}`;
			}
			return ""; // No base path needed for username.github.io repos
		}
		// We're running locally, use the current directory
		return "";
	}

	// Set the base path globally so it can be used throughout the app
	window.basePath = getBasePath();

	// Helper function to get correct paths for resources
	window.getCorrectPath = function (path) {
		// If path is empty or null, return an empty string
		if (!path) return "";

		// If we're not on GitHub Pages, just return the path
		if (!isRunningOnGitHubPages()) {
			return path;
		}

		// If the path already includes the base path, return it as is
		if (window.basePath && path.includes(window.basePath)) {
			return path;
		}

		// If path starts with /, append it to the base path
		if (path.startsWith("/")) {
			return window.basePath + path;
		}

		// If path is relative (starts with ./ or ../), we need to be careful
		if (path.startsWith("./") || path.startsWith("../")) {
			// If we're at the root and using a relative path, drop the ./ prefix
			if (
				window.location.pathname === window.basePath + "/" &&
				path.startsWith("./")
			) {
				return window.basePath + path.substring(1);
			}
			return path; // Otherwise keep the relative path
		}

		// For other paths that don't start with / or ./, treat as relative to current page
		return path;
	};

	console.log("Base path set to: " + window.basePath);
	console.log("eVidya Platform initialized");
})();

// Global error handler to provide better UX if something fails
window.addEventListener("error", function (event) {
	console.error("Global error caught:", event.error);
	// Don't show error messages to the user in production
	if (window.location.hostname === "localhost") {
		alert("An error occurred: " + event.error.message);
	}
});

document.addEventListener("DOMContentLoaded", function () {
	// Fix all links in the document to use the correct path
	document
		.querySelectorAll('a[href]:not([href^="http"]):not([href^="#"])')
		.forEach((link) => {
			const originalHref = link.getAttribute("href");
			link.setAttribute("href", window.getCorrectPath(originalHref));
		});

	// Get the courses button
	const coursesButton = document.querySelector(".cta-button .btn");

	// Add click event listener
	if (coursesButton) {
		coursesButton.addEventListener("click", function (e) {
			// Use the correct path function for navigation
			e.preventDefault();
			const targetPath = window.getCorrectPath("./pages/catalogue.html");
			console.log("Navigating to:", targetPath);
			window.location.href = targetPath;
		});
	}

	console.log("eVidya Platform initialized successfully!");
});

// Function to get placeholder data (for development/when API is not available)
function getPlaceholderData(type) {
	if (type === "courses") {
		return [
			{
				id: "course1",
				title: "Introduction to JavaScript",
				description:
					"Learn the basics of JavaScript programming language, including variables, functions, and DOM manipulation.",
				difficulty: "Beginner",
				image: "../images/placeholder-1.jpg",
				sections: [
					{
						title: "Getting Started",
						videos: [
							{ title: "Introduction", duration: "05:30" },
							{
								title: "Setting Up Your Environment",
								duration: "08:45",
							},
						],
					},
					{
						title: "JavaScript Basics",
						videos: [
							{
								title: "Variables and Data Types",
								duration: "10:15",
							},
							{ title: "Functions and Scope", duration: "12:30" },
						],
					},
				],
			},
			{
				id: "course2",
				title: "Advanced CSS Techniques",
				description:
					"Master advanced CSS techniques including Flexbox, Grid, animations, and responsive design patterns.",
				difficulty: "Intermediate",
				image: "../images/placeholder-2.jpg",
				sections: [
					{
						title: "CSS Layout",
						videos: [
							{
								title: "Flexbox Fundamentals",
								duration: "11:20",
							},
							{ title: "CSS Grid Layout", duration: "14:50" },
						],
					},
					{
						title: "Animations",
						videos: [
							{ title: "CSS Transitions", duration: "08:10" },
							{ title: "Keyframe Animations", duration: "09:45" },
						],
					},
				],
			},
			{
				id: "course3",
				title: "Full Stack Web Development",
				description:
					"Build complete web applications with front-end and back-end technologies including Node.js, Express, and MongoDB.",
				difficulty: "Advanced",
				image: "../images/placeholder-3.jpg",
				sections: [
					{
						title: "Backend Basics",
						videos: [
							{
								title: "Node.js Introduction",
								duration: "15:20",
							},
							{ title: "Express Framework", duration: "18:40" },
						],
					},
					{
						title: "Database Integration",
						videos: [
							{ title: "MongoDB Basics", duration: "14:30" },
							{ title: "CRUD Operations", duration: "16:15" },
						],
					},
				],
			},
			{
				id: "course4",
				title: "Python for Data Science",
				description:
					"Learn Python programming for data analysis, visualization, and machine learning applications.",
				difficulty: "Intermediate",
				image: "../images/placeholder-4.jpg",
				sections: [
					{
						title: "Python Fundamentals",
						videos: [
							{ title: "Python Syntax", duration: "10:20" },
							{ title: "Data Structures", duration: "12:45" },
						],
					},
					{
						title: "Data Analysis",
						videos: [
							{ title: "NumPy Introduction", duration: "14:30" },
							{ title: "Pandas Library", duration: "16:20" },
						],
					},
				],
			},
		];
	}

	return [];
}

// Function to get courses
function getCourses() {
	// In a real app, this would fetch from an API
	// For now, return placeholder data
	return getPlaceholderData("courses");
}
