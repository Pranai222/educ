/**
 * course-data.js
 * Contains the data for all courses in the platform
 */

const courses = [
	{
		id: "func-prog",
		title: "Functional Programming",
		description:
			"Learn the core concepts of functional programming and how to apply them in JavaScript",
		image: "../images/courses/functional.jpg",
		duration: "4 hours",
		level: "Intermediate",
		subject: "Technology",
		subSection: "Computer Science",
		sections: [
			{
				title: "Introduction to Functional Programming",
				videos: [
					{
						id: "video-func-1",
						title: "What is Functional Programming?",
						videoId: "e-5obm1G_FY",
						url: "https://www.youtube.com/embed/e-5obm1G_FY",
						description:
							"An introduction to functional programming paradigms and concepts.",
					},
					{
						id: "video-func-2",
						title: "Pure Functions and Side Effects",
						videoId: "FYXpOjwYzcs",
						url: "https://www.youtube.com/embed/FYXpOjwYzcs",
						description:
							"Understanding pure functions and how to avoid side effects in your code.",
					},
				],
				quiz: {
					id: "quiz-func-1",
					title: "Functional Programming Basics",
					questions: [
						{
							question: "What is a pure function?",
							options: [
								"A function that always returns the same output for same inputs with no side effects",
								"A function that uses only primitive data types",
								"A function that is written in a purely functional language",
								"A function that doesn't throw exceptions",
							],
							answer: 0,
						},
						{
							question:
								"Which of these is a key principle of functional programming?",
							options: [
								"Object mutation",
								"Inheritance",
								"Immutability",
								"Polymorphism",
							],
							answer: 2,
						},
						{
							question: "What is a side effect in programming?",
							options: [
								"When a function takes too long to execute",
								"When a function modifies state outside its local scope",
								"When a function returns an unexpected value",
								"When a function has optional parameters",
							],
							answer: 1,
						},
					],
				},
			},
			{
				title: "Functional Programming in JavaScript",
				videos: [
					{
						id: "video-func-3",
						title: "Higher-Order Functions",
						videoId: "BMUiFMZr7vk",
						url: "https://www.youtube.com/embed/BMUiFMZr7vk",
						description:
							"Learn how to use and create functions that operate on other functions.",
					},
					{
						id: "video-func-4",
						title: "Map, Filter, and Reduce",
						videoId: "rRgD1yVwIvE",
						url: "https://www.youtube.com/embed/rRgD1yVwIvE",
						description:
							"Master the essential array methods for functional programming in JavaScript.",
					},
				],
				quiz: {
					id: "quiz-func-2",
					title: "JavaScript Functional Programming",
					questions: [
						{
							question: "What is a higher-order function?",
							options: [
								"A function that takes more than 3 parameters",
								"A function that returns a boolean value",
								"A function that takes a function as an argument or returns a function",
								"A function declared at the top level of a module",
							],
							answer: 2,
						},
						{
							question:
								"Which array method does NOT return a new array?",
							options: [
								"map()",
								"filter()",
								"forEach()",
								"concat()",
							],
							answer: 2,
						},
					],
				},
			},
		],
	},
	{
		id: "web-dev",
		title: "Web Development Fundamentals",
		description:
			"Build a strong foundation in HTML, CSS, and JavaScript with practical examples",
		image: "../images/courses/web-dev.jpg", // Corrected path relative to HTML
		duration: "6 hours",
		level: "Beginner",
		subject: "Technology",
		subSection: "Web Development",
		sections: [
			{
				title: "HTML Basics",
				videos: [
					{
						id: "video-html-1",
						title: "HTML Document Structure",
						videoId: "UB1O30fR-EE",
						url: "https://www.youtube.com/embed/UB1O30fR-EE",
						description:
							"Learn the foundational structure of HTML documents and semantic markup.",
					},
					{
						id: "video-html-2",
						title: "HTML Forms and Input Elements",
						videoId: "fNcJuPIZ2WE",
						url: "https://www.youtube.com/embed/fNcJuPIZ2WE",
						description:
							"Create interactive forms and understand different input types in HTML.",
					},
				],
				quiz: {
					id: "quiz-html-1",
					title: "HTML Fundamentals Quiz",
					questions: [
						{
							question:
								"Which tag is used to define an HTML document?",
							options: [
								"<html>",
								"<body>",
								"<document>",
								"<head>",
							],
							answer: 0,
						},
						{
							question:
								"Which attribute is used to specify a unique id for an HTML element?",
							options: ["class", "id", "name", "rel"],
							answer: 1,
						},
					],
				},
			},
			{
				title: "CSS Styling",
				videos: [
					{
						id: "video-css-1",
						title: "CSS Selectors and Properties",
						videoId: "1PnVor36_40",
						url: "https://www.youtube.com/embed/1PnVor36_40",
						description:
							"Master CSS selectors and learn how to apply styling to HTML elements.",
					},
					{
						id: "video-css-2",
						title: "CSS Layout and Flexbox",
						videoId: "JJSoEo8JSnc",
						url: "https://www.youtube.com/embed/JJSoEo8JSnc",
						description:
							"Create responsive layouts using modern CSS techniques including Flexbox.",
					},
				],
				quiz: {
					id: "quiz-css-1",
					title: "CSS Knowledge Check",
					questions: [
						{
							question:
								"Which CSS property is used to change the text color of an element?",
							options: [
								"color",
								"text-color",
								"font-color",
								"text-style",
							],
							answer: 0,
						},
						{
							question:
								"What is the correct CSS syntax for making all paragraphs bold?",
							options: [
								"p {text-weight: bold;}",
								"p {font-weight: bold;}",
								"<p style='font-weight: bold;'>",
								"All paragraphs {font-weight: bold;}",
							],
							answer: 1,
						},
					],
				},
			},
		],
	},
	{
		id: "data-structures",
		title: "Data Structures and Algorithms",
		description:
			"Master the fundamental data structures and algorithms essential for efficient programming",
		image: "../images/courses/dsa.jpg", // Corrected path relative to HTML
		duration: "8 hours",
		level: "Advanced",
		subject: "Technology",
		subSection: "Computer Science",
		sections: [
			{
				title: "Basic Data Structures",
				videos: [
					{
						id: "video-ds-1",
						title: "Arrays and Linked Lists",
						videoId: "zg9ih6SVACc",
						url: "https://www.youtube.com/embed/zg9ih6SVACc",
						description:
							"Understand the differences between arrays and linked lists and when to use each.",
					},
					{
						id: "video-ds-2",
						title: "Stacks and Queues",
						videoId: "wjI1WNcIntg",
						url: "https://www.youtube.com/embed/wjI1WNcIntg",
						description:
							"Learn about stack and queue data structures and their real-world applications.",
					},
				],
				quiz: {
					id: "quiz-ds-1",
					title: "Data Structures Fundamentals",
					questions: [
						{
							question:
								"What is the time complexity for accessing an element in an array?",
							options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
							answer: 0,
						},
						{
							question:
								"Which data structure operates on LIFO (Last In First Out) principle?",
							options: ["Queue", "Stack", "Linked List", "Tree"],
							answer: 1,
						},
					],
				},
			},
			{
				title: "Basic Algorithms",
				videos: [
					{
						id: "video-algo-1",
						title: "Sorting Algorithms",
						videoId: "kPRA0W1kECg",
						url: "https://www.youtube.com/embed/kPRA0W1kECg",
						description:
							"Explore different sorting algorithms and their performance characteristics.",
					},
					{
						id: "video-algo-2",
						title: "Searching Algorithms",
						videoId: "MFhxShGxHWc",
						url: "https://www.youtube.com/embed/MFhxShGxHWc",
						description:
							"Learn efficient searching techniques for different data structures.",
					},
				],
				quiz: {
					id: "quiz-algo-1",
					title: "Algorithm Analysis",
					questions: [
						{
							question:
								"What is the time complexity of bubble sort in worst case?",
							options: [
								"O(n)",
								"O(n log n)",
								"O(n²)",
								"O(log n)",
							],
							answer: 2,
						},
						{
							question:
								"Which search algorithm requires a sorted array?",
							options: [
								"Linear search",
								"Binary search",
								"Depth-first search",
								"Breadth-first search",
							],
							answer: 1,
						},
					],
				},
			},
		],
	},
	{
		id: "react",
		title: "React Fundamentals",
		description:
			"Learn how to build modern web applications with React and related technologies",
		image: "../images/courses/react.jpg", // Corrected path relative to HTML
		duration: "7 hours",
		level: "Intermediate",
		subject: "Technology",
		subSection: "Web Development",
		sections: [
			{
				title: "React Basics",
				videos: [
					{
						id: "video-react-1",
						title: "Introduction to React",
						videoId: "Tn6-PIqc4UM",
						url: "https://www.youtube.com/embed/Tn6-PIqc4UM",
						description:
							"Get started with React and understand its core principles.",
					},
					{
						id: "video-react-2",
						title: "Components and Props",
						videoId: "FdiRj-_VTVU",
						url: "https://www.youtube.com/embed/FdiRj-_VTVU",
						description:
							"Learn how to create and compose React components using props.",
					},
				],
				quiz: {
					id: "quiz-react-1",
					title: "React Core Concepts",
					questions: [
						{
							question: "What is JSX in React?",
							options: [
								"A database query language",
								"A syntax extension to JavaScript that looks like HTML",
								"A JavaScript testing framework",
								"A state management library",
							],
							answer: 1,
						},
						{
							question: "What are props in React?",
							options: [
								"Internal data storage",
								"HTML elements",
								"Properties passed to components",
								"CSS styling settings",
							],
							answer: 2,
						},
					],
				},
			},
			{
				title: "React State and Hooks",
				videos: [
					{
						id: "video-react-3",
						title: "Managing State with Hooks",
						videoId: "O6P86uwfdR0",
						url: "https://www.youtube.com/embed/O6P86uwfdR0",
						description:
							"Learn how to use React hooks to manage state in functional components.",
					},
					{
						id: "video-react-4",
						title: "Effect Hook and Lifecycle",
						videoId: "0ZJgIjIuY7U",
						url: "https://www.youtube.com/embed/0ZJgIjIuY7U",
						description:
							"Understand how to handle side effects and component lifecycle with hooks.",
					},
				],
				quiz: {
					id: "quiz-react-2",
					title: "React Hooks Quiz",
					questions: [
						{
							question:
								"Which hook is used to add state to a functional component?",
							options: [
								"useEffect",
								"useState",
								"useContext",
								"useReducer",
							],
							answer: 1,
						},
						{
							question: "What is the purpose of useEffect hook?",
							options: [
								"To manage component state",
								"To optimize rendering performance",
								"To perform side effects in components",
								"To create new components dynamically",
							],
							answer: 2,
						},
					],
				},
			},
		],
	},
	// Example Non-Tech Course
	{
		id: "intro-painting",
		title: "Introduction to Acrylic Painting",
		description:
			"Learn the basics of acrylic painting, color mixing, and brush techniques.",
		image: "../images/courses/painting.jpg", // Example path
		duration: "5 hours",
		level: "Beginner",
		subject: "Arts",
		subSection: "Painting",
		sections: [
			{
				title: "Getting Started",
				videos: [
					{
						id: "paint-1",
						title: "Materials Overview",
						videoId: "dQw4w9WgXcQ",
						description:
							"Understanding your paints, brushes, and canvases.",
					},
					{
						id: "paint-2",
						title: "Basic Color Theory",
						videoId: "dQw4w9WgXcQ",
						description: "Mixing primary and secondary colors.",
					},
				],
			},
			{
				title: "Techniques",
				videos: [
					{
						id: "paint-3",
						title: "Brush Strokes",
						videoId: "dQw4w9WgXcQ",
						description: "Different ways to apply paint.",
					},
				],
			},
		],
	},
];

// Make courses available globally
window.courses = courses;
