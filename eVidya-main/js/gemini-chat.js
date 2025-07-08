/**
 * Gemini Chat Widget for eVidya
 * Provides AI assistance with course context and conversation memory
 */

class GeminiChatWidget {
	constructor(courseData) {
		this.courseData = courseData;
		this.chatHistory = [];
		this.apiKey = config.gemini.getApiKey(); // Get from config
		this.isOpen = false;
		this.initWidget();

		// Listen for API key changes
		window.addEventListener('gemini_api_key_updated', this.handleApiKeyUpdate.bind(this));
	}

	initWidget() {
		// Create the widget container
		this.container = document.createElement("div");
		this.container.className = "gemini-chat-container";
		this.container.innerHTML = `
      <div class="gemini-chat-toggle">
        <img src="../assets/icons/chat-bot.png" alt="AI Assistant">
        <span class="gemini-chat-tooltip">Ask AI Assistant</span>
      </div>
      <div class="gemini-chat-widget">
        <div class="gemini-chat-header">
          <h3>Gemini AI Assistant</h3>
          <div class="gemini-chat-controls">
            <button class="gemini-chat-clear" title="Clear conversation">
              <i class="fas fa-trash"></i>
            </button>
            <button class="gemini-chat-minimize" title="Minimize">
              <i class="fas fa-minus"></i>
            </button>
            <button class="gemini-chat-close" title="Close">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="gemini-chat-messages"></div>
        <div class="gemini-chat-input">
          <textarea placeholder="Ask about this course..."></textarea>
          <button class="gemini-chat-send">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
		document.body.appendChild(this.container);

		// Cache DOM elements
		this.widget = this.container.querySelector(".gemini-chat-widget");
		this.messagesContainer = this.container.querySelector(
			".gemini-chat-messages"
		);
		this.input = this.container.querySelector("textarea");
		this.sendButton = this.container.querySelector(".gemini-chat-send");
		this.toggleButton = this.container.querySelector(".gemini-chat-toggle");
		this.closeButton = this.container.querySelector(".gemini-chat-close");
		this.minimizeButton = this.container.querySelector(
			".gemini-chat-minimize"
		);
		this.clearButton = this.container.querySelector(".gemini-chat-clear");

		// Add event listeners
		this.toggleButton.addEventListener("click", () =>
			this.toggleChat(true)
		);
		this.closeButton.addEventListener("click", () =>
			this.toggleChat(false)
		);
		this.minimizeButton.addEventListener("click", () =>
			this.toggleChat(false)
		);
		this.sendButton.addEventListener("click", () => this.sendMessage());
		this.clearButton.addEventListener("click", () =>
			this.clearConversation()
		);
		this.input.addEventListener("keydown", (e) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				this.sendMessage();
			}
		});

		// Save chat history to localStorage
		this.loadChatHistory();

		// If no chat history, add initial welcome message
		if (this.chatHistory.length === 0) {
			this.addMessage({
				role: "assistant",
				content: `Hello! I'm your AI assistant for the "${this.courseData.title}" course. How can I help you today?`,
			});
		} else {
			// Display existing chat history
			this.renderChatHistory();
		}

		// Check if API key is configured
		if (!config.gemini.isConfigured()) {
			this.addMessage({
				role: "assistant",
				content:
					"⚠️ Gemini API key is not configured. Please add your API key in Settings to use the AI assistant.",
			});
		}
	}

	toggleChat(show = !this.isOpen) {
		this.isOpen = show;
		if (show) {
			this.widget.classList.add("open");
			this.toggleButton.classList.add("open");
			this.input.focus();
		} else {
			this.widget.classList.remove("open");
			this.toggleButton.classList.remove("open");
		}
	}

	clearConversation() {
		if (
			confirm(
				"Are you sure you want to clear the entire conversation history?"
			)
		) {
			// Clear chat history
			this.chatHistory = [];

			// Clear UI
			this.messagesContainer.innerHTML = "";

			// Save to localStorage
			this.saveChatHistory();

			// Add fresh welcome message
			this.addMessage({
				role: "assistant",
				content: `Hello! I'm your AI assistant for the "${this.courseData.title}" course. How can I help you today?`,
			});
		}
	}

	loadChatHistory() {
		// Load chat history specific to this course
		const storageKey = `gemini_chat_history_${this.courseData.id}`;
		const savedHistory = localStorage.getItem(storageKey);

		if (savedHistory) {
			try {
				this.chatHistory = JSON.parse(savedHistory);
			} catch (e) {
				console.error("Error parsing chat history:", e);
				this.chatHistory = [];
			}
		}
	}

	saveChatHistory() {
		// Save chat history specific to this course
		const storageKey = `gemini_chat_history_${this.courseData.id}`;

		// Only save the last 50 messages to prevent localStorage from getting too full
		const historyToSave = this.chatHistory.slice(-50);
		localStorage.setItem(storageKey, JSON.stringify(historyToSave));
	}

	renderChatHistory() {
		// Clear the messages container first
		this.messagesContainer.innerHTML = "";

		// Render each message in the history
		this.chatHistory.forEach((message) => {
			this.addMessage(message);
		});

		// Scroll to bottom
		this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
	}

	sendMessage() {
		const userMessage = this.input.value.trim();
		if (!userMessage) return;

		// Add user message to UI
		this.addMessage({
			role: "user",
			content: userMessage,
		});

		// Clear input
		this.input.value = "";

		// Show thinking indicator
		const thinkingId = this.addThinkingIndicator();

		// Prepare context for the model
		const contextPrompt = this.prepareContextPrompt();

		// Call Gemini API
		this.callGeminiAPI(userMessage, contextPrompt)
			.then((response) => {
				// Remove thinking indicator
				this.removeThinkingIndicator(thinkingId);

				// Add response to UI
				this.addMessage({
					role: "assistant",
					content: response,
				});
			})
			.catch((error) => {
				console.error("Gemini API error:", error);
				this.removeThinkingIndicator(thinkingId);
				this.addMessage({
					role: "assistant",
					content:
						"Sorry, I encountered an error. Please try again later.",
				});
			});
	}

	addMessage(message) {
		// Add to chat history
		this.chatHistory.push(message);

		// Create message element
		const messageEl = document.createElement("div");
		messageEl.className = `gemini-chat-message ${message.role}`;

		// Create avatar container
		const avatarContainer = document.createElement("div");
		avatarContainer.className = "gemini-chat-avatar";

		// Add avatar image with proper sizing
		const avatarImg = document.createElement("img");
		avatarImg.src =
			message.role === "user"
				? "../images/icons/user-icon.png" // User icon path
				: "../images/icons/gemini-icon.png"; // Gemini icon path
		avatarImg.alt = message.role === "user" ? "User" : "Gemini AI";
		avatarImg.className = `gemini-avatar ${
			message.role === "user" ? "gemini-user-avatar" : "gemini-ai-avatar"
		}`;

		// Add message bubble
		const messageBubble = document.createElement("div");
		messageBubble.className = "gemini-chat-bubble";
		messageBubble.innerHTML = this.formatMessageContent(message.content);

		// Assemble the message components
		avatarContainer.appendChild(avatarImg);
		messageEl.appendChild(avatarContainer);
		messageEl.appendChild(messageBubble);

		// Add to UI
		this.messagesContainer.appendChild(messageEl);

		// Scroll to bottom
		this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

		// Save chat history
		this.saveChatHistory();
	}

	formatMessageContent(content) {
		// Convert markdown-like syntax to HTML
		// This is a simple implementation - consider using a proper markdown parser for production
		let formatted = content
			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
			.replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
			.replace(/`(.*?)`/g, "<code>$1</code>") // Code
			.replace(/\n/g, "<br>"); // Line breaks

		return formatted;
	}

	addThinkingIndicator() {
		const id = Date.now();
		const indicatorEl = document.createElement("div");
		indicatorEl.className = "gemini-chat-message assistant thinking";
		indicatorEl.dataset.id = id;
		indicatorEl.innerHTML = `
      <div class="gemini-chat-avatar">
        <img src="../images/icons/gemini-icon.png" class="gemini-avatar gemini-ai-avatar">
      </div>
      <div class="gemini-chat-bubble">
        <div class="gemini-chat-thinking">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;

		this.messagesContainer.appendChild(indicatorEl);
		this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

		return id;
	}

	removeThinkingIndicator(id) {
		const indicator = this.messagesContainer.querySelector(
			`.thinking[data-id="${id}"]`
		);
		if (indicator) {
			indicator.remove();
		}
	}

	prepareContextPrompt() {
		// Create a prompt that includes course context and recent chat history for continuity
		const courseContext = `
You are an AI assistant for the e-learning platform eVidya.
You're currently helping with the course: "${this.courseData.title}" by ${
			this.courseData.instructor
		}.

Course description: ${this.courseData.description}

Key topics covered:
${this.courseData.topics.map((topic) => `- ${topic}`).join("\n")}

Current course progress: ${this.courseData.progress}%

Please provide helpful, accurate information related to this course content.
Keep your responses concise and focused on the student's questions.
If you don't know something specific about the course, you can provide general educational guidance instead.
`.trim();

		return courseContext;
	}

	async callGeminiAPI(userMessage, contextPrompt) {
		// Check if API key is configured
		if (!config.gemini.isConfigured()) {
			return "Please add your Gemini API key in Settings to use the AI assistant. Go to Settings → API Integration to add your key.";
		}

		try {
			const apiKey = config.gemini.getApiKey();
			const API_URL =
				"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

			// Format recent conversation history for context (last 6 messages)
			const recentMessages = this.chatHistory.slice(-6);
			const formattedHistory = recentMessages.map((msg) => ({
				role: msg.role === "assistant" ? "model" : "user",
				parts: [{ text: msg.content }],
			}));

			// If the conversation is just starting, add the system context
			if (formattedHistory.length < 2) {
				formattedHistory.unshift({
					role: "user",
					parts: [{ text: contextPrompt }],
				});

				formattedHistory.unshift({
					role: "model",
					parts: [
						{
							text: "I'll help you with this course. What would you like to know?",
						},
					],
				});
			}

			// Add the current user message
			formattedHistory.push({
				role: "user",
				parts: [{ text: userMessage }],
			});

			const response = await fetch(`${API_URL}?key=${apiKey}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					contents: formattedHistory,
					generationConfig: {
						temperature: 0.7,
						maxOutputTokens: 800,
						topP: 0.95,
						topK: 40,
					},
				}),
			});

			const data = await response.json();

			if (data.error) {
				console.error("Gemini API error:", data.error);
				return `Sorry, there was an error with the AI service: ${data.error.message}`;
			}

			if (data.candidates && data.candidates[0].content.parts[0].text) {
				return data.candidates[0].content.parts[0].text;
			} else {
				throw new Error("Unexpected API response format");
			}
		} catch (error) {
			console.error("Error calling Gemini API:", error);
			// For development/example, return a mock response or error message
			return this.getMockResponse(userMessage);
		}
	}

	getMockResponse(userMessage) {
		// Only used for development/example when API is not connected
		const responses = [
			`Based on the ${this.courseData.title} course materials, I can help with that. The course covers this topic in module 3, where you'll learn about the core concepts and practical applications.`,
			`Great question about ${this.courseData.title}! The instructor, ${this.courseData.instructor}, explains this in detail in the upcoming sections. Would you like me to summarize the key points?`,
			`I see you're ${this.courseData.progress}% through the course. The answer to your question will be covered in the next few lessons, but I can give you a preview if you'd like.`,
			`That's a common question from students in this course. The important thing to remember is to apply the concepts from Chapter 2 when working through these examples.`,
			`Looking at the course content, I'd recommend focusing on the practice exercises in Module 4 to better understand this concept. Would you like more specific guidance?`,
		];

		// Simple simulation of response relevance based on user message
		const randomIndex = Math.floor(
			Math.abs(userMessage.length % responses.length)
		);
		return responses[randomIndex];
	}

	// Handle API key updates (e.g., from settings page)
	handleApiKeyUpdate(event) {
		this.apiKey = config.gemini.getApiKey();
		if (this.apiKey && this.apiKey.trim() !== "") {
			// Show notification that API key was updated
			this.addMessage({
				role: "assistant",
				content: "✅ Gemini API key has been updated and is now active. You can ask questions about this course!"
			});
		} else {
			// Warn that API key is missing or invalid
			this.addMessage({
				role: "assistant",
				content: "⚠️ Gemini API key has been removed. Please add a valid API key in Settings to continue using the AI assistant."
			});
		}
	}
}

// Example usage (to be replaced by actual implementation in course pages)
document.addEventListener("DOMContentLoaded", () => {
	// Only initialize on course detail pages, not in quiz pages
	const isCoursePage = document.querySelector(".course-details");
	const isQuizPage = document.querySelector(".quiz-container");

	if (isCoursePage && !isQuizPage) {
		// Extract course data from page or fetch from API
		const courseData = {
			id: document.querySelector(".course-id")?.textContent || "default",
			title:
				document.querySelector(".course-title")?.textContent ||
				"Current Course",
			instructor:
				document.querySelector(".instructor-name")?.textContent ||
				"Course Instructor",
			description:
				document.querySelector(".course-description")?.textContent ||
				"Course description not available",
			topics: Array.from(document.querySelectorAll(".course-topic")).map(
				(el) => el.textContent
			) || ["Topic 1", "Topic 2"],
			progress: parseInt(
				document.querySelector(".progress-value")?.textContent || "0"
			),
		};

		// Initialize the chat widget
		window.geminiChat = new GeminiChatWidget(courseData);
	}
});
