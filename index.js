const robots = {
	reddit: require('./robots/reddit.js'),
	text: require('./robots/text.js'),
	frames: require('./robots/frames.js'),
	audio: require('./robots/audio.js'),
	videos: require('./robots/videos.js'),
}

async function start() {
	await robots.reddit()
	await robots.text()
	await robots.frames()
	await robots.audio()
	await robots.videos()
}

try {
	start();
	console.log(">[core] Done...")
} catch (error) {
	console.log(`>[core] ${error}`)	
}
