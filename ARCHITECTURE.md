# eVidya Platform Architecture

This document provides a comprehensive overview of the eVidya platform's architecture, components, and data flow.

## Table of Contents

- [eVidya Platform Architecture](#evidya-platform-architecture)
	- [Table of Contents](#table-of-contents)
	- [Overview](#overview)
	- [Component Architecture](#component-architecture)
	- [Data Flow](#data-flow)
	- [File Structure](#file-structure)
	- [Core Components](#core-components)
		- [1. Course Data Management](#1-course-data-management)
		- [2. Progress Tracking System](#2-progress-tracking-system)
		- [3. Video Playback Component](#3-video-playback-component)
	- [Sequence Diagrams](#sequence-diagrams)
		- [Course Navigation Flow](#course-navigation-flow)
		- [Quiz Completion Flow](#quiz-completion-flow)
	- [Future Architecture](#future-architecture)

## Overview

eVidya is a client-side web application for interactive tech learning with course content, progress tracking, and video-based education. The application is designed to run entirely in the browser using HTML, CSS, and JavaScript, with data stored locally in the user's browser.

```mermaid
graph TD
    A[User] -->|Interacts with| B[Browser]
    B -->|Loads| C[eVidya Platform]
    C -->|Stores Data| D[Local Storage]
    C -->|Displays| E[Courses & Content]
    C -->|Plays| F[YouTube Videos]
    C -->|Tracks| G[User Progress]
```

## Component Architecture

The eVidya platform follows a component-based architecture with distinct modules handling specific functionality.

```mermaid
---
config:
  layout: fixed
  look: classic
  theme: mc
---
flowchart TB
    UI["User Interface Layer"] -- User Actions --> BL["Business Logic Layer"]
    BL -- Data Requests --> DL["Data Access Layer"]
    DL -- Storage --> LS["Local Storage"]
    BL -- Video Playback --> YT["YouTube API"]
    UI --- HP["Home Page"] & CL["Course Listing"] & VP["Video Player"] & QZ["Quiz Component"] & NAV["Navigation"] & CD["Course Details"]
     UI:::node
     BL:::node
     DL:::node
     LS:::node
     YT:::node
     HP:::node
     CL:::node
     VP:::node
     QZ:::node
     NAV:::node
     CD:::node
```

## Data Flow

The following diagram illustrates how data flows through the eVidya platform:

```mermaid
sequenceDiagram
    participant User
    participant UI as User Interface
    participant Logic as Business Logic
    participant Data as Data Layer
    participant Storage as Local Storage
    participant YouTube as YouTube API

    User->>UI: Open Application
    UI->>Logic: Initialize
    Logic->>Data: Request Course Data
    Data->>Storage: Check for Stored Progress
    Storage-->>Data: Return Progress Data
    Data-->>Logic: Provide Courses & Progress
    Logic-->>UI: Render Available Courses

    User->>UI: Select Course
    UI->>Logic: Request Course Details
    Logic->>Data: Get Course Content
    Data-->>Logic: Return Course Content
    Logic-->>UI: Display Course Content

    User->>UI: Play Video
    UI->>Logic: Request Video
    Logic->>YouTube: Load Video Player
    YouTube-->>UI: Display Video

    User->>UI: Complete Video/Quiz
    UI->>Logic: Update Progress
    Logic->>Data: Save Progress
    Data->>Storage: Update Local Storage
    Storage-->>Data: Confirmation
    Data-->>Logic: Progress Updated
    Logic-->>UI: Update Progress Display
```

## File Structure

eVidya's codebase is organized for clarity and maintainability:

```mermaid
graph TD
    Root[Root Directory]
    CSS[css/]
    JS[js/]
    Pages[pages/]
    Data[data/]
    Images[images/]
    GH[.github/]

    Root --> CSS
    Root --> JS
    Root --> Pages
    Root --> Data
    Root --> Images
    Root --> GH

    CSS --> Style[style.css]
    CSS --> CourseCSS[courses.css]
    CSS --> DetailCSS[course-details.css]
    CSS --> PlaceholderCSS[placeholder-images.css]
    CSS --> EnhancedCSS[enhanced-buttons.css]

    JS --> Main[main.js]
    JS --> CourseData[course-data.js]
    JS --> Courses[courses.js]
    JS --> Navigation[course-navigation.js]
    JS --> Progress[progress-tracker.js]
    JS --> Storage[storage.js]
    JS --> Details[course-details.js]
    JS --> Home[home.js]

    Data --> DataJS[course-data.js]
    Data --> ProgressData[progress-data.js]

    Pages --> CoursesHTML[courses.html]
    Pages --> FunctionalHTML[course-details.html]

    GH --> Scripts[scripts/]
    GH --> Workflows[workflows/]

    Scripts --> UpdateDurations[update-video-durations.js]

    class Root,CSS,JS,Pages,Data,Images,GH folder
    class Main,CourseData,Courses,Navigation,Progress,Storage,Details,DataJS,ProgressData,UpdateDurations js-file
    class Style,CourseCSS,DetailCSS,PlaceholderCSS,EnhancedCSS css-file
    class CoursesHTML,FunctionalHTML html-file
```

## Core Components

### 1. Course Data Management

```mermaid
classDiagram
    class Course {
        +id: string
        +title: string
        +description: string
        +image: string
        +level: string
        +sections: Section[]
    }

    class Section {
        +title: string
        +videos: Video[]
        +quiz: Quiz
    }

    class Video {
        +id: string
        +title: string
        +videoId: string
        +description: string
    }

    class Quiz {
        +id: string
        +title: string
        +questions: Question[]
    }

    class Question {
        +question: string
        +options: string[]
        +correctAnswer: number
    }

    Course "1" *-- "many" Section
    Section "1" *-- "many" Video
    Section "1" *-- "0..1" Quiz
    Quiz "1" *-- "many" Question
```

### 2. Progress Tracking System

```mermaid
classDiagram
    class ProgressTracker {
        +getCourseProgress(courseId)
        +markContentStarted(courseId, contentId)
        +markContentCompleted(courseId, contentId)
        +isContentCompleted(courseId, contentId)
        +resetCourseProgress(courseId)
        -saveProgress(courseData)
    }

    class CourseProgress {
        +completed: number
        +total: number
        +percentage: number
        +completedItems: string[]
    }

    class StorageManager {
        +getCourseData(courseId)
        +updateCourseData(courseId, data)
        +trackVideoCompletion(courseId, videoId)
        +updateQuizGrade(courseId, grade)
        -getStorageKey(courseId)
    }

    ProgressTracker ..> CourseProgress : creates
    ProgressTracker ..> StorageManager : uses
```

### 3. Video Playback Component

```mermaid
classDiagram
    class YouTubePlayer {
        +videoId: string
        +player: YT.Player
        +loadVideo(videoId)
        +onPlayerReady(event)
        +onPlayerStateChange(event)
        +onPlayerError(event)
    }

    class VideoPlayer {
        +loadVideoInModal(video)
        +findVideoById(videoId)
        +formatDuration(seconds)
    }

    VideoPlayer ..> YouTubePlayer : creates
```

## Sequence Diagrams

### Course Navigation Flow

```mermaid
sequenceDiagram
    participant User
    participant CoursePage as Course Page
    participant CourseData as Course Data
    participant Player as Video Player
    participant Progress as Progress Tracker

    User->>CoursePage: Click on course
    CoursePage->>CourseData: Request course content
    CourseData-->>CoursePage: Return course sections
    CoursePage->>Progress: Get completion status
    Progress-->>CoursePage: Return completion data
    CoursePage-->>User: Render course content with progress

    User->>CoursePage: Click on video
    CoursePage->>Player: Load video modal
    Player->>Player: Initialize YouTube player
    Player-->>User: Display video

    User->>Player: Watch video to completion
    Player->>Progress: Mark video as completed
    Progress->>Progress: Update progress data
    Progress-->>CoursePage: Return updated progress
    CoursePage-->>User: Update UI with completion badge
```

### Quiz Completion Flow

```mermaid
sequenceDiagram
    participant User
    participant Quiz as Quiz Component
    participant Progress as Progress Tracker

    User->>Quiz: Start quiz
    Quiz-->>User: Display quiz questions
    User->>Quiz: Submit answers
    Quiz->>Quiz: Calculate score
    Quiz->>Progress: Save quiz results
    Progress->>Progress: Update course progress
    Progress-->>Quiz: Confirm update
    Quiz-->>User: Display quiz results
    Quiz-->>User: Update progress indicators
```

## Future Architecture

The roadmap for eVidya includes plans to evolve the architecture as follows:

```mermaid
graph TB
    subgraph "Current (Client-Side Only)"
        CUI[UI Layer]
        CBL[Business Logic]
        CDL[Local Data Storage]
    end

    subgraph "Future (Client-Server)"
        FUI[Enhanced UI Layer]
        FBL[Business Logic]
        FAPI[API Layer]
        FDB[Database]
        Auth[Authentication]
        Analytics[Analytics Engine]
    end

    CUI --> FUI
    CBL --> FBL
    CDL --> FAPI

    FUI --> FBL
    FBL --> FAPI
    FAPI --> FDB
    Auth --> FAPI
    FAPI --> Analytics

    class Current,Future frame
```

---

This architecture document provides a comprehensive understanding of the eVidya platform's structure, components, and data flows. It serves as a guide for developers working on maintaining or extending the platform.
