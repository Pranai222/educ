import React, { useState, useEffect, useRef } from "react";
import {
	Box,
	Button,
	Card,
	CardContent,
	IconButton,
	TextField,
	Typography,
	Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import SendIcon from "@mui/icons-material/Send";
import { useRouter } from "next/router";

const CourseAIWidget = ({
	courseId,
	courseTitle,
	courseDescription,
	isQuizPage,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const [chatHistory, setChatHistory] = useState("");
	const messagesEndRef = useRef(null);
	const router = useRouter();

	// Load chat history from localStorage when component mounts
	useEffect(() => {
		const storedHistory = localStorage.getItem(`chat_history_${courseId}`);
		if (storedHistory) {
			setMessages(JSON.parse(storedHistory));
		} else {
			// Initialize with welcome message
			setMessages([
				{
					sender: "bot",
					text: `Hello! I'm your AI assistant for "${courseTitle}". How can I help you?`,
				},
			]);
		}
	}, [courseId, courseTitle]);

	// Save messages to localStorage whenever they change
	useEffect(() => {
		if (messages.length > 0) {
			localStorage.setItem(
				`chat_history_${courseId}`,
				JSON.stringify(messages)
			);

			// Also update the context string for API calls
			const contextMessages = messages
				.map((msg) => `${msg.sender}: ${msg.text}`)
				.join("\n");
			setChatHistory(contextMessages);
		}
	}, [messages, courseId]);

	// Scroll to bottom of messages when new ones are added
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// If we're on a quiz page, don't show the widget
	if (isQuizPage) {
		return null;
	}

	const toggleWidget = () => {
		setIsOpen(!isOpen);
	};

	const handleSendMessage = async () => {
		if (!currentMessage.trim()) return;

		// Add user message to chat
		const newMessages = [
			...messages,
			{ sender: "user", text: currentMessage },
		];
		setMessages(newMessages);
		setCurrentMessage("");

		try {
			// Prepare context for the AI
			const context = `
        Course: ${courseTitle}
        Description: ${courseDescription}
        Chat History: ${chatHistory}
        User's latest message: ${currentMessage}
      `;

			// Call your AI API here
			const response = await fetch("/api/ai-chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: currentMessage,
					context: context,
					courseId: courseId,
				}),
			});

			const data = await response.json();

			// Add AI response to chat
			setMessages([
				...newMessages,
				{ sender: "bot", text: data.response },
			]);
		} catch (error) {
			console.error("Error sending message to AI:", error);
			setMessages([
				...newMessages,
				{
					sender: "bot",
					text: "Sorry, I encountered an error. Please try again later.",
				},
			]);
		}
	};

	return (
		<>
			{/* Chat button that's always visible */}
			<Button
				variant="contained"
				color="primary"
				startIcon={<SmartToyIcon />}
				onClick={toggleWidget}
				sx={{
					position: "fixed",
					bottom: "20px",
					right: "20px",
					zIndex: 1000,
					borderRadius: "50%",
					width: "60px",
					height: "60px",
					minWidth: "unset",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
				}}
			>
				{!isOpen && <SmartToyIcon />}
			</Button>

			{/* Chat popup */}
			{isOpen && (
				<Card
					sx={{
						position: "fixed",
						bottom: "90px",
						right: "20px",
						width: "350px",
						maxWidth: "90vw",
						height: "500px",
						maxHeight: "80vh",
						zIndex: 1001,
						display: "flex",
						flexDirection: "column",
						boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
						borderRadius: "12px",
						overflow: "hidden",
					}}
				>
					{/* Header */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							p: 2,
							backgroundColor: "primary.main",
							color: "white",
						}}
					>
						<Typography variant="h6">Course Assistant</Typography>
						<IconButton color="inherit" onClick={toggleWidget}>
							<CloseIcon />
						</IconButton>
					</Box>

					{/* Messages area */}
					<CardContent
						sx={{
							flexGrow: 1,
							overflow: "auto",
							padding: 2,
							display: "flex",
							flexDirection: "column",
							gap: 1,
						}}
					>
						{messages.map((message, index) => (
							<Box
								key={index}
								sx={{
									display: "flex",
									justifyContent:
										message.sender === "user"
											? "flex-end"
											: "flex-start",
									mb: 1,
								}}
							>
								{message.sender === "bot" && (
									<Avatar
										sx={{ mr: 1, bgcolor: "primary.main" }}
									>
										<SmartToyIcon />
									</Avatar>
								)}
								<Box
									sx={{
										maxWidth: "75%",
										p: 1.5,
										borderRadius: 2,
										backgroundColor:
											message.sender === "user"
												? "primary.light"
												: "grey.100",
										color:
											message.sender === "user"
												? "white"
												: "text.primary",
									}}
								>
									<Typography variant="body2">
										{message.text}
									</Typography>
								</Box>
							</Box>
						))}
						<div ref={messagesEndRef} />
					</CardContent>

					{/* Message input */}
					<Box
						component="form"
						sx={{
							display: "flex",
							p: 2,
							borderTop: 1,
							borderColor: "divider",
						}}
						onSubmit={(e) => {
							e.preventDefault();
							handleSendMessage();
						}}
					>
						<TextField
							fullWidth
							size="small"
							placeholder="Type your message..."
							value={currentMessage}
							onChange={(e) => setCurrentMessage(e.target.value)}
							variant="outlined"
							autoComplete="off"
							sx={{ mr: 1 }}
						/>
						<IconButton
							color="primary"
							type="submit"
							disabled={!currentMessage.trim()}
						>
							<SendIcon />
						</IconButton>
					</Box>
				</Card>
			)}
		</>
	);
};

export default CourseAIWidget;
