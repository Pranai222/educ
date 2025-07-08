/**
 * Configuration settings for the eVidya platform
 * Contains settings for API keys and feature flags
 */

const config = {
	// Image handling configuration (no API key needed)
	images: {
		// Get a consistent image URL for a course based on its properties
		getCourseImageUrl: function (course) {
			// Check if course already has an image
			if (
				course.image &&
				course.image !== "" &&
				!course.image.includes("undefined")
			) {
				return course.image;
			}

			// Check if we have a cached image for this course
			const cacheKey = `course_image_${course.id}`;
			const cachedImage = localStorage.getItem(cacheKey);
			if (cachedImage) {
				return cachedImage;
			}

			// Generate a deterministic seed from course ID
			const seed = course.id
				.split("")
				.reduce((acc, char) => acc + char.charCodeAt(0), 0);

			// Extract keyword from course subject or title for more relevant images
			let keyword = "";
			if (course.subject) {
				keyword = course.subject.toLowerCase();
			} else if (course.title) {
				// Extract meaningful words from title if no subject
				const words = course.title.split(" ");
				const skipWords = [
					"the",
					"a",
					"an",
					"and",
					"or",
					"but",
					"in",
					"on",
					"at",
					"to",
					"for",
					"with",
					"introduction",
					"basic",
					"advanced",
					"course",
				];

				for (const word of words) {
					if (
						word.length > 3 &&
						!skipWords.includes(word.toLowerCase())
					) {
						keyword = word.toLowerCase();
						break;
					}
				}
			}

			// Fallback if no keyword found
			if (!keyword) {
				keyword = "education";
			}

			// Create a unique but consistent image URL using Picsum
			// The seed ensures the same course gets the same image each time
			const imageUrl = `https://picsum.photos/seed/${course.id}${seed}/800/450`;

			// Cache the generated URL
			localStorage.setItem(cacheKey, imageUrl);

			return imageUrl;
		},

		// Clear image cache for all courses
		clearImageCache: function () {
			const keys = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key && key.startsWith("course_image_")) {
					keys.push(key);
				}
			}

			keys.forEach((key) => localStorage.removeItem(key));
			console.log(`Cleared ${keys.length} cached course images`);
			return keys.length;
		},
	},

	// Gemini AI configuration
	gemini: {
		/**
		 * Get the Gemini API key from localStorage
		 * @returns {string|null} The API key or null if not set
		 */
		getApiKey: function () {
			return localStorage.getItem("gemini_api_key");
		},

		/**
		 * Check if Gemini API is configured
		 * @returns {boolean} True if API key is set
		 */
		isConfigured: function () {
			const apiKey = this.getApiKey();
			return apiKey && apiKey.trim() !== "";
		},

		/**
		 * Save Gemini API key to localStorage
		 * @param {string} apiKey - The API key to save
		 */
		saveApiKey: function (apiKey) {
			localStorage.setItem("gemini_api_key", apiKey);
		},
	},

	// General app settings
	app: {
		// Theme settings
		theme: {
			/**
			 * Get current theme preference
			 * @returns {string} 'light' or 'dark'
			 */
			getTheme: function () {
				return localStorage.getItem("theme") || "light";
			},

			/**
			 * Save theme preference
			 * @param {string} theme - 'light' or 'dark'
			 */
			saveTheme: function (theme) {
				localStorage.setItem("theme", theme);
			},
		},

		// Feature flags
		features: {
			enableGeminiChat: true,
		},
	},

	/**
	 * Check if Gemini API is configured
	 * @returns {boolean} True if API key is set
	 */
	isGeminiConfigured: function () {
		return this.gemini.isConfigured();
	},
};

// Export the configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
