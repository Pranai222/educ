# eVidya Learning Platform

A client-side web application for interactive tech learning with course content, progress tracking, and video-based education.

## Project Overview

eVidya is a browser-based learning platform that allows users to:
- View and select from a variety of tech courses
- Watch course videos embedded from YouTube
- Take quizzes to test knowledge
- Track learning progress locally
- Resume courses where they left off

## Key Features

- **Course Library**: A collection of technology courses organized by topic
- **Video Lessons**: Embedded YouTube videos with tracking
- **Progress Tracking**: Client-side storage of user progress across courses
- **Interactive Quizzes**: Knowledge assessment with feedback
- **Responsive Design**: Works on desktop and mobile devices

## Technical Details

This application is built with vanilla JavaScript, HTML, and CSS with the following technical characteristics:

- **No Server Required**: All data is stored in the browser's localStorage
- **No Database**: Course data is defined in static JS files
- **YouTube Integration**: Videos are embedded from YouTube using the iframe API
- **Bootstrap UI**: UI components are built with Bootstrap 5
- **Modular Design**: Code is organized into modular components

## Project Structure

```
eVidya/
├── css/                  # Stylesheets
├── data/                 # Data files
│   └── course-data.js    # Course content definitions
├── images/               # Image assets
├── js/                   # JavaScript modules
│   ├── progress-tracker.js  # Progress tracking
│   ├── course-navigation.js # Course navigation
│   └── home.js           # Homepage functionality
├── .github/              # GitHub related files
├── index.html            # Homepage
├── courses.html          # Course listing page
├── course-details.html   # Individual course page
└── ARCHITECTURE.md       # Technical architecture documentation
```

## Local Development

To work on this project locally:

1. Clone the repository
2. Open the project in your preferred editor
3. Use a local development server to view the site
   - You can use extensions like Live Server for VS Code
   - Or run `npx http-server` from the project root

## Recent Changes

- Removed automatic YouTube video duration scraping
- Consolidated course data in the data directory
- Created comprehensive architecture documentation
- Simplified the client-side code for better maintainability
