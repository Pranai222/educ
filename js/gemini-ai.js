/**
 * Utility for interacting with Google's Gemini API
 * Provides functions for generating AI responses
 */

// Gemini API class
class GeminiAI {
	constructor(apiKey = null) {
		this.apiKey = apiKey || config?.gemini?.getApiKey();
		this.apiEndpoint =
			"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
		this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
		this.model = "gemini-pro"; // Default model
	}

	/**
	 * Set API key
	 * @param {string} apiKey - The Gemini API key
	 */
	setApiKey(apiKey) {
		this.apiKey = apiKey;
	}

	/**
	 * Updates the API key if it has changed
	 */
	updateApiKey() {
		this.apiKey = config.gemini.getApiKey();
	}

	/**
	 * Check if the API key is set
	 * @returns {boolean} - Whether the API key is configured
	 */
	isConfigured() {
		return !!this.apiKey && this.apiKey.trim() !== "";
	}

	/**
	 * Generate a response from Gemini
	 * @param {string} prompt - The user question or prompt
	 * @param {Object} options - Additional options for the request
	 * @returns {Promise<Object>} - The response from Gemini
	 */
	async generateResponse(prompt, options = {}) {
		if (!this.isConfigured()) {
			throw new Error(
				"Gemini API key not configured. Please set your API key in Settings."
			);
		}

		try {
			// Prepare request body
			const requestBody = {
				contents: [
					{
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
				generationConfig: {
					temperature: options.temperature || 0.7,
					topK: options.topK || 40,
					topP: options.topP || 0.95,
					maxOutputTokens: options.maxTokens || 1024,
				},
			};

			// Add course context if provided
			if (options.courseContext) {
				requestBody.contents[0].parts.unshift({
					text: `Context information about the course: ${options.courseContext}`,
				});
			}

			// Add course material if provided
			if (options.courseMaterial) {
				requestBody.contents[0].parts.unshift({
					text: `Course material for reference: ${options.courseMaterial}`,
				});
			}

			// Make request to Gemini API
			const response = await fetch(
				`${this.apiEndpoint}?key=${this.apiKey}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(requestBody),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					`Gemini API error: ${
						errorData.error?.message || response.statusText
					}`
				);
			}

			const data = await response.json();
			return {
				text:
					data.candidates[0]?.content?.parts[0]?.text ||
					"No response generated.",
				rawResponse: data,
			};
		} catch (error) {
			console.error("Error calling Gemini API:", error);
			throw error;
		}
	}

	/**
	 * Answer a course-related question
	 * @param {string} question - The user's question
	 * @param {Object} courseData - Information about the course
	 * @returns {Promise<string>} - The answer to the question
	 */
	async answerCourseQuestion(question, courseData) {
		this.updateApiKey(); // Ensure we have the latest API key

		if (!this.apiKey) {
			throw new Error(
				"API key not configured. Please set up your Gemini API key in settings."
			);
		}

		try {
			// Create system instructions with course context
			const systemInstruction = `You are an AI learning assistant for the eVidya online learning platform.
            You're helping with a course titled "${courseData.title || "Unknown"}".
            Course description: ${courseData.description || "Not provided"}.
            Course category: ${courseData.category || "General"}.
            Course level: ${courseData.level || "All levels"}.

            Answer the student's question thoroughly but concisely. If you don't know the answer, say so clearly.
            Include helpful explanations and examples when appropriate.
            Focus on educational content and avoid any unrelated discussions.`;

			// Format the request
			const prompt = {
				contents: [
					{
						role: "system",
						parts: [{ text: systemInstruction }],
					},
					{
						role: "user",
						parts: [{ text: question }],
					},
				],
			};

			// Make the API request
			const response = await fetch(
				`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(prompt),
				}
			);

			// Parse the response
			const data = await response.json();

			// Check for errors
			if (data.error) {
				throw new Error(`API Error: ${data.error.message}`);
			}

			// Extract the response text
			return data.candidates[0].content.parts[0].text;
		} catch (error) {
			console.error("Error calling Gemini API:", error);
			throw error;
		}
	}

	/**
	 * Generate text based on a prompt
	 * @param {string} prompt - The prompt to generate text from
	 * @returns {Promise<string>} - The generated text
	 */
	async generateText(prompt) {
		this.updateApiKey(); // Ensure we have the latest API key

		if (!this.apiKey) {
			throw new Error(
				"API key not configured. Please set up your Gemini API key in settings."
			);
		}

		try {
			// Format the request
			const requestBody = {
				contents: [
					{
						role: "user",
						parts: [{ text: prompt }],
					},
				],
			};

			// Make the API request
			const response = await fetch(
				`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(requestBody),
				}
			);

			// Parse the response
			const data = await response.json();

			// Check for errors
			if (data.error) {
				throw new Error(`API Error: ${data.error.message}`);
			}

			// Extract the response text
			return data.candidates[0].content.parts[0].text;
		} catch (error) {
			console.error("Error calling Gemini API:", error);
			throw error;
		}
	}
}

// Create and export a global instance
const geminiAI = new GeminiAI();

// For module systems
if (typeof module !== "undefined" && module.exports) {
	module.exports = { GeminiAI, geminiAI };
}
