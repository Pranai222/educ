// Video player initialization
function initializeVideoPlayer(videoId) {
	const videoData = findVideoById(videoId);
	if (!videoData) return;

	const videoPlayer = document.getElementById("video-player");
	videoPlayer.src = videoData.source;

	// Set up event listeners for the video player
	setupVideoControls(videoPlayer);

	// Calculate and store video duration when metadata is loaded
	videoPlayer.addEventListener("loadedmetadata", function () {
		videoData.duration = videoPlayer.duration;
		// Update the duration display in the UI
		updateVideoDurationDisplay(videoId);
	});

	// Update the UI to show the current video
	document.getElementById("video-title").textContent = videoData.title;

	// Mark video as current in the navigation
	highlightCurrentVideo(videoId);
}

// Find video data by ID
function findVideoById(videoId) {
	for (const section of courseData.sections) {
		for (const video of section.videos) {
			if (video.id === videoId) {
				return video;
			}
		}
	}
	return null;
}

// Update the video duration display in the UI
function updateVideoDurationDisplay(videoId) {
	const videoData = findVideoById(videoId);
	if (!videoData || !videoData.duration) return;

	// Format the duration (convert seconds to MM:SS format)
	const minutes = Math.floor(videoData.duration / 60);
	const seconds = Math.floor(videoData.duration % 60);
	const formattedDuration = `${minutes}:${seconds
		.toString()
		.padStart(2, "0")}`;

	// Update duration display in the video info section
	const durationElement = document.querySelector(".video-duration");
	if (durationElement) {
		durationElement.textContent = formattedDuration;
	}

	// Update duration in the video list if present
	const videoListItem = document.querySelector(
		`[data-video-id="${videoId}"] .video-length`
	);
	if (videoListItem) {
		videoListItem.textContent = formattedDuration;
	}
}
